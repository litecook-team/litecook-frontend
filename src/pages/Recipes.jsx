import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { ENDPOINTS, API_URL, TOKEN_KEY } from '../constants/api';
import { DICTIONARIES } from '../constants/translations';

// декоративне зображення
import decorImage from '../assets/recipe/fon_filter.png';

// Допоміжна функція для правильного відмінювання слів
const getPluralForm = (number, titles) => {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return titles[2];
    if (n1 > 1 && n1 < 5) return titles[1];
    if (n1 === 1) return titles[0];
    return titles[2];
};

// Швидкі інгредієнти для кнопок
const QUICK_INGREDIENTS = [
    { icon: '🥔', name: 'картопля' }, { icon: '🥕', name: 'морква' },
    { icon: '🧄', name: 'часник' }, { icon: '🍅', name: 'помідори' },
    { icon: '🧀', name: 'сир' }, { icon: '🍗', name: 'курка' },
    { icon: '🥑', name: 'авокадо' }, { icon: '🥬', name: 'капуста' },
    { icon: '🥒', name: 'огірок' }
];

// Словники для нових фільтрів
const MONTHS_DICT = {
    1: 'Січень', 2: 'Лютий', 3: 'Березень', 4: 'Квітень',
    5: 'Травень', 6: 'Червень', 7: 'Липень', 8: 'Серпень',
    9: 'Вересень', 10: 'Жовтень', 11: 'Листопад', 12: 'Грудень'
};

const INGREDIENT_CATEGORIES_DICT = {
    'vegetables': 'Овочі та коренеплоди', 'fruits': 'Фрукти та ягоди', 'greens': 'Зелень та трави',
    'mushrooms': 'Гриби', 'meat_bird': 'Птиця', 'meat_pork': 'Свинина', 'meat_beef': 'Яловичина',
    'fish_red': 'Червона риба', 'fish_white': 'Біла риба', 'seafood': 'Морепродукти',
    'cheese': 'Сири', 'dairy': 'Молочні продукти та яйця', 'grains': 'Крупи та бобові',
    'flour': 'Борошно', 'nuts': 'Горіхи та насіння', 'spices': 'Спеції та приправи'
};

// Список табів
const TABS = [
    { id: 'ingredients', label: 'Інгредієнти' },
    { id: 'ingredient_cats', label: 'Групи продуктів' },
    { id: 'meal_time', label: 'Прийом їжі' },
    { id: 'dish_type', label: 'Тип страви' },
    { id: 'cuisine', label: 'Кухня' },
    { id: 'difficulty', label: 'Складність' },
    { id: 'time', label: 'Час приготування' },
    { id: 'calories', label: 'Калорійність' },
    { id: 'diet', label: 'Дієтичні обмеження' },
    { id: 'season', label: 'Сезонність' },
];

