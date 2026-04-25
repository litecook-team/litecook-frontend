import axios from 'axios';
import { API_URL, TOKEN_KEY } from './constants/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// 1. Інтерцептор ЗАПИТІВ: Додаємо токен та МОВУ до кожного запиту автоматично
api.interceptors.request.use((config) => {
    // Шукаємо токен
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Завжди передаємо бекенду поточну мову (uk, en, pl)
    const currentLang = localStorage.getItem('i18nextLng') || 'uk';
    config.headers['Accept-Language'] = currentLang;

    return config;
});

// 2. Інтерцептор ВІДПОВІДЕЙ: Обробка помилок (Протухший токен АБО Бан користувача)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response) {
            // === ЛОГІКА 1: ПЕРЕВІРКА НА БАН КОРИСТУВАЧА (Помилка 403) ===
            if (error.response?.status === 403 && error.response.data && error.response.data.detail === "Ваш акаунт заблоковано.") {

                const reason = error.response.data.reason || "Порушення політики конфіденційності!";

                // Очищаємо дані користувача (примусовий вихід)
                localStorage.removeItem(TOKEN_KEY);
                sessionStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem('refresh_token');
                sessionStorage.removeItem('refresh_token');

                // Створюємо подію для Header
                window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: null }));

                // Кодуємо причину, щоб вона безпечно передалася через URL
                window.location.href = `/banned?reason=${encodeURIComponent(reason)}`;

                return Promise.reject(error); // Зупиняємо подальшу обробку
            }
            // === ЛОГІКА 2: ОНОВЛЕННЯ ТОКЕНУ (Помилка 401) ===
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

                    // Зберігаємо новий токен туди, звідки брали старий
                    const storage = localStorage.getItem('refresh_token') ? localStorage : sessionStorage;
                    storage.setItem(TOKEN_KEY, res.data.access);

                    // Повторюємо оригінальний запит з новим токеном
                    originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                    return api(originalRequest);

                } catch (refreshError) {
                    // Якщо не вдалося оновити токен - виходимо з системи
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }
        // Прокидаємо будь-які інші помилки далі (наприклад 400 Bad Request, 404 Not Found)
        return Promise.reject(error);
    }
);

export default api;