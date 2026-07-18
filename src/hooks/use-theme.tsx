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
  const [theme, setThemeState] = useState<ThemeId>("classic-kanti");
  const [loading, setLoading] = useState(true);

  // Synchronize HTML attributes, class names, and dark mode solely inside this single-point-of-truth effect
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "night-ritual") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const prevUserRef = useRef<string | null>(null);

  // Synchronize theme with authentication state changes
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // If a logged-in user explicitly logged out (transitioned from logged-in to guest)
      if (prevUserRef.current !== null) {
        setThemeState("classic-kanti");
      }
      setLoading(false);
    } else {
      // Authenticated users: Fetch from the centralized profiles.theme_preference table
      let active = true;

      async function fetchUserTheme() {
        try {
          const { data } = await supabase
            .from("profiles")
            .select("theme_preference")
            .eq("user_id", user.id)
            .maybeSingle();

          if (!active) return;

          if (data?.theme_preference && THEMES.some((t) => t.id === data.theme_preference)) {
            setThemeState(data.theme_preference as ThemeId);
          } else {
            // Keep default theme "classic-kanti" if no preference has been configured
            setThemeState("classic-kanti");
          }
        } catch (err) {
          console.error("Failed to fetch user theme from profiles:", err);
          setThemeState("classic-kanti");
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      fetchUserTheme();
      return () => {
        active = false;
      };
    }

    // Update the tracked user ID for subsequent runs to distinguish route updates from real auth status transitions
    prevUserRef.current = user ? user.id : null;
  }, [user, authLoading]);

  // Set and save the theme preference
  const setTheme = async (id: ThemeId) => {
    if (!THEMES.some((t) => t.id === id)) return;

    // Apply the theme state immediately
    setThemeState(id);

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
