"use client";

import { useState } from "react";

export default function BookingForm() {
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
  const [isHovered, setIsHovered] = useState(false);

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
    <section
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-outline-variant)",
        borderRadius: "12px",
        boxShadow: "var(--shadow-soft)",
        padding: "2rem",
        textAlign: "left",
      }}
    >
      <h2
        style={{
          color: "var(--color-on-surface)",
          fontSize: "var(--font-size-title-large)",
          fontWeight: "var(--font-weight-title-large)",
          marginBottom: "1.25rem",
        }}
      >
        Check Event Date &amp; Reserve Kitchen
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "var(--font-size-label-large)",
              color: "var(--color-on-surface)",
              marginBottom: "0.35rem",
            }}
          >
            Full Name
          </label>
          <input
            type="text"
            required
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            placeholder="e.g. Osas Osas"
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
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "var(--font-size-label-large)",
              color: "var(--color-on-surface)",
              marginBottom: "0.35rem",
            }}
          >
            Phone Number (WhatsApp Reachable)
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="e.g. 08114069707"
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
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 12rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "var(--font-size-label-large)",
                color: "var(--color-on-surface)",
                marginBottom: "0.35rem",
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
                padding: "0.65rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--color-outline)",
                fontFamily: "var(--font-family-primary)",
                fontSize: "var(--font-size-body-large)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-on-surface)",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ flex: "1 1 12rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "var(--font-size-label-large)",
                color: "var(--color-on-surface)",
                marginBottom: "0.35rem",
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
              placeholder="e.g. 600"
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
            />
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "var(--font-size-label-large)",
              color: "var(--color-on-surface)",
              marginBottom: "0.35rem",
            }}
          >
            Client Type
          </label>
          <select
            value={formData.organizationType}
            onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
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
            <option value="Church">Church (Event - 60% Deposit)</option>
            <option value="Corporate Office">Corporate Office (60% Deposit)</option>
          </select>
        </div>

        {/* Button sized with rem padding, label style from task 1, and visible hover feedback */}
        <button
          type="submit"
          disabled={isSubmitting}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="btn-primary"
          style={{
            marginTop: "0.75rem",
            backgroundColor: isHovered ? "var(--color-primary-container)" : "var(--color-primary)",
            color: isHovered ? "var(--color-on-primary-container)" : "var(--color-on-primary)",
            fontFamily: "var(--font-family-primary)",
            fontSize: "var(--font-size-label-large)",
            fontWeight: "var(--font-weight-label-large)",
            lineHeight: "var(--line-height-label-large)",
            letterSpacing: "var(--letter-spacing-label-large)",
            padding: "0.75rem 1.75rem",
            borderRadius: "8px",
            border: "1px solid transparent",
            boxShadow: isHovered ? "var(--shadow-medium)" : "var(--shadow-soft)",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.7 : 1,
            transition: "all 0.15s ease",
            transform: isHovered && !isSubmitting ? "translateY(-1px)" : "none",
          }}
        >
          {isSubmitting ? "Checking Kitchen & Saving..." : "Check Date Availability & Reserve"}
        </button>
      </form>

      {statusMessage && (
        <div
          style={{
            marginTop: "1.25rem",
            padding: "0.85rem 1rem",
            borderRadius: "8px",
            fontSize: "var(--font-size-body-medium)",
            lineHeight: "1.4",
            backgroundColor:
              statusCode === 201
                ? "var(--color-primary-container)"
                : "var(--color-error-container)",
            color:
              statusCode === 201
                ? "var(--color-on-primary-container)"
                : "var(--color-on-error-container)",
            border: `1px solid ${
              statusCode === 201 ? "var(--color-primary)" : "var(--color-error)"
            }`,
          }}
        >
          {statusMessage}
        </div>
      )}
    </section>
  );
}

