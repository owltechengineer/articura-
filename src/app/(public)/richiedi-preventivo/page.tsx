import type { Metadata } from "next";
import Link from "next/link";

import { LeadRequestForm } from "@/components/marketing/lead-request-form";
import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/marketing/section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Richiedi preventivo",
  description:
    "Descrivi esigenze e vincoli: ti rispondiamo con un percorso chiaro.",
};

export default function RichiediPreventivoPage() {
  return (
    <>
      <PageHero
        eyebrow="Preventivo"
        title="Richiedi un confronto operativo"
        description="Compila il quadro aziendale: settore, strumenti, budget orientativo e obiettivo. Ti rispondiamo con un percorso chiaro."
      />
      <Section tone="muted">
        <div className="mb-10 flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-xl text-sm text-foreground-muted">
            Hai già chiaro il tipo di servizio? Puoi anche usare il
            configuratore con prezzi dal listino.
          </p>
          <Button asChild variant="secondary">
            <Link href="/servizi">Apri configuratore</Link>
          </Button>
        </div>
        <LeadRequestForm
          kind="quote"
          title="Dati per il preventivo"
          subtitle="I campi aggiuntivi ci aiutano a evitare proposte generiche. Privacy obbligatoria; marketing solo su consenso esplicito."
        />
      </Section>
    </>
  );
}
