import Link from "next/link";
import { Calendar } from "lucide-react";

import { MarketingWorkspace } from "@/components/dashboard/social/marketing-workspace";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/session";
import { listCampaigns, listSocialContents } from "@/lib/social/queries";

export const instant = false;

export default async function CalendarioPage() {
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
          description="Il calendario sarà disponibile dopo la configurazione del database."
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
          compact
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
          title="Schema calendario da aggiornare"
          description={`Esegui APPLY_NOW_social_phase_c.sql su Supabase. Dettaglio: ${message}`}
          action={
            <Button asChild size="sm" variant="secondary">
              <Link href="/dashboard/marketing">Apri Marketing</Link>
            </Button>
          }
        />
      </div>
    );
  }
}

function Header() {
  return (
    <div>
      <div className="flex items-center gap-2 text-accent">
        <Calendar className="size-5" />
        <span className="text-xs font-medium uppercase tracking-wide">
          Calendario
        </span>
      </div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Calendario editoriale
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-foreground-muted">
        Vista rapida dei contenuti social programmati. Gestione completa in{" "}
        <Link href="/dashboard/marketing" className="text-accent hover:underline">
          Marketing
        </Link>
        .
      </p>
    </div>
  );
}
