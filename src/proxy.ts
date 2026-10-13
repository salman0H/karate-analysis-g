import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const STALE_VITE_PATHS = [
  "/@vite",
  "/@react-refresh",
  "/@vite-plugin-pwa",
  "/src/index.jsx",
  "/styles.css",
  "/workbox",
  "/sw.js",
];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isStaleViteRequest = STALE_VITE_PATHS.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isStaleViteRequest) {
    if (pathname === "/src/index.jsx") {
      const killerScript = `
        console.warn("Rogue Vite PWA Service Worker detected. Purging cache...");
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for (var reg of registrations) {
              reg.unregister();
            }
          });
        }
        if ('caches' in window) {
          caches.keys().then(function(names) {
            Promise.all(names.map(function(n) { return caches.delete(n); })).then(function() {
              setTimeout(function() { window.location.reload(); }, 100);
            });
          });
        } else {
          setTimeout(function() { window.location.reload(); }, 100);
        }
      `;

      return new NextResponse(killerScript, {
        status: 200,
        headers: {
          "Content-Type": "application/javascript; charset=utf-8",
          "Clear-Site-Data": '"cache", "storage"',
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    if (pathname.endsWith(".css") || pathname === "/styles.css") {
      return new NextResponse("/* empty */", {
        status: 200,
        headers: {
          "Content-Type": "text/css; charset=utf-8",
          "Clear-Site-Data": '"cache", "storage"',
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    // Harmless JavaScript fallback for @vite/client, @react-refresh, etc.
    return new NextResponse("export default {};\n", {
      status: 200,
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Clear-Site-Data": '"cache", "storage"',
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/@vite/:path*",
    "/@react-refresh",
    "/@vite-plugin-pwa/:path*",
    "/src/index.jsx",
    "/styles.css",
    "/workbox-:path*",
    "/sw.js",
  ],
};
