import type { Metadata } from "next";
import Link from "next/link";

import { LeadRequestForm } from "@/components/marketing/lead-request-form";
import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/marketing/section";

export const metadata: Metadata = {
  title: "Contatti",
  description:
    "Scrivici per un confronto sul tuo progetto. Nessun impegno commerciale automatico.",
};

export default function ContattiPage() {
  return (
    <>
      <PageHero
        eyebrow="Contatti"
        title="Parliamo della tua impresa"
        description="Nessun bot automatico: leggiamo la richiesta e rispondiamo con un confronto concreto su priorità e vincoli."
      />
      <Section tone="muted">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold">
                Cosa succede dopo
              </h2>
              <ol className="mt-4 space-y-4 text-sm text-foreground-muted">
                <li>
                  <span className="font-medium text-foreground">1. Lettura</span>
                  <br />
                  Analizziamo contesto, strumenti attuali e obiettivo.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    2. Confronto
                  </span>
                  <br />
                  Ti proponiamo un primo passaggio utile, senza forzature.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    3. Proposta
                  </span>
                  <br />
                  Solo se ha senso: percorso, tempi e investimento.
                </li>
              </ol>
            </div>
            <div className="border-t border-border pt-6 text-sm text-foreground-muted">
              Preferisci partire dal listino?{" "}
              <Link href="/servizi" className="text-accent hover:underline">
                Configura una soluzione
              </Link>{" "}
              oppure{" "}
              <Link
                href="/richiedi-preventivo"
                className="text-accent hover:underline"
              >
                richiedi un preventivo
              </Link>
              .
            </div>
          </aside>
          <LeadRequestForm kind="contact" />
        </div>
      </Section>
    </>
  );
}
