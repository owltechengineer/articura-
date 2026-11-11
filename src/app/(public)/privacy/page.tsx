import { PageHero } from "@/components/marketing/page-hero";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Informativa privacy. Contenuto legale da finalizzare con il tuo consulente.",
};

export default function Page() {
  return (
    <>
      <PageHero title="Privacy" description="Informativa privacy. Contenuto legale da finalizzare con il tuo consulente." />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="rounded-xl border border-dashed border-border bg-background-secondary/60 p-8 text-sm text-foreground-muted">
          Contenuto di dettaglio in arrivo nella Fase 2. La struttura della pagina è già attiva e SEO-ready.
        </div>
      </section>
    </>
  );
}
