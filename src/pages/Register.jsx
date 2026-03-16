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
                text: 'Реєстрація успішна! Ми надіслали лист на вашу пошту.',
                type: 'success'
            });
            setFormData({ first_name: '', email: '', password1: '', password2: '' });
        } catch (err) {
            setMessage({ text: 'Помилка реєстрації. Можливо, така пошта вже існує.', type: 'error' });
        }
    };

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
        <div className="flex-grow w-full flex justify-center md:justify-end items-center p-4 py-16 sm:p-6 md:py-24 md:pr-10 lg:pr-24 xl:pr-32 relative bg-white bg-cover bg-no-repeat bg-center md:bg-left"
             style={{ backgroundImage: `url(${authBg})` }}>

            <Link to="/" className="absolute top-6 left-4 sm:left-6 md:top-10 md:left-10 flex items-center px-4 md:px-5 py-2.5 bg-[#1A1A1A] text-white rounded-full hover:bg-gray-800 transition font-['Inter'] font-medium text-xs md:text-sm shadow-md z-20">
                <svg className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Назад
            </Link>

            <div className="flex flex-col items-center w-full max-w-[700px] z-10 pt-6 md:pt-0">

                <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-[80px] font-['El_Messiri'] text-[#1A1A1A] mb-8 md:mb-12 tracking-wide lg:tracking-[0.15em] whitespace-nowrap w-max pl-[0.05em] lg:pl-[0.15em] drop-shadow-sm text-center">
                    L I T E &nbsp; c o o k
                </div>

                <div className="w-full max-w-md font-['Inter'] mx-auto">

                    <h1 className="text-2xl md:text-4xl font-['El_Messiri'] font-bold mb-6 text-[#1A1A1A] text-center md:text-left">
                        Реєстрація
                    </h1>

                    {message.text && (
                        <div className={`text-xs md:text-[13px] mb-4 p-3 rounded-lg font-medium border bg-white/80 backdrop-blur-sm inline-block ${message.type === 'error' ? 'text-red-500 border-red-200' : 'text-green-600 border-green-200'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="inline-block text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 mb-1 ml-4 bg-white/70 px-1 rounded backdrop-blur-sm">Прізвище та ім'я</label>
                            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required placeholder="Введіть ваше прізвище та ім'я" className="w-full px-5 font-['El_Messiri'] py-3 md:py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#42705D] transition text-base md:text-lg text-gray-700 bg-white shadow-sm focus:shadow-md" />
                        </div>
                        <div>
                            <label className="inline-block text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 mb-1 ml-4 bg-white/70 px-1 rounded backdrop-blur-sm">Електронна пошта</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Введіть електронну пошту" className="w-full px-5 font-['El_Messiri'] py-3 md:py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#42705D] transition text-base md:text-lg text-gray-700 bg-white shadow-sm focus:shadow-md" />
                        </div>
                        <div>
                            <label className="inline-block text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 mb-1 ml-4 bg-white/70 px-1 rounded backdrop-blur-sm">Пароль</label>
                            <input type="password" name="password1" value={formData.password1} onChange={handleChange} required placeholder="Введіть пароль" className="w-full px-5 py-3 md:py-2.5 font-['El_Messiri'] rounded-full border border-gray-300 focus:outline-none focus:border-[#42705D] transition text-base md:text-lg text-gray-700 bg-white shadow-sm focus:shadow-md" />
                        </div>
                        <div>
                            <label className="inline-block text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 mb-1 ml-4 bg-white/70 px-1 rounded backdrop-blur-sm">Підтвердження пароля</label>
                            <input type="password" name="password2" value={formData.password2} onChange={handleChange} required placeholder="Повторіть пароль" className="w-full px-5 py-3 md:py-2.5 font-['El_Messiri'] rounded-full border border-gray-300 focus:outline-none focus:border-[#42705D] transition text-base md:text-lg text-gray-700 bg-white shadow-sm focus:shadow-md" />
                        </div>

                        <div className="flex items-center pl-4 pt-1">
                            <input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 text-[#42705D] bg-gray-100 border-gray-300 rounded focus:ring-[#42705D] cursor-pointer shrink-0" />
                            <label htmlFor="terms" className="ml-2 inline-block text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 bg-white/70 px-1 rounded backdrop-blur-sm">
                                Я згоден з {' '}
                                <span onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-blue-600 hover:text-[#42705D] hover:underline cursor-pointer transition">
                                    умовами використання
                                </span>
                            </label>
                        </div>

                        <button type="submit" className="w-full bg-[#1A1A1A] text-white font-['El_Messiri'] font-medium rounded-full py-3 md:py-2.5 hover:bg-gray-800 transition mt-4 text-base md:text-lg shadow-md">
                            Зареєструватися
                        </button>
                    </form>

                    <div className="flex items-center my-5 md:my-6 bg-white/40 p-1 rounded-full backdrop-blur-sm">
                        <div className="flex-grow border-t border-gray-400/50"></div>
                        <span className="px-4 text-sm md:text-base font-['El_Messiri'] text-gray-600 font-bold">або</span>
                        <div className="flex-grow border-t border-gray-400/50"></div>
                    </div>

                    <div className="space-y-3">
{/*                         <FacebookLogin appId={import.meta.env.VITE_FACEBOOK_APP_ID} onSuccess={handleFacebookSuccess} render={({ onClick }) => ( */}
{/*                             <button type="button" onClick={onClick} className="w-full flex items-center justify-center gap-2 sm:gap-3 border border-gray-300 rounded-full py-2.5 hover:bg-gray-50 transition text-sm sm:text-base font-medium text-gray-700 bg-white shadow-sm"> */}
{/*                                 <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> */}
{/*                                 <span className="truncate font-['El_Messiri']">Зареєструватися через Facebook</span> */}
{/*                             </button> */}
{/*                         )} /> */}
                        <button type="button" onClick={() => handleGoogleLogin()} className="w-full flex items-center justify-center gap-2 sm:gap-3 border border-gray-300 rounded-full py-2.5 hover:bg-gray-50 transition text-sm sm:text-base font-medium text-gray-700 hover:border-[#FBBC05] bg-white shadow-sm">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/><path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"/><path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.545 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
                            <span className="truncate font-['El_Messiri']">Зареєструватися через Google</span>
                        </button>
                    </div>

                    <div className="mt-8 text-center text-sm md:text-base font-['El_Messiri'] text-gray-800 font-medium">
                        Вже маєте акаунт? <Link to="/login" className="text-blue-600 hover:text-[#42705D] hover:underline font-bold ml-1 transition">Увійти</Link>
                    </div>
                </div>

                {/* --- АДАПТИВНЕ МОДАЛЬНЕ ВІКНО --- */}
                {showTerms && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left">
                        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto relative shadow-2xl font-['Inter']">
                            <button onClick={() => setShowTerms(false)} className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-[#1A1A1A] transition bg-gray-100 rounded-full p-1 md:bg-transparent md:p-0">
                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                            <h2 className="text-xl md:text-2xl font-['El_Messiri'] font-bold mb-4 md:mb-6 text-[#1A1A1A] pr-8">Умови використання LITE cook</h2>
                            <div className="space-y-3 md:space-y-4 text-sm md:text-base text-gray-600 font-['El_Messiri'] leading-relaxed">
                                <p><strong className="text-gray-800">1. Загальні положення</strong><br/>Реєструючись у додатку LITE cook, ви погоджуєтесь із цими умовами. Додаток створений для пошуку рецептів та планування меню.</p>
                                <p><strong className="text-gray-800">2. Обліковий запис</strong><br/>Ви несете відповідальність за збереження конфіденційності вашого пароля. Один користувач може мати лише один обліковий запис.</p>
                                <p><strong className="text-gray-800">3. Інформація про здоров'я та алергії</strong><br/>Рецепти та розрахунок калорій надаються виключно в ознайомчих цілях. LITE cook не несе відповідальності за можливі алергічні реакції або наслідки дієт. Перед зміною раціону проконсультуйтеся з лікарем.</p>
                                <p><strong className="text-gray-800">4. Використання контенту</strong><br/>Усі рецепти, фотографії та тексти є власністю проєкту. Забороняється їх комерційне копіювання без дозволу.</p>
                                <p><strong className="text-gray-800">5. Зміни до умов</strong><br/>Ми залишаємо за собою право оновлювати ці умови. Зміни набувають чинності з моменту їх публікації в додатку.</p>
                            </div>
                            <div className="mt-6 md:mt-8 flex justify-end">
                                <button onClick={() => { setShowTerms(false); setAgreed(true); }} className="w-full md:w-auto bg-[#1A1A1A] text-white font-medium font-['El_Messiri'] px-8 py-3 rounded-full hover:bg-gray-800 transition shadow-md text-sm md:text-base">
                                    Зрозуміло, погоджуюсь
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;