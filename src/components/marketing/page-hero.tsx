type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="border-b border-border bg-background-secondary">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground-muted">
          {description}
        </p>
      </div>
    </section>
  );
}
