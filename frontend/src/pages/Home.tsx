import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 offset-md-2 text-center">
          <h1 className="display-4 mb-4">Welcome to Our CRM System</h1>
          <p className="lead mb-4">
            A simple yet powerful customer relationship management system to help you manage your business.
          </p>
          
          {isAuthenticated ? (
            <div className="mt-4">
              <Link to="/dashboard" className="btn btn-primary btn-lg me-3">
                Go to Dashboard
              </Link>
              <Link to="/customers" className="btn btn-outline-primary btn-lg">
                Manage Customers
              </Link>
            </div>
          ) : (
            <div className="mt-4">
              <Link to="/login" className="btn btn-primary btn-lg me-3">
                Login
              </Link>
              <Link to="/register" className="btn btn-outline-primary btn-lg">
                Register
              </Link>
            </div>
          )}
          
          <div className="row mt-5">
            <div className="col-md-4">
              <div className="card mb-4 shadow-sm">
                <div className="card-body">
                  <i className="bi bi-people fs-1 text-primary mb-3"></i>
                  <h3>Manage Contacts</h3>
                  <p>Keep track of all your customers in one place.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card mb-4 shadow-sm">
                <div className="card-body">
                  <i className="bi bi-graph-up fs-1 text-primary mb-3"></i>
                  <h3>Track Sales</h3>
                  <p>Monitor your sales pipeline and close more deals.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card mb-4 shadow-sm">
                <div className="card-body">
                  <i className="bi bi-check2-square fs-1 text-primary mb-3"></i>
                  <h3>Manage Tasks</h3>
                  <p>Never miss a follow-up with integrated task management.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 