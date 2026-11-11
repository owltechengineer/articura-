import type { ProspectRecord, QualificationStatus, CommercialPriority } from "@/lib/crm/types";

type OrgRow = {
  id: string;
  legal_name: string;
  trade_name: string | null;
  vat_number: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  website_domain: string | null;
  sector: string | null;
  city: string | null;
  province: string | null;
  source: string | null;
  verified_at: string | null;
  company_size_estimate: string | null;
  qualification_status: QualificationStatus;
  interested_service: string | null;
  commercial_priority: CommercialPriority;
  follow_up_at: string | null;
  notes: string | null;
  status: "prospect" | "active_client" | "former_client";
  duplicate_group_id: string | null;
  created_at: string;
  updated_at: string;
};

export function mapOrganizationToProspect(row: OrgRow): ProspectRecord {
  return {
    id: row.id,
    legalName: row.legal_name,
    tradeName: row.trade_name,
    vatNumber: row.vat_number,
    email: row.email,
    phone: row.phone,
    website: row.website,
    websiteDomain: row.website_domain,
    sector: row.sector,
    city: row.city,
    province: row.province,
    source: row.source,
    verifiedAt: row.verified_at,
    companySizeEstimate: row.company_size_estimate,
    qualificationStatus: row.qualification_status,
    interestedService: row.interested_service,
    commercialPriority: row.commercial_priority,
    followUpAt: row.follow_up_at,
    notes: row.notes,
    status: row.status,
    duplicateGroupId: row.duplicate_group_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
