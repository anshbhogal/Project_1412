import apiClient from './index';

export async function getForecastExpenses(months = 6) {
  try {
    const response = await apiClient.get('/forecasting/expenses', { params: { months } });
    return response.data.forecasts;
  } catch (error) {
    console.error("Error fetching expense forecast:", error.response?.data || error.message);
    throw error;
  }
}

export async function getForecastIncome(months = 6) {
  try {
    const response = await apiClient.get('/forecasting/income', { params: { months } });
    return response.data.forecasts;
  } catch (error) {
    console.error("Error fetching income forecast:", error.response?.data || error.message);
    throw error;
  }
}

export async function getForecastCashflow(months = 6) {
  try {
    const response = await apiClient.get('/forecasting/cashflow', { params: { months } });
    return response.data.forecasts;
  } catch (error) {
    console.error("Error fetching cashflow forecast:", error.response?.data || error.message);
    throw error;
  }
}
