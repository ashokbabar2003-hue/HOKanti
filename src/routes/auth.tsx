import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { toast } from "sonner";
import { Leaf } from "lucide-react";

type Search = { redirect?: string; mode?: "signin" | "signup" };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
    mode: s.mode === "signup" ? "signup" : "signin",
  }),
  head: () => ({
    meta: [
      { title: "Sign In or Create Account — House Of Kanti" },
      {
        name: "description",
        content:
          "Sign in or create a House Of Kanti account to track orders, save addresses and build your wishlist.",
      },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "Sign In — House Of Kanti" },
      { property: "og:description", content: "Sign in to your House Of Kanti account." },
      { property: "og:url", content: "https://houseofkanti.ai.studio/auth" },
    ],
    links: [{ rel: "canonical", href: "https://houseofkanti.ai.studio/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user } = useAuth();
  const search = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: search.redirect ?? "/account" });
  }, [user, navigate, search.redirect]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, phone },
          },
        });
        if (error) {
          // Supabase returns "User already registered" when email+password user exists
          if (/already|exists|registered/i.test(error.message)) {
            toast.error("This email is already registered. Please sign in instead.");
            setMode("signin");
            return;
          }
          throw error;
        }
        // When email exists (e.g. via Google), Supabase returns user with empty identities
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          toast.error("This email is already registered (try signing in with Google).");
          setMode("signin");
          return;
        }
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (err: unknown) {
      const m = err instanceof Error ? err.message : "Something went wrong";
      toast.error(m);
    } finally {
      setLoading(false);
    }
  }

  /*async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth",
      },
    });
    if (error) toast.error("Google sign-in failed");
  }*/
  async function handleGoogle() {
    console.log("VITE_SUPABASE_URL =", import.meta.env.VITE_SUPABASE_URL);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log("SUPABASE CLIENT URL =", (supabase as any).supabaseUrl);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth",
      },
    });

    if (error) console.error(error);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sun text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
        </Link>
        <h1 className="text-center font-display text-3xl font-700 text-foreground">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {mode === "signup"
            ? "Track orders, save favourites and order faster."
            : "Sign in to view your orders and wishlist."}
        </p>

        <button
          onClick={handleGoogle}
          className="mt-8 flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          <svg className="h-4 w-4" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.4 0 10.2-2 13.9-5.3l-6.4-5.4c-2 1.4-4.6 2.3-7.5 2.3-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.4 5.4c-.4.4 6.7-4.9 6.7-15 0-1.2-.1-2.4-.4-3.5z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <Field label="Full name">
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Phone">
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input"
                />
              </Field>
            </>
          )}
          <Field label="Email">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Password">
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
          <button
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="font-semibold text-primary hover:underline"
          >
            {mode === "signup" ? "Sign in" : "Create an account"}
          </button>
        </p>
      </main>
      <Footer />
      <style>{`.input{display:block;width:100%;border-radius:0.5rem;border:1px solid hsl(var(--border));background:transparent;padding:0.625rem 0.875rem;font-size:0.875rem;outline:none;transition:border-color .15s}.input:focus{border-color:hsl(var(--primary))}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
