
import api from './index';

export const getForecast = async (months) => {
  const response = await api.post('/forecasting/predict', { months });
  return response.data;
};
