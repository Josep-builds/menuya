"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError("No pudimos abrir Google. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={signIn}
        disabled={loading}
        className="w-full rounded-2xl bg-brand py-4 text-lg font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "Abriendo Google…" : "Entrar con Google"}
      </button>
      {error && <p className="text-center text-sm text-red-700">{error}</p>}
    </div>
  );
}
