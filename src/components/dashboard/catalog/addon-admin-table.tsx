"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { softDeleteAddonAction, upsertAddonAction } from "@/app/actions/catalog";
import { priceLabel, statusLabel } from "@/components/dashboard/catalog/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { centsToEuros } from "@/lib/pricing/money";
import type { CatalogAddon } from "@/lib/pricing/types";

type Props = { addons: CatalogAddon[] };

export function AddonAdminTable({ addons }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    slug: "",
    name: "",
    description: "",
    priceKind: "fixed" as "fixed" | "from" | "on_request" | "per_unit",
    unitPriceEuros: "",
    recurringPriceEuros: "",
    recurringPeriod: "one_time" as "one_time" | "monthly" | "yearly",
    minQty: "1",
    maxQty: "",
    status: "draft" as "draft" | "published",
    sortOrder: "0",
  });

  function openCreate() {
    setEditingId(undefined);
    setForm({
      slug: "",
      name: "",
      description: "",
      priceKind: "fixed",
      unitPriceEuros: "",
      recurringPriceEuros: "",
      recurringPeriod: "one_time",
      minQty: "1",
      maxQty: "",
      status: "draft",
      sortOrder: "0",
    });
    setOpen(true);
  }

  function openEdit(addon: CatalogAddon) {
    setEditingId(addon.id);
    setForm({
      slug: addon.slug,
      name: addon.name,
      description: addon.description ?? "",
      priceKind: addon.priceKind,
      unitPriceEuros:
        addon.unitPriceCents == null
          ? ""
          : String(centsToEuros(addon.unitPriceCents)),
      recurringPriceEuros:
        addon.recurringPriceCents == null
          ? ""
          : String(centsToEuros(addon.recurringPriceCents)),
      recurringPeriod: addon.recurringPeriod,
      minQty: String(addon.minQty),
      maxQty: addon.maxQty == null ? "" : String(addon.maxQty),
      status: addon.status,
      sortOrder: String(addon.sortOrder),
    });
    setOpen(true);
  }

  function submit() {
    startTransition(async () => {
      const result = await upsertAddonAction({
        id: editingId,
        slug: form.slug,
        name: form.name,
        description: form.description || null,
        priceKind: form.priceKind,
        unitPriceEuros:
          form.unitPriceEuros === "" ? null : Number(form.unitPriceEuros),
        recurringPriceEuros:
          form.recurringPriceEuros === ""
            ? null
            : Number(form.recurringPriceEuros),
        recurringPeriod: form.recurringPeriod,
        minQty: Number(form.minQty) || 1,
        maxQty: form.maxQty === "" ? null : Number(form.maxQty),
        dependsOnAddonIds: [],
        incompatibleAddonIds: [],
        status: form.status,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: true,
      });
      if (!result.ok) {
        setError(result.error ?? "Errore");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Opzioni aggiuntive</h2>
          <p className="text-sm text-foreground-muted">
            Funzionalità associabili ai servizi, con prezzo fisso, quantità o
            canone.
          </p>
        </div>
        <Button type="button" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nuova opzione
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-background-secondary text-foreground-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Nome</th>
              <th className="px-3 py-2 font-medium">Prezzo</th>
              <th className="px-3 py-2 font-medium">Stato</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {addons.map((addon) => (
              <tr key={addon.id} className="border-t border-border">
                <td className="px-3 py-3 font-medium">{addon.name}</td>
                <td className="px-3 py-3">
                  {priceLabel(addon.unitPriceCents, addon.priceKind)}
                </td>
                <td className="px-3 py-3">
                  <Badge
                    variant={
                      addon.status === "published" ? "success" : "secondary"
                    }
                  >
                    {statusLabel(addon.status)}
                  </Badge>
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(addon)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await softDeleteAddonAction(addon.id);
                          router.refresh();
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-background p-6">
            <h3 className="text-lg font-semibold">
              {editingId ? "Modifica opzione" : "Nuova opzione"}
            </h3>
            <div className="mt-4 grid gap-3">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, slug: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Tipo prezzo</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                    value={form.priceKind}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        priceKind: e.target.value as typeof form.priceKind,
                      }))
                    }
                  >
                    <option value="fixed">Fisso</option>
                    <option value="per_unit">Per quantità</option>
                    <option value="from">A partire da</option>
                    <option value="on_request">Da definire</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Prezzo (€)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.unitPriceEuros}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        unitPriceEuros: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Canone (€)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.recurringPriceEuros}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        recurringPriceEuros: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Periodo</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                    value={form.recurringPeriod}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        recurringPeriod: e.target
                          .value as typeof form.recurringPeriod,
                      }))
                    }
                  >
                    <option value="one_time">Nessuno</option>
                    <option value="monthly">Mensile</option>
                    <option value="yearly">Annuale</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Qty min</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.minQty}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, minQty: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Qty max</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.maxQty}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, maxQty: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Stato</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  value={form.status}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      status: e.target.value as typeof form.status,
                    }))
                  }
                >
                  <option value="draft">Bozza</option>
                  <option value="published">Pubblicato</option>
                </select>
              </div>
            </div>
            {error ? (
              <p className="mt-3 text-sm text-destructive">{error}</p>
            ) : null}
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                Annulla
              </Button>
              <Button type="button" disabled={pending} onClick={submit}>
                Salva
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
