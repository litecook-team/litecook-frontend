import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { ENDPOINTS, API_URL } from '../constants/api';
import { DICTIONARIES } from '../constants/translations';

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
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState(null);

    useEffect(() => {
        fetchFavorites();
        window.scrollTo(0, 0);
    }, []);

    const fetchFavorites = async () => {
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
            showToast("🤍 Видалено з улюблених");
        } catch (error) {
            showToast("❌ Помилка видалення");
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${API_URL}${path}`;
    };

    if (loading) {
        return <div className="min-h-screen bg-[#F6F3F4] flex items-center justify-center text-2xl font-['El_Messiri']">Завантаження...</div>;
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
                                Улюблені рецепти
                            </h2>
                            <div className="flex-grow border-t-[3px] border-gray-400 ml-2"></div>
                        </div>

                        {/* СІТКА КАРТОК */}
                        {favorites.length === 0 ? (
                            <div className="text-center text-gray-500 font-['Inter'] mt-20 text-lg">
                                У вас поки немає улюблених рецептів.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-x-10 lg:gap-x-14 md:gap-y-16">
                                {favorites.map((item) => {
                                    const recipe = item.recipe || item;

                                    return (
                                        <div key={recipe.id} className="flex flex-col relative group">

                                            <div className="relative w-full h-64 sm:h-60 md:h-72 rounded-[2rem] overflow-hidden mb-5 shadow-sm">
                                                <img
                                                    src={getImageUrl(recipe.image)}
                                                    alt={recipe.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />

                                                <button
                                                    onClick={() => removeFavorite(recipe.id)}
                                                    className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                                                    title="Видалити з улюблених"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Назва рецепту */}
                                            <h3 className="text-center font-['El_Messiri'] font-bold text-[#1A1A1A] text-base sm:text-lg md:text-xl lg:text-2xl uppercase px-2 line-clamp-2 min-h-[48px] md:min-h-[56px] flex items-center justify-center">
                                                {recipe.title}
                                            </h3>

                                            {/* Статистика */}
                                             <div className="flex justify-between items-start mt-3 mb-6 px-1 font-['El_Messiri'] w-full">
                                                <div className="flex flex-col items-center flex-1 px-0.5">
                                                    <svg className="mb-1.5 md:mb-2 text-[#B47231] w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.0"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                    <span className="text-[10px] sm:text-[14px] md:text-[15px] lg:text-[16px] font-medium text-gray-800 leading-tight text-center">
                                                        {recipe.cooking_time} {getPluralForm(recipe.cooking_time, ['хвилина', 'хвилини', 'хвилин'])}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-center flex-1 px-0.5">
                                                    <svg className="mb-1.5 md:mb-2 text-[#B47231] w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.0"><path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg>
                                                    <span className="text-[10px] sm:text-[14px] md:text-[15px] lg:text-[16px] font-medium text-gray-800 leading-tight text-center">
                                                        {recipe.portions} {getPluralForm(recipe.portions, ['порція', 'порції', 'порцій'])}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-center flex-1 px-0.5">
                                                    <svg className="mb-1.5 md:mb-2 text-[#B47231] w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.0"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
                                                    <span className="text-[10px] sm:text-[14px] md:text-[15px] lg:text-[16px] font-medium text-gray-800 leading-tight text-center break-words">
                                                        {recipe.calories} ккал/порція
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
                                                    className="block w-full py-3 rounded-[20px] border border-gray-400 text-center font-['Inter'] font-medium text-[14px] md:text-[15px] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition-colors"
                                                >
                                                    Переглянути
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