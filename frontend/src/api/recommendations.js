
import apiClient from './index';

export async function getExpenseRecommendations() {
    try {
        const response = await apiClient.get('/recommendations/expenses');
        return response.data;
    } catch (error) {
        console.error("Error fetching expense recommendations:", error.response?.data || error.message);
        throw error;
    }
}

export async function getTaxRecommendations() {
    try {
        const response = await apiClient.get('/recommendations/tax');
        return response.data;
    } catch (error) {
        console.error("Error fetching tax recommendations:", error.response?.data || error.message);
        throw error;
    }
}

export async function getInvestmentRecommendations() {
    try {
        const response = await apiClient.get('/recommendations/investments');
        return response.data;
    } catch (error) {
        console.error("Error fetching investment recommendations:", error.response?.data || error.message);
        throw error;
    }
}

export async function getCashflowRecommendations() {
    try {
        const response = await apiClient.get('/recommendations/cashflow');
        return response.data;
    } catch (error) {
        console.error("Error fetching cashflow recommendations:", error.response?.data || error.message);
        throw error;
    }
}
