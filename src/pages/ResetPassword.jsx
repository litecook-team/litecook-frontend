import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import authBg from '../assets/auth-bg.jpg';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            // Звертаємося до стандартного шляху dj-rest-auth для скидання пароля
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/password/reset/`, { email });
            setMessage('Інструкції з відновлення пароля відправлені на вашу пошту. Будь ласка, перевірте скриньку.');
            setEmail('');
        } catch (err) {
            setError('Сталася помилка. Перевірте, чи правильно введена електронна пошта, і чи існує такий акаунт.');
        }
    };

    return (
<div className="w-full min-h-[calc(100vh-155px)] flex justify-center md:justify-end items-center p-6 md:pr-32 relative"
             style={{
                 backgroundImage: `url(${authBg})`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center center'
             }}>

            <div className="bg-white rounded-[2rem] p-10 w-full max-w-md shadow-2xl relative z-10 font-['Inter']">

                <h1 className="text-3xl font-['El_Messiri'] font-bold mb-6 text-[#1A1A1A] text-center md:text-left">
                    Відновлення пароля
                </h1>

                {message && <div className="text-green-700 bg-green-50 p-3 rounded-lg text-[13px] mb-4 font-medium border border-green-200">{message}</div>}
                {error && <div className="text-red-600 bg-red-50 p-3 rounded-lg text-[13px] mb-4 font-medium border border-red-200">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-gray-800 mb-1 ml-4">Електронна пошта</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Введіть електронну пошту"
                            className="w-full px-5 py-3.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#42705D] transition text-sm text-gray-700"
                        />
                    </div>

                    <button type="submit" className="w-full bg-[#1A1A1A] text-white font-medium rounded-full py-3.5 hover:bg-gray-800 transition shadow-md mt-2">
                        Відправити посилання
                    </button>
                </form>

                <div className="mt-8 text-center text-[13px] text-gray-600">
                    Згадали пароль? <Link to="/login" className="text-blue-600 hover:text-[#42705D] hover:underline font-semibold ml-1 transition">Увійти</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;