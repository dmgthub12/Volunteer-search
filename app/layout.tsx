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
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-6 lg:px-8">
            <a className="text-lg font-bold text-primary" href="/">
              Bergen Volunteer Connect
            </a>
            <div className="flex items-center gap-4 text-sm font-semibold text-slate-600">
              <a className="hover:text-primary" href="/opportunities">
                Opportunities
              </a>
              <a className="hover:text-primary" href="/about">
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
