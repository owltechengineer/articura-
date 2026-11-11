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
export type QualificationStatus =
  | "new"
  | "to_verify"
  | "qualified"
  | "contacted"
  | "interested"
  | "demo_scheduled"
  | "quote_sent"
  | "won_client"
  | "not_interested";
export type CommercialPriority = "low" | "medium" | "high" | "urgent";
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
export type GrowthPhase =
  | "preparation_sales"
  | "commercial_validation"
  | "saas_standardization"
  | "controlled_growth";
export type ObjectiveHorizon = "annual" | "quarterly";
export type ObjectiveMetric =
  | "qualified_prospects"
  | "paying_clients"
  | "standardized_products"
  | "mrr_eur"
  | "custom";
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
export type SocialPlatform =
  | "linkedin"
  | "instagram"
  | "facebook"
  | "tiktok";
export type SocialContentStatus =
  | "idea"
  | "to_produce"
  | "in_review"
  | "scheduled"
  | "published";
export type SocialContentType = "reel" | "carousel" | "post" | "case_study";
export type FundingStatus =
  | "to_verify"
  | "to_evaluate"
  | "eligibility_check"
  | "in_preparation"
  | "submitted"
  | "approved"
  | "rejected"
  | "closed";

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
          website_domain: string | null;
          sector: string | null;
          address_line: string | null;
          city: string | null;
          province: string | null;
          postal_code: string | null;
          country: string;
          status: OrganizationStatus;
          source: string | null;
          verified_at: string | null;
          company_size_estimate: string | null;
          qualification_status: QualificationStatus;
          interested_service: string | null;
          commercial_priority: CommercialPriority;
          follow_up_at: string | null;
          duplicate_group_id: string | null;
          duplicate_reviewed_at: string | null;
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
          website_domain?: string | null;
          sector?: string | null;
          address_line?: string | null;
          city?: string | null;
          province?: string | null;
          postal_code?: string | null;
          country?: string;
          status?: OrganizationStatus;
          source?: string | null;
          verified_at?: string | null;
          company_size_estimate?: string | null;
          qualification_status?: QualificationStatus;
          interested_service?: string | null;
          commercial_priority?: CommercialPriority;
          follow_up_at?: string | null;
          duplicate_group_id?: string | null;
          duplicate_reviewed_at?: string | null;
          notes?: string | null;
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
        Relationships: [];
      };
      organization_interactions: {
        Row: {
          id: string;
          organization_id: string;
          type: string;
          summary: string;
          occurred_at: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          type?: string;
          summary: string;
          occurred_at?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["organization_interactions"]["Insert"]
        >;
        Relationships: [];
      };
      marketing_campaigns: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          starts_on: string | null;
          ends_on: string | null;
          status: "draft" | "active" | "completed" | "archived";
          owner_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          starts_on?: string | null;
          ends_on?: string | null;
          status?: "draft" | "active" | "completed" | "archived";
          owner_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["marketing_campaigns"]["Insert"]
        >;
        Relationships: [];
      };
      social_contents: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          body: string | null;
          platform: SocialPlatform;
          content_type: SocialContentType;
          status: SocialContentStatus;
          scheduled_for: string | null;
          published_at: string | null;
          campaign_id: string | null;
          organization_id: string | null;
          objective_id: string | null;
          is_template: boolean;
          is_idea_archive: boolean;
          attachments: Json;
          notes: string | null;
          created_by: string | null;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          body?: string | null;
          platform: SocialPlatform;
          content_type?: SocialContentType;
          status?: SocialContentStatus;
          scheduled_for?: string | null;
          published_at?: string | null;
          campaign_id?: string | null;
          organization_id?: string | null;
          objective_id?: string | null;
          is_template?: boolean;
          is_idea_archive?: boolean;
          attachments?: Json;
          notes?: string | null;
          created_by?: string | null;
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["social_contents"]["Insert"]
        >;
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
      strategic_objectives: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          horizon: ObjectiveHorizon;
          year: number;
          quarter: number | null;
          growth_phase: GrowthPhase;
          metric: ObjectiveMetric;
          target_value: number | null;
          target_min: number | null;
          target_max: number | null;
          unit: string | null;
          is_target_only: boolean;
          status: TaskStatus;
          progress_percent: number;
          owner_id: string | null;
          project_id: string | null;
          sort_order: number;
          starts_on: string | null;
          due_on: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          horizon?: ObjectiveHorizon;
          year: number;
          quarter?: number | null;
          growth_phase?: GrowthPhase;
          metric?: ObjectiveMetric;
          target_value?: number | null;
          target_min?: number | null;
          target_max?: number | null;
          unit?: string | null;
          is_target_only?: boolean;
          status?: TaskStatus;
          progress_percent?: number;
          owner_id?: string | null;
          project_id?: string | null;
          sort_order?: number;
          starts_on?: string | null;
          due_on?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["strategic_objectives"]["Insert"]
        >;
        Relationships: [];
      };
      strategic_milestones: {
        Row: {
          id: string;
          objective_id: string;
          title: string;
          description: string | null;
          growth_phase: GrowthPhase | null;
          status: TaskStatus;
          progress_percent: number;
          owner_id: string | null;
          project_id: string | null;
          starts_on: string | null;
          due_on: string | null;
          completed_at: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          objective_id: string;
          title: string;
          description?: string | null;
          growth_phase?: GrowthPhase | null;
          status?: TaskStatus;
          progress_percent?: number;
          owner_id?: string | null;
          project_id?: string | null;
          starts_on?: string | null;
          due_on?: string | null;
          completed_at?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["strategic_milestones"]["Insert"]
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
          start_date: string | null;
          progress_percent: number;
          estimated_minutes: number | null;
          actual_minutes: number | null;
          assignee_id: string | null;
          organization_id: string | null;
          project_id: string | null;
          opportunity_id: string | null;
          objective_id: string | null;
          milestone_id: string | null;
          parent_task_id: string | null;
          funding_id: string | null;
          growth_phase: GrowthPhase | null;
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
          start_date?: string | null;
          progress_percent?: number;
          estimated_minutes?: number | null;
          actual_minutes?: number | null;
          assignee_id?: string | null;
          organization_id?: string | null;
          project_id?: string | null;
          opportunity_id?: string | null;
          objective_id?: string | null;
          milestone_id?: string | null;
          parent_task_id?: string | null;
          funding_id?: string | null;
          growth_phase?: GrowthPhase | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
        Relationships: [];
      };
      funding_opportunities: {
        Row: {
          id: string;
          name: string;
          promoter: string | null;
          region: string | null;
          territory: string | null;
          official_url: string | null;
          aid_type: string | null;
          max_contribution_eur: number | null;
          funding_percent: number | null;
          min_investment_eur: number | null;
          eligibility_requirements: string | null;
          opens_on: string | null;
          closes_on: string | null;
          last_verified_at: string | null;
          status: FundingStatus;
          reminder_at: string | null;
          notes: string | null;
          owner_id: string | null;
          organization_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          promoter?: string | null;
          region?: string | null;
          territory?: string | null;
          official_url?: string | null;
          aid_type?: string | null;
          max_contribution_eur?: number | null;
          funding_percent?: number | null;
          min_investment_eur?: number | null;
          eligibility_requirements?: string | null;
          opens_on?: string | null;
          closes_on?: string | null;
          last_verified_at?: string | null;
          status?: FundingStatus;
          reminder_at?: string | null;
          notes?: string | null;
          owner_id?: string | null;
          organization_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["funding_opportunities"]["Insert"]
        >;
        Relationships: [];
      };
      funding_documents: {
        Row: {
          id: string;
          funding_id: string;
          title: string;
          description: string | null;
          is_required: boolean;
          is_done: boolean;
          due_on: string | null;
          storage_path: string | null;
          sort_order: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          funding_id: string;
          title: string;
          description?: string | null;
          is_required?: boolean;
          is_done?: boolean;
          due_on?: string | null;
          storage_path?: string | null;
          sort_order?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["funding_documents"]["Insert"]
        >;
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
      catalog_categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["catalog_categories"]["Insert"]>;
        Relationships: [];
      };
      catalog_services: {
        Row: {
          id: string;
          category_id: string;
          slug: string;
          name: string;
          description: string | null;
          features: Json;
          price_kind: "fixed" | "from" | "on_request" | "per_unit";
          base_price_cents: number | null;
          recurring_price_cents: number | null;
          recurring_period: "one_time" | "monthly" | "yearly";
          is_available_in_configurator: boolean;
          status: "draft" | "published";
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          category_id: string;
          slug: string;
          name: string;
          description?: string | null;
          features?: Json;
          price_kind?: "fixed" | "from" | "on_request" | "per_unit";
          base_price_cents?: number | null;
          recurring_price_cents?: number | null;
          recurring_period?: "one_time" | "monthly" | "yearly";
          is_available_in_configurator?: boolean;
          status?: "draft" | "published";
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["catalog_services"]["Insert"]>;
        Relationships: [];
      };
      catalog_addons: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          price_kind: "fixed" | "from" | "on_request" | "per_unit";
          unit_price_cents: number | null;
          recurring_price_cents: number | null;
          recurring_period: "one_time" | "monthly" | "yearly";
          min_qty: number;
          max_qty: number | null;
          depends_on_addon_ids: string[];
          incompatible_addon_ids: string[];
          status: "draft" | "published";
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          price_kind?: "fixed" | "from" | "on_request" | "per_unit";
          unit_price_cents?: number | null;
          recurring_price_cents?: number | null;
          recurring_period?: "one_time" | "monthly" | "yearly";
          min_qty?: number;
          max_qty?: number | null;
          depends_on_addon_ids?: string[];
          incompatible_addon_ids?: string[];
          status?: "draft" | "published";
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["catalog_addons"]["Insert"]>;
        Relationships: [];
      };
      catalog_service_addons: {
        Row: {
          service_id: string;
          addon_id: string;
          created_at: string;
        };
        Insert: {
          service_id: string;
          addon_id: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["catalog_service_addons"]["Insert"]
        >;
        Relationships: [];
      };
      catalog_packages: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          features: Json;
          price_kind: "fixed" | "from" | "on_request" | "per_unit";
          package_price_cents: number | null;
          recurring_price_cents: number | null;
          recurring_period: "one_time" | "monthly" | "yearly";
          is_available_in_configurator: boolean;
          status: "draft" | "published";
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          features?: Json;
          price_kind?: "fixed" | "from" | "on_request" | "per_unit";
          package_price_cents?: number | null;
          recurring_price_cents?: number | null;
          recurring_period?: "one_time" | "monthly" | "yearly";
          is_available_in_configurator?: boolean;
          status?: "draft" | "published";
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["catalog_packages"]["Insert"]>;
        Relationships: [];
      };
      catalog_package_items: {
        Row: {
          package_id: string;
          service_id: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          package_id: string;
          service_id: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["catalog_package_items"]["Insert"]
        >;
        Relationships: [];
      };
      catalog_promotions: {
        Row: {
          id: string;
          code: string | null;
          name: string;
          kind: "percent" | "fixed_amount" | "package_price";
          percent_off: number | null;
          amount_off_cents: number | null;
          package_id: string | null;
          promo_package_price_cents: number | null;
          starts_at: string | null;
          ends_at: string | null;
          is_active: boolean;
          stackable: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          code?: string | null;
          name: string;
          kind: "percent" | "fixed_amount" | "package_price";
          percent_off?: number | null;
          amount_off_cents?: number | null;
          package_id?: string | null;
          promo_package_price_cents?: number | null;
          starts_at?: string | null;
          ends_at?: string | null;
          is_active?: boolean;
          stackable?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["catalog_promotions"]["Insert"]>;
        Relationships: [];
      };
      catalog_list_versions: {
        Row: {
          id: string;
          version: number;
          label: string | null;
          snapshot: Json;
          published_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          version: number;
          label?: string | null;
          snapshot: Json;
          published_by?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["catalog_list_versions"]["Insert"]
        >;
        Relationships: [];
      };
      quote_requests: {
        Row: {
          id: string;
          request_number: string;
          status: "new" | "in_review" | "converted" | "archived";
          contact_name: string;
          contact_email: string;
          contact_phone: string | null;
          company_name: string | null;
          notes: string | null;
          selection: Json;
          pricing_snapshot: Json;
          list_version: number;
          subtotal_one_time_cents: number;
          discount_cents: number;
          tax_rate: number | null;
          tax_cents: number;
          total_one_time_cents: number;
          total_recurring_monthly_cents: number;
          total_recurring_yearly_cents: number;
          has_on_request_items: boolean;
          opportunity_id: string | null;
          organization_id: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          request_number: string;
          status?: "new" | "in_review" | "converted" | "archived";
          contact_name: string;
          contact_email: string;
          contact_phone?: string | null;
          company_name?: string | null;
          notes?: string | null;
          selection: Json;
          pricing_snapshot: Json;
          list_version: number;
          subtotal_one_time_cents?: number;
          discount_cents?: number;
          tax_rate?: number | null;
          tax_cents?: number;
          total_one_time_cents?: number;
          total_recurring_monthly_cents?: number;
          total_recurring_yearly_cents?: number;
          has_on_request_items?: boolean;
          opportunity_id?: string | null;
          organization_id?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["quote_requests"]["Insert"]>;
        Relationships: [];
      };
      quote_request_items: {
        Row: {
          id: string;
          quote_request_id: string;
          item_type: string;
          ref_id: string | null;
          name: string;
          quantity: number;
          unit_price_cents: number | null;
          line_total_cents: number | null;
          recurring_price_cents: number | null;
          recurring_period: "one_time" | "monthly" | "yearly" | null;
          price_kind: "fixed" | "from" | "on_request" | "per_unit";
          meta: Json;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quote_request_id: string;
          item_type: string;
          ref_id?: string | null;
          name: string;
          quantity?: number;
          unit_price_cents?: number | null;
          line_total_cents?: number | null;
          recurring_price_cents?: number | null;
          recurring_period?: "one_time" | "monthly" | "yearly" | null;
          price_kind: "fixed" | "from" | "on_request" | "per_unit";
          meta?: Json;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["quote_request_items"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      organization_status: OrganizationStatus;
      qualification_status: QualificationStatus;
      commercial_priority: CommercialPriority;
      opportunity_stage: OpportunityStage;
      project_status: ProjectStatus;
      quote_status: QuoteStatus;
      task_priority: TaskPriority;
      task_status: TaskStatus;
      growth_phase: GrowthPhase;
      objective_horizon: ObjectiveHorizon;
      objective_metric: ObjectiveMetric;
      financial_kind: FinancialKind;
      document_category: DocumentCategory;
      social_platform: SocialPlatform;
      social_content_status: SocialContentStatus;
      social_content_type: SocialContentType;
      funding_status: FundingStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
