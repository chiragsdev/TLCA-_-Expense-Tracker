// Expenses API utilities for MySQL backend

const API_BASE_URL = 'https://tlca-expense-tracker-yasz.onrender.com/api/';

export interface Expense {
  id?: string;
  department: string;
  description: string;
  amount: number;
  date: string;
  purchasedBy: string;
  notes?: string;
  reimbursementStatus: 'Pending' | 'Approved' | 'Paid';
  receiptUrl?: string;
  receiptFilename?: string;
  created_at?: string;
  updated_at?: string;
}

// Get expenses for a department
export async function getExpenses(department?: string): Promise<Expense[]> {
  try {
    const token = localStorage.getItem('auth_token');
    const url = department 
      ? `${API_BASE_URL}/expenses/get.php?department=${encodeURIComponent(department)}`
      : `${API_BASE_URL}/expenses/get.php`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (data.success) {
      return data.expenses || [];
    }
    
    console.error('Failed to get expenses:', data.message);
    return [];
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
}

// Add new expense
export async function addExpense(expense: Expense): Promise<{ success: boolean; message?: string; id?: string }> {
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}/expenses/add.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(expense),
    });

    return await response.json();
  } catch (error) {
    console.error('Error adding expense:', error);
    return { success: false, message: 'Network error while adding expense' };
  }
}

// Update expense
export async function updateExpense(id: string, expense: Partial<Expense>): Promise<{ success: boolean; message?: string }> {
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}/expenses/update.php`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id, ...expense }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error updating expense:', error);
    return { success: false, message: 'Network error while updating expense' };
  }
}

// Delete expense
export async function deleteExpense(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}/expenses/delete.php?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return await response.json();
  } catch (error) {
    console.error('Error deleting expense:', error);
    return { success: false, message: 'Network error while deleting expense' };
  }
}
