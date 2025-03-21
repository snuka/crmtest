import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customersAPI } from '../services/api';

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'lead';
}

interface CustomerResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'lead';
  document_url?: string;
  created_at: string;
}

const CustomerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'active',
  });
  
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [existingDocument, setExistingDocument] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If in edit mode, fetch the customer data
    if (isEditMode) {
      const fetchCustomer = async () => {
        try {
          setLoading(true);
          const { customer } = await customersAPI.getById(id!);
          if (customer) {
            setFormData({
              name: customer.name,
              email: customer.email,
              phone: customer.phone || '',
              company: customer.company || '',
              status: customer.status,
            });
            
            if (customer.document_url) {
              setExistingDocument(customer.document_url);
            }
          }
        } catch (err: any) {
          setError(err.response?.data?.error || 'Failed to load customer');
        } finally {
          setLoading(false);
        }
      };

      fetchCustomer();
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError('');
      
      if (isEditMode) {
        if (documentFile) {
          await customersAPI.updateWithDocument(id!, formData, documentFile);
        } else {
          await customersAPI.update(id!, formData);
        }
      } else {
        if (documentFile) {
          await customersAPI.createWithDocument(formData, documentFile);
        } else {
          await customersAPI.create(formData);
        }
      }
      
      navigate('/customers');
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} customer`);
      console.error('Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">{isEditMode ? 'Edit Customer' : 'Add New Customer'}</h4>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">
                    Phone
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="company" className="form-label">
                    Company
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="status" className="form-label">
                    Status *
                  </label>
                  <select
                    className="form-select"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="lead">Lead</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="document" className="form-label">
                    Document
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="document"
                    name="document"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                  />
                  <div className="form-text">
                    Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX, CSV
                  </div>
                  
                  {existingDocument && !documentFile && (
                    <div className="mt-2">
                      <p className="mb-1">Current document:</p>
                      <div className="d-flex align-items-center">
                        <a href={existingDocument} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary me-2">
                          View Document
                        </a>
                        <span className="text-muted small">
                          (Select a new file to replace the current document)
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {documentFile && (
                    <div className="mt-2">
                      <p className="mb-1">Selected file:</p>
                      <div className="d-flex align-items-center">
                        <span className="me-2">{documentFile.name}</span>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            setDocumentFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/customers')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      isEditMode ? 'Update Customer' : 'Create Customer'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm; 