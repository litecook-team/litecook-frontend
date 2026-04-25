import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // ІМПОРТ ПЕРЕКЛАДУ
import api from '../api';
import { ENDPOINTS, API_URL } from '../constants/api';
import { DICTIONARIES } from '../constants/translations';
import avocadoImg from '../assets/favorites/avocado_runs.png';

// Допоміжна функція для правильного відмінювання слів
const getPluralForm = (number, titles) => {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return titles[2];
    if (n1 > 1 && n1 < 5) return titles[1];
    if (n1 === 1) return titles[0];
    return titles[2];
};

const Favorites = () => {
    const { t, i18n } = useTranslation(); // ПІДКЛЮЧЕННЯ ПЕРЕКЛАДУ

    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState(null);

    // Завантажуємо дані при відкритті ТА при зміні мови
    useEffect(() => {
        fetchFavorites();
    }, [i18n.language]);

    // Прокручуємо вгору лише при першому відкритті сторінки
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const fetchFavorites = async () => {
        // Показуємо лоадер тільки якщо список ще порожній, щоб не блимало при перемиканні мов
        if (favorites.length === 0) setLoading(true);
        try {
            const response = await api.get(ENDPOINTS.FAVORITES);
            setFavorites(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Помилка завантаження улюблених рецептів:", error);
            setLoading(false);
        }
    };

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const removeFavorite = async (recipeId) => {
        try {
            await api.delete(`${ENDPOINTS.FAVORITES}${recipeId}/`);
            setFavorites(favorites.filter(item => {
                const id = item.recipe?.id || item.id;
                return id !== recipeId;
            }));
            showToast(t('favorites_page.toast_removed'));
        } catch (error) {
            showToast(t('favorites_page.toast_error_remove'));
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${API_URL}${path}`;
    };

    if (loading) {
        return <div className="min-h-screen bg-[#F6F3F4] flex items-center justify-center text-2xl font-['El_Messiri']">{t('favorites_page.loading')}</div>;
    }

    return (
        <div className="bg-[#F6F3F4] w-full flex-grow flex flex-col">
            <div className=" mx-auto px-4 sm:px-6 lg:px-3 w-full pt-10 lg:pt-0 flex-grow flex">
                <div className="bg-gradient-to-b from-[#F6F3F4] to-[#D1E2CF] w-full font-sans pt-8 lg:pt-12 pb-14 px-6 sm:px-10 lg:px-24 relative rounded-b-[2rem] md:rounded-b-[3rem] lg:rounded-b-[4rem] overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex-grow flex flex-col">

                    {toastMessage && (
                        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 transition-all font-medium flex items-center gap-2">
                            {toastMessage}
                        </div>
                    )}
                    <div className="w-full flex-grow flex flex-col">

                        {/* ЗАГОЛОВОК СТОРІНКИ */}
                        <div className="flex items-center gap-3 md:gap-4 mb-10 md:mb-14">
                            <div className="w-4 h-4 md:w-5 md:h-5 bg-[#42705D] shrink-0"></div>
                            <h2 className="text-xl md:text-2xl lg:text-[26px] font-['El_Messiri'] font-bold text-gray-800 tracking-wider uppercase whitespace-nowrap">
                                {t('favorites_page.title')}
                            </h2>
                            <div className="flex-grow border-t-[3px] border-gray-400 ml-2"></div>
                        </div>

                        {/* СІТКА КАРТОК АБО СТАН "ПОРОЖНЬО" */}
                        {favorites.length === 0 ? (
                            // красивий блок для порожнього стану
                            // ДОДАНО: 2xl:gap-24 для збільшення відстані між колонками на величезних екранах
                            <div className="flex flex-col md:flex-row items-center justify-center w-full flex-grow relative py-10 md:py-0 gap-10 md:gap-4 lg:gap-8 xl:gap-16 2xl:gap-24">

                                {/* Текстовий блок (Ліворуч на ПК та планшетах, зверху на мобільних) */}
                                {/* ДОДАНО: 2xl:pl-32 для більшого відступу зліва */}
                                <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left relative z-10 px-4 sm:px-8 md:px-0 md:pl-6 lg:pl-12 xl:pl-20 2xl:pl-32 shrink-0">

                                    {/* ДОДАНО: 2xl:text-[42px] та 2xl:max-w-5xl для пропорційного збільшення тексту */}
                                    <p className="text-2xl sm:text-2xl md:text-[20px] lg:text-[25px] xl:text-[32px] 2xl:text-[42px] font-['El_Messiri'] text-[#1A1A1A] leading-tight mb-4 lg:mb-6 max-w-md md:max-w-sm lg:max-w-lg xl:max-w-4xl 2xl:max-w-5xl">
                                        {t('favorites_page.empty_text')}
                                    </p>
                                </div>

                                {/* Блок із зображенням авокадо (Праворуч на ПК, знизу на мобільних) */}
                                {/* ДОДАНО: 2xl:-translate-x-[0px] для ідеального центрування на великих моніторах */}
                                <div className="w-full md:w-1/2 flex justify-center md:justify-start items-center relative z-10 md:-translate-x-8 lg:-translate-x-12 xl:-translate-x-[10px] 2xl:-translate-x-[0px]">

                                    {/* ДОДАНО: 2xl:max-w-[900px] щоб авокадо ставало ще більшим на моніторах 1536px+ */}
                                    <div className="relative w-full max-w-[280px] sm:max-w-[350px] md:max-w-[420px] lg:max-w-[500px] xl:max-w-[760px] 2xl:max-w-[900px] aspect-square">

                                        {/* ДОДАНО: 2xl:top-[2%] 2xl:right-[15%] та 2xl:w-[105px] 2xl:h-[105px] для збільшення і точного позиціонування сердечка */}
                                        <div className="absolute top-[2%] right-[12%] sm:top-[4%] sm:right-[15%] md:top-[6%] md:right-[18%] lg:top-[5%] lg:right-[14%] xl:top-[2%] xl:right-[15%] 2xl:top-[2%] 2xl:right-[16%] animate-bounce z-20" style={{ animationDuration: '3s' }}>
                                            <svg viewBox="0 0 24 24" fill="#FF4B4B" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg opacity-90 transform rotate-0 w-[45px] h-[45px] sm:w-[55px] sm:h-[55px] md:w-[50px] md:h-[50px] lg:w-[65px] lg:h-[65px] xl:w-[85px] xl:h-[85px] 2xl:w-[105px] 2xl:h-[105px]">
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                            </svg>
                                        </div>

                                        <div className="absolute inset-0 flex items-center justify-center mix-blend-multiply transform -scale-x-100">

                                             <img
                                                src={avocadoImg}
                                                alt="Авокадо кухар"
                                                className="w-full h-full object-contain transform scale-[1.2] xl:scale-[1.25] 2xl:scale-[1.3] translate-y-4"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-x-10 lg:gap-x-14 md:gap-y-16">
                                {favorites.map((item) => {
                                    const recipe = item.recipe || item;

                                    return (
                                        <div key={recipe.id} className="flex flex-col relative group">

                                            <div className="relative w-full h-64 sm:h-60 md:h-72 rounded-[2rem] overflow-hidden mb-5 shadow-sm">

                                                <Link to={`/recipe/${recipe.id}`} className="block w-full h-full">
                                                    <img
                                                        src={getImageUrl(recipe.image)}
                                                        alt={recipe.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out active:scale-100 group"
                                                    />
                                                </Link>

                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault(); // Запобігаємо переходу за посиланням при кліку на кнопку видалення
                                                        removeFavorite(recipe.id);
                                                    }}
                                                    className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
                                                    title={t('favorites_page.btn_remove_title')}
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Назва рецепту */}
                                            {/* ЗМІНЕНО: Назва тепер клікабельна (обгорнута в Link) з ефектом наведення */}
                                            <Link
                                                to={`/recipe/${recipe.id}`}
                                                className="text-center font-['El_Messiri'] font-bold text-[#1A1A1A] group-hover:text-[#42705D] transition-colors text-base sm:text-lg md:text-xl lg:text-2xl uppercase px-2 line-clamp-2 min-h-[48px] md:min-h-[56px] flex items-center justify-center cursor-pointer transition-all duration-300 ease-out active:scale-95 group"
                                            >
                                                {recipe.title}
                                            </Link>

                                            {/* Статистика */}
                                             <div className="flex justify-between items-start mt-3 mb-6 px-1 font-['El_Messiri'] w-full">
                                                <div className="flex flex-col items-center flex-1 px-0.5">
                                                    <svg className="mb-1.5 md:mb-2 text-[#B47231] w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.0"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                    <span className="text-[10px] sm:text-[14px] md:text-[15px] lg:text-[16px] font-medium text-gray-800 leading-tight text-center">
                                                        {recipe.cooking_time} {getPluralForm(recipe.cooking_time, [t('favorites_page.min_1'), t('favorites_page.min_2'), t('favorites_page.min_5')])}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-center flex-1 px-0.5">
                                                    <svg className="mb-1.5 md:mb-2 text-[#B47231] w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.0"><path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg>
                                                    <span className="text-[10px] sm:text-[14px] md:text-[15px] lg:text-[16px] font-medium text-gray-800 leading-tight text-center">
                                                        {recipe.portions} {getPluralForm(recipe.portions, [t('favorites_page.port_1'), t('favorites_page.port_2'), t('favorites_page.port_5')])}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-center flex-1 px-0.5">
                                                    <svg className="mb-1.5 md:mb-2 text-[#B47231] w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.0"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
                                                    <span className="text-[10px] sm:text-[14px] md:text-[15px] lg:text-[16px] font-medium text-gray-800 leading-tight text-center break-words">
                                                        {recipe.calories} {t('favorites_page.kcal_per_portion')}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-center flex-1 px-0.5">
                                                    <svg className="mb-1.5 md:mb-2 text-[#B47231] w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.0"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                                                    <span className="text-[10px] sm:text-[14px] md:text-[15px] lg:text-[16px] font-medium text-gray-800 leading-tight text-center break-words">
                                                        {DICTIONARIES.difficulty[recipe.difficulty] || recipe.difficulty}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Кнопка "Переглянути" */}
                                            <div className="mt-auto">
                                                <Link
                                                    to={`/recipe/${recipe.id}`}
                                                    className="block w-full py-3 rounded-[20px] border border-gray-400 text-center font-['Inter'] font-medium text-[14px] md:text-[15px] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition-colors cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out active:scale-95 group"
                                                >
                                                    {t('favorites_page.view_btn')}
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Favorites;