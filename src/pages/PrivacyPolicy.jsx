import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();
    const [isAccepted, setIsAccepted] = useState(false);

    // Прокрутка вгору при відкритті сторінки та перевірка чи політика вже прийнята
    useEffect(() => {
        window.scrollTo(0, 0);
        if (localStorage.getItem('litecook_privacy_accepted')) {
            setIsAccepted(true);
        }
    }, []);

    // Функція прийняття політики
    const handleAcceptPolicy = () => {
        localStorage.setItem('litecook_privacy_accepted', 'true');
        setIsAccepted(true);
        navigate('/'); // Перенаправляємо на головну після прийняття
    };

    return (
        <div className="w-full min-h-screen bg-[#F6F3F4] text-[#1A1A1A] font-['Inter'] flex flex-col items-center py-10 px-6 sm:px-10 lg:px-20 relative overflow-hidden">

            {/* Контейнер контенту */}
            <div className="w-full max-w-6xl relative z-10">

                {/* Верхня частина з датою */}
                <div className="w-full flex justify-end mb-6 md:mb-10">
                    <span className="font-['Inter'] text-gray-800 text-sm md:text-base tracking-wide">
                        Останнє оновлення: 05.04.2026
                    </span>
                </div>

                {/* Заголовок і Головне зображення */}
                <div className="w-full flex flex-col md:flex-row items-center justify-between mb-16 md:mb-24 gap-10">
                    <div className="md:w-1/2 text-center md:text-left">
                        <h1 className="text-5xl sm:text-6xl lg:text-[75px] font-['El_Messiri'] text-[#1A1A1A] leading-[1.1] mb-4">
                            LITE cook:<br/>Піклуємося<br/>про ваші дані
                        </h1>
                    </div>

                    <div className="md:w-1/2 flex justify-center md:justify-end">
                        {/* ЗАГЛУШКА ДЛЯ ЗОБРАЖЕННЯ КУХАРЯ */}
                        <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[380px] lg:h-[380px] flex items-center justify-center">
                            <div className="absolute inset-0 bg-[#DCE8D9] rounded-full scale-90"></div>
                            <div className="relative z-10 w-full h-full border-2 border-dashed border-[#42705D] rounded-full flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm">
                                <span className="text-[#42705D] font-['Inter'] text-center px-4">Місце для зображення кухаря</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Сітка з картками */}
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mb-16 lg:mb-20 font-['Inter']">

                    {/* Картка 1: Збір даних */}
                    <Link to="/privacy/data" className="bg-transparent border border-gray-500 rounded-[2rem] p-8 flex flex-col items-center text-center hover:bg-white transition-all duration-300 group">
                        <div className="mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                            {/* Іконка без фонового кола */}
                            <span className="text-6xl text-center">🍪</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-gray-900">Збір даних</h3>
                        <p className="text-gray-900 text-lg leading-snug">Нам потрібен ваш Email та<br/>ім’я, щоб зберігати рецепти</p>
                    </Link>

                    {/* Картка 2: Використання */}
                    <Link to="/privacy/usage" className="bg-transparent border border-gray-500 rounded-[2rem] p-8 flex flex-col items-center text-center hover:bg-white transition-all duration-300 group">
                        <div className="mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-6xl text-center">🥄</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-gray-900">Використання</h3>
                        <p className="text-gray-900 text-lg leading-snug">Щоб покращувати сервіс<br/>та надсилати новини</p>
                    </Link>

                    {/* Картка 3: Куки */}
                    <Link to="/privacy/cookies" className="bg-transparent border border-gray-500 rounded-[2rem] p-8 flex flex-col items-center text-center hover:bg-white transition-all duration-300 group">
                        <div className="mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-6xl text-center">💻</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-gray-900">Куки(Cookies)</h3>
                        <p className="text-gray-900 text-lg leading-snug">Наші “печива” лише для<br/>технічної роботи сайту</p>
                    </Link>

                    {/* Картка 4: Контроль */}
                    <Link to="/privacy/control" className="bg-transparent border border-gray-500 rounded-[2rem] p-8 flex flex-col items-center text-center hover:bg-white transition-all duration-300 group">
                        <div className="mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-6xl text-center">⚙️</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-gray-900">Контроль</h3>
                        <p className="text-gray-900 text-lg leading-snug">Ви можете видалити<br/>акаунт будь коли</p>
                    </Link>

                </div>

                {/* СУЧАСНІ КНОПКИ З ЧІТКОЮ ІЄРАРХІЄЮ */}
                <div className="flex flex-col sm:flex-row gap-5 mb-10 w-full justify-center">
                    {/* Другорядна дія (Secondary) - Outline стиль */}
                    <Link
                        to="/privacy/full"
                        className="px-8 py-3.5 border-2 border-[#1A1A1A] text-[#1A1A1A] rounded-full font-['El_Messiri'] text-xl text-center hover:bg-[#1A1A1A] hover:text-white transition-all w-full sm:w-auto min-w-[240px]"
                    >
                        Переглянути повністю
                    </Link>

                    {/* Головна дія (Primary) - Акцентна */}
                    {!isAccepted ? (
                        <button
                            onClick={handleAcceptPolicy}
                            className="px-8 py-3.5 bg-[#42705D] text-white border-2 border-[#42705D] rounded-full font-['El_Messiri'] text-xl text-center shadow-md hover:bg-[#2B4B3C] hover:border-[#2B4B3C] hover:shadow-lg transition-all w-full sm:w-auto min-w-[240px]"
                        >
                            Прийняти політику
                        </button>
                    ) : (
                        <div className="px-8 py-3.5 bg-gray-200 text-gray-600 border-2 border-gray-200 rounded-full font-['El_Messiri'] text-xl text-center w-full sm:w-auto min-w-[240px] flex items-center justify-center gap-2 cursor-default">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                            Вже прийнято
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default PrivacyPolicy;