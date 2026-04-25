import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // ІМПОРТ ПЕРЕКЛАДУ

// Імпорт зображень
import imgChef from '../assets/privacy/Cook.png';
import imgData from '../assets/privacy/Data_collection.png';
import imgUsage from '../assets/privacy/Using.png';
import imgCookies from '../assets/privacy/Cookies.png';
import imgControl from '../assets/privacy/Control.png';
import bgPrivacy from '../assets/privacy/fon_privacy.jpg';

const PrivacyPolicy = () => {
    const { t } = useTranslation(); // ІНІЦІАЛІЗАЦІЯ ПЕРЕКЛАДУ
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
        <div
            className="w-full min-h-screen text-[#1A1A1A] font-['Inter'] flex flex-col items-center py-10 px-6 sm:px-10 lg:px-20 relative overflow-hidden bg-cover bg-center "
            style={{ backgroundImage: `url(${bgPrivacy})` }}
        >
            {/* Контейнер контенту */}
            <div className="w-full max-w-6xl relative z-10">

                {/* Верхня частина з датою */}
                <div className="w-full flex justify-end mb-6 md:mb-10">
                    <span className="font-['Inter'] text-gray-800 text-sm md:text-base tracking-wide">
                        {t('privacy_page.last_update')} 05.04.2026
                    </span>
                </div>

                {/* Заголовок і Головне зображення */}
                <div className="w-full flex flex-col md:flex-row items-center justify-between mb-16 md:mb-24 gap-10">
                    <div className="md:w-1/2 text-center md:text-left">
                        <h1 className="text-5xl sm:text-6xl lg:text-[75px] font-['El_Messiri'] text-[#1A1A1A] leading-[1.1] mb-4">
                            {t('privacy_page.hero_title_1')}<br/>{t('privacy_page.hero_title_2')}<br/>{t('privacy_page.hero_title_3')}
                        </h1>
                    </div>

                    <div className="md:w-1/2 flex justify-center md:justify-end">
                        {/* ЗОБРАЖЕННЯ КУХАРЯ */}
                        <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[380px] lg:h-[380px] flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full scale-90"></div>
                            <img
                                src={imgChef}
                                alt="Кухар LITE cook"
                                className="relative z-10 w-full h-full object-contain"
                            />
                        </div>
                    </div>
                </div>

                {/* Сітка з картками */}
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mb-16 lg:mb-20 font-['Inter']">

                    {/* Картка 1: Збір даних */}
                    <Link to="/privacy/data" className="bg-gradient-to-br from-white/95 to-[#E8EFE6]/90 backdrop-blur-md border-[1.5px] border-white/50 rounded-[2.5rem] p-8 sm:p-10 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-md cursor-pointer ease-out active:scale-95 group">
                        <div className="mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <img src={imgData} alt="Іконка" className="h-26 sm:h-30 w-auto object-contain" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-gray-900">{t('privacy_page.card_1_title')}</h3>
                        <p className="text-gray-800 text-lg leading-snug">{t('privacy_page.card_1_desc_1')}<br/>{t('privacy_page.card_1_desc_2')}</p>
                    </Link>

                    {/* Картка 2: Використання */}
                    <Link to="/privacy/usage" className="bg-gradient-to-br from-white/95 to-[#E8EFE6]/90 backdrop-blur-md border-[1.5px] border-white/50 rounded-[2.5rem] p-8 sm:p-10 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group shadow-md cursor-pointer ease-out active:scale-95 group">
                        <div className="mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <img src={imgUsage} alt="Іконка" className="h-26 sm:h-30 w-auto object-contain" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-gray-900">{t('privacy_page.card_2_title')}</h3>
                        <p className="text-gray-800 text-lg leading-snug">{t('privacy_page.card_2_desc_1')}<br/>{t('privacy_page.card_2_desc_2')}</p>
                    </Link>

                    {/* Картка 3: Куки */}
                    <Link to="/privacy/cookies" className="bg-gradient-to-br from-white/95 to-[#E8EFE6]/90 backdrop-blur-md border-[1.5px] border-white/50 rounded-[2.5rem] p-8 sm:p-10 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group shadow-md cursor-pointer ease-out active:scale-95 group">
                        <div className="mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <img src={imgCookies} alt="Іконка" className="h-26 sm:h-30 w-auto object-contain" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-gray-900">{t('privacy_page.card_3_title')}</h3>
                        <p className="text-gray-800 text-lg leading-snug">{t('privacy_page.card_3_desc_1')}<br/>{t('privacy_page.card_3_desc_2')}</p>
                    </Link>

                    {/* Картка 4: Контроль */}
                    <Link to="/privacy/control" className="bg-gradient-to-br from-white/95 to-[#E8EFE6]/90 backdrop-blur-md border-[1.5px] border-white/50 rounded-[2.5rem] p-8 sm:p-10 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group shadow-md cursor-pointer ease-out active:scale-95 group">
                        <div className="mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <img src={imgControl} alt="Іконка" className="h-26 sm:h-30 w-auto object-contain" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-gray-900">{t('privacy_page.card_4_title')}</h3>
                        <p className="text-gray-800 text-lg leading-snug">{t('privacy_page.card_4_desc_1')}<br/>{t('privacy_page.card_4_desc_2')}</p>
                    </Link>

                </div>

                {/* СУЧАСНІ КНОПКИ З ЧІТКОЮ ІЄРАРХІЄЮ */}
                <div className="flex flex-col sm:flex-row gap-5 mb-10 w-full justify-center">
                    {/* Другорядна дія (Secondary) - ЗМІНЕНО на градієнт */}
                    <Link
                        to="/privacy/full"
                        className="px-8 py-3.5 bg-gradient-to-r from-white to-[#E8EFE6] text-[#1A1A1A] border border-white/60 shadow-md rounded-full font-['El_Messiri'] text-xl text-center hover:shadow-lg hover:from-[#E8EFE6] hover:to-[#DCE8D9] transition-all w-full sm:w-auto min-w-[240px] cursor-pointer duration-300 ease-out active:scale-95 group"
                    >
                        {t('privacy_page.view_full_btn')}
                    </Link>

                    {/* Головна дія (Primary) - ЗМІНЕНО на градієнт */}
                    {!isAccepted ? (
                        <button
                            onClick={handleAcceptPolicy}
                            className="px-8 py-3.5 bg-gradient-to-r from-[#42705D] to-[#5B826B] text-white rounded-full font-['El_Messiri'] text-xl text-center shadow-md hover:from-[#2B4B3C] hover:to-[#42705D] hover:shadow-lg transition-all w-full sm:w-auto min-w-[240px] cursor-pointer duration-300 ease-out active:scale-95 group"
                        >
                            {t('privacy_page.accept_btn')}
                        </button>
                    ) : (
                        <div className="px-8 py-3.5 bg-white/60 backdrop-blur-sm text-gray-700 border border-white/50 rounded-full font-['El_Messiri'] text-xl text-center shadow-sm w-full sm:w-auto min-w-[240px] flex items-center justify-center gap-2 cursor-default">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                            {t('privacy_page.already_accepted')}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default PrivacyPolicy;