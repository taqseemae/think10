import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";



export const metadata: Metadata = {
  title: "Think10 Premium Advisory",
  description: "Think clearly. Act confidently. Grow with Think10.",
  icons: {
    icon: "/logo/t10-icon-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-sans"
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
