export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_allowlist: {
        Row: {
          created_at: string
          email: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          user_id?: string
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string
          credential: string | null
          end_date: string | null
          field_of_study: string | null
          highlights: string[]
          id: string
          institution: string
          is_current: boolean | null
          location: string | null
          sort_order: number
          start_date: string | null
          status: string
          summary_md: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          credential?: string | null
          end_date?: string | null
          field_of_study?: string | null
          highlights?: string[]
          id?: string
          institution: string
          is_current?: boolean | null
          location?: string | null
          sort_order?: number
          start_date?: string | null
          status?: string
          summary_md?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          credential?: string | null
          end_date?: string | null
          field_of_study?: string | null
          highlights?: string[]
          id?: string
          institution?: string
          is_current?: boolean | null
          location?: string | null
          sort_order?: number
          start_date?: string | null
          status?: string
          summary_md?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      experience: {
        Row: {
          created_at: string
          employment_type: string | null
          end_date: string | null
          highlights: string[]
          id: string
          is_current: boolean | null
          location: string | null
          org: string
          org_logo_url: string | null
          org_url: string | null
          role: string
          sort_order: number
          start_date: string
          status: string
          summary_md: string | null
          tech: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          employment_type?: string | null
          end_date?: string | null
          highlights?: string[]
          id?: string
          is_current?: boolean | null
          location?: string | null
          org: string
          org_logo_url?: string | null
          org_url?: string | null
          role: string
          sort_order?: number
          start_date: string
          status?: string
          summary_md?: string | null
          tech?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          employment_type?: string | null
          end_date?: string | null
          highlights?: string[]
          id?: string
          is_current?: boolean | null
          location?: string | null
          org?: string
          org_logo_url?: string | null
          org_url?: string | null
          role?: string
          sort_order?: number
          start_date?: string
          status?: string
          summary_md?: string | null
          tech?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer_html: string | null
          answer_md: string | null
          created_at: string
          id: string
          question: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          answer_html?: string | null
          answer_md?: string | null
          created_at?: string
          id?: string
          question: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          answer_html?: string | null
          answer_md?: string | null
          created_at?: string
          id?: string
          question?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      ingest_jobs: {
        Row: {
          attempts: Json
          created_at: string
          error: string | null
          finished_at: string | null
          id: string
          kind: string
          source_ref: string | null
          started_at: string | null
          status: string
          total_ms: number | null
          updated_at: string
          winning_model: string | null
          winning_provider: string | null
        }
        Insert: {
          attempts?: Json
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          kind: string
          source_ref?: string | null
          started_at?: string | null
          status?: string
          total_ms?: number | null
          updated_at?: string
          winning_model?: string | null
          winning_provider?: string | null
        }
        Update: {
          attempts?: Json
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          kind?: string
          source_ref?: string | null
          started_at?: string | null
          status?: string
          total_ms?: number | null
          updated_at?: string
          winning_model?: string | null
          winning_provider?: string | null
        }
        Relationships: []
      }
      profile: {
        Row: {
          available_for_work: boolean
          avatar_url: string | null
          bio_html: string | null
          bio_md: string | null
          created_at: string
          full_name: string | null
          headline: string | null
          id: string
          location: string | null
          public_email: string | null
          resume_public_url: string | null
          singleton: boolean
          socials: Json
          updated_at: string
        }
        Insert: {
          available_for_work?: boolean
          avatar_url?: string | null
          bio_html?: string | null
          bio_md?: string | null
          created_at?: string
          full_name?: string | null
          headline?: string | null
          id?: string
          location?: string | null
          public_email?: string | null
          resume_public_url?: string | null
          singleton?: boolean
          socials?: Json
          updated_at?: string
        }
        Update: {
          available_for_work?: boolean
          avatar_url?: string | null
          bio_html?: string | null
          bio_md?: string | null
          created_at?: string
          full_name?: string | null
          headline?: string | null
          id?: string
          location?: string | null
          public_email?: string | null
          resume_public_url?: string | null
          singleton?: boolean
          socials?: Json
          updated_at?: string
        }
        Relationships: []
      }
      project_commits: {
        Row: {
          author_avatar_url: string | null
          author_login: string | null
          author_name: string | null
          authored_at: string | null
          html_url: string | null
          id: string
          message: string | null
          project_id: string
          sha: string
          short_sha: string | null
        }
        Insert: {
          author_avatar_url?: string | null
          author_login?: string | null
          author_name?: string | null
          authored_at?: string | null
          html_url?: string | null
          id?: string
          message?: string | null
          project_id: string
          sha: string
          short_sha?: string | null
        }
        Update: {
          author_avatar_url?: string | null
          author_login?: string | null
          author_name?: string | null
          authored_at?: string | null
          html_url?: string | null
          id?: string
          message?: string | null
          project_id?: string
          sha?: string
          short_sha?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_commits_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_github: {
        Row: {
          default_branch: string | null
          forks: number
          gh_description: string | null
          homepage: string | null
          is_archived: boolean
          is_fork: boolean
          languages: Json
          last_synced_at: string | null
          license_spdx: string | null
          open_issues: number
          primary_language: string | null
          project_id: string
          pushed_at: string | null
          raw: Json | null
          readme_etag: string | null
          readme_html: string | null
          readme_md: string | null
          repo_created_at: string | null
          repo_etag: string | null
          repo_name: string
          repo_owner: string
          stars: number
          sync_error: string | null
          sync_status: string | null
          topics: string[]
          watchers: number
        }
        Insert: {
          default_branch?: string | null
          forks?: number
          gh_description?: string | null
          homepage?: string | null
          is_archived?: boolean
          is_fork?: boolean
          languages?: Json
          last_synced_at?: string | null
          license_spdx?: string | null
          open_issues?: number
          primary_language?: string | null
          project_id: string
          pushed_at?: string | null
          raw?: Json | null
          readme_etag?: string | null
          readme_html?: string | null
          readme_md?: string | null
          repo_created_at?: string | null
          repo_etag?: string | null
          repo_name: string
          repo_owner: string
          stars?: number
          sync_error?: string | null
          sync_status?: string | null
          topics?: string[]
          watchers?: number
        }
        Update: {
          default_branch?: string | null
          forks?: number
          gh_description?: string | null
          homepage?: string | null
          is_archived?: boolean
          is_fork?: boolean
          languages?: Json
          last_synced_at?: string | null
          license_spdx?: string | null
          open_issues?: number
          primary_language?: string | null
          project_id?: string
          pushed_at?: string | null
          raw?: Json | null
          readme_etag?: string | null
          readme_html?: string | null
          readme_md?: string | null
          repo_created_at?: string | null
          repo_etag?: string | null
          repo_name?: string
          repo_owner?: string
          stars?: number
          sync_error?: string | null
          sync_status?: string | null
          topics?: string[]
          watchers?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_github_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          cover_blur_data: string | null
          cover_image_url: string | null
          created_at: string
          description_html: string | null
          description_md: string | null
          ended_on: string | null
          featured: boolean
          id: string
          live_url: string | null
          repo_url: string | null
          role: string | null
          slug: string
          sort_order: number
          started_on: string | null
          status: string
          tagline: string | null
          tech: string[]
          title: string
          updated_at: string
        }
        Insert: {
          cover_blur_data?: string | null
          cover_image_url?: string | null
          created_at?: string
          description_html?: string | null
          description_md?: string | null
          ended_on?: string | null
          featured?: boolean
          id?: string
          live_url?: string | null
          repo_url?: string | null
          role?: string | null
          slug: string
          sort_order?: number
          started_on?: string | null
          status?: string
          tagline?: string | null
          tech?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          cover_blur_data?: string | null
          cover_image_url?: string | null
          created_at?: string
          description_html?: string | null
          description_md?: string | null
          ended_on?: string | null
          featured?: boolean
          id?: string
          live_url?: string | null
          repo_url?: string | null
          role?: string | null
          slug?: string
          sort_order?: number
          started_on?: string | null
          status?: string
          tagline?: string | null
          tech?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      resume_uploads: {
        Row: {
          error: string | null
          extracted_text: string | null
          extraction_method: string | null
          extraction_ms: number | null
          file_size: number | null
          id: string
          original_filename: string | null
          page_count: number | null
          sha256: string | null
          status: string
          storage_path: string
          uploaded_at: string
        }
        Insert: {
          error?: string | null
          extracted_text?: string | null
          extraction_method?: string | null
          extraction_ms?: number | null
          file_size?: number | null
          id?: string
          original_filename?: string | null
          page_count?: number | null
          sha256?: string | null
          status?: string
          storage_path: string
          uploaded_at?: string
        }
        Update: {
          error?: string | null
          extracted_text?: string | null
          extraction_method?: string | null
          extraction_ms?: number | null
          file_size?: number | null
          id?: string
          original_filename?: string | null
          page_count?: number | null
          sha256?: string | null
          status?: string
          storage_path?: string
          uploaded_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          featured: boolean
          id: string
          name: string
          proficiency: number | null
          sort_order: number
          status: string
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          name: string
          proficiency?: number | null
          sort_order?: number
          status?: string
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          name?: string
          proficiency?: number | null
          sort_order?: number
          status?: string
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      staging_records: {
        Row: {
          confidence: number | null
          created_at: string
          current_snapshot: Json | null
          dedupe_key: string | null
          edited: Json | null
          field_decisions: Json
          id: string
          job_id: string
          operation: string
          proposed: Json
          reviewed_at: string | null
          source_quote: string | null
          status: string
          target_id: string | null
          target_table: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          current_snapshot?: Json | null
          dedupe_key?: string | null
          edited?: Json | null
          field_decisions?: Json
          id?: string
          job_id: string
          operation: string
          proposed: Json
          reviewed_at?: string | null
          source_quote?: string | null
          status?: string
          target_id?: string | null
          target_table: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          current_snapshot?: Json | null
          dedupe_key?: string | null
          edited?: Json | null
          field_decisions?: Json
          id?: string
          job_id?: string
          operation?: string
          proposed?: Json
          reviewed_at?: string | null
          source_quote?: string | null
          status?: string
          target_id?: string | null
          target_table?: string
        }
        Relationships: [
          {
            foreignKeyName: "staging_records_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "ingest_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
