import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import authBg from '../assets/auth-bg.jpg';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login/`, formData);
            localStorage.setItem('access_token', response.data.access);
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
                localStorage.setItem('access_token', res.data.access);
                window.location.href = '/';
            } catch (err) { setError('Помилка авторизації Google'); }
        }
    });

    const handleFacebookSuccess = async (response) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/social/facebook/`, { access_token: response.accessToken });
            localStorage.setItem('access_token', res.data.access);
            window.location.href = '/';
        } catch (err) { setError('Помилка авторизації Facebook'); }
    };

    return (
        // Збільшені відступи py-16 md:py-24 для більшого "повітря"
        <div className="flex-grow w-full flex justify-center md:justify-end items-center p-4 py-16 sm:p-6 md:py-24 md:pr-10 lg:pr-24 xl:pr-32 relative bg-white bg-cover bg-no-repeat bg-center md:bg-left"
             style={{ backgroundImage: `url(${authBg})` }}>

            {/* Стилізована кнопка "Назад" */}
            <Link to="/" className="absolute top-6 left-4 sm:left-6 md:top-10 md:left-10 flex items-center px-4 md:px-5 py-2.5 bg-[#1A1A1A] text-white rounded-full hover:bg-gray-800 transition font-['Inter'] font-medium text-xs md:text-sm shadow-md z-20">
                <svg className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Назад
            </Link>

            {/* Контейнер для правого блоку */}
            <div className="flex flex-col items-center w-full max-w-[700px] z-10 pt-6 md:pt-0">

                {/* Напис L I T E cook: Більші букви, менші відступи, завжди 1 рядок */}
                <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-[80px] font-['El_Messiri'] text-[#1A1A1A] mb-8 md:mb-12 tracking-wide lg:tracking-[0.15em] whitespace-nowrap w-max pl-[0.05em] lg:pl-[0.15em] drop-shadow-sm text-center">

                    L I T E &nbsp; c o o k
                </div>
     {/* Сама форма: ПОВНІС
           ТЮ прибрано bg, тіні та рамки на всіх екранах */}
                <div className="w-full max-w-md font-['Inter'] mx-auto">

                    <h1 className="text-2xl md:text-4xl font-['El_Messiri'] font-bold mb-6 text-[#1A1A1A] text-center md:text-left">Увійти</h1>

                    {error && <div className="text-red-500 text-sm mb-4 text-center md:text-left bg-white/80 p-2 rounded-lg inline-block">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            {/* Додано легкий білий фон для тексту лейблів на мобільному, щоб гарантовано читалось */}
                            <label className="inline-block text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 mb-1 ml-4 bg-white/70 px-1 rounded backdrop-blur-sm">Електронна пошта</label>
                            {/* Інпути тепер завжди bg-white (непрозорі) + shadow-sm для красивого об'єму */}
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Введіть електронну пошту" className="w-full px-5 font-['El_Messiri'] py-3 md:py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#42705D] transition text-base md:text-lg text-gray-700 bg-white shadow-sm focus:shadow-md" />
                        </div>
                        <div>
                            <label className="inline-block text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 mb-1 ml-4 bg-white/70 px-1 rounded backdrop-blur-sm">Пароль</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Введіть пароль" className="w-full px-5 py-3 md:py-2.5 font-['El_Messiri'] rounded-full border border-gray-300 focus:outline-none focus:border-[#42705D] transition text-base md:text-lg text-gray-700 bg-white shadow-sm focus:shadow-md" />

                            <div className="text-right mt-2 pr-4">
                                <Link to="/reset-password" className="inline-block text-sm sm:text-base font-['El_Messiri'] text-blue-600 hover:text-[#42705D] transition font-medium bg-white/70 px-1 rounded backdrop-blur-sm">Забули пароль?</Link>
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-[#1A1A1A] text-white font-['El_Messiri'] font-medium rounded-full py-3 md:py-3.5 hover:bg-gray-800 transition mt-4 text-base md:text-lg shadow-md">Увійти</button>
                    </form>

                    <div className="flex items-center my-5 md:my-6 bg-white/40 p-1 rounded-full backdrop-blur-sm">
                        <div className="flex-grow border-t border-gray-400/50"></div>
                        <span className="px-4 text-sm md:text-base font-['El_Messiri'] text-gray-600 font-bold">або</span>
                        <div className="flex-grow border-t border-gray-400/50"></div>
                    </div>

                    <div className="space-y-3">
                        <FacebookLogin appId={import.meta.env.VITE_FACEBOOK_APP_ID} onSuccess={handleFacebookSuccess} render={({ onClick }) => (
                            <button type="button" onClick={onClick} className="w-full flex items-center justify-center gap-2 sm:gap-3 border border-gray-300 rounded-full py-2.5 hover:bg-gray-50 transition text-sm sm:text-base font-medium text-gray-700 bg-white shadow-sm">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                <span className="truncate font-['El_Messiri']">Увійти через Facebook</span>
                            </button>
                        )} />
                        <button type="button" onClick={() => handleGoogleLogin()} className="w-full flex items-center justify-center gap-2 sm:gap-3 border border-gray-300 rounded-full py-2.5 hover:bg-gray-50 transition text-sm sm:text-base font-medium text-gray-700 hover:border-[#FBBC05] bg-white shadow-sm">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/><path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"/><path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.545 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
                            <span className="truncate font-['El_Messiri']">Увійти через Google</span>
                        </button>
                    </div>

                    <div className="mt-8 text-center text-sm sm:text-base font-['El_Messiri'] text-gray-800 font-medium">
                        У вас немає акаунту? <Link to="/register" className="text-blue-600 hover:text-[#42705D] hover:underline font-bold ml-1 transition">Зареєструватись</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;