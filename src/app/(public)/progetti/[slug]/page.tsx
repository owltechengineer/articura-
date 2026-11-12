import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Button } from "@/components/ui/button";
import { PROJECTS, getProjectBySlug } from "@/lib/projects";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: project.name,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <>
      <PageHero
        eyebrow={project.type}
        title={project.name}
        description={project.summary}
      >
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/65">
          <span>{project.sector}</span>
          <Link
            href="/progetti"
            className="inline-flex items-center gap-2 text-white/75 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Tutti i progetti
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <a href={project.url} target="_blank" rel="noopener noreferrer">
              Visita il sito
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/richiedi-preventivo">Parliamo del tuo progetto</Link>
          </Button>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <SectionHeading title="Sfida" />
            <p className="mt-5 text-sm leading-relaxed text-foreground-muted sm:text-base">
              {project.challenge}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <SectionHeading title="Soluzione" />
            <p className="mt-5 text-sm leading-relaxed text-foreground-muted sm:text-base">
              {project.solution}
            </p>
          </Reveal>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          title="Cosa abbiamo realizzato"
          description="Deliverable concreti, misurabili sul progetto."
        />
        <ul className="mt-10 divide-y divide-border border-y border-border">
          {project.deliverables.map((item, index) => (
            <Reveal key={item} delay={index * 0.05} y={12}>
              <li className="grid gap-3 py-6 sm:grid-cols-[4rem_1fr]">
                <p className="font-display text-sm tracking-[0.18em] text-accent">
                  0{index + 1}
                </p>
                <p className="text-sm text-foreground-muted sm:text-base">
                  {item}
                </p>
              </li>
            </Reveal>
          ))}
        </ul>
      </Section>
    </>
  );
}
