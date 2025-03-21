import { supabase } from '../database';
import { Customer, CustomerCreate, CustomerUpdate } from '../models/customer';

// Table name
const TABLE_NAME = 'customers';

// Create a new customer
export const createCustomer = async (customer: CustomerCreate): Promise<{ data: Customer | null; error: any }> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(customer)
    .select()
    .single();
  
  return { data, error };
};

// Get all customers
export const getAllCustomers = async (): Promise<{ data: Customer[] | null; error: any }> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*');
  
  return { data, error };
};

// Get customer by ID
export const getCustomerById = async (id: string): Promise<{ data: Customer | null; error: any }> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};

// Update customer
export const updateCustomer = async (id: string, updates: CustomerUpdate): Promise<{ data: Customer | null; error: any }> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Delete customer
export const deleteCustomer = async (id: string): Promise<{ data: any; error: any }> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);
  
  return { data, error };
}; 