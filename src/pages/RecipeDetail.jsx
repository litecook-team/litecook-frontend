import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import api from '../api';
import { ENDPOINTS, TOKEN_KEY, API_URL } from '../constants/api';
import { DICTIONARIES } from '../constants/translations';
import recipeBgImage from '../assets/recipe/recipe.png';
import iconClip from '../assets/recipe/icon_detail.png';

// Допоміжна функція для правильного відмінювання слів
const getPluralForm = (number, titles) => {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return titles[2];
    if (n1 > 1 && n1 < 5) return titles[1];
    if (n1 === 1) return titles[0];
    return titles[2];
};

const RecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);

    const [toastMessage, setToastMessage] = useState(null);
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [menuDay, setMenuDay] = useState(1);
    const [menuMeal, setMenuMeal] = useState('lunch');

    // Тепер використовуємо TOKEN_KEY з констант
    const isAuthenticated = !!localStorage.getItem(TOKEN_KEY);

    useEffect(() => {
        fetchRecipe();
        window.scrollTo(0, 0);
    }, [id]);

    const fetchRecipe = async () => {
        try {
            // config більше не потрібен, api сам додасть токен!
            const response = await api.get(`${ENDPOINTS.RECIPES}${id}/`);
            setRecipe(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Помилка завантаження:", error);
            setLoading(false);
        }
    };

    const toggleFavorite = async () => {
        if (!isAuthenticated) return;
        try {
            if (recipe.is_favorited) {
                await api.delete(`${ENDPOINTS.FAVORITES}${id}/`);
                setRecipe({ ...recipe, is_favorited: false });
                showToast("🤍 Видалено з улюблених");
            } else {
                await api.post(ENDPOINTS.FAVORITES, { recipe: id });
                setRecipe({ ...recipe, is_favorited: true });
                showToast("❤️ Додано в улюблені!");
            }
        } catch (error) {
            showToast("❌ Помилка синхронізації");
        }
    };

    const handleMenuButtonClick = () => {
        recipe.is_added_to_menu ? removeFromMenu() : setIsMenuModalOpen(true);
    };

    const removeFromMenu = async () => {
        try {
            await api.delete(`${ENDPOINTS.WEEKLY_MENU}remove-recipe/${id}/`);
            setRecipe({ ...recipe, is_added_to_menu: false });
            showToast("🍽️ Видалено з меню");
        } catch (error) {
            showToast("❌ Помилка видалення");
        }
    };

    const addToMenu = async () => {
        try {
            await api.post(ENDPOINTS.WEEKLY_MENU, {
                recipe: id,
                day_of_week: menuDay,
                meal_type: menuMeal
            });
            setRecipe({ ...recipe, is_added_to_menu: true });
            setIsMenuModalOpen(false);
            showToast("🍲 Рецепт додано до тижневого меню!");
        } catch (error) {
            showToast("❌ Помилка додавання");
        }
    };

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const formatArray = (arr, dict) => arr?.map(item => dict[item] || item).join(', ') || '—';

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${API_URL}${path}`;
    };

    if (loading) return <div className="min-h-screen bg-[#F6F3F4] flex items-center justify-center text-2xl font-serif">Завантаження...</div>;
    if (!recipe) return <div className="min-h-screen bg-[#F6F3F4] flex items-center justify-center text-2xl font-serif">Рецепт не знайдено</div>;

    return (
        <div className="bg-[#F6F3F4] min-h-screen w-full relative font-sans pb-20 lg:pb-0 overflow-hidden">

            <div className="absolute bottom-0 right-0 z-0 pointer-events-none">
                <img
                    src={recipeBgImage}
                    alt="Vegetables Background"
                    className="w-[400px] sm:w-[500px] md:w-[600px] lg:w-[750px] xl:w-[850px] object-contain opacity-90 sm:opacity-90 lg:opacity-90 transform -rotate-[15deg] translate-y-16 lg:translate-y-20 translate-x-12 lg:translate-x-16 transition-all rotate-270"
                />
            </div>

            {/* Тоаст */}
            {toastMessage && (
                <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 transition-all font-medium flex items-center gap-2">
                    {toastMessage}
                </div>
            )}

            {/* ================= ГОЛОВНИЙ GRID-КОНТЕЙНЕР ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 w-full min-h-screen relative z-10">

                {/* БЛОК 1: ФОТОГРАФІЯ */}
                <div className="order-1 lg:col-span-8 relative shrink-0">
                    <div className="relative w-full h-[70vh] md:h-[75vh] lg:h-[85vh] overflow-hidden lg:rounded-br-[80px] shadow-lg">
                        <img src={recipe.image}
                             alt={recipe.title}
                             className="w-full h-full object-cover"
                        />

                        {/* Кнопка Назад */}
                        <button
                            onClick={() => navigate(-1)}
                            className="absolute top-6 left-6 lg:top-10 lg:left-10 px-8 sm:px-10 py-2 bg-white rounded-[30px] border border-black hover:shadow-md transition text-gray-800 flex items-center justify-center gap-2 font-['Inter'] font-medium text-[13px] sm:text-[14px] lg:text-[15px]"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 8 8 12 12 16"></polyline>
                                <line x1="16" y1="12" x2="8" y2="12"></line>
                            </svg>
                            Назад
                        </button>

                        {/* Кнопка Улюблені */}
                        {isAuthenticated && (
                            <button
                                onClick={toggleFavorite}
                                className="absolute bottom-6 right-6 lg:bottom-12 lg:right-12 px-6 sm:px-8 py-2.5 bg-white/50 backdrop-blur-md border border-black rounded-[30px] hover:bg-white/80 transition text-gray-900 flex items-center gap-2 font-['Inter'] font-medium text-[13px] sm:text-[14px] lg:text-[15px]"
                            >
                                <svg
                                    width="20" height="20" viewBox="0 0 24 24"
                                    fill={recipe.is_favorited ? "#B47231" : "none"} stroke="#B47231"
                                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"
                                >
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                {recipe.is_favorited ? 'В улюблених' : 'Додати в улюблені'}
                            </button>
                        )}
                    </div>
                </div>

                {/* БЛОК 2 та 3: НАЗВА, СТАТИСТИКА, ІНГРЕДІЄНТИ */}
                <div className="order-2 lg:col-span-4 lg:row-span-2 flex flex-col relative px-6 sm:px-8 lg:px-8 xl:px-12 2xl:px-16 pt-10 lg:pt-20 min-w-0">

                    {/* РЕЦЕПТ */}
                    <div className="flex justify-end mb-4 sm:mb-6 lg:mb-12">
                        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 tracking-widest uppercase">
                            <svg className="text-green-800 shrink-0 w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            <span className="text-black font-['El_Messiri'] text-xs sm:text-sm md:text-base lg:text-[26px] leading-none">
                                РЕЦЕПТ
                            </span>
                        </div>
                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[36px] xl:text-[40px] leading-tight font-['El_Messiri'] text-gray-900 uppercase text-center mb-8 sm:mb-12 px-2 sm:px-0">
                        {recipe.title}
                    </h1>

                    {/* Статистика */}
                    <div className="flex justify-between items-start sm:items-center gap-1 sm:gap-2 lg:gap-4 font-['El_Messiri'] text-center border-b-[1.5px] sm:border-b-2 border-gray-700 pb-6 sm:pb-8 mb-8 sm:mb-12 px-1 lg:px-2 xl:px-6 w-full">
                        <div className="flex flex-col items-center flex-1">
                            <svg className="mb-2 sm:mb-3 text-[#B47231] w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span className="text-[11px] sm:text-[13px] md:text-base lg:text-lg text-gray-800 leading-tight">
                                {recipe.cooking_time} {getPluralForm(recipe.cooking_time, ['хвилина', 'хвилини', 'хвилин'])}
                            </span>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                            <svg className="mb-2 sm:mb-3 text-[#B47231] w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line>
                            </svg>
                            <span className="text-[11px] sm:text-[13px] md:text-base lg:text-lg text-gray-800 leading-tight">
                                {recipe.portions} {getPluralForm(recipe.portions, ['порція', 'порції', 'порцій'])}
                            </span>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                            <svg className="mb-2 sm:mb-3 text-[#B47231] w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                            </svg>
                            <span className="text-[11px] sm:text-[13px] md:text-base lg:text-lg text-gray-800 leading-tight">
                                {recipe.calories} ккал / порція
                            </span>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                            <svg className="mb-2 sm:mb-3 text-[#B47231] w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                            <span className="text-[11px] sm:text-[13px] md:text-base lg:text-lg text-gray-800 leading-tight">
                                {DICTIONARIES.difficulty[recipe.difficulty]}
                            </span>
                        </div>
                    </div>

                    {/* Інгредієнти */}
                    <div className="mb-10 lg:mb-14 px-2 sm:px-4 lg:px-2 xl:px-6 font-['Inter'] w-full">
                        <h3 className="text-[18px] sm:text-[20px] lg:text-[22px] font-bold text-gray-900 mb-6 uppercase flex items-center gap-2 lg:gap-3">
                            <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#B47231" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 12.5C4 12.5 7.5 17 8.5 18C10 14 15 7.5 20 5"></path>
                            </svg>
                            ІНГРЕДІЄНТИ
                        </h3>

                        <ul className="backdrop-blur-md rounded-2xl p-2 sm:p-4 lg:p-3">
                            {recipe.recipe_ingredients.map((ing) => (
                                <li key={ing.id} className="flex items-center text-gray-900 text-[14px] sm:text-[16px] lg:text-[18px] font-['Inter'] border-b border-gray-200/60 py-1 sm:py-1 lg:py-1 last:border-0">
                                    {ing.ingredient_image ? (
                                        <img src={getImageUrl(ing.ingredient_image)} alt="" className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 object-cover rounded-full mr-3 sm:mr-4 lg:mr-5 flex-shrink-0" />
                                    ) : (
                                        <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full mr-3 sm:mr-4 lg:mr-5 flex items-center justify-center flex-shrink-0">
                                            <span className="text-[#B47231] text-2xl lg:text-3xl leading-none mb-1">•</span>
                                        </div>
                                    )}
                                    <span className="lowercase">{ing.ingredient_name}</span>

                                    <span className="ml-1 sm:ml-2 whitespace-nowrap text-gray-800">
                                        — {ing.amount ? `${parseFloat(ing.amount)} ` : ''}
                                        {Array.isArray(DICTIONARIES.units[ing.unit])
                                            ? getPluralForm(ing.amount || 1, DICTIONARIES.units[ing.unit])
                                            : (DICTIONARIES.units[ing.unit] || ing.unit)}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {isAuthenticated && (
                            <div className="mt-8 lg:mt-12 flex justify-end">
                                <button
                                    onClick={handleMenuButtonClick}
                                    className={`px-6 py-2.5 sm:px-8 sm:py-3 bg-white/70 backdrop-blur-md border rounded-[30px] transition-all text-gray-900 flex items-center gap-2.5 font-medium text-[14px] sm:text-[15px] lg:text-[16px] shadow-sm ${recipe.is_added_to_menu ? 'border-[#B47231] hover:bg-white/90' : 'border-black hover:bg-white'}`}
                                >
                                    {recipe.is_added_to_menu ? (
                                        <>
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#B47231" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            Додано до тижневого меню
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#B47231" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><circle cx="8" cy="14" r="1.5" fill="#B47231"></circle><circle cx="12" cy="14" r="1.5" fill="#B47231"></circle><circle cx="16" cy="14" r="1.5" fill="#B47231"></circle><circle cx="8" cy="18" r="1.5" fill="#B47231"></circle><circle cx="12" cy="18" r="1.5" fill="#B47231"></circle><circle cx="16" cy="18" r="1.5" fill="#B47231"></circle></svg>
                                            Додати в тижневе меню
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* БЛОК 4 та 5: ПРИГОТУВАННЯ І ДЕТАЛІ */}
                <div className="order-3 lg:col-span-8 lg:col-start-1 w-full px-4 pl-5 sm:px-6 sm:pl-8 lg:px-16 lg:pl-[72px] pt-10 sm:pt-12 lg:pt-16 pb-10 sm:pb-12">
                    <div className="flex flex-col-reverse lg:flex-row items-start w-full gap-12 sm:gap-16 lg:gap-8 xl:gap-12">

                        {/* Блок 5: Деталі рецепту (Праворуч на ПК, знизу на мобільних) */}
                        <div className="w-full lg:w-[45%] xl:w-[40%] flex items-center justify-center lg:justify-start pt-6 lg:pt-0">
                            {/* ЗМІНЕНО: Градієнтний бордер. Для цього використовуємо обгортку з p-[4px] (або p-[6px] для товстішого бордера) і bg-gradient */}
                            <div className="relative w-full max-w-md lg:max-w-none rounded-[2rem] p-[6px] bg-gradient-to-br from-[#DCE8D9] via-[#6A907B]/20 to-[#DCE8D9] shadow-sm mx-auto lg:mx-0">

                                {/* ІКОНКА СКРІПКИ */}
                                <img
                                    src={iconClip}
                                    alt="Деталі"
                                    className="absolute -top-8 left-6 sm:-top-10 sm:left-10 lg:-top-10 lg:left-8 xl:-top-10 xl:left-10 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center bg-white rounded-full shadow-md z-10 p-2 border-2 border-[#B47231]/20"
                                />

                                {/* Внутрішній блок Деталей (ПРОЗОРИЙ) */}
                                <div className="w-full h-full bg-transparent min-[1500px]:backdrop-blur-none backdrop-blur-md rounded-[calc(2rem-6px)] p-6 sm:p-8 lg:p-8 xl:p-8 font-['Inter']">

                                    <h3 className="text-[18px] sm:text-[20px] font-bold font-['Inter'] text-[#B47231] mb-2 sm:mb-0 uppercase text-center tracking-widest mt-2 sm:mt-0">
                                        ДЕТАЛІ
                                    </h3>

                                    <div className="space-y-2 sm:space-y-3 text-[14px] sm:text-[15px] lg:text-[16px] rounded-2xl p-0 sm:p-4 lg:p-6 mt-4 sm:mt-0">
                                        <div className="flex justify-between items-start gap-4 border-b border-gray-200/60 pb-1">
                                            <span className="text-gray-900 font-semibold w-24 sm:w-28 lg:w-32">Кухня:</span>
                                            <span className="text-gray-900 text-right break-words">{formatArray(recipe.cuisine, DICTIONARIES.cuisine)}</span>
                                        </div>
                                        <div className="flex justify-between items-start gap-4 border-b border-gray-200/60 pb-1">
                                            <span className="font-semibold text-gray-900 w-24 sm:w-28 lg:w-32">Прийом їжі:</span>
                                            <span className="text-gray-900 text-right break-words">{formatArray(recipe.meal_times, DICTIONARIES.meal_times)}</span>
                                        </div>
                                        <div className="flex justify-between items-start gap-4 border-b border-gray-200/60 pb-1">
                                            <span className="font-semibold text-gray-900 w-24 sm:w-28 lg:w-32">Тип страви:</span>
                                            <span className="text-gray-900 text-right break-words">{formatArray(recipe.dish_types, DICTIONARIES.dish_types)}</span>
                                        </div>
                                        <div className="flex justify-between items-start gap-4 border-b border-gray-200/60 pb-1">
                                            <span className="font-semibold text-gray-900 w-24 sm:w-28 lg:w-32">Тип харчування:</span>
                                            <span className="text-gray-900 text-right break-words">{formatArray(recipe.dietary_tags, DICTIONARIES.dietary_tags)}</span>
                                        </div>
                                        <div className="flex justify-between items-start gap-4 border-b border-gray-200/60 pb-1">
                                            <span className="font-semibold text-gray-900 w-24 sm:w-28 lg:w-32">Автор:</span>
                                            <span className="text-gray-900 text-right break-words">{recipe.source || 'Невідомо'}</span>
                                        </div>
                                        <div className="flex justify-between items-start gap-4 border-b border-gray-200/60 pb-1 last:border-0">
                                            <span className="font-semibold text-gray-900 w-24 sm:w-28 lg:w-32">Додано:</span>
                                            <span className="text-gray-900 text-right break-words">
                                                {recipe.created_at ? new Date(recipe.created_at).toLocaleDateString('uk-UA') : '—'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Блок 4: Приготування (Ліворуч на ПК, зверху на мобільних) */}
                        <div className="w-full lg:w-[55%] xl:w-[60%] flex items-center justify-center lg:justify-start mx-auto lg:mx-0 pt-6 lg:pt-0">

                            {/* Яскравий градієнтний бордер для ПРИГОТУВАННЯ */}
                            <div className="relative w-full max-w-2xl lg:max-w-none rounded-[2rem] p-[4px] bg-gradient-to-br from-[#B47231]/20 via-[#6A907B]/30 to-[#B47231]/40 shadow-lg">

                                {/* ІКОНКА КАСТРУЛІ (Розташована подібно до скріпки) */}
                                {/* ЗАМІНІТЬ SVG НА <img src={iconPot} ... /> КОЛИ БУДЕ КАРТИНКА */}
                                <div className="absolute -top-8 right-6 sm:-top-10 sm:right-10 lg:-top-10 lg:right-8 xl:-top-10 xl:right-10 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center bg-white rounded-full shadow-md z-10 p-2 border-2 border-[#B47231]/20">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#B47231" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                                        <path d="M4 11l1 10a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5L20 11" />
                                        <path d="M3 10a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1" />
                                        <path d="M10 7a3 3 0 0 1 4 0h2a3.5 3.5 0 0 0-8 0h2" />
                                        <path d="M22 9.5H2" />
                                        <path d="M8 3v2" /><path d="M12 2v3" /><path d="M16 3v2" />
                                    </svg>
                                </div>

                                {/* ЗМІНЕНО: Внутрішній блок Приготування тепер ПРОЗОРИЙ (bg-transparent), матовий фон працює лише там, де треба */}
                                <div className="w-full h-full bg-transparent min-[1500px]:backdrop-blur-none backdrop-blur-md rounded-[calc(2rem-4px)] p-6 sm:p-8 xl:p-10 flex flex-col items-center lg:items-start">

                                    <h3 className="text-[18px] sm:text-[20px] lg:text-[22px] font-bold font-['Inter'] text-[#B47231] mb-5 sm:mb-8 uppercase flex items-center justify-center lg:justify-start gap-2 sm:gap-3 w-full tracking-widest">
                                        ПРИГОТУВАННЯ
                                    </h3>

                                    {/* ЗМІНЕНО: Зменшено відстань між кроками (space-y-3 sm:space-y-4 lg:space-y-4) */}
                                    <div className="space-y-2 sm:space-y-3 lg:space-y-3 w-full">
                                        {recipe.steps.map((step) => (
                                            <div key={step.step_number} className="flex items-start group">
                                                {/* ЗМІНЕНО: Прибрано bg-white/50. Тепер кружечки повністю прозорі всередині */}
                                                <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 border-2 border-[#6A907B]/40 text-[#B47231] rounded-full flex items-center justify-center text-[13px] sm:text-[15px] lg:text-[15px] font-['Inter'] font-bold mt-0 mr-3 sm:mr-4 group-hover:border-[#B47231] transition-colors bg-transparent">
                                                    {step.step_number}
                                                </div>
                                                <p className="text-gray-800 font-['Inter'] font-medium text-[15px] sm:text-[16px] lg:text-[17px] xl:text-[18px] leading-relaxed break-words max-w-prose pt-1 sm:pt-0.5">
                                                    {step.text}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* ================= КРАСИВЕ МОДАЛЬНЕ ВІКНО МЕНЮ ================= */}
            {isMenuModalOpen && (
                <div className="fixed top-0 left-0 w-screen h-screen z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-lg transform-gpu" style={{ WebkitBackdropFilter: 'blur(16px)' }}>
                    <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 max-w-[420px] w-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] relative font-['Inter']">

                        {/* Кнопка закриття */}
                        <button
                            onClick={() => setIsMenuModalOpen(false)}
                            className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-200 hover:scale-105 transition-all shadow-sm"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        {/* Іконка зверху (Календар/План) */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-[#F6F3F4] rounded-full flex items-center justify-center shadow-inner">
                                <svg className="w-8 h-8 text-[#B47231]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                    <line x1="9" y1="16" x2="15" y2="16"></line>
                                </svg>
                            </div>
                        </div>

                        <h2 className="text-[24px] font-bold font-['El_Messiri'] text-gray-900 mb-1 text-center uppercase tracking-wider">
                            План тижневого меню
                        </h2>
                        <p className="text-center text-sm text-gray-500 mb-8 font-medium">Оберіть час, щоб зберегти цей рецепт</p>

                        <div className="space-y-6">

                            <div className="relative group">
                                <label className="absolute -top-2.5 left-5 px-2 bg-white text-[12px] font-bold text-gray-400 uppercase tracking-widest transition-colors group-focus-within:text-[#B47231] z-10">День тижня</label>
                                <select
                                    value={menuDay}
                                    onChange={(e) => setMenuDay(e.target.value)}
                                    className="w-full appearance-none bg-transparent border-2 border-gray-200 rounded-[1.5rem] px-5 py-4 outline-none focus:border-[#B47231] text-gray-800 font-semibold text-[15px] transition-all cursor-pointer relative z-0 hover:border-gray-300"
                                >
                                    <option value={1}>Понеділок</option>
                                    <option value={2}>Вівторок</option>
                                    <option value={3}>Середа</option>
                                    <option value={4}>Четвер</option>
                                    <option value={5}>П'ятниця</option>
                                    <option value={6}>Субота</option>
                                    <option value={7}>Неділя</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-gray-400 group-focus-within:text-[#B47231] transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </div>
                            </div>

                            {/* Вибір Прийому їжі */}
                            <div className="relative group">
                                <label className="absolute -top-2.5 left-5 px-2 bg-white text-[12px] font-bold text-gray-400 uppercase tracking-widest transition-colors group-focus-within:text-[#B47231] z-10">Прийом їжі</label>
                                <select
                                    value={menuMeal}
                                    onChange={(e) => setMenuMeal(e.target.value)}
                                    className="w-full appearance-none bg-transparent border-2 border-gray-200 rounded-[1.5rem] px-5 py-4 outline-none focus:border-[#B47231] text-gray-800 font-semibold text-[15px] transition-all cursor-pointer relative z-0 hover:border-gray-300"
                                >
                                    <option value="breakfast">Сніданок</option>
                                    <option value="lunch">Обід</option>
                                    <option value="dinner">Вечеря</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-gray-400 group-focus-within:text-[#B47231] transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </div>
                            </div>

                            {/* Стилізована кнопка */}
                            <button
                                onClick={addToMenu}
                                className="w-full mt-4 bg-[#1A1A1A] text-white py-4 rounded-[1.5rem] font-bold hover:bg-[#B47231] transition-all shadow-lg shadow-black/10 uppercase tracking-wider text-[14px] flex justify-center items-center gap-3 group"
                            >
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                Зберегти в меню
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipeDetail;