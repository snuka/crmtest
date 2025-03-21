import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  return (
    <div className="container mt-5 text-center">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body py-5">
              <h1 className="text-danger mb-4">Access Denied</h1>
              <div className="mb-4">
                <i className="bi bi-shield-lock text-danger" style={{ fontSize: '5rem' }}></i>
              </div>
              <p className="lead">
                You don't have permission to access this page.
              </p>
              <p className="text-muted mb-4">
                Please contact an administrator if you believe you should have access to this resource.
              </p>
              <div className="mt-4">
                <Link to="/dashboard" className="btn btn-primary">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized; 