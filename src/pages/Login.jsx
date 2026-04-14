import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import authBg from '../assets/auth/exit.jpg';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    // Стан для галочки (за замовчуванням увімкнена)
    const [rememberMe, setRememberMe] = useState(true);

    // При завантаженні сторінки перевіряємо, чи є збережена пошта
    useEffect(() => {
        const savedEmail = localStorage.getItem('saved_email');
        if (savedEmail) {
            setFormData(prevState => ({ ...prevState, email: savedEmail }));
            setRememberMe(true);
        }
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Допоміжна функція для збереження даних сеансу
    const saveAuthData = (data) => {
        // Визначаємо, куди зберігати
        const storage = rememberMe ? localStorage : sessionStorage;

        // Очищаємо інше сховище, щоб не було конфліктів
        const otherStorage = rememberMe ? sessionStorage : localStorage;
        otherStorage.removeItem('access_token');
        otherStorage.removeItem('refresh_token');
        otherStorage.removeItem('user');

        // Зберігаємо дані
        storage.setItem('access_token', data.access);
        if (data.refresh) {
            storage.setItem('refresh_token', data.refresh);
        }
        if (data.user) {
            storage.setItem('user', JSON.stringify(data.user));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login/`, formData);
            saveAuthData(response.data);

            // Зберігаємо або видаляємо email для майбутніх входів
            if (rememberMe) {
                localStorage.setItem('saved_email', formData.email);
            } else {
                localStorage.removeItem('saved_email');
            }

            window.location.href = '/';
        } catch (err) {
            if (err.response && err.response.data && err.response.data.non_field_errors) {
                const serverMsg = err.response.data.non_field_errors[0].toLowerCase();
                if (serverMsg.includes('verif') || serverMsg.includes('підтверджен')) {
                    setError('Ваша електронна пошта не підтверджена. Перевірте свою скриньку.');
                } else {
                    setError('Невірна пошта або пароль.');
                }
            } else {
                setError('Помилка з\'єднання з сервером. Спробуйте пізніше.');
            }
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/social/google/`, { access_token: tokenResponse.access_token });
                saveAuthData(res.data);
                window.location.href = '/';
            } catch (err) { setError('Помилка авторизації Google'); }
        }
    });

    const handleFacebookSuccess = async (response) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/social/facebook/`, { access_token: response.accessToken });
            saveAuthData(res.data);
            window.location.href = '/';
        } catch (err) { setError('Помилка авторизації Facebook'); }
    };

    return (
        <div className="flex-grow w-full flex justify-center md:justify-end items-center p-4 py-16 sm:p-6 md:py-24 md:pr-10 lg:pr-24 xl:pr-32 relative bg-white bg-cover bg-no-repeat bg-center md:bg-left"
             style={{ backgroundImage: `url(${authBg})` }}>

        <Link
            to="/"
            className="absolute top-6 left-4 sm:left-6 md:top-10 md:left-10 flex items-center px-6 sm:px-10 py-2 bg-white text-gray-800 rounded-[30px] border border-black hover:bg-[#1A1A1A] hover:text-white hover:border-transparent hover:shadow-md transition font-['Inter'] font-medium text-[13px] sm:text-[14px] lg:text-[15px] shadow-lg z-20 gap-2 cursor-pointer transition-all duration-300 ease-out active:scale-95 group"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 8 8 12 12 16"></polyline>
                <line x1="16" y1="12" x2="8" y2="12"></line>
            </svg>
            Назад
        </Link>

            <div className="flex flex-col items-center w-full max-w-[700px] z-10 pt-6 md:pt-0">

                <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-[80px] font-['El_Messiri'] text-[#1A1A1A] mb-8 md:mb-12 tracking-wide lg:tracking-[0.15em] whitespace-nowrap w-max pl-[0.05em] lg:pl-[0.15em] drop-shadow-sm text-center">
                    L I T E &nbsp; c o o k
                </div>

                <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-[2rem] p-6 sm:p-10 w-full max-w-[520px] font-['Inter'] mx-auto">

                    <h1 className="text-2xl md:text-4xl font-['El_Messiri'] font-bold mb-6 text-[#1A1A1A] text-center md:text-left">Увійти</h1>

                    {error && <div className="text-red-500 text-sm mb-4 text-center md:text-left bg-white/80 p-2 rounded-lg inline-block">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="inline-block text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 mb-1 ml-4">Електронна пошта</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="username"
                                placeholder="Введіть електронну пошту"
                                className="w-full px-5 font-['El_Messiri'] py-3 md:py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#42705D] transition text-base md:text-lg text-gray-700 bg-white"
                            />
                        </div>
                        <div>
                            <label className="inline-block text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 mb-1 ml-4">Пароль</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                                placeholder="Введіть пароль"
                                className="w-full px-5 py-3 md:py-2.5 font-['El_Messiri'] rounded-full border border-gray-300 focus:outline-none focus:border-[#42705D] transition text-base md:text-lg text-gray-700 bg-white"
                            />

                            <div className="flex justify-between items-center mt-3 px-2 sm:px-4">
                                {/* Галочка Запам'ятати мене */}
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative flex items-center justify-center w-5 h-5 rounded-md border-2 border-gray-400 group-hover:border-[#42705D] transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="absolute opacity-0 w-0 h-0"
                                        />
                                        {rememberMe && (
                                            <svg className="w-3.5 h-3.5 text-[#42705D]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                        )}
                                    </div>
                                    <span className="text-sm sm:text-base font-['El_Messiri'] text-gray-700 font-medium select-none cursor-pointer transition-all duration-300 ease-out active:scale-95 group">Запам'ятати мене</span>
                                </label>

                                <Link to="/reset-password" className="inline-block text-sm sm:text-base font-['El_Messiri'] text-blue-600 hover:text-[#42705D] transition font-medium cursor-pointer transition-all duration-300 ease-out active:scale-95 group">Забули пароль?</Link>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-[#1A1A1A] text-white font-['El_Messiri'] font-medium rounded-full py-3 md:py-2.5 hover:bg-gray-800 transition mt-4 text-base md:text-lg shadow-md cursor-pointer transition-all duration-300 ease-out active:scale-95 group">Увійти</button>
                    </form>

                    <div className="flex items-center my-5 md:my-6">
                        <div className="flex-grow border-t border-gray-400/50"></div>
                        <span className="px-4 text-sm md:text-base font-['El_Messiri'] text-gray-600 font-bold">або</span>
                        <div className="flex-grow border-t border-gray-400/50"></div>
                    </div>

                    <div className="space-y-3">
                        <button type="button" onClick={() => handleGoogleLogin()} className="w-full flex items-center justify-center gap-2 sm:gap-3 border border-gray-300 rounded-full py-2.5 hover:bg-gray-50 transition text-sm sm:text-base font-medium text-gray-700 hover:border-[#FBBC05] bg-white cursor-pointer transition-all duration-300 ease-out active:scale-95 group">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/><path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"/><path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.545 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
                            <span className="truncate font-['El_Messiri']">Увійти через Google</span>
                        </button>
                    </div>

                    <div className="mt-8 text-center text-sm sm:text-base font-['El_Messiri'] text-gray-800 font-medium">
                        У вас немає акаунту? <Link to="/register" className="text-blue-600 hover:text-[#42705D] hover:underline font-bold ml-1 transition cursor-pointer transition-all duration-300 ease-out active:scale-95 group">Зареєструватися</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;