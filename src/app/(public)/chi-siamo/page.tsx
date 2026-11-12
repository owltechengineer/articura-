import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Chi siamo",
  description:
    "Partner tecnologico delle microimprese: essenziale, industriale, affidabile.",
};

const VALUES = [
  {
    title: "Essenziale",
    text: "Solo la tecnologia che riduce attrito e aumenta controllo.",
  },
  {
    title: "Industriale",
    text: "Linguaggio e tempi di chi produce, non di chi vende slide.",
  },
  {
    title: "Misurabile",
    text: "Priorità, costi e risultati chiari prima di sviluppare.",
  },
];

export default function ChiSiamoPage() {
  return (
    <>
      <PageHero
        eyebrow="Chi siamo"
        title="Tecnologia al servizio di chi crea valore"
        description="Articura affianca microimprese artigiane e industriali nella digitalizzazione concreta: siti, software e processi su misura."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <SectionHeading
              title="Il punto di partenza è il mestiere"
              description="Non partiamo da un catalogo di tool. Partiamo da preventivi, commesse, ordini, follow-up e dal tempo che oggi si perde tra fogli e telefonate."
            />
          </Reveal>
          <Reveal delay={0.1} className="space-y-6 text-sm leading-relaxed text-foreground-muted sm:text-base">
            <p>
              Lavoriamo con imprese fino a circa 20 addetti, soprattutto in
              Lombardia e nel metalmeccanico, con attenzione a manifattura,
              artigianato e servizi B2B.
            </p>
            <p>
              L’obiettivo non è “avere più software”, ma rendere più leggibile e
              governabile l’operatività: meno dispersione, più continuità, più
              margine di attenzione sul lavoro che conta.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section tone="dark">
        <SectionHeading
          light
          eyebrow="Metodo"
          title="Come lavoriamo"
          description="Analisi → Strategia → Sviluppo → Evoluzione. Ogni fase ha un output chiaro."
        />
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {VALUES.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.08}>
              <p className="font-display text-xs tracking-[0.2em] text-white/45">
                0{index + 1}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold">
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-white/65">{item.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            title="Vuoi capire se ha senso collaborare?"
            description="Un confronto breve basta per capire priorità, vincoli e se Articura è la strada giusta."
          />
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/richiedi-preventivo">Richiedi un confronto</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/progetti">Vedi i progetti</Link>
            </Button>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
