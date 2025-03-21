import dotenv from 'dotenv';
import * as authService from './services/authService';
import * as adminService from './services/adminService';

// Load environment variables
dotenv.config();

// Test authentication functionality
async function testAuth() {
  try {
    console.log('Starting authentication tests...');
    
    // Test admin initialization
    console.log('\n1. Testing admin initialization...');
    const initResult = await adminService.initializeAdminUser(
      'test-admin@example.com',
      'TestAdmin123!',
      'Test',
      'Admin'
    );
    
    console.log('Admin initialization result:', initResult);
    
    // Test user registration
    console.log('\n2. Testing user registration...');
    const registerResult = await authService.registerUser(
      'test-user@example.com',
      'TestUser123!',
      'Test',
      'User',
      'sales_rep'
    );
    
    console.log('Registration result:', {
      success: !!registerResult.user,
      error: registerResult.error,
      userId: registerResult.user?.id
    });
    
    if (!registerResult.user) {
      console.log('User registration failed. Skipping login test.');
      return;
    }
    
    // Test user login
    console.log('\n3. Testing user login...');
    const loginResult = await authService.loginUser(
      'test-user@example.com',
      'TestUser123!'
    );
    
    console.log('Login result:', {
      success: !!loginResult.user,
      error: loginResult.error,
      tokenReceived: !!loginResult.token
    });
    
    if (!loginResult.user) {
      console.log('User login failed. Skipping the rest of the tests.');
      return;
    }
    
    // Test get user by ID
    console.log('\n4. Testing get user by ID...');
    const getUserResult = await authService.getUserById(loginResult.user.id);
    
    console.log('Get user result:', {
      success: !!getUserResult.user,
      error: getUserResult.error,
      user: getUserResult.user ? {
        id: getUserResult.user.id,
        email: getUserResult.user.email,
        name: `${getUserResult.user.first_name} ${getUserResult.user.last_name}`,
        role: getUserResult.user.role
      } : null
    });
    
    // Test password change
    console.log('\n5. Testing password change...');
    const passwordChangeResult = await authService.changePassword(
      loginResult.user.id,
      'TestUser123!',
      'NewPassword123!'
    );
    
    console.log('Password change result:', passwordChangeResult);
    
    // Test login with new password
    console.log('\n6. Testing login with new password...');
    const newLoginResult = await authService.loginUser(
      'test-user@example.com',
      'NewPassword123!'
    );
    
    console.log('New login result:', {
      success: !!newLoginResult.user,
      error: newLoginResult.error,
      tokenReceived: !!newLoginResult.token
    });
    
    // List all users (admin function)
    console.log('\n7. Testing get all users (admin function)...');
    const getAllUsersResult = await adminService.getAllUsers();
    
    console.log('Get all users result:', {
      success: !!getAllUsersResult.users,
      error: getAllUsersResult.error,
      userCount: getAllUsersResult.users?.length || 0
    });
    
    // Clean up: Delete test user
    console.log('\n8. Cleaning up: Deleting test user...');
    const deleteResult = await adminService.deleteUserById(loginResult.user.id);
    
    console.log('Delete user result:', deleteResult);
    
    console.log('\nAuthentication tests completed.');
  } catch (error) {
    console.error('Error during authentication tests:', error);
  }
}

// Run the test
testAuth(); 