
import apiClient from './index';

export async function getTaxSummary() {
    try {
        const response = await apiClient.get('/tax/summary');
        return response.data;
    } catch (error) {
        console.error("Error fetching tax summary:", error.response?.data || error.message);
        throw error;
    }
}

export async function addTaxDeduction(deductionData) {
    try {
        const response = await apiClient.post('/tax/deductions', deductionData);
        return response.data;
    } catch (error) {
        console.error("Error adding tax deduction:", error.response?.data || error.message);
        throw error;
    }
}

export async function getTaxSuggestions() {
    try {
        const response = await apiClient.get('/tax/suggestions');
        return response.data;
    } catch (error) {
        console.error("Error fetching tax suggestions:", error.response?.data || error.message);
        throw error;
    }
}
