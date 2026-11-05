"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") || "signup";
  const buttonVariant = searchParams.get("button");
  const inputVariant = searchParams.get("input");
  const [mode, setMode] = useState<"signup" | "login" | "reset">(
    initialMode === "login" || initialMode === "reset" ? initialMode : "signup"
  );

  // Sync state if URL query param changes
  useEffect(() => {
    const current = searchParams.get("mode");
    if (current === "login" || current === "reset" || current === "signup") {
      setMode(current);
    }
  }, [searchParams]);

  const switchMode = (newMode: "signup" | "login" | "reset") => {
    setMode(newMode);
    router.push(`/auth?mode=${newMode}`, { scroll: false });
    setSubmissionError(null);
    setSuccessMessage(null);
  };

  // Form Field States
  const [fullName, setFullName] = useState("");
  const [orgType, setOrgType] = useState("Individual");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Validation Tracking (Touched & Errors)
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mark field touched on blur
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  // Field validation engine
  const validateField = (field: string, currentVal?: any) => {
    let err = "";
    const nameVal = field === "fullName" ? (currentVal ?? fullName) : fullName;
    const phoneVal = field === "phone" ? (currentVal ?? phone) : phone;
    const emailVal = field === "email" ? (currentVal ?? email) : email;
    const passVal = field === "password" ? (currentVal ?? password) : password;

    if (field === "fullName" && mode === "signup") {
      if (!nameVal.trim()) {
        err = "Full name is required so Liz knows who to contact for catering.";
      } else {
        const parts = nameVal.trim().split(/\s+/);
        if (parts.length < 2 || parts.some((p: string) => p.length < 2)) {
          err = "Please enter at least two words (first and last name) of 2+ characters.";
        }
      }
    }

    if (field === "phone" && mode === "signup") {
      if (!phoneVal.trim()) {
        err = "Phone number is required for event delivery logistics.";
      } else {
        const clean = phoneVal.replace(/[\s-]/g, "");
        if (!/^(0\d{10}|\+234\d{10})$/.test(clean)) {
          err = "Enter a valid 11-digit Nigerian phone number (e.g. 08031234567).";
        }
      }
    }

    if (field === "email") {
      if (!emailVal.trim()) {
        err = "Email address is required for sending invoices and payment receipts.";
      } else if (mode === "signup") {
        // Real-time format validation on signup
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal.trim())) {
          err = "Please enter a complete email address containing an @ and a valid domain.";
        }
      }
    }

    if (field === "password") {
      if (!passVal) {
        err = "Password is required.";
      } else if (passVal.length < 8) {
        err = "Password must be at least 8 characters in length.";
      }
    }

    setErrors((prev) => {
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });

    return !err;
  };

  // Compute form validity
  const isFormValid = () => {
    if (mode === "signup") {
      const nameOk = fullName.trim().split(/\s+/).length >= 2;
      const phoneOk = /^(0\d{10}|\+234\d{10})$/.test(phone.replace(/[\s-]/g, ""));
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
      const passOk = password.length >= 8;
      return nameOk && phoneOk && emailOk && passOk && acceptTerms;
    }
    if (mode === "login") {
      return email.trim().length > 0 && password.length >= 8;
    }
    if (mode === "reset") {
      return email.trim().length > 0;
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        if (!acceptTerms) {
          setSubmissionError("You must accept the Catering Terms of Service to create an account.");
          setIsSubmitting(false);
          return;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName,
            email,
            phone,
            password,
            organizationType: orgType,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setSubmissionError(data.error || "Registration failed.");
        } else {
          setSuccessMessage(data.message || `Account created for ${fullName}!`);
        }
      } else if (mode === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setSubmissionError(data.error || "Invalid email or password combination.");
        } else {
          setSuccessMessage(`${data.message} Welcome back, ${data.user.fullName}!`);
        }
      } else if (mode === "reset") {
        // Anti-enumeration: neutral response regardless of whether email exists
        setSuccessMessage("If an account exists for that email, password reset instructions have been sent.");
      }
    } catch (err: any) {
      setSubmissionError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-outline-variant)",
        borderRadius: "12px",
        boxShadow: "var(--shadow-soft)",
        padding: "2rem",
        textAlign: "left",
      }}
    >
      {/* 
        Single Page Architecture:
        URL query parameter controls active mode without full page reload.
      */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--color-outline-variant)",
          marginBottom: "1.5rem",
          gap: "0.5rem",
        }}
      >
        <button
          type="button"
          onClick={() => switchMode("signup")}
          style={{
            flex: 1,
            padding: "0.6rem 0.25rem",
            backgroundColor: "transparent",
            border: "none",
            borderBottom: mode === "signup" ? "3px solid var(--color-primary)" : "3px solid transparent",
            color: mode === "signup" ? "var(--color-primary)" : "var(--color-on-surface-variant)",
            fontFamily: "var(--font-family-primary)",
            fontSize: "var(--font-size-label-large)",
            fontWeight: "var(--font-weight-label-large)",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          Create Account
        </button>

        <button
          type="button"
          onClick={() => switchMode("login")}
          style={{
            flex: 1,
            padding: "0.6rem 0.25rem",
            backgroundColor: "transparent",
            border: "none",
            borderBottom: mode === "login" ? "3px solid var(--color-primary)" : "3px solid transparent",
            color: mode === "login" ? "var(--color-primary)" : "var(--color-on-surface-variant)",
            fontFamily: "var(--font-family-primary)",
            fontSize: "var(--font-size-label-large)",
            fontWeight: "var(--font-weight-label-large)",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          Sign In
        </button>

        <button
          type="button"
          onClick={() => switchMode("reset")}
          style={{
            flex: 1,
            padding: "0.6rem 0.25rem",
            backgroundColor: "transparent",
            border: "none",
            borderBottom: mode === "reset" ? "3px solid var(--color-primary)" : "3px solid transparent",
            color: mode === "reset" ? "var(--color-primary)" : "var(--color-on-surface-variant)",
            fontFamily: "var(--font-family-primary)",
            fontSize: "var(--font-size-label-large)",
            fontWeight: "var(--font-weight-label-large)",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          Reset Password
        </button>
      </div>

      <h1
        style={{
          fontSize: "var(--font-size-headline-small)",
          fontWeight: "var(--font-weight-headline-small)",
          color: "var(--color-primary)",
          marginBottom: "0.25rem",
        }}
      >
        {mode === "signup" && "Register Event Organizer Account"}
        {mode === "login" && "Sign In to Your Account"}
        {mode === "reset" && "Recover Account Access"}
      </h1>

      <p
        style={{
          color: "var(--color-on-surface-variant)",
          fontSize: "var(--font-size-body-medium)",
          marginBottom: "1.5rem",
        }}
      >
        {mode === "signup" && "Create an organizer profile to reserve kitchen capacity and manage invoices."}
        {mode === "login" && "Access your booked catering dates, deposit receipts, and balance invoices."}
        {mode === "reset" && "Enter your registered email to receive a password recovery link."}
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
        {/* Full Name Field (Signup only) */}
        {mode === "signup" && (
          <div>
            <label
              htmlFor="fullName"
              style={{
                display: "block",
                fontSize: "var(--font-size-label-large)",
                fontWeight: "var(--font-weight-label-large)",
                color: "var(--color-on-surface)",
                marginBottom: "0.3rem",
              }}
            >
              Full Legal Name <span aria-hidden="true" style={{ color: "var(--color-primary)" }}>*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              aria-required="true"
              aria-invalid={touched.fullName && !!errors.fullName}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (touched.fullName) validateField("fullName", e.target.value);
              }}
              onBlur={() => handleBlur("fullName")}
              placeholder="e.g. Osas Osas"
              style={{
                width: "100%",
                padding: "0.65rem 0.75rem",
                borderRadius: "8px",
                border: touched.fullName && errors.fullName
                  ? "2px solid var(--color-error)"
                  : "1px solid var(--color-outline)",
                fontFamily: "var(--font-family-primary)",
                fontSize: "var(--font-size-body-large)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-on-surface)",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            {touched.fullName && errors.fullName && (
              <span
                id="fullName-error"
                role="alert"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  color: "var(--color-error)",
                  fontSize: "var(--font-size-body-small)",
                  marginTop: "0.3rem",
                  fontWeight: "var(--font-weight-label-large)",
                }}
              >
                <span aria-hidden="true">⚠️</span> {errors.fullName}
              </span>
            )}
          </div>
        )}

        {/* Organization Type (Signup only) */}
        {mode === "signup" && (
          <div>
            <label
              htmlFor="orgType"
              style={{
                display: "block",
                fontSize: "var(--font-size-label-large)",
                fontWeight: "var(--font-weight-label-large)",
                color: "var(--color-on-surface)",
                marginBottom: "0.3rem",
              }}
            >
              Organization Category <span aria-hidden="true" style={{ color: "var(--color-primary)" }}>*</span>
            </label>
            <select
              id="orgType"
              name="orgType"
              value={orgType}
              onChange={(e) => setOrgType(e.target.value)}
              style={{
                width: "100%",
                padding: "0.65rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--color-outline)",
                fontFamily: "var(--font-family-primary)",
                fontSize: "var(--font-size-body-large)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-on-surface)",
                boxSizing: "border-box",
              }}
            >
              <option value="Individual">Individual (Celebration - 80% Deposit)</option>
              <option value="Church">Church / NGO (60% Deposit Terms)</option>
              <option value="Corporate Office">Corporate Office (60% Deposit Terms)</option>
            </select>
          </div>
        )}

        {/* Phone Number Field (Signup only) */}
        {/* Uses text input restricted to numeric inputMode rather than spinner number input */}
        {mode === "signup" && (
          <div>
            <label
              htmlFor="phone"
              style={{
                display: "block",
                fontSize: "var(--font-size-label-large)",
                fontWeight: "var(--font-weight-label-large)",
                color: "var(--color-on-surface)",
                marginBottom: "0.3rem",
              }}
            >
              Phone Number (WhatsApp Active) <span aria-hidden="true" style={{ color: "var(--color-primary)" }}>*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              inputMode="numeric"
              required
              aria-required="true"
              aria-invalid={touched.phone && !!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              value={phone}
              onChange={(e) => {
                // Restrict input to digits and optional leading plus
                const val = e.target.value.replace(/[^\d+]/g, "");
                setPhone(val);
                if (touched.phone) validateField("phone", val);
              }}
              onBlur={() => handleBlur("phone")}
              placeholder="e.g. 08114069707"
              style={{
                width: "100%",
                padding: "0.65rem 0.75rem",
                borderRadius: "8px",
                border: touched.phone && errors.phone
                  ? "2px solid var(--color-error)"
                  : "1px solid var(--color-outline)",
                fontFamily: "var(--font-family-primary)",
                fontSize: "var(--font-size-body-large)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-on-surface)",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            {touched.phone && errors.phone && (
              <span
                id="phone-error"
                role="alert"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  color: "var(--color-error)",
                  fontSize: "var(--font-size-body-small)",
                  marginTop: "0.3rem",
                  fontWeight: "var(--font-weight-label-large)",
                }}
              >
                <span aria-hidden="true">⚠️</span> {errors.phone}
              </span>
            )}
          </div>
        )}

        {/* Email Address Field (All modes) */}
        <div>
          <label
            htmlFor="email"
            style={{
              display: "block",
              fontSize: "var(--font-size-label-large)",
              fontWeight: "var(--font-weight-label-large)",
              color: "var(--color-on-surface)",
              marginBottom: "0.3rem",
            }}
          >
            Email Address <span aria-hidden="true" style={{ color: "var(--color-primary)" }}>*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            aria-required="true"
            aria-invalid={touched.email && !!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              // Real-time format checking on signup mode
              if (mode === "signup" && touched.email) validateField("email", e.target.value);
            }}
            onBlur={() => handleBlur("email")}
            placeholder="e.g. organizer@organization.ng"
            style={{
              width: "100%",
              padding: "0.65rem 0.75rem",
              borderRadius: "8px",
              border: touched.email && errors.email
                ? "2px solid var(--color-error)"
                : "1px solid var(--color-outline)",
              fontFamily: "var(--font-family-primary)",
              fontSize: "var(--font-size-body-large)",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-on-surface)",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
          {touched.email && errors.email && (
            <span
              id="email-error"
              role="alert"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                color: "var(--color-error)",
                fontSize: "var(--font-size-body-small)",
                marginTop: "0.3rem",
                fontWeight: "var(--font-weight-label-large)",
              }}
            >
              <span aria-hidden="true">⚠️</span> {errors.email}
            </span>
          )}
        </div>

        {/* Password Field (Signup and Login) */}
        {mode !== "reset" && (
          <div>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "var(--font-size-label-large)",
                fontWeight: "var(--font-weight-label-large)",
                color: "var(--color-on-surface)",
                marginBottom: "0.3rem",
              }}
            >
              Password <span aria-hidden="true" style={{ color: "var(--color-primary)" }}>*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              aria-required="true"
              aria-invalid={touched.password && !!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (touched.password) validateField("password", e.target.value);
              }}
              onBlur={() => handleBlur("password")}
              placeholder="Minimum 8 characters"
              style={{
                width: "100%",
                padding: "0.65rem 0.75rem",
                borderRadius: "8px",
                border: touched.password && errors.password
                  ? "2px solid var(--color-error)"
                  : "1px solid var(--color-outline)",
                fontFamily: "var(--font-family-primary)",
                fontSize: "var(--font-size-body-large)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-on-surface)",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            {touched.password && errors.password && (
              <span
                id="password-error"
                role="alert"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  color: "var(--color-error)",
                  fontSize: "var(--font-size-body-small)",
                  marginTop: "0.3rem",
                  fontWeight: "var(--font-weight-label-large)",
                }}
              >
                <span aria-hidden="true">⚠️</span> {errors.password}
              </span>
            )}
          </div>
        )}

        {/* Terms and Conditions (Signup only) */}
        {mode === "signup" && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginTop: "0.25rem" }}>
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              aria-required="true"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              style={{
                marginTop: "0.25rem",
                accentColor: "var(--color-primary)",
                cursor: "pointer",
              }}
            />
            <label
              htmlFor="terms"
              style={{
                fontSize: "var(--font-size-body-small)",
                lineHeight: "1.4",
                color: "var(--color-on-surface)",
                cursor: "pointer",
              }}
            >
              I agree to the Liz's Grillz Catering Terms of Service and Privacy Notice under the Nigerian Data Protection Act (NDPA).
            </label>
          </div>
        )}

        {/* 
          The Button:
          Visible by default, disabled until valid, explains itself if disabled.
        */}
        <button
          type="submit"
          disabled={!isFormValid() || isSubmitting}
          className="btn-primary"
          style={{
            marginTop: "0.75rem",
            backgroundColor: isFormValid() && !isSubmitting ? "var(--color-primary)" : "var(--color-surface-variant)",
            color: isFormValid() && !isSubmitting ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
            fontFamily: "var(--font-family-primary)",
            fontSize: "var(--font-size-label-large)",
            fontWeight: "var(--font-weight-label-large)",
            lineHeight: "var(--line-height-label-large)",
            letterSpacing: "var(--letter-spacing-label-large)",
            padding: "0.75rem 1.75rem",
            borderRadius: "8px",
            border: "1px solid transparent",
            boxShadow: isFormValid() && !isSubmitting ? "var(--shadow-soft)" : "none",
            cursor: isFormValid() && !isSubmitting ? "pointer" : "not-allowed",
            opacity: isFormValid() && !isSubmitting ? 1 : 0.65,
            transition: "all 0.15s ease",
          }}
        >
          {isSubmitting
            ? "Processing..."
            : mode === "signup"
            ? "Create Organizer Account"
            : mode === "login"
            ? "Sign In to Account"
            : "Send Password Recovery Link"}
        </button>
      </form>

      {/* Submission Feedback & Anti-Enumeration States */}
      {submissionError && (
        <div
          role="alert"
          style={{
            marginTop: "1.25rem",
            padding: "0.85rem 1rem",
            borderRadius: "8px",
            fontSize: "var(--font-size-body-medium)",
            backgroundColor: "var(--color-error-container)",
            color: "var(--color-on-error-container)",
            border: "1px solid var(--color-error)",
          }}
        >
          ⚠️ {submissionError}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          style={{
            marginTop: "1.25rem",
            padding: "0.85rem 1rem",
            borderRadius: "8px",
            fontSize: "var(--font-size-body-medium)",
            backgroundColor: "var(--color-primary-container)",
            color: "var(--color-on-primary-container)",
            border: "1px solid var(--color-primary)",
          }}
        >
          ✓ {successMessage}
        </div>
      )}
    </div>
  );
}

