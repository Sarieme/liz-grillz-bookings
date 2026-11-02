import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "1.5em",
        backgroundColor: "var(--color-background)",
        color: "var(--color-on-background)",
        fontFamily: "var(--font-family-primary)",
      }}
    >
      <div style={{ maxWidth: "36em", width: "100%" }}>
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
          Page Not Found
        </h1>
        <p
          style={{
            color: "var(--color-on-surface-variant)",
            fontSize: "var(--font-size-body-large)",
            lineHeight: "var(--line-height-body-large)",
            fontWeight: "var(--font-weight-body-large)",
            letterSpacing: "var(--letter-spacing-body-large)",
            marginBottom: "1.5em",
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
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid transparent",
              boxShadow: "var(--shadow-soft)",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}

