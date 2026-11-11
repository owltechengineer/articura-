import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

type ProjectCardProps = {
  project: Project;
  className?: string;
};

export function ProjectCard({ project, className }: ProjectCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-xl border border-border bg-background p-6 transition-colors hover:border-accent/40",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">
            {project.type}
          </p>
          <h3 className="mt-3 text-xl font-semibold tracking-tight">
            {project.name}
          </h3>
          <p className="mt-1 text-sm text-foreground-muted">{project.sector}</p>
        </div>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground-muted transition-colors hover:border-accent hover:text-accent"
          aria-label={`Apri ${project.name}`}
        >
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground-muted">
        {project.summary}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.deliverables.slice(0, 3).map((item) => (
          <span
            key={item}
            className="rounded-md border border-border bg-background-secondary px-2.5 py-1 text-xs text-foreground-muted"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4 text-sm">
        <Link
          href={`/progetti/${project.slug}`}
          className="font-medium text-foreground transition-colors hover:text-accent"
        >
          Case study
        </Link>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground-muted transition-colors hover:text-foreground"
        >
          {project.url.replace(/^https?:\/\//, "")}
        </a>
      </div>
    </article>
  );
}
