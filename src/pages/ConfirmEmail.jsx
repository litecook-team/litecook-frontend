import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const ConfirmEmail = () => {
    const { t } = useTranslation();
    const { key } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                // Відправляємо ключ на бекенд
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/registration/verify-email/`, { key });

                // === МАГІЯ АВТОВХОДУ ===
                // Якщо бекенд повернув токени, зберігаємо їх (користувач стає авторизованим)
                if (response.data.access) {
                    localStorage.setItem('access_token', response.data.access);
                    if (response.data.refresh) {
                        localStorage.setItem('refresh_token', response.data.refresh);
                    }
                }

                setStatus('success');

                // Плавний UX: через 3 секунди автоматично перекидаємо на головну сторінку
                setTimeout(() => {
                    navigate('/');
                }, 3000);

            } catch (error) {
                setStatus('error');
            }
        };
        if (key) verifyEmail();
    }, [key, navigate]);

    return (
        // Зменшив зовнішні відступи на мобілках (p-4), на планшетах і вище (sm:p-6)
        <div className="min-h-[calc(100vh-80px)] bg-[#f9fafb] flex items-center justify-center p-4 sm:p-6">
            {/* Зменшив внутрішні відступи на мобілках (p-6) та закруглив кути ще гарніше */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-10 w-full max-w-md shadow-2xl text-center border border-gray-100">

                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <svg className="animate-spin h-10 w-10 text-[#42705D] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {/* Адаптивний текст: text-xl на мобілці, text-2xl на ПК */}
                        <h2 className="text-xl sm:text-2xl font-serif text-gray-800 animate-pulse">
                            {t('confirm_email_page.loading_text')}
                        </h2>
                    </div>
                )}

                {status === 'success' && (
                    <div className="animate-[fadeIn_0.5s_ease-in-out]">
                        {/* Адаптивна іконка */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        {/* Адаптивний текст */}
                        <h2 className="text-2xl sm:text-3xl font-serif text-gray-900 mb-2 sm:mb-4">
                            {t('confirm_email_page.success_title')}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-500 mb-6">
                            {t('confirm_email_page.success_desc')}
                        </p>

                        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-400 mb-6 animate-pulse">
                            <svg className="animate-spin h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {/* Тимчасовий переклад. Якщо ключа redirecting немає в JSON, покаже 'Перенаправляємо...' */}
                            <span>{t('confirm_email_page.redirecting', 'Перенаправляємо...')}</span>
                        </div>

                        {/* Кнопка на всю ширину (w-full) на мобілці, і по контенту (sm:w-auto) на ПК */}
                        <button
                            onClick={() => navigate('/')}
                            className="w-full sm:w-auto inline-block bg-[#1A1A1A] text-white px-8 sm:px-10 py-3 rounded-full hover:bg-[#42705D] transition-all duration-300 ease-out active:scale-95 font-medium cursor-pointer"
                        >
                            {t('header.home')}
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="animate-[fadeIn_0.5s_ease-in-out]">
                        {/* Адаптивна іконка */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                        {/* Адаптивний текст */}
                        <h2 className="text-2xl sm:text-3xl font-serif text-gray-900 mb-2 sm:mb-4">
                            {t('confirm_email_page.error_title')}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">
                            {t('confirm_email_page.error_desc')}
                        </p>
                        {/* Кнопка на всю ширину (w-full) на мобілці */}
                        <Link
                            to="/login"
                            className="w-full sm:w-auto inline-block bg-[#1A1A1A] text-white px-8 sm:px-10 py-3 rounded-full hover:bg-[#42705D] transition-all duration-300 ease-out active:scale-95 font-medium cursor-pointer"
                        >
                            {t('confirm_email_page.go_to_login_btn')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConfirmEmail;