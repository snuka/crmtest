import dotenv from 'dotenv';
import { createCustomer, getAllCustomers, getCustomerById, updateCustomer, deleteCustomer } from './services/customerService';
import { CustomerCreate } from './models/customer';

// Load environment variables
dotenv.config();

// Test CRUD operations
async function testCRUD() {
  try {
    console.log('Starting CRUD test...');
    
    // Create a customer
    const newCustomer: CustomerCreate = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`, // Ensure unique email
      phone: '+1234567890',
      company: 'Test Company',
      status: 'active'
    };
    
    console.log('Creating customer:', newCustomer);
    const createResult = await createCustomer(newCustomer);
    
    if (createResult.error) {
      console.error('Error creating customer:', createResult.error);
      return;
    }
    
    const customerId = createResult.data?.id;
    console.log('Customer created with ID:', customerId);
    
    // Get all customers
    console.log('\nGetting all customers:');
    const getAllResult = await getAllCustomers();
    if (getAllResult.error) {
      console.error('Error getting customers:', getAllResult.error);
    } else {
      console.log(`Found ${getAllResult.data?.length} customers`);
    }
    
    // Get customer by ID
    if (customerId) {
      console.log('\nGetting customer by ID:', customerId);
      const getByIdResult = await getCustomerById(customerId);
      if (getByIdResult.error) {
        console.error('Error getting customer by ID:', getByIdResult.error);
      } else {
        console.log('Retrieved customer:', getByIdResult.data);
      }
      
      // Update customer
      console.log('\nUpdating customer');
      const updateResult = await updateCustomer(customerId, { 
        company: 'Updated Company',
        status: 'lead'
      });
      
      if (updateResult.error) {
        console.error('Error updating customer:', updateResult.error);
      } else {
        console.log('Updated customer:', updateResult.data);
      }
      
      // Delete customer
      console.log('\nDeleting customer');
      const deleteResult = await deleteCustomer(customerId);
      
      if (deleteResult.error) {
        console.error('Error deleting customer:', deleteResult.error);
      } else {
        console.log('Customer deleted successfully');
      }
    }
    
    console.log('\nCRUD test completed');
    
  } catch (error) {
    console.error('Error during CRUD test:', error);
  }
}

// Run the test
testCRUD(); 