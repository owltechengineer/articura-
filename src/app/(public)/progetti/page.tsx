import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/marketing/page-hero";
import { ProjectCard } from "@/components/marketing/project-card";
import { Reveal } from "@/components/marketing/reveal";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Button } from "@/components/ui/button";
import { PROJECTS } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Progetti",
  description:
    "Portfolio Articura: siti e piattaforme digitali realizzati per imprese artigiane e industriali.",
};

export default function ProgettiPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Progetti realizzati"
        description="Casi concreti di digitalizzazione: presenza web, cataloghi e piattaforme pensate sul business del cliente."
      />
      <Section tone="muted">
        <SectionHeading
          title="Lavori online, risultati misurabili"
          description="Ogni progetto parte da un problema operativo, non da una moda tecnologica."
        />
        <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project, index) => (
            <Reveal key={project.slug} delay={index * 0.08}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
        <div className="mt-14">
          <Button asChild>
            <Link href="/richiedi-preventivo">Vuoi un risultato simile?</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
