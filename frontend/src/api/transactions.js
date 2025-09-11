
import apiClient from './index';

export async function getTransactions() {
    try {
        const response = await apiClient.get('/transactions/');
        return response.data;
    } catch (error) {
        console.error("Error fetching transactions:", error.response?.data || error.message);
        throw error;
    }
}

export async function createTransaction(transactionData) {
    try {
        const response = await apiClient.post('/transactions/', transactionData);
        return response.data;
    } catch (error) {
        console.error("Error creating transaction:", error.response?.data || error.message);
        throw error;
    }
}

export async function getTransaction(id) {
    try {
        const response = await apiClient.get(`/transactions/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching transaction ${id}:`, error.response?.data || error.message);
        throw error;
    }
}

export async function updateTransaction(id, transactionData) {
    try {
        const response = await apiClient.put(`/transactions/${id}`, transactionData);
        return response.data;
    } catch (error) {
        console.error(`Error updating transaction ${id}:`, error.response?.data || error.message);
        throw error;
    }
}

export async function deleteTransaction(id) {
    try {
        await apiClient.delete(`/transactions/${id}`);
        return { message: "Transaction deleted successfully" };
    } catch (error) {
        console.error(`Error deleting transaction ${id}:`, error.response?.data || error.message);
        throw error;
    }
}

export async function uploadTransactions(formData) {
    try {
        const response = await apiClient.post('/transactions/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading transactions:", error.response?.data || error.message);
        throw error;
    }
}
