import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KPI_KIND_LABELS } from "@/lib/kpi/format";
import type { KpiKind, KpiSnapshot } from "@/lib/kpi/types";

type Props = {
  snapshot: KpiSnapshot;
  compact?: boolean;
};

function kindVariant(
  kind: KpiKind,
): "default" | "secondary" | "outline" | "success" | "warning" {
  if (kind === "real") return "success";
  if (kind === "estimated") return "warning";
  if (kind === "target") return "default";
  return "secondary";
}

export function KpiDashboard({ snapshot, compact = false }: Props) {
  const sections = compact
    ? snapshot.sections.filter((s) => s.id !== "targets").map((section) => ({
        ...section,
        metrics: section.metrics.slice(0, 4),
      }))
    : snapshot.sections;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-background-secondary/40 p-3 text-sm text-foreground-muted">
        Ogni indicatore è etichettato come{" "}
        <strong className="text-foreground">Reale</strong>,{" "}
        <strong className="text-foreground">Stimato</strong>,{" "}
        <strong className="text-foreground">Obiettivo</strong> o{" "}
        <strong className="text-foreground">Non disponibile</strong>. Nessun
        dato dimostrativo.
      </div>

      {sections.map((section) => (
        <section key={section.id} className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold">{section.title}</h2>
            <p className="text-xs text-foreground-muted">{section.description}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {section.metrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardDescription>{metric.label}</CardDescription>
                    <Badge variant={kindVariant(metric.kind)}>
                      {KPI_KIND_LABELS[metric.kind]}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{metric.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-foreground-muted">{metric.hint}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
