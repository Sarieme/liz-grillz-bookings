"use client";

import { useState } from "react";

export default function HomePage() {
  const [formData, setFormData] = useState({
    clientName: "",
    phone: "",
    eventDate: "",
    guestCount: "",
    organizationType: "Individual",
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    setStatusCode(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setStatusCode(res.status);

      if (res.status === 201) {
        setStatusMessage(
          `Success (HTTP ${res.status} Created): Booking saved with ID ${data.booking.id}`
        );
        setFormData({
          clientName: "",
          phone: "",
          eventDate: "",
          guestCount: "",
          organizationType: "Individual",
        });
      } else {
        setStatusMessage(
          `Error (HTTP ${res.status}): ${data.error || "Submission failed"}`
        );
      }
    } catch (err: any) {
      setStatusCode(500);
      setStatusMessage("Network/Server connection failure.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2em 1em",
        backgroundColor: "var(--color-background)",
        color: "var(--color-on-background)",
        fontFamily: "var(--font-family-primary)",
      }}
    >
      <div style={{ maxWidth: "36em", width: "100%", textAlign: "center" }}>
        <h1
          style={{
            color: "var(--color-primary)",
            fontSize: "var(--font-size-display-small)",
            lineHeight: "var(--line-height-display-small)",
            fontWeight: "var(--font-weight-display-small)",
            letterSpacing: "var(--letter-spacing-display-small)",
            marginBottom: "0.25em",
          }}
        >
          Liz's Grillz Bookings
        </h1>
        <p
          style={{
            color: "var(--color-on-surface-variant)",
            fontSize: "var(--font-size-body-large)",
            lineHeight: "var(--line-height-body-large)",
            fontWeight: "var(--font-weight-body-large)",
            letterSpacing: "var(--letter-spacing-body-large)",
            marginBottom: "2em",
          }}
        >
          Browse our catering rates and sample pricing.
        </p>

        {/* Database Booking Form matching business brief */}
        <section
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-outline-variant)",
            borderRadius: "12px",
            boxShadow: "var(--shadow-soft)",
            padding: "2em",
            textAlign: "left",
          }}
        >
          <h2
            style={{
              color: "var(--color-on-surface)",
              fontSize: "var(--font-size-title-large)",
              fontWeight: "var(--font-weight-title-large)",
              marginBottom: "1em",
            }}
          >
            Check Event Date &amp; Request Quote
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "var(--font-size-label-large)",
                  color: "var(--color-on-surface)",
                  marginBottom: "0.25em",
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="e.g. Tunde Bakare"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-outline)",
                  fontFamily: "var(--font-family-primary)",
                  fontSize: "var(--font-size-body-large)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-on-surface)",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "var(--font-size-label-large)",
                  color: "var(--color-on-surface)",
                  marginBottom: "0.25em",
                }}
              >
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 08031234567"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-outline)",
                  fontFamily: "var(--font-family-primary)",
                  fontSize: "var(--font-size-body-large)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-on-surface)",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "1em" }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "var(--font-size-label-large)",
                    color: "var(--color-on-surface)",
                    marginBottom: "0.25em",
                  }}
                >
                  Event Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-outline)",
                    fontFamily: "var(--font-family-primary)",
                    fontSize: "var(--font-size-body-large)",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-on-surface)",
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "var(--font-size-label-large)",
                    color: "var(--color-on-surface)",
                    marginBottom: "0.25em",
                  }}
                >
                  Guest Count
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  value={formData.guestCount}
                  onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                  placeholder="e.g. 100"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-outline)",
                    fontFamily: "var(--font-family-primary)",
                    fontSize: "var(--font-size-body-large)",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-on-surface)",
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "var(--font-size-label-large)",
                  color: "var(--color-on-surface)",
                  marginBottom: "0.25em",
                }}
              >
                Client Type
              </label>
              <select
                value={formData.organizationType}
                onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-outline)",
                  fontFamily: "var(--font-family-primary)",
                  fontSize: "var(--font-size-body-large)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-on-surface)",
                }}
              >
                <option value="Individual">Individual (Celebration)</option>
                <option value="Church">Church (Event)</option>
                <option value="Corporate Office">Corporate Office</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{
                marginTop: "1em",
                backgroundColor: "var(--color-primary)",
                color: "var(--color-on-primary)",
                fontFamily: "var(--font-family-primary)",
                fontSize: "var(--font-size-label-large)",
                fontWeight: "var(--font-weight-label-large)",
                padding: "12px 24px",
                borderRadius: "8px",
                border: "1px solid transparent",
                boxShadow: "var(--shadow-soft)",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? "Saving Booking..." : "Submit Booking Enquiry"}
            </button>
          </form>

          {statusMessage && (
            <div
              style={{
                marginTop: "1.5em",
                padding: "1em",
                borderRadius: "8px",
                backgroundColor:
                  statusCode === 201
                    ? "var(--color-primary-container)"
                    : "var(--color-error-container)",
                color:
                  statusCode === 201
                    ? "var(--color-on-primary-container)"
                    : "var(--color-on-error-container)",
                fontSize: "var(--font-size-body-medium)",
              }}
            >
              {statusMessage}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
