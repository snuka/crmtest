// Customer type definition
export interface Customer {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'active' | 'inactive' | 'lead';
  document_url?: string;
  created_at?: string;
}

// Customer creation payload
export type CustomerCreate = Omit<Customer, 'id' | 'created_at'>;

// Customer update payload
export type CustomerUpdate = Partial<CustomerCreate>; 