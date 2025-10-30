// Income API utilities for MySQL backend

const API_BASE_URL = 'https://tlca-expense-tracker-yasz.onrender.com/api/';

export interface Income {
  id?: string;
  department: string;
  description: string;
  amount: number;
  date: string;
  contributedBy: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Get income for a department
export async function getIncome(department?: string): Promise<Income[]> {
  try {
    const token = localStorage.getItem('auth_token');
    const url = department 
      ? `${API_BASE_URL}/income/get.php?department=${encodeURIComponent(department)}`
      : `${API_BASE_URL}/income/get.php`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (data.success) {
      return data.income || [];
    }
    
    console.error('Failed to get income:', data.message);
    return [];
  } catch (error) {
    console.error('Error fetching income:', error);
    return [];
  }
}

// Add new income
export async function addIncome(income: Income): Promise<{ success: boolean; message?: string; id?: string }> {
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}/income/add.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(income),
    });

    return await response.json();
  } catch (error) {
    console.error('Error adding income:', error);
    return { success: false, message: 'Network error while adding income' };
  }
}
