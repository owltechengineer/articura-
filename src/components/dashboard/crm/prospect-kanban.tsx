"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { updateProspectStatusAction } from "@/app/actions/crm";
import {
  formatDateIT,
  priorityLabel,
  qualificationLabel,
} from "@/components/dashboard/crm/format";
import { Badge } from "@/components/ui/badge";
import {
  QUALIFICATION_STATUSES,
  type ProspectRecord,
  type QualificationStatus,
} from "@/lib/crm/types";

type Props = {
  prospects: ProspectRecord[];
};

export function ProspectKanban({ prospects }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function move(id: string, status: QualificationStatus) {
    startTransition(async () => {
      await updateProspectStatusAction(id, status);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {QUALIFICATION_STATUSES.map((status) => {
        const cards = prospects.filter((p) => p.qualificationStatus === status);
        return (
          <div
            key={status}
            className="w-64 shrink-0 rounded-lg border border-border bg-background-secondary/40"
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-xs font-medium">
                {qualificationLabel(status)}
              </span>
              <Badge variant="secondary">{cards.length}</Badge>
            </div>
            <div className="space-y-2 p-2">
              {cards.map((p) => (
                <div
                  key={p.id}
                  className="rounded-md border border-border bg-background p-2.5 shadow-sm"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/prospect-id", p.id);
                  }}
                >
                  <Link
                    href={`/dashboard/crm/${p.id}`}
                    className="text-sm font-medium hover:text-accent"
                  >
                    {p.legalName}
                  </Link>
                  <div className="mt-1 text-xs text-foreground-muted">
                    {[p.city, p.sector].filter(Boolean).join(" · ") || "—"}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    <Badge variant="outline">{priorityLabel(p.commercialPriority)}</Badge>
                    {p.followUpAt ? (
                      <span className="text-[11px] text-foreground-muted">
                        Follow-up {formatDateIT(p.followUpAt)}
                      </span>
                    ) : null}
                  </div>
                  {p.duplicateGroupId ? (
                    <p className="mt-1 text-[11px] text-warning">
                      Da rivedere (duplicato)
                    </p>
                  ) : null}
                </div>
              ))}
              <div
                className="min-h-8 rounded-md border border-dashed border-border/80"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/prospect-id");
                  if (id && !pending) move(id, status);
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
