"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-paper">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 rounded-full bg-ink flex items-center justify-center mb-4">
            <Lock className="w-5 h-5 text-brass" strokeWidth={1.75} />
          </div>
          <h1 className="font-display text-3xl text-ink">Vaultly</h1>
          <p className="text-slate text-sm mt-1">Your documents, held privately.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs uppercase tracking-wide text-slate mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-line rounded-md text-ink placeholder:text-slate/50 focus:border-brass transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs uppercase tracking-wide text-slate mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-line rounded-md text-ink placeholder:text-slate/50 focus:border-brass transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-rust bg-rust/10 border border-rust/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-ink text-paper rounded-md font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-slate mt-6">
          No account yet?{" "}
          <Link href="/signup" className="text-brass-dark font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
