import { Megaphone } from "lucide-react";

import { MarketingWorkspace } from "@/components/dashboard/social/marketing-workspace";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/session";
import { listCampaigns, listSocialContents } from "@/lib/social/queries";

export const instant = false;

export default async function MarketingPage() {
  await requireUser("documents:read");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState
          title="Collega Supabase"
          description="Il piano editoriale sarà disponibile dopo la configurazione del database."
        />
      </div>
    );
  }

  try {
    const [contents, templates, ideas, campaigns] = await Promise.all([
      listSocialContents(),
      listSocialContents({ templatesOnly: true }),
      listSocialContents({ ideasOnly: true }),
      listCampaigns(),
    ]);

    return (
      <div className="space-y-6">
        <Header />
        <MarketingWorkspace
          contents={contents}
          templates={templates}
          ideas={ideas}
          campaigns={campaigns}
        />
      </div>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore di caricamento";
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState
          title="Schema marketing da aggiornare"
          description={`Esegui APPLY_NOW_social_phase_c.sql su Supabase. Dettaglio: ${message}`}
        />
      </div>
    );
  }
}

function Header() {
  return (
    <div>
      <div className="flex items-center gap-2 text-accent">
        <Megaphone className="size-5" />
        <span className="text-xs font-medium uppercase tracking-wide">
          Marketing · Fase C
        </span>
      </div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Piano editoriale
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-foreground-muted">
        Calendario mensile/settimanale, contenuti social, campagne, idee e
        template. Nessuna pubblicazione automatica.
      </p>
    </div>
  );
}
