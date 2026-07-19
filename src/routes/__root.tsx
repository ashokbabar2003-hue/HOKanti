import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/hooks/use-theme";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=5.0",
      },
      { title: "House Of Kanti — Natural Ayurvedic Skincare" },
      {
        name: "description",
        content: "Handcrafted natural skincare — ubtan, face masks, soaps, oils & gift hampers.",
      },
      { name: "author", content: "House Of Kanti" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "House Of Kanti — Natural Ayurvedic Skincare" },
      { name: "twitter:title", content: "House Of Kanti — Natural Ayurvedic Skincare" },
      {
        property: "og:description",
        content: "Handcrafted natural skincare — ubtan, face masks, soaps, oils & gift hampers.",
      },
      {
        name: "twitter:description",
        content: "Handcrafted natural skincare — ubtan, face masks, soaps, oils & gift hampers.",
      },
      { property: "og:site_name", content: "House Of Kanti" },
      { name: "google-site-verification", content: "_kNqP9PJalJaz1pmtTSXRnIOBPiDyVptQlVI2bj1hhA" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {/* Inlined theme initialization script to run synchronously in head and prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('house_of_kanti_theme');
                  if (stored) {
                    var parsed = JSON.parse(stored);
                    if (parsed && parsed.version === 1) {
                      var theme = parsed.theme;
                      var validThemes = ['classic-kanti', 'night-ritual', 'lotus-bloom', 'forest-herbal'];
                      if (validThemes.indexOf(theme) !== -1) {
                        document.documentElement.setAttribute('data-theme', theme);
                        if (theme === 'night-ritual') {
                          document.documentElement.classList.add('dark');
                        } else {
                          document.documentElement.classList.remove('dark');
                        }
                      }
                    }
                  }
                } catch (e) {
                  console.error('Theme head-script error:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ThemeProvider>
          <CartProvider>
            <Outlet />
            <Toaster />
          </CartProvider>
        </ThemeProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
