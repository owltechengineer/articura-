import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Settori",
  description:
    "Soluzioni per metalmeccanico, manifattura, artigianato e servizi B2B.",
};

const SECTORS = [
  {
    title: "Metalmeccanico",
    description:
      "Qualità, precisione e flussi di commessa: strumenti digitali che seguono il ritmo del pezzo e della produzione.",
  },
  {
    title: "Manifattura",
    description:
      "Dalla distinta base al preventivo, fino al monitoraggio delle lavorazioni e delle consegne.",
  },
  {
    title: "Artigianato",
    description:
      "Presenza online e processi semplici, senza sottrarre tempo al mestiere.",
  },
  {
    title: "Servizi B2B",
    description:
      "Organizzazione commerciale, documentazione e follow-up per studi e imprese di servizi.",
  },
];

export default function SettoriPage() {
  return (
    <>
      <PageHero
        eyebrow="Settori"
        title="Tecnologia per chi costruisce valore"
        description="Soluzioni per metalmeccanico, manifattura, artigianato e servizi B2B, con attenzione alle imprese della Lombardia."
      />

      <Section>
        <Reveal className="relative aspect-[16/8] overflow-hidden">
          <Image
            src="/marketing/settori-collage.png"
            alt="Lavorazioni industriali, artigianato del legno, progettazione CAD e saldatura"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1152px) 100vw, 1152px"
          />
        </Reveal>
      </Section>

      <Section tone="muted">
        <SectionHeading
          title="Settori in cui interveniamo"
          description="Stesso metodo, linguaggio diverso per ogni contesto produttivo."
        />
        <div className="mt-12 divide-y divide-border border-y border-border">
          {SECTORS.map((sector, index) => (
            <Reveal key={sector.title} delay={index * 0.06} y={16}>
              <article className="grid gap-3 py-8 sm:grid-cols-[8rem_1fr] sm:gap-10">
                <p className="font-display text-sm tracking-[0.18em] text-accent">
                  0{index + 1}
                </p>
                <div>
                  <h2 className="font-display text-xl font-semibold">
                    {sector.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground-muted sm:text-base">
                    {sector.description}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/richiedi-preventivo">Parliamo del tuo progetto</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/servizi">Scopri i servizi</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
