import { Router } from 'express';
import * as customerController from '../controllers/customerController';
import upload from '../middleware/upload';

const router = Router();

// Customer routes
router.post('/', upload.single('document'), customerController.createCustomer);
router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.put('/:id', upload.single('document'), customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

export default router; 