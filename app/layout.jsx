import "./globals.css";

export const metadata = {
  title: "Nusa Snipe — Marketing & Sales Intelligence",
  description:
    "Platform marketing & sales intelligence Nusa Safety (PT. Nusa Rendra Jayatama) — prospecting, CRM, proposal, penagihan & laporan.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
