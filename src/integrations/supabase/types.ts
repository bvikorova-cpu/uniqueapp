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
      achievements: {
        Row: {
          code: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          points: number
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          points?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          points?: number
        }
        Relationships: []
      }
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
      ai_room_designs: {
        Row: {
          ai_design_url: string | null
          created_at: string
          id: string
          is_saved: boolean
          room_image_url: string
          style: string
          suggested_products: string[] | null
          user_id: string
        }
        Insert: {
          ai_design_url?: string | null
          created_at?: string
          id?: string
          is_saved?: boolean
          room_image_url: string
          style: string
          suggested_products?: string[] | null
          user_id: string
        }
        Update: {
          ai_design_url?: string | null
          created_at?: string
          id?: string
          is_saved?: boolean
          room_image_url?: string
          style?: string
          suggested_products?: string[] | null
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
      analyzer_chat_messages: {
        Row: {
          analysis_id: string
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          analysis_id: string
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          analysis_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analyzer_chat_messages_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "vision_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      analyzer_collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      analyzer_credits: {
        Row: {
          created_at: string
          credits_remaining: number
          id: string
          tier: string
          tier_expires_at: string | null
          total_credits_purchased: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_remaining?: number
          id?: string
          tier?: string
          tier_expires_at?: string | null
          total_credits_purchased?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_remaining?: number
          id?: string
          tier?: string
          tier_expires_at?: string | null
          total_credits_purchased?: number
          updated_at?: string
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
      ar_preview_sessions: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_status: string
          product_id: string
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          payment_status?: string
          product_id: string
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_status?: string
          product_id?: string
          stripe_payment_intent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ar_preview_sessions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "decor_products"
            referencedColumns: ["id"]
          },
        ]
      }
      ar_previews: {
        Row: {
          ar_preview_url: string | null
          created_at: string | null
          id: string
          item_id: string
          payment_intent_id: string | null
          price: number | null
          room_image_url: string
          status: string
          user_id: string
        }
        Insert: {
          ar_preview_url?: string | null
          created_at?: string | null
          id?: string
          item_id: string
          payment_intent_id?: string | null
          price?: number | null
          room_image_url: string
          status?: string
          user_id: string
        }
        Update: {
          ar_preview_url?: string | null
          created_at?: string | null
          id?: string
          item_id?: string
          payment_intent_id?: string | null
          price?: number | null
          room_image_url?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ar_previews_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "home_decor_items"
            referencedColumns: ["id"]
          },
        ]
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
      astrology_credits: {
        Row: {
          created_at: string
          credits_remaining: number
          id: string
          total_credits_purchased: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_remaining?: number
          id?: string
          total_credits_purchased?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_remaining?: number
          id?: string
          total_credits_purchased?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      astrology_subscriptions: {
        Row: {
          active: boolean
          created_at: string
          expires_at: string
          id: string
          started_at: string
          subscription_type: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          expires_at: string
          id?: string
          started_at?: string
          subscription_type?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          expires_at?: string
          id?: string
          started_at?: string
          subscription_type?: string
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
      battle_participants: {
        Row: {
          battle_id: string
          comedian_id: string
          id: string
          joined_at: string
          performance_url: string | null
          placement: number | null
          prize_won: number | null
          vote_count: number
        }
        Insert: {
          battle_id: string
          comedian_id: string
          id?: string
          joined_at?: string
          performance_url?: string | null
          placement?: number | null
          prize_won?: number | null
          vote_count?: number
        }
        Update: {
          battle_id?: string
          comedian_id?: string
          id?: string
          joined_at?: string
          performance_url?: string | null
          placement?: number | null
          prize_won?: number | null
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "battle_participants_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "comedy_battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_participants_comedian_id_fkey"
            columns: ["comedian_id"]
            isOneToOne: false
            referencedRelation: "comedian_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_votes: {
        Row: {
          battle_id: string
          id: string
          participant_id: string
          user_id: string
          vote_cost_coins: number
          voted_at: string
        }
        Insert: {
          battle_id: string
          id?: string
          participant_id: string
          user_id: string
          vote_cost_coins?: number
          voted_at?: string
        }
        Update: {
          battle_id?: string
          id?: string
          participant_id?: string
          user_id?: string
          vote_cost_coins?: number
          voted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_votes_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "comedy_battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_votes_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "battle_participants"
            referencedColumns: ["id"]
          },
        ]
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
      breeding_records: {
        Row: {
          bred_at: string
          cost_coins: number
          id: string
          offspring_id: string | null
          parent1_id: string
          parent2_id: string
          ready_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          bred_at?: string
          cost_coins: number
          id?: string
          offspring_id?: string | null
          parent1_id: string
          parent2_id: string
          ready_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          bred_at?: string
          cost_coins?: number
          id?: string
          offspring_id?: string | null
          parent1_id?: string
          parent2_id?: string
          ready_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "breeding_records_offspring_id_fkey"
            columns: ["offspring_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "breeding_records_parent1_id_fkey"
            columns: ["parent1_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "breeding_records_parent2_id_fkey"
            columns: ["parent2_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_orders: {
        Row: {
          business_id: string
          created_at: string
          customer_email: string | null
          customer_id: string
          customer_name: string
          customer_phone: string
          id: string
          items: Json
          notes: string | null
          payment_method: string
          pickup_time: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          customer_email?: string | null
          customer_id: string
          customer_name: string
          customer_phone: string
          id?: string
          items?: Json
          notes?: string | null
          payment_method?: string
          pickup_time?: string | null
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          customer_email?: string | null
          customer_id?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          items?: Json
          notes?: string | null
          payment_method?: string
          pickup_time?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_orders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_products: {
        Row: {
          business_id: string
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          price: number
          translations: Json | null
          updated_at: string
        }
        Insert: {
          business_id: string
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          price: number
          translations?: Json | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          price?: number
          translations?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_reviews: {
        Row: {
          business_id: string
          comment: string | null
          created_at: string
          id: string
          images: Json | null
          rating: number
          user_id: string
        }
        Insert: {
          business_id: string
          comment?: string | null
          created_at?: string
          id?: string
          images?: Json | null
          rating: number
          user_id: string
        }
        Update: {
          business_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          images?: Json | null
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_subscriptions: {
        Row: {
          business_id: string
          created_at: string
          expires_at: string | null
          features: Json
          id: string
          price: number
          started_at: string
          status: string
          tier: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          expires_at?: string | null
          features?: Json
          id?: string
          price?: number
          started_at?: string
          status?: string
          tier?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          expires_at?: string | null
          features?: Json
          id?: string
          price?: number
          started_at?: string
          status?: string
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string
          category: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_open_now: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          opening_hours: Json | null
          owner_id: string
          phone: string | null
          qr_code_url: string | null
          review_count: number | null
          total_rating: number | null
          unique_url_slug: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address: string
          category: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_open_now?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          opening_hours?: Json | null
          owner_id: string
          phone?: string | null
          qr_code_url?: string | null
          review_count?: number | null
          total_rating?: number | null
          unique_url_slug?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string
          category?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_open_now?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          opening_hours?: Json | null
          owner_id?: string
          phone?: string | null
          qr_code_url?: string | null
          review_count?: number | null
          total_rating?: number | null
          unique_url_slug?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      calorie_quests: {
        Row: {
          completed_at: string | null
          created_at: string
          current_value: number | null
          expires_at: string | null
          id: string
          quest_type: string
          status: string
          target_value: number
          user_id: string
          xp_reward: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          expires_at?: string | null
          id?: string
          quest_type: string
          status?: string
          target_value: number
          user_id: string
          xp_reward: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          expires_at?: string | null
          id?: string
          quest_type?: string
          status?: string
          target_value?: number
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      campaign_donations: {
        Row: {
          amount: number
          campaign_id: string
          campaign_type: string
          created_at: string | null
          donor_email: string | null
          donor_id: string | null
          donor_name: string | null
          id: string
          is_anonymous: boolean | null
          is_monthly: boolean | null
          message: string | null
          net_amount: number
          platform_fee: number
          status: string | null
          stripe_payment_id: string | null
        }
        Insert: {
          amount: number
          campaign_id: string
          campaign_type: string
          created_at?: string | null
          donor_email?: string | null
          donor_id?: string | null
          donor_name?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_monthly?: boolean | null
          message?: string | null
          net_amount: number
          platform_fee: number
          status?: string | null
          stripe_payment_id?: string | null
        }
        Update: {
          amount?: number
          campaign_id?: string
          campaign_type?: string
          created_at?: string | null
          donor_email?: string | null
          donor_id?: string | null
          donor_name?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_monthly?: boolean | null
          message?: string | null
          net_amount?: number
          platform_fee?: number
          status?: string | null
          stripe_payment_id?: string | null
        }
        Relationships: []
      }
      castle_room_collectibles: {
        Row: {
          collectible_id: string
          created_at: string | null
          hint_text: string | null
          id: string
          position_x: number
          position_y: number
          position_z: number | null
          room_id: string
        }
        Insert: {
          collectible_id: string
          created_at?: string | null
          hint_text?: string | null
          id?: string
          position_x: number
          position_y: number
          position_z?: number | null
          room_id: string
        }
        Update: {
          collectible_id?: string
          created_at?: string | null
          hint_text?: string | null
          id?: string
          position_x?: number
          position_y?: number
          position_z?: number | null
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "castle_room_collectibles_collectible_id_fkey"
            columns: ["collectible_id"]
            isOneToOne: false
            referencedRelation: "disney_collectibles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "castle_room_collectibles_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "disney_castle_rooms"
            referencedColumns: ["id"]
          },
        ]
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
      challenge_access: {
        Row: {
          challenge_id: string
          expires_at: string
          id: string
          purchased_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          expires_at: string
          id?: string
          purchased_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          expires_at?: string
          id?: string
          purchased_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_access_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "escape_room_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          id: string
          joined_at: string
          score: number | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          id?: string
          joined_at?: string
          score?: number | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          id?: string
          joined_at?: string
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "quest_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      character_battles: {
        Row: {
          battle_commentary: string | null
          battle_type: string
          character1_id: string
          character1_votes: number
          character2_id: string
          character2_votes: number
          created_at: string
          expires_at: string | null
          id: string
          status: string
          winner_id: string | null
        }
        Insert: {
          battle_commentary?: string | null
          battle_type: string
          character1_id: string
          character1_votes?: number
          character2_id: string
          character2_votes?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          status?: string
          winner_id?: string | null
        }
        Update: {
          battle_commentary?: string | null
          battle_type?: string
          character1_id?: string
          character1_votes?: number
          character2_id?: string
          character2_votes?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          status?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "character_battles_character1_id_fkey"
            columns: ["character1_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_battles_character2_id_fkey"
            columns: ["character2_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_battles_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      character_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "character_posts"
            referencedColumns: ["id"]
          },
        ]
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
      character_credits: {
        Row: {
          created_at: string
          credits_remaining: number
          id: string
          total_credits_purchased: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_remaining?: number
          id?: string
          total_credits_purchased?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_remaining?: number
          id?: string
          total_credits_purchased?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      character_follows: {
        Row: {
          character_id: string
          created_at: string
          follower_user_id: string
          id: string
        }
        Insert: {
          character_id: string
          created_at?: string
          follower_user_id: string
          id?: string
        }
        Update: {
          character_id?: string
          created_at?: string
          follower_user_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_follows_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
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
      character_post_likes: {
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
            foreignKeyName: "character_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "character_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      character_posts: {
        Row: {
          character_id: string
          comments_count: number
          content: string
          created_at: string
          id: string
          image_url: string | null
          likes_count: number
          user_id: string
        }
        Insert: {
          character_id: string
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          user_id: string
        }
        Update: {
          character_id?: string
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_posts_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      character_votes: {
        Row: {
          battle_id: string
          character_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          battle_id: string
          character_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          battle_id?: string
          character_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_votes_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "character_battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_votes_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          attack: number
          backstory: string | null
          category: string
          created_at: string
          defense: number
          description: string | null
          experience: number
          hp: number
          id: string
          image_url: string | null
          is_animated: boolean
          is_premium: boolean
          level: number
          losses: number
          name: string
          popularity_score: number
          special_power: string | null
          speed: number
          updated_at: string
          user_id: string
          wins: number
        }
        Insert: {
          attack?: number
          backstory?: string | null
          category: string
          created_at?: string
          defense?: number
          description?: string | null
          experience?: number
          hp?: number
          id?: string
          image_url?: string | null
          is_animated?: boolean
          is_premium?: boolean
          level?: number
          losses?: number
          name: string
          popularity_score?: number
          special_power?: string | null
          speed?: number
          updated_at?: string
          user_id: string
          wins?: number
        }
        Update: {
          attack?: number
          backstory?: string | null
          category?: string
          created_at?: string
          defense?: number
          description?: string | null
          experience?: number
          hp?: number
          id?: string
          image_url?: string | null
          is_animated?: boolean
          is_premium?: boolean
          level?: number
          losses?: number
          name?: string
          popularity_score?: number
          special_power?: string | null
          speed?: number
          updated_at?: string
          user_id?: string
          wins?: number
        }
        Relationships: []
      }
      chef_chat_sessions: {
        Row: {
          created_at: string
          credits_used: number
          id: string
          messages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_used?: number
          id?: string
          messages?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          id?: string
          messages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clip_purchases: {
        Row: {
          clip_id: string
          id: string
          price_paid: number
          purchased_at: string
          user_id: string
        }
        Insert: {
          clip_id: string
          id?: string
          price_paid: number
          purchased_at?: string
          user_id: string
        }
        Update: {
          clip_id?: string
          id?: string
          price_paid?: number
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clip_purchases_clip_id_fkey"
            columns: ["clip_id"]
            isOneToOne: false
            referencedRelation: "comedy_clips"
            referencedColumns: ["id"]
          },
        ]
      }
      clone_conversations: {
        Row: {
          clone_id: string
          created_at: string
          ended_at: string | null
          id: string
          messages: Json
          participant_id: string | null
          participant_type: string
          rating: number | null
          session_duration: number | null
        }
        Insert: {
          clone_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          messages?: Json
          participant_id?: string | null
          participant_type?: string
          rating?: number | null
          session_duration?: number | null
        }
        Update: {
          clone_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          messages?: Json
          participant_id?: string | null
          participant_type?: string
          rating?: number | null
          session_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clone_conversations_clone_id_fkey"
            columns: ["clone_id"]
            isOneToOne: false
            referencedRelation: "personality_clones"
            referencedColumns: ["id"]
          },
        ]
      }
      clone_dating_sessions: {
        Row: {
          clone_1_id: string
          clone_2_id: string
          compatibility_score: number | null
          completed_at: string | null
          created_at: string
          id: string
          payment_amount: number
          session_data: Json
          status: string
        }
        Insert: {
          clone_1_id: string
          clone_2_id: string
          compatibility_score?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          payment_amount?: number
          session_data?: Json
          status?: string
        }
        Update: {
          clone_1_id?: string
          clone_2_id?: string
          compatibility_score?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          payment_amount?: number
          session_data?: Json
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "clone_dating_sessions_clone_1_id_fkey"
            columns: ["clone_1_id"]
            isOneToOne: false
            referencedRelation: "personality_clones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clone_dating_sessions_clone_2_id_fkey"
            columns: ["clone_2_id"]
            isOneToOne: false
            referencedRelation: "personality_clones"
            referencedColumns: ["id"]
          },
        ]
      }
      clone_exports: {
        Row: {
          clone_id: string
          created_at: string
          export_data: Json
          id: string
          payment_amount: number
          user_id: string
        }
        Insert: {
          clone_id: string
          created_at?: string
          export_data: Json
          id?: string
          payment_amount?: number
          user_id: string
        }
        Update: {
          clone_id?: string
          created_at?: string
          export_data?: Json
          id?: string
          payment_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clone_exports_clone_id_fkey"
            columns: ["clone_id"]
            isOneToOne: false
            referencedRelation: "personality_clones"
            referencedColumns: ["id"]
          },
        ]
      }
      clone_subscriptions: {
        Row: {
          clone_id: string
          created_at: string
          expires_at: string
          id: string
          price: number
          started_at: string
          status: string
          tier: string
          user_id: string
        }
        Insert: {
          clone_id: string
          created_at?: string
          expires_at: string
          id?: string
          price: number
          started_at?: string
          status?: string
          tier: string
          user_id: string
        }
        Update: {
          clone_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          price?: number
          started_at?: string
          status?: string
          tier?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clone_subscriptions_clone_id_fkey"
            columns: ["clone_id"]
            isOneToOne: false
            referencedRelation: "personality_clones"
            referencedColumns: ["id"]
          },
        ]
      }
      coffee_achievements: {
        Row: {
          achievement_type: string | null
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          name: string
          points_required: number | null
        }
        Insert: {
          achievement_type?: string | null
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          name: string
          points_required?: number | null
        }
        Update: {
          achievement_type?: string | null
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          name?: string
          points_required?: number | null
        }
        Relationships: []
      }
      coffee_ads: {
        Row: {
          budget: number | null
          cafe_id: string
          clicks_count: number | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          image_url: string | null
          impressions_count: number | null
          is_active: boolean | null
          spent: number | null
          target_url: string | null
          title: string
        }
        Insert: {
          budget?: number | null
          cafe_id: string
          clicks_count?: number | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          impressions_count?: number | null
          is_active?: boolean | null
          spent?: number | null
          target_url?: string | null
          title: string
        }
        Update: {
          budget?: number | null
          cafe_id?: string
          clicks_count?: number | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          impressions_count?: number | null
          is_active?: boolean | null
          spent?: number | null
          target_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "coffee_ads_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "coffee_cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      coffee_cafes: {
        Row: {
          address: string
          average_rating: number | null
          business_subscription_expires_at: string | null
          business_tier: string | null
          city: string
          country: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          owner_user_id: string | null
          total_checkins: number | null
          total_reviews: number | null
          updated_at: string
        }
        Insert: {
          address: string
          average_rating?: number | null
          business_subscription_expires_at?: string | null
          business_tier?: string | null
          city: string
          country: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          owner_user_id?: string | null
          total_checkins?: number | null
          total_reviews?: number | null
          updated_at?: string
        }
        Update: {
          address?: string
          average_rating?: number | null
          business_subscription_expires_at?: string | null
          business_tier?: string | null
          city?: string
          country?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          owner_user_id?: string | null
          total_checkins?: number | null
          total_reviews?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      coffee_checkins: {
        Row: {
          cafe_id: string
          created_at: string
          drink_type: string | null
          id: string
          notes: string | null
          photo_url: string | null
          user_id: string
        }
        Insert: {
          cafe_id: string
          created_at?: string
          drink_type?: string | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          user_id: string
        }
        Update: {
          cafe_id?: string
          created_at?: string
          drink_type?: string | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coffee_checkins_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "coffee_cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      coffee_event_participants: {
        Row: {
          created_at: string
          event_id: string
          id: string
          payment_status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          payment_status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          payment_status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coffee_event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "coffee_events"
            referencedColumns: ["id"]
          },
        ]
      }
      coffee_events: {
        Row: {
          cafe_id: string | null
          created_at: string
          description: string | null
          event_date: string
          id: string
          image_url: string | null
          max_participants: number | null
          organizer_id: string
          status: string | null
          ticket_price: number | null
          title: string
          updated_at: string
        }
        Insert: {
          cafe_id?: string | null
          created_at?: string
          description?: string | null
          event_date: string
          id?: string
          image_url?: string | null
          max_participants?: number | null
          organizer_id: string
          status?: string | null
          ticket_price?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          cafe_id?: string | null
          created_at?: string
          description?: string | null
          event_date?: string
          id?: string
          image_url?: string | null
          max_participants?: number | null
          organizer_id?: string
          status?: string | null
          ticket_price?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coffee_events_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "coffee_cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      coffee_match_messages: {
        Row: {
          created_at: string
          id: string
          match_id: string
          message: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          message: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coffee_match_messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "coffee_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      coffee_matches: {
        Row: {
          chat_enabled: boolean | null
          created_at: string
          id: string
          match_score: number | null
          status: string | null
          updated_at: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          chat_enabled?: boolean | null
          created_at?: string
          id?: string
          match_score?: number | null
          status?: string | null
          updated_at?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          chat_enabled?: boolean | null
          created_at?: string
          id?: string
          match_score?: number | null
          status?: string | null
          updated_at?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      coffee_profiles: {
        Row: {
          budget_preference: string | null
          created_at: string
          favorite_coffee_types: string[] | null
          id: string
          matches_remaining: number | null
          preferred_atmosphere: string[] | null
          subscription_expires_at: string | null
          subscription_tier: string | null
          total_checkins: number | null
          total_points: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_preference?: string | null
          created_at?: string
          favorite_coffee_types?: string[] | null
          id?: string
          matches_remaining?: number | null
          preferred_atmosphere?: string[] | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          total_checkins?: number | null
          total_points?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_preference?: string | null
          created_at?: string
          favorite_coffee_types?: string[] | null
          id?: string
          matches_remaining?: number | null
          preferred_atmosphere?: string[] | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          total_checkins?: number | null
          total_points?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coffee_reviews: {
        Row: {
          cafe_id: string
          created_at: string
          id: string
          is_featured: boolean | null
          likes_count: number | null
          photo_urls: string[] | null
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cafe_id: string
          created_at?: string
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          photo_urls?: string[] | null
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cafe_id?: string
          created_at?: string
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          photo_urls?: string[] | null
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coffee_reviews_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "coffee_cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      collectible_achievements: {
        Row: {
          category: string
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean
          name: string
          points_reward: number
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          points_reward?: number
          requirement_type: string
          requirement_value?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          points_reward?: number
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
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
      collectible_evolution: {
        Row: {
          can_evolve_at: string | null
          collectible_id: string
          created_at: string
          evolution_level: number
          evolution_points: number
          id: string
          points_to_next_level: number
          updated_at: string
        }
        Insert: {
          can_evolve_at?: string | null
          collectible_id: string
          created_at?: string
          evolution_level?: number
          evolution_points?: number
          id?: string
          points_to_next_level?: number
          updated_at?: string
        }
        Update: {
          can_evolve_at?: string | null
          collectible_id?: string
          created_at?: string
          evolution_level?: number
          evolution_points?: number
          id?: string
          points_to_next_level?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collectible_evolution_collectible_id_fkey"
            columns: ["collectible_id"]
            isOneToOne: false
            referencedRelation: "user_collectibles"
            referencedColumns: ["id"]
          },
        ]
      }
      collectible_purchases: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          product_type: string
          status: string
          stripe_payment_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          product_type: string
          status?: string
          stripe_payment_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          product_type?: string
          status?: string
          stripe_payment_id?: string | null
          user_id?: string
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
      collection_pages: {
        Row: {
          collection_id: string
          coloring_page_id: string
          created_at: string
          id: string
          page_order: number
        }
        Insert: {
          collection_id: string
          coloring_page_id: string
          created_at?: string
          id?: string
          page_order: number
        }
        Update: {
          collection_id?: string
          coloring_page_id?: string
          created_at?: string
          id?: string
          page_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "collection_pages_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "teacher_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_pages_coloring_page_id_fkey"
            columns: ["coloring_page_id"]
            isOneToOne: false
            referencedRelation: "coloring_pages"
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
      comedian_earnings: {
        Row: {
          amount_coins: number
          comedian_id: string
          created_at: string
          description: string | null
          id: string
          source_id: string | null
          source_type: string
        }
        Insert: {
          amount_coins: number
          comedian_id: string
          created_at?: string
          description?: string | null
          id?: string
          source_id?: string | null
          source_type: string
        }
        Update: {
          amount_coins?: number
          comedian_id?: string
          created_at?: string
          description?: string | null
          id?: string
          source_id?: string | null
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "comedian_earnings_comedian_id_fkey"
            columns: ["comedian_id"]
            isOneToOne: false
            referencedRelation: "comedian_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comedian_followers: {
        Row: {
          comedian_id: string
          followed_at: string
          follower_user_id: string
          id: string
        }
        Insert: {
          comedian_id: string
          followed_at?: string
          follower_user_id: string
          id?: string
        }
        Update: {
          comedian_id?: string
          followed_at?: string
          follower_user_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comedian_followers_comedian_id_fkey"
            columns: ["comedian_id"]
            isOneToOne: false
            referencedRelation: "comedian_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comedian_profiles: {
        Row: {
          avatar_url: string | null
          average_rating: number | null
          bio: string | null
          created_at: string
          experience_level: string
          follower_count: number
          id: string
          is_verified: boolean
          stage_name: string
          total_earnings: number
          total_shows: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          created_at?: string
          experience_level?: string
          follower_count?: number
          id?: string
          is_verified?: boolean
          stage_name: string
          total_earnings?: number
          total_shows?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          created_at?: string
          experience_level?: string
          follower_count?: number
          id?: string
          is_verified?: boolean
          stage_name?: string
          total_earnings?: number
          total_shows?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      comedy_battles: {
        Row: {
          created_at: string
          description: string | null
          ends_at: string | null
          entry_fee_coins: number
          id: string
          max_participants: number
          prize_pool_coins: number
          starts_at: string
          status: string
          title: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          entry_fee_coins?: number
          id?: string
          max_participants?: number
          prize_pool_coins?: number
          starts_at: string
          status?: string
          title: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_at?: string | null
          entry_fee_coins?: number
          id?: string
          max_participants?: number
          prize_pool_coins?: number
          starts_at?: string
          status?: string
          title?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comedy_battles_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "comedian_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comedy_clips: {
        Row: {
          comedian_id: string
          created_at: string
          description: string | null
          duration_seconds: number
          id: string
          is_free: boolean
          price_coins: number
          purchase_count: number
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          total_revenue: number
          updated_at: string
          video_url: string
          views_count: number
        }
        Insert: {
          comedian_id: string
          created_at?: string
          description?: string | null
          duration_seconds: number
          id?: string
          is_free?: boolean
          price_coins?: number
          purchase_count?: number
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          total_revenue?: number
          updated_at?: string
          video_url: string
          views_count?: number
        }
        Update: {
          comedian_id?: string
          created_at?: string
          description?: string | null
          duration_seconds?: number
          id?: string
          is_free?: boolean
          price_coins?: number
          purchase_count?: number
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          total_revenue?: number
          updated_at?: string
          video_url?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "comedy_clips_comedian_id_fkey"
            columns: ["comedian_id"]
            isOneToOne: false
            referencedRelation: "comedian_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comedy_currency: {
        Row: {
          coins: number
          created_at: string
          id: string
          total_coins_purchased: number
          total_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          coins?: number
          created_at?: string
          id?: string
          total_coins_purchased?: number
          total_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          coins?: number
          created_at?: string
          id?: string
          total_coins_purchased?: number
          total_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      comedy_shows: {
        Row: {
          comedian_id: string
          created_at: string
          description: string | null
          duration_minutes: number
          ended_at: string | null
          id: string
          is_premium: boolean
          scheduled_at: string
          show_type: string
          started_at: string | null
          status: string
          stream_url: string | null
          thumbnail_url: string | null
          ticket_price_coins: number
          title: string
          total_revenue: number
          viewer_count: number
        }
        Insert: {
          comedian_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          is_premium?: boolean
          scheduled_at: string
          show_type?: string
          started_at?: string | null
          status?: string
          stream_url?: string | null
          thumbnail_url?: string | null
          ticket_price_coins?: number
          title: string
          total_revenue?: number
          viewer_count?: number
        }
        Update: {
          comedian_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          is_premium?: boolean
          scheduled_at?: string
          show_type?: string
          started_at?: string | null
          status?: string
          stream_url?: string | null
          thumbnail_url?: string | null
          ticket_price_coins?: number
          title?: string
          total_revenue?: number
          viewer_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "comedy_shows_comedian_id_fkey"
            columns: ["comedian_id"]
            isOneToOne: false
            referencedRelation: "comedian_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comedy_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          status: string
          stripe_subscription_id: string | null
          tier: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end: string
          current_period_start?: string
          id?: string
          status?: string
          stripe_subscription_id?: string | null
          tier?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          status?: string
          stripe_subscription_id?: string | null
          tier?: string
          user_id?: string
        }
        Relationships: []
      }
      comedy_tickets: {
        Row: {
          attended: boolean
          id: string
          price_paid: number
          purchased_at: string
          rating: number | null
          review: string | null
          show_id: string
          user_id: string
        }
        Insert: {
          attended?: boolean
          id?: string
          price_paid: number
          purchased_at?: string
          rating?: number | null
          review?: string | null
          show_id: string
          user_id: string
        }
        Update: {
          attended?: boolean
          id?: string
          price_paid?: number
          purchased_at?: string
          rating?: number | null
          review?: string | null
          show_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comedy_tickets_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "comedy_shows"
            referencedColumns: ["id"]
          },
        ]
      }
      comedy_tips: {
        Row: {
          amount_coins: number
          created_at: string
          from_user_id: string
          id: string
          message: string | null
          show_id: string | null
          tip_type: string
          to_comedian_id: string
        }
        Insert: {
          amount_coins: number
          created_at?: string
          from_user_id: string
          id?: string
          message?: string | null
          show_id?: string | null
          tip_type?: string
          to_comedian_id: string
        }
        Update: {
          amount_coins?: number
          created_at?: string
          from_user_id?: string
          id?: string
          message?: string | null
          show_id?: string | null
          tip_type?: string
          to_comedian_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comedy_tips_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "comedy_shows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comedy_tips_to_comedian_id_fkey"
            columns: ["to_comedian_id"]
            isOneToOne: false
            referencedRelation: "comedian_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      concert_gifts: {
        Row: {
          amount: number
          commission_rate: number | null
          concert_id: string
          created_at: string | null
          gift_id: string
          id: string
          message: string | null
          musician_amount: number
          musician_id: string
          payment_status: string | null
          platform_commission: number
          sender_id: string
          stripe_session_id: string | null
        }
        Insert: {
          amount: number
          commission_rate?: number | null
          concert_id: string
          created_at?: string | null
          gift_id: string
          id?: string
          message?: string | null
          musician_amount: number
          musician_id: string
          payment_status?: string | null
          platform_commission: number
          sender_id: string
          stripe_session_id?: string | null
        }
        Update: {
          amount?: number
          commission_rate?: number | null
          concert_id?: string
          created_at?: string | null
          gift_id?: string
          id?: string
          message?: string | null
          musician_amount?: number
          musician_id?: string
          payment_status?: string | null
          platform_commission?: number
          sender_id?: string
          stripe_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "concert_gifts_concert_id_fkey"
            columns: ["concert_id"]
            isOneToOne: false
            referencedRelation: "live_concert_streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concert_gifts_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "platform_gifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concert_gifts_musician_id_fkey"
            columns: ["musician_id"]
            isOneToOne: false
            referencedRelation: "musician_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      concert_ticket_purchases: {
        Row: {
          amount: number
          commission_rate: number | null
          concert_id: string
          id: string
          musician_amount: number
          payment_status: string | null
          platform_commission: number
          purchased_at: string | null
          stripe_session_id: string | null
          ticket_type_id: string
          user_id: string
        }
        Insert: {
          amount: number
          commission_rate?: number | null
          concert_id: string
          id?: string
          musician_amount: number
          payment_status?: string | null
          platform_commission: number
          purchased_at?: string | null
          stripe_session_id?: string | null
          ticket_type_id: string
          user_id: string
        }
        Update: {
          amount?: number
          commission_rate?: number | null
          concert_id?: string
          id?: string
          musician_amount?: number
          payment_status?: string | null
          platform_commission?: number
          purchased_at?: string | null
          stripe_session_id?: string | null
          ticket_type_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "concert_ticket_purchases_concert_id_fkey"
            columns: ["concert_id"]
            isOneToOne: false
            referencedRelation: "live_concert_streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concert_ticket_purchases_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "concert_ticket_types"
            referencedColumns: ["id"]
          },
        ]
      }
      concert_ticket_types: {
        Row: {
          concert_id: string
          created_at: string | null
          description: string | null
          id: string
          max_quantity: number | null
          name: string
          price: number
          sold_count: number | null
        }
        Insert: {
          concert_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          max_quantity?: number | null
          name: string
          price: number
          sold_count?: number | null
        }
        Update: {
          concert_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          max_quantity?: number | null
          name?: string
          price?: number
          sold_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "concert_ticket_types_concert_id_fkey"
            columns: ["concert_id"]
            isOneToOne: false
            referencedRelation: "live_concert_streams"
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
      cooking_credits: {
        Row: {
          created_at: string
          credits: number
          id: string
          subscription_expires_at: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits?: number
          id?: string
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cosmetic_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          item_type: string
          name: string
          price_gems: number
          rarity: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          item_type: string
          name: string
          price_gems: number
          rarity?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          item_type?: string
          name?: string
          price_gems?: number
          rarity?: string
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          amount_paid: number
          completed_at: string | null
          course_id: string
          creator_earning: number
          enrolled_at: string | null
          id: string
          platform_fee: number
          progress_percentage: number | null
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          amount_paid: number
          completed_at?: string | null
          course_id: string
          creator_earning: number
          enrolled_at?: string | null
          id?: string
          platform_fee: number
          progress_percentage?: number | null
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number
          completed_at?: string | null
          course_id?: string
          creator_earning?: number
          enrolled_at?: string | null
          id?: string
          platform_fee?: number
          progress_percentage?: number | null
          stripe_payment_intent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_preview: boolean | null
          order_index: number
          title: string
          video_url: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean | null
          order_index: number
          title: string
          video_url?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean | null
          order_index?: number
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_materials: {
        Row: {
          created_at: string | null
          file_size_mb: number | null
          file_type: string | null
          file_url: string
          id: string
          lesson_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          file_size_mb?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          lesson_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          file_size_mb?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          lesson_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_materials_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
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
      course_quizzes: {
        Row: {
          created_at: string | null
          id: string
          lesson_id: string
          passing_score: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lesson_id: string
          passing_score?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lesson_id?: string
          passing_score?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
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
      courses: {
        Row: {
          average_rating: number | null
          category: string
          created_at: string | null
          creator_id: string
          description: string
          difficulty_level: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          price: number
          thumbnail_url: string | null
          title: string
          total_enrollments: number | null
          total_lessons: number | null
          updated_at: string | null
        }
        Insert: {
          average_rating?: number | null
          category: string
          created_at?: string | null
          creator_id: string
          description: string
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          price: number
          thumbnail_url?: string | null
          title: string
          total_enrollments?: number | null
          total_lessons?: number | null
          updated_at?: string | null
        }
        Update: {
          average_rating?: number | null
          category?: string
          created_at?: string | null
          creator_id?: string
          description?: string
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          price?: number
          thumbnail_url?: string | null
          title?: string
          total_enrollments?: number | null
          total_lessons?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      creator_chat_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          room_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          room_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "creator_chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_chat_rooms: {
        Row: {
          created_at: string | null
          creator_id: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          tier_ids: string[] | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tier_ids?: string[] | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tier_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_chat_rooms_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_exclusive_posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string | null
          creator_id: string
          id: string
          is_published: boolean | null
          likes_count: number | null
          media_urls: string[] | null
          scheduled_for: string | null
          tier_ids: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string | null
          creator_id: string
          id?: string
          is_published?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          scheduled_for?: string | null
          tier_ids?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string | null
          creator_id?: string
          id?: string
          is_published?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          scheduled_for?: string | null
          tier_ids?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_exclusive_posts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_gifts_sent: {
        Row: {
          amount_paid: number
          created_at: string | null
          creator_earning: number
          gift_id: string
          id: string
          message: string | null
          platform_fee: number
          recipient_creator_id: string
          sender_id: string
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount_paid: number
          created_at?: string | null
          creator_earning: number
          gift_id: string
          id?: string
          message?: string | null
          platform_fee: number
          recipient_creator_id: string
          sender_id: string
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount_paid?: number
          created_at?: string | null
          creator_earning?: number
          gift_id?: string
          id?: string
          message?: string | null
          platform_fee?: number
          recipient_creator_id?: string
          sender_id?: string
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_gifts_sent_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "virtual_gifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_gifts_sent_recipient_creator_id_fkey"
            columns: ["recipient_creator_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_memberships: {
        Row: {
          creator_id: string
          expires_at: string | null
          id: string
          started_at: string | null
          status: string | null
          stripe_subscription_id: string | null
          subscriber_id: string
          tier_id: string
        }
        Insert: {
          creator_id: string
          expires_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          subscriber_id: string
          tier_id: string
        }
        Update: {
          creator_id?: string
          expires_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          subscriber_id?: string
          tier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_memberships_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_memberships_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "creator_subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_image_url: string | null
          created_at: string | null
          display_name: string
          id: string
          is_verified: boolean | null
          total_earnings: number | null
          total_subscribers: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          display_name: string
          id?: string
          is_verified?: boolean | null
          total_earnings?: number | null
          total_subscribers?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          display_name?: string
          id?: string
          is_verified?: boolean | null
          total_earnings?: number | null
          total_subscribers?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      creator_subscription_tiers: {
        Row: {
          benefits: string[] | null
          created_at: string | null
          creator_id: string
          description: string | null
          id: string
          is_active: boolean | null
          max_subscribers: number | null
          name: string
          price: number
          stripe_price_id: string | null
        }
        Insert: {
          benefits?: string[] | null
          created_at?: string | null
          creator_id: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_subscribers?: number | null
          name: string
          price: number
          stripe_price_id?: string | null
        }
        Update: {
          benefits?: string[] | null
          created_at?: string | null
          creator_id?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_subscribers?: number | null
          name?: string
          price?: number
          stripe_price_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_subscription_tiers_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crisis_campaigns: {
        Row: {
          created_at: string | null
          crisis_type: string
          current_amount: number | null
          description: string
          expires_at: string | null
          id: string
          images: string[] | null
          location: string | null
          status: string | null
          story: string
          supporters_count: number | null
          target_amount: number
          title: string
          updated_at: string | null
          urgent: boolean | null
          user_id: string
          verified: boolean | null
          verified_by: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          crisis_type: string
          current_amount?: number | null
          description: string
          expires_at?: string | null
          id?: string
          images?: string[] | null
          location?: string | null
          status?: string | null
          story: string
          supporters_count?: number | null
          target_amount: number
          title: string
          updated_at?: string | null
          urgent?: boolean | null
          user_id: string
          verified?: boolean | null
          verified_by?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          crisis_type?: string
          current_amount?: number | null
          description?: string
          expires_at?: string | null
          id?: string
          images?: string[] | null
          location?: string | null
          status?: string | null
          story?: string
          supporters_count?: number | null
          target_amount?: number
          title?: string
          updated_at?: string | null
          urgent?: boolean | null
          user_id?: string
          verified?: boolean | null
          verified_by?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      cross_reality_reveals: {
        Row: {
          id: string
          message: string | null
          payment_amount: number
          revealed_at: string
          revealer_life_id: string
          target_life_id: string
        }
        Insert: {
          id?: string
          message?: string | null
          payment_amount?: number
          revealed_at?: string
          revealer_life_id: string
          target_life_id: string
        }
        Update: {
          id?: string
          message?: string | null
          payment_amount?: number
          revealed_at?: string
          revealer_life_id?: string
          target_life_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cross_reality_reveals_revealer_life_id_fkey"
            columns: ["revealer_life_id"]
            isOneToOne: false
            referencedRelation: "parallel_lives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_reality_reveals_target_life_id_fkey"
            columns: ["target_life_id"]
            isOneToOne: false
            referencedRelation: "parallel_lives"
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
      daily_scans_counter: {
        Row: {
          created_at: string
          id: string
          scan_date: string
          scans_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          scan_date?: string
          scans_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          scan_date?: string
          scans_count?: number | null
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
      decor_products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_urls: string[]
          is_available: boolean
          price: number
          sales_count: number
          seller_id: string
          style: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_urls?: string[]
          is_available?: boolean
          price: number
          sales_count?: number
          seller_id: string
          style: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_urls?: string[]
          is_available?: boolean
          price?: number
          sales_count?: number
          seller_id?: string
          style?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      decor_sales: {
        Row: {
          amount: number
          buyer_id: string
          commission: number
          created_at: string
          id: string
          product_id: string
          seller_amount: number
          seller_id: string
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount: number
          buyer_id: string
          commission: number
          created_at?: string
          id?: string
          product_id: string
          seller_amount: number
          seller_id: string
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string
          commission?: number
          created_at?: string
          id?: string
          product_id?: string
          seller_amount?: number
          seller_id?: string
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decor_sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "decor_products"
            referencedColumns: ["id"]
          },
        ]
      }
      decor_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          designs_limit: number
          designs_used: number
          id: string
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          designs_limit?: number
          designs_used?: number
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          designs_limit?: number
          designs_used?: number
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      design_consultations: {
        Row: {
          created_at: string | null
          designer_id: string | null
          duration: number
          id: string
          meeting_url: string | null
          notes: string | null
          payment_intent_id: string | null
          price: number
          scheduled_at: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          designer_id?: string | null
          duration: number
          id?: string
          meeting_url?: string | null
          notes?: string | null
          payment_intent_id?: string | null
          price: number
          scheduled_at: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          designer_id?: string | null
          duration?: number
          id?: string
          meeting_url?: string | null
          notes?: string | null
          payment_intent_id?: string | null
          price?: number
          scheduled_at?: string
          status?: string
          updated_at?: string | null
          user_id?: string
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
      disney_castle_rooms: {
        Row: {
          audio_guide_text: string | null
          castle_id: string | null
          created_at: string | null
          description: string | null
          hotspots: Json | null
          id: string
          order_index: number | null
          panorama_url: string | null
          room_name: string
        }
        Insert: {
          audio_guide_text?: string | null
          castle_id?: string | null
          created_at?: string | null
          description?: string | null
          hotspots?: Json | null
          id?: string
          order_index?: number | null
          panorama_url?: string | null
          room_name: string
        }
        Update: {
          audio_guide_text?: string | null
          castle_id?: string | null
          created_at?: string | null
          description?: string | null
          hotspots?: Json | null
          id?: string
          order_index?: number | null
          panorama_url?: string | null
          room_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "disney_castle_rooms_castle_id_fkey"
            columns: ["castle_id"]
            isOneToOne: false
            referencedRelation: "disney_castles"
            referencedColumns: ["id"]
          },
        ]
      }
      disney_castles: {
        Row: {
          country_code: string
          created_at: string | null
          description: string | null
          fun_facts: string[] | null
          id: string
          is_premium: boolean | null
          location: string
          name: string
          park_name: string
          price_coins: number
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          country_code: string
          created_at?: string | null
          description?: string | null
          fun_facts?: string[] | null
          id?: string
          is_premium?: boolean | null
          location: string
          name: string
          park_name: string
          price_coins?: number
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          country_code?: string
          created_at?: string | null
          description?: string | null
          fun_facts?: string[] | null
          id?: string
          is_premium?: boolean | null
          location?: string
          name?: string
          park_name?: string
          price_coins?: number
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      disney_collectibles: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          points: number | null
          rarity: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          points?: number | null
          rarity?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          points?: number | null
          rarity?: string | null
        }
        Relationships: []
      }
      dream_campaigns: {
        Row: {
          created_at: string | null
          current_amount: number | null
          description: string
          dream_type: string
          ends_at: string | null
          id: string
          image_url: string | null
          milestones: Json | null
          status: string | null
          story: string
          supporters_count: number | null
          target_amount: number
          title: string
          updated_at: string | null
          updates: Json | null
          user_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          current_amount?: number | null
          description: string
          dream_type: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          milestones?: Json | null
          status?: string | null
          story: string
          supporters_count?: number | null
          target_amount: number
          title: string
          updated_at?: string | null
          updates?: Json | null
          user_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          current_amount?: number | null
          description?: string
          dream_type?: string
          ends_at?: string | null
          id?: string
          image_url?: string | null
          milestones?: Json | null
          status?: string | null
          story?: string
          supporters_count?: number | null
          target_amount?: number
          title?: string
          updated_at?: string | null
          updates?: Json | null
          user_id?: string
          video_url?: string | null
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
      dream_interpretations: {
        Row: {
          created_at: string
          credits_used: number
          dream_description: string
          id: string
          interpretation: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_used?: number
          dream_description: string
          id?: string
          interpretation: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          dream_description?: string
          id?: string
          interpretation?: string
          user_id?: string
        }
        Relationships: []
      }
      emotion_drop_participants: {
        Row: {
          amount_received: number
          drop_id: string
          id: string
          participated_at: string
          user_id: string
        }
        Insert: {
          amount_received: number
          drop_id: string
          id?: string
          participated_at?: string
          user_id: string
        }
        Update: {
          amount_received?: number
          drop_id?: string
          id?: string
          participated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emotion_drop_participants_drop_id_fkey"
            columns: ["drop_id"]
            isOneToOne: false
            referencedRelation: "emotion_drops"
            referencedColumns: ["id"]
          },
        ]
      }
      emotion_drops: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          drop_name: string
          drop_time: string
          emotion_type: string
          id: string
          max_participants: number | null
          participants_count: number
          price: number
          status: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          drop_name: string
          drop_time: string
          emotion_type: string
          id?: string
          max_participants?: number | null
          participants_count?: number
          price: number
          status?: string
          total_amount: number
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          drop_name?: string
          drop_time?: string
          emotion_type?: string
          id?: string
          max_participants?: number | null
          participants_count?: number
          price?: number
          status?: string
          total_amount?: number
        }
        Relationships: []
      }
      emotion_insurance: {
        Row: {
          claims_used: number
          coverage_level: string
          created_at: string
          expires_at: string
          id: string
          max_claims: number
          monthly_price: number
          negative_emotions_blocked: number
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          claims_used?: number
          coverage_level: string
          created_at?: string
          expires_at: string
          id?: string
          max_claims?: number
          monthly_price: number
          negative_emotions_blocked?: number
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          claims_used?: number
          coverage_level?: string
          created_at?: string
          expires_at?: string
          id?: string
          max_claims?: number
          monthly_price?: number
          negative_emotions_blocked?: number
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      emotion_market_listings: {
        Row: {
          amount: number
          created_at: string
          emotion_type: string
          id: string
          price_per_unit: number
          seller_id: string
          status: string
          total_price: number
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          emotion_type: string
          id?: string
          price_per_unit: number
          seller_id: string
          status?: string
          total_price: number
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          emotion_type?: string
          id?: string
          price_per_unit?: number
          seller_id?: string
          status?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      emotion_mining_activities: {
        Row: {
          amount_mined: number
          commission_earned: number
          created_at: string
          emotion_type: string
          id: string
          miner_id: string
          mining_method: string | null
          recipient_id: string | null
        }
        Insert: {
          amount_mined: number
          commission_earned?: number
          created_at?: string
          emotion_type: string
          id?: string
          miner_id: string
          mining_method?: string | null
          recipient_id?: string | null
        }
        Update: {
          amount_mined?: number
          commission_earned?: number
          created_at?: string
          emotion_type?: string
          id?: string
          miner_id?: string
          mining_method?: string | null
          recipient_id?: string | null
        }
        Relationships: []
      }
      emotion_posts: {
        Row: {
          ai_detected_emotions: Json
          comments_count: number
          content: string
          created_at: string
          emotion_cost: Json
          emotion_reward: Json
          id: string
          is_premium: boolean
          likes_count: number
          media_url: string | null
          user_id: string
          views_count: number
        }
        Insert: {
          ai_detected_emotions?: Json
          comments_count?: number
          content: string
          created_at?: string
          emotion_cost?: Json
          emotion_reward?: Json
          id?: string
          is_premium?: boolean
          likes_count?: number
          media_url?: string | null
          user_id: string
          views_count?: number
        }
        Update: {
          ai_detected_emotions?: Json
          comments_count?: number
          content?: string
          created_at?: string
          emotion_cost?: Json
          emotion_reward?: Json
          id?: string
          is_premium?: boolean
          likes_count?: number
          media_url?: string | null
          user_id?: string
          views_count?: number
        }
        Relationships: []
      }
      emotion_subscriptions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          price: number
          started_at: string
          status: string
          tier: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          price: number
          started_at?: string
          status?: string
          tier: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          price?: number
          started_at?: string
          status?: string
          tier?: string
          user_id?: string
        }
        Relationships: []
      }
      emotion_transactions: {
        Row: {
          amount: number
          buyer_id: string
          created_at: string
          emotion_type: string
          id: string
          price: number | null
          seller_id: string | null
          status: string
          transaction_type: string
        }
        Insert: {
          amount: number
          buyer_id: string
          created_at?: string
          emotion_type: string
          id?: string
          price?: number | null
          seller_id?: string | null
          status?: string
          transaction_type: string
        }
        Update: {
          amount?: number
          buyer_id?: string
          created_at?: string
          emotion_type?: string
          id?: string
          price?: number | null
          seller_id?: string | null
          status?: string
          transaction_type?: string
        }
        Relationships: []
      }
      emotion_wallets: {
        Row: {
          anger_balance: number
          created_at: string
          excitement_balance: number
          fear_balance: number
          has_insurance: boolean
          id: string
          is_premium: boolean
          joy_balance: number
          love_balance: number
          motivation_balance: number
          peace_balance: number
          sadness_balance: number
          total_mined: number
          total_traded: number
          updated_at: string
          user_id: string
        }
        Insert: {
          anger_balance?: number
          created_at?: string
          excitement_balance?: number
          fear_balance?: number
          has_insurance?: boolean
          id?: string
          is_premium?: boolean
          joy_balance?: number
          love_balance?: number
          motivation_balance?: number
          peace_balance?: number
          sadness_balance?: number
          total_mined?: number
          total_traded?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          anger_balance?: number
          created_at?: string
          excitement_balance?: number
          fear_balance?: number
          has_insurance?: boolean
          id?: string
          is_premium?: boolean
          joy_balance?: number
          love_balance?: number
          motivation_balance?: number
          peace_balance?: number
          sadness_balance?: number
          total_mined?: number
          total_traded?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      escape_room_challenges: {
        Row: {
          access_duration_hours: number
          access_price: number
          created_at: string | null
          description: string | null
          ends_at: string
          id: string
          is_active: boolean | null
          prize_pool: number | null
          room_id: string
          starts_at: string
          title: string
        }
        Insert: {
          access_duration_hours: number
          access_price: number
          created_at?: string | null
          description?: string | null
          ends_at: string
          id?: string
          is_active?: boolean | null
          prize_pool?: number | null
          room_id: string
          starts_at: string
          title: string
        }
        Update: {
          access_duration_hours?: number
          access_price?: number
          created_at?: string | null
          description?: string | null
          ends_at?: string
          id?: string
          is_active?: boolean | null
          prize_pool?: number | null
          room_id?: string
          starts_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "escape_room_challenges_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "escape_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      escape_room_earnings: {
        Row: {
          amount: number
          created_at: string | null
          creator_id: string
          id: string
          net_amount: number
          paid_at: string | null
          platform_fee: number
          room_id: string
          session_id: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          creator_id: string
          id?: string
          net_amount: number
          paid_at?: string | null
          platform_fee: number
          room_id: string
          session_id?: string | null
          status: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          creator_id?: string
          id?: string
          net_amount?: number
          paid_at?: string | null
          platform_fee?: number
          room_id?: string
          session_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "escape_room_earnings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "escape_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escape_room_earnings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "escape_room_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      escape_room_leaderboard: {
        Row: {
          completion_time_seconds: number
          created_at: string | null
          hints_used: number | null
          id: string
          room_id: string
          score: number
          session_id: string
          team_name: string
        }
        Insert: {
          completion_time_seconds: number
          created_at?: string | null
          hints_used?: number | null
          id?: string
          room_id: string
          score: number
          session_id: string
          team_name: string
        }
        Update: {
          completion_time_seconds?: number
          created_at?: string | null
          hints_used?: number | null
          id?: string
          room_id?: string
          score?: number
          session_id?: string
          team_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "escape_room_leaderboard_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "escape_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escape_room_leaderboard_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "escape_room_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      escape_room_puzzles: {
        Row: {
          created_at: string | null
          description: string | null
          hint_cost: number | null
          hint_text: string | null
          id: string
          puzzle_data: Json
          puzzle_order: number
          puzzle_type: string
          room_id: string
          solution: Json
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          hint_cost?: number | null
          hint_text?: string | null
          id?: string
          puzzle_data: Json
          puzzle_order: number
          puzzle_type: string
          room_id: string
          solution: Json
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          hint_cost?: number | null
          hint_text?: string | null
          id?: string
          puzzle_data?: Json
          puzzle_order?: number
          puzzle_type?: string
          room_id?: string
          solution?: Json
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "escape_room_puzzles_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "escape_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      escape_room_rooms: {
        Row: {
          created_at: string
          description: string | null
          escape_room_id: string
          id: string
          keys_required: number
          puzzle_type: string
          room_name: string
          room_number: number
          theme_variation: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          escape_room_id: string
          id?: string
          keys_required?: number
          puzzle_type?: string
          room_name: string
          room_number: number
          theme_variation?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          escape_room_id?: string
          id?: string
          keys_required?: number
          puzzle_type?: string
          room_name?: string
          room_number?: number
          theme_variation?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escape_room_rooms_escape_room_id_fkey"
            columns: ["escape_room_id"]
            isOneToOne: false
            referencedRelation: "escape_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      escape_room_sessions: {
        Row: {
          completed_at: string | null
          completion_time_seconds: number | null
          created_at: string | null
          hints_used: number | null
          id: string
          room_id: string
          score: number | null
          started_at: string | null
          status: string
          team_name: string
        }
        Insert: {
          completed_at?: string | null
          completion_time_seconds?: number | null
          created_at?: string | null
          hints_used?: number | null
          id?: string
          room_id: string
          score?: number | null
          started_at?: string | null
          status: string
          team_name: string
        }
        Update: {
          completed_at?: string | null
          completion_time_seconds?: number | null
          created_at?: string | null
          hints_used?: number | null
          id?: string
          room_id?: string
          score?: number | null
          started_at?: string | null
          status?: string
          team_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "escape_room_sessions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "escape_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      escape_room_subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          expires_at: string | null
          id: string
          started_at: string | null
          status: string
          stripe_subscription_id: string | null
          tier: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          started_at?: string | null
          status: string
          stripe_subscription_id?: string | null
          tier: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      escape_rooms: {
        Row: {
          created_at: string | null
          creator_id: string | null
          description: string | null
          difficulty: string
          duration_minutes: number
          id: string
          is_premium: boolean | null
          is_published: boolean | null
          max_players: number
          price: number
          rating: number | null
          room_type: string
          theme: string
          thumbnail_url: string | null
          title: string
          total_plays: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          difficulty: string
          duration_minutes?: number
          id?: string
          is_premium?: boolean | null
          is_published?: boolean | null
          max_players?: number
          price?: number
          rating?: number | null
          room_type: string
          theme: string
          thumbnail_url?: string | null
          title: string
          total_plays?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          difficulty?: string
          duration_minutes?: number
          id?: string
          is_premium?: boolean | null
          is_published?: boolean | null
          max_players?: number
          price?: number
          rating?: number | null
          room_type?: string
          theme?: string
          thumbnail_url?: string | null
          title?: string
          total_plays?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      f1_fantasy_teams: {
        Row: {
          constructor_id: string | null
          created_at: string | null
          driver1_id: string | null
          driver2_id: string | null
          id: string
          team_name: string
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          constructor_id?: string | null
          created_at?: string | null
          driver1_id?: string | null
          driver2_id?: string | null
          id?: string
          team_name: string
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          constructor_id?: string | null
          created_at?: string | null
          driver1_id?: string | null
          driver2_id?: string | null
          id?: string
          team_name?: string
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      f1_leaderboard: {
        Row: {
          created_at: string | null
          id: string
          tier: string | null
          total_points: number | null
          updated_at: string | null
          user_id: string
          username: string
          wins: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          tier?: string | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
          username: string
          wins?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          tier?: string | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
          username?: string
          wins?: number | null
        }
        Relationships: []
      }
      f1_user_credits: {
        Row: {
          created_at: string | null
          credits: number
          id: string
          tier: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits?: number
          id?: string
          tier?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits?: number
          id?: string
          tier?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fashion_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          parent_category_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_category_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_category_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "fashion_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "fashion_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      fashion_challenge_submissions: {
        Row: {
          challenge_id: string
          design_id: string
          id: string
          submitted_at: string | null
          user_id: string
          votes_count: number | null
        }
        Insert: {
          challenge_id: string
          design_id: string
          id?: string
          submitted_at?: string | null
          user_id: string
          votes_count?: number | null
        }
        Update: {
          challenge_id?: string
          design_id?: string
          id?: string
          submitted_at?: string | null
          user_id?: string
          votes_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fashion_challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "fashion_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fashion_challenge_submissions_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "fashion_designs"
            referencedColumns: ["id"]
          },
        ]
      }
      fashion_challenge_votes: {
        Row: {
          created_at: string | null
          id: string
          submission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          submission_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          submission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fashion_challenge_votes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "fashion_challenge_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      fashion_challenges: {
        Row: {
          created_at: string | null
          description: string
          end_date: string
          id: string
          is_active: boolean | null
          prize_description: string | null
          start_date: string
          theme: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          end_date: string
          id?: string
          is_active?: boolean | null
          prize_description?: string | null
          start_date: string
          theme: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          end_date?: string
          id?: string
          is_active?: boolean | null
          prize_description?: string | null
          start_date?: string
          theme?: string
          title?: string
        }
        Relationships: []
      }
      fashion_designs: {
        Row: {
          category_id: string | null
          colors: string[] | null
          created_at: string | null
          credits_used: number
          description: string | null
          details: Json | null
          downloads_count: number | null
          id: string
          image_url: string
          is_public: boolean | null
          likes_count: number | null
          material_id: string | null
          prompt: string
          quality_level: string | null
          style_id: string | null
          title: string
          updated_at: string | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          category_id?: string | null
          colors?: string[] | null
          created_at?: string | null
          credits_used?: number
          description?: string | null
          details?: Json | null
          downloads_count?: number | null
          id?: string
          image_url: string
          is_public?: boolean | null
          likes_count?: number | null
          material_id?: string | null
          prompt: string
          quality_level?: string | null
          style_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          category_id?: string | null
          colors?: string[] | null
          created_at?: string | null
          credits_used?: number
          description?: string | null
          details?: Json | null
          downloads_count?: number | null
          id?: string
          image_url?: string
          is_public?: boolean | null
          likes_count?: number | null
          material_id?: string | null
          prompt?: string
          quality_level?: string | null
          style_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fashion_designs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "fashion_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fashion_designs_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "fashion_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fashion_designs_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "fashion_styles"
            referencedColumns: ["id"]
          },
        ]
      }
      fashion_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      fashion_likes: {
        Row: {
          created_at: string | null
          design_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          design_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          design_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fashion_likes_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "fashion_designs"
            referencedColumns: ["id"]
          },
        ]
      }
      fashion_marketplace: {
        Row: {
          created_at: string | null
          description: string | null
          design_id: string
          id: string
          is_active: boolean | null
          license_type: string
          price_czk: number
          sales_count: number | null
          seller_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          design_id: string
          id?: string
          is_active?: boolean | null
          license_type: string
          price_czk: number
          sales_count?: number | null
          seller_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          design_id?: string
          id?: string
          is_active?: boolean | null
          license_type?: string
          price_czk?: number
          sales_count?: number | null
          seller_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fashion_marketplace_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "fashion_designs"
            referencedColumns: ["id"]
          },
        ]
      }
      fashion_materials: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      fashion_purchases: {
        Row: {
          buyer_id: string
          commission_czk: number
          design_id: string
          id: string
          license_type: string
          listing_id: string
          price_paid_czk: number
          purchased_at: string | null
          seller_id: string
        }
        Insert: {
          buyer_id: string
          commission_czk: number
          design_id: string
          id?: string
          license_type: string
          listing_id: string
          price_paid_czk: number
          purchased_at?: string | null
          seller_id: string
        }
        Update: {
          buyer_id?: string
          commission_czk?: number
          design_id?: string
          id?: string
          license_type?: string
          listing_id?: string
          price_paid_czk?: number
          purchased_at?: string | null
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fashion_purchases_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "fashion_designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fashion_purchases_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "fashion_marketplace"
            referencedColumns: ["id"]
          },
        ]
      }
      fashion_styles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      fashion_subscriptions: {
        Row: {
          created_at: string | null
          credits_per_month: number
          expires_at: string | null
          features: Json | null
          id: string
          price_czk: number
          started_at: string | null
          status: string | null
          tier: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_per_month: number
          expires_at?: string | null
          features?: Json | null
          id?: string
          price_czk: number
          started_at?: string | null
          status?: string | null
          tier: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_per_month?: number
          expires_at?: string | null
          features?: Json | null
          id?: string
          price_czk?: number
          started_at?: string | null
          status?: string | null
          tier?: string
          updated_at?: string | null
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
      food_scans: {
        Row: {
          calories: number
          carbs: number | null
          created_at: string
          fats: number | null
          food_name: string
          healthier_alternatives: Json | null
          id: string
          image_url: string
          protein: number | null
          scan_date: string
          user_id: string
          vitamins: Json | null
        }
        Insert: {
          calories: number
          carbs?: number | null
          created_at?: string
          fats?: number | null
          food_name: string
          healthier_alternatives?: Json | null
          id?: string
          image_url: string
          protein?: number | null
          scan_date?: string
          user_id: string
          vitamins?: Json | null
        }
        Update: {
          calories?: number
          carbs?: number | null
          created_at?: string
          fats?: number | null
          food_name?: string
          healthier_alternatives?: Json | null
          id?: string
          image_url?: string
          protein?: number | null
          scan_date?: string
          user_id?: string
          vitamins?: Json | null
        }
        Relationships: []
      }
      food_scans_ai: {
        Row: {
          created_at: string
          credits_used: number
          healthier_alternatives: Json | null
          id: string
          image_url: string
          nutritional_info: Json
          recognized_items: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_used?: number
          healthier_alternatives?: Json | null
          id?: string
          image_url: string
          nutritional_info: Json
          recognized_items: Json
          user_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          healthier_alternatives?: Json | null
          id?: string
          image_url?: string
          nutritional_info?: Json
          recognized_items?: Json
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
      future_face_progressions: {
        Row: {
          anti_aging_tips: string | null
          created_at: string | null
          has_comparison: boolean | null
          healthy_image_url: string | null
          id: string
          original_image_url: string
          unhealthy_image_url: string | null
          user_id: string
          years_forward: number
        }
        Insert: {
          anti_aging_tips?: string | null
          created_at?: string | null
          has_comparison?: boolean | null
          healthy_image_url?: string | null
          id?: string
          original_image_url: string
          unhealthy_image_url?: string | null
          user_id: string
          years_forward: number
        }
        Update: {
          anti_aging_tips?: string | null
          created_at?: string | null
          has_comparison?: boolean | null
          healthy_image_url?: string | null
          id?: string
          original_image_url?: string
          unhealthy_image_url?: string | null
          user_id?: string
          years_forward?: number
        }
        Relationships: []
      }
      hero_campaigns: {
        Row: {
          created_at: string | null
          current_amount: number | null
          description: string
          ends_at: string | null
          hero_type: string
          id: string
          image_url: string | null
          organization_name: string | null
          sponsors: Json | null
          status: string | null
          story: string
          supporters_count: number | null
          target_amount: number
          title: string
          updated_at: string | null
          user_id: string
          verified: boolean | null
          verified_by: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          current_amount?: number | null
          description: string
          ends_at?: string | null
          hero_type: string
          id?: string
          image_url?: string | null
          organization_name?: string | null
          sponsors?: Json | null
          status?: string | null
          story: string
          supporters_count?: number | null
          target_amount: number
          title: string
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
          verified_by?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          current_amount?: number | null
          description?: string
          ends_at?: string | null
          hero_type?: string
          id?: string
          image_url?: string | null
          organization_name?: string | null
          sponsors?: Json | null
          status?: string | null
          story?: string
          supporters_count?: number | null
          target_amount?: number
          title?: string
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
          verified_by?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      home_decor_items: {
        Row: {
          category: string
          condition: string
          created_at: string | null
          description: string
          id: string
          image_url: string | null
          price: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          condition: string
          created_at?: string | null
          description: string
          id?: string
          image_url?: string | null
          price: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          condition?: string
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          price?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      home_decor_messages: {
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
            foreignKeyName: "home_decor_messages_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "home_decor_items"
            referencedColumns: ["id"]
          },
        ]
      }
      home_decor_sales: {
        Row: {
          buyer_id: string
          commission_amount: number | null
          commission_rate: number | null
          created_at: string | null
          id: string
          item_id: string
          payment_intent_id: string | null
          sale_price: number
          seller_amount: number | null
          seller_id: string
          status: string
        }
        Insert: {
          buyer_id: string
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          item_id: string
          payment_intent_id?: string | null
          sale_price: number
          seller_amount?: number | null
          seller_id: string
          status?: string
        }
        Update: {
          buyer_id?: string
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          item_id?: string
          payment_intent_id?: string | null
          sale_price?: number
          seller_amount?: number | null
          seller_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "home_decor_sales_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "home_decor_items"
            referencedColumns: ["id"]
          },
        ]
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
      horse_training: {
        Row: {
          created_at: string
          horse_id: string
          id: string
          last_trained_at: string
          level: number
          progress: number
          training_type: string
        }
        Insert: {
          created_at?: string
          horse_id: string
          id?: string
          last_trained_at?: string
          level?: number
          progress?: number
          training_type: string
        }
        Update: {
          created_at?: string
          horse_id?: string
          id?: string
          last_trained_at?: string
          level?: number
          progress?: number
          training_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "horse_training_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
        ]
      }
      horses: {
        Row: {
          acceleration_stat: number
          age_days: number
          breed: string
          breeding_count: number
          color: string
          created_at: string
          experience: number
          id: string
          is_retired: boolean
          level: number
          max_breeding: number
          name: string
          rarity: string
          speed_stat: number
          stamina_stat: number
          temperament_stat: number
          total_races: number
          total_wins: number
          updated_at: string
          user_id: string
        }
        Insert: {
          acceleration_stat?: number
          age_days?: number
          breed: string
          breeding_count?: number
          color?: string
          created_at?: string
          experience?: number
          id?: string
          is_retired?: boolean
          level?: number
          max_breeding?: number
          name: string
          rarity?: string
          speed_stat?: number
          stamina_stat?: number
          temperament_stat?: number
          total_races?: number
          total_wins?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          acceleration_stat?: number
          age_days?: number
          breed?: string
          breeding_count?: number
          color?: string
          created_at?: string
          experience?: number
          id?: string
          is_retired?: boolean
          level?: number
          max_breeding?: number
          name?: string
          rarity?: string
          speed_stat?: number
          stamina_stat?: number
          temperament_stat?: number
          total_races?: number
          total_wins?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      influencer_content: {
        Row: {
          caption: string | null
          comments: number | null
          content_type: string
          content_url: string
          created_at: string | null
          earnings: number | null
          id: string
          influencer_id: string
          likes: number | null
          shares: number | null
        }
        Insert: {
          caption?: string | null
          comments?: number | null
          content_type: string
          content_url: string
          created_at?: string | null
          earnings?: number | null
          id?: string
          influencer_id: string
          likes?: number | null
          shares?: number | null
        }
        Update: {
          caption?: string | null
          comments?: number | null
          content_type?: string
          content_url?: string
          created_at?: string | null
          earnings?: number | null
          id?: string
          influencer_id?: string
          likes?: number | null
          shares?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "influencer_content_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "virtual_influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_earnings: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          influencer_id: string
          net_amount: number
          platform_fee: number
          source: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          influencer_id: string
          net_amount: number
          platform_fee: number
          source: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          influencer_id?: string
          net_amount?: number
          platform_fee?: number
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencer_earnings_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "virtual_influencers"
            referencedColumns: ["id"]
          },
        ]
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
      influencer_subscriptions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          influencer_id: string
          monthly_price: number
          status: string | null
          subscriber_user_id: string
          tier: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          influencer_id: string
          monthly_price: number
          status?: string | null
          subscriber_user_id: string
          tier: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          influencer_id?: string
          monthly_price?: number
          status?: string | null
          subscriber_user_id?: string
          tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencer_subscriptions_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "virtual_influencers"
            referencedColumns: ["id"]
          },
        ]
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
      iq_analyses: {
        Row: {
          analysis_type: string
          created_at: string
          credits_cost: number
          id: string
          results: Json
          user_id: string
        }
        Insert: {
          analysis_type: string
          created_at?: string
          credits_cost: number
          id?: string
          results: Json
          user_id: string
        }
        Update: {
          analysis_type?: string
          created_at?: string
          credits_cost?: number
          id?: string
          results?: Json
          user_id?: string
        }
        Relationships: []
      }
      iq_competition_participants: {
        Row: {
          competition_id: string
          id: string
          joined_at: string
          prize_amount: number | null
          rank: number | null
          score: number | null
          user_id: string
        }
        Insert: {
          competition_id: string
          id?: string
          joined_at?: string
          prize_amount?: number | null
          rank?: number | null
          score?: number | null
          user_id: string
        }
        Update: {
          competition_id?: string
          id?: string
          joined_at?: string
          prize_amount?: number | null
          rank?: number | null
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "iq_competition_participants_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "iq_competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      iq_competitions: {
        Row: {
          created_at: string
          description: string | null
          end_time: string
          entry_fee: number
          id: string
          max_participants: number | null
          prize_pool: number
          start_time: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time: string
          entry_fee: number
          id?: string
          max_participants?: number | null
          prize_pool?: number
          start_time: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string
          entry_fee?: number
          id?: string
          max_participants?: number | null
          prize_pool?: number
          start_time?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      iq_credits: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      iq_test_questions: {
        Row: {
          correct_answer: string
          created_at: string
          difficulty: string
          id: string
          options: Json
          order_num: number
          question: string
          test_id: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          difficulty: string
          id?: string
          options: Json
          order_num: number
          question: string
          test_id: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          difficulty?: string
          id?: string
          options?: Json
          order_num?: number
          question?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "iq_test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "iq_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      iq_test_results: {
        Row: {
          answers: Json
          completed_at: string
          id: string
          iq_score: number
          score: number
          test_id: string
          time_taken: number
          user_id: string
        }
        Insert: {
          answers: Json
          completed_at?: string
          id?: string
          iq_score: number
          score: number
          test_id: string
          time_taken: number
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string
          id?: string
          iq_score?: number
          score?: number
          test_id?: string
          time_taken?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "iq_test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "iq_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      iq_tests: {
        Row: {
          created_at: string
          credits_cost: number
          description: string | null
          difficulty: string
          id: string
          is_active: boolean
          questions_count: number
          time_limit: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits_cost?: number
          description?: string | null
          difficulty: string
          id?: string
          is_active?: boolean
          questions_count: number
          time_limit: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits_cost?: number
          description?: string | null
          difficulty?: string
          id?: string
          is_active?: boolean
          questions_count?: number
          time_limit?: number
          title?: string
          updated_at?: string
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
          expiration_notification_sent_at: string | null
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
          expiration_notification_sent_at?: string | null
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
          expiration_notification_sent_at?: string | null
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
      lesson_discussions: {
        Row: {
          created_at: string | null
          id: string
          lesson_id: string
          likes_count: number | null
          message: string
          parent_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lesson_id: string
          likes_count?: number | null
          message: string
          parent_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lesson_id?: string
          likes_count?: number | null
          message?: string
          parent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_discussions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_discussions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "lesson_discussions"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          enrollment_id: string
          id: string
          is_completed: boolean | null
          last_watched_at: string | null
          lesson_id: string
          watch_time_seconds: number | null
        }
        Insert: {
          completed_at?: string | null
          enrollment_id: string
          id?: string
          is_completed?: boolean | null
          last_watched_at?: string | null
          lesson_id: string
          watch_time_seconds?: number | null
        }
        Update: {
          completed_at?: string | null
          enrollment_id?: string
          id?: string
          is_completed?: boolean | null
          last_watched_at?: string | null
          lesson_id?: string
          watch_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
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
      live_concert_streams: {
        Row: {
          created_at: string | null
          description: string | null
          ended_at: string | null
          id: string
          musician_id: string
          scheduled_at: string
          started_at: string | null
          status: string | null
          stream_key: string | null
          title: string
          total_revenue: number | null
          updated_at: string | null
          viewer_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          musician_id: string
          scheduled_at: string
          started_at?: string | null
          status?: string | null
          stream_key?: string | null
          title: string
          total_revenue?: number | null
          updated_at?: string | null
          viewer_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          musician_id?: string
          scheduled_at?: string
          started_at?: string | null
          status?: string | null
          stream_key?: string | null
          title?: string
          total_revenue?: number | null
          updated_at?: string | null
          viewer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "live_concert_streams_musician_id_fkey"
            columns: ["musician_id"]
            isOneToOne: false
            referencedRelation: "musician_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      lottery_generations: {
        Row: {
          bonus_numbers: number[] | null
          created_at: string | null
          id: string
          is_favorite: boolean | null
          lottery_type: string
          main_numbers: number[]
          user_id: string
        }
        Insert: {
          bonus_numbers?: number[] | null
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          lottery_type: string
          main_numbers: number[]
          user_id: string
        }
        Update: {
          bonus_numbers?: number[] | null
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          lottery_type?: string
          main_numbers?: number[]
          user_id?: string
        }
        Relationships: []
      }
      macro_tracking: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string
          date: string
          fats: number | null
          id: string
          meals: Json | null
          protein: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          date?: string
          fats?: number | null
          id?: string
          meals?: Json | null
          protein?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          date?: string
          fats?: number | null
          id?: string
          meals?: Json | null
          protein?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      masterchef_gifts: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string
          id: string
          is_active: boolean | null
          name: string
          price: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon: string
          id?: string
          is_active?: boolean | null
          name: string
          price: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
        }
        Relationships: []
      }
      masterchef_platform_earnings: {
        Row: {
          chef_amount: number
          commission_amount: number
          commission_rate: number
          created_at: string | null
          gift_id: string
          id: string
          status: string | null
          total_amount: number
        }
        Insert: {
          chef_amount: number
          commission_amount: number
          commission_rate: number
          created_at?: string | null
          gift_id: string
          id?: string
          status?: string | null
          total_amount: number
        }
        Update: {
          chef_amount?: number
          commission_amount?: number
          commission_rate?: number
          created_at?: string | null
          gift_id?: string
          id?: string
          status?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "masterchef_platform_earnings_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: true
            referencedRelation: "masterchef_sent_gifts"
            referencedColumns: ["id"]
          },
        ]
      }
      masterchef_sent_gifts: {
        Row: {
          amount: number
          chef_amount: number | null
          chef_id: string
          commission_rate: number | null
          competition_id: string | null
          created_at: string | null
          gift_id: string
          id: string
          message: string | null
          platform_commission: number | null
          sender_id: string
          status: string | null
          stripe_session_id: string | null
        }
        Insert: {
          amount: number
          chef_amount?: number | null
          chef_id: string
          commission_rate?: number | null
          competition_id?: string | null
          created_at?: string | null
          gift_id: string
          id?: string
          message?: string | null
          platform_commission?: number | null
          sender_id: string
          status?: string | null
          stripe_session_id?: string | null
        }
        Update: {
          amount?: number
          chef_amount?: number | null
          chef_id?: string
          commission_rate?: number | null
          competition_id?: string | null
          created_at?: string | null
          gift_id?: string
          id?: string
          message?: string | null
          platform_commission?: number | null
          sender_id?: string
          status?: string | null
          stripe_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "masterchef_sent_gifts_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "masterchef_gifts"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          allergens: string[] | null
          created_at: string
          days: number
          description: string | null
          dietary_preferences: string[] | null
          id: string
          is_premium: boolean | null
          plan_data: Json
          shopping_list: Json | null
          target_calories: number
          target_carbs: number | null
          target_fats: number | null
          target_protein: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allergens?: string[] | null
          created_at?: string
          days?: number
          description?: string | null
          dietary_preferences?: string[] | null
          id?: string
          is_premium?: boolean | null
          plan_data: Json
          shopping_list?: Json | null
          target_calories: number
          target_carbs?: number | null
          target_fats?: number | null
          target_protein?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allergens?: string[] | null
          created_at?: string
          days?: number
          description?: string | null
          dietary_preferences?: string[] | null
          id?: string
          is_premium?: boolean | null
          plan_data?: Json
          shopping_list?: Json | null
          target_calories?: number
          target_carbs?: number | null
          target_fats?: number | null
          target_protein?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meal_plans_ai: {
        Row: {
          created_at: string
          credits_used: number
          days_count: number
          dietary_preferences: string[] | null
          id: string
          meals: Json
          plan_name: string
          shopping_list: Json | null
          total_calories: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_used?: number
          days_count: number
          dietary_preferences?: string[] | null
          id?: string
          meals: Json
          plan_name: string
          shopping_list?: Json | null
          total_calories?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          days_count?: number
          dietary_preferences?: string[] | null
          id?: string
          meals?: Json
          plan_name?: string
          shopping_list?: Json | null
          total_calories?: number | null
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
      medical_campaigns: {
        Row: {
          created_at: string | null
          current_amount: number | null
          description: string
          diagnosis: string
          ends_at: string | null
          hospital: string | null
          id: string
          image_url: string | null
          medical_documents: string[] | null
          monthly_donors_count: number | null
          one_time_donors_count: number | null
          patient_name: string
          status: string | null
          story: string
          target_amount: number
          title: string
          updated_at: string | null
          user_id: string
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          current_amount?: number | null
          description: string
          diagnosis: string
          ends_at?: string | null
          hospital?: string | null
          id?: string
          image_url?: string | null
          medical_documents?: string[] | null
          monthly_donors_count?: number | null
          one_time_donors_count?: number | null
          patient_name: string
          status?: string | null
          story: string
          target_amount: number
          title: string
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          current_amount?: number | null
          description?: string
          diagnosis?: string
          ends_at?: string | null
          hospital?: string | null
          id?: string
          image_url?: string | null
          medical_documents?: string[] | null
          monthly_donors_count?: number | null
          one_time_donors_count?: number | null
          patient_name?: string
          status?: string | null
          story?: string
          target_amount?: number
          title?: string
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
          video_url?: string | null
        }
        Relationships: []
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
      memories: {
        Row: {
          category: string
          content: Json
          created_at: string
          description: string
          id: string
          is_verified: boolean | null
          price: number
          rating: number | null
          times_stolen: number | null
          title: string
          updated_at: string
          user_id: string
          verification_requested: boolean | null
        }
        Insert: {
          category: string
          content: Json
          created_at?: string
          description: string
          id?: string
          is_verified?: boolean | null
          price?: number
          rating?: number | null
          times_stolen?: number | null
          title: string
          updated_at?: string
          user_id: string
          verification_requested?: boolean | null
        }
        Update: {
          category?: string
          content?: Json
          created_at?: string
          description?: string
          id?: string
          is_verified?: boolean | null
          price?: number
          rating?: number | null
          times_stolen?: number | null
          title?: string
          updated_at?: string
          user_id?: string
          verification_requested?: boolean | null
        }
        Relationships: []
      }
      memory_auction_bids: {
        Row: {
          auction_id: string
          bid_amount: number
          bid_at: string
          bidder_id: string
          id: string
        }
        Insert: {
          auction_id: string
          bid_amount: number
          bid_at?: string
          bidder_id: string
          id?: string
        }
        Update: {
          auction_id?: string
          bid_amount?: number
          bid_at?: string
          bidder_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_auction_bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "memory_auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_auctions: {
        Row: {
          created_at: string
          current_bid: number | null
          ends_at: string
          highest_bidder_id: string | null
          id: string
          memory_id: string
          starting_price: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_bid?: number | null
          ends_at: string
          highest_bidder_id?: string | null
          id?: string
          memory_id: string
          starting_price: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_bid?: number | null
          ends_at?: string
          highest_bidder_id?: string | null
          id?: string
          memory_id?: string
          starting_price?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_auctions_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_collection_purchases: {
        Row: {
          buyer_id: string
          collection_id: string
          id: string
          price_paid: number
          purchased_at: string
        }
        Insert: {
          buyer_id: string
          collection_id: string
          id?: string
          price_paid: number
          purchased_at?: string
        }
        Update: {
          buyer_id?: string
          collection_id?: string
          id?: string
          price_paid?: number
          purchased_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_collection_purchases_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "memory_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_collections: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string
          id: string
          memory_ids: string[]
          name: string
          price: number
          times_purchased: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description: string
          id?: string
          memory_ids: string[]
          name: string
          price?: number
          times_purchased?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string
          id?: string
          memory_ids?: string[]
          name?: string
          price?: number
          times_purchased?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      memory_purchases: {
        Row: {
          buyer_id: string
          id: string
          memory_id: string
          price_paid: number
          purchased_at: string
          rating: number | null
          review: string | null
        }
        Insert: {
          buyer_id: string
          id?: string
          memory_id: string
          price_paid: number
          purchased_at?: string
          rating?: number | null
          review?: string | null
        }
        Update: {
          buyer_id?: string
          id?: string
          memory_id?: string
          price_paid?: number
          purchased_at?: string
          rating?: number | null
          review?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_purchases_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_verifications: {
        Row: {
          created_at: string
          id: string
          memory_id: string
          notes: string | null
          requested_by: string
          status: string
          verification_cost: number
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          memory_id: string
          notes?: string | null
          requested_by: string
          status?: string
          verification_cost?: number
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          memory_id?: string
          notes?: string | null
          requested_by?: string
          status?: string
          verification_cost?: number
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_verifications_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
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
      musician_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          genre: string | null
          id: string
          stage_name: string
          total_concerts: number | null
          total_earnings: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          genre?: string | null
          id?: string
          stage_name: string
          total_concerts?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          genre?: string | null
          id?: string
          stage_name?: string
          total_concerts?: number | null
          total_earnings?: number | null
          updated_at?: string | null
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
          is_active: boolean
          max_rarity_level: number
          min_rarity_level: number
          name: string
          price: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          max_rarity_level?: number
          min_rarity_level?: number
          name: string
          price: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          max_rarity_level?: number
          min_rarity_level?: number
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
      nutrition_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string
          current_period_start: string
          features: Json | null
          food_scans_limit: number | null
          id: string
          meal_plans_limit: number | null
          status: string
          subscription_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end: string
          current_period_start?: string
          features?: Json | null
          food_scans_limit?: number | null
          id?: string
          meal_plans_limit?: number | null
          status?: string
          subscription_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          features?: Json | null
          food_scans_limit?: number | null
          id?: string
          meal_plans_limit?: number | null
          status?: string
          subscription_type?: string
          updated_at?: string
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
      paint_by_numbers: {
        Row: {
          category: string
          created_at: string | null
          difficulty: string
          id: string
          image_data: Json
          price_coins: number
          thumbnail_url: string | null
          title: string
          total_sections: number
        }
        Insert: {
          category: string
          created_at?: string | null
          difficulty: string
          id?: string
          image_data: Json
          price_coins?: number
          thumbnail_url?: string | null
          title: string
          total_sections: number
        }
        Update: {
          category?: string
          created_at?: string | null
          difficulty?: string
          id?: string
          image_data?: Json
          price_coins?: number
          thumbnail_url?: string | null
          title?: string
          total_sections?: number
        }
        Relationships: []
      }
      palmistry_readings: {
        Row: {
          created_at: string
          credits_used: number
          id: string
          image_url: string
          reading: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_used?: number
          id?: string
          image_url: string
          reading: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          id?: string
          image_url?: string
          reading?: string
          user_id?: string
        }
        Relationships: []
      }
      parallel_followers: {
        Row: {
          created_at: string
          follower_id: string
          id: string
          life_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          id?: string
          life_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          id?: string
          life_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parallel_followers_life_id_fkey"
            columns: ["life_id"]
            isOneToOne: false
            referencedRelation: "parallel_lives"
            referencedColumns: ["id"]
          },
        ]
      }
      parallel_lives: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_image_url: string | null
          created_at: string
          follower_count: number
          id: string
          is_active: boolean
          life_name: string
          lifestyle: string | null
          persona: string
          post_count: number
          profession: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string
          follower_count?: number
          id?: string
          is_active?: boolean
          life_name: string
          lifestyle?: string | null
          persona: string
          post_count?: number
          profession?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string
          follower_count?: number
          id?: string
          is_active?: boolean
          life_name?: string
          lifestyle?: string | null
          persona?: string
          post_count?: number
          profession?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      parallel_posts: {
        Row: {
          comments_count: number
          content: string
          created_at: string
          id: string
          life_id: string
          likes_count: number
          media_type: string | null
          media_url: string | null
        }
        Insert: {
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          life_id: string
          likes_count?: number
          media_type?: string | null
          media_url?: string | null
        }
        Update: {
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          life_id?: string
          likes_count?: number
          media_type?: string | null
          media_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parallel_posts_life_id_fkey"
            columns: ["life_id"]
            isOneToOne: false
            referencedRelation: "parallel_lives"
            referencedColumns: ["id"]
          },
        ]
      }
      parallel_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          max_lives: number
          price: number
          started_at: string
          status: string
          tier: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          max_lives: number
          price: number
          started_at?: string
          status?: string
          tier: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          max_lives?: number
          price?: number
          started_at?: string
          status?: string
          tier?: string
          user_id?: string
        }
        Relationships: []
      }
      personality_clones: {
        Row: {
          clone_name: string
          created_at: string
          id: string
          is_active: boolean
          personality_data: Json
          subscription_tier: string
          total_conversations: number
          training_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clone_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          personality_data?: Json
          subscription_tier?: string
          total_conversations?: number
          training_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clone_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          personality_data?: Json
          subscription_tier?: string
          total_conversations?: number
          training_status?: string
          updated_at?: string
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
      pet_rescue_campaigns: {
        Row: {
          created_at: string | null
          current_amount: number | null
          description: string
          id: string
          images: string[] | null
          medical_condition: string | null
          pet_name: string
          pet_type: string
          shelter_name: string | null
          status: string | null
          story: string
          supporters_count: number | null
          target_amount: number
          title: string
          updated_at: string | null
          urgent: boolean | null
          user_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          current_amount?: number | null
          description: string
          id?: string
          images?: string[] | null
          medical_condition?: string | null
          pet_name: string
          pet_type: string
          shelter_name?: string | null
          status?: string | null
          story: string
          supporters_count?: number | null
          target_amount: number
          title: string
          updated_at?: string | null
          urgent?: boolean | null
          user_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          current_amount?: number | null
          description?: string
          id?: string
          images?: string[] | null
          medical_condition?: string | null
          pet_name?: string
          pet_type?: string
          shelter_name?: string | null
          status?: string | null
          story?: string
          supporters_count?: number | null
          target_amount?: number
          title?: string
          updated_at?: string | null
          urgent?: boolean | null
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
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
          reposts_count: number
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
          reposts_count?: number
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
          reposts_count?: number
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
          coins: number | null
          company: string | null
          company_name: string | null
          completed_exchanges: number | null
          created_at: string
          email: string | null
          full_name: string | null
          iban: string | null
          id: string
          interests: string[] | null
          location: string | null
          occupation: string | null
          phone: string | null
          rating_average: number | null
          skills_offered: string[] | null
          skills_wanted: string[] | null
          social_links: Json | null
          total_reviews: number | null
          updated_at: string
          user_type: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          coins?: number | null
          company?: string | null
          company_name?: string | null
          completed_exchanges?: number | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          iban?: string | null
          id: string
          interests?: string[] | null
          location?: string | null
          occupation?: string | null
          phone?: string | null
          rating_average?: number | null
          skills_offered?: string[] | null
          skills_wanted?: string[] | null
          social_links?: Json | null
          total_reviews?: number | null
          updated_at?: string
          user_type?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          coins?: number | null
          company?: string | null
          company_name?: string | null
          completed_exchanges?: number | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          iban?: string | null
          id?: string
          interests?: string[] | null
          location?: string | null
          occupation?: string | null
          phone?: string | null
          rating_average?: number | null
          skills_offered?: string[] | null
          skills_wanted?: string[] | null
          social_links?: Json | null
          total_reviews?: number | null
          updated_at?: string
          user_type?: string | null
          website?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          area_sqm: number | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string | null
          description: string | null
          id: string
          location: string
          price: number
          property_type: string | null
          rooms: number | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          location: string
          price: number
          property_type?: string | null
          rooms?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string
          price?: number
          property_type?: string | null
          rooms?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      property_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          property_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          property_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_listings: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          inquiries_count: number | null
          is_active: boolean | null
          package_type: string
          price_paid: number
          property_id: string
          start_date: string | null
          views_count: number | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          inquiries_count?: number | null
          is_active?: boolean | null
          package_type: string
          price_paid: number
          property_id: string
          start_date?: string | null
          views_count?: number | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          inquiries_count?: number | null
          is_active?: boolean | null
          package_type?: string
          price_paid?: number
          property_id?: string
          start_date?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_listings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          package_type: string | null
          payment_intent_id: string | null
          payment_status: string | null
          property_id: string | null
          service_type: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          package_type?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          property_id?: string | null
          service_type?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          package_type?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          property_id?: string | null
          service_type?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_videos: {
        Row: {
          created_at: string | null
          id: string
          property_id: string
          video_type: string | null
          video_url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_id: string
          video_type?: string | null
          video_url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          property_id?: string
          video_type?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_videos_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
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
      quantum_collapses: {
        Row: {
          collapsed_version_id: string
          created_at: string
          id: string
          post_id: string
          price_paid: number
          user_id: string
        }
        Insert: {
          collapsed_version_id: string
          created_at?: string
          id?: string
          post_id: string
          price_paid?: number
          user_id: string
        }
        Update: {
          collapsed_version_id?: string
          created_at?: string
          id?: string
          post_id?: string
          price_paid?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quantum_collapses_collapsed_version_id_fkey"
            columns: ["collapsed_version_id"]
            isOneToOne: false
            referencedRelation: "quantum_post_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantum_collapses_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "quantum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      quantum_entanglements: {
        Row: {
          created_at: string
          entanglement_strength: number | null
          expires_at: string | null
          id: string
          price_paid: number
          shared_reality: boolean | null
          user_id_1: string
          user_id_2: string
        }
        Insert: {
          created_at?: string
          entanglement_strength?: number | null
          expires_at?: string | null
          id?: string
          price_paid?: number
          shared_reality?: boolean | null
          user_id_1: string
          user_id_2: string
        }
        Update: {
          created_at?: string
          entanglement_strength?: number | null
          expires_at?: string | null
          id?: string
          price_paid?: number
          shared_reality?: boolean | null
          user_id_1?: string
          user_id_2?: string
        }
        Relationships: []
      }
      quantum_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
          version_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
          version_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quantum_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "quantum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantum_likes_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "quantum_post_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      quantum_observations: {
        Row: {
          id: string
          observed_at: string
          observer_id: string
          post_id: string
          version_id: string
        }
        Insert: {
          id?: string
          observed_at?: string
          observer_id: string
          post_id: string
          version_id: string
        }
        Update: {
          id?: string
          observed_at?: string
          observer_id?: string
          post_id?: string
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quantum_observations_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "quantum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantum_observations_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "quantum_post_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      quantum_post_versions: {
        Row: {
          content: string
          created_at: string
          id: string
          media_urls: string[] | null
          personality_tone: string
          post_id: string
          version_number: number
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          media_urls?: string[] | null
          personality_tone: string
          post_id: string
          version_number: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          media_urls?: string[] | null
          personality_tone?: string
          post_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "quantum_post_versions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "quantum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      quantum_posts: {
        Row: {
          base_content: string
          collapse_paid: boolean | null
          created_at: string
          id: string
          is_collapsed: boolean | null
          likes_count: number | null
          updated_at: string
          user_id: string
          versions_count: number
        }
        Insert: {
          base_content: string
          collapse_paid?: boolean | null
          created_at?: string
          id?: string
          is_collapsed?: boolean | null
          likes_count?: number | null
          updated_at?: string
          user_id: string
          versions_count?: number
        }
        Update: {
          base_content?: string
          collapse_paid?: boolean | null
          created_at?: string
          id?: string
          is_collapsed?: boolean | null
          likes_count?: number | null
          updated_at?: string
          user_id?: string
          versions_count?: number
        }
        Relationships: []
      }
      quantum_profiles: {
        Row: {
          created_at: string
          id: string
          is_premium: boolean | null
          observer_mode_active: boolean | null
          quantum_mode: string
          reality_versions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_premium?: boolean | null
          observer_mode_active?: boolean | null
          quantum_mode?: string
          reality_versions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_premium?: boolean | null
          observer_mode_active?: boolean | null
          quantum_mode?: string
          reality_versions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quantum_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          price: number
          started_at: string
          status: string
          subscription_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          price: number
          started_at?: string
          status?: string
          subscription_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          price?: number
          started_at?: string
          status?: string
          subscription_type?: string
          user_id?: string
        }
        Relationships: []
      }
      quest_challenges: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          entry_fee: number
          id: string
          participants_count: number | null
          prize_pool: number | null
          start_date: string
          status: string
          title: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          entry_fee: number
          id?: string
          participants_count?: number | null
          prize_pool?: number | null
          start_date: string
          status?: string
          title: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          entry_fee?: number
          id?: string
          participants_count?: number | null
          prize_pool?: number | null
          start_date?: string
          status?: string
          title?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json
          attempted_at: string | null
          id: string
          passed: boolean
          quiz_id: string
          score: number
          user_id: string
        }
        Insert: {
          answers: Json
          attempted_at?: string | null
          id?: string
          passed: boolean
          quiz_id: string
          score: number
          user_id: string
        }
        Update: {
          answers?: Json
          attempted_at?: string | null
          id?: string
          passed?: boolean
          quiz_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "course_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          explanation: string | null
          id: string
          options: Json
          order_index: number
          question: string
          quiz_id: string
        }
        Insert: {
          correct_answer: string
          explanation?: string | null
          id?: string
          options: Json
          order_index: number
          question: string
          quiz_id: string
        }
        Update: {
          correct_answer?: string
          explanation?: string | null
          id?: string
          options?: Json
          order_index?: number
          question?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "course_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      race_participants: {
        Row: {
          coins_won: number | null
          created_at: string
          experience_gained: number | null
          finish_time_ms: number | null
          horse_id: string
          id: string
          position: number | null
          race_id: string
          strategy: string
          user_id: string
        }
        Insert: {
          coins_won?: number | null
          created_at?: string
          experience_gained?: number | null
          finish_time_ms?: number | null
          horse_id: string
          id?: string
          position?: number | null
          race_id: string
          strategy?: string
          user_id: string
        }
        Update: {
          coins_won?: number | null
          created_at?: string
          experience_gained?: number | null
          finish_time_ms?: number | null
          horse_id?: string
          id?: string
          position?: number | null
          race_id?: string
          strategy?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "race_participants_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_participants_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          },
        ]
      }
      races: {
        Row: {
          created_at: string
          distance: number
          entry_fee_coins: number
          finished_at: string | null
          id: string
          max_participants: number
          prize_pool_coins: number
          started_at: string | null
          status: string
          track_condition: string
          track_name: string
          weather: string
        }
        Insert: {
          created_at?: string
          distance: number
          entry_fee_coins?: number
          finished_at?: string | null
          id?: string
          max_participants?: number
          prize_pool_coins?: number
          started_at?: string | null
          status?: string
          track_condition?: string
          track_name: string
          weather?: string
        }
        Update: {
          created_at?: string
          distance?: number
          entry_fee_coins?: number
          finished_at?: string | null
          id?: string
          max_participants?: number
          prize_pool_coins?: number
          started_at?: string | null
          status?: string
          track_condition?: string
          track_name?: string
          weather?: string
        }
        Relationships: []
      }
      reality_merges: {
        Row: {
          id: string
          life_1_id: string
          life_2_id: string
          merge_data: Json
          merged_at: string
          merged_life_id: string | null
          payment_amount: number
          user_id: string
        }
        Insert: {
          id?: string
          life_1_id: string
          life_2_id: string
          merge_data?: Json
          merged_at?: string
          merged_life_id?: string | null
          payment_amount?: number
          user_id: string
        }
        Update: {
          id?: string
          life_1_id?: string
          life_2_id?: string
          merge_data?: Json
          merged_at?: string
          merged_life_id?: string | null
          payment_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reality_merges_life_1_id_fkey"
            columns: ["life_1_id"]
            isOneToOne: false
            referencedRelation: "parallel_lives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reality_merges_life_2_id_fkey"
            columns: ["life_2_id"]
            isOneToOne: false
            referencedRelation: "parallel_lives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reality_merges_merged_life_id_fkey"
            columns: ["merged_life_id"]
            isOneToOne: false
            referencedRelation: "parallel_lives"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          recipe_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          recipe_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          recipe_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recipe_generations: {
        Row: {
          created_at: string
          credits_used: number
          dietary_preferences: string[] | null
          generated_recipes: Json
          id: string
          ingredients: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_used?: number
          dietary_preferences?: string[] | null
          generated_recipes: Json
          id?: string
          ingredients: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          dietary_preferences?: string[] | null
          generated_recipes?: Json
          id?: string
          ingredients?: string[]
          user_id?: string
        }
        Relationships: []
      }
      recipe_likes: {
        Row: {
          created_at: string
          id: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: []
      }
      recipe_ratings: {
        Row: {
          created_at: string
          id: string
          rating: number
          recipe_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          recipe_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          recipe_id?: string
          updated_at?: string
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
      reposts: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          original_post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          original_post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          original_post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reposts_original_post_id_fkey"
            columns: ["original_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_analyses: {
        Row: {
          analysis: Json
          created_at: string
          credits_used: number
          id: string
          menu_image_url: string | null
          recommendations: Json
          restaurant_name: string | null
          user_id: string
        }
        Insert: {
          analysis: Json
          created_at?: string
          credits_used?: number
          id?: string
          menu_image_url?: string | null
          recommendations: Json
          restaurant_name?: string | null
          user_id: string
        }
        Update: {
          analysis?: Json
          created_at?: string
          credits_used?: number
          id?: string
          menu_image_url?: string | null
          recommendations?: Json
          restaurant_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      restaurant_menus: {
        Row: {
          analysis_data: Json
          created_at: string
          id: string
          menu_image_url: string | null
          recommendations: Json | null
          restaurant_name: string
          scan_count: number | null
          user_id: string | null
        }
        Insert: {
          analysis_data: Json
          created_at?: string
          id?: string
          menu_image_url?: string | null
          recommendations?: Json | null
          restaurant_name: string
          scan_count?: number | null
          user_id?: string | null
        }
        Update: {
          analysis_data?: Json
          created_at?: string
          id?: string
          menu_image_url?: string | null
          recommendations?: Json | null
          restaurant_name?: string
          scan_count?: number | null
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
      rune_readings: {
        Row: {
          created_at: string
          credits_used: number
          guidance: string
          id: string
          rune_meaning: string
          rune_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_used?: number
          guidance: string
          id?: string
          rune_meaning: string
          rune_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          guidance?: string
          id?: string
          rune_meaning?: string
          rune_name?: string
          user_id?: string
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
      school_profiles: {
        Row: {
          created_at: string
          id: string
          school_logo_url: string | null
          school_name: string | null
          subscription_expires_at: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          school_logo_url?: string | null
          school_name?: string | null
          subscription_expires_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          school_logo_url?: string | null
          school_name?: string | null
          subscription_expires_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      school_team_members: {
        Row: {
          email: string
          id: string
          invited_at: string
          joined_at: string | null
          name: string
          role: string
          school_id: string
          user_id: string
        }
        Insert: {
          email: string
          id?: string
          invited_at?: string
          joined_at?: string | null
          name: string
          role?: string
          school_id: string
          user_id: string
        }
        Update: {
          email?: string
          id?: string
          invited_at?: string
          joined_at?: string | null
          name?: string
          role?: string
          school_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_team_members_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_profiles"
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
      session_players: {
        Row: {
          id: string
          joined_at: string | null
          left_at: string | null
          role: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          left_at?: string | null
          role?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          left_at?: string | null
          role?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_players_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "escape_room_sessions"
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
      skill_matches: {
        Row: {
          created_at: string
          id: string
          match_score: number
          matched_user_id: string
          matching_skills: string[]
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_score?: number
          matched_user_id: string
          matching_skills: string[]
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_score?: number
          matched_user_id?: string
          matching_skills?: string[]
          status?: string | null
          updated_at?: string
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
        Relationships: [
          {
            foreignKeyName: "skill_offerings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_swap_conversations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          last_message_at: string | null
          offering_id: string | null
          status: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          offering_id?: string | null
          status?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          offering_id?: string | null
          status?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_swap_conversations_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "skill_offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_swap_messages: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          offering_id: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          offering_id?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          offering_id?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_swap_messages_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "skill_offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_swap_reviews: {
        Row: {
          comment: string | null
          conversation_id: string | null
          created_at: string
          id: string
          rating: number
          reviewed_user_id: string
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewed_user_id: string
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewed_user_id?: string
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_swap_reviews_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "skill_swap_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_ai_subscriptions: {
        Row: {
          amount_paid: number | null
          created_at: string
          expires_at: string | null
          features: Json | null
          id: string
          plan: string
          started_at: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          expires_at?: string | null
          features?: Json | null
          id?: string
          plan: string
          started_at?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          expires_at?: string | null
          features?: Json | null
          id?: string
          plan?: string
          started_at?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sports_matches: {
        Row: {
          away_form: string | null
          away_score: number | null
          away_team: string
          created_at: string
          head_to_head: Json | null
          home_form: string | null
          home_score: number | null
          home_team: string
          id: string
          injuries: Json | null
          league: string | null
          match_date: string
          match_time: string
          result: string | null
          sport: string
          status: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          away_form?: string | null
          away_score?: number | null
          away_team: string
          created_at?: string
          head_to_head?: Json | null
          home_form?: string | null
          home_score?: number | null
          home_team: string
          id?: string
          injuries?: Json | null
          league?: string | null
          match_date: string
          match_time: string
          result?: string | null
          sport: string
          status?: string | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          away_form?: string | null
          away_score?: number | null
          away_team?: string
          created_at?: string
          head_to_head?: Json | null
          home_form?: string | null
          home_score?: number | null
          home_team?: string
          id?: string
          injuries?: Json | null
          league?: string | null
          match_date?: string
          match_time?: string
          result?: string | null
          sport?: string
          status?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      sports_platform_earnings: {
        Row: {
          created_at: string
          id: string
          platform_commission: number
          related_id: string | null
          tipster_amount: number
          tipster_id: string
          total_amount: number
          transaction_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform_commission: number
          related_id?: string | null
          tipster_amount: number
          tipster_id: string
          total_amount: number
          transaction_type: string
        }
        Update: {
          created_at?: string
          id?: string
          platform_commission?: number
          related_id?: string | null
          tipster_amount?: number
          tipster_id?: string
          total_amount?: number
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "sports_platform_earnings_tipster_id_fkey"
            columns: ["tipster_id"]
            isOneToOne: false
            referencedRelation: "sports_tipsters"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_predictions: {
        Row: {
          analysis_text: string | null
          confidence: number | null
          created_at: string
          id: string
          is_free: boolean | null
          is_premium: boolean | null
          key_factors: Json | null
          match_id: string
          odds: number
          prediction_type: string
          prediction_value: string | null
          result: string | null
          settled_at: string | null
          tipster_id: string
          updated_at: string
        }
        Insert: {
          analysis_text?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          is_free?: boolean | null
          is_premium?: boolean | null
          key_factors?: Json | null
          match_id: string
          odds: number
          prediction_type: string
          prediction_value?: string | null
          result?: string | null
          settled_at?: string | null
          tipster_id: string
          updated_at?: string
        }
        Update: {
          analysis_text?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          is_free?: boolean | null
          is_premium?: boolean | null
          key_factors?: Json | null
          match_id?: string
          odds?: number
          prediction_type?: string
          prediction_value?: string | null
          result?: string | null
          settled_at?: string | null
          tipster_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sports_predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "sports_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sports_predictions_tipster_id_fkey"
            columns: ["tipster_id"]
            isOneToOne: false
            referencedRelation: "sports_tipsters"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_purchased_tips: {
        Row: {
          amount_paid: number
          created_at: string
          id: string
          prediction_id: string
          stripe_payment_id: string | null
          user_id: string
        }
        Insert: {
          amount_paid: number
          created_at?: string
          id?: string
          prediction_id: string
          stripe_payment_id?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          id?: string
          prediction_id?: string
          stripe_payment_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sports_purchased_tips_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "sports_predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_tipster_followers: {
        Row: {
          created_at: string
          id: string
          notifications_enabled: boolean | null
          tipster_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notifications_enabled?: boolean | null
          tipster_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notifications_enabled?: boolean | null
          tipster_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sports_tipster_followers_tipster_id_fkey"
            columns: ["tipster_id"]
            isOneToOne: false
            referencedRelation: "sports_tipsters"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_tipster_subscriptions: {
        Row: {
          amount_paid: number
          created_at: string
          expires_at: string
          id: string
          started_at: string
          status: string
          stripe_subscription_id: string | null
          tipster_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid: number
          created_at?: string
          expires_at: string
          id?: string
          started_at?: string
          status?: string
          stripe_subscription_id?: string | null
          tipster_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          expires_at?: string
          id?: string
          started_at?: string
          status?: string
          stripe_subscription_id?: string | null
          tipster_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sports_tipster_subscriptions_tipster_id_fkey"
            columns: ["tipster_id"]
            isOneToOne: false
            referencedRelation: "sports_tipsters"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_tipsters: {
        Row: {
          avatar_url: string | null
          badge: string | null
          bio: string | null
          correct_predictions: number | null
          created_at: string
          display_name: string
          followers_count: number | null
          id: string
          pending_payout: number | null
          roi: number | null
          sport_specialization: string
          status: string
          subscription_price: number | null
          tip_price: number | null
          total_earnings: number | null
          total_predictions: number | null
          updated_at: string
          user_id: string
          win_rate: number | null
        }
        Insert: {
          avatar_url?: string | null
          badge?: string | null
          bio?: string | null
          correct_predictions?: number | null
          created_at?: string
          display_name: string
          followers_count?: number | null
          id?: string
          pending_payout?: number | null
          roi?: number | null
          sport_specialization: string
          status?: string
          subscription_price?: number | null
          tip_price?: number | null
          total_earnings?: number | null
          total_predictions?: number | null
          updated_at?: string
          user_id: string
          win_rate?: number | null
        }
        Update: {
          avatar_url?: string | null
          badge?: string | null
          bio?: string | null
          correct_predictions?: number | null
          created_at?: string
          display_name?: string
          followers_count?: number | null
          id?: string
          pending_payout?: number | null
          roi?: number | null
          sport_specialization?: string
          status?: string
          subscription_price?: number | null
          tip_price?: number | null
          total_earnings?: number | null
          total_predictions?: number | null
          updated_at?: string
          user_id?: string
          win_rate?: number | null
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
      student_campaigns: {
        Row: {
          created_at: string | null
          current_amount: number | null
          description: string
          ends_at: string | null
          field_of_study: string | null
          id: string
          image_url: string | null
          pay_it_forward: boolean | null
          school_name: string | null
          status: string | null
          story: string
          support_type: string
          supporters_count: number | null
          target_amount: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_amount?: number | null
          description: string
          ends_at?: string | null
          field_of_study?: string | null
          id?: string
          image_url?: string | null
          pay_it_forward?: boolean | null
          school_name?: string | null
          status?: string | null
          story: string
          support_type: string
          supporters_count?: number | null
          target_amount: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_amount?: number | null
          description?: string
          ends_at?: string | null
          field_of_study?: string | null
          id?: string
          image_url?: string | null
          pay_it_forward?: boolean | null
          school_name?: string | null
          status?: string | null
          story?: string
          support_type?: string
          supporters_count?: number | null
          target_amount?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      talent_campaigns: {
        Row: {
          achievements: string[] | null
          created_at: string | null
          current_amount: number | null
          description: string
          ends_at: string | null
          goals: string[] | null
          id: string
          images: string[] | null
          portfolio_url: string | null
          premium_subscriber: boolean | null
          sponsors: Json | null
          sponsors_count: number | null
          status: string | null
          story: string
          talent_type: string
          target_amount: number
          title: string
          updated_at: string | null
          user_id: string
          video_url: string | null
        }
        Insert: {
          achievements?: string[] | null
          created_at?: string | null
          current_amount?: number | null
          description: string
          ends_at?: string | null
          goals?: string[] | null
          id?: string
          images?: string[] | null
          portfolio_url?: string | null
          premium_subscriber?: boolean | null
          sponsors?: Json | null
          sponsors_count?: number | null
          status?: string | null
          story: string
          talent_type: string
          target_amount: number
          title: string
          updated_at?: string | null
          user_id: string
          video_url?: string | null
        }
        Update: {
          achievements?: string[] | null
          created_at?: string | null
          current_amount?: number | null
          description?: string
          ends_at?: string | null
          goals?: string[] | null
          id?: string
          images?: string[] | null
          portfolio_url?: string | null
          premium_subscriber?: boolean | null
          sponsors?: Json | null
          sponsors_count?: number | null
          status?: string | null
          story?: string
          talent_type?: string
          target_amount?: number
          title?: string
          updated_at?: string | null
          user_id?: string
          video_url?: string | null
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
      teacher_collections: {
        Row: {
          created_at: string
          description: string | null
          downloads: number | null
          id: string
          name: string
          page_count: number | null
          school_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          downloads?: number | null
          id?: string
          name: string
          page_count?: number | null
          school_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          downloads?: number | null
          id?: string
          name?: string
          page_count?: number | null
          school_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_collections_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_coloring_pages: {
        Row: {
          collection_id: string
          created_at: string
          created_by: string
          id: string
          image_url: string
          title: string
          updated_at: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          created_by: string
          id?: string
          image_url: string
          title: string
          updated_at?: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          created_by?: string
          id?: string
          image_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_coloring_pages_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "teacher_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      time_capsule_files: {
        Row: {
          capsule_id: string
          created_at: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
        }
        Insert: {
          capsule_id: string
          created_at?: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
        }
        Update: {
          capsule_id?: string
          created_at?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_capsule_files_capsule_id_fkey"
            columns: ["capsule_id"]
            isOneToOne: false
            referencedRelation: "time_capsules"
            referencedColumns: ["id"]
          },
        ]
      }
      time_capsule_subscriptions: {
        Row: {
          capsules_created: number | null
          created_at: string
          current_period_end: string | null
          id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          capsules_created?: number | null
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          capsules_created?: number | null
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      time_capsules: {
        Row: {
          capsule_type: string
          created_at: string
          delivery_date: string
          duration_years: number
          id: string
          is_delivered: boolean | null
          is_opened: boolean | null
          message: string | null
          opened_at: string | null
          payment_status: string | null
          price_paid: number | null
          recipient_email: string | null
          recipient_name: string | null
          stripe_payment_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capsule_type: string
          created_at?: string
          delivery_date: string
          duration_years: number
          id?: string
          is_delivered?: boolean | null
          is_opened?: boolean | null
          message?: string | null
          opened_at?: string | null
          payment_status?: string | null
          price_paid?: number | null
          recipient_email?: string | null
          recipient_name?: string | null
          stripe_payment_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capsule_type?: string
          created_at?: string
          delivery_date?: string
          duration_years?: number
          id?: string
          is_delivered?: boolean | null
          is_opened?: boolean | null
          message?: string | null
          opened_at?: string | null
          payment_status?: string | null
          price_paid?: number | null
          recipient_email?: string | null
          recipient_name?: string | null
          stripe_payment_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      time_reversal_followers: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      time_reversal_likes: {
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
            foreignKeyName: "time_reversal_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "time_reversal_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      time_reversal_posts: {
        Row: {
          age_at_post: number
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          is_paradox: boolean | null
          likes_count: number | null
          paradox_age: number | null
          user_id: string
        }
        Insert: {
          age_at_post: number
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_paradox?: boolean | null
          likes_count?: number | null
          paradox_age?: number | null
          user_id: string
        }
        Update: {
          age_at_post?: number
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_paradox?: boolean | null
          likes_count?: number | null
          paradox_age?: number | null
          user_id?: string
        }
        Relationships: []
      }
      time_reversal_profiles: {
        Row: {
          age_locks: Json | null
          aging_speed: number | null
          bio: string | null
          created_at: string | null
          current_age: number | null
          follower_count: number | null
          id: string
          last_age_update: string | null
          profile_image_url: string | null
          starting_age: number | null
          target_age: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age_locks?: Json | null
          aging_speed?: number | null
          bio?: string | null
          created_at?: string | null
          current_age?: number | null
          follower_count?: number | null
          id?: string
          last_age_update?: string | null
          profile_image_url?: string | null
          starting_age?: number | null
          target_age?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age_locks?: Json | null
          aging_speed?: number | null
          bio?: string | null
          created_at?: string | null
          current_age?: number | null
          follower_count?: number | null
          id?: string
          last_age_update?: string | null
          profile_image_url?: string | null
          starting_age?: number | null
          target_age?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tournament_participants: {
        Row: {
          character_id: string
          created_at: string
          eliminated: boolean
          id: string
          placement: number | null
          tournament_id: string
          user_id: string
        }
        Insert: {
          character_id: string
          created_at?: string
          eliminated?: boolean
          id?: string
          placement?: number | null
          tournament_id: string
          user_id: string
        }
        Update: {
          character_id?: string
          created_at?: string
          eliminated?: boolean
          id?: string
          placement?: number | null
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          current_round: number
          description: string | null
          ends_at: string | null
          entry_fee: number
          id: string
          max_participants: number
          name: string
          prize_pool: number
          starts_at: string
          status: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          current_round?: number
          description?: string | null
          ends_at?: string | null
          entry_fee?: number
          id?: string
          max_participants?: number
          name: string
          prize_pool?: number
          starts_at: string
          status?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          current_round?: number
          description?: string | null
          ends_at?: string | null
          entry_fee?: number
          id?: string
          max_participants?: number
          name?: string
          prize_pool?: number
          starts_at?: string
          status?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
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
      universe_questions: {
        Row: {
          answer: string
          created_at: string
          credits_used: number
          explanation: string | null
          id: string
          question: string
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          credits_used?: number
          explanation?: string | null
          id?: string
          question: string
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          credits_used?: number
          explanation?: string | null
          id?: string
          question?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
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
      user_castle_certificates: {
        Row: {
          castle_id: string
          completed_at: string
          completion_time_ms: number
          created_at: string
          id: string
          total_rooms: number
          unlocked_milestones: number[]
          user_id: string
        }
        Insert: {
          castle_id: string
          completed_at?: string
          completion_time_ms: number
          created_at?: string
          id?: string
          total_rooms: number
          unlocked_milestones?: number[]
          user_id: string
        }
        Update: {
          castle_id?: string
          completed_at?: string
          completion_time_ms?: number
          created_at?: string
          id?: string
          total_rooms?: number
          unlocked_milestones?: number[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_castle_certificates_castle_id_fkey"
            columns: ["castle_id"]
            isOneToOne: false
            referencedRelation: "disney_castles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_castle_stamps: {
        Row: {
          castle_id: string | null
          earned_at: string | null
          id: string
          stamp_url: string | null
          user_id: string
        }
        Insert: {
          castle_id?: string | null
          earned_at?: string | null
          id?: string
          stamp_url?: string | null
          user_id: string
        }
        Update: {
          castle_id?: string | null
          earned_at?: string | null
          id?: string
          stamp_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_castle_stamps_castle_id_fkey"
            columns: ["castle_id"]
            isOneToOne: false
            referencedRelation: "disney_castles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_castle_visits: {
        Row: {
          castle_id: string | null
          completed: boolean | null
          id: string
          rooms_visited: string[] | null
          user_id: string
          visited_at: string | null
        }
        Insert: {
          castle_id?: string | null
          completed?: boolean | null
          id?: string
          rooms_visited?: string[] | null
          user_id: string
          visited_at?: string | null
        }
        Update: {
          castle_id?: string | null
          completed?: boolean | null
          id?: string
          rooms_visited?: string[] | null
          user_id?: string
          visited_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_castle_visits_castle_id_fkey"
            columns: ["castle_id"]
            isOneToOne: false
            referencedRelation: "disney_castles"
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
      user_coffee_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_coffee_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "coffee_achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_collectibles: {
        Row: {
          acquired_at: string
          acquired_method: string
          collectible_id: string | null
          collectible_type: string | null
          created_at: string
          id: string
          is_evolved: boolean | null
          is_for_sale: boolean | null
          is_for_trade: boolean | null
          is_tradeable: boolean | null
          properties: Json | null
          unique_properties: Json | null
          user_id: string
        }
        Insert: {
          acquired_at?: string
          acquired_method: string
          collectible_id?: string | null
          collectible_type?: string | null
          created_at?: string
          id?: string
          is_evolved?: boolean | null
          is_for_sale?: boolean | null
          is_for_trade?: boolean | null
          is_tradeable?: boolean | null
          properties?: Json | null
          unique_properties?: Json | null
          user_id: string
        }
        Update: {
          acquired_at?: string
          acquired_method?: string
          collectible_id?: string | null
          collectible_type?: string | null
          created_at?: string
          id?: string
          is_evolved?: boolean | null
          is_for_sale?: boolean | null
          is_for_trade?: boolean | null
          is_tradeable?: boolean | null
          properties?: Json | null
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
      user_currencies: {
        Row: {
          coins: number
          created_at: string
          gems: number
          id: string
          total_gems_purchased: number
          updated_at: string
          user_id: string
        }
        Insert: {
          coins?: number
          created_at?: string
          gems?: number
          id?: string
          total_gems_purchased?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          coins?: number
          created_at?: string
          gems?: number
          id?: string
          total_gems_purchased?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_inventory: {
        Row: {
          acquired_at: string
          horse_id: string | null
          id: string
          is_equipped: boolean
          item_id: string
          user_id: string
        }
        Insert: {
          acquired_at?: string
          horse_id?: string | null
          id?: string
          is_equipped?: boolean
          item_id: string
          user_id: string
        }
        Update: {
          acquired_at?: string
          horse_id?: string | null
          id?: string
          is_equipped?: boolean
          item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_inventory_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_inventory_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "cosmetic_items"
            referencedColumns: ["id"]
          },
        ]
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
      user_paint_progress: {
        Row: {
          completed_at: string | null
          completed_sections: number[] | null
          id: string
          is_completed: boolean | null
          paint_id: string
          started_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_sections?: number[] | null
          id?: string
          is_completed?: boolean | null
          paint_id: string
          started_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_sections?: number[] | null
          id?: string
          is_completed?: boolean | null
          paint_id?: string
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_paint_progress_paint_id_fkey"
            columns: ["paint_id"]
            isOneToOne: false
            referencedRelation: "paint_by_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_paint_purchases: {
        Row: {
          id: string
          paint_id: string
          purchased_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          paint_id: string
          purchased_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          paint_id?: string
          purchased_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_paint_purchases_paint_id_fkey"
            columns: ["paint_id"]
            isOneToOne: false
            referencedRelation: "paint_by_numbers"
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
      user_quest_progress: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          level: number | null
          premium_items: Json | null
          total_xp: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          level?: number | null
          premium_items?: Json | null
          total_xp?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          level?: number | null
          premium_items?: Json | null
          total_xp?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_subscriptions: {
        Row: {
          created_at: string | null
          generations_limit: number | null
          generations_used: number | null
          id: string
          stripe_customer_id: string | null
          stripe_product_id: string | null
          subscription_end: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          generations_limit?: number | null
          generations_used?: number | null
          id?: string
          stripe_customer_id?: string | null
          stripe_product_id?: string | null
          subscription_end?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          generations_limit?: number | null
          generations_used?: number | null
          id?: string
          stripe_customer_id?: string | null
          stripe_product_id?: string | null
          subscription_end?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      video_ad_credits: {
        Row: {
          created_at: string
          credits_remaining: number
          id: string
          subscription_end_date: string | null
          tier: string
          total_credits_purchased: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_remaining?: number
          id?: string
          subscription_end_date?: string | null
          tier?: string
          total_credits_purchased?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_remaining?: number
          id?: string
          subscription_end_date?: string | null
          tier?: string
          total_credits_purchased?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_ad_history: {
        Row: {
          created_at: string
          credits_used: number
          duration: number
          features_used: Json
          id: string
          platform: string
          product_service: string
          result: Json | null
          target_audience: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_used: number
          duration: number
          features_used?: Json
          id?: string
          platform: string
          product_service: string
          result?: Json | null
          target_audience: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          duration?: number
          features_used?: Json
          id?: string
          platform?: string
          product_service?: string
          result?: Json | null
          target_audience?: string
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
      vip_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      virtual_gifts: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number
          stripe_price_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price: number
          stripe_price_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      virtual_influencers: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          description: string | null
          engagement_rate: number | null
          followers: number | null
          id: string
          name: string
          niche: string | null
          personality: string | null
          status: string | null
          total_earnings: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          engagement_rate?: number | null
          followers?: number | null
          id?: string
          name: string
          niche?: string | null
          personality?: string | null
          status?: string | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          engagement_rate?: number | null
          followers?: number | null
          id?: string
          name?: string
          niche?: string | null
          personality?: string | null
          status?: string | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id?: string
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
      vision_analyses: {
        Row: {
          analysis_type: string
          category: string
          collection_id: string | null
          confidence_score: number | null
          created_at: string
          credits_used: number
          detailed_info: Json | null
          id: string
          image_url: string
          is_favorite: boolean | null
          main_identification: string
          tags: string[] | null
          user_id: string
        }
        Insert: {
          analysis_type: string
          category: string
          collection_id?: string | null
          confidence_score?: number | null
          created_at?: string
          credits_used?: number
          detailed_info?: Json | null
          id?: string
          image_url: string
          is_favorite?: boolean | null
          main_identification: string
          tags?: string[] | null
          user_id: string
        }
        Update: {
          analysis_type?: string
          category?: string
          collection_id?: string | null
          confidence_score?: number | null
          created_at?: string
          credits_used?: number
          detailed_info?: Json | null
          id?: string
          image_url?: string
          is_favorite?: boolean | null
          main_identification?: string
          tags?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_collection"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "analyzer_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_clones: {
        Row: {
          created_at: string
          description: string | null
          elevenlabs_voice_id: string | null
          id: string
          name: string
          payment_status: string | null
          relationship: string | null
          sample_audio_urls: string[] | null
          status: string | null
          stripe_payment_id: string | null
          updated_at: string
          user_id: string
          voice_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          elevenlabs_voice_id?: string | null
          id?: string
          name: string
          payment_status?: string | null
          relationship?: string | null
          sample_audio_urls?: string[] | null
          status?: string | null
          stripe_payment_id?: string | null
          updated_at?: string
          user_id: string
          voice_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          elevenlabs_voice_id?: string | null
          id?: string
          name?: string
          payment_status?: string | null
          relationship?: string | null
          sample_audio_urls?: string[] | null
          status?: string | null
          stripe_payment_id?: string | null
          updated_at?: string
          user_id?: string
          voice_id?: string | null
        }
        Relationships: []
      }
      voice_conversation_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          unlimited_generations: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          unlimited_generations?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          unlimited_generations?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_generations: {
        Row: {
          audio_url: string | null
          created_at: string
          id: string
          payment_status: string | null
          status: string | null
          stripe_payment_id: string | null
          text_content: string
          user_id: string
          voice_clone_id: string
          word_count: number
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          id?: string
          payment_status?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          text_content: string
          user_id: string
          voice_clone_id: string
          word_count: number
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          id?: string
          payment_status?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          text_content?: string
          user_id?: string
          voice_clone_id?: string
          word_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "voice_generations_voice_clone_id_fkey"
            columns: ["voice_clone_id"]
            isOneToOne: false
            referencedRelation: "voice_clones"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_library_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
          voices_limit: number | null
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
          voices_limit?: number | null
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
          voices_limit?: number | null
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
      wine_pairings: {
        Row: {
          created_at: string
          credits_used: number
          dish_name: string
          id: string
          pairing_suggestions: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_used?: number
          dish_name: string
          id?: string
          pairing_suggestions: Json
          user_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          dish_name?: string
          id?: string
          pairing_suggestions?: Json
          user_id?: string
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          created_at: string
          description: string | null
          duration_weeks: number
          id: string
          is_premium: boolean | null
          matched_meal_plan_id: string | null
          title: string
          updated_at: string
          user_id: string
          workout_data: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_weeks: number
          id?: string
          is_premium?: boolean | null
          matched_meal_plan_id?: string | null
          title: string
          updated_at?: string
          user_id: string
          workout_data: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_weeks?: number
          id?: string
          is_premium?: boolean | null
          matched_meal_plan_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          workout_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "workout_plans_matched_meal_plan_id_fkey"
            columns: ["matched_meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
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
      create_notification: {
        Args: {
          p_actor_id: string
          p_comment_id?: string
          p_post_id?: string
          p_repost_id?: string
          p_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      expire_featured_listings: { Args: never; Returns: undefined }
      find_skill_matches: { Args: { p_user_id: string }; Returns: undefined }
      generate_certificate_number: { Args: never; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_collection_pages: {
        Args: { p_collection_id: string }
        Returns: undefined
      }
      is_conversation_participant: {
        Args: { conversation_id: string; user_id: string }
        Returns: boolean
      }
      is_vip_user: { Args: { user_id_param: string }; Returns: boolean }
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
