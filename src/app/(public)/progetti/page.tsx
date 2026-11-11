import type { Metadata } from "next";

import { PageHero } from "@/components/marketing/page-hero";
import { ProjectCard } from "@/components/marketing/project-card";
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
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
    </>
  );
}
