import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
// Підключаємо фонове зображення
import authBg from '../assets/auth-bg.jpg';

const Login = () => {
    // useNavigate нам тут більше не потрібен для успішного входу, але залишаємо для інших потреб
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // 1. ЗВИЧАЙНИЙ ВХІД
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login/`, formData);
            localStorage.setItem('access_token', response.data.access);
            window.location.href = '/';
        } catch (err) {
            // Перевіряємо, чи є відповідь від бекенду
            if (err.response && err.response.data && err.response.data.non_field_errors) {
                const serverMsg = err.response.data.non_field_errors[0].toLowerCase();

                // Шукаємо слово 'verified' (або його український аналог, якщо бекенд переклав)
                if (serverMsg.includes('verif') || serverMsg.includes('підтверджен')) {
                    setError('Ваша електронна пошта не підтверджена. Будь ласка, перевірте свою скриньку.');
                } else {
                    setError('Невірна пошта або пароль.');
                }
            } else {
                setError('Помилка з\'єднання з сервером. Спробуйте пізніше.');
            }
            console.error('Деталі помилки:', err);
        }
    };

    // 2. ВХІД ЧЕРЕЗ GOOGLE
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/social/google/`, {
                    access_token: tokenResponse.access_token,
                });
                localStorage.setItem('access_token', res.data.access);

                // ЗМІНА 2: Повне перезавантаження
                window.location.href = '/';
            } catch (err) {
                setError('Помилка авторизації Google');
            }
        }
    });

    // 3. ВХІД ЧЕРЕЗ FACEBOOK
    const handleFacebookSuccess = async (response) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/social/facebook/`, {
                access_token: response.accessToken,
            });
            localStorage.setItem('access_token', res.data.access);

            // ЗМІНА 3: Повне перезавантаження
            window.location.href = '/';
        } catch (err) {
            setError('Помилка авторизації Facebook');
        }
    };

    return (
        <div
            className="min-h-[calc(100vh-80px)] bg-cover bg-center flex justify-center md:justify-end items-center p-6 md:pr-24"
            style={{ backgroundImage: `url(${authBg})`, backgroundColor: '#f9fafb' }}
        >
            <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl">
                <h1 className="text-4xl font-serif font-bold mb-8 text-gray-900">Увійти</h1>

                {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 ml-2">Електронна пошта</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-green-500 transition" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 ml-2">Пароль</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-green-500 transition" />
                    </div>
                    <button type="submit" className="w-full bg-black text-white font-semibold rounded-full py-3 hover:bg-gray-800 transition">Увійти</button>
                </form>

                <div className="flex items-center my-6"><div className="flex-grow border-t border-gray-300"></div><span className="px-3 text-xs text-gray-400">або</span><div className="flex-grow border-t border-gray-300"></div></div>

                <div className="space-y-3">
                    <FacebookLogin
                        appId={import.meta.env.VITE_FACEBOOK_APP_ID}
                        onSuccess={handleFacebookSuccess}
                        render={({ onClick }) => (
                            <button onClick={onClick} className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-full py-2.5 hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                                <span className="text-blue-600 font-bold text-lg">f</span> Увійти через Facebook
                            </button>
                        )}
                    />
                    <button type="button" onClick={() => handleGoogleLogin()} className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-full py-2.5 hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                        <span className="text-red-500 font-bold text-lg">G</span> Увійти через Google
                    </button>
                </div>

                <div className="mt-8 text-center text-sm text-gray-600">
                    У вас ще немає акаунту? <Link to="/register" className="text-blue-500 hover:underline">Зареєструватись</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;