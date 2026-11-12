import type { Metadata } from "next";

import { ServiceDetailPage } from "@/components/marketing/service-detail";

export const metadata: Metadata = {
  title: "Digitalizzazione",
  description:
    "Analisi dei processi e digitalizzazione di preventivi, ordini e commesse.",
};

export default function Page() {
  return (
    <ServiceDetailPage
      eyebrow="Business Digitalization"
      title="Digitalizzare senza complicare"
      description="Trasformiamo preventivi, ordini e commesse in flussi digitali leggibili, con priorità chiare e strumenti sostenibili."
      outcomes={[
        "Meno passaggi manuali e meno errori di trascrizione.",
        "Stato di avanzamento visibile a chi deve decidere.",
        "Documentazione e storico utili in fase commerciale e operativa.",
      ]}
      steps={[
        {
          title: "As-is",
          text: "Come lavorate oggi, davvero.",
        },
        {
          title: "Priorità",
          text: "Cosa digitalizzare prima per impatto/costo.",
        },
        {
          title: "Implementazione",
          text: "Strumenti e processi sul perimetro scelto.",
        },
        {
          title: "Adozione",
          text: "Formazione breve e messa a regime.",
        },
      ]}
      suitableFor={[
        "Officine con preventivi e commesse ancora frammentati",
        "Imprese che crescono e perdono controllo sulle richieste",
        "Team che vogliono ordine senza cambiare mestiere",
      ]}
    />
  );
}
