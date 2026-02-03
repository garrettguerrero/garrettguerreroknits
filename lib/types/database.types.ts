export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          is_admin: boolean
          newsletter_subscribed: boolean
          created_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          newsletter_subscribed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          newsletter_subscribed?: boolean
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          short_description: string
          price: number
          is_free: boolean
          category: string
          skill_level: string
          yarn_weight: string | null
          finished_size: string | null
          pdf_storage_path: string | null
          cover_image_url: string | null
          thumbnail_url: string | null
          mdx_content_path: string | null
          has_video_content: boolean
          average_rating: number | null
          total_reviews: number
          times_downloaded: number
          version: string
          changelog: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description: string
          short_description: string
          price: number
          is_free?: boolean
          category: string
          skill_level: string
          yarn_weight?: string | null
          finished_size?: string | null
          pdf_storage_path?: string | null
          cover_image_url?: string | null
          thumbnail_url?: string | null
          mdx_content_path?: string | null
          has_video_content?: boolean
          average_rating?: number | null
          total_reviews?: number
          times_downloaded?: number
          version?: string
          changelog?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string
          short_description?: string
          price?: number
          is_free?: boolean
          category?: string
          skill_level?: string
          yarn_weight?: string | null
          finished_size?: string | null
          pdf_storage_path?: string | null
          cover_image_url?: string | null
          thumbnail_url?: string | null
          mdx_content_path?: string | null
          has_video_content?: boolean
          average_rating?: number | null
          total_reviews?: number
          times_downloaded?: number
          version?: string
          changelog?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Add more table types as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
