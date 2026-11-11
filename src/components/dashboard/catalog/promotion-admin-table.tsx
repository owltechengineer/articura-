"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  softDeletePromotionAction,
  upsertPromotionAction,
} from "@/app/actions/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { centsToEuros } from "@/lib/pricing/money";
import type { CatalogPackage, CatalogPromotion } from "@/lib/pricing/types";

type Props = {
  promotions: CatalogPromotion[];
  packages: CatalogPackage[];
};

export function PromotionAdminTable({ promotions, packages }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "",
    name: "",
    kind: "percent" as "percent" | "fixed_amount" | "package_price",
    percentOff: "",
    amountOffEuros: "",
    packageId: "",
    promoPackagePriceEuros: "",
    startsAt: "",
    endsAt: "",
    isActive: true,
    stackable: false,
  });

  function openCreate() {
    setEditingId(undefined);
    setForm({
      code: "",
      name: "",
      kind: "percent",
      percentOff: "",
      amountOffEuros: "",
      packageId: packages[0]?.id ?? "",
      promoPackagePriceEuros: "",
      startsAt: "",
      endsAt: "",
      isActive: true,
      stackable: false,
    });
    setOpen(true);
  }

  function openEdit(promo: CatalogPromotion) {
    setEditingId(promo.id);
    setForm({
      code: promo.code ?? "",
      name: promo.name,
      kind: promo.kind,
      percentOff: promo.percentOff == null ? "" : String(promo.percentOff),
      amountOffEuros:
        promo.amountOffCents == null
          ? ""
          : String(centsToEuros(promo.amountOffCents)),
      packageId: promo.packageId ?? "",
      promoPackagePriceEuros:
        promo.promoPackagePriceCents == null
          ? ""
          : String(centsToEuros(promo.promoPackagePriceCents)),
      startsAt: promo.startsAt ?? "",
      endsAt: promo.endsAt ?? "",
      isActive: promo.isActive,
      stackable: promo.stackable,
    });
    setOpen(true);
  }

  function submit() {
    startTransition(async () => {
      const result = await upsertPromotionAction({
        id: editingId,
        code: form.code || null,
        name: form.name,
        kind: form.kind,
        percentOff: form.percentOff === "" ? null : Number(form.percentOff),
        amountOffEuros:
          form.amountOffEuros === "" ? null : Number(form.amountOffEuros),
        packageId: form.packageId || null,
        promoPackagePriceEuros:
          form.promoPackagePriceEuros === ""
            ? null
            : Number(form.promoPackagePriceEuros),
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
        isActive: form.isActive,
        stackable: form.stackable,
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
          <h2 className="text-lg font-semibold">Sconti e promozioni</h2>
          <p className="text-sm text-foreground-muted">
            Percentuale, importo fisso o prezzo promozionale pacchetto.
          </p>
        </div>
        <Button type="button" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nuova promozione
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-background-secondary text-foreground-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Nome</th>
              <th className="px-3 py-2 font-medium">Codice</th>
              <th className="px-3 py-2 font-medium">Tipo</th>
              <th className="px-3 py-2 font-medium">Attiva</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {promotions.map((promo) => (
              <tr key={promo.id} className="border-t border-border">
                <td className="px-3 py-3 font-medium">{promo.name}</td>
                <td className="px-3 py-3">{promo.code ?? "—"}</td>
                <td className="px-3 py-3">{promo.kind}</td>
                <td className="px-3 py-3">
                  <Badge variant={promo.isActive ? "success" : "secondary"}>
                    {promo.isActive ? "Attiva" : "Off"}
                  </Badge>
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(promo)}
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
                          await softDeletePromotionAction(promo.id);
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
              {editingId ? "Modifica promozione" : "Nuova promozione"}
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
                <Label>Codice (opzionale)</Label>
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, code: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  value={form.kind}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      kind: e.target.value as typeof form.kind,
                    }))
                  }
                >
                  <option value="percent">Sconto %</option>
                  <option value="fixed_amount">Sconto fisso</option>
                  <option value="package_price">Prezzo pacchetto</option>
                </select>
              </div>
              {form.kind === "percent" ? (
                <div className="space-y-2">
                  <Label>Percentuale</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.percentOff}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, percentOff: e.target.value }))
                    }
                  />
                </div>
              ) : null}
              {form.kind === "fixed_amount" ? (
                <div className="space-y-2">
                  <Label>Importo (€)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amountOffEuros}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        amountOffEuros: e.target.value,
                      }))
                    }
                  />
                </div>
              ) : null}
              {form.kind === "package_price" ? (
                <>
                  <div className="space-y-2">
                    <Label>Pacchetto</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                      value={form.packageId}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, packageId: e.target.value }))
                      }
                    >
                      {packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prezzo promo (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.promoPackagePriceEuros}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          promoPackagePriceEuros: e.target.value,
                        }))
                      }
                    />
                  </div>
                </>
              ) : null}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, isActive: e.target.checked }))
                  }
                />
                Attiva
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.stackable}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, stackable: e.target.checked }))
                  }
                />
                Cumulabile
              </label>
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
