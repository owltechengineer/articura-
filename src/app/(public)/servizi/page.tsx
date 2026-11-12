import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { Section, SectionHeading } from "@/components/marketing/section";
import { ServiceConfigurator } from "@/components/marketing/service-configurator";
import { EmptyState } from "@/components/ui/empty-state";
import { loadCatalogSnapshot } from "@/lib/pricing/catalog";

export const metadata: Metadata = {
  title: "Servizi",
  description:
    "Configura siti web, software, CRM e automazioni. Prezzi dal listino Articura aggiornato in tempo reale.",
};

export const instant = false;

const SERVICE_LINKS = [
  {
    href: "/servizi/siti-web",
    title: "Siti web",
    text: "Presenza digitale chiara e performante.",
  },
  {
    href: "/servizi/software-personalizzato",
    title: "Software",
    text: "CRM e gestionali sul tuo processo.",
  },
  {
    href: "/servizi/digitalizzazione",
    title: "Digitalizzazione",
    text: "Preventivi, ordini e commesse digitali.",
  },
  {
    href: "/servizi/automazioni-ai",
    title: "Automazioni & AI",
    text: "Ripetitività fuori, controllo dentro.",
  },
];

export default async function ServiziPage() {
  const catalog = await loadCatalogSnapshot({ includeDrafts: false });

  return (
    <>
      <PageHero
        eyebrow="Servizi"
        title="Configura la tua soluzione"
        description="Seleziona servizi o pacchetti, aggiungi funzionalità e richiedi un preventivo. I prezzi arrivano dal listino Articura."
      />

      <Section>
        <SectionHeading
          title="Aree di intervento"
          description="Parti dal percorso giusto, poi raffina nel configuratore."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_LINKS.map((item, index) => (
            <Reveal key={item.href} delay={index * 0.06}>
              <Link
                href={item.href}
                className="group block border-t border-border pt-5 transition-colors hover:border-accent"
              >
                <h3 className="font-display text-lg font-semibold group-hover:text-accent">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-foreground-muted">{item.text}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          eyebrow="Listino"
          title="Configuratore preventivi"
          description="Stima iniziale basata su servizi e pacchetti pubblicati. Il totale definitivo lo conferma il team."
        />
        <div className="mt-10">
          {!catalog ? (
            <EmptyState
              title="Listino in configurazione"
              description="Il configuratore sarà disponibile dopo il collegamento al database e la pubblicazione dei servizi."
            />
          ) : (
            <ServiceConfigurator catalog={catalog} />
          )}
        </div>
      </Section>
    </>
  );
}
