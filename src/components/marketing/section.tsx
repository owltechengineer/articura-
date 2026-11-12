import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  tone = "light",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "light" | "muted" | "dark";
}) {
  return (
    <section
      className={cn(
        "border-b border-border",
        tone === "light" && "bg-white",
        tone === "muted" &&
          "bg-[linear-gradient(180deg,#ffffff_0%,#f3f6fa_100%)]",
        tone === "dark" && "bg-[#0b1220] text-white",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p
          className={cn(
            "font-display text-xs font-semibold uppercase tracking-[0.22em]",
            light ? "text-white/55" : "text-accent",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl",
          light ? "text-white" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed",
            light ? "text-white/70" : "text-foreground-muted",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
