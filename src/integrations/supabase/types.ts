export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string;
          created_at: string;
          full_name: string;
          id: string;
          is_default: boolean;
          label: string | null;
          line1: string;
          line2: string | null;
          phone: string;
          pincode: string;
          state: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          city: string;
          created_at?: string;
          full_name: string;
          id?: string;
          is_default?: boolean;
          label?: string | null;
          line1: string;
          line2?: string | null;
          phone: string;
          pincode: string;
          state: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          city?: string;
          created_at?: string;
          full_name?: string;
          id?: string;
          is_default?: boolean;
          label?: string | null;
          line1?: string;
          line2?: string | null;
          phone?: string;
          pincode?: string;
          state?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          order_id: string;
          product_id: string | null;
          product_image: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_image?: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_image?: string | null;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          created_at: string;
          id: string;
          notes: string | null;
          order_number: string;
          payment_method: string;
          payment_status: string;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          shipping_city: string;
          shipping_full_name: string;
          shipping_line1: string;
          shipping_line2: string | null;
          shipping_phone: string;
          shipping_pincode: string;
          shipping_state: string;
          status: string;
          total_amount: number;
          updated_at: string;
          user_id: string;
          coupon_code: string | null;
          coupon_id: string | null;
          coupon_type: string | null;
          coupon_value: number | null;
          discount_amount: number | null;
          discount_percentage: number | null;
          original_amount: number | null;
          shipping_amount: number | null;
          tax_amount: number | null;
          final_amount: number | null;
          customer_email: string | null;
          customer_email_sent: boolean | null;
          customer_email_sent_at: string | null;
          admin_email_sent: boolean | null;
          admin_email_sent_at: string | null;
          email_error: string | null;
          payment_verified_at: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          order_number?: string;
          payment_method?: string;
          payment_status?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          shipping_city: string;
          shipping_full_name: string;
          shipping_line1: string;
          shipping_line2?: string | null;
          shipping_phone: string;
          shipping_pincode: string;
          shipping_state: string;
          status?: string;
          total_amount: number;
          updated_at?: string;
          user_id: string;
          coupon_code?: string | null;
          coupon_id?: string | null;
          coupon_type?: string | null;
          coupon_value?: number | null;
          discount_amount?: number | null;
          discount_percentage?: number | null;
          original_amount?: number | null;
          shipping_amount?: number | null;
          tax_amount?: number | null;
          final_amount?: number | null;
          customer_email_sent?: boolean | null;
          customer_email_sent_at?: string | null;
          customer_email?: string | null;
          admin_email_sent?: boolean | null;
          admin_email_sent_at?: string | null;
          email_error?: string | null;
          payment_verified_at?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          order_number?: string;
          payment_method?: string;
          payment_status?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          shipping_city?: string;
          shipping_full_name?: string;
          shipping_line1?: string;
          shipping_line2?: string | null;
          shipping_phone?: string;
          shipping_pincode?: string;
          shipping_state?: string;
          status?: string;
          total_amount?: number;
          updated_at?: string;
          user_id?: string;
          coupon_code?: string | null;
          coupon_id?: string | null;
          coupon_type?: string | null;
          coupon_value?: number | null;
          discount_amount?: number | null;
          discount_percentage?: number | null;
          original_amount?: number | null;
          shipping_amount?: number | null;
          tax_amount?: number | null;
          final_amount?: number | null;
          customer_email_sent?: boolean | null;
          customer_email_sent_at?: string | null;
          admin_email_sent?: boolean | null;
          admin_email_sent_at?: string | null;
          customer_email?: string | null;
          email_error?: string | null;
          payment_verified_at?: string | null;
        };
        Relationships: [];
      };
      product_reviews: {
        Row: {
          comment: string;
          created_at: string;
          id: string;
          product_id: string;
          rating: number;
          title: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          comment: string;
          created_at?: string;
          id?: string;
          product_id: string;
          rating: number;
          title?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          comment?: string;
          created_at?: string;
          id?: string;
          product_id?: string;
          rating?: number;
          title?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          in_stock: boolean;
          name: string;
          original_price: number | null;
          price: number;
          seo_description: string | null;
          slug: string;
          sort_order: number;
          subtitle_en: string | null;
          subtitle_mr: string | null;
          updated_at: string;
          variants: Json;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          in_stock?: boolean;
          name: string;
          original_price?: number | null;
          price?: number;
          seo_description?: string | null;
          slug: string;
          sort_order?: number;
          subtitle_en?: string | null;
          subtitle_mr?: string | null;
          updated_at?: string;
          variants?: Json;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          in_stock?: boolean;
          name?: string;
          original_price?: number | null;
          price?: number;
          seo_description?: string | null;
          slug?: string;
          sort_order?: number;
          subtitle_en?: string | null;
          subtitle_mr?: string | null;
          updated_at?: string;
          variants?: Json;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          theme_preference: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          theme_preference?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          theme_preference?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      wishlist: {
        Row: {
          created_at: string;
          id: string;
          product_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          product_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          product_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          discount_type: string;
          discount_value: number;
          minimum_order: number | null;
          maximum_discount: number | null;
          final_price: number | null;
          free_shipping: boolean | null;
          is_active: boolean | null;
          usage_limit: number | null;
          usage_count: number | null;
          valid_from: string | null;
          valid_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          discount_type: string;
          discount_value: number;
          minimum_order?: number | null;
          maximum_discount?: number | null;
          final_price?: number | null;
          free_shipping?: boolean | null;
          is_active?: boolean | null;
          usage_limit?: number | null;
          usage_count?: number | null;
          valid_from?: string | null;
          valid_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          discount_type?: string;
          discount_value?: number;
          minimum_order?: number | null;
          maximum_discount?: number | null;
          final_price?: number | null;
          free_shipping?: boolean | null;
          is_active?: boolean | null;
          usage_limit?: number | null;
          usage_count?: number | null;
          valid_from?: string | null;
          valid_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      razorpay_webhook_logs: {
        Row: {
          id: string;
          event_id: string | null;
          event_type: string;
          received_at: string;
          processed_at: string | null;
          status: string;
          error_message: string | null;
          payload_hash: string | null;
          order_id: string | null;
          payment_id: string | null;
          processing_time_ms: number | null;
        };
        Insert: {
          id?: string;
          event_id?: string | null;
          event_type: string;
          received_at?: string;
          processed_at?: string | null;
          status: string;
          error_message?: string | null;
          payload_hash?: string | null;
          order_id?: string | null;
          payment_id?: string | null;
          processing_time_ms?: number | null;
        };
        Update: {
          id?: string;
          event_id?: string | null;
          event_type?: string;
          received_at?: string;
          processed_at?: string | null;
          status?: string;
          error_message?: string | null;
          payload_hash?: string | null;
          order_id?: string | null;
          payment_id?: string | null;
          processing_time_ms?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "razorpay_webhook_logs_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
