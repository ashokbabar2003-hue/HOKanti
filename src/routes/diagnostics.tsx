import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { createServerFn } from "@tanstack/react-start";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, XCircle, RefreshCw, Server, ShieldAlert } from "lucide-react";

// Server-side function to check the environment variables
export const getEnvStatus = createServerFn({ method: "GET" }).handler(async () => {
  const envVars = [
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SMTP_HOST",
    "SMTP_USER",
    "SMTP_PASS",
    "RESEND_API_KEY",
  ];

  return envVars.map((name) => {
    const value = process.env[name];
    return {
      name,
      present: typeof value === "string" && value.trim().length > 0,
    };
  });
});

export const Route = createFileRoute("/diagnostics")({
  head: () => ({
    meta: [
      { title: "System Diagnostics — House Of Kanti" },
      {
        name: "description",
        content: "Temporary environment status page for House of Kanti development diagnostics.",
      },
    ],
  }),
  component: DiagnosticsPage,
});

interface EnvCheckResult {
  name: string;
  present: boolean;
}

function DiagnosticsPage() {
  const [results, setResults] = useState<EnvCheckResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEnvStatus();
      setResults(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Failed to fetch environment diagnostics:", err);
      setError("Failed to fetch server environment variables status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Server className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-display">System Diagnostics</h1>
          </div>
          <p className="text-muted-foreground">
            Development-only environment status dashboard. This helper page reports the presence of
            key credentials without ever revealing their secrets.
          </p>
        </div>

        <Alert
          variant="destructive"
          className="mb-6 bg-destructive/10 border-destructive/20 text-destructive-foreground"
        >
          <ShieldAlert className="h-4 w-4 text-destructive" />
          <AlertTitle className="font-semibold">Development Only Warning</AlertTitle>
          <AlertDescription className="text-sm">
            This diagnostics page is intended{" "}
            <strong>strictly for local development and configuration verification</strong>. It must
            be removed before pushing or deploying to production environments.
          </AlertDescription>
        </Alert>

        <Card className="border border-border/60 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Environment Variables</CardTitle>
              <CardDescription>
                {lastUpdated
                  ? `Last checked at ${lastUpdated}`
                  : "Checking server configuration..."}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStatus}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Recheck
            </Button>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm mb-4">
                {error}
              </div>
            )}

            {loading && results.length === 0 ? (
              <div className="space-y-3 py-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 bg-muted/50 rounded-lg animate-pulse w-full" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {results.map((v) => (
                  <div key={v.name} className="py-3 flex items-center justify-between">
                    <span className="font-mono text-sm font-medium tracking-tight text-foreground/95">
                      {v.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {v.present ? (
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                          YES
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-destructive/10 text-destructive border-destructive/20 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"
                        >
                          <XCircle className="h-3.5 w-3.5 text-destructive" />
                          NO
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-sm text-muted-foreground flex items-center justify-between">
          <Link to="/" className="hover:underline text-primary/80 font-medium">
            ← Back to home
          </Link>
          <span className="text-xs">House Of Kanti v1.0</span>
        </div>
      </main>
      <Footer />
    </div>
  );
}
