import axios from 'axios';

// In production, use relative URL for API calls (since the backend serves the frontend)
// In development, use the absolute URL with localhost
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api'
  : 'http://localhost:3000/api';

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication API
export const authAPI = {
  // Register a new user
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout
  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: any) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  // Change password
  changePassword: async (passwords: { currentPassword: string; newPassword: string }) => {
    const response = await api.post('/auth/change-password', passwords);
    return response.data;
  },
};

// Customers API
export const customersAPI = {
  // Get all customers
  getAll: async () => {
    const response = await api.get('/customers');
    return response.data;
  },

  // Get customer by ID
  getById: async (id: string) => {
    const response = await api.get(`/customers/${id}`);
    return { customer: response.data };
  },

  // Create customer
  create: async (customerData: any) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },

  // Update customer
  update: async (id: string, customerData: any) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },

  // Delete customer
  delete: async (id: string) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  // Get all users
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  // Create user
  createUser: async (userData: any) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, userData: any) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
};

export default api; 