import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { BrandLogo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Accedi",
  robots: { index: false, follow: false },
};

export const instant = false;

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/") ? params.next : "/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#eff6ff,transparent_45%),linear-gradient(180deg,#ffffff,#f7f8fa)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-[var(--shadow-md)]">
        <BrandLogo href="/" size="md" priority />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
          Accesso dashboard
        </h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Area riservata. Gli account sono creati solo su invito: non è
          disponibile la registrazione pubblica.
        </p>

        {params.error ? (
          <p className="mt-4 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            Autenticazione non riuscita. Riprova.
          </p>
        ) : null}

        <div className="mt-8">
          <LoginForm nextPath={nextPath} />
        </div>
      </div>
    </div>
  );
}
