import axios from 'axios';
import { API_URL, TOKEN_KEY } from './constants/api';

const api = axios.create({
    baseURL: API_URL,
});

// 1. Додаємо токен до кожного запиту автоматично
api.interceptors.request.use((config) => {
    // Шукаємо токен у двох місцях (для функції "Запам'ятати мене")
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 2. Слухаємо відповіді сервера, щоб зловити протухший токен
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');

                if (!refreshToken) {
                    throw new Error("No refresh token");
                }

                const res = await axios.post(`${API_URL}/api/auth/token/refresh/`, {
                    refresh: refreshToken
                });

                const storage = localStorage.getItem('refresh_token') ? localStorage : sessionStorage;
                storage.setItem(TOKEN_KEY, res.data.access);

                originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                return api(originalRequest);

            } catch (refreshError) {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;