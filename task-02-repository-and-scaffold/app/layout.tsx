import type { Metadata } from "next";
import Link from "next/link";
import "../../tokens.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://lizsgrillz.ng"),
  title: {
    default: "Liz's Grillz Bookings | Lagos Event Catering Reservations",
    template: "%s | Liz's Grillz Bookings",
  },
  description: "Lagos event catering reservations verified against kitchen capacity.",
  keywords: [
    "catering lagos",
    "event reservations",
    "nigerian catering",
    "corporate catering lagos",
    "church events catering",
    "wedding catering lagos",
  ],
  authors: [{ name: "Liz's Grillz" }],
  creator: "Liz's Grillz",
  publisher: "Liz's Grillz Catering Lagos",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "Liz's Grillz Bookings | Lagos Event Catering",
    description: "Lagos event catering reservations verified against kitchen capacity.",
    url: "https://lizsgrillz.ng",
    siteName: "Liz's Grillz Bookings",
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Liz's Grillz Catering Lagos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Liz's Grillz Bookings",
    description: "Lagos event catering reservations verified against kitchen capacity.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "var(--color-background)",
          color: "var(--color-on-background)",
          fontFamily: "var(--font-family-primary)",
          display: "flex",
          flexDirection: "column",
          minHeight: "100dvh",
        }}
      >
        <header
          style={{
            borderBottom: "1px solid var(--color-outline-variant)",
            backgroundColor: "var(--color-surface)",
            padding: "0.75rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
              color: "var(--color-primary)",
              fontWeight: "var(--font-weight-title-large)",
              fontSize: "var(--font-size-title-large)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "var(--color-primary)",
              }}
            />
            Liz's Grillz
          </Link>

          <nav style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: "var(--color-on-surface)",
                fontSize: "var(--font-size-label-large)",
                fontWeight: "var(--font-weight-label-large)",
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                transition: "background-color 0.15s ease",
              }}
            >
              Reserve Date
            </Link>
            <Link
              href="/rates"
              style={{
                textDecoration: "none",
                color: "var(--color-on-surface-variant)",
                fontSize: "var(--font-size-label-large)",
                fontWeight: "var(--font-weight-label-large)",
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                transition: "background-color 0.15s ease",
              }}
            >
              Catering Rates
            </Link>
            <Link
              href="/auth"
              style={{
                textDecoration: "none",
                color: "var(--color-primary)",
                fontSize: "var(--font-size-label-large)",
                fontWeight: "var(--font-weight-label-large)",
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                backgroundColor: "var(--color-surface-variant)",
                transition: "background-color 0.15s ease",
              }}
            >
              Organizer Portal
            </Link>
          </nav>
        </header>

        <main style={{ flex: 1 }}>{children}</main>

        <footer
          style={{
            borderTop: "1px solid var(--color-outline-variant)",
            backgroundColor: "var(--color-surface)",
            padding: "1rem 1.5rem",
            textAlign: "center",
            fontSize: "var(--font-size-body-small)",
            color: "var(--color-on-surface-variant)",
          }}
        >
          &copy; {new Date().getFullYear()} Liz's Grillz Catering Services, Lagos. Nigerian Data Protection Act (NDPA) compliant.
        </footer>
      </body>
    </html>
  );
}
