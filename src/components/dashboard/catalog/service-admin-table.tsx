"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";

import {
  duplicateServiceAction,
  softDeleteServiceAction,
  upsertServiceAction,
} from "@/app/actions/catalog";
import { priceLabel, statusLabel } from "@/components/dashboard/catalog/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CatalogAddon, CatalogCategory, CatalogService } from "@/lib/pricing/types";
import { centsToEuros } from "@/lib/pricing/money";

type Props = {
  services: CatalogService[];
  categories: CatalogCategory[];
  addons: CatalogAddon[];
};

type ServiceFormState = {
  categoryId: string;
  slug: string;
  name: string;
  description: string;
  featuresText: string;
  priceKind: "fixed" | "from" | "on_request";
  basePriceEuros: string;
  recurringPriceEuros: string;
  recurringPeriod: "one_time" | "monthly" | "yearly";
  isAvailableInConfigurator: boolean;
  status: "draft" | "published";
  sortOrder: string;
  isActive: boolean;
  addonIds: string[];
};

const emptyForm: ServiceFormState = {
  categoryId: "",
  slug: "",
  name: "",
  description: "",
  featuresText: "",
  priceKind: "on_request",
  basePriceEuros: "",
  recurringPriceEuros: "",
  recurringPeriod: "one_time",
  isAvailableInConfigurator: true,
  status: "draft",
  sortOrder: "0",
  isActive: true,
  addonIds: [],
};

