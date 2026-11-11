export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "collaborator";
export type OrganizationStatus =
  | "prospect"
  | "active_client"
  | "former_client";
export type OpportunityStage =
  | "prospect_identified"
  | "to_contact"
  | "first_contact"
  | "interest_shown"
  | "needs_analysis"
  | "quote_sent"
  | "negotiation"
  | "won"
  | "lost";
export type ProjectStatus =
  | "to_plan"
  | "analysis"
  | "design"
  | "development"
  | "testing"
  | "client_review"
  | "delivered"
  | "maintenance"
  | "archived";
export type QuoteStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus =
  | "todo"
  | "in_progress"
  | "blocked"
  | "done"
  | "cancelled";
export type FinancialKind =
  | "revenue_projected"
  | "revenue_invoiced"
  | "revenue_collected"
  | "cost"
  | "recurring_expense";
export type DocumentCategory =
  | "contract"
  | "quote"
  | "brief"
  | "spec"
  | "client_material"
  | "project"
  | "other";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          legal_name: string;
          trade_name: string | null;
          vat_number: string | null;
          fiscal_code: string | null;
          email: string | null;
          phone: string | null;
          website: string | null;
          sector: string | null;
          address_line: string | null;
          city: string | null;
          province: string | null;
          postal_code: string | null;
          country: string;
          status: OrganizationStatus;
          notes: string | null;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          legal_name: string;
          trade_name?: string | null;
          vat_number?: string | null;
          fiscal_code?: string | null;
          email?: string | null;
          phone?: string | null;
          website?: string | null;
          sector?: string | null;
          address_line?: string | null;
          city?: string | null;
          province?: string | null;
          postal_code?: string | null;
          country?: string;
          status?: OrganizationStatus;
          notes?: string | null;
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          organization_id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          role_title: string | null;
          is_primary: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone?: string | null;
          role_title?: string | null;
          is_primary?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["contacts"]["Insert"]>;
        Relationships: [];
      };
      opportunities: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          stage: OpportunityStage;
          estimated_value: number | null;
          probability: number | null;
          expected_close_date: string | null;
          lost_reason: string | null;
          next_action: string | null;
          next_action_at: string | null;
          owner_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          stage?: OpportunityStage;
          estimated_value?: number | null;
          probability?: number | null;
          expected_close_date?: string | null;
          lost_reason?: string | null;
          next_action?: string | null;
          next_action_at?: string | null;
          owner_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["opportunities"]["Insert"]>;
        Relationships: [];
      };
      opportunity_activities: {
        Row: {
          id: string;
          opportunity_id: string;
          type: string;
          summary: string;
          occurred_at: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          opportunity_id: string;
          type: string;
          summary: string;
          occurred_at?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["opportunity_activities"]["Insert"]
        >;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          organization_id: string;
          opportunity_id: string | null;
          name: string;
          description: string | null;
          status: ProjectStatus;
          owner_id: string | null;
          budget: number | null;
          start_date: string | null;
          due_date: string | null;
          github_url: string | null;
          vercel_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          opportunity_id?: string | null;
          name: string;
          description?: string | null;
          status?: ProjectStatus;
          owner_id?: string | null;
          budget?: number | null;
          start_date?: string | null;
          due_date?: string | null;
          github_url?: string | null;
          vercel_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
        Relationships: [];
      };
      project_milestones: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          completed_at: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          completed_at?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["project_milestones"]["Insert"]
        >;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: TaskStatus;
          priority: TaskPriority;
          due_date: string | null;
          estimated_minutes: number | null;
          actual_minutes: number | null;
          assignee_id: string | null;
          organization_id: string | null;
          project_id: string | null;
          opportunity_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          due_date?: string | null;
          estimated_minutes?: number | null;
          actual_minutes?: number | null;
          assignee_id?: string | null;
          organization_id?: string | null;
          project_id?: string | null;
          opportunity_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
        Relationships: [];
      };
      time_entries: {
        Row: {
          id: string;
          project_id: string;
          task_id: string | null;
          user_id: string;
          minutes: number;
          work_date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          task_id?: string | null;
          user_id: string;
          minutes: number;
          work_date: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["time_entries"]["Insert"]>;
        Relationships: [];
      };
      quotes: {
        Row: {
          id: string;
          number: string;
          organization_id: string;
          opportunity_id: string | null;
          project_id: string | null;
          status: QuoteStatus;
          issue_date: string;
          valid_until: string | null;
          currency: string;
          tax_rate: number | null;
          discount_amount: number;
          subtotal: number;
          tax_amount: number;
          total: number;
          commercial_terms: string | null;
          notes: string | null;
          created_by: string | null;
          sent_at: string | null;
          accepted_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          number: string;
          organization_id: string;
          opportunity_id?: string | null;
          project_id?: string | null;
          status?: QuoteStatus;
          issue_date?: string;
          valid_until?: string | null;
          currency?: string;
          tax_rate?: number | null;
          discount_amount?: number;
          subtotal?: number;
          tax_amount?: number;
          total?: number;
          commercial_terms?: string | null;
          notes?: string | null;
          created_by?: string | null;
          sent_at?: string | null;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["quotes"]["Insert"]>;
        Relationships: [];
      };
      quote_items: {
        Row: {
          id: string;
          quote_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          discount_percent: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quote_id: string;
          description: string;
          quantity?: number;
          unit_price?: number;
          discount_percent?: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quote_items"]["Insert"]>;
        Relationships: [];
      };
      financial_transactions: {
        Row: {
          id: string;
          kind: FinancialKind;
          amount: number;
          currency: string;
          occurred_on: string;
          description: string | null;
          organization_id: string | null;
          project_id: string | null;
          quote_id: string | null;
          is_recurring: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          kind: FinancialKind;
          amount: number;
          currency?: string;
          occurred_on: string;
          description?: string | null;
          organization_id?: string | null;
          project_id?: string | null;
          quote_id?: string | null;
          is_recurring?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["financial_transactions"]["Insert"]
        >;
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          name: string;
          category: DocumentCategory;
          storage_path: string;
          mime_type: string | null;
          size_bytes: number | null;
          organization_id: string | null;
          project_id: string | null;
          quote_id: string | null;
          uploaded_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          category?: DocumentCategory;
          storage_path: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          organization_id?: string | null;
          project_id?: string | null;
          quote_id?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string | null;
          href: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body?: string | null;
          href?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
        Relationships: [];
      };
      app_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["app_settings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      organization_status: OrganizationStatus;
      opportunity_stage: OpportunityStage;
      project_status: ProjectStatus;
      quote_status: QuoteStatus;
      task_priority: TaskPriority;
      task_status: TaskStatus;
      financial_kind: FinancialKind;
      document_category: DocumentCategory;
    };
    CompositeTypes: Record<string, never>;
  };
};
