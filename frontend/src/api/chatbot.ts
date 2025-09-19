import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface ChatbotQuery {
  question: string;
}

interface ChatbotResponse {
  answer: string;
}

export const postChatbotQuery = async (query: ChatbotQuery): Promise<ChatbotResponse> => {
  const response = await axios.post(`${API_BASE_URL}/chatbot/query`, query);
  return response.data;
};
