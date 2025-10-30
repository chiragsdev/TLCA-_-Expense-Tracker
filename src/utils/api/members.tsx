// Church Members API utilities for MySQL backend

const API_BASE_URL = '/api';

export interface ChurchMember {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Get all church members
export async function getMembers(): Promise<ChurchMember[]> {
  try {
    const token = localStorage.getItem('auth_token');

    const response = await fetch(`${API_BASE_URL}/members/get.php`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (data.success) {
      return data.members || [];
    }
    
    console.error('Failed to get members:', data.message);
    return [];
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
}
