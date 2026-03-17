import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import authBg from '../assets/auth/exit.jpg';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/password/reset/`, { email });
            setMessage('Інструкцію з відновлення пароля відправлено на вашу пошту. Будь ласка, перевірте скриньку.');
            setEmail('');
        } catch (err) {
            setError('Сталася помилка. Перевірте, чи правильно введена електронна пошта, і чи існує такий акаунт.');
        }
    };

    return (
        <div className="flex-grow w-full flex justify-center md:justify-end items-center p-4 py-16 sm:p-6 md:py-24 md:pr-10 lg:pr-24 xl:pr-32 relative bg-[#f9fafb] bg-[position:-50px_center] md:bg-left bg-cover bg-no-repeat"
             style={{ backgroundImage: `url(${authBg})` }}>

            <Link to="/login" className="absolute top-6 left-4 sm:left-6 md:top-10 md:left-10 flex items-center px-4 md:px-5 py-2.5 bg-[#1A1A1A] text-white rounded-full hover:bg-gray-800 transition font-['Inter'] font-medium text-xs md:text-sm shadow-lg z-20">
                <svg className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Назад
            </Link>

            <div className="flex flex-col items-center w-full max-w-[700px] z-10 pt-6 md:pt-0">

                <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-[80px] font-['El_Messiri'] text-[#1A1A1A] mb-8 md:mb-12 tracking-wide lg:tracking-[0.15em] whitespace-nowrap w-max pl-[0.05em] lg:pl-[0.15em] drop-shadow-sm text-center">
                    L I T E &nbsp; c o o k
                </div>

                <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-[2rem] p-6 sm:p-10 w-full max-w-[520px] font-['Inter'] mx-auto">

                    <h1 className="text-2xl md:text-3xl font-['El_Messiri'] font-bold mb-6 text-[#1A1A1A] text-center md:text-left">
                        Відновлення пароля
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
                            <label className="inline-block text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 mb-1 ml-4">Електронна пошта</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Введіть електронну пошту"
                                className="w-full px-5 font-['El_Messiri'] py-3 md:py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#42705D] transition text-base md:text-lg text-gray-700 bg-white"
                            />
                        </div>

                        <button type="submit" className="w-full bg-[#1A1A1A] text-white font-['El_Messiri'] font-medium rounded-full py-3 md:py-2.5 hover:bg-gray-800 transition mt-4 text-base md:text-lg shadow-md">
                            Відправити посилання
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm sm:text-base font-['El_Messiri'] text-gray-800 font-medium">
                        Згадали пароль? <Link to="/login" className="text-blue-600 hover:text-[#42705D] hover:underline font-bold ml-1 transition">Увійти</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;