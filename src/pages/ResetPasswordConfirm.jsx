import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import authBg from '../assets/auth/exit.jpg';

const ResetPasswordConfirm = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();

    const [passwords, setPasswords] = useState({ new_password1: '', new_password2: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (passwords.new_password1 !== passwords.new_password2) {
            setError('Паролі не співпадають');
            return;
        }

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/password/reset/confirm/`, {
                uid: uid,
                token: token,
                new_password1: passwords.new_password1,
                new_password2: passwords.new_password2,
            });
            setMessage('Пароль успішно змінено! Перенаправляємо на сторінку входу...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                console.error("Деталі від сервера:", errorData);

                if (errorData.new_password1) {
                    setError(`Помилка пароля: ${errorData.new_password1[0]}`);
                } else if (errorData.non_field_errors) {
                    setError(`Помилка: ${errorData.non_field_errors[0]}`);
                } else if (errorData.uid || errorData.token) {
                    setError('Недійсне або застаріле посилання. Надішліть запит на відновлення ще раз.');
                } else {
                    setError('Невідома помилка перевірки даних.');
                }
            } else {
                setError('Помилка з\'єднання з сервером.');
            }
        }
    };

    return (
        <div className="flex-grow w-full flex justify-center md:justify-end items-center p-4 py-16 sm:p-6 md:py-24 md:pr-10 lg:pr-24 xl:pr-32 relative bg-[#f9fafb] bg-[position:-50px_center] md:bg-left bg-cover bg-no-repeat"
             style={{ backgroundImage: `url(${authBg})` }}>

            <Link
                to="/login"
                className="absolute top-6 left-4 sm:left-6 md:top-10 md:left-10 flex items-center px-6 sm:px-10 py-2 bg-white text-gray-800 rounded-[30px] border border-black hover:shadow-md transition font-['Inter'] font-medium text-[13px] sm:text-[14px] lg:text-[15px] shadow-lg z-20 gap-2"
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

                    <h1 className="text-3xl md:text-3xl font-['El_Messiri'] font-black mb-6 md:mb-8 text-[#1A1A1A] text-center md:text-left drop-shadow-sm">
                        Новий пароль
                    </h1>

                    {message && (
                        <div className="text-xs md:text-[13px] mb-4 p-3 rounded-xl font-medium border bg-white/90 backdrop-blur-sm shadow-sm inline-block text-green-700 border-green-200">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="text-xs md:text-[13px] mb-4 p-3 rounded-xl font-medium border bg-white/90 backdrop-blur-sm shadow-sm inline-block text-red-600 border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="inline-block text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 mb-1 ml-4">Новий пароль</label>
                            <input
                                type="password"
                                name="new_password1"
                                value={passwords.new_password1}
                                onChange={handleChange}
                                required
                                placeholder="Введіть новий пароль"
                                className="w-full px-5 font-['El_Messiri'] py-3 md:py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#42705D] transition text-base md:text-lg text-gray-700 bg-white"
                            />
                        </div>
                        <div>
                            <label className="inline-block text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 mb-1 ml-4">Підтвердження пароля</label>
                            <input
                                type="password"
                                name="new_password2"
                                value={passwords.new_password2}
                                onChange={handleChange}
                                required
                                placeholder="Повторіть новий пароль"
                                className="w-full px-5 font-['El_Messiri'] py-3 md:py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#42705D] transition text-base md:text-lg text-gray-700 bg-white"
                            />
                        </div>

                        <button type="submit" className="w-full bg-[#1A1A1A] text-white font-['El_Messiri'] font-medium rounded-full py-3 md:py-2.5 hover:bg-gray-800 transition mt-6 text-base md:text-lg shadow-md">
                            Зберегти пароль
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordConfirm;