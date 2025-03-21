import { Request, Response } from 'express';
import * as customerService from '../services/customerService';
import { CustomerCreate, CustomerUpdate } from '../models/customer';

// Create a new customer
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const customerData: CustomerCreate = req.body;
    
    // Check if a file was uploaded
    if (req.file) {
      const { data, error } = await customerService.createCustomerWithDocument(
        customerData,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      
      if (error) {
        return res.status(400).json({ error: error.message || 'Error creating customer with document' });
      }
      
      return res.status(201).json(data);
    } else {
      // No file uploaded, proceed with regular customer creation
      const { data, error } = await customerService.createCustomer(customerData);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(201).json(data);
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Get all customers
export const getAllCustomers = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await customerService.getAllCustomers();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Get customer by ID
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await customerService.getCustomerById(id);
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Update customer
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: CustomerUpdate = req.body;
    
    // Check if a file was uploaded
    if (req.file) {
      const { data, error } = await customerService.updateCustomerWithDocument(
        id,
        updates,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      
      if (error) {
        return res.status(400).json({ error: error.message || 'Error updating customer with document' });
      }
      
      if (!data) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      return res.status(200).json(data);
    } else {
      // No file uploaded, proceed with regular customer update
      const { data, error } = await customerService.updateCustomer(id, updates);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      if (!data) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      return res.status(200).json(data);
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Delete customer
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await customerService.deleteCustomer(id);
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(204).send();
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}; 