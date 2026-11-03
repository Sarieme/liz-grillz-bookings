import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        maxWidth: "36rem",
        margin: "0 auto",
        padding: "4rem 1.25rem",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          color: "var(--color-primary)",
          fontSize: "clamp(2rem, 4vw + 1rem, 2.75rem)",
          lineHeight: "1.2",
          fontWeight: "var(--font-weight-display-small)",
          marginBottom: "0.5rem",
        }}
      >
        Page Not Found
      </h1>
      <p
        style={{
          color: "var(--color-on-surface-variant)",
          fontSize: "var(--font-size-body-large)",
          lineHeight: "1.5",
          marginBottom: "2rem",
        }}
      >
        The catering page or route you requested does not exist.
      </p>
      <div>
        <Link
          href="/"
          className="btn-primary"
          style={{
            display: "inline-block",
            backgroundColor: "var(--color-primary)",
            color: "var(--color-on-primary)",
            fontFamily: "var(--font-family-primary)",
            fontSize: "var(--font-size-label-large)",
            fontWeight: "var(--font-weight-label-large)",
            padding: "0.75rem 1.75rem",
            borderRadius: "8px",
            textDecoration: "none",
            boxShadow: "var(--shadow-soft)",
            cursor: "pointer",
          }}
        >
          Return to Reservations
        </Link>
      </div>
    </div>
  );
}
