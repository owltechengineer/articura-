export type Project = {
  slug: string;
  name: string;
  url: string;
  sector: string;
  type: string;
  summary: string;
  challenge: string;
  solution: string;
  deliverables: string[];
};

/**
 * Portfolio verificato — solo progetti reali consegnati.
 * Non includere numeri di business non approvati.
 */
export const PROJECTS: Project[] = [
  {
    slug: "owltech",
    name: "OWLTECH",
    url: "https://owltech.it",
    sector: "R&D · Meccanica · Prototipazione",
    type: "Sito aziendale",
    summary:
      "Sito aziendale per un partner di ricerca e sviluppo: digitalizzazione prodotti, reverse engineering, prototipazione e supporto produttivo.",
    challenge:
      "Comunicare con chiarezza un'offerta tecnica ampia (dal pezzo reale al digitale, fino a prototipi e piccole serie) senza diluire l'autorevolezza industriale.",
    solution:
      "Architettura contenuti orientata ai servizi, presentazione dei processi e percorsi di contatto pensati per imprese e professionisti tecnici.",
    deliverables: [
      "Sito aziendale Next.js",
      "Catalogo servizi R&D",
      "Struttura SEO e contatti",
    ],
  },
  {
    slug: "sabina-workwear",
    name: "Sabina Workwear",
    url: "https://sabinaworkwear.it",
    sector: "Abbigliamento personalizzato · Artigianato",
    type: "E-commerce / catalogo",
    summary:
      "Piattaforma digitale per abbigliamento personalizzato rivolto a scuole, aziende e società sportive, con cataloghi per organizzazione.",
    challenge:
      "Trasformare un laboratorio artigianale di Triuggio in un canale digitale ordinabile, con percorsi distinti per enti, team e shop generale.",
    solution:
      "Catalogo online, ordinazione prodotti personalizzati (ricamo/stampa) e esperienza pensata per plessi scolastici, aziende e società sportive.",
    deliverables: [
      "Catalogo e shop digitale",
      "Percorsi per enti e organizzazioni",
      "Presenza brand e contatti laboratorio",
    ],
  },
  {
    slug: "lem-solutions",
    name: "LEM Solutions",
    url: "https://lemsolutions.it",
    sector: "Fotoceramica · Industria · B2B",
    type: "Sito prodotto / catalogo B2B",
    summary:
      "Sito prodotto per sistemi di stampa fotoceramica: stampanti, toner ceramici, materiali, guide tecniche e percorsi commerciali.",
    challenge:
      "Organizzare un'offerta tecnica verticale (hardware, consumabili, formazione, settori applicativi) in un'esperienza chiara per centri stampa e laboratori.",
    solution:
      "Catalogo prodotti, contenuti tecnici, segmentazione per settore e funnel verso consulenza e configurazione laboratorio.",
    deliverables: [
      "Catalogo prodotti e sistemi",
      "Contenuti tecnici e guide",
      "Percorsi B2B e contatto commerciale",
    ],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}
