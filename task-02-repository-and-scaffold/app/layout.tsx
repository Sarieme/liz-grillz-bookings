import type { Metadata } from "next";
import "../../tokens.css";

export const metadata: Metadata = {
  title: "Liz's Grillz Bookings",
  description: "Catering booking app for Liz's Grillz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
