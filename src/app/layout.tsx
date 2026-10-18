import type { Metadata } from "next";
import "./globals.css";
import { EnterpriseQueryProvider } from "@/core/providers/query-provider";

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
    <html lang="fa" dir="rtl" className="light">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var savedTheme = localStorage.getItem('krec-theme') || 'light';
                document.documentElement.classList.remove('dark', 'light');
                document.documentElement.classList.add(savedTheme);
              } catch (e) {}
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (var registration of registrations) {
                    registration.unregister();
                  }
                });
              }
              if (typeof window !== 'undefined' && 'caches' in window) {
                caches.keys().then(function(names) {
                  for (var name of names) {
                    caches.delete(name);
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        <EnterpriseQueryProvider>
          {children}
        </EnterpriseQueryProvider>
      </body>
    </html>
  );
}
