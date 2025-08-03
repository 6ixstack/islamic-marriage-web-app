import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Muslim Marriage Referral Platform",
  description: "A platform for Muslim marriage referrals and biodata sharing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}