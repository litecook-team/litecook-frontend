import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import authBg from '../assets/auth-bg.jpg';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_name: '', email: '', password1: '', password2: ''
    });
    const [agreed, setAgreed] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Новий стейт для керування модальним вікном
    const [showTerms, setShowTerms] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (!agreed) {
            setMessage({ text: 'Будь ласка, погодьтеся з умовами використання', type: 'error' });
            return;
        }

        if (formData.password1 !== formData.password2) {
            setMessage({ text: 'Паролі не співпадають', type: 'error' });
            return;
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/registration/`, formData);
            setMessage({
                text: 'Реєстрація успішна! Ми надіслали лист на вашу пошту. Будь ласка, перейдіть за посиланням у листі для підтвердження.',
                type: 'success'
            });
            setFormData({ first_name: '', email: '', password1: '', password2: '' });
        } catch (err) {
            setMessage({ text: 'Помилка реєстрації. Можливо, така пошта вже існує.', type: 'error' });
        }
    };

    // Обробники соцмереж
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/social/google/`, { access_token: tokenResponse.access_token });
                localStorage.setItem('access_token', res.data.access);
                navigate('/');
            } catch (err) { setMessage({ text: 'Не вдалося зареєструватися через Google', type: 'error' }); }
        }
    });

    const handleFacebookSuccess = async (response) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/social/facebook/`, { access_token: response.accessToken });
            localStorage.setItem('access_token', res.data.access);
            navigate('/');
        } catch (err) { setMessage({ text: 'Не вдалося зареєструватися через Facebook', type: 'error' }); }
    };

    return (
        <div className="w-full min-h-[calc(100vh-155px)] flex justify-center md:justify-end items-center p-6 md:pr-32 relative"
             style={{
                 backgroundImage: `url(${authBg})`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center bottom' // Використовуємо center bottom, щоб не обрізалися інгредієнти
             }}>

            <div className="bg-white rounded-[2rem] p-10 w-full max-w-md shadow-2xl relative z-10 font-['Inter'] my-8">

                {/* Заголовок шрифтом El Messiri */}
                <h1 className="text-3xl font-['El_Messiri'] font-bold mb-6 text-[#1A1A1A] text-center md:text-left">
                    Реєстрація
                </h1>

                {message.text && (
                    <div className={`text-[13px] mb-4 p-3 rounded-lg font-medium border ${message.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-800 mb-1 ml-4">Прізвище та ім'я</label>
                        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required placeholder="Введіть ваше прізвище та ім'я" className="w-full px-5 py-3.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#42705D] transition text-sm text-gray-700" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-800 mb-1 ml-4">Електронна пошта</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Введіть електронну пошту" className="w-full px-5 py-3.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#42705D] transition text-sm text-gray-700" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-800 mb-1 ml-4">Пароль</label>
                        <input type="password" name="password1" value={formData.password1} onChange={handleChange} required placeholder="Введіть пароль" className="w-full px-5 py-3.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#42705D] transition text-sm text-gray-700" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-800 mb-1 ml-4">Підтвердження пароля</label>
                        <input type="password" name="password2" value={formData.password2} onChange={handleChange} required placeholder="Повторіть пароль" className="w-full px-5 py-3.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#42705D] transition text-sm text-gray-700" />
                    </div>

                    <div className="flex items-center pl-4 pt-1">
                        <input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 text-[#42705D] bg-gray-100 border-gray-300 rounded focus:ring-[#42705D] cursor-pointer" />
                        <label htmlFor="terms" className="ml-2 text-[12px] text-gray-600 font-medium">
                            Я згоден з {' '}
                            <span onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-blue-600 hover:text-[#42705D] hover:underline cursor-pointer transition">
                                умовами використання
                            </span>
                        </label>
                    </div>

                    <button type="submit" className="w-full bg-[#1A1A1A] text-white font-medium rounded-full py-3.5 hover:bg-gray-800 transition mt-2 shadow-md">
                        Зареєструватись
                    </button>
                </form>

                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="px-4 text-[13px] text-gray-400 font-medium">або</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <div className="space-y-3">
                    <FacebookLogin appId={import.meta.env.VITE_FACEBOOK_APP_ID} onSuccess={handleFacebookSuccess} render={({ onClick }) => (
                        <button type="button" onClick={onClick} className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-full py-2.5 hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                            {/* Іконка FB */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            Зареєструватися через Facebook
                        </button>
                    )} />
                    <button type="button" onClick={() => handleGoogleLogin()} className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-full py-2.5 hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                        {/* Іконка Google */}
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/><path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"/><path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.545 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
                        Зареєструватися через Google
                    </button>
                </div>

                <div className="mt-8 text-center text-[13px] text-gray-600">
                    Вже маєте акаунт? <Link to="/login" className="text-blue-600 hover:text-[#42705D] hover:underline font-semibold ml-1 transition">Увійти</Link>
                </div>
            </div>

            {/* --- МОДАЛЬНЕ ВІКНО З УМОВАМИ ВИКОРИСТАННЯ --- */}
            {showTerms && (
                <div className="fixed inset-0 bg-black/60 bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative shadow-2xl font-['Inter']">

                        {/* Кнопка закриття хрестиком */}
                        <button onClick={() => setShowTerms(false)} className="absolute top-6 right-6 text-gray-400 hover:text-[#1A1A1A] transition">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <h2 className="text-2xl font-['El_Messiri'] font-bold mb-6 text-[#1A1A1A]">Умови використання LITE cook</h2>

                        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                            <p><strong className="text-gray-800">1. Загальні положення</strong><br/>Реєструючись у додатку LITE cook, ви погоджуєтесь із цими умовами. Додаток створений для пошуку рецептів та планування меню.</p>
                            <p><strong className="text-gray-800">2. Обліковий запис</strong><br/>Ви несете відповідальність за збереження конфіденційності вашого пароля. Один користувач може мати лише один обліковий запис.</p>
                            <p><strong className="text-gray-800">3. Інформація про здоров'я та алергії</strong><br/>Рецепти та розрахунок калорій надаються виключно в ознайомчих цілях. LITE cook не несе відповідальності за можливі алергічні реакції або наслідки дієт. Перед зміною раціону проконсультуйтеся з лікарем.</p>
                            <p><strong className="text-gray-800">4. Використання контенту</strong><br/>Усі рецепти, фотографії та тексти є власністю проєкту. Забороняється їх комерційне копіювання без дозволу.</p>
                            <p><strong className="text-gray-800">5. Зміни до умов</strong><br/>Ми залишаємо за собою право оновлювати ці умови. Зміни набувають чинності з моменту їх публікації в додатку.</p>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => { setShowTerms(false); setAgreed(true); }}
                                className="bg-[#1A1A1A] text-white font-medium px-8 py-3 rounded-full hover:bg-gray-800 transition shadow-md"
                            >
                                Зрозуміло, погоджуюсь
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Register;