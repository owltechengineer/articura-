import { notFound } from "next/navigation";

import { ProspectDetail } from "@/components/dashboard/crm/prospect-detail";
import { requireUser } from "@/lib/auth/session";
import { getProspect, listInteractions } from "@/lib/crm/queries";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProspectDetailPage({ params }: Props) {
  await requireUser("crm:read");
  const { id } = await params;

  const prospect = await getProspect(id);
  if (!prospect) notFound();

  const interactions = await listInteractions(id);
  const supabase = await createClient();

  const [{ data: quotes }, { data: projects }] = await Promise.all([
    supabase
      .from("quote_requests")
      .select("id, request_number, status")
      .eq("organization_id", id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("projects")
      .select("id, name, status")
      .eq("organization_id", id)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <ProspectDetail
      prospect={prospect}
      interactions={interactions}
      linkedQuotes={quotes ?? []}
      linkedProjects={projects ?? []}
    />
  );
}
