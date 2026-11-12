"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { submitQuoteRequestAction } from "@/app/actions/quote-requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCents } from "@/lib/pricing/money";
import { calculateQuote, PricingError } from "@/lib/pricing/engine";
import type {
  CatalogSnapshot,
  ConfiguratorSelection,
} from "@/lib/pricing/types";

type Props = {
  catalog: CatalogSnapshot;
  previewMode?: boolean;
};

const COMPANY_SIZES = [
  { value: "1-5", label: "1–5 addetti" },
  { value: "6-10", label: "6–10 addetti" },
  { value: "11-20", label: "11–20 addetti" },
  { value: "21-50", label: "21–50 addetti" },
  { value: "50+", label: "Oltre 50" },
  { value: "non_so", label: "Non so" },
] as const;

const TIMELINES = [
  { value: "subito", label: "Il prima possibile" },
  { value: "1_3_mesi", label: "1–3 mesi" },
  { value: "3_6_mesi", label: "3–6 mesi" },
  { value: "oltre_6_mesi", label: "Oltre 6 mesi" },
  { value: "solo_informazioni", label: "Solo informazioni" },
] as const;

export function ServiceConfigurator({ catalog, previewMode = false }: Props) {
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<"service" | "package">("service");
  const [serviceId, setServiceId] = useState(catalog.services[0]?.id ?? "");
  const [packageId, setPackageId] = useState(catalog.packages[0]?.id ?? "");
  const [addonQty, setAddonQty] = useState<Record<string, number>>({});
  const [promoCode, setPromoCode] = useState("");
  const [contact, setContact] = useState({
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    contactRole: "",
    companyName: "",
    vatNumber: "",
    website: "",
    city: "",
    province: "",
    sector: "",
    companySize: "" as "" | (typeof COMPANY_SIZES)[number]["value"],
    timeline: "" as "" | (typeof TIMELINES)[number]["value"],
    currentTools: "",
    notes: "",
    privacyAccepted: false,
    marketingOptIn: false,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedAddons = useMemo(
    () =>
      Object.entries(addonQty)
        .filter(([, qty]) => qty > 0)
        .map(([addonId, quantity]) => ({ addonId, quantity })),
    [addonQty],
  );

  const selection: ConfiguratorSelection = useMemo(
    () => ({
      mode,
      serviceId: mode === "service" ? serviceId : undefined,
      packageId: mode === "package" ? packageId : undefined,
      addons: selectedAddons,
      promoCode: promoCode || null,
    }),
    [mode, serviceId, packageId, selectedAddons, promoCode],
  );

  const compatibleAddonIds = useMemo(() => {
    if (mode === "service") {
      return new Set(
        catalog.services.find((s) => s.id === serviceId)?.addonIds ?? [],
      );
    }
    const pkg = catalog.packages.find((p) => p.id === packageId);
    const ids = new Set<string>();
    for (const sid of pkg?.serviceIds ?? []) {
      const service = catalog.services.find((s) => s.id === sid);
      service?.addonIds.forEach((id) => ids.add(id));
    }
    return ids;
  }, [mode, serviceId, packageId, catalog]);

  const visibleAddons = catalog.addons.filter((addon) =>
    compatibleAddonIds.has(addon.id),
  );

  const pricing = useMemo(() => {
    try {
      if (mode === "service" && !serviceId) return null;
      if (mode === "package" && !packageId) return null;
      return calculateQuote(catalog, selection);
    } catch (err) {
      return err instanceof PricingError ? err : null;
    }
  }, [catalog, selection, mode, serviceId, packageId]);

  function toggleAddon(addonId: string, minQty: number) {
    setAddonQty((prev) => {
      const current = prev[addonId] ?? 0;
      if (current > 0) {
        const next = { ...prev };
        delete next[addonId];
        return next;
      }
      return { ...prev, [addonId]: minQty };
    });
  }

  function submit() {
    if (previewMode) {
      setMessage("Modalità anteprima: invio disabilitato.");
      return;
    }
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const result = await submitQuoteRequestAction({
        selection,
        contact: {
          ...contact,
          contactPhone: contact.contactPhone || null,
          contactRole: contact.contactRole || null,
          vatNumber: contact.vatNumber || null,
          website: contact.website || null,
          city: contact.city || null,
          province: contact.province || null,
          sector: contact.sector || null,
          companySize: contact.companySize || null,
          timeline: contact.timeline || null,
          currentTools: contact.currentTools || null,
          notes: contact.notes || null,
        },
      });
      if (!result.ok) {
        setError(result.error ?? "Invio non riuscito.");
        return;
      }
      setMessage(
        `Richiesta inviata (${result.requestNumber}). Ti ricontatteremo a breve.`,
      );
    });
  }

  if (catalog.services.length === 0 && catalog.packages.length === 0) {
    return (
      <div className="border border-dashed border-border bg-background-secondary/60 p-8 text-sm text-foreground-muted">
        Nessun servizio pubblicato. Configura e pubblica il listino dalla
        dashboard amministrativa.
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        {previewMode ? (
          <div className="border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
            Anteprima amministrativa — include bozze se caricate lato server.
          </div>
        ) : null}

        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === "service" ? "default" : "secondary"}
            onClick={() => setMode("service")}
          >
            Servizi
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "package" ? "default" : "secondary"}
            onClick={() => setMode("package")}
          >
            Pacchetti
          </Button>
        </div>

        {mode === "service" ? (
          <div className="grid gap-3">
            {catalog.services.map((service) => {
              const category = catalog.categories.find(
                (c) => c.id === service.categoryId,
              );
              const selected = serviceId === service.id;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setServiceId(service.id)}
                  className={`border p-4 text-left transition-colors ${
                    selected
                      ? "border-accent bg-accent-muted"
                      : "border-border bg-background hover:border-accent/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-foreground-muted">
                        {category?.name}
                      </p>
                      <h3 className="mt-1 font-display font-semibold">
                        {service.name}
                      </h3>
                      {service.description ? (
                        <p className="mt-2 text-sm text-foreground-muted">
                          {service.description}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-sm font-medium">
                      {formatCents(service.basePriceCents, {
                        kind: service.priceKind,
                      })}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-3">
            {catalog.packages.map((pkg) => {
              const selected = packageId === pkg.id;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setPackageId(pkg.id)}
                  className={`border p-4 text-left transition-colors ${
                    selected
                      ? "border-accent bg-accent-muted"
                      : "border-border bg-background hover:border-accent/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display font-semibold">{pkg.name}</h3>
                      {pkg.description ? (
                        <p className="mt-2 text-sm text-foreground-muted">
                          {pkg.description}
                        </p>
                      ) : null}
                      {pkg.features.length > 0 ? (
                        <ul className="mt-3 space-y-1 text-sm text-foreground-muted">
                          {pkg.features.map((feature) => (
                            <li key={feature}>• {feature}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-sm font-medium">
                      {formatCents(pkg.packagePriceCents, {
                        kind: pkg.priceKind,
                      })}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {visibleAddons.length > 0 ? (
          <div>
            <h3 className="font-display text-base font-semibold">
              Funzionalità aggiuntive
            </h3>
            <div className="mt-3 grid gap-2">
              {visibleAddons.map((addon) => {
                const qty = addonQty[addon.id] ?? 0;
                return (
                  <div
                    key={addon.id}
                    className="flex flex-wrap items-center justify-between gap-3 border border-border px-3 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{addon.name}</p>
                      <p className="text-xs text-foreground-muted">
                        {formatCents(addon.unitPriceCents, {
                          kind: addon.priceKind,
                        })}
                        {addon.recurringPriceCents != null
                          ? ` · canone ${formatCents(addon.recurringPriceCents)}/${addon.recurringPeriod === "yearly" ? "anno" : "mese"}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {addon.priceKind === "per_unit" && qty > 0 ? (
                        <Input
                          type="number"
                          min={addon.minQty}
                          max={addon.maxQty ?? undefined}
                          className="w-20"
                          value={qty}
                          onChange={(e) =>
                            setAddonQty((prev) => ({
                              ...prev,
                              [addon.id]: Number(e.target.value) || addon.minQty,
                            }))
                          }
                        />
                      ) : null}
                      <Button
                        type="button"
                        size="sm"
                        variant={qty > 0 ? "default" : "secondary"}
                        onClick={() => toggleAddon(addon.id, addon.minQty)}
                      >
                        {qty > 0 ? "Rimuovi" : "Aggiungi"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="promo">Codice sconto</Label>
          <Input
            id="promo"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Opzionale"
          />
        </div>
      </div>

      <aside className="h-fit border border-border bg-background p-5 lg:sticky lg:top-24">
        <h3 className="font-display text-base font-semibold">
          Stima preventivo
        </h3>
        {pricing instanceof PricingError ? (
          <p className="mt-3 text-sm text-destructive">{pricing.message}</p>
        ) : pricing ? (
          <div className="mt-4 space-y-3 text-sm">
            {pricing.lines
              .filter((line) => line.itemType !== "tax")
              .map((line, index) => (
                <div
                  key={`${line.refId}-${index}`}
                  className="flex items-start justify-between gap-3"
                >
                  <span className="text-foreground-muted">
                    {line.name}
                    {line.quantity > 1 ? ` ×${line.quantity}` : ""}
                  </span>
                  <span className="font-medium">
                    {formatCents(line.lineTotalCents, {
                      kind: line.priceKind,
                    })}
                  </span>
                </div>
              ))}
            <div className="border-t border-border pt-3">
              <div className="flex justify-between font-semibold">
                <span>Totale iniziale</span>
                <span>
                  {pricing.hasOnRequestItems && pricing.totalOneTimeCents === 0
                    ? "Su preventivo"
                    : formatCents(pricing.totalOneTimeCents)}
                </span>
              </div>
              {pricing.totalRecurringMonthlyCents > 0 ? (
                <div className="mt-2 flex justify-between text-foreground-muted">
                  <span>Canone mensile</span>
                  <span>{formatCents(pricing.totalRecurringMonthlyCents)}</span>
                </div>
              ) : null}
              {pricing.totalRecurringYearlyCents > 0 ? (
                <div className="mt-2 flex justify-between text-foreground-muted">
                  <span>Canone annuale</span>
                  <span>{formatCents(pricing.totalRecurringYearlyCents)}</span>
                </div>
              ) : null}
              {pricing.hasOnRequestItems ? (
                <p className="mt-3 text-xs text-foreground-muted">
                  Alcune voci sono “Su preventivo”: il totale definitivo sarà
                  confermato dal team Articura.
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-foreground-muted">
            Seleziona un servizio o un pacchetto.
          </p>
        )}

        <div className="mt-6 space-y-4 border-t border-border pt-4">
          <p className="font-display text-sm font-semibold tracking-wide">
            Dati per la richiesta
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nome e cognome *">
              <Input
                required
                value={contact.contactName}
                onChange={(e) =>
                  setContact((p) => ({ ...p, contactName: e.target.value }))
                }
              />
            </Field>
            <Field label="Ruolo">
              <Input
                value={contact.contactRole}
                onChange={(e) =>
                  setContact((p) => ({ ...p, contactRole: e.target.value }))
                }
                placeholder="Titolare, …"
              />
            </Field>
            <Field label="Email *" className="sm:col-span-2">
              <Input
                required
                type="email"
                value={contact.contactEmail}
                onChange={(e) =>
                  setContact((p) => ({ ...p, contactEmail: e.target.value }))
                }
              />
            </Field>
            <Field label="Telefono">
              <Input
                value={contact.contactPhone}
                onChange={(e) =>
                  setContact((p) => ({ ...p, contactPhone: e.target.value }))
                }
              />
            </Field>
            <Field label="Azienda *">
              <Input
                required
                value={contact.companyName}
                onChange={(e) =>
                  setContact((p) => ({ ...p, companyName: e.target.value }))
                }
              />
            </Field>
            <Field label="P. IVA">
              <Input
                value={contact.vatNumber}
                onChange={(e) =>
                  setContact((p) => ({ ...p, vatNumber: e.target.value }))
                }
              />
            </Field>
            <Field label="Settore">
              <Input
                value={contact.sector}
                onChange={(e) =>
                  setContact((p) => ({ ...p, sector: e.target.value }))
                }
              />
            </Field>
            <Field label="Dimensione">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={contact.companySize}
                onChange={(e) =>
                  setContact((p) => ({
                    ...p,
                    companySize: e.target
                      .value as (typeof contact)["companySize"],
                  }))
                }
              >
                <option value="">—</option>
                {COMPANY_SIZES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Comune">
              <Input
                value={contact.city}
                onChange={(e) =>
                  setContact((p) => ({ ...p, city: e.target.value }))
                }
              />
            </Field>
            <Field label="Provincia">
              <Input
                value={contact.province}
                onChange={(e) =>
                  setContact((p) => ({ ...p, province: e.target.value }))
                }
                maxLength={10}
              />
            </Field>
            <Field label="Sito web" className="sm:col-span-2">
              <Input
                value={contact.website}
                onChange={(e) =>
                  setContact((p) => ({ ...p, website: e.target.value }))
                }
                placeholder="https://"
              />
            </Field>
            <Field label="Tempistiche">
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={contact.timeline}
                onChange={(e) =>
                  setContact((p) => ({
                    ...p,
                    timeline: e.target.value as (typeof contact)["timeline"],
                  }))
                }
              >
                <option value="">—</option>
                {TIMELINES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Strumenti attuali">
              <Input
                value={contact.currentTools}
                onChange={(e) =>
                  setContact((p) => ({ ...p, currentTools: e.target.value }))
                }
                placeholder="Excel, gestionale, …"
              />
            </Field>
            <Field label="Note / esigenze" className="sm:col-span-2">
              <textarea
                className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={contact.notes}
                onChange={(e) =>
                  setContact((p) => ({ ...p, notes: e.target.value }))
                }
              />
            </Field>
          </div>

          <div className="space-y-3 text-xs text-foreground-muted">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={contact.privacyAccepted}
                onChange={(e) =>
                  setContact((p) => ({
                    ...p,
                    privacyAccepted: e.target.checked,
                  }))
                }
                required
              />
              <span>
                Accetto la{" "}
                <Link href="/privacy" className="text-accent hover:underline">
                  privacy policy
                </Link>{" "}
                per questa richiesta. *
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={contact.marketingOptIn}
                onChange={(e) =>
                  setContact((p) => ({
                    ...p,
                    marketingOptIn: e.target.checked,
                  }))
                }
              />
              <span>Consenso aggiornamenti commerciali (facoltativo).</span>
            </label>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-success">{message}</p> : null}
          <Button
            type="button"
            className="w-full"
            disabled={
              pending ||
              pricing instanceof PricingError ||
              !pricing ||
              !contact.privacyAccepted
            }
            onClick={submit}
          >
            {pending ? "Invio…" : "Invia richiesta preventivo"}
          </Button>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
