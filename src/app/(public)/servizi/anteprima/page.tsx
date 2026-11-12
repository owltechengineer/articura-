import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/marketing/section";
import { ServiceConfigurator } from "@/components/marketing/service-configurator";
import { EmptyState } from "@/components/ui/empty-state";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { loadCatalogSnapshot } from "@/lib/pricing/catalog";

export const metadata: Metadata = {
  title: "Anteprima configuratore",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function ConfiguratorPreviewPage() {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, "settings:write")) {
    redirect("/login?next=/servizi/anteprima");
  }

  const catalog = await loadCatalogSnapshot({ includeDrafts: true });

  return (
    <>
      <PageHero
        eyebrow="Admin"
        title="Anteprima configuratore"
        description="Vista amministrativa del listino, comprese le bozze non ancora pubblicate."
      />
      <Section tone="muted">
        {!catalog ? (
          <EmptyState
            title="Catalogo non disponibile"
            description="Verifica la connessione Supabase e la migrazione del listino."
          />
        ) : (
          <ServiceConfigurator catalog={catalog} previewMode />
        )}
      </Section>
    </>
  );
}
