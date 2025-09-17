
import apiClient from './index';

export async function getTaxSummary(params = {}) {
    try {
        const response = await apiClient.get('/tax/summary', { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching tax summary:", error.response?.data || error.message);
        throw error;
    }
}

export async function getTaxSlabs(country = 'india', regime = 'old') {
    try {
        const response = await apiClient.get(`/tax/slabs?country=${country}&regime=${regime}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching tax slabs:", error.response?.data || error.message);
        throw error;
    }
}

export async function calculateTax(payload) {
    try {
        const response = await apiClient.post('/tax/calculate', payload);
        return response.data;
    } catch (error) {
        console.error("Error calculating tax:", error.response?.data || error.message);
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

export async function getTaxReport(reportType, country = 'india', regime = 'old') {
    try {
        const response = await apiClient.get(`/tax/report?report_type=${reportType}&country=${country}&regime=${regime}`, {
            responseType: 'blob' // Important for downloading files
        });
        return response.data;
    } catch (error) {
        console.error("Error generating tax report:", error.response?.data || error.message);
        throw error;
    }
}
