// File Upload API utilities for MySQL backend

const API_BASE_URL = 'https://tlca-expense-tracker-yasz.onrender.com/api/';

export interface UploadResponse {
  success: boolean;
  url?: string;
  filename?: string;
  message?: string;
}

// Upload receipt file
export async function uploadReceipt(file: File): Promise<UploadResponse> {
  try {
    const token = localStorage.getItem('auth_token');
    
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await fetch(`${API_BASE_URL}/uploads/receipt.php`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    return await response.json();
  } catch (error) {
    console.error('Error uploading receipt:', error);
    return { success: false, message: 'Network error while uploading receipt' };
  }
}
