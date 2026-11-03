import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Catering Rates & Pricing",
  description: "Fixed catering rates, menu tiers, and deposit rules for Lagos events.",
  keywords: ["catering rates lagos", "event pricing", "food quotation lagos"],
};

export default function RatesPage() {
  const tiers = [
    {
      name: "Intimate Celebration",
      guests: "20 - 50 Guests",
      depositRule: "80% Deposit (Individuals)",
      description: "Charcoal grilled meats, party jollof, fried plantains, and fresh slaw.",
      tag: "Individuals",
    },
    {
      name: "Church & Community Gathering",
      guests: "100 - 250 Guests",
      depositRule: "60% Deposit (Churches & NGOs)",
      description: "Full buffet service, assorted proteins, sides, and dedicated serving staff.",
      tag: "Churches",
    },
    {
      name: "Corporate Gala & Office Banquet",
      guests: "300 - 600 Guests",
      depositRule: "60% Deposit (Corporate Finance Terms)",
      description: "Executive multi-station grill, continental sides, customized menu, and full logistics team.",
      tag: "Offices",
    },
  ];

  return (
    <section
      style={{
        maxWidth: "52rem",
        margin: "0 auto",
        padding: "2.5rem 1.25rem",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h1
          style={{
            fontSize: "clamp(1.75rem, 4vw + 1rem, 2.5rem)",
            lineHeight: "1.25",
            fontWeight: "var(--font-weight-display-small)",
            color: "var(--color-primary)",
            marginBottom: "0.5rem",
          }}
        >
          Catering Rates &amp; Pricing
        </h1>
        <p
          style={{
            color: "var(--color-on-surface-variant)",
            fontSize: "var(--font-size-body-large)",
            maxWidth: "36rem",
            margin: "0 auto",
          }}
        >
          Transparent rates derived from fixed kitchen tiers. Logistics is priced separately, and date holds are locked for 48 hours.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))",
          gap: "1.25rem",
          marginBottom: "2.5rem",
        }}
      >
        {tiers.map((tier) => (
          <article
            key={tier.name}
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-outline-variant)",
              borderRadius: "12px",
              padding: "1.5rem",
              boxShadow: "var(--shadow-soft)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span
                style={{
                  display: "inline-block",
                  fontSize: "var(--font-size-label-small)",
                  fontWeight: "var(--font-weight-label-small)",
                  color: "var(--color-primary)",
                  backgroundColor: "var(--color-surface-variant)",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  marginBottom: "0.75rem",
                }}
              >
                {tier.tag}
              </span>
              <h2
                style={{
                  fontSize: "var(--font-size-title-large)",
                  color: "var(--color-on-surface)",
                  marginBottom: "0.25rem",
                }}
              >
                {tier.name}
              </h2>
              <p
                style={{
                  color: "var(--color-primary)",
                  fontWeight: "var(--font-weight-label-large)",
                  fontSize: "var(--font-size-label-large)",
                  marginBottom: "0.75rem",
                }}
              >
                {tier.guests}
              </p>
              <p
                style={{
                  color: "var(--color-on-surface-variant)",
                  fontSize: "var(--font-size-body-medium)",
                  lineHeight: "1.4",
                  marginBottom: "1rem",
                }}
              >
                {tier.description}
              </p>
            </div>
            <div
              style={{
                borderTop: "1px solid var(--color-outline-variant)",
                paddingTop: "0.75rem",
                fontSize: "var(--font-size-label-small)",
                color: "var(--color-on-surface)",
              }}
            >
              Deposit policy: <strong>{tier.depositRule}</strong>
            </div>
          </article>
        ))}
      </div>

      <div style={{ textAlign: "center" }}>
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
          Check Date Availability &amp; Reserve
        </Link>
      </div>
    </section>
  );
}

