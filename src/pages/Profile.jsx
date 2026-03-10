import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        first_name: '', email: '', dietary_preferences: '', allergies: '', favorite_cuisines: ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(true);

    // Функція для отримання токена
    const getAuthHeaders = () => {
        const token = localStorage.getItem('access_token');
        return { Authorization: `Bearer ${token}` };
    };

    // 1. Завантажуємо дані користувача при відкритті сторінки
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/user/`, {
                    headers: getAuthHeaders()
                });
                // Заповнюємо форму даними з бази (якщо null, ставимо пусту строку)
                setUserData({
                    first_name: response.data.first_name || '',
                    email: response.data.email || '',
                    dietary_preferences: response.data.dietary_preferences || '',
                    allergies: response.data.allergies || '',
                    favorite_cuisines: response.data.favorite_cuisines || '',
                });
                setAvatarPreview(response.data.avatar);
                setIsLoading(false);
            } catch (err) {
                console.error("Помилка завантаження профілю", err);
                navigate('/login'); // Якщо токен протух - викидаємо на логін
            }
        };
        fetchProfile();
    }, [navigate]);

    // 2. Обробка текстових полів
    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    // 3. Обробка завантаження файлу (Аватарки)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file)); // Одразу показуємо прев'ю картинки
        }
    };

    // 4. Відправка оновлених даних на сервер
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: 'Збереження...', type: 'info' });

        // Оскільки ми передаємо файл, нам потрібен FormData, а не звичайний JSON
        const formData = new FormData();
        formData.append('first_name', userData.first_name);
        formData.append('dietary_preferences', userData.dietary_preferences);
        formData.append('allergies', userData.allergies);
        formData.append('favorite_cuisines', userData.favorite_cuisines);
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/api/auth/user/`, formData, {
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'multipart/form-data' // Обов'язково для файлів
                }
            });
            setMessage({ text: 'Профіль успішно оновлено!', type: 'success' });

            // Прибираємо повідомлення через 3 секунди
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            setMessage({ text: 'Помилка при збереженні.', type: 'error' });
        }
    };

    if (isLoading) return <div className="text-center mt-20 text-xl font-serif">Завантаження...</div>;

    return (
        <div className="min-h-screen bg-[#f9fafb] py-12 px-6">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-8 md:p-12">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 border-b pb-4">Особистий кабінет</h1>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : message.type === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Секція Аватара */}
                    <div className="flex items-center space-x-6 mb-8">
                        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border-2 border-lite-green shadow-sm">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Змінити фото профілю</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Поля форми */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ім'я та Прізвище</label>
                            <input type="text" name="first_name" value={userData.first_name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none bg-gray-50 transition" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Електронна пошта</label>
                            <input type="email" value={userData.email} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Алергії</label>
                            <input type="text" name="allergies" value={userData.allergies} onChange={handleChange} placeholder="Наприклад: арахіс, лактоза" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none bg-gray-50 transition" />
                            <p className="text-xs text-gray-400 mt-1 ml-2">Ми будемо попереджати вас про ці інгредієнти у рецептах.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Дієтичні обмеження</label>
                            <input type="text" name="dietary_preferences" value={userData.dietary_preferences} onChange={handleChange} placeholder="Веган, Вегетаріанець..." className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none bg-gray-50 transition" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Улюблені кухні</label>
                            <input type="text" name="favorite_cuisines" value={userData.favorite_cuisines} onChange={handleChange} placeholder="Італійська, Українська..." className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none bg-gray-50 transition" />
                        </div>
                    </div>

                    <div className="pt-6 border-t mt-8 flex justify-end">
                        <button type="submit" className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition shadow-lg hover:shadow-xl">
                            Зберегти зміни
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;