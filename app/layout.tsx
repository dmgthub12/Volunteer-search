import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bergen Volunteer Connect",
  description:
    "Find student and adult volunteer opportunities in northern Bergen County."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-6 lg:px-8">
            <a className="text-lg font-bold text-primary" href="/">
              Bergen Volunteer Connect
            </a>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <a className="rounded-full px-3 py-2 hover:bg-mint hover:text-primary" href="/opportunities">
                Opportunities
              </a>
              <a className="rounded-full px-3 py-2 hover:bg-mint hover:text-primary" href="/about">
                About
              </a>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
