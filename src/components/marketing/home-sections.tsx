"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Cog,
  LineChart,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Reveal } from "@/components/marketing/reveal";
import { ProjectCard } from "@/components/marketing/project-card";
import { Button } from "@/components/ui/button";
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

export function HomeSections() {
  const reduce = useReducedMotion();

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-[linear-gradient(180deg,#ffffff_0%,#f3f6fa_100%)]">
        <div className="public-grid-fade absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Problemi concreti delle microimprese
            </h2>
            <p className="mt-4 text-foreground-muted">
              Non vendiamo più tecnologia del necessario. Partiamo dai vincoli
              operativi reali.
            </p>
          </Reveal>

          <div className="mt-12 divide-y divide-border border-y border-border">
            {PROBLEMS.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.08} y={18}>
                <article className="grid gap-3 py-8 sm:grid-cols-[5rem_1fr] sm:gap-8">
                  <p className="font-display text-sm tracking-[0.2em] text-accent">
                    0{index + 1}
                  </p>
                  <div>
                    <h3 className="font-display text-xl font-semibold">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground-muted sm:text-base">
                      {item.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Le nostre soluzioni
            </h2>
            <p className="mt-4 text-foreground-muted">
              Quattro ambiti, un unico obiettivo: rendere più efficiente e
              competitiva la tua impresa.
            </p>
          </Reveal>

          <div className="mt-12 space-y-3">
            {SOLUTIONS.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.06} y={16}>
                <Link
                  href={item.href}
                  className="group flex items-center justify-between gap-6 border-l-2 border-transparent bg-background-secondary/60 px-5 py-6 transition-all duration-300 hover:border-accent hover:bg-background-secondary"
                >
                  <div>
                    <h3 className="font-display text-lg font-semibold transition-colors group-hover:text-accent sm:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm text-foreground-muted">
                      {item.description}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-foreground-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border bg-[#0b1220] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(37,99,235,0.45), transparent 35%), radial-gradient(circle at 80% 70%, rgba(148,163,184,0.2), transparent 40%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Metodo Articura
            </h2>
            <p className="mt-4 text-white/70">
              Analisi → Strategia → Sviluppo → Evoluzione.
            </p>
          </Reveal>

          <div className="relative mt-14">
            <motion.div
              className="absolute left-0 right-0 top-5 hidden h-px origin-left bg-white/20 lg:block"
              initial={reduce ? false : { scaleX: 0 }}
              whileInView={reduce ? undefined : { scaleX: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden
            />
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {METHOD.map((item, index) => (
                <Reveal key={item.step} delay={0.12 + index * 0.1} y={20}>
                  <div>
                    <div className="mb-5 flex items-center gap-3">
                      <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-[#0b1220] font-display text-xs tracking-[0.16em] text-accent">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-semibold">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/65">
                      {item.text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <Reveal>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Settori serviti
              </h2>
              <p className="mt-4 text-foreground-muted">
                Partiamo da Lombardia e metalmeccanico, con attenzione a
                manifattura, artigianato e servizi fino a 20 addetti.
              </p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
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
              <Button asChild className="mt-9" variant="secondary">
                <Link href="/settori">Esplora i settori</Link>
              </Button>
            </Reveal>

            <Reveal delay={0.12} className="overflow-hidden">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src="/marketing/settori-collage.png"
                  alt="Precisione industriale, artigianato, progettazione digitale e lavorazioni metalmeccaniche"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 560px"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-[linear-gradient(180deg,#f3f6fa_0%,#ffffff_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Progetti realizzati
              </h2>
              <p className="mt-4 text-foreground-muted">
                Tre piattaforme digitali già online per imprese italiane.
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link href="/progetti">
                Vedi tutti i progetti
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((project, index) => (
              <Reveal key={project.slug} delay={index * 0.08}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Tecnologia e innovazione
            </h2>
            <p className="mt-4 text-foreground-muted">
              Dashboard, gestionali, cataloghi tecnici, pianificazione e
              automazioni: strumenti concreti per officine, laboratori e imprese
              di servizi.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-10 overflow-hidden">
            <div className="relative aspect-[16/9]">
              <Image
                src="/marketing/tecnologia-piattaforme.png"
                alt="Piattaforme digitali Articura: dashboard, cataloghi tecnici, pianificazione e automazioni"
                fill
                className="object-cover"
                sizes="(max-width: 1152px) 100vw, 1152px"
              />
            </div>
          </Reveal>
          <Reveal delay={0.16} className="mt-8 flex flex-wrap gap-3">
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
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0b1220] text-white">
        <motion.div
          className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-accent/30 blur-3xl"
          animate={
            reduce
              ? undefined
              : { opacity: [0.25, 0.45, 0.25], scale: [1, 1.08, 1] }
          }
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Pronto a trasformare un processo complesso in un vantaggio
              concreto?
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/70">
              Raccontaci la tua impresa. Analizziamo insieme priorità, vincoli e
              opportunità prima di proporre qualsiasi soluzione.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-white text-[#0b1220] hover:bg-white/90"
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
          </Reveal>
        </div>
      </section>
    </>
  );
}
