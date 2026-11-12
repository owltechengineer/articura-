import type { Metadata } from "next";

import { ServiceDetailPage } from "@/components/marketing/service-detail";

export const metadata: Metadata = {
  title: "Siti web",
  description:
    "Presenza digitale professionale: siti aziendali, landing, e-commerce e portali B2B.",
};

export default function Page() {
  return (
    <ServiceDetailPage
      eyebrow="Digital Presence"
      title="Siti web che spiegano il valore del tuo lavoro"
      description="Siti aziendali, landing e portali B2B chiari, veloci e allineati al modo in cui vendi e consegni."
      outcomes={[
        "Una presenza online professionale, senza complessità inutili.",
        "Struttura dei contenuti pensata su servizi, settori e casi reali.",
        "Base tecnica pronta per evolvere verso area riservata o catalogo.",
      ]}
      steps={[
        {
          title: "Brief",
          text: "Offerta, target e vincoli di comunicazione.",
        },
        {
          title: "Architettura",
          text: "Pagine, messaggi e percorsi di contatto.",
        },
        {
          title: "Design & build",
          text: "Interfaccia sobria, performance e SEO di base.",
        },
        {
          title: "Lancio",
          text: "Pubblicazione, formazione e passaggi successivi.",
        },
      ]}
      suitableFor={[
        "Officine e aziende manifatturiere che vogliono presentarsi meglio",
        "Artigiani con catalogo servizi da rendere leggibile",
        "Imprese B2B che ricevono richieste poco qualificate",
      ]}
    />
  );
}
