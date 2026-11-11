"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  softDeletePackageAction,
  upsertPackageAction,
} from "@/app/actions/catalog";
import { priceLabel, statusLabel } from "@/components/dashboard/catalog/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { centsToEuros } from "@/lib/pricing/money";
import type { CatalogPackage, CatalogService } from "@/lib/pricing/types";

type Props = {
  packages: CatalogPackage[];
  services: CatalogService[];
};

export function PackageAdminTable({ packages, services }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    slug: "",
    name: "",
    description: "",
    featuresText: "",
    priceKind: "fixed" as "fixed" | "from" | "on_request",
    packagePriceEuros: "",
    recurringPriceEuros: "",
    recurringPeriod: "one_time" as "one_time" | "monthly" | "yearly",
    status: "draft" as "draft" | "published",
    sortOrder: "0",
    isAvailableInConfigurator: true,
    serviceIds: [] as string[],
  });

  function openCreate() {
    setEditingId(undefined);
    setForm({
      slug: "",
      name: "",
      description: "",
      featuresText: "",
      priceKind: "fixed",
      packagePriceEuros: "",
      recurringPriceEuros: "",
      recurringPeriod: "one_time",
      status: "draft",
      sortOrder: "0",
      isAvailableInConfigurator: true,
      serviceIds: [],
    });
    setOpen(true);
  }

  function openEdit(pkg: CatalogPackage) {
    setEditingId(pkg.id);
    setForm({
      slug: pkg.slug,
      name: pkg.name,
      description: pkg.description ?? "",
      featuresText: pkg.features.join("\n"),
      priceKind: pkg.priceKind === "per_unit" ? "fixed" : pkg.priceKind,
      packagePriceEuros:
        pkg.packagePriceCents == null
          ? ""
          : String(centsToEuros(pkg.packagePriceCents)),
      recurringPriceEuros:
        pkg.recurringPriceCents == null
          ? ""
          : String(centsToEuros(pkg.recurringPriceCents)),
      recurringPeriod: pkg.recurringPeriod,
      status: pkg.status,
      sortOrder: String(pkg.sortOrder),
      isAvailableInConfigurator: pkg.isAvailableInConfigurator,
      serviceIds: pkg.serviceIds,
    });
    setOpen(true);
  }

  function submit() {
    startTransition(async () => {
      const result = await upsertPackageAction({
        id: editingId,
        slug: form.slug,
        name: form.name,
        description: form.description || null,
        features: form.featuresText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        priceKind: form.priceKind,
        packagePriceEuros:
          form.packagePriceEuros === ""
            ? null
            : Number(form.packagePriceEuros),
        recurringPriceEuros:
          form.recurringPriceEuros === ""
            ? null
            : Number(form.recurringPriceEuros),
        recurringPeriod: form.recurringPeriod,
        status: form.status,
        sortOrder: Number(form.sortOrder) || 0,
        isAvailableInConfigurator: form.isAvailableInConfigurator,
        isActive: true,
        serviceIds: form.serviceIds,
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
          <h2 className="text-lg font-semibold">Pacchetti</h2>
          <p className="text-sm text-foreground-muted">
            Prezzo pacchetto indipendente dalla somma dei servizi inclusi.
          </p>
        </div>
        <Button type="button" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nuovo pacchetto
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-background-secondary text-foreground-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Nome</th>
              <th className="px-3 py-2 font-medium">Prezzo</th>
              <th className="px-3 py-2 font-medium">Servizi</th>
              <th className="px-3 py-2 font-medium">Stato</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id} className="border-t border-border">
                <td className="px-3 py-3 font-medium">{pkg.name}</td>
                <td className="px-3 py-3">
                  {priceLabel(pkg.packagePriceCents, pkg.priceKind)}
                </td>
                <td className="px-3 py-3">{pkg.serviceIds.length}</td>
                <td className="px-3 py-3">
                  <Badge
                    variant={
                      pkg.status === "published" ? "success" : "secondary"
                    }
                  >
                    {statusLabel(pkg.status)}
                  </Badge>
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(pkg)}
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
                          await softDeletePackageAction(pkg.id);
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
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-background p-6">
            <h3 className="text-lg font-semibold">
              {editingId ? "Modifica pacchetto" : "Nuovo pacchetto"}
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
                    <option value="from">A partire da</option>
                    <option value="on_request">Su richiesta</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Prezzo pacchetto (€)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.packagePriceEuros}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        packagePriceEuros: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Caratteristiche (una per riga)</Label>
                <textarea
                  className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={form.featuresText}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, featuresText: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Servizi inclusi</Label>
                <div className="grid max-h-40 gap-2 overflow-y-auto rounded-md border border-border p-3">
                  {services.map((service) => (
                    <label
                      key={service.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={form.serviceIds.includes(service.id)}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            serviceIds: e.target.checked
                              ? [...p.serviceIds, service.id]
                              : p.serviceIds.filter((id) => id !== service.id),
                          }))
                        }
                      />
                      {service.name}
                    </label>
                  ))}
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
