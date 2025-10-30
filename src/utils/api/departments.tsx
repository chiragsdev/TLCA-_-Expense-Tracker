// Departments API utilities for MySQL backend

const API_BASE_URL = '/api';

export interface Department {
  id?: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Get all departments
export async function getDepartments(includeInactive: boolean = false): Promise<Department[]> {
  try {
    const token = localStorage.getItem('auth_token');
    const url = includeInactive 
      ? `${API_BASE_URL}/departments/get.php?include_inactive=true`
      : `${API_BASE_URL}/departments/get.php`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (data.success) {
      return data.departments || [];
    }
    
    console.error('Failed to get departments:', data.message);
    return [];
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
}

// Add new department
export async function addDepartment(department: Omit<Department, 'id'>): Promise<{ success: boolean; message?: string; id?: string }> {
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}/departments/add.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(department),
    });

    return await response.json();
  } catch (error) {
    console.error('Error adding department:', error);
    return { success: false, message: 'Network error while adding department' };
  }
}

// Archive/restore department
export async function archiveDepartment(id: string, archive: boolean = true): Promise<{ success: boolean; message?: string }> {
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}/departments/archive.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id, archive }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error archiving department:', error);
    return { success: false, message: 'Network error while archiving department' };
  }
}
