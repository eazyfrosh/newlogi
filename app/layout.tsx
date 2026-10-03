import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NewLogi — Move business forward",
    template: "%s — NewLogi",
  },
  description:
    "Freight, fulfilment, and delivery solutions shaped around the way your business moves.",
  applicationName: "NewLogi",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
