import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "سامانه هوشمند آنالیز بدنی کاراته | باشگاه شرکت برق منطقه‌ای خراسان",
  description:
    "سامانه ارزیابی هوشمند ۲۵ شاخص تله‌متری ترکیب بدنی ورزشکاران با دستگاه Xiaomi S400 و تحلیل مربی ارشد هوش مصنوعی",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className="dark">
      <body className="min-h-screen bg-[#070b12] text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),rgba(255,255,255,0))] -z-10" />
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.08),transparent_50%)] -z-10" />
        {children}
      </body>
    </html>
  );
}
