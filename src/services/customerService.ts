import { supabase } from '../database';
import { Customer, CustomerCreate, CustomerUpdate } from '../models/customer';
import { uploadFile, deleteFile } from './storageService';

// Table name
const TABLE_NAME = 'customers';

// Create a new customer with document
export const createCustomerWithDocument = async (
  customer: CustomerCreate,
  fileBuffer?: Buffer,
  fileName?: string,
  contentType?: string
): Promise<{ data: Customer | null; error: any }> => {
  try {
    // Start a transaction
    let document_url = null;
    
    // If there's a file, upload it first
    if (fileBuffer && fileName && contentType) {
      const { url, error: uploadError } = await uploadFile(fileBuffer, fileName, contentType);
      
      if (uploadError) {
        console.error('File upload error in createCustomerWithDocument:', uploadError);
        // Continue without document - create customer anyway
        console.log('Will create customer without document due to upload error');
      } else {
        document_url = url;
      }
    }
    
    // Create the customer with document URL if available
    const customerData: CustomerCreate = {
      ...customer,
      ...(document_url && { document_url })
    };
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(customerData)
      .select()
      .single();
    
    if (error) {
      // If customer creation fails and we uploaded a file, delete the file
      if (document_url) {
        await deleteFile(document_url);
      }
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception in createCustomerWithDocument:', error);
    return { data: null, error };
  }
};

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

// Update customer with document
export const updateCustomerWithDocument = async (
  id: string,
  updates: CustomerUpdate,
  fileBuffer?: Buffer,
  fileName?: string,
  contentType?: string
): Promise<{ data: Customer | null; error: any }> => {
  try {
    // Get the current customer to check if they have an existing document
    const { data: existingCustomer, error: fetchError } = await getCustomerById(id);
    
    if (fetchError || !existingCustomer) {
      return { data: null, error: fetchError || { message: 'Customer not found' } };
    }
    
    let document_url = existingCustomer.document_url || undefined;
    
    // If there's a new file, upload it
    if (fileBuffer && fileName && contentType) {
      // Only attempt to delete old file if it exists
      if (document_url) {
        const { success, error: deleteError } = await deleteFile(document_url);
        if (!success) {
          console.error('Error deleting old document in updateCustomerWithDocument:', deleteError);
          // Continue anyway, we'll overwrite with new file
        }
      }
      
      // Upload new file
      const { url, error: uploadError } = await uploadFile(fileBuffer, fileName, contentType);
      
      if (uploadError) {
        console.error('File upload error in updateCustomerWithDocument:', uploadError);
        // Continue without updating document
        console.log('Will update customer without changing document due to upload error');
      } else {
        document_url = url || undefined;
      }
    }
    
    // Update the customer with document URL if available
    const customerUpdates: CustomerUpdate = {
      ...updates,
      ...(document_url && { document_url })
    };
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(customerUpdates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Exception in updateCustomerWithDocument:', error);
    return { data: null, error };
  }
};

// Delete customer
export const deleteCustomer = async (id: string): Promise<{ data: any; error: any }> => {
  try {
    // Get the customer to check if they have a document
    const { data: existingCustomer, error: fetchError } = await getCustomerById(id);
    
    if (fetchError || !existingCustomer) {
      return { data: null, error: fetchError || { message: 'Customer not found' } };
    }
    
    // Delete the document if it exists
    if (existingCustomer.document_url) {
      await deleteFile(existingCustomer.document_url);
    }
    
    // Delete the customer
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);
    
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}; 