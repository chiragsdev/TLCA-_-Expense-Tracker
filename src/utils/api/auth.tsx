// Authentication API utilities for MySQL backend

const API_BASE_URL = 'https://tlca-expense-tracker-yasz.onrender.com/api/';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'department_manager';
  department?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'department_manager';
  department: string | null;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: UserProfile;
  message?: string;
}

export interface VerifyResponse {
  success: boolean;
  user?: UserProfile;
  message?: string;
}

// Login user
export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    console.log('Login response:', result);
    
    // Handle the response format from PHP backend
    if (result.success && result.data) {
      const { token, user } = result.data;
      if (token) {
        // Store token in localStorage
        localStorage.setItem('auth_token', token);
      }
      return {
        success: true,
        token,
        user,
        message: result.message
      };
    }
    
    return {
      success: false,
      message: result.error || result.message || 'Login failed'
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Network error during login' };
  }
}

// Signup new user
export async function signup(userData: SignupRequest): Promise<LoginResponse> {
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}/auth/signup.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();
    console.log('Signup response:', result);
    
    // Handle the response format from PHP backend
    if (result.success && result.data) {
      return {
        success: true,
        user: result.data.user,
        message: result.message
      };
    }
    
    return {
      success: false,
      message: result.error || result.message || 'Signup failed'
    };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, message: 'Network error during signup' };
  }
}

// Verify current session
export async function verifySession(): Promise<VerifyResponse> {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      return { success: false, message: 'No token found' };
    }

    const response = await fetch(`${API_BASE_URL}/auth/verify.php`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    console.log('Verify response:', result);
    
    // Handle the response format from PHP backend
    if (result.success && result.data) {
      return {
        success: true,
        user: result.data.user,
        message: result.message
      };
    }
    
    return {
      success: false,
      message: result.error || result.message || 'Session verification failed'
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return { success: false, message: 'Network error during session verification' };
  }
}

// Logout user
export async function logout(): Promise<void> {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
    
    // Clear token from localStorage
    localStorage.removeItem('auth_token');
  } catch (error) {
    console.error('Logout error:', error);
    // Clear token anyway
    localStorage.removeItem('auth_token');
  }
}

// Get auth token
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('auth_token');
}
