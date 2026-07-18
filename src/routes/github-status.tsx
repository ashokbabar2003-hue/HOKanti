import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  GitCommit,
  RefreshCw,
  ExternalLink,
  Github,
} from "lucide-react";

export const Route = createFileRoute("/github-status")({
  head: () => ({
    meta: [
      { title: "GitHub Sync Status — House Of Kanti" },
      {
        name: "description",
        content:
          "Track recent commits, last sync time, and any sync errors for the connected GitHub repository.",
      },
      { property: "og:title", content: "GitHub Sync Status" },
      {
        property: "og:description",
        content: "Recent commits and sync health for the connected repository.",
      },
    ],
  }),
  component: GithubStatusPage,
});

type Commit = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { name: string; date: string };
  };
  author: { login: string; avatar_url: string } | null;
};

type Repo = {
  full_name: string;
  html_url: string;
  default_branch: string;
  pushed_at: string;
  private: boolean;
  description: string | null;
};

const STORAGE_KEY = "github-status:repo";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function GithubStatusPage() {
  const [repoInput, setRepoInput] = useState("");
  const [activeRepo, setActiveRepo] = useState<string>("");
  const [repo, setRepo] = useState<Repo | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      setRepoInput(saved);
      setActiveRepo(saved);
    }
  }, []);

  const fetchStatus = useCallback(async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const [repoRes, commitsRes] = await Promise.all([
        fetch(`https://api.github.com/repos/${slug}`),
        fetch(`https://api.github.com/repos/${slug}/commits?per_page=10`),
      ]);

      if (repoRes.status === 404)
        throw new Error(
          `Repository "${slug}" not found. Check the owner/repo name and ensure it's public.`,
        );
      if (repoRes.status === 403)
        throw new Error("GitHub API rate limit reached. Please try again in a few minutes.");
      if (!repoRes.ok)
        throw new Error(`GitHub API error (${repoRes.status}) while loading repository.`);
      if (!commitsRes.ok)
        throw new Error(`GitHub API error (${commitsRes.status}) while loading commits.`);

      const repoData: Repo = await repoRes.json();
      const commitsData: Commit[] = await commitsRes.json();
      setRepo(repoData);
      setCommits(commitsData);
      setLastChecked(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      setRepo(null);
      setCommits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeRepo) fetchStatus(activeRepo);
  }, [activeRepo, fetchStatus]);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = repoInput
      .trim()
      .replace(/^https?:\/\/github\.com\//, "")
      .replace(/\.git$/, "")
      .replace(/\/$/, "");
    if (!/^[\w.-]+\/[\w.-]+$/.test(trimmed)) {
      setError("Enter a valid repo in the form owner/repo (e.g. facebook/react)");
      return;
    }
    localStorage.setItem(STORAGE_KEY, trimmed);
    setActiveRepo(trimmed);
    setRepoInput(trimmed);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Github className="h-8 w-8" />
            <h1 className="text-3xl font-display">GitHub Sync Status</h1>
          </div>
          <p className="text-muted-foreground">
            Live status of the connected GitHub repository — recent commits, last push time, and any
            errors.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Repository</CardTitle>
            <CardDescription>Enter a public GitHub repo as owner/repo</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConnect} className="flex flex-col sm:flex-row gap-2">
              <Input
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="houseofkanti/website"
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {activeRepo ? "Update" : "Connect"}
              </Button>
              {activeRepo && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fetchStatus(activeRepo)}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sync error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {repo && !error && (
          <>
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Connected</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Last push</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">{timeAgo(repo.pushed_at)}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(repo.pushed_at).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Default branch</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">{repo.default_branch}</Badge>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">{repo.full_name}</CardTitle>
                  {repo.description && (
                    <CardDescription className="mt-1">{repo.description}</CardDescription>
                  )}
                </div>
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                </a>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent changes</CardTitle>
                <CardDescription>
                  Last {commits.length} commits on {repo.default_branch}
                  {lastChecked && ` · checked ${timeAgo(lastChecked.toISOString())}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {commits.map((c) => (
                    <li key={c.sha} className="py-3 flex gap-3 items-start">
                      <GitCommit className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <a
                          href={c.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:underline block truncate"
                        >
                          {c.commit.message.split("\n")[0]}
                        </a>
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="font-mono">{c.sha.slice(0, 7)}</span>
                          {" · "}
                          {c.author?.login || c.commit.author.name}
                          {" · "}
                          {timeAgo(c.commit.author.date)}
                        </div>
                      </div>
                    </li>
                  ))}
                  {commits.length === 0 && !loading && (
                    <li className="py-6 text-center text-muted-foreground text-sm">
                      No commits found.
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </>
        )}

        {!activeRepo && !error && (
          <div className="text-center text-muted-foreground py-12">
            <Github className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Connect a public repository above to see sync status.</p>
          </div>
        )}

        <div className="mt-8 text-sm text-muted-foreground">
          <Link to="/" className="hover:underline">
            ← Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
