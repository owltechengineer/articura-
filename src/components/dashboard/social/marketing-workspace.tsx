"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Upload } from "lucide-react";

import {
  softDeleteCampaignAction,
  softDeleteSocialContentAction,
  uploadSocialAttachmentAction,
  upsertCampaignAction,
  upsertSocialContentAction,
} from "@/app/actions/social";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addDays,
  formatDayLabel,
  formatMonthTitle,
  monthMatrix,
  sameDay,
  startOfWeek,
  toDateTimeLocalValue,
} from "@/lib/social/calendar";
import {
  SOCIAL_CONTENT_STATUSES,
  SOCIAL_CONTENT_TYPES,
  SOCIAL_PLATFORM_LABELS,
  SOCIAL_PLATFORMS,
  SOCIAL_STATUS_LABELS,
  SOCIAL_TYPE_LABELS,
  type MarketingCampaign,
  type SocialAttachment,
  type SocialContent,
  type SocialContentStatus,
  type SocialContentType,
  type SocialPlatform,
} from "@/lib/social/types";

type Props = {
  contents: SocialContent[];
  templates: SocialContent[];
  ideas: SocialContent[];
  campaigns: MarketingCampaign[];
  compact?: boolean;
};

type FormState = {
  title: string;
  description: string;
  body: string;
  platform: SocialPlatform;
  contentType: SocialContentType;
  status: SocialContentStatus;
  scheduledFor: string;
  publishedAt: string;
  campaignId: string;
  isTemplate: boolean;
  isIdeaArchive: boolean;
  notes: string;
  attachments: SocialAttachment[];
};

const emptyForm: FormState = {
  title: "",
  description: "",
  body: "",
  platform: "linkedin",
  contentType: "post",
  status: "idea",
  scheduledFor: "",
  publishedAt: "",
  campaignId: "",
  isTemplate: false,
  isIdeaArchive: false,
  notes: "",
  attachments: [],
};

type ViewMode = "month" | "week" | "list" | "archive";

