import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type ThemeId = "classic-kanti" | "night-ritual" | "lotus-bloom" | "forest-herbal";

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingFont: string;
  isDark: boolean;
}

export const THEMES: ThemeConfig[] = [
  {
    id: "classic-kanti",
    name: "Classic Kanti",
    description:
      "Our signature Ayurvedic heritage styling. Warm creams, terracotta, and deep forest herbs.",
    primaryColor: "oklch(0.42 0.13 38)",
    secondaryColor: "oklch(0.94 0.04 80)",
    accentColor: "oklch(0.78 0.16 75)",
    headingFont: "Playfair Display",
    isDark: false,
  },
  {
    id: "night-ritual",
    name: "Night Ritual",
    description:
      "An eye-safe, immersive dark mode. Deep twilight blue and celestial golden accents.",
    primaryColor: "oklch(0.82 0.11 82)",
    secondaryColor: "oklch(0.19 0.02 260)",
    accentColor: "oklch(0.82 0.11 82)",
    headingFont: "Cormorant Garamond",
    isDark: true,
  },
  {
    id: "lotus-bloom",
    name: "Lotus Bloom",
    description:
      "A tranquil and healing environment. Delicate blush rose water and shimmering rose golds.",
    primaryColor: "oklch(0.48 0.12 15)",
    secondaryColor: "oklch(0.95 0.02 20)",
    accentColor: "oklch(0.78 0.08 45)",
    headingFont: "Cinzel",
    isDark: false,
  },
  {
    id: "forest-herbal",
    name: "Forest Herbal",
    description: "A pure botanical sanctuary. Deep vetiver pines, cardamom, and fresh forest mist.",
    primaryColor: "oklch(0.32 0.08 145)",
    secondaryColor: "oklch(0.92 0.03 145)",
    accentColor: "oklch(0.81 0.12 110)",
    headingFont: "Marcellus",
    isDark: false,
  },
];

interface ThemeCtx {
  theme: ThemeId;
  setTheme: (id: ThemeId) => Promise<void>;
  currentConfig: ThemeConfig;
  loading: boolean;
}

const ThemeContext = createContext<ThemeCtx | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  // Initialize state synchronously on client side from localStorage to avoid flashes
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("house_of_kanti_theme");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (
            parsed &&
            parsed.version === 1 &&
            ["classic-kanti", "night-ritual", "lotus-bloom", "forest-herbal"].includes(parsed.theme)
          ) {
            return parsed.theme as ThemeId;
          }
        }
      } catch (err) {
        // ignore
      }
    }
    return "classic-kanti";
  });

  const [loading, setLoading] = useState(true);
  const themeRef = useRef<ThemeId>(theme);

  // Maintain reference to the current theme to use in effects without triggering re-runs
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Helper to persist theme locally with format: { version: 1, theme: ThemeId }
  const saveThemeLocally = (id: ThemeId) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("house_of_kanti_theme", JSON.stringify({ version: 1, theme: id }));
      } catch (err) {
        console.error("Failed to save theme to localStorage:", err);
      }
    }
  };

  // Synchronize HTML attributes, class names, and dark mode solely inside this single-point-of-truth effect
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "night-ritual") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Listen for storage change events (multi-tab support)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "house_of_kanti_theme") {
        try {
          const parsed = JSON.parse(e.newValue || "");
          if (
            parsed &&
            parsed.version === 1 &&
            ["classic-kanti", "night-ritual", "lotus-bloom", "forest-herbal"].includes(parsed.theme)
          ) {
            setThemeState(parsed.theme as ThemeId);
          }
        } catch (err) {
          // ignore
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const prevUserRef = useRef<string | null>(null);

  // Synchronize theme with authentication state changes
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // User is logged out / guest
      // We DO NOT reset the theme on logout to adhere to: "Logging in or logging out must NOT reset the theme"
      setLoading(false);
      prevUserRef.current = null;
    } else {
      // Authenticated users: Fetch from the centralized profiles.theme_preference table
      let active = true;

      async function syncUserTheme() {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("theme_preference")
            .eq("user_id", user.id)
            .maybeSingle();

          if (!active) return;

          if (error) {
            console.error("Failed to fetch user theme from profiles:", error);
          }

          const profileTheme = data?.theme_preference as ThemeId | undefined;
          const isValid = profileTheme && THEMES.some((t) => t.id === profileTheme);

          if (isValid) {
            // Priority 1: User profile theme
            setThemeState(profileTheme);
            saveThemeLocally(profileTheme);
          } else {
            // Profile theme not set -> Sync the current local theme to the profile
            await supabase
              .from("profiles")
              .update({ theme_preference: themeRef.current })
              .eq("user_id", user.id);
          }
        } catch (err) {
          console.error("Failed to sync user theme:", err);
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      syncUserTheme();
      prevUserRef.current = user.id;

      return () => {
        active = false;
      };
    }
  }, [user, authLoading]);

  // Set and save the theme preference
  const setTheme = async (id: ThemeId) => {
    if (!THEMES.some((t) => t.id === id)) return;

    // Apply the theme state immediately
    setThemeState(id);
    saveThemeLocally(id);

    // Persist only if user is logged in
    if (user) {
      try {
        await supabase.from("profiles").update({ theme_preference: id }).eq("user_id", user.id);
      } catch (err) {
        console.error("Error saving theme to Supabase:", err);
      }
    }
  };

  const currentConfig = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentConfig, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
