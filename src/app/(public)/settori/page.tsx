import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PageHero } from "@/components/marketing/page-hero";
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

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="overflow-hidden rounded-xl border border-border">
          <Image
            src="/marketing/settori-collage.png"
            alt="Lavorazioni industriali, artigianato del legno, progettazione CAD e saldatura"
            width={1024}
            height={576}
            className="h-auto w-full object-cover"
            priority
            sizes="(max-width: 1152px) 100vw, 1152px"
          />
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {SECTORS.map((sector) => (
            <article
              key={sector.title}
              className="rounded-xl border border-border bg-background p-6"
            >
              <h2 className="text-lg font-semibold">{sector.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                {sector.description}
              </p>
            </article>
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
      </section>
    </>
  );
}
