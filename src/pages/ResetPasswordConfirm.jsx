import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
            // ТЕПЕР МИ ЧИТАЄМО ТОЧНУ ВІДПОВІДЬ ВІД DJANGO
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                console.error("Деталі від сервера:", errorData); // Виводимо в консоль для дебагу

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
        <div className="w-full min-h-[calc(100vh-155px)] flex justify-center md:justify-end items-center p-6 md:pr-32 relative" style={{ backgroundImage: `url(${authBg})`, backgroundSize: 'cover', backgroundPosition: 'center bottom' }}>
            <div className="bg-white rounded-[2rem] p-10 w-full max-w-md shadow-2xl relative z-10 font-['Inter']">

                <h1 className="text-3xl font-['El_Messiri'] font-bold mb-6 text-[#1A1A1A] text-center md:text-left">
                    Новий пароль
                </h1>

                {message && <div className="text-green-700 bg-green-50 p-3 rounded-lg text-[13px] mb-4 font-medium border border-green-200">{message}</div>}
                {error && <div className="text-red-600 bg-red-50 p-3 rounded-lg text-[13px] mb-4 font-medium border border-red-200">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-800 mb-1 ml-4">Новий пароль</label>
                        <input type="password" name="new_password1" value={passwords.new_password1} onChange={handleChange} required placeholder="Введіть новий пароль" className="w-full px-5 py-3.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#42705D] transition text-sm text-gray-700" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-800 mb-1 ml-4">Підтвердження пароля</label>
                        <input type="password" name="new_password2" value={passwords.new_password2} onChange={handleChange} required placeholder="Повторіть новий пароль" className="w-full px-5 py-3.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#42705D] transition text-sm text-gray-700" />
                    </div>

                    <button type="submit" className="w-full bg-[#1A1A1A] text-white font-medium rounded-full py-3.5 hover:bg-gray-800 transition shadow-md mt-2">
                        Зберегти пароль
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordConfirm;