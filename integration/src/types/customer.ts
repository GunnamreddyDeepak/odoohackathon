export interface Customer {
  id: number;
  customer_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  user_id: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CustomerUpdate = Partial<Pick<Customer, "full_name" | "phone" | "address">>;