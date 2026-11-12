import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ServiceDetailPage } from "@/components/marketing/service-detail";
import { Section } from "@/components/marketing/section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Software personalizzato",
  description:
    "Web app, CRM e gestionali costruiti sul tuo modo di lavorare.",
};

export default function Page() {
  return (
    <>
      <ServiceDetailPage
        eyebrow="Custom Software"
        title="Software costruito sul tuo processo"
        description="CRM, gestionali e web app su misura: meno fogli sparsi, più controllo su preventivi, clienti e commesse."
        outcomes={[
          "Un sistema allineato al flusso reale dell’impresa.",
          "Meno doppio lavoro tra email, Excel e telefonate.",
          "Base evolutiva per report, notifiche e automazioni.",
        ]}
        steps={[
          {
            title: "Mappatura",
            text: "Processi, ruoli e punti di frizione.",
          },
          {
            title: "MVP",
            text: "Prima versione utile, limitata all’essenziale.",
          },
          {
            title: "Validazione",
            text: "Uso reale con chi lavora ogni giorno.",
          },
          {
            title: "Evoluzione",
            text: "Iterazioni misurate su dati e feedback.",
          },
        ]}
        suitableFor={[
          "Imprese con processi specifici non coperti da software generici",
          "Team che gestiscono molte richieste commerciali",
          "Aziende che vogliono unificare clienti, preventivi e attività",
        ]}
      />
      <Section>
        <div className="overflow-hidden">
          <Image
            src="/marketing/tecnologia-piattaforme.png"
            alt="Esempi di piattaforme digitali Articura"
            width={1024}
            height={576}
            className="h-auto w-full object-cover"
            sizes="(max-width: 1152px) 100vw, 1152px"
          />
        </div>
        <div className="mt-8">
          <Button asChild variant="secondary">
            <Link href="/servizi">Vedi prezzi nel configuratore</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
