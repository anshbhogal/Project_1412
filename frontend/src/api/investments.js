
import apiClient from './index';

export async function getInvestments() {
  try {
    const response = await apiClient.get('/investments/');
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

export async function createInvestment(investmentData) {
  try {
    const response = await apiClient.post('/investments/', investmentData);
    return response.data;
  } catch (error) {
    console.error("Error creating investment:", error.response?.data || error.message);
    throw error;
  }
}
