export const APP_NAME = "ARTICURA";
export const APP_TAGLINE = "La tecnologia al servizio di chi crea valore.";
export const APP_DESCRIPTION =
  "Affianchiamo imprese artigiane e industriali nello sviluppo digitale. Progettiamo siti web, software e soluzioni su misura per trasformare processi complessi in opportunità concrete.";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const USER_ROLES = ["admin", "collaborator"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ORGANIZATION_STATUSES = [
  "prospect",
  "active_client",
  "former_client",
] as const;
export type OrganizationStatus = (typeof ORGANIZATION_STATUSES)[number];

export const OPPORTUNITY_STAGES = [
  "prospect_identified",
  "to_contact",
  "first_contact",
  "interest_shown",
  "needs_analysis",
  "quote_sent",
  "negotiation",
  "won",
  "lost",
] as const;
export type OpportunityStage = (typeof OPPORTUNITY_STAGES)[number];

export const PROJECT_STATUSES = [
  "to_plan",
  "analysis",
  "design",
  "development",
  "testing",
  "client_review",
  "delivered",
  "maintenance",
  "archived",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const QUOTE_STATUSES = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_STATUSES = [
  "todo",
  "in_progress",
  "blocked",
  "done",
  "cancelled",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const PUBLIC_NAV = [
  { href: "/servizi", label: "Servizi" },
  { href: "/settori", label: "Settori" },
  { href: "/progetti", label: "Progetti" },
  { href: "/chi-siamo", label: "Chi siamo" },
  { href: "/contatti", label: "Contatti" },
] as const;

export const DASHBOARD_NAV = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: "LayoutDashboard",
  },
  { href: "/dashboard/crm", label: "CRM", icon: "Target" },
  { href: "/dashboard/clienti", label: "Clienti", icon: "Building2" },
  { href: "/dashboard/progetti", label: "Progetti", icon: "FolderKanban" },
  { href: "/dashboard/preventivi", label: "Preventivi", icon: "FileText" },
  {
    href: "/dashboard/preventivi/configurazione",
    label: "Config. preventivi",
    icon: "Tags",
    adminOnly: true,
  },
  { href: "/dashboard/attivita", label: "Attività", icon: "CheckSquare" },
  {
    href: "/dashboard/strategia",
    label: "Strategia",
    icon: "Compass",
  },
  {
    href: "/dashboard/marketing",
    label: "Marketing",
    icon: "Megaphone",
  },
  { href: "/dashboard/calendario", label: "Calendario", icon: "Calendar" },
  {
    href: "/dashboard/bandi",
    label: "Bandi",
    icon: "Landmark",
  },
  { href: "/dashboard/finanze", label: "Finanze", icon: "Wallet" },
  { href: "/dashboard/documenti", label: "Documenti", icon: "Files" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "BarChart3" },
  {
    href: "/dashboard/impostazioni",
    label: "Impostazioni",
    icon: "Settings",
    adminOnly: true,
  },
] as const;
