// Users API utilities for MySQL backend

const API_BASE_URL = '/api';

export interface User {
  id?: string;
  email: string;
  name: string;
  role: 'admin' | 'department_manager';
  department?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Get all users (admin only)
export async function getUsers(): Promise<User[]> {
  try {
    const token = localStorage.getItem('auth_token');

    const response = await fetch(`${API_BASE_URL}/users/get.php`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (data.success) {
      return data.users || [];
    }
    
    console.error('Failed to get users:', data.message);
    return [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Update user (admin only)
export async function updateUser(id: string, updates: Partial<User>): Promise<{ success: boolean; message?: string }> {
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}/users/update.php`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id, ...updates }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, message: 'Network error while updating user' };
  }
}

// Delete user (admin only)
export async function deleteUser(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}/users/delete.php?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return await response.json();
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, message: 'Network error while deleting user' };
  }
}
