import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // ІМПОРТ ПЕРЕКЛАДУ

// Імпортуємо зображення авокадо
import avocadoImg from '../assets/notFound/avokado_not_found.png';
import avocadoAvatar from '../assets/global/avokado_avatar.png';

const NotFound = () => {
    const { t } = useTranslation(); // ІНІЦІАЛІЗАЦІЯ ПЕРЕКЛАДУ

    // Прокрутка вгору при завантаженні сторінки
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="w-full flex-grow bg-[#F6F3F4] flex flex-col relative overflow-hidden">
            {/* Головний контейнер контенту */}
            <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-12 lg:px-20 flex-grow flex flex-col md:grid md:grid-cols-2 md:items-center relative z-10 pt-10 md:pt-16 pb-10 md:pb-0 gap-6 md:gap-0">

                {/* ============================== */}
                {/* 1. ТЕКСТОВИЙ БЛОК (Верх на мобільному, Зліва-верх на ПК) */}
                {/* ============================== */}
                <div className="w-full flex flex-col items-center text-center md:items-start md:text-left z-20 order-1">

                    {/* ВЕРХНІЙ ТЕКСТ ПО ЦЕНТРУ */}
                    <div className="w-full flex flex-col items-center">
                        <h1 className="mt-12 sm:mt-16 md:mt-17 lg:mt-32 xl:mt-24 text-6xl sm:text-7xl md:text-[70px] lg:text-[87px] xl:text-[100px] 2xl:text-[120px] font-bold font-['El_Messiri'] text-[#1A1A1A] leading-none mb-2 md:mb-4">
                            {t('not_found_page.title_404')}
                        </h1>
                        <h2 className="text-4xl sm:text-5xl md:text-5xl lg:text-[52px] xl:text-[65px] 2xl:text-[75px] font-['El_Messiri'] text-[#1A1A1A] leading-tight mb-6 lg:mb-10">
                            {t('not_found_page.subtitle')}
                        </h2>
                    </div>

                    {/* НИЖНІЙ ТЕКСТ ЛІВОРУЧ (або по центру на мобільному) */}
                    <div className="w-full text-center md:text-left">
                        <h3 className="text-3xl sm:text-4xl md:text-[30px] lg:text-[38px] xl:text-[50px] 2xl:text-[53px] font-['El_Messiri'] text-[#1A1A1A] leading-tight mb-4 md:mb-8 lg:mb-10">
                            {t('not_found_page.text_1')}
                        </h3>

                        <div className="mb-4 md:mb-10 lg:mb-14">
                            <p className="text-2xl sm:text-3xl md:text-[27px] lg:text-[32px] xl:text-[38px] 2xl:text-[44px] font-['El_Messiri'] text-[#A0354E] leading-relaxed mb-1">
                                {t('not_found_page.text_2')}
                            </p>
                            <p className="text-2xl sm:text-3xl md:text-[27px] lg:text-[32px] xl:text-[38px] 2xl:text-[44px] font-['El_Messiri'] text-[#A0354E] leading-relaxed">
                                {t('not_found_page.text_3')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ============================== */}
                {/* 2. БЛОК З АВОКАДО (Середина на мобільному, Справа на ПК) */}
                {/* ============================== */}
                <div className="w-full flex justify-center md:justify-end items-end relative z-10 order-2 md:col-start-2 md:row-start-1 md:row-span-2 md:self-end">

                    <div className="relative w-full max-w-[320px] sm:max-w-[400px] md:max-w-[480px] lg:max-w-[650px] xl:max-w-[750px] 2xl:max-w-[900px] aspect-square flex items-end justify-center md:-mr-10 lg:-mr-16 transform md:-translate-y-55 lg:-translate-y-50 xl:-translate-y-54 2xl:-translate-y-64">

                        {/* --- МІНІ АВОКАДО 1 (Найвище) --- */}
                        <div className="absolute top-[25%] right-[20%]  md:top-[24%] md:right-[29%] lg:top-[20%] lg:right-[19%] 2xl:top-[27%] 2xl:right-[24%] animate-bounce z-20" style={{ animationDuration: '4s' }}>
                            <div className="mix-blend-multiply">
                                <img src={avocadoAvatar} alt="mini avocado" className="w-[100px] h-[30px] sm:w-[110px] sm:h-[40px] md:w-[47px] md:h-[47px] lg:w-[140px] lg:h-[70px] xl:w-[150px] xl:h-[75px] 2xl:w-[180px] 2xl:h-[90px] object-contain transform rotate-12 opacity-70" />
                            </div>
                        </div>

                        {/* --- МІНІ АВОКАДО 2 (Ліворуч) --- */}
                        <div className="absolute top-[37%] left-[35%] md:top-[35%] md:left-[29%] lg:top-[34%] lg:left-[30%] 2xl:top-[38%] 2xl:left-[25%] animate-bounce z-20" style={{ animationDuration: '5s' }}>
                            <div className="mix-blend-multiply">
                                <img src={avocadoAvatar} alt="mini avocado" className="w-[35px] h-[50px] sm:w-[60px] sm:h-[60px] md:w-[60px] md:h-[60px] lg:w-[90px] lg:h-[90px] xl:w-[120px] xl:h-[100px] 2xl:w-[140px] 2xl:h-[120px] object-contain transform -rotate-12 opacity-70" />
                            </div>
                        </div>

                        {/* --- МІНІ АВОКАДО 3 (Праворуч нижче) --- */}
                        <div className="absolute top-[12%] right-[12%] md:top-[13%] md:right-[7%] lg:top-[6%] lg:right-[2%] 2xl:top-[15%] 2xl:right-[7%] animate-bounce z-20" style={{ animationDuration: '3.5s' }}>
                            <div className="mix-blend-multiply">
                                <img src={avocadoAvatar} alt="mini avocado" className="w-[17px] h-[30px] sm:w-[27px] sm:h-[40px] md:w-[35px] md:h-[35px] lg:w-[60px] lg:h-[60px] xl:w-[70px] xl:h-[55px] 2xl:w-[90px] 2xl:h-[70px] object-contain transform rotate-5 opacity-70" />
                            </div>
                        </div>

                        {/* --- ВЕЛИКЕ АВОКАДО --- */}
                        <div className="w-full h-full mix-blend-multiply flex items-end justify-center">
                            <img
                                src={avocadoImg}
                                alt="Авокадо помилка 404"
                                className="w-full h-full object-contain scale-[1.1] md:scale-[1.4] lg:scale-[1.25] xl:scale-[1.3] 2xl:scale-[1.4]"
                            />
                        </div>
                    </div>
                </div>

                {/* ============================== */}
                {/* 3. КНОПКИ (Низ на мобільному, Зліва-низ на ПК під текстом) */}
                {/* ============================== */}
                <div className="w-full flex flex-col sm:flex-row gap-6 lg:gap-16 justify-center md:justify-start items-start z-20 order-3 md:col-start-1 md:row-start-2 mt-12 md:mt-0 pb-10 md:pb-20">
                    <Link
                        to="/recipes"
                        className="px-8 py-3.5 sm:py-3 bg-white text-[#1A1A1A] border border-gray-800 rounded-full font-['El_Messiri'] text-xl lg:text-1xl text-center hover:bg-gray-50 transition-all w-full sm:w-auto min-w-[220px] shadow-sm cursor-pointer duration-300 ease-out active:scale-95 group"
                    >
                        {t('not_found_page.btn_search')}
                    </Link>
                    <Link
                        to="/"
                        className="px-8 py-3.5 sm:py-3 bg-[#B5C9AD] text-[#1A1A1A] rounded-full font-['El_Messiri'] text-xl lg:text-1xl text-center hover:bg-[#A3B89B] transition-all w-full sm:w-auto min-w-[250px] shadow-sm cursor-pointer duration-300 ease-out active:scale-95 group"
                    >
                        {t('not_found_page.btn_home')}
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default NotFound;