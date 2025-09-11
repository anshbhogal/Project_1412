
import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized responses, e.g., redirect to login
            console.error("Unauthorized, redirecting to login...");
            localStorage.removeItem('jwt_token');
            // In a real application, you would redirect to the login page:
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default apiClient;