export function MarketingWorkspace({
  contents,
  templates,
  ideas,
  campaigns,
  compact = false,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [view, setView] = useState<ViewMode>(compact ? "month" : "month");
  const [cursor, setCursor] = useState(() => new Date());
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [platformFilter, setPlatformFilter] = useState<SocialPlatform | "all">(
    "all",
  );

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const weeks = useMemo(() => monthMatrix(year, month), [year, month]);
  const weekStart = useMemo(() => startOfWeek(cursor), [cursor]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const filtered = useMemo(() => {
    return contents.filter((c) =>
      platformFilter === "all" ? true : c.platform === platformFilter,
    );
  }, [contents, platformFilter]);

  function contentsOnDay(day: Date) {
    return filtered.filter((c) => {
      if (!c.scheduledFor) return false;
      return sameDay(new Date(c.scheduledFor), day);
    });
  }

  function openCreate(day?: Date) {
    setEditingId(undefined);
    setForm({
      ...emptyForm,
      scheduledFor: day
        ? toDateTimeLocalValue(
            new Date(
              day.getFullYear(),
              day.getMonth(),
              day.getDate(),
              10,
              0,
            ).toISOString(),
          )
        : "",
      status: day ? "scheduled" : "idea",
    });
    setOpen(true);
    setError(null);
  }

  function openEdit(item: SocialContent) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description ?? "",
      body: item.body ?? "",
      platform: item.platform,
      contentType: item.contentType,
      status: item.status,
      scheduledFor: toDateTimeLocalValue(item.scheduledFor),
      publishedAt: toDateTimeLocalValue(item.publishedAt),
      campaignId: item.campaignId ?? "",
      isTemplate: item.isTemplate,
      isIdeaArchive: item.isIdeaArchive,
      notes: item.notes ?? "",
      attachments: item.attachments,
    });
    setOpen(true);
    setError(null);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await upsertSocialContentAction({
        id: editingId,
        title: form.title,
        description: form.description || null,
        body: form.body || null,
        platform: form.platform,
        contentType: form.contentType,
        status: form.status,
        scheduledFor: form.scheduledFor
          ? new Date(form.scheduledFor).toISOString()
          : null,
        publishedAt: form.publishedAt
          ? new Date(form.publishedAt).toISOString()
          : null,
        campaignId: form.campaignId || null,
        isTemplate: form.isTemplate,
        isIdeaArchive: form.isIdeaArchive,
        notes: form.notes || null,
        attachments: form.attachments,
      });
      if (!result.ok) {
        setError(result.error ?? "Errore");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  async function onUpload(file: File | null) {
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadSocialAttachmentAction(fd);
    if (!result.ok || !result.path) {
      setError(result.error ?? "Upload fallito");
      return;
    }
    setForm((f) => ({
      ...f,
      attachments: [
        ...f.attachments,
        {
          name: file.name,
          path: result.path!,
          mimeType: file.type || null,
          sizeBytes: file.size,
        },
      ],
    }));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-background-secondary/40 p-3 text-sm text-foreground-muted">
        Nessuna pubblicazione automatica: lo stato «Pubblicato» è solo
        registrazione manuale. API social non integrate finché non autorizzate.
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {(["month", "week", "list", "archive"] as ViewMode[]).map((mode) => (
            <Button
              key={mode}
              type="button"
              size="sm"
              variant={view === mode ? "secondary" : "ghost"}
              onClick={() => setView(mode)}
            >
              {mode === "month"
                ? "Mese"
                : mode === "week"
                  ? "Settimana"
                  : mode === "list"
                    ? "Elenco"
                    : "Idee/Template"}
            </Button>
          ))}
          <select
            className="h-8 rounded-md border border-border bg-background px-2 text-xs"
            value={platformFilter}
            onChange={(e) =>
              setPlatformFilter(e.target.value as SocialPlatform | "all")
            }
          >
            <option value="all">Tutte le piattaforme</option>
            {SOCIAL_PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {SOCIAL_PLATFORM_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          {(view === "month" || view === "week") && (
            <>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() =>
                  setCursor((d) =>
                    view === "month"
                      ? new Date(d.getFullYear(), d.getMonth() - 1, 1)
                      : addDays(d, -7),
                  )
                }
              >
                <ChevronLeft />
              </Button>
              <span className="min-w-36 text-center text-sm font-medium capitalize">
                {view === "month"
                  ? formatMonthTitle(year, month)
                  : `Sett. ${formatDayLabel(weekStart)}`}
              </span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() =>
                  setCursor((d) =>
                    view === "month"
                      ? new Date(d.getFullYear(), d.getMonth() + 1, 1)
                      : addDays(d, 7),
                  )
                }
              >
                <ChevronRight />
              </Button>
            </>
          )}
          <Button type="button" size="sm" onClick={() => openCreate()}>
            <Plus /> Contenuto
          </Button>
        </div>
      </div>

      {open ? (
        <div className="space-y-3 rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold">
            {editingId ? "Modifica contenuto" : "Nuovo contenuto"}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Titolo *">
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </Field>
            <Field label="Piattaforma">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={form.platform}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    platform: e.target.value as SocialPlatform,
                  }))
                }
              >
                {SOCIAL_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {SOCIAL_PLATFORM_LABELS[p]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tipologia">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={form.contentType}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    contentType: e.target.value as SocialContentType,
                  }))
                }
              >
                {SOCIAL_CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {SOCIAL_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Stato">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as SocialContentStatus,
                  }))
                }
              >
                {SOCIAL_CONTENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {SOCIAL_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Pubblicazione prevista">
              <Input
                type="datetime-local"
                value={form.scheduledFor}
                onChange={(e) =>
                  setForm((f) => ({ ...f, scheduledFor: e.target.value }))
                }
              />
            </Field>
            <Field label="Pubblicato il (manuale)">
              <Input
                type="datetime-local"
                value={form.publishedAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, publishedAt: e.target.value }))
                }
              />
            </Field>
            <Field label="Campagna commerciale">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={form.campaignId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, campaignId: e.target.value }))
                }
              >
                <option value="">—</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Allegati">
              <label className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-border px-3 text-sm">
                <Upload className="size-4" />
                Carica immagine/video
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/mp4,video/webm,video/quicktime"
                  onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
                />
              </label>
            </Field>
          </div>
          <Field label="Descrizione">
            <Input
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </Field>
          <Field label="Testo del post">
            <textarea
              className="min-h-28 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            />
          </Field>
          {form.attachments.length > 0 ? (
            <ul className="text-xs text-foreground-muted">
              {form.attachments.map((a) => (
                <li key={a.path}>
                  {a.name} → {a.path}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isTemplate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isTemplate: e.target.checked }))
                }
              />
              Salva come template
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isIdeaArchive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isIdeaArchive: e.target.checked }))
                }
              />
              Archivia come idea
            </label>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="button" disabled={pending} onClick={save}>
              Salva
            </Button>
          </div>
        </div>
      ) : null}

      {view === "month" ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <div className="grid min-w-[720px] grid-cols-7 border-b border-border bg-background-secondary text-center text-xs font-medium text-foreground-muted">
            {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((d) => (
              <div key={d} className="px-2 py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid min-w-[720px] grid-cols-7">
            {weeks.flat().map((day) => {
              const items = contentsOnDay(day);
              const inMonth = day.getMonth() === month;
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => openCreate(day)}
                  className={`min-h-24 border-b border-r border-border p-1.5 text-left align-top hover:bg-background-secondary/60 ${
                    inMonth ? "bg-background" : "bg-background-secondary/30"
                  }`}
                >
                  <div className="text-xs text-foreground-muted">
                    {day.getDate()}
                  </div>
                  <div className="mt-1 space-y-1">
                    {items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="truncate rounded bg-accent/10 px-1 py-0.5 text-[10px] text-accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(item);
                        }}
                      >
                        {SOCIAL_PLATFORM_LABELS[item.platform]} · {item.title}
                      </div>
                    ))}
                    {items.length > 3 ? (
                      <div className="text-[10px] text-foreground-muted">
                        +{items.length - 3}
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {view === "week" ? (
        <div className="grid gap-2 md:grid-cols-7">
          {weekDays.map((day) => {
            const items = contentsOnDay(day);
            return (
              <div
                key={day.toISOString()}
                className="rounded-lg border border-border p-2"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-medium">
                    {formatDayLabel(day)}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => openCreate(day)}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
                <div className="mt-2 space-y-2">
                  {items.length === 0 ? (
                    <p className="text-xs text-foreground-muted">—</p>
                  ) : (
                    items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="block w-full rounded-md border border-border p-2 text-left text-xs hover:border-accent"
                        onClick={() => openEdit(item)}
                      >
                        <div className="font-medium">{item.title}</div>
                        <div className="text-foreground-muted">
                          {SOCIAL_PLATFORM_LABELS[item.platform]} ·{" "}
                          {SOCIAL_STATUS_LABELS[item.status]}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {view === "list" ? (
        <ContentList
          items={filtered}
          campaigns={campaigns}
          pending={pending}
          onEdit={openEdit}
          onDelete={(id) =>
            startTransition(async () => {
              await softDeleteSocialContentAction(id);
              router.refresh();
            })
          }
        />
      ) : null}

      {view === "archive" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold">Archivio idee</h3>
            <ContentList
              items={ideas}
              campaigns={campaigns}
              pending={pending}
              onEdit={openEdit}
              onDelete={(id) =>
                startTransition(async () => {
                  await softDeleteSocialContentAction(id);
                  router.refresh();
                })
              }
            />
          </div>
          <div className="rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold">Template</h3>
            <ContentList
              items={templates}
              campaigns={campaigns}
              pending={pending}
              onEdit={openEdit}
              onDelete={(id) =>
                startTransition(async () => {
                  await softDeleteSocialContentAction(id);
                  router.refresh();
                })
              }
            />
          </div>
        </div>
      ) : null}

      {!compact ? (
        <div className="rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold">Campagne commerciali</h3>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Nome campagna"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              disabled={pending || campaignName.trim().length < 2}
              onClick={() =>
                startTransition(async () => {
                  const result = await upsertCampaignAction({
                    name: campaignName.trim(),
                    status: "active",
                  });
                  if (!result.ok) {
                    setError(result.error ?? "Errore campagna");
                    return;
                  }
                  setCampaignName("");
                  router.refresh();
                })
              }
            >
              Aggiungi campagna
            </Button>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {campaigns.length === 0 ? (
              <li className="text-foreground-muted">Nessuna campagna.</li>
            ) : (
              campaigns.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-2 border-t border-border pt-2"
                >
                  <span>
                    {c.name}{" "}
                    <Badge variant="secondary" className="ml-1">
                      {c.status}
                    </Badge>
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await softDeleteCampaignAction(c.id);
                        router.refresh();
                      })
                    }
                  >
                    Archivia
                  </Button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function ContentList({
  items,
  campaigns,
  pending,
  onEdit,
  onDelete,
}: {
  items: SocialContent[];
  campaigns: MarketingCampaign[];
  pending: boolean;
  onEdit: (item: SocialContent) => void;
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="mt-3 text-sm text-foreground-muted">Nessun contenuto.</p>
    );
  }
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item) => {
        const campaign = campaigns.find((c) => c.id === item.campaignId);
        return (
          <li
            key={item.id}
            className="flex flex-col gap-2 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{item.title}</span>
                <Badge variant="outline">
                  {SOCIAL_PLATFORM_LABELS[item.platform]}
                </Badge>
                <Badge variant="secondary">
                  {SOCIAL_STATUS_LABELS[item.status]}
                </Badge>
                <Badge variant="outline">
                  {SOCIAL_TYPE_LABELS[item.contentType]}
                </Badge>
              </div>
              <div className="mt-1 text-xs text-foreground-muted">
                {[
                  item.scheduledFor
                    ? `Previsto ${new Date(item.scheduledFor).toLocaleString("it-IT")}`
                    : null,
                  campaign?.name,
                  item.attachments.length
                    ? `${item.attachments.length} allegati`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => onEdit(item)}
              >
                Modifica
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => onDelete(item.id)}
              >
                Archivia
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
