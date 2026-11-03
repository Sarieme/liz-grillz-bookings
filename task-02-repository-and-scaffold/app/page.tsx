import type { Metadata } from "next";
import BookingForm from "./components/BookingForm";

export const metadata: Metadata = {
  title: "Reserve Event Date",
  description: "Lagos event catering reservations verified against kitchen capacity.",
  keywords: [
    "catering lagos",
    "event date booking",
    "nigerian food catering",
    "kitchen capacity check",
  ],
  alternates: {
    canonical: "https://lizsgrillz.ng",
  },
};

export default function HomePage() {
  return (
    <div
      style={{
        maxWidth: "40rem",
        margin: "0 auto",
        padding: "2.5rem 1.25rem",
        textAlign: "center",
      }}
    >
      {/* 
        Information Design:
        1. Deliberate line wrap: maxWidth 14ch creates a balanced headline shape
        2. Fluid typography: clamp() scales font smoothly across 320px to 1440px
      */}
      <h1
        style={{
          color: "var(--color-primary)",
          fontSize: "clamp(2rem, 4vw + 1rem, 3rem)",
          lineHeight: "1.2",
          fontWeight: "var(--font-weight-display-small)",
          letterSpacing: "var(--letter-spacing-display-small)",
          maxWidth: "14ch",
          margin: "0 auto 0.5rem auto",
        }}
      >
        Liz's Grillz Bookings
      </h1>

      {/* Short Tagline under 10 words (9 words) */}
      <p
        style={{
          color: "var(--color-on-surface-variant)",
          fontSize: "var(--font-size-body-large)",
          lineHeight: "var(--line-height-body-large)",
          maxWidth: "32rem",
          margin: "0 auto 2rem auto",
        }}
      >
        Lagos event catering reservations verified against kitchen capacity.
      </p>

      {/* Interactive Form Component */}
      <BookingForm />
    </div>
  );
}
