import axios from 'axios';
import { API_URL, TOKEN_KEY } from './constants/api';

const api = axios.create({
    baseURL: API_URL,
});

// Інтерцептор для ЗАПИТІВ
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Інтерцептор для ВІДПОВІДЕЙ
api.interceptors.response.use(
    (response) => {
        return response; // Якщо все Ок, пропускаємо далі
    },
    async (error) => {
        const originalRequest = error.config;

        // Перевіряємо, чи це помилка 401 (протух токен) І чи ми ще не намагалися його оновити (_retry)
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Ставимо прапорець, щоб не зациклитися

            try {
                const refreshToken = localStorage.getItem('refresh_token');

                if (refreshToken) {
                    // Робимо запит до бекенду для оновлення токену
                    // Важливо: використовуємо чистий axios, а не наш api, щоб не було нескінченного циклу
                    const response = await axios.post(`${API_URL}/api/auth/token/refresh/`, {
                        refresh: refreshToken
                    });

                    const newAccessToken = response.data.access;

                    // Зберігаємо новий access_token
                    localStorage.setItem(TOKEN_KEY, newAccessToken);

                    // Підставляємо новий токен у старий запит
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                    // Повторюємо оригінальний запит з новим токеном!
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Якщо refresh_token теж протух або недійсний
                console.error("Session expired. Logging out.");
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Якщо це була помилка 401, але refresh_token не допоміг (або його взагалі не було)
        if (error.response && error.response.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;