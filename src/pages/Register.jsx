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

    // Обробники соцмереж залишаються без змін
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
        <div className="min-h-[calc(100vh-80px)] bg-cover bg-center flex justify-center md:justify-end items-center p-6 md:pr-24" style={{ backgroundImage: `url(${authBg})`, backgroundColor: '#f9fafb' }}>
            <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl my-8">
                <h1 className="text-4xl font-serif font-bold mb-8 text-gray-900">Реєстрація</h1>

                {message.text && (
                    <div className={`text-sm mb-4 p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 ml-2">Прізвище та ім'я</label>
                        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required placeholder="Введіть ваше прізвище та ім'я" className="w-full px-5 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 ml-2">Електронна пошта</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Введіть електронну пошту" className="w-full px-5 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 ml-2">Пароль</label>
                        <input type="password" name="password1" value={formData.password1} onChange={handleChange} required placeholder="Введіть пароль" className="w-full px-5 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 ml-2">Підтвердження пароля</label>
                        <input type="password" name="password2" value={formData.password2} onChange={handleChange} required placeholder="Повторіть пароль" className="w-full px-5 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition" />
                    </div>

                    <div className="flex items-center pl-2 pt-2">
                        <input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 cursor-pointer" />
                        <label htmlFor="terms" className="ml-2 text-xs text-gray-600">
                            Я згоден з {' '}
                            {/* Робимо текст клікабельним */}
                            <span
                                onClick={(e) => { e.preventDefault(); setShowTerms(true); }}
                                className="text-blue-500 hover:underline cursor-pointer font-medium"
                            >
                                умовами використання
                            </span>
                        </label>
                    </div>

                    <button type="submit" className="w-full bg-black text-white font-semibold rounded-full py-3 mt-4 hover:bg-gray-800 transition shadow-md">
                        Зареєструватись
                    </button>
                </form>

                <div className="flex items-center my-6"><div className="flex-grow border-t border-gray-300"></div><span className="px-3 text-xs text-gray-400">або</span><div className="flex-grow border-t border-gray-300"></div></div>

                <div className="space-y-3">
                    <FacebookLogin appId={import.meta.env.VITE_FACEBOOK_APP_ID} onSuccess={handleFacebookSuccess} render={({ onClick }) => (
                        <button type="button" onClick={onClick} className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-full py-2.5 hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                            <span className="text-blue-600 font-bold text-lg">f</span> Зареєструватися через Facebook
                        </button>
                    )} />
                    <button type="button" onClick={() => handleGoogleLogin()} className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-full py-2.5 hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                        <span className="text-red-500 font-bold text-lg">G</span> Зареєструватися через Google
                    </button>
                </div>

                <div className="mt-6 text-center text-sm text-gray-600">Вже маєте акаунт? <Link to="/login" className="text-blue-500 hover:underline">Увійти</Link></div>
            </div>

            {/* --- МОДАЛЬНЕ ВІКНО З УМОВАМИ ВИКОРИСТАННЯ --- */}
            {showTerms && (
                <div className="fixed inset-0 bg-black/60 bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative shadow-2xl">

                        {/* Кнопка закриття хрестиком */}
                        <button onClick={() => setShowTerms(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <h2 className="text-2xl font-serif font-bold mb-4 text-gray-900">Умови використання LITE cook</h2>

                        <div className="space-y-4 text-sm text-gray-600">
                            <p><strong>1. Загальні положення</strong><br/>Реєструючись у додатку LITE cook, ви погоджуєтесь із цими умовами. Додаток створений для пошуку рецептів та планування меню.</p>
                            <p><strong>2. Обліковий запис</strong><br/>Ви несете відповідальність за збереження конфіденційності вашого пароля. Один користувач може мати лише один обліковий запис.</p>
                            <p><strong>3. Інформація про здоров'я та алергії</strong><br/>Рецепти та розрахунок калорій надаються виключно в ознайомчих цілях. LITE cook не несе відповідальності за можливі алергічні реакції або наслідки дієт. Перед зміною раціону проконсультуйтеся з лікарем.</p>
                            <p><strong>4. Використання контенту</strong><br/>Усі рецепти, фотографії та тексти є власністю проєкту. Забороняється їх комерційне копіювання без дозволу.</p>
                            <p><strong>5. Зміни до умов</strong><br/>Ми залишаємо за собою право оновлювати ці умови. Зміни набувають чинності з моменту їх публікації в додатку.</p>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => { setShowTerms(false); setAgreed(true); }}
                                className="bg-lite-green text-gray-800 font-medium px-6 py-2.5 rounded-full hover:bg-green-100 transition"
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