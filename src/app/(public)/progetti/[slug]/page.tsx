import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

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
      <section className="border-b border-border bg-background-secondary">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <Link
            href="/progetti"
            className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Tutti i progetti
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {project.type}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {project.name}
          </h1>
          <p className="mt-2 text-sm text-foreground-muted">{project.sector}</p>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground-muted">
            {project.summary}
          </p>
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
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <article className="rounded-xl border border-border bg-background p-6">
          <h2 className="text-lg font-semibold">Sfida</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
            {project.challenge}
          </p>
        </article>
        <article className="rounded-xl border border-border bg-background p-6">
          <h2 className="text-lg font-semibold">Soluzione</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
            {project.solution}
          </p>
        </article>
      </section>

      <section className="border-t border-border bg-background-secondary">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-lg font-semibold">Cosa abbiamo realizzato</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {project.deliverables.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-border bg-background px-4 py-5 text-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
