import Link from "next/link";

import { Reveal } from "@/components/marketing/reveal";
import { Section, SectionHeading } from "@/components/marketing/section";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";

type ServiceDetailProps = {
  eyebrow: string;
  title: string;
  description: string;
  outcomes: string[];
  steps: { title: string; text: string }[];
  suitableFor: string[];
};

export function ServiceDetailPage({
  eyebrow,
  title,
  description,
  outcomes,
  steps,
  suitableFor,
}: ServiceDetailProps) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} description={description} />

      <Section>
        <SectionHeading
          title="Cosa ottieni"
          description="Risultati concreti, non feature da brochure."
        />
        <div className="mt-10 divide-y divide-border border-y border-border">
          {outcomes.map((item, index) => (
            <Reveal key={item} delay={index * 0.05} y={14}>
              <div className="grid gap-3 py-6 sm:grid-cols-[4rem_1fr]">
                <p className="font-display text-sm tracking-[0.18em] text-accent">
                  0{index + 1}
                </p>
                <p className="text-sm leading-relaxed text-foreground-muted sm:text-base">
                  {item}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="dark">
        <SectionHeading
          light
          title="Come procediamo"
          description="Un percorso lineare, con decisioni esplicite a ogni passo."
        />
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.08}>
              <p className="font-display text-xs tracking-[0.2em] text-white/45">
                0{index + 1}
              </p>
              <h3 className="mt-3 font-display text-lg font-semibold">
                {step.title}
              </h3>
              <p className="mt-3 text-sm text-white/65">{step.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div>
            <SectionHeading title="Per chi è pensato" />
            <ul className="mt-8 space-y-3">
              {suitableFor.map((item) => (
                <li
                  key={item}
                  className="border-l-2 border-accent/40 pl-4 text-sm text-foreground-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/richiedi-preventivo">Richiedi preventivo</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/servizi">Configura dal listino</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
