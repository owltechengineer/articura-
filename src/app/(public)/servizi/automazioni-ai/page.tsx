import type { Metadata } from "next";

import { ServiceDetailPage } from "@/components/marketing/service-detail";

export const metadata: Metadata = {
  title: "Automazioni & AI",
  description:
    "Automazioni e assistenti AI con supervisione umana per microimprese.",
};

export default function Page() {
  return (
    <ServiceDetailPage
      eyebrow="Automation & AI"
      title="Automazioni con controllo umano"
      description="Automazioni e assistenti AI su compiti ripetitivi, sempre con supervisione e senza promettere magie."
      outcomes={[
        "Riduzione di attività ripetitive a basso valore.",
        "Bozze e classificazioni accelerate, con verifica umana.",
        "Integrazioni tra strumenti già in uso, dove ha senso.",
      ]}
      steps={[
        {
          title: "Candidati",
          text: "Quali task ripetere ogni settimana.",
        },
        {
          title: "Regole",
          text: "Cosa può essere automatico e cosa no.",
        },
        {
          title: "Pilot",
          text: "Automazioni semplici, monitorabili.",
        },
        {
          title: "Controllo",
          text: "Metriche e punti di supervisione.",
        },
      ]}
      suitableFor={[
        "Imprese con follow-up e documenti ripetitivi",
        "Team che vogliono accelerare senza perdere qualità",
        "Contesti in cui l’AI deve restare assistita, non autonoma",
      ]}
    />
  );
}
