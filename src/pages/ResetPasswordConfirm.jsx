import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import authBg from '../assets/auth-bg.jpg';

const ResetPasswordConfirm = () => {
    // Дістаємо унікальні ключі з посилання в листі
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

            {/* Стилізована кнопка "Назад" */}
            <Link to="/login" className="absolute top-6 left-4 sm:left-6 md:top-10 md:left-10 flex items-center px-4 md:px-5 py-2.5 bg-[#1A1A1A] text-white rounded-full hover:bg-gray-800 transition font-['Inter'] font-medium text-xs md:text-sm shadow-lg z-20">
                <svg className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Назад
            </Link>

            {/* Контейнер для правого блоку */}
            <div className="flex flex-col items-center w-full max-w-[700px] z-10 pt-6 md:pt-0">

                {/* Напис L I T E cook */}
                <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-[80px] font-['El_Messiri'] text-[#1A1A1A] mb-8 md:mb-12 tracking-wide lg:tracking-[0.15em] whitespace-nowrap w-max pl-[0.05em] lg:pl-[0.15em] drop-shadow-sm text-center">
                    L I T E &nbsp; c o o k
                </div>

                <div className="bg-transparent shadow-none p-2 sm:p-4 md:p-0 w-full max-w-md font-['Inter'] mx-auto">

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
                            <label className="inline-block text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 mb-1 ml-4 bg-white/70 px-1 rounded backdrop-blur-sm">Новий пароль</label>
                            <input
                                type="password"
                                name="new_password1"
                                value={passwords.new_password1}
                                onChange={handleChange}
                                required
                                placeholder="Введіть новий пароль"
                                className="w-full px-5 font-['El_Messiri'] py-3 md:py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#42705D] transition text-base md:text-lg text-gray-700 bg-white shadow-sm focus:shadow-md"
                            />
                        </div>
                        <div>
                            <label className="inline-block text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 mb-1 ml-4 bg-white/70 px-1 rounded backdrop-blur-sm">Підтвердження пароля</label>
                            <input
                                type="password"
                                name="new_password2"
                                value={passwords.new_password2}
                                onChange={handleChange}
                                required
                                placeholder="Повторіть новий пароль"
                                className="w-full px-5 font-['El_Messiri'] py-3 md:py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#42705D] transition text-base md:text-lg text-gray-700 bg-white shadow-sm focus:shadow-md"
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