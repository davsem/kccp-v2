export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface PitchSection {
  id: string;
  row: number;
  col: number;
  price: number;
  label: string;
  available: boolean;
}

export interface BillingAddress {
  name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postal_code: string;
  country: string;
}

export interface SectionOwnerConfig {
  section_id: string;
  owner_name: string;
  show_owner_name: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  stripe_payment_intent_id: string;
  amount_total: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  gift_aid: boolean;
  billing_name: string | null;
  billing_address_line1: string | null;
  billing_address_line2: string | null;
  billing_city: string | null;
  billing_postal_code: string | null;
  billing_country: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  section_id: string;
  price: number;
  owner_name: string | null;
  show_owner_name: boolean;
}

export interface PurchasedSection {
  section_id: string;
  order_id: string;
  user_id: string;
  owner_name: string | null;
  show_owner_name: boolean;
  purchased_at: string;
}
