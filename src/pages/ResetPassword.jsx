import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // ІМПОРТ ПЕРЕКЛАДУ
import authBg from '../assets/auth/exit.jpg';

const ResetPassword = () => {
    const { t } = useTranslation(); // ІНІЦІАЛІЗАЦІЯ ПЕРЕКЛАДУ

    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Використовуємо надійну валідацію, що і при реєстрації
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return t('forgot_password_page.error_email_format');
        }

        const domain = email.split('@')[1].toLowerCase();

        const ruDomains = ['.ru', '.su', '.рф', 'yandex', 'mail.ru', 'bk.ru', 'inbox.ru', 'list.ru'];
        const isRuDomain = ruDomains.some(ru => domain.endsWith(ru) || domain.includes(ru));
        if (isRuDomain) {
            return t('forgot_password_page.error_email_ru');
        }

        const blockedTypos = ['gmail.co', 'gmail.c', 'gmai.com', 'gmal.com', 'ukr.ne', 'yahoo.c', 'yaho.com'];
        if (blockedTypos.includes(domain)) {
            return t('forgot_password_page.error_email_typo');
        }

        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        // 1. Валідація на фронтенді
        const emailError = validateEmail(email);
        if (emailError) {
            setError(emailError);
            return;
        }

        try {
            // Якщо бекенд знаходить пошту і все добре, він має повернути успішну відповідь
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/password/reset/`, { email });
            setMessage(t('forgot_password_page.success_msg'));
            setEmail('');
        } catch (err) {
            // 2. Обробка помилок від бекенда (бекенд повертає 400 з текстом)
            let errorMsg = t('forgot_password_page.error_server');

            if (err.response && err.response.data) {
                const data = err.response.data;

                // Бекенд тепер викидає ValidationError для 'email'
                if (data.email) {
                    // drf повертає помилки у вигляді масиву: {"email": ["текст помилки"]}
                    errorMsg = Array.isArray(data.email) ? data.email[0] : data.email;
                } else if (data.detail) {
                    errorMsg = data.detail;
                } else if (typeof data === 'string') {
                    errorMsg = data;
                }
            }

            setError(errorMsg);
        }
    };

    return (
        <div className="flex-grow w-full flex justify-center md:justify-end items-center p-4 py-16 sm:p-6 md:py-24 md:pr-10 lg:pr-24 xl:pr-32 relative bg-[#f9fafb] bg-[position:-50px_center] md:bg-left bg-cover bg-no-repeat"
             style={{ backgroundImage: `url(${authBg})` }}>

            <Link
                to="/login"
                className="absolute top-6 left-4 sm:left-6 md:top-10 md:left-10 flex items-center px-6 sm:px-10 py-2 bg-white text-gray-800 rounded-[30px] border border-black hover:bg-[#1A1A1A] hover:text-white hover:border-transparent hover:shadow-md transition font-['Inter'] font-medium text-[13px] sm:text-[14px] lg:text-[15px] shadow-lg z-20 gap-2 cursor-pointer transition-all duration-300 ease-out active:scale-95 group"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 8 8 12 12 16"></polyline>
                    <line x1="16" y1="12" x2="8" y2="12"></line>
                </svg>
                {t('forgot_password_page.back_btn')}
            </Link>

            <div className="flex flex-col items-center w-full max-w-[700px] z-10 pt-6 md:pt-0">

                <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-[80px] font-['El_Messiri'] text-[#1A1A1A] mb-8 md:mb-12 tracking-wide lg:tracking-[0.15em] whitespace-nowrap w-max pl-[0.05em] lg:pl-[0.15em] drop-shadow-sm text-center">
                    L I T E &nbsp; c o o k
                </div>

                <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-[2rem] p-6 sm:p-10 w-full max-w-[520px] font-['Inter'] mx-auto">

                    <h1 className="text-2xl md:text-3xl font-['El_Messiri'] font-bold mb-6 text-[#1A1A1A] text-center md:text-left">
                        {t('forgot_password_page.title')}
                    </h1>

                    {message && (
                        <div className="text-xs md:text-[13px] mb-4 p-3 rounded-lg font-medium border bg-white/90 backdrop-blur-sm shadow-sm inline-block text-green-700 border-green-200">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="text-xs md:text-[13px] mb-4 p-3 rounded-lg font-medium border bg-white/90 backdrop-blur-sm shadow-sm inline-block text-red-600 border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="inline-block text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 mb-1 ml-4">{t('forgot_password_page.subtitle')}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder={t('forgot_password_page.email_placeholder')}
                                className="w-full px-5 font-['El_Messiri'] py-3 md:py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#42705D] transition text-base md:text-lg text-gray-700 bg-white"
                            />
                        </div>

                        <button type="submit" className="w-full bg-[#1A1A1A] text-white font-['El_Messiri'] font-medium rounded-full py-3 md:py-2.5 hover:bg-gray-800 transition mt-4 text-base md:text-lg shadow-md cursor-pointer transition-all duration-300 ease-out active:scale-95 group">
                            {t('forgot_password_page.submit_btn')}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm sm:text-base font-['El_Messiri'] text-gray-800 font-medium">
                        {t('forgot_password_page.remembered_password')} <Link to="/login" className="text-blue-600 hover:text-[#42705D] hover:underline font-bold ml-1 transition">{t('forgot_password_page.login_link')}</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;