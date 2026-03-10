import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ConfirmEmail = () => {
    // Беремо унікальний ключ з URL-адреси
    const { key } = useParams();
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                // Відправляємо ключ на бекенд для підтвердження
                await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/registration/verify-email/`, { key });
                setStatus('success');
            } catch (error) {
                setStatus('error');
            }
        };
        if (key) verifyEmail();
    }, [key]);

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#f9fafb] flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl text-center border border-gray-100">

                {status === 'loading' && (
                    <h2 className="text-2xl font-serif text-gray-800 mb-4 animate-pulse">Підтвердження...</h2>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-3xl font-serif text-gray-900 mb-4">Пошту підтверджено!</h2>
                        <p className="text-gray-500 mb-8">Дякуємо! Тепер ви можете увійти до свого акаунту LITE cook.</p>
                        <Link to="/login" className="inline-block bg-black text-white px-10 py-3 rounded-full hover:bg-gray-800 transition font-medium">
                            Увійти
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </div>
                        <h2 className="text-3xl font-serif text-gray-900 mb-4">Помилка</h2>
                        <p className="text-gray-500 mb-8">Можливо, посилання застаріло або вашу пошту вже було підтверджено раніше.</p>
                        <Link to="/login" className="inline-block bg-black text-white px-10 py-3 rounded-full hover:bg-gray-800 transition font-medium">
                            Перейти до входу
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default ConfirmEmail;