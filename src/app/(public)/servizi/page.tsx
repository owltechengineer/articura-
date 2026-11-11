import type { Metadata } from "next";

import { PageHero } from "@/components/marketing/page-hero";
import { ServiceConfigurator } from "@/components/marketing/service-configurator";
import { EmptyState } from "@/components/ui/empty-state";
import { loadCatalogSnapshot } from "@/lib/pricing/catalog";

export const metadata: Metadata = {
  title: "Servizi",
  description:
    "Configura siti web, software, CRM e automazioni. Prezzi dal listino Articura aggiornato in tempo reale.",
};

export const instant = false;

export default async function ServiziPage() {
  const catalog = await loadCatalogSnapshot({ includeDrafts: false });

  return (
    <>
      <PageHero
        eyebrow="Servizi"
        title="Configura la tua soluzione"
        description="Seleziona servizi o pacchetti, aggiungi funzionalità compatibili e richiedi un preventivo. I prezzi sono gestiti dalla dashboard Articura."
      />
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {!catalog ? (
          <EmptyState
            title="Listino in configurazione"
            description="Il configuratore sarà disponibile dopo il collegamento al database e la pubblicazione dei servizi."
          />
        ) : (
          <ServiceConfigurator catalog={catalog} />
        )}
      </section>
    </>
  );
}
