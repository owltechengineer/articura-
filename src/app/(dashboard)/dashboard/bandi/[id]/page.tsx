import { notFound } from "next/navigation";

import { FundingDetail } from "@/components/dashboard/funding/funding-detail";
import { requireUser } from "@/lib/auth/session";
import {
  getFundingOpportunity,
  listFundingDocuments,
  listTasksForFunding,
} from "@/lib/funding/queries";

export const instant = false;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function FundingDetailPage({ params }: Props) {
  await requireUser("projects:read");
  const { id } = await params;

  const funding = await getFundingOpportunity(id);
  if (!funding) notFound();

  const [documents, tasks] = await Promise.all([
    listFundingDocuments(id),
    listTasksForFunding(id),
  ]);

  return (
    <FundingDetail funding={funding} documents={documents} tasks={tasks} />
  );
}
