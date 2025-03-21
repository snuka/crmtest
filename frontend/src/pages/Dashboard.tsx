import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { customersAPI } from '../services/api';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    leadCustomers: 0,
    inactiveCustomers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { customers } = await customersAPI.getAll();
        
        // Calculate stats
        if (customers && Array.isArray(customers)) {
          const totalCustomers = customers.length;
          const activeCustomers = customers.filter(c => c.status === 'active').length;
          const leadCustomers = customers.filter(c => c.status === 'lead').length;
          const inactiveCustomers = customers.filter(c => c.status === 'inactive').length;
          
          setStats({
            totalCustomers,
            activeCustomers,
            leadCustomers,
            inactiveCustomers
          });
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <div className="row mb-4">
        <div className="col">
          <h2>Welcome, {user?.first_name}!</h2>
          <p className="text-muted">Here's an overview of your CRM data</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Total Customers</h5>
              <h1 className="display-4">{stats.totalCustomers}</h1>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Active Customers</h5>
              <h1 className="display-4">{stats.activeCustomers}</h1>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h5 className="card-title">Leads</h5>
              <h1 className="display-4">{stats.leadCustomers}</h1>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card bg-secondary text-white">
            <div className="card-body">
              <h5 className="card-title">Inactive</h5>
              <h1 className="display-4">{stats.inactiveCustomers}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2">
                <a href="/customers/new" className="btn btn-primary">
                  Add New Customer
                </a>
                <a href="/customers" className="btn btn-outline-primary">
                  View All Customers
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 