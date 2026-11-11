import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Software personalizzato",
  description:
    "Web app, CRM, gestionali e dashboard costruiti sul tuo modo di lavorare.",
};

const BENEFITS = [
  {
    title: "Problema",
    text: "Fogli, email e strumenti scollegati rallentano preventivi, magazzino e commesse.",
  },
  {
    title: "Soluzione",
    text: "Applicazioni su misura: dashboard, CRM, gestionali e cataloghi tecnici allineati ai processi reali.",
  },
  {
    title: "Beneficio",
    text: "Meno lavoro ripetitivo, dati centralizzati e decisioni più rapide senza cambiare mestiere.",
  },
];

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Custom Software"
        title="Software personalizzato"
        description="Web app, CRM, gestionali e dashboard costruiti sul tuo modo di lavorare."
      />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="overflow-hidden rounded-xl border border-border">
          <Image
            src="/marketing/tecnologia-piattaforme.png"
            alt="Esempi di dashboard, cataloghi 3D, pianificazione e automazioni digitali"
            width={1024}
            height={576}
            className="h-auto w-full object-cover"
            priority
            sizes="(max-width: 1152px) 100vw, 1152px"
          />
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {BENEFITS.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-border bg-background p-6"
            >
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                {item.text}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/richiedi-preventivo">Parliamo del tuo progetto</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/progetti">Vedi i progetti</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
