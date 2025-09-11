
import apiClient from './index';

export async function addInvestment(investmentData) {
    try {
        const response = await apiClient.post('/investments/', investmentData);
        return response.data;
    } catch (error) {
        console.error("Error adding investment:", error.response?.data || error.message);
        throw error;
    }
}

export async function getInvestments(type = null) {
    try {
        const params = type ? { type } : {};
        const response = await apiClient.get('/investments/', { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching investments:", error.response?.data || error.message);
        throw error;
    }
}

export async function getInvestmentPerformance() {
    try {
        const response = await apiClient.get('/investments/performance');
        return response.data;
    } catch (error) {
        console.error("Error fetching investment performance:", error.response?.data || error.message);
        throw error;
    }
}