const Recipes = () => {
    const isAuthenticated = !!localStorage.getItem(TOKEN_KEY) || !!sessionStorage.getItem(TOKEN_KEY);

    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(6);
    const [toastMessage, setToastMessage] = useState(null);

    const [activeTab, setActiveTab] = useState('ingredients');

    // Стани для фільтрів
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisines, setSelectedCuisines] = useState([]);
    const [selectedDifficulties, setSelectedDifficulties] = useState([]);
    const [selectedDiets, setSelectedDiets] = useState([]);
    const [selectedDishTypes, setSelectedDishTypes] = useState([]);
    const [selectedMealTimes, setSelectedMealTimes] = useState([]);
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [selectedIngredientCategories, setSelectedIngredientCategories] = useState([]);
    const [maxTime, setMaxTime] = useState('');
    const [maxCalories, setMaxCalories] = useState('');
    const [isSeasonal, setIsSeasonal] = useState(false);

    useEffect(() => {
        fetchRecipes();
        window.scrollTo(0, 0);
    }, []);

    const fetchRecipes = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search_query', searchQuery);
            if (selectedCuisines.length > 0) params.append('cuisine', selectedCuisines.join(','));
            if (selectedDifficulties.length > 0) params.append('difficulty', selectedDifficulties.join(','));
            if (selectedDiets.length > 0) params.append('dietary_tags', selectedDiets.join(','));
            if (selectedDishTypes.length > 0) params.append('dish_types', selectedDishTypes.join(','));
            if (selectedMealTimes.length > 0) params.append('meal_times', selectedMealTimes.join(','));
            if (maxTime) params.append('max_time', maxTime);
            if (maxCalories) params.append('max_calories', maxCalories);
            if (isSeasonal) params.append('season', 'summer,autumn,winter,spring');
            if (selectedMonths.length > 0) params.append('months', selectedMonths.join(','));
            if (selectedIngredientCategories.length > 0) params.append('ingredient_categories', selectedIngredientCategories.join(','));

            const response = await api.get(`${ENDPOINTS.RECIPES}?${params.toString()}`);
            setRecipes(response.data.results || response.data);
            setVisibleCount(6);
        } catch (error) {
            console.error("Помилка завантаження рецептів:", error);
            showToast("❌ Помилка завантаження рецептів");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const toggleFavorite = async (e, recipe) => {
        e.preventDefault();
        if (!isAuthenticated) {
            showToast("🔒 Увійдіть, щоб додавати в улюблені");
            return;
        }
        try {
            if (recipe.is_favorited) {
                await api.delete(`${ENDPOINTS.FAVORITES}${recipe.id}/`);
                setRecipes(recipes.map(r => r.id === recipe.id ? { ...r, is_favorited: false } : r));
                showToast("🤍 Видалено з улюблених");
            } else {
                await api.post(ENDPOINTS.FAVORITES, { recipe: recipe.id });
                setRecipes(recipes.map(r => r.id === recipe.id ? { ...r, is_favorited: true } : r));
                showToast("❤️ Додано в улюблені!");
            }
        } catch (error) {
            showToast("❌ Помилка синхронізації");
        }
    };

    const handleQuickAdd = (ingredientName) => {
        if (!searchQuery.includes(ingredientName)) {
            setSearchQuery(prev => prev ? `${prev}, ${ingredientName}` : ingredientName);
        }
    };

    const toggleArrayFilter = (state, setState, value) => {
        setState(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]);
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${API_URL}${path}`;
    };

    return (
        <div className="bg-[#F6F3F4] w-full min-h-screen flex flex-col font-sans pb-20">

            {toastMessage && (
                <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 transition-all font-medium flex items-center gap-2">
                    {toastMessage}
                </div>
            )}

            <div className="mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 w-full pt-8 lg:pt-12">

                {/* ================= ВЕРХНІЙ БЛОК: ФІЛЬТРИ ================= */}
                <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6 lg:p-10 mb-16 relative overflow-hidden flex flex-col md:flex-row gap-8 min-h-[380px]">

                    {/* ЗАГЛУШКА ДЛЯ ДЕКОРАТИВНОЇ КАРТИНКИ (Овочі справа) */}
                    <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[200px] xl:w-[280px] overflow-hidden rounded-r-[2.5rem]">
                        <img
                            src={decorImage}
                            alt="Овочі"
                            className="w-full h-full object-cover object-left opacity-90 scale-[1.15]"
                            style={{ objectPosition: 'left center' }}
                        />
                    </div>

                    {/* ЛІВА КОЛОНКА: ТАБИ (Меню фільтрів) */}
                    <div className="w-full md:w-48 lg:w-56 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 custom-scrollbar z-10">
                        <div className="font-['El_Messiri'] font-bold text-xl text-gray-800 mb-2 hidden md:block pl-2">Фільтри</div>
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-3 rounded-xl font-['Inter'] font-semibold text-sm md:text-base transition-all whitespace-nowrap text-left ${
                                    activeTab === tab.id
                                    ? 'bg-[#5B826B] text-white shadow-md'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ПРАВА КОЛОНКА: КОНТЕНТ ФІЛЬТРУ */}
                    <div className="flex-grow z-10 lg:pr-[220px] xl:pr-[300px] flex flex-col">

                        <div className="flex items-center justify-end border-b border-gray-300 pb-2 mb-8 mt-2">
                            <div className="w-3 h-3 bg-[#6A907B] mr-2"></div>
                            <span className="font-['El_Messiri'] font-bold text-gray-800 tracking-wider uppercase text-sm lg:text-base">
                                ПІДІБРАТИ РЕЦЕПТ
                            </span>
                        </div>

                        {/* ТАБ 1: ІНГРЕДІЄНТИ / ПОШУК */}
                        {activeTab === 'ingredients' && (
                            <div className="animate-fade-in flex flex-col h-full font-['El_Messiri']">
                                <h3 className="text-[22px] md:text-[28px] font-bold text-[#1A1A1A] mb-5">Введіть інгредієнти, які у вас є:</h3>
                                <div className="relative mb-6 shadow-sm rounded-xl">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && fetchRecipes()}
                                        placeholder="наприклад: картопля, цибуля, яйця..."
                                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-5 py-4 pl-12 outline-none focus:border-[#6A907B] transition-colors text-gray-800 font-medium font-['Inter']"
                                    />
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                </div>

{/*                                 <div className="mb-10 font-['Inter']"> */}
{/*                                     <p className="text-[13px] font-bold text-gray-700 mb-4 flex items-center gap-1"> */}
{/*                                         Швидкий вибір <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg> */}
{/*                                     </p> */}
{/*                                     <div className="flex flex-wrap gap-2.5"> */}
{/*                                         {QUICK_INGREDIENTS.map(ing => ( */}
{/*                                             <button */}
{/*                                                 key={ing.name} */}
{/*                                                 onClick={() => handleQuickAdd(ing.name)} */}
{/*                                                 className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-[#6A907B] hover:text-white hover:border-[#6A907B] transition-colors flex items-center gap-1.5 shadow-sm" */}
{/*                                             > */}
{/*                                                 <span>{ing.icon}</span> {ing.name} */}
{/*                                             </button> */}
{/*                                         ))} */}
{/*                                     </div> */}
{/*                                 </div> */}
                            </div>
                        )}

                        {/* ТАБ 2: ГРУПИ ПРОДУКТІВ */}
                        {activeTab === 'ingredient_cats' && (
                            <div className="animate-fade-in flex flex-col h-full font-['Inter']">
                                <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wider">Групи продуктів</h3>
                                <p className="text-gray-500 text-sm mb-5">Шукати рецепти, що містять продукти з обраних категорій:</p>
                                <div className="flex flex-wrap gap-3 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                                    {Object.entries(INGREDIENT_CATEGORIES_DICT).map(([key, value]) => (
                                        <button
                                            key={key}
                                            onClick={() => toggleArrayFilter(selectedIngredientCategories, setSelectedIngredientCategories, key)}
                                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${selectedIngredientCategories.includes(key) ? 'bg-[#6A907B] text-white border-[#6A907B]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#6A907B]'}`}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ТАБ 3: ПРИЙОМ ЇЖІ */}
                        {activeTab === 'meal_time' && (
                            <div className="animate-fade-in flex flex-col h-full font-['Inter']">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">Прийом їжі</h3>
                                <div className="flex flex-wrap gap-3">
                                    {Object.entries(DICTIONARIES.meal_times).map(([key, value]) => (
                                        <button
                                            key={key}
                                            onClick={() => toggleArrayFilter(selectedMealTimes, setSelectedMealTimes, key)}
                                            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${selectedMealTimes.includes(key) ? 'bg-[#6A907B] text-white border-[#6A907B]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#6A907B]'}`}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ТАБ 4: ТИП СТРАВИ */}
                        {activeTab === 'dish_type' && (
                            <div className="animate-fade-in flex flex-col h-full font-['Inter']">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">Тип страви</h3>
                                <div className="flex flex-wrap gap-3 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                                    {Object.entries(DICTIONARIES.dish_types).map(([key, value]) => (
                                        <button
                                            key={key}
                                            onClick={() => toggleArrayFilter(selectedDishTypes, setSelectedDishTypes, key)}
                                            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${selectedDishTypes.includes(key) ? 'bg-[#6A907B] text-white border-[#6A907B]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#6A907B]'}`}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ТАБ 5: КУХНЯ */}
                        {activeTab === 'cuisine' && (
                            <div className="animate-fade-in flex flex-col h-full font-['Inter']">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">Кухня світу</h3>
                                <div className="flex flex-wrap gap-3 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                                    {Object.entries(DICTIONARIES.cuisine).map(([key, value]) => (
                                        <button
                                            key={key}
                                            onClick={() => toggleArrayFilter(selectedCuisines, setSelectedCuisines, key)}
                                            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${selectedCuisines.includes(key) ? 'bg-[#6A907B] text-white border-[#6A907B]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#6A907B]'}`}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ТАБ 6: СКЛАДНІСТЬ */}
                        {activeTab === 'difficulty' && (
                            <div className="animate-fade-in flex flex-col h-full font-['Inter']">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">Складність приготування</h3>
                                <div className="flex flex-wrap gap-4">
                                    {Object.entries(DICTIONARIES.difficulty).map(([key, value]) => (
                                        <button
                                            key={key}
                                            onClick={() => toggleArrayFilter(selectedDifficulties, setSelectedDifficulties, key)}
                                            className={`px-6 py-3 rounded-xl text-base font-bold transition-all border ${selectedDifficulties.includes(key) ? 'bg-[#6A907B] text-white border-[#6A907B]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#6A907B]'}`}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ТАБ 7: ЧАС */}
                        {activeTab === 'time' && (
                            <div className="animate-fade-in flex flex-col h-full font-['Inter']">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">Максимальний час (хвилин)</h3>
                                <div className="flex flex-wrap gap-4">
                                    {['15', '30', '45', '60', '120'].map(time => (
                                        <button
                                            key={time}
                                            onClick={() => setMaxTime(maxTime === time ? '' : time)}
                                            className={`px-6 py-3 rounded-xl text-base font-bold transition-all border ${maxTime === time ? 'bg-[#6A907B] text-white border-[#6A907B]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#6A907B]'}`}
                                        >
                                            До {time} хв
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ТАБ 8: КАЛОРИЙНІСТЬ */}
                        {activeTab === 'calories' && (
                            <div className="animate-fade-in flex flex-col h-full font-['Inter']">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">Калорійність (на 1 порцію)</h3>
                                <p className="text-gray-500 text-sm mb-5">Оберіть максимальну кількість калорій:</p>
                                <div className="flex flex-wrap gap-4">
                                    {['200', '300', '400', '500', '800'].map(cal => (
                                        <button
                                            key={cal}
                                            onClick={() => setMaxCalories(maxCalories === cal ? '' : cal)}
                                            className={`px-6 py-3 rounded-xl text-base font-bold transition-all border ${maxCalories === cal ? 'bg-[#6A907B] text-white border-[#6A907B]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#6A907B]'}`}
                                        >
                                            До {cal} ккал
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ТАБ 9: ДІЄТИ */}
                        {activeTab === 'diet' && (
                            <div className="animate-fade-in flex flex-col h-full font-['Inter']">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">Дієтичні обмеження</h3>
                                <div className="flex flex-wrap gap-3 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                                    {Object.entries(DICTIONARIES.dietary_tags).map(([key, value]) => (
                                        <button
                                            key={key}
                                            onClick={() => toggleArrayFilter(selectedDiets, setSelectedDiets, key)}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${selectedDiets.includes(key) ? 'bg-[#6A907B] text-white border-[#6A907B]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#6A907B]'}`}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ТАБ 10: СЕЗОННІСТЬ */}
                        {activeTab === 'season' && (
                            <div className="animate-fade-in flex flex-col h-full font-['Inter']">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">Сезонні продукти</h3>

                                <button
                                    onClick={() => setIsSeasonal(!isSeasonal)}
                                    className={`px-8 py-3.5 rounded-xl text-base font-bold transition-all border w-max shadow-sm mb-8 ${isSeasonal ? 'bg-[#6A907B] text-white border-[#6A907B]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#6A907B]'}`}
                                >
                                    {isSeasonal ? '✅ Увімкнено (Всі сезонні)' : 'Вимкнено (Показувати все)'}
                                </button>

                                <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Або оберіть конкретні місяці:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(MONTHS_DICT).map(([key, value]) => (
                                        <button
                                            key={key}
                                            onClick={() => toggleArrayFilter(selectedMonths, setSelectedMonths, key)}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${selectedMonths.includes(key) ? 'bg-[#B47231] text-white border-[#B47231]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#B47231]'}`}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* КНОПКА ПОШУКУ */}
                        {activeTab === 'ingredients' ? (
                            <div className="mt-8 -mb-4 relative z-20 font-['Inter']">
                                <button
                                    onClick={fetchRecipes}
                                    className="w-full md:w-[85%] py-4 bg-[#6A907B] text-white rounded-md font-bold text-[17px] hover:bg-[#5B826B] transition-colors shadow-md text-center tracking-wide"
                                >
                                    Знайти рецепт
                                </button>
                            </div>
                        ) : (
                            <div className="mt-auto pt-6 font-['Inter']">
                                <button
                                    onClick={fetchRecipes}
                                    className="w-full md:w-[85%] py-4 bg-[#6A907B] text-white rounded-md font-bold text-[17px] hover:bg-[#5B826B] transition-colors shadow-md text-center tracking-wide"
                                >
                                    Застосувати фільтри
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ================= НИЖНІЙ БЛОК: РЕЗУЛЬТАТИ ================= */}
                <div className="w-full">
                    {/* Хедер результатів */}
                    <div className="flex items-center justify-between mb-8 md:mb-12">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-4 h-4 md:w-5 md:h-5 bg-[#5B826B] shrink-0"></div>
                            <h2 className="text-xl md:text-2xl lg:text-[26px] font-['El_Messiri'] font-bold text-gray-800 tracking-wider uppercase whitespace-nowrap">
                                {searchQuery || selectedCuisines.length || selectedDiets.length || selectedDifficulties.length || maxTime || isSeasonal ? 'Результат пошуку' : 'Всі рецепти'}
                            </h2>
                        </div>
                        <div className="flex items-center gap-4 flex-grow">
                            <div className="flex-grow border-t-[3px] border-gray-300 ml-4 hidden sm:block"></div>
                            <span className="text-sm md:text-base font-semibold text-gray-500 font-['Inter'] whitespace-nowrap">
                                {recipes.length} {getPluralForm(recipes.length, ['рецепт', 'рецепти', 'рецептів'])}
                            </span>
                        </div>
                    </div>

                    {/* СІТКА КАРТОК */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <svg className="animate-spin h-10 w-10 text-[#5B826B]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        </div>
                    ) : recipes.length === 0 ? (
                        <div className="text-center text-gray-500 font-['Inter'] mt-10 text-lg bg-white rounded-3xl py-20 shadow-sm border border-gray-100">
                            За вашими критеріями нічого не знайдено. <br/> Спробуйте змінити фільтри.
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-x-10 lg:gap-x-14 md:gap-y-16">
                                {recipes.slice(0, visibleCount).map((recipe) => (
                                    <Link to={`/recipe/${recipe.id}`} key={recipe.id} className="flex flex-col relative group block w-full h-full">

                                        <div className="relative w-full h-64 sm:h-60 md:h-72 rounded-[2rem] overflow-hidden mb-5 shadow-sm">
                                            <img
                                                src={getImageUrl(recipe.image || recipe.image_url)}
                                                alt={recipe.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />

                                            {/* Кнопка "Улюблені" (Сіра, якщо не в улюблених, червона - якщо так) */}
                                            <button
                                                onClick={(e) => toggleFavorite(e, recipe)}
                                                className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                                                title={recipe.is_favorited ? "Видалити з улюблених" : "Додати в улюблені"}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill={recipe.is_favorited ? "#EF4444" : "none"} stroke={recipe.is_favorited ? "#EF4444" : "#9CA3AF"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                                </svg>
                                            </button>
                                        </div>

                                        <h3 className="text-center font-['El_Messiri'] font-bold text-[#1A1A1A] text-base sm:text-lg md:text-xl lg:text-2xl uppercase px-2 line-clamp-2 min-h-[48px] md:min-h-[56px] flex items-center justify-center group-hover:text-[#5B826B] transition-colors">
                                            {recipe.title}
                                        </h3>

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
                                                    {recipe.portions || 1} {getPluralForm(recipe.portions || 1, ['порція', 'порції', 'порцій'])}
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

                                        <div className="mt-auto">
                                            <div className="block w-full py-3 rounded-[20px] border border-gray-400 text-center font-['Inter'] font-medium text-[14px] md:text-[15px] text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white group-hover:border-[#1A1A1A] transition-colors">
                                                Переглянути
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* КНОПКА "ПОКАЗАТИ ЩЕ" */}
                            {visibleCount < recipes.length && (
                                <div className="flex justify-center mt-12 md:mt-16">
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 6)}
                                        className="px-10 py-3.5 bg-transparent border-2 border-[#5B826B] text-[#5B826B] rounded-full font-bold font-['Inter'] hover:bg-[#5B826B] hover:text-white transition-colors"
                                    >
                                        Показати ще рецепти
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Recipes;