export function ServiceAdminTable({ services, categories, addons }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form, setForm] = useState<ServiceFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setEditingId(undefined);
    setForm({
      ...emptyForm,
      categoryId: categories[0]?.id ?? "",
    });
    setError(null);
    setOpen(true);
  }

  function openEdit(service: CatalogService) {
    setEditingId(service.id);
    setForm({
      categoryId: service.categoryId,
      slug: service.slug,
      name: service.name,
      description: service.description ?? "",
      featuresText: service.features.join("\n"),
      priceKind: service.priceKind === "per_unit" ? "fixed" : service.priceKind,
      basePriceEuros:
        service.basePriceCents == null
          ? ""
          : String(centsToEuros(service.basePriceCents)),
      recurringPriceEuros:
        service.recurringPriceCents == null
          ? ""
          : String(centsToEuros(service.recurringPriceCents)),
      recurringPeriod: service.recurringPeriod,
      isAvailableInConfigurator: service.isAvailableInConfigurator,
      status: service.status,
      sortOrder: String(service.sortOrder),
      isActive: true,
      addonIds: service.addonIds,
    });
    setError(null);
    setOpen(true);
  }

  function submit() {
    startTransition(async () => {
      const result = await upsertServiceAction({
        id: editingId,
        categoryId: form.categoryId,
        slug: form.slug,
        name: form.name,
        description: form.description || null,
        features: form.featuresText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        priceKind: form.priceKind,
        basePriceEuros:
          form.basePriceEuros === "" ? null : Number(form.basePriceEuros),
        recurringPriceEuros:
          form.recurringPriceEuros === ""
            ? null
            : Number(form.recurringPriceEuros),
        recurringPeriod: form.recurringPeriod,
        isAvailableInConfigurator: form.isAvailableInConfigurator,
        status: form.status,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
        addonIds: form.addonIds,
      });
      if (!result.ok) {
        setError(result.error ?? "Errore salvataggio");
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
          <h2 className="text-lg font-semibold">Servizi</h2>
          <p className="text-sm text-foreground-muted">
            Listino servizi: bozza/pubblicato, prezzi e disponibilità nel
            configuratore.
          </p>
        </div>
        <Button type="button" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nuovo servizio
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-background-secondary text-foreground-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Nome</th>
              <th className="px-3 py-2 font-medium">Categoria</th>
              <th className="px-3 py-2 font-medium">Prezzo</th>
              <th className="px-3 py-2 font-medium">Stato</th>
              <th className="px-3 py-2 font-medium">Ordine</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-foreground-muted"
                >
                  Nessun servizio. Crea il primo dal pulsante sopra.
                </td>
              </tr>
            ) : (
              services.map((service) => {
                const category = categories.find(
                  (item) => item.id === service.categoryId,
                );
                return (
                  <tr key={service.id} className="border-t border-border">
                    <td className="px-3 py-3">
                      <div className="font-medium">{service.name}</div>
                      <div className="text-xs text-foreground-muted">
                        {service.slug}
                      </div>
                    </td>
                    <td className="px-3 py-3">{category?.name ?? "—"}</td>
                    <td className="px-3 py-3">
                      {priceLabel(service.basePriceCents, service.priceKind)}
                    </td>
                    <td className="px-3 py-3">
                      <Badge
                        variant={
                          service.status === "published" ? "success" : "secondary"
                        }
                      >
                        {statusLabel(service.status)}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">{service.sortOrder}</td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Modifica"
                          onClick={() => openEdit(service)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Duplica"
                          disabled={pending}
                          onClick={() =>
                            startTransition(async () => {
                              await duplicateServiceAction(service.id);
                              router.refresh();
                            })
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Disattiva"
                          disabled={pending}
                          onClick={() =>
                            startTransition(async () => {
                              await softDeleteServiceAction(service.id);
                              router.refresh();
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-background p-6 shadow-[var(--shadow-md)]">
            <h3 className="text-lg font-semibold">
              {editingId ? "Modifica servizio" : "Nuovo servizio"}
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, slug: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  value={form.categoryId}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      categoryId: event.target.value,
                    }))
                  }
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceKind">Tipo prezzo</Label>
                <select
                  id="priceKind"
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  value={form.priceKind}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      priceKind: event.target.value as typeof form.priceKind,
                    }))
                  }
                >
                  <option value="fixed">Fisso</option>
                  <option value="from">A partire da</option>
                  <option value="on_request">Su richiesta</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="basePrice">Prezzo base (€)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.basePriceEuros}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      basePriceEuros: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recurring">Canone (€)</Label>
                <Input
                  id="recurring"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.recurringPriceEuros}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      recurringPriceEuros: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period">Periodo canone</Label>
                <select
                  id="period"
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  value={form.recurringPeriod}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      recurringPeriod: event.target
                        .value as typeof form.recurringPeriod,
                    }))
                  }
                >
                  <option value="one_time">Nessuno</option>
                  <option value="monthly">Mensile</option>
                  <option value="yearly">Annuale</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Stato</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      status: event.target.value as typeof form.status,
                    }))
                  }
                >
                  <option value="draft">Bozza</option>
                  <option value="published">Pubblicato</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort">Ordine</Label>
                <Input
                  id="sort"
                  type="number"
                  value={form.sortOrder}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      sortOrder: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Descrizione</Label>
                <textarea
                  id="description"
                  className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="features">Funzionalità (una per riga)</Label>
                <textarea
                  id="features"
                  className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={form.featuresText}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      featuresText: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Opzioni associate</Label>
                <div className="grid max-h-40 gap-2 overflow-y-auto rounded-md border border-border p-3 sm:grid-cols-2">
                  {addons.map((addon) => {
                    const checked = form.addonIds.includes(addon.id);
                    return (
                      <label
                        key={addon.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            setForm((prev) => ({
                              ...prev,
                              addonIds: event.target.checked
                                ? [...prev.addonIds, addon.id]
                                : prev.addonIds.filter((id) => id !== addon.id),
                            }));
                          }}
                        />
                        {addon.name}
                      </label>
                    );
                  })}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isAvailableInConfigurator}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      isAvailableInConfigurator: event.target.checked,
                    }))
                  }
                />
                Disponibile nel configuratore pubblico
              </label>
            </div>

            {error ? (
              <p className="mt-4 text-sm text-destructive">{error}</p>
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
                {pending ? "Salvataggio…" : "Salva"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
