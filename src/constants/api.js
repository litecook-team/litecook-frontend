import axios from 'axios';

// ================= КОНСТАНТИ =================
export const API_URL = import.meta.env.VITE_API_URL;
export const TOKEN_KEY = 'access_token';

export const ENDPOINTS = {
    RECIPES: '/api/recipes/',
    FAVORITES: '/api/favorites/',
    WEEKLY_MENU: '/api/weekly-menu/',
};

// ================= НАЛАШТУВАННЯ AXIOS =================
const api = axios.create({
    baseURL: API_URL, // Використовуємо змінну, яку вже оголосили вище
});

// 1. Додаємо токен до кожного запиту автоматично
api.interceptors.request.use((config) => {
    // Беремо токен звідти, де він є (localStorage або sessionStorage)
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 2. Слухаємо відповіді сервера, щоб зловити протухший токен
api.interceptors.response.use(
    (response) => response, // Якщо все ок, просто віддаємо дані
    async (error) => {
        const originalRequest = error.config;

        // Якщо помилка 401 (Unauthorized) і ми ще не намагалися оновити токен
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Шукаємо refresh token
                const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');

                if (!refreshToken) {
                    throw new Error("No refresh token");
                }

                // Стукаємо на бекенд за новим токеном
                const res = await axios.post(`${API_URL}/api/auth/token/refresh/`, {
                    refresh: refreshToken
                });

                // Визначаємо, де ми зберігаємо дані для цього користувача і кладемо туди новий access_token
                const storage = localStorage.getItem('refresh_token') ? localStorage : sessionStorage;
                storage.setItem('access_token', res.data.access);

                // Оновлюємо заголовок і повторюємо старий запит (наприклад, завантаження профілю)
                originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                return api(originalRequest);

            } catch (refreshError) {
                // Якщо навіть refresh_token протух (пройшли наші 30 днів), тоді вже точно викидаємо користувача
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// Експортуємо налаштований axios за замовчуванням
export default api;