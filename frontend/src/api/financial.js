import apiClient from './index';

export async function getFinancialSummary(params = {}) {
    try {
        const response = await apiClient.get('/summary/financial', { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching financial summary:", error.response?.data || error.message);
        throw error;
    }
}
