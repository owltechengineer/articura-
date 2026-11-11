import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Cog,
  LineChart,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import { BrandLogo } from "@/components/brand/logo";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { ProjectCard } from "@/components/marketing/project-card";
import { Button } from "@/components/ui/button";
import { APP_DESCRIPTION, APP_TAGLINE } from "@/lib/constants";
import { PROJECTS } from "@/lib/projects";

const PROBLEMS = [
  {
    title: "Processi ancora cartacei",
    description:
      "Preventivi, ordini e commesse dispersi tra email, fogli e telefonate.",
  },
  {
    title: "Strumenti scollegati",
    description:
      "Sito, gestionale e fogli di calcolo che non parlano tra loro.",
  },
  {
    title: "Tempo sottratto al mestiere",
    description:
      "Attività ripetitive che riducono margini e qualità del servizio.",
  },
];

const SOLUTIONS = [
  {
    title: "Digital Presence",
    description: "Siti aziendali, landing e portali B2B chiari e performanti.",
    href: "/servizi/siti-web",
  },
  {
    title: "Custom Software",
    description: "Web app, CRM e gestionali costruiti sul tuo modo di lavorare.",
    href: "/servizi/software-personalizzato",
  },
  {
    title: "Business Digitalization",
    description: "Digitalizzazione di preventivi, ordini, commesse e flussi.",
    href: "/servizi/digitalizzazione",
  },
  {
    title: "Automation & AI",
    description: "Automazioni e assistenti AI con supervisione umana.",
    href: "/servizi/automazioni-ai",
  },
];

const METHOD = [
  { step: "01", title: "Analisi", text: "Capire il business e i vincoli reali." },
  {
    step: "02",
    title: "Strategia",
    text: "Scegliere solo la tecnologia necessaria.",
  },
  {
    step: "03",
    title: "Sviluppo",
    text: "Costruire soluzioni misurate e manutenibili.",
  },
  {
    step: "04",
    title: "Evoluzione",
    text: "Migliorare nel tempo con dati e feedback.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-white">
        <div className="absolute inset-0 hidden lg:block">
          <Image
            src="/marketing/hero-articura.png"
            alt=""
            fill
            priority
            className="object-cover object-right"
            sizes="100vw"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/92 to-white/20" />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:min-h-[min(78vh,640px)] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:py-20">
          <div className="max-w-xl">
            <BrandLogo href={null} size="lg" className="mb-2" priority />
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {APP_TAGLINE}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-foreground-muted sm:text-lg">
              {APP_DESCRIPTION}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/richiedi-preventivo">
                  Parliamo del tuo progetto
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/servizi">Scopri le nostre soluzioni</Link>
              </Button>
            </div>
          </div>

          <div className="lg:hidden">
            <HeroVisual />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            Problemi concreti delle microimprese
          </h2>
          <p className="mt-3 text-foreground-muted">
            Non vendiamo più tecnologia del necessario. Partiamo dai vincoli
            operativi reali.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PROBLEMS.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-border bg-background p-6"
            >
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-background-secondary">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">
              Le nostre soluzioni
            </h2>
            <p className="mt-3 text-foreground-muted">
              Quattro ambiti, un unico obiettivo: rendere più efficiente e
              competitiva la tua impresa.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {SOLUTIONS.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-xl border border-border bg-background p-6 transition-colors hover:border-accent/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-foreground-muted">
                      {item.description}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 text-foreground-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            Metodo Articura
          </h2>
          <p className="mt-3 text-foreground-muted">
            Analisi → Strategia → Sviluppo → Evoluzione.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METHOD.map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-border bg-background p-5"
            >
              <p className="text-xs font-semibold tracking-[0.18em] text-accent">
                {item.step}
              </p>
              <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-foreground-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-background-secondary">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Settori serviti
              </h2>
              <p className="mt-3 text-foreground-muted">
                Partiamo da Lombardia e metalmeccanico, con attenzione a
                manifattura, artigianato e servizi fino a 20 addetti.
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: Cog, label: "Metalmeccanico" },
                  { icon: Workflow, label: "Manifattura" },
                  { icon: ShieldCheck, label: "Servizi B2B" },
                  { icon: LineChart, label: "Artigianato" },
                ].map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-3 text-sm font-medium"
                  >
                    <item.icon className="h-4 w-4 text-accent" />
                    {item.label}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8" variant="secondary">
                <Link href="/settori">Esplora i settori</Link>
              </Button>
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-background">
              <Image
                src="/marketing/settori-collage.png"
                alt="Precisione industriale, artigianato, progettazione digitale e lavorazioni metalmeccaniche"
                width={1024}
                height={576}
                className="h-auto w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 560px"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">
              Progetti realizzati
            </h2>
            <p className="mt-3 text-foreground-muted">
              Tre piattaforme digitali già online per imprese italiane.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/progetti">
              Vedi tutti i progetti
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-background-secondary">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">
              Tecnologia e innovazione
            </h2>
            <p className="mt-3 text-foreground-muted">
              Dashboard, gestionali, cataloghi tecnici, pianificazione e
              automazioni: strumenti concreti per officine, laboratori e imprese
              di servizi.
            </p>
          </div>
          <div className="mt-10 overflow-hidden rounded-xl border border-border bg-background">
            <Image
              src="/marketing/tecnologia-piattaforme.png"
              alt="Piattaforme digitali Articura: dashboard, cataloghi tecnici, pianificazione e automazioni"
              width={1024}
              height={576}
              className="h-auto w-full object-cover"
              sizes="(max-width: 1152px) 100vw, 1152px"
            />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/servizi/software-personalizzato">
                Software personalizzato
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/servizi/digitalizzazione">Digitalizzazione</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/servizi/automazioni-ai">Automazioni & AI</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="rounded-2xl border border-border bg-[linear-gradient(135deg,#0f172a,#1d4ed8)] px-6 py-12 text-white sm:px-10">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight">
            Pronto a trasformare un processo complesso in un vantaggio concreto?
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
            Raccontaci la tua impresa. Analizziamo insieme priorità, vincoli e
            opportunità prima di proporre qualsiasi soluzione.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-white text-foreground hover:bg-white/90"
            >
              <Link href="/richiedi-preventivo">Richiedi un confronto</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/contatti">Contatti</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
