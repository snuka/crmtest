// User interface definition
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'sales_rep';
  created_at: string | Date;
  updated_at: string | Date;
  password?: string; // Used only for creating/updating a user, not stored in this form
  password_hash?: string; // Hashed password stored in database
}

// User registration payload
export interface UserRegistration {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'sales_rep';
}

// User login payload
export interface UserLogin {
  email: string;
  password: string;
}

// Auth response with token
export interface AuthResponse {
  user: User | null;
  token: string | null;
  error: any;
}

// User update payload
export type UserUpdate = Partial<Omit<User, 'id' | 'created_at'>> & { password_hash?: string }; 