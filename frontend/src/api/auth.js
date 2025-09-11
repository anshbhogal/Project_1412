
import apiClient from './index';

export async function signup(userData) {
    try {
        const response = await apiClient.post('/auth/signup', userData);
        return response.data;
    } catch (error) {
        console.error("Signup error:", error.response?.data || error.message);
        throw error;
    }
}

export async function login(credentials) {
    try {
        // FastAPI's OAuth2PasswordRequestForm expects 'username' and 'password'
        const form_data = new URLSearchParams();
        form_data.append('username', credentials.email);
        form_data.append('password', credentials.password);

        const response = await apiClient.post('/auth/login', form_data,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        localStorage.setItem('jwt_token', response.data.access_token);
        return response.data;
    } catch (error) {
        console.error("Login error:", error.response?.data || error.message);
        throw error;
    }
}

export async function getCurrentUser() {
    try {
        const response = await apiClient.get('/auth/me');
        return response.data;
    } catch (error) {
        console.error("Get current user error:", error.response?.data || error.message);
        // If 401, the interceptor should handle clearing the token
        throw error;
    }
}

export function logout() {
    localStorage.removeItem('jwt_token');
    console.log("Logged out.");
    // In a real application, you might also redirect to the login page here
    // window.location.href = '/login';
}
