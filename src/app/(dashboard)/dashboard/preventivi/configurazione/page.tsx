import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { publishCatalogVersionAction } from "@/app/actions/catalog";
import { AddonAdminTable } from "@/components/dashboard/catalog/addon-admin-table";
import { PackageAdminTable } from "@/components/dashboard/catalog/package-admin-table";
import { PromotionAdminTable } from "@/components/dashboard/catalog/promotion-admin-table";
import { ServiceAdminTable } from "@/components/dashboard/catalog/service-admin-table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/session";
import { loadCatalogSnapshot } from "@/lib/pricing/catalog";

export const instant = false;

export default async function CatalogConfigPage() {
  await requireUser("settings:write");
  const catalog = await loadCatalogSnapshot({ includeDrafts: true });

  if (!catalog) {
    return (
      <EmptyState
        title="Collega Supabase per gestire il listino"
        description="Esegui APPLY_NOW_initial_schema.sql e APPLY_NOW_catalog_pricing.sql in Supabase, poi configura .env.local."
      />
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Configurazione Preventivi
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Listino versione {catalog.version}. Bozze non sono visibili nel
            configuratore pubblico finché non le pubblichi.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href="/servizi/anteprima" target="_blank">
              Anteprima configuratore
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
          <form action={publishCatalogVersionAction}>
            <Button type="submit" size="sm">
              Registra versione listino
            </Button>
          </form>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-background p-4 sm:p-6">
        <h2 className="text-lg font-semibold">Categorie</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.categories.map((category) => (
            <li
              key={category.id}
              className="rounded-md border border-border px-3 py-2 text-sm"
            >
              <span className="font-medium">{category.name}</span>
              <span className="mt-0.5 block text-xs text-foreground-muted">
                {category.slug}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-border bg-background p-4 sm:p-6">
        <ServiceAdminTable
          services={catalog.services}
          categories={catalog.categories}
          addons={catalog.addons}
        />
      </section>

      <section className="rounded-xl border border-border bg-background p-4 sm:p-6">
        <AddonAdminTable addons={catalog.addons} />
      </section>

      <section className="rounded-xl border border-border bg-background p-4 sm:p-6">
        <PackageAdminTable
          packages={catalog.packages}
          services={catalog.services}
        />
      </section>

      <section className="rounded-xl border border-border bg-background p-4 sm:p-6">
        <PromotionAdminTable
          promotions={catalog.promotions}
          packages={catalog.packages}
        />
      </section>
    </div>
  );
}
