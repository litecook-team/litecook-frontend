import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // ІМПОРТ ПЕРЕКЛАДУ

import api from '../api';
import { ENDPOINTS, API_URL, TOKEN_KEY } from '../constants/api';
import { DICTIONARIES } from '../constants/translations';
/// декоративне зображення
import decorImage from '../assets/recipe/fon_filter.jpg';

// Допоміжна функція для правильного відмінювання слів
const getPluralForm = (number, titles) => {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return titles[2];
    if (n1 > 1 && n1 < 5) return titles[1];
    if (n1 === 1) return titles[0];
    return titles[2];
};

const Recipes = () => {
    const { t, i18n } = useTranslation(); // ПІДКЛЮЧЕННЯ ПЕРЕКЛАДУ

    // Динамічні словники всередині компонента
    const MONTHS_DICT = {
        1: t('recipes_page.month_1'), 2: t('recipes_page.month_2'), 3: t('recipes_page.month_3'), 4: t('recipes_page.month_4'),
        5: t('recipes_page.month_5'), 6: t('recipes_page.month_6'), 7: t('recipes_page.month_7'), 8: t('recipes_page.month_8'),
        9: t('recipes_page.month_9'), 10: t('recipes_page.month_10'), 11: t('recipes_page.month_11'), 12: t('recipes_page.month_12')
    };

    const INGREDIENT_CATEGORIES_DICT = {
        'vegetables': t('recipes_page.cat_vegetables'), 'fruits': t('recipes_page.cat_fruits'), 'greens': t('recipes_page.cat_greens'),
        'mushrooms': t('recipes_page.cat_mushrooms'), 'meat_bird': t('recipes_page.cat_meat_bird'), 'meat_pork': t('recipes_page.cat_meat_pork'), 'meat_beef': t('recipes_page.cat_meat_beef'),
        'fish_red': t('recipes_page.cat_fish_red'), 'fish_white': t('recipes_page.cat_fish_white'), 'seafood': t('recipes_page.cat_seafood'),
        'cheese': t('recipes_page.cat_cheese'), 'dairy': t('recipes_page.cat_dairy'), 'grains': t('recipes_page.cat_grains'),
        'flour': t('recipes_page.cat_flour'), 'nuts': t('recipes_page.cat_nuts'), 'spices': t('recipes_page.cat_spices')
    };

    const TABS = [
        { id: 'ingredients', label: t('recipes_page.tab_ingredients') },
        { id: 'ingredient_cats', label: t('recipes_page.tab_categories') },
        { id: 'meal_time', label: t('recipes_page.tab_meal_time') },
        { id: 'dish_type', label: t('recipes_page.tab_dish_type') },
        { id: 'cuisine', label: t('recipes_page.tab_cuisine') },
        { id: 'difficulty', label: t('recipes_page.tab_difficulty') },
        { id: 'time', label: t('recipes_page.tab_time') },
        { id: 'calories', label: t('recipes_page.tab_calories') },
        { id: 'diet', label: t('recipes_page.tab_diet') },
        { id: 'season', label: t('recipes_page.tab_season') },
    ];

    const isAuthenticated = !!localStorage.getItem(TOKEN_KEY) || !!sessionStorage.getItem(TOKEN_KEY);
    const location = useLocation(); // для розуміння, чи ми щойно зайшли на сторінку

    // Функція для безпечного читання з sessionStorage
    const loadStateFromStorage = (key, defaultValue) => {
        try {
            const savedState = sessionStorage.getItem(`recipe_search_${key}`);
            if (savedState !== null) {
                return JSON.parse(savedState);
            }
        } catch (e) {
            console.error("Помилка читання з sessionStorage", e);
        }
        return defaultValue;
    };

    const [recipes, setRecipes] = useState(() => loadStateFromStorage('recipes', []));
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(() => loadStateFromStorage('visibleCount', 6));
    const [toastMessage, setToastMessage] = useState(null);

    // Ініціалізуємо activeTab, перевіряючи спочатку location.state, потім sessionStorage
    const [activeTab, setActiveTab] = useState(() => {
        // Якщо ми перейшли з головної і передали initialTab, пріоритет йому
        if (location.state && location.state.initialTab) {
            return location.state.initialTab;
        }
        return loadStateFromStorage('activeTab', 'ingredients');
    });

    // Стани для фільтрів
    const [searchQuery, setSearchQuery] = useState(() => loadStateFromStorage('searchQuery', ''));
    const [selectedCuisines, setSelectedCuisines] = useState(() => loadStateFromStorage('selectedCuisines', []));
    const [selectedDifficulties, setSelectedDifficulties] = useState(() => loadStateFromStorage('selectedDifficulties', []));
    const [selectedDiets, setSelectedDiets] = useState(() => loadStateFromStorage('selectedDiets', []));
    const [selectedDishTypes, setSelectedDishTypes] = useState(() => loadStateFromStorage('selectedDishTypes', []));
    const [selectedMealTimes, setSelectedMealTimes] = useState(() => loadStateFromStorage('selectedMealTimes', []));
    const [selectedMonths, setSelectedMonths] = useState(() => loadStateFromStorage('selectedMonths', []));
    const [selectedIngredientCategories, setSelectedIngredientCategories] = useState(() => loadStateFromStorage('selectedIngredientCategories', []));
    const [maxTime, setMaxTime] = useState(() => loadStateFromStorage('maxTime', ''));
    const [maxCalories, setMaxCalories] = useState(() => loadStateFromStorage('maxCalories', ''));
    const [isSeasonal, setIsSeasonal] = useState(() => loadStateFromStorage('isSeasonal', false));

    // Нові стани для бази інгредієнтів та підказок
    const [allIngredients, setAllIngredients] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Стан, який фіксує, чи БУЛО натиснуто кнопку пошуку з якимось фільтром
    const [hasActiveFilters, setHasActiveFilters] = useState(() => loadStateFromStorage('hasActiveFilters', false));

    // Стан для збереження останнього URL запиту (щоб уникати дублювання запитів на бекенд)
    const [lastQueryUrl, setLastQueryUrl] = useState(() => loadStateFromStorage('lastQueryUrl', ''));

    // Стан для відображення меню фільтрів на мобільному
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Стан для зберігання рецепту, обраного для модалки з інгредієнтами
    const [selectedRecipeForModal, setSelectedRecipeForModal] = useState(null);

    // Стан для збереження ID інгредієнтів з поточного пошуку (щоб знати, що є в наявності)
    const [matchedIngredientIds, setMatchedIngredientIds] = useState(() => loadStateFromStorage('matchedIngredientIds', []));

    // Стан для відстеження дублікатів при вводі
    const [duplicateError, setDuplicateError] = useState(null);

    // --- СТАНИ ДЛЯ ПОМИЛОК ПОРОЖНЬОГО ПОШУКУ ---
    const [emptyIngredientsError, setEmptyIngredientsError] = useState(false);
    const [emptyFilterError, setEmptyFilterError] = useState(false);

    // Таймери для авто-зникнення помилок
    const errorTimeoutRef = useRef(null);

    const showError = (type, value = true) => {
        // Очищаємо попередній таймер, якщо він був
        if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
        }

        // Встановлюємо нову помилку
        if (type === 'duplicate') {
            setDuplicateError(value);
        } else {
            if (type === 'emptyIngredients') setEmptyIngredientsError(value);
            if (type === 'emptyFilter') setEmptyFilterError(value);

            // Встановлюємо таймер на зникнення тільки для повідомлень про порожній пошук
            errorTimeoutRef.current = setTimeout(() => {
                setEmptyIngredientsError(false);
                setEmptyFilterError(false);
            }, 3000);
        }
    };

    // Створюємо масив всіх фільтрів, щоб було зручно стежити
    useEffect(() => {
        const stateToSave = {
            recipes, visibleCount, activeTab, searchQuery,
            selectedCuisines, selectedDifficulties, selectedDiets,
            selectedDishTypes, selectedMealTimes, selectedMonths,
            selectedIngredientCategories, maxTime, maxCalories,
            isSeasonal, hasActiveFilters, matchedIngredientIds, lastQueryUrl
        };

        // Зберігаємо кожен стан окремо для зручності
        Object.entries(stateToSave).forEach(([key, value]) => {
             sessionStorage.setItem(`recipe_search_${key}`, JSON.stringify(value));
        });
    }, [recipes, visibleCount, activeTab, searchQuery, selectedCuisines, selectedDifficulties, selectedDiets, selectedDishTypes, selectedMealTimes, selectedMonths, selectedIngredientCategories, maxTime, maxCalories, isSeasonal, hasActiveFilters, matchedIngredientIds, lastQueryUrl]);

    useEffect(() => {
        // 1. Завантажуємо всі інгредієнти з БД для підказок та списку
        // (вони автоматично оновляться при зміні мови)
        const fetchIngredients = async () => {
            try {
                const res = await api.get('/api/ingredients/?limit=1000');
                setAllIngredients(res.data.results || res.data);
            } catch (e) {
                console.error("Не вдалося завантажити базу інгредієнтів", e);
            }
        };
        fetchIngredients();
    }, [i18n.language]);

    // ЛОГІКА ОЧИЩЕННЯ ТА ПЕРЕЗАВАНТАЖЕННЯ РЕЦЕПТІВ (При зміні мови - перезавантажуємо!)
    useEffect(() => {
        const isFromRecipeDetail = location.state?.fromRecipe === true;
        const hasInitialTab = location.state?.initialTab !== undefined;

        if (isFromRecipeDetail && loadStateFromStorage('recipes', []).length > 0) {
            // Перезавантажуємо примусово, щоб отримати нову мову, але не скидаємо фільтри
            fetchRecipes(false, lastQueryUrl ? 'reload_same_url' : null);
        } else if (hasInitialTab) {
            clearAllFiltersStorageOnly();
            setActiveTab(location.state.initialTab);
            setTimeout(() => fetchRecipes(false, 'clear'), 0);
        } else {
            clearAllFiltersStorageOnly();
            setActiveTab('ingredients');
            setTimeout(() => fetchRecipes(false, 'clear'), 0);
        }
        window.scrollTo(0, 0);
    }, [location.state, i18n.language]); // РЕАГУЄ НА ЗМІНУ МОВИ

    // Закриття підказок при кліку поза ними
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
                inputRef.current && !inputRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Перетворюємо рядок "картопля банан, морква" у формат "картопля, банан, морква"
    const formatQueryForBackend = (query) => {
        if (!query) return '';
        const terms = query.split(/[\s,]+/).filter(t => t.trim().length > 0);
        return terms.join(', ');
    };

    // Допоміжна функція для пошуку ID інгредієнтів за поточним пошуковим запитом
    const getIngredientIdsFromSearch = (query) => {
        if (!query) return [];
        // Розбиваємо ТІЛЬКИ по комах, щоб фрази типу "білий рис" залишалися цілими
        const terms = query.toLowerCase().split(',').map(t => t.trim()).filter(t => t.length > 0);

        const matchedIds = [];
        terms.forEach(term => {
            // Використовуємо === для ТОЧНОГО 100% збігу, а не .includes()
            const match = allIngredients.find(ing => ing.name.toLowerCase() === term);
            if (match) {
                matchedIds.push(match.id);
            }
        });
        return [...new Set(matchedIds)]; // Унікальні ID
    };

    const fetchRecipes = async (isUserAction = true, overrideParams = null) => {
        if (isUserAction && overrideParams !== 'clear' && overrideParams !== 'reload_same_url') {
            const hasSearchQuery = searchQuery.trim() !== '';
            const hasFilters =
                selectedCuisines.length > 0 ||
                selectedDifficulties.length > 0 ||
                selectedDiets.length > 0 ||
                selectedDishTypes.length > 0 ||
                selectedMealTimes.length > 0 ||
                selectedMonths.length > 0 ||
                selectedIngredientCategories.length > 0 ||
                maxTime !== '' ||
                maxCalories !== '' ||
                isSeasonal;

            // Логіка перевірки порожнього пошуку залежно від табу
            if (activeTab === 'ingredients' && !hasSearchQuery) {
                showError('emptyIngredients');
                setEmptyFilterError(false); // Скидаємо помилку іншого табу
                setDuplicateError(null); // Очищаємо помилку дублікату, якщо вона є
                return;
            } else if (activeTab !== 'ingredients' && !hasFilters) {
                // ВИПРАВЛЕНО: Тепер ми вимагаємо наявність фільтрів незалежно від того, чи є інгредієнти
                showError('emptyFilter');
                setEmptyIngredientsError(false);
                return;
            }

            // Якщо перевірки пройдені, скидаємо помилки
            setEmptyIngredientsError(false);
            setEmptyFilterError(false);
        }

        setLoading(true);
        try {
            let url = '';
            let currentMatchedIds = [];

            // Отримуємо 100% точні ID з бази
            if (overrideParams === 'clear') {
                setMatchedIngredientIds([]);
            } else if (overrideParams === 'reload_same_url') {
                // ФІКС: Якщо ми просто перезавантажуємо сторінку після повернення,
                // беремо вже збережені ID інгредієнтів (вони не залежать від мови),
                // замість того, щоб шукати їх заново за текстом попередньої мови.
                currentMatchedIds = matchedIngredientIds;
            } else {
                // Звичайний новий пошук
                currentMatchedIds = getIngredientIdsFromSearch(searchQuery);
                setMatchedIngredientIds(currentMatchedIds);
            }

            if (overrideParams === 'clear') {
                url = `${ENDPOINTS.RECIPES}`;
                setHasActiveFilters(false);
            } else if (overrideParams === 'reload_same_url') {
                url = lastQueryUrl || `${ENDPOINTS.RECIPES}`;
            } else {
                const params = new URLSearchParams();
                const hasSearch = searchQuery.trim() !== '';

                // === ЛОГІКА ПЕРЕДАЧІ ПАРАМЕТРІВ ===
                if (hasSearch && currentMatchedIds.length > 0) {
                    params.append('ingredients', currentMatchedIds.join(','));
                    url = `${ENDPOINTS.RECIPES}match/?${params.toString()}`;
                } else if (hasSearch && currentMatchedIds.length === 0) {
                    params.append('search_query', formatQueryForBackend(searchQuery));
                    url = `${ENDPOINTS.RECIPES}match/?${params.toString()}`;
                } else {
                    url = `${ENDPOINTS.RECIPES}?${params.toString()}`;
                }

                // [Додавання всіх інших фільтрів]
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

                if (!url.includes('?')) {
                     url = `${ENDPOINTS.RECIPES}?${params.toString()}`;
                } else {
                     const filterStr = params.toString();
                     if (filterStr && !url.endsWith(filterStr)) {
                         url = url.split('?')[0] + '?' + filterStr;
                     }
                }

                if (isUserAction) {
                    const isFiltering = Array.from(params.keys()).length > 0;
                    setHasActiveFilters(isFiltering);
                }
            }

            // Запобігання дублюванню запитів до сервера
            // Якщо це не очищення фільтрів і новий URL збігається зі старим, нічого не робимо
            if (isUserAction && overrideParams !== 'clear' && overrideParams !== 'reload_same_url' && url === lastQueryUrl) {
                setLoading(false);
                return;
            }

            const response = await api.get(url);
            setRecipes(response.data.results || response.data);

            // Оновлюємо модалку, якщо вона відкрита і ми переклали мову
            if (selectedRecipeForModal) {
                const updatedRecipe = (response.data.results || response.data).find(r => r.id === selectedRecipeForModal.id);
                if (updatedRecipe) setSelectedRecipeForModal(updatedRecipe);
            }

            setVisibleCount(6);
            setShowSuggestions(false);
            setLastQueryUrl(url);

        } catch (error) {
            console.error("Помилка завантаження рецептів:", error);
            showToast("❌ Помилка завантаження рецептів");
        } finally {
            setLoading(false);
        }
    };

    // Допоміжна функція: Тільки очищення стейтів і сторіджу
    const clearAllFiltersStorageOnly = () => {
        setSearchQuery('');
        setSelectedCuisines([]);
        setSelectedDifficulties([]);
        setSelectedDiets([]);
        setSelectedDishTypes([]);
        setSelectedMealTimes([]);
        setSelectedMonths([]);
        setSelectedIngredientCategories([]);
        setMaxTime('');
        setMaxCalories('');
        setIsSeasonal(false);
        setDuplicateError(null);
        setLastQueryUrl('');
        setMatchedIngredientIds([]);

        const keysToRemove = [
            'recipes', 'visibleCount', 'activeTab', 'searchQuery',
            'selectedCuisines', 'selectedDifficulties', 'selectedDiets',
            'selectedDishTypes', 'selectedMealTimes', 'selectedMonths',
            'selectedIngredientCategories', 'maxTime', 'maxCalories',
            'isSeasonal', 'hasActiveFilters', 'matchedIngredientIds', 'lastQueryUrl'
        ];
        keysToRemove.forEach(key => sessionStorage.removeItem(`recipe_search_${key}`));
    };

    // Ця функція прив'язана до кнопки "Очистити фільтри".
    // Вона викликає попередню функцію, а потім оновлює UI.
    const clearAllFilters = () => {
        // 1. Чистимо всі стани і sessionStorage
        clearAllFiltersStorageOnly();

        // 2. Робимо запит за всіма рецептами, щоб оновити картки на екрані
        setTimeout(() => fetchRecipes(true, 'clear'), 0);

        // 3. Прибираємо будь-які червоні попередження, якщо вони були
        setEmptyIngredientsError(false);
        setEmptyFilterError(false);
    };

    // Скидаємо помилки при перемиканні табів
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setEmptyIngredientsError(false);
        setEmptyFilterError(false);
    };

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const toggleFavorite = async (e, recipe) => {
        e.preventDefault();

        try {
            if (recipe.is_favorited) {
                await api.delete(`${ENDPOINTS.FAVORITES}${recipe.id}/`);
                setRecipes(recipes.map(r => r.id === recipe.id ? { ...r, is_favorited: false } : r));
                showToast(t('recipe_detail_page.toast_fav_removed'));
            } else {
                await api.post(ENDPOINTS.FAVORITES, { recipe: recipe.id });
                setRecipes(recipes.map(r => r.id === recipe.id ? { ...r, is_favorited: true } : r));
                showToast(t('recipe_detail_page.toast_fav_added'));
            }
        } catch (error) {
            showToast(t('recipe_detail_page.toast_fav_error'));
        }
    };

    const toggleArrayFilter = (state, setState, value) => {
        setState(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]);
        setEmptyFilterError(false); // Прибираємо помилку при виборі фільтра
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${API_URL}${path}`;
    };

    // ================= ЛОГІКА ІНТЕЛЕКТУАЛЬНОГО ПОШУКУ ТА РЕГІСТРУ =================

    const capitalizeSearch = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const getCurrentSearchTerm = () => {
        if (!searchQuery) return '';
        // Розбиваємо ТІЛЬКИ по комах (зберігаючи пробіли всередині слів)
        const parts = searchQuery.split(',').map(p => p.trim());
        return parts[parts.length - 1].toLowerCase();
    };

    const currentTerm = getCurrentSearchTerm();
    const suggestedIngredients = currentTerm.length > 0
        ? allIngredients.filter(ing => ing.name.toLowerCase().includes(currentTerm))
        : [];

    // Перевіряє, чи є інгредієнт вже в рядку (розділеному ТІЛЬКИ комами)
    const isIngredientInQuery = (query, ingredientName) => {
        if (!query) return false;
        const queryTerms = query.toLowerCase().split(',').map(t => t.trim()).filter(t => t.length > 0);
        return queryTerms.includes(ingredientName.toLowerCase().trim());
    };

    const handleAddIngredientToSearch = (ingredientName) => {
        // 1. ПЕРЕВІРКА НА ДУБЛЮВАННЯ
        if (isIngredientInQuery(searchQuery, ingredientName)) {
            showError('duplicate', ingredientName);
            setShowSuggestions(false);
            if (inputRef.current) inputRef.current.focus();
            return;
        }

        // 2. Якщо не дубль, додаємо
        setDuplicateError(null);
        setEmptyIngredientsError(false); // Скидаємо помилку пустого вводу
        const query = searchQuery;
        const lastIndex = query.lastIndexOf(',');

        let newQuery = '';
        if (lastIndex === -1) {
            newQuery = ingredientName + ', ';
        } else {
            // Зберігаємо все до останньої коми, і додаємо новий інгредієнт
            newQuery = query.substring(0, lastIndex + 1).trim() + ' ' + ingredientName + ', ';
        }

        setSearchQuery(capitalizeSearch(newQuery));
        setShowSuggestions(false);
        if (inputRef.current) inputRef.current.focus();
    };

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setSearchQuery(capitalizeSearch(newValue));
        setShowSuggestions(true);

        // 1. Очищаємо помилку відразу
        setDuplicateError(null);
        setEmptyIngredientsError(false); // Скидаємо помилку пустого вводу при ручному вводі

        // 2. Смарт-перевірка на дублікати при ручному вводі
        // Розбиваємо ТІЛЬКИ по комах
        const terms = newValue.toLowerCase().split(',').map(t => t.trim()).filter(Boolean);

        if (terms.length < 2) return;

        // Перевіряємо наявність дублікатів серед термінів
        const uniqueTerms = new Set(terms);

        if (uniqueTerms.size !== terms.length) {
            // Знаходимо слово, яке дублюється
            const duplicates = terms.filter((item, index) => terms.indexOf(item) !== index);
            const duplicatedWord = duplicates[0];

            const foundIng = allIngredients.find(ing => ing.name.toLowerCase() === duplicatedWord);
            showError('duplicate', foundIng ? foundIng.name : capitalizeSearch(duplicatedWord));
        }
    };

    // Підрахунок активних фільтрів для мобільного меню
    // const getActiveFiltersCount = () => {
    //     return (searchQuery ? 1 : 0) +
    //         selectedCuisines.length +
    //         selectedDifficulties.length +
    //         selectedDiets.length +
    //         selectedDishTypes.length +
    //         selectedMealTimes.length +
    //         selectedMonths.length +
    //         selectedIngredientCategories.length +
    //         (maxTime ? 1 : 0) +
    //         (maxCalories ? 1 : 0) +
    //         (isSeasonal ? 1 : 0);
    // };

    // Допоміжна функція для форматування кількості
    const formatAmount = (amount, unit) => {
        if (amount === null || parseFloat(amount) === 0) {
            const unitTrans = DICTIONARIES.units[unit];
            if (['taste', 'garnish', 'frying'].includes(unit)) return unitTrans;
            return `за потребою / 1 ${Array.isArray(unitTrans) ? unitTrans[0] : unitTrans}`;
        }
        const numAmount = parseFloat(amount);
        const unitData = DICTIONARIES.units[unit];
        return `${numAmount} ${Array.isArray(unitData) ? getPluralForm(numAmount, unitData) : (unitData || unit)}`;
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
                <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-4 sm:p-6 lg:p-10 mb-16 relative overflow-hidden flex flex-col lg:flex-row gap-6 lg:gap-8 min-h-[480px]">

                    {/* ФОНОВЕ ЗОБРАЖЕННЯ НА ВЕСЬ БЛОК */}
                    <div className="absolute inset-0 z-0 pointer-events-none"
                         style={{
                             backgroundImage: `url(${decorImage})`,
                             backgroundSize: 'cover', // Розтягує зображення на весь блок. Можна спробувати '100% 100%' або 'contain'
                             backgroundPosition: 'left center', // Зображення вирівнюється по лівому краю і центру
                             backgroundRepeat: 'no-repeat',
                             transform: 'scaleX(-1)'
                         }}>
                    </div>

                    {/* ЛІВА КОЛОНКА: ТАБИ */}
                    <div className="w-full lg:w-48 xl:w-56 shrink-0 z-10 flex flex-col relative">

                        {/* ЄДИНИЙ ЗАГОЛОВОК "ФІЛЬТРИ" ДЛЯ ВСІХ ЕКРАНІВ */}
                        <div className="mb-3 lg:mb-4 inline-block w-max">
                            <h3 className="font-['El_Messiri'] font-bold text-xl text-gray-800 px-3 py-1 bg-white/70 backdrop-blur-md rounded-lg shadow-sm border border-white/50">
                                {t('recipes_page.filters_title')}
                            </h3>
                        </div>

                        {/* Блок з табами для мобільних (сітка) */}
                        <div className="block lg:hidden w-full mb-4">
                            <div className="grid grid-cols-2 gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {TABS.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`py-2.5 px-3 rounded-lg font-['Inter'] font-semibold text-[13px] transition-all text-center border whitespace-nowrap cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out active:scale-95 group ${
                                            activeTab === tab.id
                                            ? 'bg-[#5B826B] text-white border-[#5B826B] shadow-md'
                                            : 'bg-white/90 text-gray-600 border-gray-200 hover:bg-gray-50 shadow-sm'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Звичайний список кнопок для ПК (від lg і вище) */}
                        <div className="hidden lg:flex flex-col gap-2.5 flex-grow">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`px-5 py-3.5 rounded-xl font-['Inter'] font-semibold text-[15px] transition-all text-left shrink-0 border cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out active:scale-95 group ${
                                        activeTab === tab.id
                                        ? 'bg-[#5B826B] text-white border-[#5B826B] shadow-md'
                                        : 'bg-white/80 backdrop-blur-sm text-gray-700 border-gray-200 hover:bg-white hover:border-[#5B826B] hover:text-[#5B826B]'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ПРАВА КОЛОНКА: КОНТЕНТ ФІЛЬТРУ */}
                    <div className="flex-grow z-10 flex flex-col h-full bg-white/40 md:bg-white/40 backdrop-blur-xl md:backdrop-blur-md rounded-3xl p-4 sm:p-6 md:p-8 relative">

                        <div className="flex items-center justify-between border-b-2 border-gray-400 pb-3 mb-6 md:mb-8 mt-1">
                            {hasActiveFilters ? (
                                <button
                                    onClick={clearAllFilters}
                                    className="flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-['Inter'] text-[13px] font-bold px-4 py-1.5 rounded-full border border-red-200 shadow-sm animate-fade-in"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    <span className="hidden sm:inline cursor-pointer transition-all duration-300 ease-out active:scale-95 group">{t('recipes_page.clear_filters')}</span>
                                </button>
                            ) : (
                                <div></div>
                            )}

                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-[#6A907B] mr-2 shrink-0"></div>
                                <span className="font-['El_Messiri'] font-bold text-gray-800 tracking-wider uppercase text-sm text-xl">
                                    {t('recipes_page.pick_recipe')}
                                </span>
                            </div>
                        </div>

                        {/* ТАБ 1: ІНГРЕДІЄНТИ / ПОШУК */}
                        {activeTab === 'ingredients' && (
                            <div className="animate-fade-in flex flex-col h-full font-['El_Messiri']">
                                <h3 className="text-[22px] md:text-[28px] font-bold text-[#1A1A1A] mb-5">{t('recipes_page.enter_ingredients')}</h3>

                                {/* БЛОК ПОШУКУ З ПІДКАЗКАМИ */}
                                <div className="relative mb-6 shrink-0" ref={suggestionsRef}>

                                    {/* Повідомлення про дублювання НАД інпутом */}
                                    {duplicateError && (
                                        <div className="absolute -top-8 left-0 animate-fade-in w-max px-3 py-1.5 bg-red-100 border border-red-300 rounded-lg text-red-700 text-[12px] sm:text-[13px] font-medium flex items-center gap-1.5 shadow-sm z-20">
                                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                            <span>{t('recipes_page.err_duplicate', { name: duplicateError })}</span>
                                        </div>
                                    )}

                                    {/* Повідомлення про порожній ввід */}
                                    {emptyIngredientsError && !duplicateError && (
                                        <div className="absolute -top-8 left-0 animate-fade-in w-max px-3 py-1.5 bg-red-100 border border-red-300 rounded-lg text-red-700 text-[12px] sm:text-[13px] md:text-[15px] font-medium flex items-center gap-1.5 shadow-sm z-20">
                                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                            <span>{t('recipes_page.err_empty')}</span>
                                        </div>
                                    )}

                                    <p className="text-[12px] sm:text-[13px] md:text-[15px] text-gray-800 text-green-900 -mt-4 px-2">
                                        {t('recipes_page.hint_comma')}
                                    </p>
                                    <div className="relative shadow-sm rounded-xl flex">
                                        <div className="relative flex-grow">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={searchQuery}
                                                onChange={handleInputChange}
                                                onFocus={() => setShowSuggestions(true)}
                                                onKeyDown={(e) => e.key === 'Enter' && fetchRecipes()}
                                                placeholder={t('recipes_page.placeholder_ingredients')}
                                                className={`w-full bg-white border-2 rounded-xl px-5 py-4 pl-12 pr-10 outline-none transition-colors text-gray-800 font-medium font-['Inter'] ${
                                                    (duplicateError || emptyIngredientsError)
                                                    ? 'border-red-300 focus:border-red-500 bg-red-50/50 text-red-900 placeholder-red-300' 
                                                    : 'border-gray-200 focus:border-[#6A907B]'
                                                }`}
                                            />
                                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>

                                            {/* Кнопка очищення (хрестик), якщо є текст */}
                                            {searchQuery && (
                                                <button
                                                    onClick={() => {
                                                        setSearchQuery('');
                                                        setDuplicateError(null);
                                                        setEmptyIngredientsError(false);
                                                        if (inputRef.current) inputRef.current.focus();
                                                    }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                                                    title={t('recipes_page.clear_filters')}
                                                >
                                                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Випадаючий список підказок */}
                                    {showSuggestions && suggestedIngredients.length > 0 && (
                                        <ul className="absolute top-[105%] left-0 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto py-2 custom-scrollbar z-50 font-['Inter']">
                                            {suggestedIngredients.map(ing => (
                                                <li
                                                    key={ing.id}
                                                    onClick={() => handleAddIngredientToSearch(ing.name)}
                                                    className="flex items-center gap-4 px-5 py-2.5 hover:bg-[#F6F7FB] cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                                                >
                                                    {ing.image ? (
                                                        <img src={getImageUrl(ing.image)} className="w-8 h-8 rounded-full object-cover shadow-sm bg-gray-100" alt="" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs shadow-sm">•</div>
                                                    )}
                                                    <span className="font-medium text-gray-800 text-[15px] capitalize">{ing.name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Дві колонки: Скролячий список (Швидкий вибір) та Інфо блок */}
                                <div className="flex flex-col lg:flex-row gap-5 flex-grow font-['Inter'] min-h-[220px]">

                                    {/* Ліва колонка: ШВИДКИЙ СКРОЛЯЧИЙ СПИСОК ІНГРЕДІЄНТІВ */}
                                    <div className="w-full lg:w-[60%] flex flex-col bg-white border border-gray-200 rounded-2xl p-4 shadow-sm max-h-[320px]">
                                        <p className="text-[14px] font-bold text-gray-800 mb-3 flex items-center gap-1 shrink-0">
                                            {t('recipes_page.quick_choice')} <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                                        </p>

                                        {allIngredients.length > 0 ? (
                                            <div className="flex flex-wrap gap-2.5 overflow-y-auto custom-scrollbar pr-2 content-start flex-grow">
                                                {allIngredients
                                                    .filter(ing => !isIngredientInQuery(searchQuery, ing.name))
                                                    .map(ing => (
                                                    <button
                                                        key={ing.id}
                                                        onClick={() => handleAddIngredientToSearch(ing.name)}
                                                        className="px-3.5 py-1.5 bg-white border border-gray-200 rounded-full text-[13.5px] font-medium text-gray-700 hover:border-[#6A907B] hover:text-[#6A907B] transition-all flex items-center gap-2 shadow-sm cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out active:scale-95 group"
                                                    >
                                                        {ing.image ? (
                                                            <img src={getImageUrl(ing.image)} alt={ing.name} className="w-5 h-5 rounded-full object-cover bg-gray-50" />
                                                        ) : (
                                                            <span className="text-gray-400">•</span>
                                                        )}
                                                        <span className="capitalize">{ing.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500 italic py-4">{t('recipes_page.loading_ingredients')}</div>
                                        )}

                                        {/* ПУНКТ 2/7: Кнопка пошуку для мобільних екранів ТІЛЬКИ на табі інгредієнтів (всередині лівої колонки) */}
                                        <div className="block lg:hidden mt-4 pt-2 border-t border-gray-100 font-['Inter'] shrink-0 flex flex-col sm:flex-row items-center gap-4">
                                            <button
                                                onClick={() => fetchRecipes(true)}
                                                className="w-full py-3 bg-[#6A907B] text-white rounded-xl font-bold text-[17px] hover:bg-[#5B826B] transition-colors shadow-lg text-center tracking-wide block cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out hover:shadow-[0_12px_25px_rgba(180,114,49,0.15)] active:scale-95 group"
                                            >
                                                {t('recipes_page.find_recipe_btn')}
                                            </button>
                                        </div>
                                    </div>


                                    {/* Права колонка: ІНФОРМАЦІЯ ТА ПРОМО */}
                                    <div className="w-full lg:w-[40%] flex flex-col">
                                        <div className="bg-[#FDFBF7] border-2 border-[#DCE8D9] rounded-2xl p-5 shadow-sm flex flex-col h-full">

                                            <h4 className="font-bold text-[#B47231] uppercase tracking-wider mb-3 text-[13px] flex items-center gap-2">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                                {hasActiveFilters ? t('recipes_page.results') : t('recipes_page.all_dishes')}
                                            </h4>

                                            <div className="text-gray-800 text-[14px] mb-4">
                                                {hasActiveFilters ? (
                                                    <>
                                                        {t('recipes_page.found_recipes')} <span className="font-bold text-lg ml-1 text-[#1A1A1A]">{recipes.length}</span>
                                                        <p className="text-[12px] text-gray-500 mt-1 leading-tight">
                                                            {t('recipes_page.by_your_criteria')}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        {t('recipes_page.available_recipes')} <span className="font-bold text-lg ml-1 text-[#1A1A1A]">{recipes.length}</span>
                                                        <p className="text-[12px] text-gray-500 mt-1 leading-tight">
                                                            {t('recipes_page.select_filters_hint')}
                                                        </p>
                                                    </>
                                                )}
                                            </div>

                                            {/* Блок промо реєстрації для гостей */}
                                            {!isAuthenticated ? (
                                                <div className="mt-auto bg-[#DCE8D9]/40 rounded-xl p-4 border border-[#DCE8D9]">
                                                    <h5 className="font-bold text-[#5B826B] mb-2 text-sm">{t('recipes_page.promo_shopping_title')}</h5>
                                                    <p className="text-[12px] text-gray-600 mb-4 leading-relaxed">
                                                        {t('recipes_page.promo_shopping_desc')}
                                                    </p>
                                                    <Link to="/register" className="block text-center w-full py-2.5 bg-[#5B826B] text-white rounded-lg text-[13px] font-semibold hover:bg-[#42705D] transition-colors shadow-sm">
                                                        {t('recipes_page.register_btn')}
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div className="mt-auto bg-[#DCE8D9]/40 rounded-xl p-4 border border-[#DCE8D9]">
                                                    <h5 className="font-bold text-[#5B826B] mb-2 text-sm">{t('recipes_page.promo_menu_title')}</h5>
                                                    <p className="text-[12px] text-gray-600 leading-relaxed">
                                                        {t('recipes_page.promo_menu_desc')}
                                                    </p>
                                                </div>
                                            )}

                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                        {/* ТАБ 2: ГРУПИ ПРОДУКТІВ */}
                        {activeTab === 'ingredient_cats' && (
                            <div className="animate-fade-in flex flex-col h-full font-['Inter']">
                                <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wider">{t('recipes_page.tab_categories')}</h3>
                                <p className="text-gray-500 text-sm mb-5">{t('recipes_page.cat_hint')}</p>
                                <div className="flex flex-wrap gap-3 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                                    {Object.entries(INGREDIENT_CATEGORIES_DICT).map(([key, value]) => {
                                        // Логіка для визначення базових класів
                                        const isSelected = selectedIngredientCategories.includes(key);
                                        const baseClasses = isSelected
                                            ? 'bg-[#6A907B] text-white border-[#6A907B] shadow-md'
                                            : emptyFilterError // Якщо помилка - робимо рамку і фон червоними
                                                ? 'bg-red-50 text-red-900 border-red-400'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#6A907B]';

                                        return (
                                            <button
                                                key={key}
                                                onClick={() => {
                                                    toggleArrayFilter(selectedIngredientCategories, setSelectedIngredientCategories, key);
                                                    setEmptyFilterError(false); // Прибираємо помилку при кліку
                                                }}
                                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out active:scale-95 group ${baseClasses}`}
                                            >
                                                {value}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ТАБ 3: ПРИЙОМ ЇЖІ */}
                        {activeTab === 'meal_time' && (
                            <div className="animate-fade-in flex flex-col h-full font-['Inter']">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">{t('recipes_page.tab_meal_time')}</h3>
                                <div className="flex flex-wrap gap-3">
                                    {Object.entries(DICTIONARIES.meal_times).map(([key, value]) => {
                                        const isSelected = selectedMealTimes.includes(key);
                                        const baseClasses = isSelected
                                            ? 'bg-[#6A907B] text-white border-[#6A907B] shadow-md'
                                            : emptyFilterError
                                                ? 'bg-red-50 text-red-900 border-red-400'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#6A907B]';
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => {
                                                    toggleArrayFilter(selectedMealTimes, setSelectedMealTimes, key);
                                                    setEmptyFilterError(false);
                                                }}
                                                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out active:scale-95 group ${baseClasses}`}
                                            >
                                                {value}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ТАБ 4: ТИП СТРАВИ */}
                        {activeTab === 'dish_type' && (
                            <div className="animate-fade-in flex flex-col h-full font-['Inter']">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">{t('recipes_page.tab_dish_type')}</h3>
                                <div className="flex flex-wrap gap-3 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                                    {Object.entries(DICTIONARIES.dish_types).map(([key, value]) => {
                                        const isSelected = selectedDishTypes.includes(key);
                                        const baseClasses = isSelected
                                            ? 'bg-[#6A907B] text-white border-[#6A907B] shadow-md'
                                            : emptyFilterError
                                                ? 'bg-red-50 text-red-900 border-red-400'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#6A907B]';
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => {
                                                    toggleArrayFilter(selectedDishTypes, setSelectedDishTypes, key);
                                                    setEmptyFilterError(false);
                                                }}
                                                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out active:scale-95 group ${baseClasses}`}
                                            >
                                                {value}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ТАБ 5: КУХНЯ */}
                        {activeTab === 'cuisine' && (
                            <div className="animate-fade-in flex flex-col h-full font-['Inter']">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">{t('recipes_page.tab_cuisine_world')}</h3>
                                <div className="flex flex-wrap gap-3 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                                    {Object.entries(DICTIONARIES.cuisine).map(([key, value]) => {
                                        const isSelected = selectedCuisines.includes(key);
                                        const baseClasses = isSelected
                                            ? 'bg-[#6A907B] text-white border-[#6A907B] shadow-md'
                                            : emptyFilterError
                                                ? 'bg-red-50 text-red-900 border-red-400'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#6A907B]';
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => {
                                                    toggleArrayFilter(selectedCuisines, setSelectedCuisines, key);
                                                    setEmptyFilterError(false);
                                                }}
                                                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out active:scale-95 group ${baseClasses}`}
                                            >
                                                {value}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ТАБ 6: СКЛАДНІСТЬ */}
                        {activeTab === 'difficulty' && (
                            <div className="animate-fade-in flex flex-col h-full font-['Inter']">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">{t('recipes_page.tab_diff_prep')}</h3>
                                <div className="flex flex-wrap gap-4">
                                    {Object.entries(DICTIONARIES.difficulty).map(([key, value]) => {
                                        const isSelected = selectedDifficulties.includes(key);
                                        const baseClasses = isSelected
                                            ? 'bg-[#6A907B] text-white border-[#6A907B] shadow-md'
                                            : emptyFilterError
                                                ? 'bg-red-50 text-red-900 border-red-400'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#6A907B]';
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => {
                                                    toggleArrayFilter(selectedDifficulties, setSelectedDifficulties, key);
                                                    setEmptyFilterError(false);
                                                }}
                                                className={`px-6 py-3 rounded-xl text-base font-bold transition-all border cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out active:scale-95 group ${baseClasses}`}
                                            >
                                                {value}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ТАБ 7: ЧАС */}
                        {activeTab === 'time' && (
                            <div className="animate-fade-in flex flex-col h-full font-['Inter']">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">{t('recipes_page.tab_max_time')}</h3>
                                <div className="flex flex-wrap gap-4">
                                    {['15', '30', '45', '60', '120'].map(time => {
                                        const isSelected = maxTime === time;
                                        const baseClasses = isSelected
                                            ? 'bg-[#6A907B] text-white border-[#6A907B] shadow-md'
                                            : emptyFilterError
                                                ? 'bg-red-50 text-red-900 border-red-400'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#6A907B]';
                                        return (
                                            <button
                                                key={time}
                                                onClick={() => {
                                                    setMaxTime(maxTime === time ? '' : time);
                                                    setEmptyFilterError(false);
                                                }}
                                                className={`px-6 py-3 rounded-xl text-base font-bold transition-all border cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out active:scale-95 group ${baseClasses}`}
                                            >
                                                {t('recipes_page.up_to_mins', { time })}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ТАБ 8: КАЛОРИЙНІСТЬ */}
                        {activeTab === 'calories' && (
                            <div className="animate-fade-in flex flex-col h-full font-['Inter']">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">{t('recipes_page.tab_calories_portion')}</h3>
                                <p className="text-gray-500 text-sm mb-5">{t('recipes_page.cal_hint')}</p>
                                <div className="flex flex-wrap gap-4">
                                    {['200', '300', '400', '500', '800'].map(cal => {
                                        const isSelected = maxCalories === cal;
                                        const baseClasses = isSelected
                                            ? 'bg-[#6A907B] text-white border-[#6A907B] shadow-md'
                                            : emptyFilterError
                                                ? 'bg-red-50 text-red-900 border-red-400'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#6A907B]';
                                        return (
                                            <button
                                                key={cal}
                                                onClick={() => {
                                                    setMaxCalories(maxCalories === cal ? '' : cal);
                                                    setEmptyFilterError(false);
                                                }}
                                                className={`px-6 py-3 rounded-xl text-base font-bold transition-all border cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out active:scale-95 group ${baseClasses}`}
                                            >
                                                {t('recipes_page.up_to_kcal', { cal })}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ТАБ 9: ДІЄТИ */}
                        {activeTab === 'diet' && (
                            <div className="animate-fade-in flex flex-col h-full font-['Inter']">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">{t('recipes_page.tab_diet')}</h3>
                                <div className="flex flex-wrap gap-3 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                                    {Object.entries(DICTIONARIES.dietary_tags).map(([key, value]) => {
                                        const isSelected = selectedDiets.includes(key);
                                        const baseClasses = isSelected
                                            ? 'bg-[#6A907B] text-white border-[#6A907B] shadow-md'
                                            : emptyFilterError
                                                ? 'bg-red-50 text-red-900 border-red-400'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#6A907B]';
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => {
                                                    toggleArrayFilter(selectedDiets, setSelectedDiets, key);
                                                    setEmptyFilterError(false);
                                                }}
                                                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out active:scale-95 group ${baseClasses}`}
                                            >
                                                {value}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ТАБ 10: СЕЗОННІСТЬ */}
                        {activeTab === 'season' && (
                            <div className="animate-fade-in flex flex-col h-full font-['Inter']">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">{t('recipes_page.tab_seasonal')}</h3>

                                <button
                                    onClick={() => {
                                        setIsSeasonal(!isSeasonal);
                                        setEmptyFilterError(false);
                                    }}
                                    className={`px-8 py-3.5 rounded-xl text-base font-bold transition-all border w-max shadow-sm mb-8 cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out active:scale-95 group ${
                                        isSeasonal 
                                        ? 'bg-[#6A907B] text-white border-[#6A907B]' 
                                        : emptyFilterError 
                                            ? 'bg-red-50 text-red-900 border-red-400'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#6A907B]'
                                    }`}
                                >
                                    {isSeasonal ? t('recipes_page.season_on') : t('recipes_page.season_off')}
                                </button>

                                <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">{t('recipes_page.season_hint')}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(MONTHS_DICT).map(([key, value]) => {
                                        const isSelected = selectedMonths.includes(key);
                                        const baseClasses = isSelected
                                            ? 'bg-[#B47231] text-white border-[#B47231] shadow-md'
                                            : emptyFilterError
                                                ? 'bg-red-50 text-red-900 border-red-400'
                                                : 'bg-white text-gray-600 border-gray-300 hover:border-[#B47231]';
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => {
                                                    toggleArrayFilter(selectedMonths, setSelectedMonths, key);
                                                    setEmptyFilterError(false);
                                                }}
                                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out active:scale-95 group ${baseClasses}`}
                                            >
                                                {value}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* КНОПКА ПОШУКУ (Для ПК - завжди внизу. Для мобільних - тільки на табах фільтрів) */}
                        <div className={`mt-8 lg:mt-auto pt-4 lg:pt-6 font-['Inter'] shrink-0 flex-col sm:flex-row items-center gap-4 relative ${activeTab === 'ingredients' ? 'hidden lg:flex' : 'flex'}`}>
                             {/* Повідомлення про порожні фільтри над кнопкою */}
                             {emptyFilterError && activeTab !== 'ingredients' && (
                                <div className="absolute -top-5 sm:-top-5 md:-top-5 left-1/2 transform -translate-x-1/2 animate-fade-in w-max px-3 py-1.5 bg-red-100 border border-red-300 rounded-lg text-red-700 text-[11px] sm:text-[13px] font-medium flex items-center gap-1.5 shadow-sm z-20">
                                    <svg className="shrink-0" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                    <span>{t('recipes_page.err_filter_empty')}</span>
                                </div>
                            )}
                            <button
                                onClick={() => fetchRecipes(true)}
                                className="w-full sm:flex-1 md:w-max md:px-16 py-3 bg-[#6A907B] text-white rounded-xl font-bold text-[17px] hover:bg-[#5B826B] transition-colors shadow-lg text-center tracking-wide block cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out hover:shadow-[0_12px_25px_rgba(180,114,49,0.15)] active:scale-95 group"
                            >
                                {activeTab === 'ingredients' ? t('recipes_page.find_recipe_btn') : t('recipes_page.apply_filters')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ================= НИЖНІЙ БЛОК: РЕЗУЛЬТАТИ ================= */}
                <div className="w-full">
                    {/* Хедер результатів */}
                    <div className="flex items-center justify-between mb-8 md:mb-12 gap-4">
                        <div className="flex items-center gap-3 md:gap-4 shrink-0">
                            <div className="w-4 h-4 md:w-5 md:h-5 bg-[#5B826B] shrink-0"></div>
                            <h2 className="text-xl md:text-2xl lg:text-[26px] font-['El_Messiri'] font-bold text-gray-800 tracking-wider uppercase whitespace-nowrap">
                                {hasActiveFilters ? t('recipes_page.search_results') : t('recipes_page.all_recipes')}
                            </h2>
                        </div>

                        {/* Контейнер для лінії та лічильника */}
                        <div className="flex items-center gap-4 flex-grow min-w-0">
                            <div className="flex-grow border-t-[3px] border-gray-300"></div>
                            <span className="text-sm md:text-base font-semibold text-gray-500 font-['Inter'] whitespace-nowrap shrink-0">
                                {recipes.length} {getPluralForm(recipes.length, [t('recipes_page.rec_1'), t('recipes_page.rec_2'), t('recipes_page.rec_5')])}
                            </span>
                        </div>
                    </div>

                    {/* СІТКА КАРТОК */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <svg className="animate-spin h-10 w-10 text-[#5B826B]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        </div>
                    ) : recipes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center mt-10 bg-white rounded-[2.5rem] py-16 px-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden relative group">

                            {/* Анімований феєричний градієнтний фон */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#DCE8D9] via-[#6A907B]/10 to-[#B47231]/10 opacity-70 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                            {/* Додаткові розмиті кольорові плями для об'єму */}
                            <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#6A907B]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none"></div>
                            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#B47231]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none"></div>

                            {/* Іконка з легким світінням */}
                            <div className="relative z-10 w-24 h-24 mb-6 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(180,114,49,0.15)] border border-white/50 transform group-hover:scale-105 transition-transform duration-500">
                                <svg className="w-12 h-12 text-[#B47231]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    <path d="M11 8v2"></path>
                                    <path d="M11 14h.01"></path>
                                </svg>
                            </div>

                            {/* Текст */}
                            <h3 className="relative z-10 font-['El_Messiri'] text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 uppercase tracking-wide drop-shadow-sm">
                                {t('recipes_page.no_recipes_found')}
                            </h3>
                            <p className="relative z-10 text-gray-600 font-['Inter'] text-sm sm:text-base lg:text-lg max-w-md mb-8">
                                {t('recipes_page.no_recipes_desc')}
                            </p>

                            {/* Кнопка "Очистити фільтри" */}
                            <button
                                onClick={clearAllFilters}
                                className="relative z-10 px-8 py-3.5 bg-[#1A1A1A] text-white rounded-[20px] font-bold font-['Inter'] hover:bg-[#6A907B] transition-colors shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex items-center gap-2 cursor-pointer duration-300 ease-out active:scale-95 group/btn"
                            >
                                <svg className="group-hover/btn:-rotate-180 transition-transform duration-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                {t('recipes_page.clear_and_try_again')}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-x-10 lg:gap-x-14 md:gap-y-16">
                                {recipes.slice(0, visibleCount).map((recipe) => (
                                    <Link
                                        to={`/recipe/${recipe.id}`}
                                        state={{ fromRecipesPage: true }}
                                        key={recipe.id}
                                        className="flex flex-col relative group block w-full h-full cursor-pointer transition-all duration-300 ease-out active:scale-99 group"
                                    >

                                        <div className="relative w-full h-64 sm:h-60 md:h-72 rounded-[2rem] overflow-hidden mb-5 shadow-sm">
                                            <img
                                                src={getImageUrl(recipe.image || recipe.image_url)}
                                                alt={recipe.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />

                                            {/* Кнопка "Улюблені" показується ТІЛЬКИ авторизованим користувачам */}
                                            {isAuthenticated && (
                                                <button
                                                    onClick={(e) => toggleFavorite(e, recipe)}
                                                    className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10 cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out active:scale-95 group"
                                                    title={recipe.is_favorited ? "Видалити з улюблених" : "Додати в улюблені"}
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill={recipe.is_favorited ? "#EF4444" : "none"} stroke={recipe.is_favorited ? "#EF4444" : "#9CA3AF"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                                    </svg>
                                                </button>
                                            )}

                                            {/* Стильний компактний бейджик */}
                                            {recipe.match_count > 0 && recipe.total_count > 0 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault(); // Запобігає переходу на сторінку рецепту
                                                        setSelectedRecipeForModal(recipe);
                                                    }}
                                                    className="absolute top-3 right-3 bg-[#FDFBF7]/85 backdrop-blur-md font-['Inter'] rounded-2xl p-1.5 sm:p-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.08)] z-10 flex flex-col items-center min-w-[50px] sm:min-w-[60px] transform origin-top-right cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(180,114,49,0.15)] active:scale-95 group"
                                                >
                                                    {/* Інформація про те, скільки всього */}
                                                    <div className="w-full border-b border-gray-200/80 pb-1 mb-1 text-center pt-0.5">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <span className="text-[15px] sm:text-[17px] font-black text-[#1A1A1A] leading-none">{recipe.total_count}</span>
                                                            <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M4 14c-2-3 2-6 4-3 1-2 4-1 3 2-2 3-5 4-7 1z" fill="#DCE8D9" stroke="#5B826B" strokeWidth="1.2" />
                                                                <path d="M20 12c1-2-2-5-4-3-1-2-4-1-3 2 2 3 5 4 7 1z" fill="#DCE8D9" stroke="#5B826B" strokeWidth="1.2" />
                                                                <ellipse cx="8" cy="14" rx="3.5" ry="4.5" fill="#FFEAA7" stroke="#D9A05B" strokeWidth="1.2" />
                                                                <path d="M8 9.5l-1.5-3.5 1.5 2 1-3 1 3 1.5-2L10 9.5" fill="#DCE8D9" stroke="#5B826B" strokeWidth="1" />
                                                                <path d="M5.5 12.5l5 3M9.5 12.5l-3 3" stroke="#D9A05B" strokeWidth="1" opacity="0.6" />
                                                                <path d="M12 18c5 3 9 1 10-4-1 1-4 1-6 0-3-1-4-3-4-5 0 3-1 6 0 9z" fill="#FCE7A1" stroke="#D9B44A" strokeWidth="1.2" />
                                                                <circle cx="13" cy="17" r="4" fill="#FFB4A2" stroke="#E56B55" strokeWidth="1.2" />
                                                                <path d="M13 13v1.5M12 14h2" stroke="#5B826B" strokeWidth="1.2" />
                                                            </svg>
                                                        </div>
                                                        <div className="text-[7px] sm:text-[8px] uppercase tracking-widest text-gray-500 font-bold mt-1 leading-tight">{t('recipes_page.total')}</div>
                                                    </div>

                                                    {/* Інформація про те, що Є У МЕНЕ */}
                                                    <div className="w-full border-b border-gray-200/80 pb-1 mb-1 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <span className="text-[15px] sm:text-[17px] font-black text-[#5B826B] leading-none">{recipe.match_count}</span>
                                                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#5B826B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                        </div>
                                                        <div className="text-[7px] sm:text-[8px] uppercase tracking-tight sm:tracking-normal text-gray-500 font-bold mt-1 leading-none">{t('recipes_page.in_stock')}</div>
                                                    </div>

                                                    {/* Інформація про те, чого НЕ ВИСТАЧАЄ (Докупити) */}
                                                    <div className="w-full text-center pb-0.5">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <span className="text-[15px] sm:text-[17px] font-black text-[#B47231] leading-none">{recipe.total_count - recipe.match_count}</span>
                                                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B47231]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path><line x1="16" y1="10" x2="16" y2="14"></line><line x1="14" y1="12" x2="18" y2="12"></line></svg>
                                                        </div>
                                                        <div className="text-[7px] sm:text-[8px] uppercase tracking-wide text-gray-500 font-bold mt-1 leading-none">{t('recipes_page.to_buy')}</div>
                                                    </div>
                                                </button>
                                            )}
                                        </div>

                                        <h3 className="text-center font-['El_Messiri'] font-bold text-[#1A1A1A] text-base sm:text-lg md:text-xl lg:text-2xl uppercase px-2 line-clamp-2 min-h-[48px] md:min-h-[56px] flex items-center justify-center group-hover:text-[#5B826B] transition-colors">
                                            {recipe.title}
                                        </h3>

                                        <div className="flex justify-between items-start mt-3 mb-6 px-1 font-['El_Messiri'] w-full">
                                            <div className="flex flex-col items-center flex-1 px-0.5">
                                                <svg className="mb-1.5 md:mb-2 text-[#B47231] w-9 h-9 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.0"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                <span className="text-[14px] sm:text-[14px] md:text-[15px] lg:text-[16px] font-medium text-gray-800 leading-tight text-center">
                                                    {recipe.cooking_time} {getPluralForm(recipe.cooking_time, [t('recipes_page.min_short_1'), t('recipes_page.min_short_2'), t('recipes_page.min_short_5')])}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center flex-1 px-0.5">
                                                <svg className="mb-1.5 md:mb-2 text-[#B47231] w-9 h-9 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.0"><path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg>
                                                <span className="text-[14px] sm:text-[14px] md:text-[15px] lg:text-[16px] font-medium text-gray-800 leading-tight text-center">
                                                    {recipe.portions || 1} {getPluralForm(recipe.portions || 1, [t('recipes_page.port_1'), t('recipes_page.port_2'), t('recipes_page.port_5')])}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center flex-1 px-0.5">
                                                <svg className="mb-1.5 md:mb-2 text-[#B47231] w-9 h-9 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.0"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
                                                <span className="text-[14px] sm:text-[14px] md:text-[15px] lg:text-[16px] font-medium text-gray-800 leading-tight text-center break-words">
                                                    {recipe.calories} {t('recipes_page.kcal_per_portion')}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center flex-1 px-0.5">
                                                <svg className="mb-1.5 md:mb-2 text-[#B47231] w-9 h-9 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.0"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                                                <span className="text-[14px] sm:text-[14px] md:text-[15px] lg:text-[16px] font-medium text-gray-800 leading-tight text-center break-words">
                                                    {DICTIONARIES.difficulty[recipe.difficulty] || recipe.difficulty}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <div className="block w-full py-3 rounded-[20px] border border-gray-400 text-center font-['Inter'] font-medium text-[14px] md:text-[15px] text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white group-hover:border-[#1A1A1A] transition-colors">
                                                {t('recipes_page.view_btn')}
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
                                        className="px-10 py-3.5 bg-transparent border-2 border-[#5B826B] text-[#5B826B] rounded-full font-bold font-['Inter'] hover:bg-[#5B826B] hover:text-white transition-colors cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out active:scale-95 group"
                                    >
                                        {t('recipes_page.show_more_btn')}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* модальне вікно для відображення інгредієнтів */}
            {selectedRecipeForModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transform-gpu"
                    onClick={() => setSelectedRecipeForModal(null)}
                >
                    <div
                        className="bg-white rounded-[2.5rem] p-6 sm:p-10 max-w-[650px] w-full shadow-2xl relative flex flex-col max-h-[90vh] font-['Inter']"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Кнопка закриття */}
                        <button
                            onClick={() => setSelectedRecipeForModal(null)}
                            className="absolute top-5 right-5 sm:top-6 sm:right-6 w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-900 transition-all shadow-sm cursor-pointer duration-300 ease-out active:scale-95 group"
                        >
                            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <div className="flex flex-col items-center mb-6">

                            <h2 className="text-[20px] sm:text-[24px] font-bold font-['El_Messiri'] text-[#1A1A1A] text-center uppercase tracking-wider px-6 leading-tight mb-4">
                                {selectedRecipeForModal.title}
                            </h2>

                            {/* блок статистики рецепту з іконками */}
                            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-4 font-['El_Messiri']">
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#B47231]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    <span className="text-[13px] sm:text-[15px] font-medium text-gray-800">
                                        {selectedRecipeForModal.cooking_time} {getPluralForm(selectedRecipeForModal.cooking_time, [t('recipes_page.min_short_1'), t('recipes_page.min_short_2'), t('recipes_page.min_short_5')])}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#B47231]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg>
                                    <span className="text-[13px] sm:text-[15px] font-medium text-gray-800">
                                        {selectedRecipeForModal.portions || 1} {getPluralForm(selectedRecipeForModal.portions || 1, [t('recipes_page.port_1'), t('recipes_page.port_2'), t('recipes_page.port_5')])}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#B47231]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
                                    <span className="text-[13px] sm:text-[15px] font-medium text-gray-800">
                                        {selectedRecipeForModal.calories} {t('recipes_page.kcal_per_portion')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#B47231]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                                    <span className="text-[13px] sm:text-[15px] font-medium text-gray-800">
                                        {DICTIONARIES.difficulty[selectedRecipeForModal.difficulty] || selectedRecipeForModal.difficulty}
                                    </span>
                                </div>
                            </div>

                            <p className="text-gray-500 text-[13px] sm:text-sm text-center font-medium max-w-sm">
                                {t('recipes_page.ingredients_needed')}
                            </p>
                        </div>

                        {/* Списки інгредієнтів */}
                        <div className="overflow-y-auto custom-scrollbar pr-2 flex-grow">
                            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">

                                {/* КОЛОНКА 1: В наявності */}
                                <div className="flex-1 bg-[#F6F8F6] border border-[#DCE8D9] rounded-[1.5rem] p-5">
                                    <div className="flex items-center gap-2 border-b border-[#DCE8D9] pb-3 mb-4">
                                        <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                                            <svg className="w-4 h-4 text-[#5B826B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                        </div>
                                        {/* Динамічний заголовок зі схилянням */}
                                        <h3 className="font-bold text-[#5B826B] uppercase tracking-wide text-[12px] sm:text-[13px] leading-tight">
                                            {t('recipes_page.in_stock_count', { count: selectedRecipeForModal.match_count })} {getPluralForm(selectedRecipeForModal.match_count, [t('recipes_page.ing_1'), t('recipes_page.ing_2'), t('recipes_page.ing_5')])}
                                        </h3>
                                    </div>

                                    <ul className="space-y-3">
                                        {selectedRecipeForModal.recipe_ingredients
                                            .filter(ing => matchedIngredientIds.includes(ing.ingredient))
                                            .map(ing => (
                                                <li key={ing.id} className="flex items-center gap-3">
                                                    {ing.ingredient_image ? (
                                                        <img src={getImageUrl(ing.ingredient_image)} className="w-10 h-10 rounded-full object-cover shadow-sm bg-white shrink-0 border border-gray-100" alt="" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 text-xs shadow-sm shrink-0 border border-gray-100">•</div>
                                                    )}
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[14px] font-bold text-gray-800 truncate capitalize">{ing.ingredient_name}</span>
                                                        <span className="text-[12px] text-gray-500 font-medium">{formatAmount(ing.amount, ing.unit)}</span>
                                                    </div>
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>

                                {/* КОЛОНКА 2: Докупити */}
                                <div className="flex-1 bg-[#FDFBF7] border border-[#EAE3D9] rounded-[1.5rem] p-5">
                                    <div className="flex items-center gap-2 border-b border-[#EAE3D9] pb-3 mb-4">
                                        <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                                            <svg className="w-3.5 h-3.5 text-[#B47231]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path><line x1="16" y1="10" x2="16" y2="14"></line><line x1="14" y1="12" x2="18" y2="12"></line></svg>
                                        </div>
                                        {/* Динамічний заголовок зі схилянням */}
                                        <h3 className="font-bold text-[#B47231] uppercase tracking-wide text-[12px] sm:text-[13px] leading-tight">
                                            {t('recipes_page.to_buy_count', { count: selectedRecipeForModal.total_count - selectedRecipeForModal.match_count })} {getPluralForm(selectedRecipeForModal.total_count - selectedRecipeForModal.match_count, [t('recipes_page.ing_1'), t('recipes_page.ing_2'), t('recipes_page.ing_5')])}
                                        </h3>
                                    </div>

                                    <ul className="space-y-3">
                                        {selectedRecipeForModal.recipe_ingredients
                                            .filter(ing => !matchedIngredientIds.includes(ing.ingredient))
                                            .map(ing => (
                                                <li key={ing.id} className="flex items-center gap-3">
                                                    {ing.ingredient_image ? (
                                                        <img src={getImageUrl(ing.ingredient_image)} className="w-10 h-10 rounded-full object-cover shadow-sm bg-white shrink-0 border border-gray-100 opacity-60" alt="" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 text-xs shadow-sm shrink-0 border border-gray-100">•</div>
                                                    )}
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[14px] font-bold text-gray-800 truncate capitalize opacity-90">{ing.ingredient_name}</span>
                                                        <span className="text-[12px] text-gray-500 font-medium">{formatAmount(ing.amount, ing.unit)}</span>
                                                    </div>
                                                </li>
                                            ))
                                        }
                                        {/* Якщо докуповувати нічого не треба */}
                                        {(selectedRecipeForModal.total_count - selectedRecipeForModal.match_count) === 0 && (
                                            <li className="text-center py-6">
                                                <span className="text-2xl mb-2 block">🎉</span>
                                                <p className="text-xs font-bold text-gray-500">{t('recipes_page.have_all_ingredients')}</p>
                                            </li>
                                        )}
                                    </ul>
                                </div>

                            </div>
                        </div>

                        {/* Кнопка переходу на сторінку рецепту */}
                        <div className="mt-8 shrink-0 flex justify-center border-t border-gray-100 pt-6">
                            <Link
                                to={`/recipe/${selectedRecipeForModal.id}`}
                                state={{ fromRecipesPage: true }}
                                className="px-10 py-3.5 bg-[#1A1A1A] text-white rounded-[20px] font-bold text-[15px] hover:bg-[#6A907B] transition-colors shadow-lg shadow-black/10 flex items-center gap-2 group w-full sm:w-auto justify-center cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out active:scale-95 group"
                            >
                                {t('recipes_page.view_prep_method')}
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                            </Link>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Recipes;