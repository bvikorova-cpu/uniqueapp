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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string | null
          id: string
          points_earned: number
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          id?: string
          points_earned: number
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          id?: string
          points_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      age_progressions: {
        Row: {
          aged_image_url: string | null
          created_at: string | null
          credits_used: number | null
          description: string | null
          id: string
          original_image_url: string
          user_id: string
          years_forward: number
        }
        Insert: {
          aged_image_url?: string | null
          created_at?: string | null
          credits_used?: number | null
          description?: string | null
          id?: string
          original_image_url: string
          user_id: string
          years_forward: number
        }
        Update: {
          aged_image_url?: string | null
          created_at?: string | null
          credits_used?: number | null
          description?: string | null
          id?: string
          original_image_url?: string
          user_id?: string
          years_forward?: number
        }
        Relationships: []
      }
      ai_characters: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          description: string
          id: string
          is_premium: boolean | null
          name: string
          personality_type: string
          system_prompt: string
          voice_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          description: string
          id?: string
          is_premium?: boolean | null
          name: string
          personality_type: string
          system_prompt: string
          voice_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string
          id?: string
          is_premium?: boolean | null
          name?: string
          personality_type?: string
          system_prompt?: string
          voice_id?: string | null
        }
        Relationships: []
      }
      ai_credits: {
        Row: {
          created_at: string
          credits_remaining: number
          id: string
          last_used_at: string | null
          total_credits_purchased: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_remaining?: number
          id?: string
          last_used_at?: string | null
          total_credits_purchased?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_remaining?: number
          id?: string
          last_used_at?: string | null
          total_credits_purchased?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_generated_content: {
        Row: {
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string | null
          credits_used: number | null
          generated_image_url: string | null
          generated_text: string | null
          id: string
          metadata: Json | null
          prompt: string
          status: Database["public"]["Enums"]["content_status"] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          credits_used?: number | null
          generated_image_url?: string | null
          generated_text?: string | null
          id?: string
          metadata?: Json | null
          prompt: string
          status?: Database["public"]["Enums"]["content_status"] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          credits_used?: number | null
          generated_image_url?: string | null
          generated_text?: string | null
          id?: string
          metadata?: Json | null
          prompt?: string
          status?: Database["public"]["Enums"]["content_status"] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_generated_songs: {
        Row: {
          cover_art_url: string | null
          created_at: string | null
          credits_used: number | null
          duration: number | null
          genre: string
          id: string
          is_remix: boolean | null
          lyrics: string | null
          metadata: Json | null
          mood: string | null
          original_song_reference: string | null
          song_url: string | null
          status: string | null
          tempo: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_art_url?: string | null
          created_at?: string | null
          credits_used?: number | null
          duration?: number | null
          genre: string
          id?: string
          is_remix?: boolean | null
          lyrics?: string | null
          metadata?: Json | null
          mood?: string | null
          original_song_reference?: string | null
          song_url?: string | null
          status?: string | null
          tempo?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_art_url?: string | null
          created_at?: string | null
          credits_used?: number | null
          duration?: number | null
          genre?: string
          id?: string
          is_remix?: boolean | null
          lyrics?: string | null
          metadata?: Json | null
          mood?: string | null
          original_song_reference?: string | null
          song_url?: string | null
          status?: string | null
          tempo?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_routine_optimizations: {
        Row: {
          analysis_date: string
          balance_score: number | null
          created_at: string | null
          energy_insights: string | null
          habit_stacking_suggestions: Json | null
          id: string
          is_premium: boolean | null
          optimization_data: Json
          sleep_recommendation: string | null
          social_recommendation: string | null
          user_id: string
          work_recommendation: string | null
          workout_recommendation: string | null
        }
        Insert: {
          analysis_date?: string
          balance_score?: number | null
          created_at?: string | null
          energy_insights?: string | null
          habit_stacking_suggestions?: Json | null
          id?: string
          is_premium?: boolean | null
          optimization_data?: Json
          sleep_recommendation?: string | null
          social_recommendation?: string | null
          user_id: string
          work_recommendation?: string | null
          workout_recommendation?: string | null
        }
        Update: {
          analysis_date?: string
          balance_score?: number | null
          created_at?: string | null
          energy_insights?: string | null
          habit_stacking_suggestions?: Json | null
          id?: string
          is_premium?: boolean | null
          optimization_data?: Json
          sleep_recommendation?: string | null
          social_recommendation?: string | null
          user_id?: string
          work_recommendation?: string | null
          workout_recommendation?: string | null
        }
        Relationships: []
      }
      ai_tattoo_designs: {
        Row: {
          color_scheme: string | null
          created_at: string | null
          credits_used: number | null
          design_url: string | null
          id: string
          is_favorite: boolean | null
          metadata: Json | null
          placement: string | null
          preview_url: string | null
          prompt: string
          size: string | null
          style: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color_scheme?: string | null
          created_at?: string | null
          credits_used?: number | null
          design_url?: string | null
          id?: string
          is_favorite?: boolean | null
          metadata?: Json | null
          placement?: string | null
          preview_url?: string | null
          prompt: string
          size?: string | null
          style: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color_scheme?: string | null
          created_at?: string | null
          credits_used?: number | null
          design_url?: string | null
          id?: string
          is_favorite?: boolean | null
          metadata?: Json | null
          placement?: string | null
          preview_url?: string | null
          prompt?: string
          size?: string | null
          style?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_usage_history: {
        Row: {
          created_at: string
          credits_used: number
          description: string | null
          id: string
          usage_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_used?: number
          description?: string | null
          id?: string
          usage_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          description?: string | null
          id?: string
          usage_type?: string
          user_id?: string
        }
        Relationships: []
      }
      antique_collections: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_premium: boolean | null
          is_public: boolean | null
          item_count: number | null
          name: string
          total_estimated_value: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_premium?: boolean | null
          is_public?: boolean | null
          item_count?: number | null
          name: string
          total_estimated_value?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_premium?: boolean | null
          is_public?: boolean | null
          item_count?: number | null
          name?: string
          total_estimated_value?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      antique_credits: {
        Row: {
          created_at: string | null
          credits_remaining: number
          id: string
          total_credits_purchased: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_remaining?: number
          id?: string
          total_credits_purchased?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_remaining?: number
          id?: string
          total_credits_purchased?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      antiques: {
        Row: {
          analysis_result: Json | null
          analysis_type: string
          authenticity_score: number | null
          collection_id: string | null
          condition_analysis: string | null
          created_at: string | null
          credits_used: number | null
          description: string | null
          estimated_period: string | null
          estimated_value: number | null
          historical_context: string | null
          id: string
          image_url: string
          is_public: boolean | null
          market_trends: Json | null
          restoration_advice: string | null
          style: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_result?: Json | null
          analysis_type: string
          authenticity_score?: number | null
          collection_id?: string | null
          condition_analysis?: string | null
          created_at?: string | null
          credits_used?: number | null
          description?: string | null
          estimated_period?: string | null
          estimated_value?: number | null
          historical_context?: string | null
          id?: string
          image_url: string
          is_public?: boolean | null
          market_trends?: Json | null
          restoration_advice?: string | null
          style?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_result?: Json | null
          analysis_type?: string
          authenticity_score?: number | null
          collection_id?: string | null
          condition_analysis?: string | null
          created_at?: string | null
          credits_used?: number | null
          description?: string | null
          estimated_period?: string | null
          estimated_value?: number | null
          historical_context?: string | null
          id?: string
          image_url?: string
          is_public?: boolean | null
          market_trends?: Json | null
          restoration_advice?: string | null
          style?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      astro_subscriptions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          price: number
          started_at: string | null
          status: string | null
          tier: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          price: number
          started_at?: string | null
          status?: string | null
          tier: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          price?: number
          started_at?: string | null
          status?: string | null
          tier?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      auction_bids: {
        Row: {
          auction_id: string
          bid_amount: number
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          auction_id: string
          bid_amount: number
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          auction_id?: string
          bid_amount?: number
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auction_items"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_items: {
        Row: {
          buyout_price: number | null
          category: string
          condition: string
          created_at: string
          current_price: number
          description: string
          ends_at: string
          id: string
          image_url: string | null
          is_active: boolean | null
          starting_price: number
          title: string
          updated_at: string
          user_id: string
          winner_id: string | null
        }
        Insert: {
          buyout_price?: number | null
          category: string
          condition: string
          created_at?: string
          current_price: number
          description: string
          ends_at: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          starting_price: number
          title: string
          updated_at?: string
          user_id: string
          winner_id?: string | null
        }
        Update: {
          buyout_price?: number | null
          category?: string
          condition?: string
          created_at?: string
          current_price?: number
          description?: string
          ends_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          starting_price?: number
          title?: string
          updated_at?: string
          user_id?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      auction_photos: {
        Row: {
          auction_id: string
          created_at: string
          id: string
          photo_url: string
        }
        Insert: {
          auction_id: string
          created_at?: string
          id?: string
          photo_url: string
        }
        Update: {
          auction_id?: string
          created_at?: string
          id?: string
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_photos_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auction_items"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          points_reward: number | null
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          created_at?: string | null
          description: string
          icon: string
          id?: string
          name: string
          points_reward?: number | null
          requirement_type: string
          requirement_value: number
        }
        Update: {
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          points_reward?: number | null
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      bazaar_items: {
        Row: {
          category: string
          condition: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          listing_type: string
          location: string
          price: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          condition: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          listing_type?: string
          location: string
          price: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          condition?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          listing_type?: string
          location?: string
          price?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bazaar_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bazaar_messages: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          item_id: string
          message: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          item_id: string
          message: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          item_id?: string
          message?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bazaar_messages_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "bazaar_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bazaar_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bazaar_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beauty_product_recommendations: {
        Row: {
          concerns: string[] | null
          created_at: string | null
          credits_used: number | null
          hair_type: string | null
          id: string
          recommendations: Json | null
          skin_type: string | null
          user_id: string
        }
        Insert: {
          concerns?: string[] | null
          created_at?: string | null
          credits_used?: number | null
          hair_type?: string | null
          id?: string
          recommendations?: Json | null
          skin_type?: string | null
          user_id: string
        }
        Update: {
          concerns?: string[] | null
          created_at?: string | null
          credits_used?: number | null
          hair_type?: string | null
          id?: string
          recommendations?: Json | null
          skin_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      beauty_transformations: {
        Row: {
          created_at: string | null
          credits_used: number | null
          description: string | null
          id: string
          original_image_url: string
          style_applied: string
          transformation_type: string
          transformed_image_url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_used?: number | null
          description?: string | null
          id?: string
          original_image_url: string
          style_applied: string
          transformation_type: string
          transformed_image_url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_used?: number | null
          description?: string | null
          id?: string
          original_image_url?: string
          style_applied?: string
          transformation_type?: string
          transformed_image_url?: string
          user_id?: string
        }
        Relationships: []
      }
      beauty_tutorials: {
        Row: {
          created_at: string | null
          credits_used: number | null
          difficulty_level: string | null
          id: string
          look_description: string
          products_needed: Json | null
          tutorial_steps: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_used?: number | null
          difficulty_level?: string | null
          id?: string
          look_description: string
          products_needed?: Json | null
          tutorial_steps?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_used?: number | null
          difficulty_level?: string | null
          id?: string
          look_description?: string
          products_needed?: Json | null
          tutorial_steps?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      birth_charts: {
        Row: {
          birth_date: string
          birth_place: string
          birth_time: string | null
          chart_data: Json | null
          created_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          moon_sign: Database["public"]["Enums"]["zodiac_sign"] | null
          name: string
          rising_sign: Database["public"]["Enums"]["zodiac_sign"] | null
          sun_sign: Database["public"]["Enums"]["zodiac_sign"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          birth_date: string
          birth_place: string
          birth_time?: string | null
          chart_data?: Json | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          moon_sign?: Database["public"]["Enums"]["zodiac_sign"] | null
          name: string
          rising_sign?: Database["public"]["Enums"]["zodiac_sign"] | null
          sun_sign: Database["public"]["Enums"]["zodiac_sign"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          birth_date?: string
          birth_place?: string
          birth_time?: string | null
          chart_data?: Json | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          moon_sign?: Database["public"]["Enums"]["zodiac_sign"] | null
          name?: string
          rising_sign?: Database["public"]["Enums"]["zodiac_sign"] | null
          sun_sign?: Database["public"]["Enums"]["zodiac_sign"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      brand_kits: {
        Row: {
          brand_values: string | null
          business_name: string
          business_type: string
          color_palette: Json | null
          created_at: string | null
          credits_used: number | null
          id: string
          is_premium: boolean | null
          logo_url: string | null
          slogan: string | null
          social_media_strategy: Json | null
          tagline: string | null
          target_audience: string | null
          updated_at: string | null
          user_id: string
          visual_identity: Json | null
        }
        Insert: {
          brand_values?: string | null
          business_name: string
          business_type: string
          color_palette?: Json | null
          created_at?: string | null
          credits_used?: number | null
          id?: string
          is_premium?: boolean | null
          logo_url?: string | null
          slogan?: string | null
          social_media_strategy?: Json | null
          tagline?: string | null
          target_audience?: string | null
          updated_at?: string | null
          user_id: string
          visual_identity?: Json | null
        }
        Update: {
          brand_values?: string | null
          business_name?: string
          business_type?: string
          color_palette?: Json | null
          created_at?: string | null
          credits_used?: number | null
          id?: string
          is_premium?: boolean | null
          logo_url?: string | null
          slogan?: string | null
          social_media_strategy?: Json | null
          tagline?: string | null
          target_audience?: string | null
          updated_at?: string | null
          user_id?: string
          visual_identity?: Json | null
        }
        Relationships: []
      }
      certificate_purchases: {
        Row: {
          amount: number
          certificate_url: string | null
          course_name: string
          created_at: string | null
          id: string
          status: string
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          certificate_url?: string | null
          course_name: string
          created_at?: string | null
          id?: string
          status?: string
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          certificate_url?: string | null
          course_name?: string
          created_at?: string | null
          id?: string
          status?: string
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      character_conversations: {
        Row: {
          character_id: string
          created_at: string | null
          id: string
          memory_context: Json | null
          summary: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          character_id: string
          created_at?: string | null
          id?: string
          memory_context?: Json | null
          summary?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          character_id?: string
          created_at?: string | null
          id?: string
          memory_context?: Json | null
          summary?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_conversations_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "ai_characters"
            referencedColumns: ["id"]
          },
        ]
      }
      character_messages: {
        Row: {
          audio_url: string | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          audio_url?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          audio_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "character_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      collectible_auctions: {
        Row: {
          buyout_price: number | null
          created_at: string
          current_price: number
          expires_at: string
          id: string
          seller_id: string
          starting_price: number
          status: string
          updated_at: string
          user_collectible_id: string | null
        }
        Insert: {
          buyout_price?: number | null
          created_at?: string
          current_price: number
          expires_at: string
          id?: string
          seller_id: string
          starting_price: number
          status?: string
          updated_at?: string
          user_collectible_id?: string | null
        }
        Update: {
          buyout_price?: number | null
          created_at?: string
          current_price?: number
          expires_at?: string
          id?: string
          seller_id?: string
          starting_price?: number
          status?: string
          updated_at?: string
          user_collectible_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collectible_auctions_user_collectible_id_fkey"
            columns: ["user_collectible_id"]
            isOneToOne: false
            referencedRelation: "user_collectibles"
            referencedColumns: ["id"]
          },
        ]
      }
      collectible_bids: {
        Row: {
          amount: number
          auction_id: string | null
          bidder_id: string
          created_at: string
          id: string
        }
        Insert: {
          amount: number
          auction_id?: string | null
          bidder_id: string
          created_at?: string
          id?: string
        }
        Update: {
          amount?: number
          auction_id?: string | null
          bidder_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collectible_bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "collectible_auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      collectible_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      collectible_rarities: {
        Row: {
          color: string
          created_at: string
          drop_rate: number
          id: string
          level: number
          name: string
        }
        Insert: {
          color: string
          created_at?: string
          drop_rate: number
          id?: string
          level: number
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          drop_rate?: number
          id?: string
          level?: number
          name?: string
        }
        Relationships: []
      }
      collectible_trades: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          offered_avatar_id: string | null
          offered_badge_id: string | null
          offered_credits: number | null
          offered_theme_id: string | null
          receiver_id: string
          requested_avatar_id: string | null
          requested_badge_id: string | null
          requested_credits: number | null
          requested_theme_id: string | null
          sender_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          offered_avatar_id?: string | null
          offered_badge_id?: string | null
          offered_credits?: number | null
          offered_theme_id?: string | null
          receiver_id: string
          requested_avatar_id?: string | null
          requested_badge_id?: string | null
          requested_credits?: number | null
          requested_theme_id?: string | null
          sender_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          offered_avatar_id?: string | null
          offered_badge_id?: string | null
          offered_credits?: number | null
          offered_theme_id?: string | null
          receiver_id?: string
          requested_avatar_id?: string | null
          requested_badge_id?: string | null
          requested_credits?: number | null
          requested_theme_id?: string | null
          sender_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collectible_trades_offered_avatar_id_fkey"
            columns: ["offered_avatar_id"]
            isOneToOne: false
            referencedRelation: "premium_avatars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collectible_trades_offered_badge_id_fkey"
            columns: ["offered_badge_id"]
            isOneToOne: false
            referencedRelation: "premium_badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collectible_trades_offered_theme_id_fkey"
            columns: ["offered_theme_id"]
            isOneToOne: false
            referencedRelation: "premium_themes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collectible_trades_requested_avatar_id_fkey"
            columns: ["requested_avatar_id"]
            isOneToOne: false
            referencedRelation: "premium_avatars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collectible_trades_requested_badge_id_fkey"
            columns: ["requested_badge_id"]
            isOneToOne: false
            referencedRelation: "premium_badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collectible_trades_requested_theme_id_fkey"
            columns: ["requested_theme_id"]
            isOneToOne: false
            referencedRelation: "premium_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      collectible_trades_new: {
        Row: {
          created_at: string
          id: string
          message: string | null
          receiver_collectible_ids: string[]
          receiver_credits: number | null
          receiver_id: string
          sender_collectible_ids: string[]
          sender_credits: number | null
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          receiver_collectible_ids: string[]
          receiver_credits?: number | null
          receiver_id: string
          sender_collectible_ids: string[]
          sender_credits?: number | null
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          receiver_collectible_ids?: string[]
          receiver_credits?: number | null
          receiver_id?: string
          sender_collectible_ids?: string[]
          sender_credits?: number | null
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      collectibles: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          generation_cost: number
          id: string
          image_url: string | null
          is_active: boolean | null
          is_seasonal: boolean | null
          name: string
          properties: Json | null
          rarity_id: string | null
          season_end: string | null
          season_start: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          generation_cost?: number
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_seasonal?: boolean | null
          name: string
          properties?: Json | null
          rarity_id?: string | null
          season_end?: string | null
          season_start?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          generation_cost?: number
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_seasonal?: boolean | null
          name?: string
          properties?: Json | null
          rarity_id?: string | null
          season_end?: string | null
          season_start?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collectibles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "collectible_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collectibles_rarity_id_fkey"
            columns: ["rarity_id"]
            isOneToOne: false
            referencedRelation: "collectible_rarities"
            referencedColumns: ["id"]
          },
        ]
      }
      collector_pass_subscriptions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          last_daily_reward_at: string | null
          started_at: string
          status: string
          tier: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          last_daily_reward_at?: string | null
          started_at?: string
          status?: string
          tier: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          last_daily_reward_at?: string | null
          started_at?: string
          status?: string
          tier?: string
          user_id?: string
        }
        Relationships: []
      }
      coloring_credits: {
        Row: {
          created_at: string
          credits_remaining: number
          expires_at: string | null
          id: string
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_remaining?: number
          expires_at?: string | null
          id?: string
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_remaining?: number
          expires_at?: string | null
          id?: string
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coloring_pages: {
        Row: {
          created_at: string
          credits_used: number | null
          difficulty: string
          id: string
          is_public: boolean | null
          metadata: Json | null
          original_image_url: string
          processed_image_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_used?: number | null
          difficulty?: string
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          original_image_url: string
          processed_image_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number | null
          difficulty?: string
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          original_image_url?: string
          processed_image_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      compatibility_readings: {
        Row: {
          advice: string | null
          analysis: string
          challenges: string[] | null
          compatibility_score: number | null
          created_at: string | null
          id: string
          is_premium: boolean | null
          sign1: Database["public"]["Enums"]["zodiac_sign"]
          sign2: Database["public"]["Enums"]["zodiac_sign"]
          strengths: string[] | null
          user_id: string
        }
        Insert: {
          advice?: string | null
          analysis: string
          challenges?: string[] | null
          compatibility_score?: number | null
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          sign1: Database["public"]["Enums"]["zodiac_sign"]
          sign2: Database["public"]["Enums"]["zodiac_sign"]
          strengths?: string[] | null
          user_id: string
        }
        Update: {
          advice?: string | null
          analysis?: string
          challenges?: string[] | null
          compatibility_score?: number | null
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          sign1?: Database["public"]["Enums"]["zodiac_sign"]
          sign2?: Database["public"]["Enums"]["zodiac_sign"]
          strengths?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      completed_courses: {
        Row: {
          certificate_url: string | null
          completion_date: string | null
          course_name: string
          created_at: string | null
          id: string
          test_score: number | null
          time_spent_minutes: number | null
          user_id: string
        }
        Insert: {
          certificate_url?: string | null
          completion_date?: string | null
          course_name: string
          created_at?: string | null
          id?: string
          test_score?: number | null
          time_spent_minutes?: number | null
          user_id: string
        }
        Update: {
          certificate_url?: string | null
          completion_date?: string | null
          course_name?: string
          created_at?: string | null
          id?: string
          test_score?: number | null
          time_spent_minutes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "completed_courses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_progress: {
        Row: {
          completed_topics: number[] | null
          course_name: string
          created_at: string | null
          current_topic: number | null
          id: string
          last_accessed_at: string | null
          user_id: string
        }
        Insert: {
          completed_topics?: number[] | null
          course_name: string
          created_at?: string | null
          current_topic?: number | null
          id?: string
          last_accessed_at?: string | null
          user_id: string
        }
        Update: {
          completed_topics?: number[] | null
          course_name?: string
          created_at?: string | null
          current_topic?: number | null
          id?: string
          last_accessed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_statistics: {
        Row: {
          course_name: string
          id: string
          last_activity: string | null
          time_spent_minutes: number | null
          topics_completed: number | null
          user_id: string
        }
        Insert: {
          course_name: string
          id?: string
          last_activity?: string | null
          time_spent_minutes?: number | null
          topics_completed?: number | null
          user_id: string
        }
        Update: {
          course_name?: string
          id?: string
          last_activity?: string | null
          time_spent_minutes?: number | null
          topics_completed?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_statistics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cv_documents: {
        Row: {
          ai_suggestions: Json | null
          created_at: string
          format: string | null
          id: string
          optimized_content: string | null
          original_content: string
          target_role: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_suggestions?: Json | null
          created_at?: string
          format?: string | null
          id?: string
          optimized_content?: string | null
          original_content: string
          target_role?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_suggestions?: Json | null
          created_at?: string
          format?: string | null
          id?: string
          optimized_content?: string | null
          original_content?: string
          target_role?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_horoscopes: {
        Row: {
          career_score: number | null
          compatibility_signs:
            | Database["public"]["Enums"]["zodiac_sign"][]
            | null
          content: string
          created_at: string | null
          date: string
          health_score: number | null
          id: string
          is_premium: boolean | null
          love_score: number | null
          lucky_colors: string[] | null
          lucky_numbers: number[] | null
          mood_score: number | null
          user_id: string
          zodiac_sign: Database["public"]["Enums"]["zodiac_sign"]
        }
        Insert: {
          career_score?: number | null
          compatibility_signs?:
            | Database["public"]["Enums"]["zodiac_sign"][]
            | null
          content: string
          created_at?: string | null
          date: string
          health_score?: number | null
          id?: string
          is_premium?: boolean | null
          love_score?: number | null
          lucky_colors?: string[] | null
          lucky_numbers?: number[] | null
          mood_score?: number | null
          user_id: string
          zodiac_sign: Database["public"]["Enums"]["zodiac_sign"]
        }
        Update: {
          career_score?: number | null
          compatibility_signs?:
            | Database["public"]["Enums"]["zodiac_sign"][]
            | null
          content?: string
          created_at?: string | null
          date?: string
          health_score?: number | null
          id?: string
          is_premium?: boolean | null
          love_score?: number | null
          lucky_colors?: string[] | null
          lucky_numbers?: number[] | null
          mood_score?: number | null
          user_id?: string
          zodiac_sign?: Database["public"]["Enums"]["zodiac_sign"]
        }
        Relationships: []
      }
      daily_rewards: {
        Row: {
          claimed_at: string | null
          day_streak: number | null
          id: string
          points_earned: number | null
          user_id: string
        }
        Insert: {
          claimed_at?: string | null
          day_streak?: number | null
          id?: string
          points_earned?: number | null
          user_id: string
        }
        Update: {
          claimed_at?: string | null
          day_streak?: number | null
          id?: string
          points_earned?: number | null
          user_id?: string
        }
        Relationships: []
      }
      dating_gifts: {
        Row: {
          created_at: string
          icon: string
          id: string
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          icon: string
          id?: string
          name: string
          price?: number
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      dating_last_swipe: {
        Row: {
          action: string
          created_at: string
          id: string
          swiped_profile_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          swiped_profile_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          swiped_profile_id?: string
          user_id?: string
        }
        Relationships: []
      }
      dating_likes_you: {
        Row: {
          created_at: string
          id: string
          liked_id: string
          liker_id: string
          seen: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          liked_id: string
          liker_id: string
          seen?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          liked_id?: string
          liker_id?: string
          seen?: boolean
        }
        Relationships: []
      }
      dating_matches: {
        Row: {
          created_at: string
          id: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      dating_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          match_id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          match_id: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          match_id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dating_messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "dating_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      dating_profiles: {
        Row: {
          additional_photos: string[] | null
          age: number
          bio: string | null
          created_at: string
          display_name: string
          gender: string
          id: string
          interests: string[] | null
          is_active: boolean | null
          location: string | null
          looking_for: string
          profile_photo_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_photos?: string[] | null
          age: number
          bio?: string | null
          created_at?: string
          display_name: string
          gender: string
          id?: string
          interests?: string[] | null
          is_active?: boolean | null
          location?: string | null
          looking_for: string
          profile_photo_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_photos?: string[] | null
          age?: number
          bio?: string | null
          created_at?: string
          display_name?: string
          gender?: string
          id?: string
          interests?: string[] | null
          is_active?: boolean | null
          location?: string | null
          looking_for?: string
          profile_photo_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dating_sent_gifts: {
        Row: {
          created_at: string
          gift_id: string
          id: string
          match_id: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          gift_id: string
          id?: string
          match_id: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          gift_id?: string
          id?: string
          match_id?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dating_sent_gifts_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "dating_gifts"
            referencedColumns: ["id"]
          },
        ]
      }
      dating_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          price: number
          started_at: string
          status: string | null
          subscription_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          price?: number
          started_at?: string
          status?: string | null
          subscription_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          price?: number
          started_at?: string
          status?: string | null
          subscription_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dating_super_likes: {
        Row: {
          created_at: string
          id: string
          swiped_id: string
          swiper_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          swiped_id: string
          swiper_id: string
        }
        Update: {
          created_at?: string
          id?: string
          swiped_id?: string
          swiper_id?: string
        }
        Relationships: []
      }
      dating_swipes: {
        Row: {
          action: string
          created_at: string
          id: string
          swiped_id: string
          swiper_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          swiped_id: string
          swiper_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          swiped_id?: string
          swiper_id?: string
        }
        Relationships: []
      }
      destination_photos: {
        Row: {
          created_at: string
          destination_id: string
          id: string
          photo_url: string
        }
        Insert: {
          created_at?: string
          destination_id: string
          id?: string
          photo_url: string
        }
        Update: {
          created_at?: string
          destination_id?: string
          id?: string
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "destination_photos_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      destination_reviews: {
        Row: {
          comment: string
          created_at: string
          destination_id: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          destination_id: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          destination_id?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "destination_reviews_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean | null
          location: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_active?: boolean | null
          location: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean | null
          location?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dream_entries: {
        Row: {
          ai_analysis: string | null
          content: string
          created_at: string
          dream_date: string
          emotions: Json | null
          id: string
          symbols: Json | null
          themes: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_analysis?: string | null
          content: string
          created_at?: string
          dream_date?: string
          emotions?: Json | null
          id?: string
          symbols?: Json | null
          themes?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_analysis?: string | null
          content?: string
          created_at?: string
          dream_date?: string
          emotions?: Json | null
          id?: string
          symbols?: Json | null
          themes?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      featured_listings: {
        Row: {
          created_at: string
          duration_days: number
          expires_at: string
          id: string
          is_active: boolean
          item_id: string
          item_type: string
          price: number
          started_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_days?: number
          expires_at: string
          id?: string
          is_active?: boolean
          item_id: string
          item_type: string
          price: number
          started_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_days?: number
          expires_at?: string
          id?: string
          is_active?: boolean
          item_id?: string
          item_type?: string
          price?: number
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      forum_comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          likes_count: number | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          likes_count?: number | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          likes_count?: number | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          likes_count: number | null
          replies_count: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          likes_count?: number | null
          replies_count?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          likes_count?: number | null
          replies_count?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      home_designs: {
        Row: {
          created_at: string | null
          credits_used: number | null
          design_prompt: string | null
          id: string
          original_image_url: string
          product_suggestions: Json | null
          redesigned_image_url: string | null
          room_type: string
          style_preference: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_used?: number | null
          design_prompt?: string | null
          id?: string
          original_image_url: string
          product_suggestions?: Json | null
          redesigned_image_url?: string | null
          room_type: string
          style_preference: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_used?: number | null
          design_prompt?: string | null
          id?: string
          original_image_url?: string
          product_suggestions?: Json | null
          redesigned_image_url?: string | null
          room_type?: string
          style_preference?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      influencer_followers: {
        Row: {
          created_at: string | null
          follower_id: string
          id: string
          influencer_id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          id?: string
          influencer_id: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          id?: string
          influencer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencer_followers_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencer_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "influencer_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_posts: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          influencer_id: string
          is_active: boolean | null
          likes_count: number | null
          media_type: string | null
          media_url: string | null
          title: string | null
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          influencer_id: string
          is_active?: boolean | null
          likes_count?: number | null
          media_type?: string | null
          media_url?: string | null
          title?: string | null
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          influencer_id?: string
          is_active?: boolean | null
          likes_count?: number | null
          media_type?: string | null
          media_url?: string | null
          title?: string | null
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "influencer_posts_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_profiles: {
        Row: {
          bio: string | null
          category: string
          cover_photo_url: string | null
          created_at: string | null
          display_name: string
          followers_count: number | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          profile_photo_url: string | null
          social_links: Json | null
          total_likes: number | null
          total_views: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          category: string
          cover_photo_url?: string | null
          created_at?: string | null
          display_name: string
          followers_count?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          profile_photo_url?: string | null
          social_links?: Json | null
          total_likes?: number | null
          total_views?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          category?: string
          cover_photo_url?: string | null
          created_at?: string | null
          display_name?: string
          followers_count?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          profile_photo_url?: string | null
          social_links?: Json | null
          total_likes?: number | null
          total_views?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      influencer_tips: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          influencer_id: string | null
          message: string | null
          sender_id: string
          status: string
          stripe_session_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          influencer_id?: string | null
          message?: string | null
          sender_id: string
          status?: string
          stripe_session_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          influencer_id?: string | null
          message?: string | null
          sender_id?: string
          status?: string
          stripe_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "influencer_tips_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          ai_feedback: string | null
          answers_given: Json | null
          created_at: string
          difficulty_level: string
          duration_minutes: number | null
          id: string
          job_description: string | null
          job_title: string
          overall_score: number | null
          questions_asked: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          answers_given?: Json | null
          created_at?: string
          difficulty_level?: string
          duration_minutes?: number | null
          id?: string
          job_description?: string | null
          job_title: string
          overall_score?: number | null
          questions_asked?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          answers_given?: Json | null
          created_at?: string
          difficulty_level?: string
          duration_minutes?: number | null
          id?: string
          job_description?: string | null
          job_title?: string
          overall_score?: number | null
          questions_asked?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applicant_id: string
          cover_letter: string | null
          created_at: string | null
          id: string
          job_id: string
          resume_url: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          applicant_id: string
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_id: string
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          applicant_id?: string
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_id?: string
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listing_payments: {
        Row: {
          amount: number
          created_at: string | null
          duration_days: number
          expires_at: string
          id: string
          job_id: string | null
          status: string
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          duration_days?: number
          expires_at: string
          id?: string
          job_id?: string | null
          status?: string
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          duration_days?: number
          expires_at?: string
          id?: string
          job_id?: string | null
          status?: string
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_listing_payments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          applications_count: number | null
          benefits: string | null
          category: Database["public"]["Enums"]["job_category"]
          company_name: string
          contact_email: string
          country: string
          created_at: string | null
          description: string
          employer_id: string
          id: string
          is_active: boolean | null
          job_type: Database["public"]["Enums"]["job_type"]
          location: string
          requirements: string | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          applications_count?: number | null
          benefits?: string | null
          category: Database["public"]["Enums"]["job_category"]
          company_name: string
          contact_email: string
          country: string
          created_at?: string | null
          description: string
          employer_id: string
          id?: string
          is_active?: boolean | null
          job_type: Database["public"]["Enums"]["job_type"]
          location: string
          requirements?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          applications_count?: number | null
          benefits?: string | null
          category?: Database["public"]["Enums"]["job_category"]
          company_name?: string
          contact_email?: string
          country?: string
          created_at?: string | null
          description?: string
          employer_id?: string
          id?: string
          is_active?: boolean | null
          job_type?: Database["public"]["Enums"]["job_type"]
          location?: string
          requirements?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          ai_insights: string | null
          content: string
          created_at: string
          emotions_detected: Json | null
          entry_date: string
          id: string
          mood: Database["public"]["Enums"]["mood_type"]
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_insights?: string | null
          content: string
          created_at?: string
          emotions_detected?: Json | null
          entry_date?: string
          id?: string
          mood: Database["public"]["Enums"]["mood_type"]
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_insights?: string | null
          content?: string
          created_at?: string
          emotions_detected?: Json | null
          entry_date?: string
          id?: string
          mood?: Database["public"]["Enums"]["mood_type"]
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      kids_drawings: {
        Row: {
          created_at: string | null
          difficulty: string | null
          drawing_url: string | null
          id: string
          steps_completed: number | null
          title: string
          total_steps: number | null
          tutorial_topic: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          difficulty?: string | null
          drawing_url?: string | null
          id?: string
          steps_completed?: number | null
          title: string
          total_steps?: number | null
          tutorial_topic: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          difficulty?: string | null
          drawing_url?: string | null
          id?: string
          steps_completed?: number | null
          title?: string
          total_steps?: number | null
          tutorial_topic?: string
          user_id?: string
        }
        Relationships: []
      }
      kids_episodes: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          episode_number: number
          id: string
          is_premium: boolean | null
          season_number: number | null
          show_id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
          views: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          episode_number: number
          id?: string
          is_premium?: boolean | null
          season_number?: number | null
          show_id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url: string
          views?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          episode_number?: number
          id?: string
          is_premium?: boolean | null
          season_number?: number | null
          show_id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kids_episodes_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "kids_shows"
            referencedColumns: ["id"]
          },
        ]
      }
      kids_favorites: {
        Row: {
          created_at: string
          id: string
          show_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          show_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          show_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kids_favorites_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "kids_shows"
            referencedColumns: ["id"]
          },
        ]
      }
      kids_homework: {
        Row: {
          ai_explanation: string | null
          created_at: string | null
          difficulty_level: string | null
          fun_facts: Json | null
          id: string
          question: string
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_explanation?: string | null
          created_at?: string | null
          difficulty_level?: string | null
          fun_facts?: Json | null
          id?: string
          question: string
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_explanation?: string | null
          created_at?: string | null
          difficulty_level?: string | null
          fun_facts?: Json | null
          id?: string
          question?: string
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      kids_math_progress: {
        Row: {
          accuracy_percentage: number | null
          created_at: string | null
          game_type: string
          id: string
          last_played_at: string | null
          level: number | null
          problems_solved: number | null
          score: number | null
          user_id: string
        }
        Insert: {
          accuracy_percentage?: number | null
          created_at?: string | null
          game_type: string
          id?: string
          last_played_at?: string | null
          level?: number | null
          problems_solved?: number | null
          score?: number | null
          user_id: string
        }
        Update: {
          accuracy_percentage?: number | null
          created_at?: string | null
          game_type?: string
          id?: string
          last_played_at?: string | null
          level?: number | null
          problems_solved?: number | null
          score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      kids_reading_sessions: {
        Row: {
          book_title: string
          completed: boolean | null
          comprehension_score: number | null
          content: string
          created_at: string | null
          current_page: number | null
          id: string
          quiz_results: Json | null
          updated_at: string | null
          user_id: string
          vocabulary_learned: Json | null
        }
        Insert: {
          book_title: string
          completed?: boolean | null
          comprehension_score?: number | null
          content: string
          created_at?: string | null
          current_page?: number | null
          id?: string
          quiz_results?: Json | null
          updated_at?: string | null
          user_id: string
          vocabulary_learned?: Json | null
        }
        Update: {
          book_title?: string
          completed?: boolean | null
          comprehension_score?: number | null
          content?: string
          created_at?: string | null
          current_page?: number | null
          id?: string
          quiz_results?: Json | null
          updated_at?: string | null
          user_id?: string
          vocabulary_learned?: Json | null
        }
        Relationships: []
      }
      kids_science_experiments: {
        Row: {
          ai_insights: Json | null
          category: string
          completed: boolean | null
          conclusion: string | null
          created_at: string | null
          experiment_name: string
          hypothesis: string | null
          id: string
          observations: string | null
          user_id: string
        }
        Insert: {
          ai_insights?: Json | null
          category: string
          completed?: boolean | null
          conclusion?: string | null
          created_at?: string | null
          experiment_name: string
          hypothesis?: string | null
          id?: string
          observations?: string | null
          user_id: string
        }
        Update: {
          ai_insights?: Json | null
          category?: string
          completed?: boolean | null
          conclusion?: string | null
          created_at?: string | null
          experiment_name?: string
          hypothesis?: string | null
          id?: string
          observations?: string | null
          user_id?: string
        }
        Relationships: []
      }
      kids_shows: {
        Row: {
          age_rating: string | null
          category: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_premium: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          age_rating?: string | null
          category: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_premium?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          age_rating?: string | null
          category?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_premium?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      kids_stories: {
        Row: {
          characters: Json | null
          created_at: string | null
          id: string
          illustration_url: string | null
          story_text: string
          theme: string | null
          title: string
          user_id: string
        }
        Insert: {
          characters?: Json | null
          created_at?: string | null
          id?: string
          illustration_url?: string | null
          story_text: string
          theme?: string | null
          title: string
          user_id: string
        }
        Update: {
          characters?: Json | null
          created_at?: string | null
          id?: string
          illustration_url?: string | null
          story_text?: string
          theme?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      kids_watch_history: {
        Row: {
          completed: boolean | null
          episode_id: string
          id: string
          last_watched_at: string
          user_id: string
          watch_progress: number | null
        }
        Insert: {
          completed?: boolean | null
          episode_id: string
          id?: string
          last_watched_at?: string
          user_id: string
          watch_progress?: number | null
        }
        Update: {
          completed?: boolean | null
          episode_id?: string
          id?: string
          last_watched_at?: string
          user_id?: string
          watch_progress?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kids_watch_history_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "kids_episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_certificates: {
        Row: {
          certificate_number: string | null
          certificate_url: string | null
          completion_score: number | null
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          instructor_name: string | null
          issue_date: string | null
          title: string
          user_id: string
        }
        Insert: {
          certificate_number?: string | null
          certificate_url?: string | null
          completion_score?: number | null
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          instructor_name?: string | null
          issue_date?: string | null
          title: string
          user_id: string
        }
        Update: {
          certificate_number?: string | null
          certificate_url?: string | null
          completion_score?: number | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          instructor_name?: string | null
          issue_date?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          completed_at: string | null
          completed_modules: Json | null
          content_id: string
          content_type: string
          created_at: string | null
          current_module: number | null
          id: string
          last_accessed: string | null
          progress_percentage: number | null
          time_spent_minutes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_modules?: Json | null
          content_id: string
          content_type: string
          created_at?: string | null
          current_module?: number | null
          id?: string
          last_accessed?: string | null
          progress_percentage?: number | null
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_modules?: Json | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          current_module?: number | null
          id?: string
          last_accessed?: string | null
          progress_percentage?: number | null
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      linkedin_enhancements: {
        Row: {
          created_at: string
          current_profile: string
          enhanced_profile: string | null
          id: string
          suggestions: Json | null
          target_industry: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_profile: string
          enhanced_profile?: string | null
          id?: string
          suggestions?: Json | null
          target_industry?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_profile?: string
          enhanced_profile?: string | null
          id?: string
          suggestions?: Json | null
          target_industry?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      live_streams: {
        Row: {
          created_at: string | null
          description: string | null
          ended_at: string | null
          id: string
          influencer_id: string
          is_live: boolean | null
          started_at: string | null
          stream_key: string
          stream_url: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          viewer_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          influencer_id: string
          is_live?: boolean | null
          started_at?: string | null
          stream_key: string
          stream_url?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          viewer_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          influencer_id?: string
          is_live?: boolean | null
          started_at?: string | null
          stream_key?: string
          stream_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          viewer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "live_streams_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_responses: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          offering_id: string
          receiver_id: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          offering_id: string
          receiver_id: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          offering_id?: string
          receiver_id?: string
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_responses_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "skill_offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          started_at: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          started_at?: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          started_at?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          created_at: string
          file_name: string
          file_type: string
          file_url: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_type: string
          file_url: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      megatalent_referral_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      megatalent_referral_earnings: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          paid: boolean | null
          period_end: string
          period_start: string
          referred_user_id: string
          referrer_id: string
          subscription_id: string
        }
        Insert: {
          amount?: number
          created_at?: string | null
          id?: string
          paid?: boolean | null
          period_end: string
          period_start: string
          referred_user_id: string
          referrer_id: string
          subscription_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          paid?: boolean | null
          period_end?: string
          period_start?: string
          referred_user_id?: string
          referrer_id?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "megatalent_referral_earnings_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "megatalent_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      megatalent_subscriptions: {
        Row: {
          bonus_votes: number | null
          created_at: string
          expires_at: string | null
          id: string
          price: number
          referred_by: string | null
          started_at: string
          status: string | null
          tier: Database["public"]["Enums"]["megatalent_tier"]
          updated_at: string
          user_id: string
          win_chance_boost: number | null
        }
        Insert: {
          bonus_votes?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          price: number
          referred_by?: string | null
          started_at?: string
          status?: string | null
          tier?: Database["public"]["Enums"]["megatalent_tier"]
          updated_at?: string
          user_id: string
          win_chance_boost?: number | null
        }
        Update: {
          bonus_votes?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          price?: number
          referred_by?: string | null
          started_at?: string
          status?: string | null
          tier?: Database["public"]["Enums"]["megatalent_tier"]
          updated_at?: string
          user_id?: string
          win_chance_boost?: number | null
        }
        Relationships: []
      }
      megatalent_winners: {
        Row: {
          category: Database["public"]["Enums"]["talent_category"]
          created_at: string
          id: string
          month: number
          prize_amount: number
          submission_id: string | null
          total_votes: number
          user_id: string
          year: number
        }
        Insert: {
          category: Database["public"]["Enums"]["talent_category"]
          created_at?: string
          id?: string
          month: number
          prize_amount?: number
          submission_id?: string | null
          total_votes?: number
          user_id: string
          year: number
        }
        Update: {
          category?: Database["public"]["Enums"]["talent_category"]
          created_at?: string
          id?: string
          month?: number
          prize_amount?: number
          submission_id?: string | null
          total_votes?: number
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "megatalent_winners_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "megatalent_leaderboard"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "megatalent_winners_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "talent_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_checkins: {
        Row: {
          achievements: string[] | null
          challenges: string[] | null
          created_at: string
          energy_level: number | null
          id: string
          mentor_area: Database["public"]["Enums"]["mentor_area"]
          mood_score: number | null
          notes: string | null
          user_id: string
        }
        Insert: {
          achievements?: string[] | null
          challenges?: string[] | null
          created_at?: string
          energy_level?: number | null
          id?: string
          mentor_area: Database["public"]["Enums"]["mentor_area"]
          mood_score?: number | null
          notes?: string | null
          user_id: string
        }
        Update: {
          achievements?: string[] | null
          challenges?: string[] | null
          created_at?: string
          energy_level?: number | null
          id?: string
          mentor_area?: Database["public"]["Enums"]["mentor_area"]
          mood_score?: number | null
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mentor_goals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          mentor_area: Database["public"]["Enums"]["mentor_area"]
          progress: number | null
          status: string
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          mentor_area: Database["public"]["Enums"]["mentor_area"]
          progress?: number | null
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          mentor_area?: Database["public"]["Enums"]["mentor_area"]
          progress?: number | null
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mentor_progress: {
        Row: {
          created_at: string
          id: string
          mentor_area: Database["public"]["Enums"]["mentor_area"]
          metric_name: string
          metric_value: number
          notes: string | null
          recorded_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentor_area: Database["public"]["Enums"]["mentor_area"]
          metric_name: string
          metric_value: number
          notes?: string | null
          recorded_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mentor_area?: Database["public"]["Enums"]["mentor_area"]
          metric_name?: string
          metric_value?: number
          notes?: string | null
          recorded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mentor_sessions: {
        Row: {
          created_at: string
          id: string
          mentor_area: Database["public"]["Enums"]["mentor_area"]
          messages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentor_area: Database["public"]["Enums"]["mentor_area"]
          messages?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mentor_area?: Database["public"]["Enums"]["mentor_area"]
          messages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mentor_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          mentor_area: Database["public"]["Enums"]["mentor_area"]
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          mentor_area: Database["public"]["Enums"]["mentor_area"]
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          mentor_area?: Database["public"]["Enums"]["mentor_area"]
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_logs: {
        Row: {
          created_at: string
          energy_level: number | null
          id: string
          log_date: string
          mood: Database["public"]["Enums"]["mood_type"]
          notes: string | null
          stress_level: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          energy_level?: number | null
          id?: string
          log_date?: string
          mood: Database["public"]["Enums"]["mood_type"]
          notes?: string | null
          stress_level?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          energy_level?: number | null
          id?: string
          log_date?: string
          mood?: Database["public"]["Enums"]["mood_type"]
          notes?: string | null
          stress_level?: number | null
          user_id?: string
        }
        Relationships: []
      }
      mystery_box_items: {
        Row: {
          box_id: string | null
          created_at: string | null
          drop_chance: number
          duration_days: number | null
          id: string
          item_data: Json | null
          item_name: string
          item_type: string
          rarity: Database["public"]["Enums"]["item_rarity"]
        }
        Insert: {
          box_id?: string | null
          created_at?: string | null
          drop_chance?: number
          duration_days?: number | null
          id?: string
          item_data?: Json | null
          item_name: string
          item_type: string
          rarity?: Database["public"]["Enums"]["item_rarity"]
        }
        Update: {
          box_id?: string | null
          created_at?: string | null
          drop_chance?: number
          duration_days?: number | null
          id?: string
          item_data?: Json | null
          item_name?: string
          item_type?: string
          rarity?: Database["public"]["Enums"]["item_rarity"]
        }
        Relationships: [
          {
            foreignKeyName: "mystery_box_items_box_id_fkey"
            columns: ["box_id"]
            isOneToOne: false
            referencedRelation: "mystery_boxes"
            referencedColumns: ["id"]
          },
        ]
      }
      mystery_box_rewards: {
        Row: {
          expires_at: string | null
          id: string
          is_active: boolean | null
          item_id: string | null
          received_at: string | null
          user_box_id: string | null
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          item_id?: string | null
          received_at?: string | null
          user_box_id?: string | null
          user_id: string
        }
        Update: {
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          item_id?: string | null
          received_at?: string | null
          user_box_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mystery_box_rewards_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "mystery_box_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mystery_box_rewards_user_box_id_fkey"
            columns: ["user_box_id"]
            isOneToOne: false
            referencedRelation: "user_mystery_boxes"
            referencedColumns: ["id"]
          },
        ]
      }
      mystery_boxes: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          price: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          price: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      negotiation_sessions: {
        Row: {
          ai_advice: string | null
          conversation_history: Json | null
          created_at: string
          current_salary: number | null
          id: string
          job_title: string
          negotiation_strategy: string | null
          target_salary: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_advice?: string | null
          conversation_history?: Json | null
          created_at?: string
          current_salary?: number | null
          id?: string
          job_title: string
          negotiation_strategy?: string | null
          target_salary?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_advice?: string | null
          conversation_history?: Json | null
          created_at?: string
          current_salary?: number | null
          id?: string
          job_title?: string
          negotiation_strategy?: string | null
          target_salary?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      numerology_readings: {
        Row: {
          birth_date: string
          created_at: string | null
          destiny_number: number | null
          full_name: string
          id: string
          interpretation: string
          is_premium: boolean | null
          life_path_number: number | null
          lucky_numbers: number[] | null
          personality_number: number | null
          soul_urge_number: number | null
          user_id: string
        }
        Insert: {
          birth_date: string
          created_at?: string | null
          destiny_number?: number | null
          full_name: string
          id?: string
          interpretation: string
          is_premium?: boolean | null
          life_path_number?: number | null
          lucky_numbers?: number[] | null
          personality_number?: number | null
          soul_urge_number?: number | null
          user_id: string
        }
        Update: {
          birth_date?: string
          created_at?: string | null
          destiny_number?: number | null
          full_name?: string
          id?: string
          interpretation?: string
          is_premium?: boolean | null
          life_path_number?: number | null
          lucky_numbers?: number[] | null
          personality_number?: number | null
          soul_urge_number?: number | null
          user_id?: string
        }
        Relationships: []
      }
      old_photos: {
        Row: {
          created_at: string | null
          credits_used: number | null
          description: string | null
          estimated_year: number | null
          id: string
          is_public: boolean | null
          original_url: string
          restoration_type: string | null
          restored_url: string | null
          title: string | null
          user_id: string
          views: number | null
        }
        Insert: {
          created_at?: string | null
          credits_used?: number | null
          description?: string | null
          estimated_year?: number | null
          id?: string
          is_public?: boolean | null
          original_url: string
          restoration_type?: string | null
          restored_url?: string | null
          title?: string | null
          user_id: string
          views?: number | null
        }
        Update: {
          created_at?: string | null
          credits_used?: number | null
          description?: string | null
          estimated_year?: number | null
          id?: string
          is_public?: boolean | null
          original_url?: string
          restoration_type?: string | null
          restored_url?: string | null
          title?: string | null
          user_id?: string
          views?: number | null
        }
        Relationships: []
      }
      outfit_recommendations: {
        Row: {
          ai_description: string
          created_at: string
          id: string
          is_favorite: boolean | null
          item_ids: string[]
          occasion: Database["public"]["Enums"]["occasion_type"]
          season: Database["public"]["Enums"]["season_type"]
          styling_tips: string | null
          user_id: string
        }
        Insert: {
          ai_description: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          item_ids: string[]
          occasion: Database["public"]["Enums"]["occasion_type"]
          season: Database["public"]["Enums"]["season_type"]
          styling_tips?: string | null
          user_id: string
        }
        Update: {
          ai_description?: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          item_ids?: string[]
          occasion?: Database["public"]["Enums"]["occasion_type"]
          season?: Database["public"]["Enums"]["season_type"]
          styling_tips?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pet_accessories: {
        Row: {
          accessory_type: Database["public"]["Enums"]["accessory_type"]
          created_at: string
          description: string | null
          effect: Json | null
          id: string
          image_url: string | null
          is_premium: boolean | null
          name: string
          price: number | null
          rarity: Database["public"]["Enums"]["pet_rarity"] | null
        }
        Insert: {
          accessory_type: Database["public"]["Enums"]["accessory_type"]
          created_at?: string
          description?: string | null
          effect?: Json | null
          id?: string
          image_url?: string | null
          is_premium?: boolean | null
          name: string
          price?: number | null
          rarity?: Database["public"]["Enums"]["pet_rarity"] | null
        }
        Update: {
          accessory_type?: Database["public"]["Enums"]["accessory_type"]
          created_at?: string
          description?: string | null
          effect?: Json | null
          id?: string
          image_url?: string | null
          is_premium?: boolean | null
          name?: string
          price?: number | null
          rarity?: Database["public"]["Enums"]["pet_rarity"] | null
        }
        Relationships: []
      }
      pet_activities: {
        Row: {
          activity_type: string
          created_at: string
          details: Json | null
          energy_change: number | null
          experience_gained: number | null
          happiness_change: number | null
          hunger_change: number | null
          id: string
          pet_id: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          details?: Json | null
          energy_change?: number | null
          experience_gained?: number | null
          happiness_change?: number | null
          hunger_change?: number | null
          id?: string
          pet_id: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          details?: Json | null
          energy_change?: number | null
          experience_gained?: number | null
          happiness_change?: number | null
          hunger_change?: number | null
          id?: string
          pet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_activities_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_breeding: {
        Row: {
          breeding_completed_at: string | null
          breeding_started_at: string
          created_at: string
          id: string
          is_premium_breeding: boolean | null
          offspring_id: string | null
          parent1_id: string
          parent2_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          breeding_completed_at?: string | null
          breeding_started_at?: string
          created_at?: string
          id?: string
          is_premium_breeding?: boolean | null
          offspring_id?: string | null
          parent1_id: string
          parent2_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          breeding_completed_at?: string | null
          breeding_started_at?: string
          created_at?: string
          id?: string
          is_premium_breeding?: boolean | null
          offspring_id?: string | null
          parent1_id?: string
          parent2_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_breeding_offspring_id_fkey"
            columns: ["offspring_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_breeding_parent1_id_fkey"
            columns: ["parent1_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_breeding_parent2_id_fkey"
            columns: ["parent2_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_game_scores: {
        Row: {
          game_type: string
          id: string
          pet_id: string
          played_at: string
          rewards: Json | null
          score: number
          user_id: string
        }
        Insert: {
          game_type: string
          id?: string
          pet_id: string
          played_at?: string
          rewards?: Json | null
          score: number
          user_id: string
        }
        Update: {
          game_type?: string
          id?: string
          pet_id?: string
          played_at?: string
          rewards?: Json | null
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_game_scores_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_trades: {
        Row: {
          accepted_at: string | null
          completed_at: string | null
          created_at: string
          from_user_id: string
          id: string
          message: string | null
          offered_credits: number | null
          offered_pet_id: string
          requested_credits: number | null
          requested_pet_id: string | null
          status: string | null
          to_user_id: string
        }
        Insert: {
          accepted_at?: string | null
          completed_at?: string | null
          created_at?: string
          from_user_id: string
          id?: string
          message?: string | null
          offered_credits?: number | null
          offered_pet_id: string
          requested_credits?: number | null
          requested_pet_id?: string | null
          status?: string | null
          to_user_id: string
        }
        Update: {
          accepted_at?: string | null
          completed_at?: string | null
          created_at?: string
          from_user_id?: string
          id?: string
          message?: string | null
          offered_credits?: number | null
          offered_pet_id?: string
          requested_credits?: number | null
          requested_pet_id?: string | null
          status?: string | null
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_trades_offered_pet_id_fkey"
            columns: ["offered_pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_trades_requested_pet_id_fkey"
            columns: ["requested_pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_types: {
        Row: {
          base_energy: number | null
          base_happiness: number | null
          base_hunger: number | null
          created_at: string
          description: string | null
          evolution_levels: Json | null
          id: string
          image_url: string | null
          is_premium: boolean | null
          name: string
          price: number | null
          species: Database["public"]["Enums"]["pet_species"]
        }
        Insert: {
          base_energy?: number | null
          base_happiness?: number | null
          base_hunger?: number | null
          created_at?: string
          description?: string | null
          evolution_levels?: Json | null
          id?: string
          image_url?: string | null
          is_premium?: boolean | null
          name: string
          price?: number | null
          species: Database["public"]["Enums"]["pet_species"]
        }
        Update: {
          base_energy?: number | null
          base_happiness?: number | null
          base_hunger?: number | null
          created_at?: string
          description?: string | null
          evolution_levels?: Json | null
          id?: string
          image_url?: string | null
          is_premium?: boolean | null
          name?: string
          price?: number | null
          species?: Database["public"]["Enums"]["pet_species"]
        }
        Relationships: []
      }
      pets: {
        Row: {
          birthday: string
          created_at: string
          customization: Json | null
          energy: number | null
          evolution_stage: number | null
          experience: number | null
          happiness: number | null
          hunger: number | null
          id: string
          is_favorite: boolean | null
          last_activity_at: string | null
          last_fed_at: string | null
          last_played_at: string | null
          level: number | null
          mood: Database["public"]["Enums"]["pet_mood"] | null
          name: string
          pet_type_id: string
          total_activities: number | null
          total_games_played: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birthday?: string
          created_at?: string
          customization?: Json | null
          energy?: number | null
          evolution_stage?: number | null
          experience?: number | null
          happiness?: number | null
          hunger?: number | null
          id?: string
          is_favorite?: boolean | null
          last_activity_at?: string | null
          last_fed_at?: string | null
          last_played_at?: string | null
          level?: number | null
          mood?: Database["public"]["Enums"]["pet_mood"] | null
          name: string
          pet_type_id: string
          total_activities?: number | null
          total_games_played?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birthday?: string
          created_at?: string
          customization?: Json | null
          energy?: number | null
          evolution_stage?: number | null
          experience?: number | null
          happiness?: number | null
          hunger?: number | null
          id?: string
          is_favorite?: boolean | null
          last_activity_at?: string | null
          last_fed_at?: string | null
          last_played_at?: string | null
          level?: number | null
          mood?: Database["public"]["Enums"]["pet_mood"] | null
          name?: string
          pet_type_id?: string
          total_activities?: number | null
          total_games_played?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pets_pet_type_id_fkey"
            columns: ["pet_type_id"]
            isOneToOne: false
            referencedRelation: "pet_types"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_credits: {
        Row: {
          created_at: string | null
          credits_remaining: number
          id: string
          total_credits_purchased: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_remaining?: number
          id?: string
          total_credits_purchased?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_remaining?: number
          id?: string
          total_credits_purchased?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      plant_care_schedules: {
        Row: {
          care_type: string
          created_at: string | null
          frequency_days: number
          id: string
          last_done_date: string | null
          next_due_date: string
          notes: string | null
          plant_id: string | null
          reminder_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          care_type: string
          created_at?: string | null
          frequency_days: number
          id?: string
          last_done_date?: string | null
          next_due_date: string
          notes?: string | null
          plant_id?: string | null
          reminder_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          care_type?: string
          created_at?: string | null
          frequency_days?: number
          id?: string
          last_done_date?: string | null
          next_due_date?: string
          notes?: string | null
          plant_id?: string | null
          reminder_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plant_care_schedules_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_diagnoses: {
        Row: {
          created_at: string | null
          credits_used: number | null
          diagnosis: string | null
          id: string
          image_url: string
          plant_id: string | null
          possible_diseases: Json | null
          severity_level: string | null
          symptoms_description: string | null
          treatment_recommendations: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_used?: number | null
          diagnosis?: string | null
          id?: string
          image_url: string
          plant_id?: string | null
          possible_diseases?: Json | null
          severity_level?: string | null
          symptoms_description?: string | null
          treatment_recommendations?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_used?: number | null
          diagnosis?: string | null
          id?: string
          image_url?: string
          plant_id?: string | null
          possible_diseases?: Json | null
          severity_level?: string | null
          symptoms_description?: string | null
          treatment_recommendations?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plant_diagnoses_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_identifications: {
        Row: {
          additional_info: string | null
          care_tips: Json | null
          confidence_score: number | null
          created_at: string | null
          credits_used: number | null
          id: string
          identified_name: string | null
          image_url: string
          scientific_name: string | null
          user_id: string
        }
        Insert: {
          additional_info?: string | null
          care_tips?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          credits_used?: number | null
          id?: string
          identified_name?: string | null
          image_url: string
          scientific_name?: string | null
          user_id: string
        }
        Update: {
          additional_info?: string | null
          care_tips?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          credits_used?: number | null
          id?: string
          identified_name?: string | null
          image_url?: string
          scientific_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      plants: {
        Row: {
          added_date: string | null
          care_instructions: Json | null
          common_name: string | null
          created_at: string | null
          id: string
          identified_from_photo: boolean | null
          image_url: string | null
          location: string | null
          name: string
          notes: string | null
          plant_type: string | null
          scientific_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          added_date?: string | null
          care_instructions?: Json | null
          common_name?: string | null
          created_at?: string | null
          id?: string
          identified_from_photo?: boolean | null
          image_url?: string | null
          location?: string | null
          name: string
          notes?: string | null
          plant_type?: string | null
          scientific_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          added_date?: string | null
          care_instructions?: Json | null
          common_name?: string | null
          created_at?: string | null
          id?: string
          identified_from_photo?: boolean | null
          image_url?: string | null
          location?: string | null
          name?: string
          notes?: string | null
          plant_type?: string | null
          scientific_name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      platform_gifts: {
        Row: {
          category: string
          created_at: string | null
          icon: string
          id: string
          name: string
          price: number
        }
        Insert: {
          category: string
          created_at?: string | null
          icon: string
          id?: string
          name: string
          price: number
        }
        Update: {
          category?: string
          created_at?: string | null
          icon?: string
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string
          id: string
          likes_count: number | null
          shares_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          created_at?: string
          id?: string
          likes_count?: number | null
          shares_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          created_at?: string
          id?: string
          likes_count?: number | null
          shares_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      premium_avatars: {
        Row: {
          available_until: string | null
          avatar_url: string
          created_at: string | null
          credit_cost: number
          description: string | null
          id: string
          is_active: boolean | null
          is_animated: boolean | null
          is_limited_edition: boolean | null
          minted_count: number | null
          name: string
          rarity: string | null
          season: string | null
          total_supply: number | null
        }
        Insert: {
          available_until?: string | null
          avatar_url: string
          created_at?: string | null
          credit_cost?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_animated?: boolean | null
          is_limited_edition?: boolean | null
          minted_count?: number | null
          name: string
          rarity?: string | null
          season?: string | null
          total_supply?: number | null
        }
        Update: {
          available_until?: string | null
          avatar_url?: string
          created_at?: string | null
          credit_cost?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_animated?: boolean | null
          is_limited_edition?: boolean | null
          minted_count?: number | null
          name?: string
          rarity?: string | null
          season?: string | null
          total_supply?: number | null
        }
        Relationships: []
      }
      premium_badges: {
        Row: {
          available_until: string | null
          created_at: string | null
          credit_cost: number
          description: string | null
          icon: string
          id: string
          is_active: boolean | null
          is_limited_edition: boolean | null
          minted_count: number | null
          name: string
          rarity: string | null
          season: string | null
          total_supply: number | null
        }
        Insert: {
          available_until?: string | null
          created_at?: string | null
          credit_cost?: number
          description?: string | null
          icon: string
          id?: string
          is_active?: boolean | null
          is_limited_edition?: boolean | null
          minted_count?: number | null
          name: string
          rarity?: string | null
          season?: string | null
          total_supply?: number | null
        }
        Update: {
          available_until?: string | null
          created_at?: string | null
          credit_cost?: number
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          is_limited_edition?: boolean | null
          minted_count?: number | null
          name?: string
          rarity?: string | null
          season?: string | null
          total_supply?: number | null
        }
        Relationships: []
      }
      premium_features: {
        Row: {
          created_at: string | null
          credit_cost: number
          description: string | null
          feature_name: string
          feature_type: string
          icon: string | null
          id: string
          is_active: boolean | null
        }
        Insert: {
          created_at?: string | null
          credit_cost?: number
          description?: string | null
          feature_name: string
          feature_type: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
        }
        Update: {
          created_at?: string | null
          credit_cost?: number
          description?: string | null
          feature_name?: string
          feature_type?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      premium_themes: {
        Row: {
          available_until: string | null
          created_at: string | null
          credit_cost: number
          description: string | null
          id: string
          is_active: boolean | null
          is_limited_edition: boolean | null
          minted_count: number | null
          name: string
          preview_image: string | null
          season: string | null
          theme_data: Json
          total_supply: number | null
        }
        Insert: {
          available_until?: string | null
          created_at?: string | null
          credit_cost?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_limited_edition?: boolean | null
          minted_count?: number | null
          name: string
          preview_image?: string | null
          season?: string | null
          theme_data: Json
          total_supply?: number | null
        }
        Update: {
          available_until?: string | null
          created_at?: string | null
          credit_cost?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_limited_edition?: boolean | null
          minted_count?: number | null
          name?: string
          preview_image?: string | null
          season?: string | null
          theme_data?: Json
          total_supply?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          company: string | null
          created_at: string
          email: string | null
          full_name: string | null
          iban: string | null
          id: string
          interests: string[] | null
          location: string | null
          occupation: string | null
          phone: string | null
          social_links: Json | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          iban?: string | null
          id: string
          interests?: string[] | null
          location?: string | null
          occupation?: string | null
          phone?: string | null
          social_links?: Json | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          iban?: string | null
          id?: string
          interests?: string[] | null
          location?: string | null
          occupation?: string | null
          phone?: string | null
          social_links?: Json | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      psychology_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "psychology_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "psychology_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      psychology_sessions: {
        Row: {
          created_at: string
          id: string
          last_activity: string
          session_token: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_activity?: string
          session_token: string
        }
        Update: {
          created_at?: string
          id?: string
          last_activity?: string
          session_token?: string
        }
        Relationships: []
      }
      purchased_learning_content: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          expires_at: string | null
          id: string
          price: number
          purchase_date: string | null
          status: string | null
          stripe_session_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          price: number
          purchase_date?: string | null
          status?: string | null
          stripe_session_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          price?: number
          purchase_date?: string | null
          status?: string | null
          stripe_session_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          calories: number
          category: string
          created_at: string
          description: string
          difficulty: string
          id: string
          image_url: string
          ingredients: string[]
          instructions: string[]
          is_active: boolean | null
          servings: number
          tags: string[] | null
          time: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          calories: number
          category: string
          created_at?: string
          description: string
          difficulty: string
          id?: string
          image_url: string
          ingredients?: string[]
          instructions?: string[]
          is_active?: boolean | null
          servings: number
          tags?: string[] | null
          time: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          calories?: number
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          id?: string
          image_url?: string
          ingredients?: string[]
          instructions?: string[]
          is_active?: boolean | null
          servings?: number
          tags?: string[] | null
          time?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      routine_entries: {
        Row: {
          created_at: string | null
          energy_level: number | null
          entry_date: string
          id: string
          mood_score: number | null
          notes: string | null
          sleep_hours: number | null
          social_hours: number | null
          updated_at: string | null
          user_id: string
          work_hours: number | null
          workout_minutes: number | null
        }
        Insert: {
          created_at?: string | null
          energy_level?: number | null
          entry_date?: string
          id?: string
          mood_score?: number | null
          notes?: string | null
          sleep_hours?: number | null
          social_hours?: number | null
          updated_at?: string | null
          user_id: string
          work_hours?: number | null
          workout_minutes?: number | null
        }
        Update: {
          created_at?: string | null
          energy_level?: number | null
          entry_date?: string
          id?: string
          mood_score?: number | null
          notes?: string | null
          sleep_hours?: number | null
          social_hours?: number | null
          updated_at?: string | null
          user_id?: string
          work_hours?: number | null
          workout_minutes?: number | null
        }
        Relationships: []
      }
      saved_videos: {
        Row: {
          created_at: string
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_videos_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      sent_platform_gifts: {
        Row: {
          context_id: string | null
          context_type: string
          created_at: string | null
          gift_id: string | null
          id: string
          message: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          context_id?: string | null
          context_type: string
          created_at?: string | null
          gift_id?: string | null
          id?: string
          message?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          context_id?: string | null
          context_type?: string
          created_at?: string | null
          gift_id?: string | null
          id?: string
          message?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sent_platform_gifts_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "platform_gifts"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_wishlist: {
        Row: {
          affiliate_link: string | null
          category: Database["public"]["Enums"]["clothing_category"] | null
          created_at: string
          id: string
          is_purchased: boolean | null
          item_name: string
          preferred_brands: string[] | null
          price_range: string | null
          user_id: string
        }
        Insert: {
          affiliate_link?: string | null
          category?: Database["public"]["Enums"]["clothing_category"] | null
          created_at?: string
          id?: string
          is_purchased?: boolean | null
          item_name: string
          preferred_brands?: string[] | null
          price_range?: string | null
          user_id: string
        }
        Update: {
          affiliate_link?: string | null
          category?: Database["public"]["Enums"]["clothing_category"] | null
          created_at?: string
          id?: string
          is_purchased?: boolean | null
          item_name?: string
          preferred_brands?: string[] | null
          price_range?: string | null
          user_id?: string
        }
        Relationships: []
      }
      skill_offerings: {
        Row: {
          category: Database["public"]["Enums"]["skill_category"]
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_active: boolean | null
          location: string | null
          price_per_hour: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["skill_category"]
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location?: string | null
          price_per_hour?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["skill_category"]
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location?: string | null
          price_per_hour?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          caption: string | null
          created_at: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          media_type: string
          media_url: string
          user_id: string
          views_count: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          media_type: string
          media_url: string
          user_id: string
          views_count?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          media_type?: string
          media_url?: string
          user_id?: string
          views_count?: number | null
        }
        Relationships: []
      }
      story_poll_votes: {
        Row: {
          created_at: string | null
          id: string
          poll_id: string
          user_id: string
          vote: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          poll_id: string
          user_id: string
          vote: string
        }
        Update: {
          created_at?: string | null
          id?: string
          poll_id?: string
          user_id?: string
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "story_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      story_polls: {
        Row: {
          created_at: string | null
          id: string
          option_a: string
          option_b: string
          question: string
          story_id: string
          votes_a: number | null
          votes_b: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_a: string
          option_b: string
          question: string
          story_id: string
          votes_a?: number | null
          votes_b?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          option_a?: string
          option_b?: string
          question?: string
          story_id?: string
          votes_a?: number | null
          votes_b?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "story_polls_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_reactions: {
        Row: {
          created_at: string | null
          id: string
          reaction: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reaction: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reaction?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_reactions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_views: {
        Row: {
          id: string
          story_id: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          id?: string
          story_id: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          id?: string
          story_id?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_gifts: {
        Row: {
          amount: number
          created_at: string | null
          gift_id: string | null
          gift_type: string
          id: string
          message: string | null
          sender_id: string
          status: string | null
          stream_id: string
          stripe_session_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string | null
          gift_id?: string | null
          gift_type: string
          id?: string
          message?: string | null
          sender_id: string
          status?: string | null
          stream_id: string
          stripe_session_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          gift_id?: string | null
          gift_type?: string
          id?: string
          message?: string | null
          sender_id?: string
          status?: string | null
          stream_id?: string
          stripe_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stream_gifts_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "platform_gifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_gifts_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          stream_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          stream_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          stream_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_messages_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_viewers: {
        Row: {
          id: string
          joined_at: string | null
          left_at: string | null
          stream_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          left_at?: string | null
          stream_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          left_at?: string | null
          stream_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_viewers_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      styling_sessions: {
        Row: {
          ai_recommendations: Json | null
          completed_at: string | null
          created_at: string
          credits_used: number | null
          id: string
          occasion: string | null
          preferences: Json | null
          session_type: string
          status: string | null
          user_id: string
        }
        Insert: {
          ai_recommendations?: Json | null
          completed_at?: string | null
          created_at?: string
          credits_used?: number | null
          id?: string
          occasion?: string | null
          preferences?: Json | null
          session_type: string
          status?: string | null
          user_id: string
        }
        Update: {
          ai_recommendations?: Json | null
          completed_at?: string | null
          created_at?: string
          credits_used?: number | null
          id?: string
          occasion?: string | null
          preferences?: Json | null
          session_type?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          price: number
          started_at: string
          status: string
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          price?: number
          started_at?: string
          status?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          price?: number
          started_at?: string
          status?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      talent_comments: {
        Row: {
          comment_text: string
          created_at: string
          id: string
          submission_id: string
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          id?: string
          submission_id: string
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          submission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_comments_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "megatalent_leaderboard"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "talent_comments_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "talent_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_submissions: {
        Row: {
          category: Database["public"]["Enums"]["talent_category"]
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          media_type: string | null
          media_url: string | null
          title: string
          updated_at: string
          user_id: string
          votes_count: number | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["talent_category"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          media_type?: string | null
          media_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          votes_count?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["talent_category"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          media_type?: string | null
          media_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          votes_count?: number | null
        }
        Relationships: []
      }
      talent_votes: {
        Row: {
          created_at: string
          id: string
          submission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          submission_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          submission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_votes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "megatalent_leaderboard"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "talent_votes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "talent_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      tarot_readings: {
        Row: {
          cards: Json
          created_at: string | null
          id: string
          interpretation: string
          is_premium: boolean | null
          question: string | null
          reading_type: Database["public"]["Enums"]["reading_type"] | null
          user_id: string
        }
        Insert: {
          cards: Json
          created_at?: string | null
          id?: string
          interpretation: string
          is_premium?: boolean | null
          question?: string | null
          reading_type?: Database["public"]["Enums"]["reading_type"] | null
          user_id: string
        }
        Update: {
          cards?: Json
          created_at?: string | null
          id?: string
          interpretation?: string
          is_premium?: boolean | null
          question?: string | null
          reading_type?: Database["public"]["Enums"]["reading_type"] | null
          user_id?: string
        }
        Relationships: []
      }
      tracks: {
        Row: {
          artist: string
          audio_url: string
          bpm: number
          created_at: string
          duration: string
          genre: string
          id: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          artist: string
          audio_url: string
          bpm: number
          created_at?: string
          duration: string
          genre: string
          id?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          artist?: string
          audio_url?: string
          bpm?: number
          created_at?: string
          duration?: string
          genre?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          buyer_id: string | null
          commission_amount: number
          commission_rate: number
          created_at: string
          id: string
          item_id: string | null
          item_type: string | null
          seller_amount: number | null
          seller_id: string | null
          status: string
          stream_id: string | null
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          buyer_id?: string | null
          commission_amount: number
          commission_rate?: number
          created_at?: string
          id?: string
          item_id?: string | null
          item_type?: string | null
          seller_amount?: number | null
          seller_id?: string | null
          status?: string
          stream_id?: string | null
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          buyer_id?: string | null
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          id?: string
          item_id?: string | null
          item_type?: string | null
          seller_amount?: number | null
          seller_id?: string | null
          status?: string
          stream_id?: string | null
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_character_access: {
        Row: {
          character_id: string
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          character_id: string
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          character_id?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_character_access_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "ai_characters"
            referencedColumns: ["id"]
          },
        ]
      }
      user_collectibles: {
        Row: {
          acquired_at: string
          acquired_method: string
          collectible_id: string | null
          created_at: string
          id: string
          is_for_sale: boolean | null
          is_for_trade: boolean | null
          unique_properties: Json | null
          user_id: string
        }
        Insert: {
          acquired_at?: string
          acquired_method: string
          collectible_id?: string | null
          created_at?: string
          id?: string
          is_for_sale?: boolean | null
          is_for_trade?: boolean | null
          unique_properties?: Json | null
          user_id: string
        }
        Update: {
          acquired_at?: string
          acquired_method?: string
          collectible_id?: string | null
          created_at?: string
          id?: string
          is_for_sale?: boolean | null
          is_for_trade?: boolean | null
          unique_properties?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_collectibles_collectible_id_fkey"
            columns: ["collectible_id"]
            isOneToOne: false
            referencedRelation: "collectibles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_message_limits: {
        Row: {
          id: string
          is_premium: boolean | null
          last_reset_date: string | null
          messages_used_today: number | null
          user_id: string
        }
        Insert: {
          id?: string
          is_premium?: boolean | null
          last_reset_date?: string | null
          messages_used_today?: number | null
          user_id: string
        }
        Update: {
          id?: string
          is_premium?: boolean | null
          last_reset_date?: string | null
          messages_used_today?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_mystery_boxes: {
        Row: {
          box_id: string | null
          id: string
          is_opened: boolean | null
          opened_at: string | null
          purchased_at: string | null
          user_id: string
        }
        Insert: {
          box_id?: string | null
          id?: string
          is_opened?: boolean | null
          opened_at?: string | null
          purchased_at?: string | null
          user_id: string
        }
        Update: {
          box_id?: string | null
          id?: string
          is_opened?: boolean | null
          opened_at?: string | null
          purchased_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_mystery_boxes_box_id_fkey"
            columns: ["box_id"]
            isOneToOne: false
            referencedRelation: "mystery_boxes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_pet_accessories: {
        Row: {
          accessory_id: string
          acquired_at: string
          id: string
          quantity: number | null
          user_id: string
        }
        Insert: {
          accessory_id: string
          acquired_at?: string
          id?: string
          quantity?: number | null
          user_id: string
        }
        Update: {
          accessory_id?: string
          acquired_at?: string
          id?: string
          quantity?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_pet_accessories_accessory_id_fkey"
            columns: ["accessory_id"]
            isOneToOne: false
            referencedRelation: "pet_accessories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points: {
        Row: {
          created_at: string | null
          current_level_points: number | null
          id: string
          level: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_level_points?: number | null
          id?: string
          level?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_level_points?: number | null
          id?: string
          level?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_premium_avatars: {
        Row: {
          acquired_at: string | null
          avatar_id: string | null
          id: string
          is_equipped: boolean | null
          user_id: string
        }
        Insert: {
          acquired_at?: string | null
          avatar_id?: string | null
          id?: string
          is_equipped?: boolean | null
          user_id: string
        }
        Update: {
          acquired_at?: string | null
          avatar_id?: string | null
          id?: string
          is_equipped?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_premium_avatars_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "premium_avatars"
            referencedColumns: ["id"]
          },
        ]
      }
      user_premium_badges: {
        Row: {
          acquired_at: string | null
          badge_id: string | null
          id: string
          is_equipped: boolean | null
          user_id: string
        }
        Insert: {
          acquired_at?: string | null
          badge_id?: string | null
          id?: string
          is_equipped?: boolean | null
          user_id: string
        }
        Update: {
          acquired_at?: string | null
          badge_id?: string | null
          id?: string
          is_equipped?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_premium_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "premium_badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_premium_purchases: {
        Row: {
          credits_spent: number
          feature_id: string | null
          feature_name: string
          id: string
          purchased_at: string | null
          user_id: string
        }
        Insert: {
          credits_spent: number
          feature_id?: string | null
          feature_name: string
          id?: string
          purchased_at?: string | null
          user_id: string
        }
        Update: {
          credits_spent?: number
          feature_id?: string | null
          feature_name?: string
          id?: string
          purchased_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_premium_purchases_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "premium_features"
            referencedColumns: ["id"]
          },
        ]
      }
      user_premium_themes: {
        Row: {
          acquired_at: string | null
          id: string
          is_active: boolean | null
          theme_id: string | null
          user_id: string
        }
        Insert: {
          acquired_at?: string | null
          id?: string
          is_active?: boolean | null
          theme_id?: string | null
          user_id: string
        }
        Update: {
          acquired_at?: string | null
          id?: string
          is_active?: boolean | null
          theme_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_premium_themes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "premium_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
          video_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          video_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_comments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_likes: {
        Row: {
          created_at: string
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_likes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_reactions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          audio_track_name: string | null
          audio_track_url: string | null
          comments_count: number | null
          created_at: string
          description: string | null
          duration: number | null
          id: string
          is_active: boolean | null
          likes_count: number | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          user_id: string
          video_url: string
          views_count: number | null
        }
        Insert: {
          audio_track_name?: string | null
          audio_track_url?: string | null
          comments_count?: number | null
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          is_active?: boolean | null
          likes_count?: number | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          video_url: string
          views_count?: number | null
        }
        Update: {
          audio_track_name?: string | null
          audio_track_url?: string | null
          comments_count?: number | null
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          is_active?: boolean | null
          likes_count?: number | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string
          views_count?: number | null
        }
        Relationships: []
      }
      virtual_tours: {
        Row: {
          created_at: string | null
          credits_used: number | null
          description: string | null
          destination: string
          id: string
          image_urls: string[] | null
          tour_data: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_used?: number | null
          description?: string | null
          destination: string
          id?: string
          image_urls?: string[] | null
          tour_data?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_used?: number | null
          description?: string | null
          destination?: string
          id?: string
          image_urls?: string[] | null
          tour_data?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      virtual_tryon_history: {
        Row: {
          created_at: string
          id: string
          item_id: string | null
          original_photo_url: string
          tryon_result_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id?: string | null
          original_photo_url: string
          tryon_result_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string | null
          original_photo_url?: string
          tryon_result_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wardrobe_items: {
        Row: {
          brand: string | null
          category: Database["public"]["Enums"]["clothing_category"]
          color: string
          created_at: string
          id: string
          image_url: string | null
          name: string
          notes: string | null
          price: number | null
          purchase_date: string | null
          season: Database["public"]["Enums"]["season_type"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          category: Database["public"]["Enums"]["clothing_category"]
          color: string
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          notes?: string | null
          price?: number | null
          purchase_date?: string | null
          season?: Database["public"]["Enums"]["season_type"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          category?: Database["public"]["Enums"]["clothing_category"]
          color?: string
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          notes?: string | null
          price?: number | null
          purchase_date?: string | null
          season?: Database["public"]["Enums"]["season_type"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      megatalent_leaderboard: {
        Row: {
          avatar_url: string | null
          bonus_votes: number | null
          category: Database["public"]["Enums"]["talent_category"] | null
          created_at: string | null
          description: string | null
          full_name: string | null
          media_type: string | null
          media_url: string | null
          rank_in_category: number | null
          submission_id: string | null
          subscription_tier:
            | Database["public"]["Enums"]["megatalent_tier"]
            | null
          title: string | null
          total_votes_with_bonus: number | null
          user_id: string | null
          votes_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      activate_user_theme: {
        Args: { p_theme_id: string; p_user_id: string }
        Returns: undefined
      }
      add_user_points: {
        Args: { p_activity_type: string; p_points: number; p_user_id: string }
        Returns: undefined
      }
      calculate_level: { Args: { points: number }; Returns: number }
      expire_featured_listings: { Args: never; Returns: undefined }
      generate_certificate_number: { Args: never; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { conversation_id: string; user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      accessory_type:
        | "hat"
        | "clothing"
        | "collar"
        | "toy"
        | "background"
        | "effect"
      app_role: "admin" | "moderator" | "user" | "employer"
      clothing_category:
        | "tops"
        | "bottoms"
        | "dresses"
        | "outerwear"
        | "shoes"
        | "accessories"
        | "bags"
      content_status: "draft" | "generated" | "edited" | "published"
      content_type:
        | "social_post"
        | "blog_article"
        | "video_script"
        | "cv"
        | "cover_letter"
        | "business_document"
      item_rarity: "common" | "rare" | "epic" | "legendary"
      job_category:
        | "it_software"
        | "marketing_sales"
        | "finance_accounting"
        | "healthcare"
        | "education"
        | "engineering"
        | "hospitality"
        | "retail"
        | "manufacturing"
        | "construction"
        | "transportation"
        | "other"
      job_type: "full_time" | "part_time" | "contract" | "internship" | "remote"
      megatalent_tier: "premium" | "top_premium"
      mentor_area: "career" | "fitness" | "mindset" | "relationships"
      mood_type: "very_bad" | "bad" | "neutral" | "good" | "very_good"
      occasion_type:
        | "casual"
        | "work"
        | "formal"
        | "party"
        | "sports"
        | "date"
        | "travel"
      pet_mood: "happy" | "neutral" | "sad" | "excited" | "sleepy" | "hungry"
      pet_rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
      pet_species:
        | "cat"
        | "dog"
        | "rabbit"
        | "hamster"
        | "bird"
        | "dragon"
        | "unicorn"
        | "phoenix"
      reading_type:
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
        | "love"
        | "career"
        | "general"
      season_type: "spring" | "summer" | "fall" | "winter" | "all_season"
      skill_category:
        | "construction"
        | "repairs"
        | "cleaning"
        | "gardening"
        | "technology"
        | "teaching"
        | "creative"
        | "other"
      subscription_tier: "free" | "basic" | "premium" | "business"
      talent_category:
        | "drawing"
        | "funny_video"
        | "life_advice"
        | "tattoo"
        | "training"
        | "best_selfie"
        | "painting"
        | "digital_art"
        | "sculpture"
        | "photography"
        | "handmade"
        | "makeup_art"
        | "singing"
        | "instrument"
        | "music_production"
        | "beatbox"
        | "rap"
        | "dance"
        | "breakdance"
        | "gymnastics"
        | "parkour"
        | "yoga"
        | "martial_arts"
        | "extreme_sport"
        | "sport_trick"
        | "standup"
        | "impressions"
        | "magic"
        | "pranks"
        | "tutorial"
        | "cooking"
        | "diy"
        | "science"
        | "transformation"
        | "pet_talent"
        | "other"
      tarot_card_position: "past" | "present" | "future" | "outcome"
      zodiac_sign:
        | "aries"
        | "taurus"
        | "gemini"
        | "cancer"
        | "leo"
        | "virgo"
        | "libra"
        | "scorpio"
        | "sagittarius"
        | "capricorn"
        | "aquarius"
        | "pisces"
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
  public: {
    Enums: {
      accessory_type: [
        "hat",
        "clothing",
        "collar",
        "toy",
        "background",
        "effect",
      ],
      app_role: ["admin", "moderator", "user", "employer"],
      clothing_category: [
        "tops",
        "bottoms",
        "dresses",
        "outerwear",
        "shoes",
        "accessories",
        "bags",
      ],
      content_status: ["draft", "generated", "edited", "published"],
      content_type: [
        "social_post",
        "blog_article",
        "video_script",
        "cv",
        "cover_letter",
        "business_document",
      ],
      item_rarity: ["common", "rare", "epic", "legendary"],
      job_category: [
        "it_software",
        "marketing_sales",
        "finance_accounting",
        "healthcare",
        "education",
        "engineering",
        "hospitality",
        "retail",
        "manufacturing",
        "construction",
        "transportation",
        "other",
      ],
      job_type: ["full_time", "part_time", "contract", "internship", "remote"],
      megatalent_tier: ["premium", "top_premium"],
      mentor_area: ["career", "fitness", "mindset", "relationships"],
      mood_type: ["very_bad", "bad", "neutral", "good", "very_good"],
      occasion_type: [
        "casual",
        "work",
        "formal",
        "party",
        "sports",
        "date",
        "travel",
      ],
      pet_mood: ["happy", "neutral", "sad", "excited", "sleepy", "hungry"],
      pet_rarity: ["common", "uncommon", "rare", "epic", "legendary"],
      pet_species: [
        "cat",
        "dog",
        "rabbit",
        "hamster",
        "bird",
        "dragon",
        "unicorn",
        "phoenix",
      ],
      reading_type: [
        "daily",
        "weekly",
        "monthly",
        "yearly",
        "love",
        "career",
        "general",
      ],
      season_type: ["spring", "summer", "fall", "winter", "all_season"],
      skill_category: [
        "construction",
        "repairs",
        "cleaning",
        "gardening",
        "technology",
        "teaching",
        "creative",
        "other",
      ],
      subscription_tier: ["free", "basic", "premium", "business"],
      talent_category: [
        "drawing",
        "funny_video",
        "life_advice",
        "tattoo",
        "training",
        "best_selfie",
        "painting",
        "digital_art",
        "sculpture",
        "photography",
        "handmade",
        "makeup_art",
        "singing",
        "instrument",
        "music_production",
        "beatbox",
        "rap",
        "dance",
        "breakdance",
        "gymnastics",
        "parkour",
        "yoga",
        "martial_arts",
        "extreme_sport",
        "sport_trick",
        "standup",
        "impressions",
        "magic",
        "pranks",
        "tutorial",
        "cooking",
        "diy",
        "science",
        "transformation",
        "pet_talent",
        "other",
      ],
      tarot_card_position: ["past", "present", "future", "outcome"],
      zodiac_sign: [
        "aries",
        "taurus",
        "gemini",
        "cancer",
        "leo",
        "virgo",
        "libra",
        "scorpio",
        "sagittarius",
        "capricorn",
        "aquarius",
        "pisces",
      ],
    },
  },
} as const
