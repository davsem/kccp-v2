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
