import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { ENDPOINTS, API_URL, TOKEN_KEY } from '../constants/api';
import { DICTIONARIES } from '../constants/translations';

import { pdf } from '@react-pdf/renderer';
import ShoppingListPDF from '../components/ShoppingListPDF';

// Допоміжна функція для правильного відмінювання слів
const getPluralForm = (number, titles) => {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return titles[2];
    if (n1 > 1 && n1 < 5) return titles[1];
    if (n1 === 1) return titles[0];
    return titles[2];
};

// Функція для написання ТІЛЬКИ першої літери великою
const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// функція форматування для пошуку (тільки перша літера велика)
const formatCapitalization = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const DAYS_OF_WEEK = [
    { id: 1, name: 'Понеділок', short: 'Пн' },
    { id: 2, name: 'Вівторок', short: 'Вт' },
    { id: 3, name: 'Середа', short: 'Ср' },
    { id: 4, name: 'Четвер', short: 'Чт' },
    { id: 5, name: 'П\'ятниця', short: 'Пт' },
    { id: 6, name: 'Субота', short: 'Сб' },
    { id: 7, name: 'Неділя', short: 'Нд' },
];

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner'];
const MEAL_NAMES = {
    'breakfast': 'сніданок',
    'lunch': 'обід',
    'dinner': 'вечеря'
};

const MEAL_NAMES_ACCUSATIVE = {
    'breakfast': 'сніданок',
    'lunch': 'обід',
    'dinner': 'вечерю'
};

const DAYS_ACCUSATIVE = {
    1: 'понеділок',
    2: 'вівторок',
    3: 'середу',
    4: 'четвер',
    5: 'п\'ятницю',
    6: 'суботу',
    7: 'неділю'
};

const Menu = () => {
    // Основні стани сторінки
    const [activeDay, setActiveDay] = useState(1);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState(null);

    // Стани для модалки додавання та пошуку
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedMealForAdd, setSelectedMealForAdd] = useState('lunch');
    const [searchQuery, setSearchQuery] = useState('');
    const [allFetchedRecipes, setAllFetchedRecipes] = useState([]); // Всі знайдені рецепти
    const [visibleRecipeCount, setVisibleRecipeCount] = useState(10); // Скільки показувати зараз
    const [isSearching, setIsSearching] = useState(false);

    // стани для інгредієнтів як на сторінці рецептів
    const [allIngredients, setAllIngredients] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Стан для помилки всередині модалки
    const [modalError, setModalError] = useState(null)

    // Стани для експорту
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportEmail, setExportEmail] = useState('');
    const [exportScope, setExportScope] = useState('day');

    const [exportStatus, setExportStatus] = useState(null); // Стан для помилок експорту

    // Стани для списку покупок
    const [useFridge, setUseFridge] = useState(true); // Чи враховувати мої продукти
    const [shoppingList, setShoppingList] = useState(null); // Сам список
    const [isShoppingListLoading, setIsShoppingListLoading] = useState(false); // Завантаження списку
    const [activeListScope, setActiveListScope] = useState(null); // 'day' або 'week'

    // Стан для дублювання (без таймера, як просили)
    const [duplicateError, setDuplicateError] = useState(null);

    const exportErrorTimeoutRef = useRef(null);

    // 1. Завантаження поточного меню та інгредієнтів
    useEffect(() => {
        fetchMenu();
        fetchIngredients();
        window.scrollTo(0, 0);
    }, []);

    // Функція завантаження інгредієнтів для підказок
    const fetchIngredients = async () => {
        try {
            const res = await api.get('/api/ingredients/?limit=1000');
            setAllIngredients(res.data.results || res.data);
        } catch (e) {
            console.error("Не вдалося завантажити базу інгредієнтів", e);
        }
    };

    // Очищаємо список продуктів при перемиканні днів тижня
    useEffect(() => {
        setShoppingList(null);
        setActiveListScope(null);
    }, [activeDay]);

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

    const fetchMenu = async () => {
        try {
            const response = await api.get(ENDPOINTS.WEEKLY_MENU);
            setMenuItems(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Помилка завантаження меню:", error);
            setLoading(false);
        }
    };

    // Логіка парсингу пошукового рядка
    const formatQueryForBackend = (query) => {
        if (!query) return '';
        const terms = query.split(/[\s,]+/).filter(t => t.trim().length > 0);
        return terms.join(', ');
    };

    // Допоміжна функція для пошуку ID інгредієнтів
    const getIngredientIdsFromSearch = (query) => {
        if (!query) return [];
        // Розбиваємо ТІЛЬКИ по комах
        const terms = query.toLowerCase().split(',').map(t => t.trim()).filter(t => t.length > 0);

        const matchedIds = [];
        terms.forEach(term => {
            const match = allIngredients.find(ing => ing.name.toLowerCase() === term);
            if (match) {
                matchedIds.push(match.id);
            }
        });
        return [...new Set(matchedIds)];
    };

    // Живий пошук та рандомізація (АВТОМАТИЧНИЙ)
    useEffect(() => {
        if (!isAddModalOpen) return;

        const fetchSearchedRecipes = async () => {
            setIsSearching(true);
            setModalError(null);
            try {
                let url = '';
                const hasSearchQuery = searchQuery.trim() !== '';
                const currentMatchedIds = getIngredientIdsFromSearch(searchQuery);

                if (hasSearchQuery && currentMatchedIds.length > 0) {
                    url = `${ENDPOINTS.RECIPES}match/?ingredients=${currentMatchedIds.join(',')}`;
                } else if (hasSearchQuery && currentMatchedIds.length === 0) {
                    url = `${ENDPOINTS.RECIPES}match/?search_query=${formatQueryForBackend(searchQuery)}`;
                } else {
                    url = `${ENDPOINTS.RECIPES}`;
                }

                const response = await api.get(url);
                let recipesData = response.data.results ? response.data.results : response.data;

                if (!hasSearchQuery && recipesData.length > 0) {
                    // Якщо пошук порожній, перемішуємо і беремо 10 випадкових
                    recipesData = recipesData.sort(() => 0.5 - Math.random()).slice(0, 10);
                }

                setAllFetchedRecipes(recipesData);
                setVisibleRecipeCount(10); // Скидаємо відображення до 10 при новому запиті
            } catch (error) {
                console.error("Помилка пошуку рецептів:", error);
                setModalError("Виникла помилка при пошуку рецептів.");
            } finally {
                setIsSearching(false);
            }
        };

        // Затримка (debounce) 400мс, щоб не спамити бекенд при кожній літері
        const timeoutId = setTimeout(fetchSearchedRecipes, 400);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, isAddModalOpen]);

    // Обчислюємо масив рецептів, які реально треба намалювати на екрані
    const availableRecipes = allFetchedRecipes.slice(0, visibleRecipeCount);

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // 3. Видалення з меню
    const removeFromMenu = async (id) => {
        try {
            await api.delete(`${ENDPOINTS.WEEKLY_MENU}${id}/`);
            setMenuItems(menuItems.filter(item => item.id !== id));
            showToast("🤍 Видалено з меню");
            // Скидаємо список покупок
            setShoppingList(null);
            setActiveListScope(null);
        } catch (error) {
            showToast("❌ Помилка видалення");
            console.error(error);
        }
    };

    // 4. Додавання нового рецепту до меню
    const handleAddRecipeToMenu = async (recipeId) => {
        setModalError(null); // Очищаємо попередню помилку перед запитом

        // Шукаємо, чи є вже такий рецепт у поточному дні та прийомі їжі
        const isDuplicate = menuItems.some(
            item => item.day_of_week === activeDay &&
                    item.meal_type === selectedMealForAdd &&
                    item.recipe.id === recipeId
        );

        if (isDuplicate) {
            // Якщо дублікат знайдено, миттєво показуємо помилку і ЗУПИНЯЄМО виконання
            setModalError(`Цей рецепт вже доданий на ${MEAL_NAMES_ACCUSATIVE[selectedMealForAdd]}!`);
            return;
        }

        // Якщо все добре, тоді вже робимо запит на бекенд
        try {
            const response = await api.post(ENDPOINTS.WEEKLY_MENU, {
                recipe: recipeId,
                day_of_week: activeDay,
                meal_type: selectedMealForAdd
            });
            setMenuItems([...menuItems, response.data]);
            showToast("🍲 Рецепт успішно додано!");
            setIsAddModalOpen(false);
            setSearchQuery('');
            setShoppingList(null);
            setActiveListScope(null);
        } catch (error) {
            // Якщо виникла якась інша реальна помилка мережі чи сервера
            setModalError("Виникла помилка під час з'єднання з сервером. Спробуйте ще раз.");
            console.error(error);
        }
    };

    const openAddModal = (mealId = 'lunch') => {
        setSelectedMealForAdd(mealId);
        setSearchQuery('');
        setModalError(null);
        setIsAddModalOpen(true);
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${API_URL}${path}`;
    };

    // Фільтруємо рецепти для активного дня та сортуємо за порядком (сніданок -> обід -> вечеря)
    const activeDayItems = menuItems
        .filter(item => item.day_of_week === activeDay)
        .sort((a, b) => MEAL_ORDER.indexOf(a.meal_type) - MEAL_ORDER.indexOf(b.meal_type));

    const activeDayName = DAYS_OF_WEEK.find(d => d.id === activeDay)?.name;

    // Перевіряємо, чи є рецепти в обраному періоді для списку покупок
    const hasRecipesForScope = activeListScope === 'day'
        ? activeDayItems.length > 0
        : menuItems.length > 0;

    // Функція, що додає +10 рецептів, коли користувач гортає вниз
    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;

        // Якщо до кінця списку залишилося менше 50px
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            // Якщо ми ще не показали всі рецепти, збільшуємо лічильник
            if (visibleRecipeCount < allFetchedRecipes.length) {
                setVisibleRecipeCount(prev => prev + 10);
            }
        }
    };

    // Функція генерації списку покупок
    const generateShoppingList = async (scope) => {
        setIsShoppingListLoading(true);
        setActiveListScope(scope);
        try {
            // передаємо параметр use_fridge на бекенд
            const url = scope === 'day'
                ? `${ENDPOINTS.WEEKLY_MENU}shopping_list/?day_of_week=${activeDay}&use_fridge=${useFridge}`
                : `${ENDPOINTS.WEEKLY_MENU}shopping_list/?use_fridge=${useFridge}`;

            const response = await api.get(url);

            // Оскільки бекенд вже все порахував, нам залишається лише відфільтрувати те,
            // що потрібно купувати (або продукти без чіткої кількості)
            const listToDisplay = response.data.filter(item => {
                // Якщо продукт повністю є в холодильнику (навіть якщо це "за смаком") — приховуємо
                if (item.is_fully_stocked) return false;

                // В усіх інших випадках (треба докупити або взагалі немає) — показуємо
                return true;
            });

            setShoppingList(listToDisplay);
        } catch (error) {
            console.error("Помилка генерації списку:", error);
            showToast("❌ Не вдалося згенерувати список");
        } finally {
            setIsShoppingListLoading(false);
        }
    };

    // Функція експорту керує локальним станом exportStatus
    const handleExport = async (actionType) => {
        // Очищаємо попередній таймер помилки, якщо він був
        if (exportErrorTimeoutRef.current) {
            clearTimeout(exportErrorTimeoutRef.current);
        }

        setExportStatus(null); // Очищаємо помилку перед новою спробою

        // Проста перевірка формату email за допомогою регулярного виразу
        const isValidEmail = (email) => {
            const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return re.test(email);
        };

        if (actionType === 'email') {
            if (!exportEmail) {
                setExportStatus({ type: 'error', text: 'Будь ласка, введіть email для відправки.' });
                // Встановлюємо таймер на зникнення помилки через 4 секунди
                exportErrorTimeoutRef.current = setTimeout(() => {
                    setExportStatus(null);
                }, 4000);
                return;
            } else if (!isValidEmail(exportEmail)) {
                // Перевірка на валідність email
                setExportStatus({ type: 'error', text: 'Будь ласка, введіть коректний email (наприклад: name@gmail.com).' });
                exportErrorTimeoutRef.current = setTimeout(() => {
                    setExportStatus(null);
                }, 4000);
                return;
            }
        }

        try {
            // Встановлюємо статус "Завантаження" у модальному вікні
            setExportStatus({ type: 'loading', text: 'Завантажуємо дані та формуємо PDF...' });

            // 1. САМОСТІЙНО ОТРИМУЄМО ДАНІ ДЛЯ PDF
            // (незалежно від того, чи згенеровані вони на екрані)
            const url = exportScope === 'day'
                ? `${ENDPOINTS.WEEKLY_MENU}shopping_list/?day_of_week=${activeDay}&use_fridge=${useFridge}`
                : `${ENDPOINTS.WEEKLY_MENU}shopping_list/?use_fridge=${useFridge}`;

            const response = await api.get(url);

            // Відфільтровуємо те, що потрібно
            const listToExport = response.data.filter(item => {
                // Якщо продукт повністю є в холодильнику — приховуємо
                if (item.is_fully_stocked) return false;
                return true;
            });

            // Якщо список порожній — показуємо помилку В МОДАЛЦІ і не закриваємо її
            if (listToExport.length === 0) {
                setExportStatus({ type: 'error', text: 'Список продуктів порожній. Немає чого завантажувати/надсилати.' });
                // Таймер на зникнення
                exportErrorTimeoutRef.current = setTimeout(() => {
                    setExportStatus(null);
                }, 4000);
                return;
            }

            // 2. Форматуємо отримані дані для передачі в PDF-компонент
            const formattedList = listToExport.map(item => {
                // Отримуємо базовий текст (наприклад, "за смаком" або "2 шт")
                let amountStr = formatIngredientAmount(item.to_buy !== undefined ? item.to_buy : item.required_amount, item.unit);

                // Якщо рецепт "за смаком", АЛЕ в холодильнику є якийсь дрібний залишок (>0)
                if (item.required_amount === null && item.already_have > 0) {
                    const safeHave = Math.round(item.already_have);

                    // РОЗУМНЕ ВИЗНАЧЕННЯ ОДИНИЦІ (беремо з inventory_unit, а якщо раптом його немає - то 'g')
                    const actualUnit = item.inventory_unit || 'g';
                    let unitTranslation = DICTIONARIES.units[actualUnit] || actualUnit;

                    if (Array.isArray(unitTranslation)) {
                        unitTranslation = unitTranslation[0];
                    }

                    amountStr += ` (є ${safeHave} ${unitTranslation})`;
                }

                return {
                    name: capitalizeFirstLetter(item.ingredient_name),
                    amount: amountStr,
                    image: getImageUrl(item.ingredient_image)
                };
            });

            const scopeText = exportScope === 'day'
                ? `На день (${DAYS_ACCUSATIVE[activeDay]})`
                : 'На весь тиждень';
            const fridgeText = useFridge ? 'Враховано наявні запаси' : 'Повний список';
            const subtitleText = `${scopeText}  |  ${fridgeText}`;
            const dateString = new Date().toLocaleDateString('uk-UA');

            // 3. Створюємо PDF-файл (Blob) у фоні
            const pdfBlob = await pdf(
                <ShoppingListPDF
                    list={formattedList}
                    subtitleText={subtitleText}
                    dateString={dateString}
                />
            ).toBlob();

            // 4. Обробляємо дію (Завантаження або Email)
            if (actionType === 'download') {
                const fileUrl = window.URL.createObjectURL(pdfBlob);
                const link = document.createElement('a');
                link.href = fileUrl;
                link.setAttribute('download', `LiteCook_List_${exportScope}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(fileUrl); // Очищаємо пам'ять браузера

                setExportStatus({ type: 'success', text: 'PDF успішно завантажено!' });

                // Закриваємо модалку через 2.5 секунди
                setTimeout(() => {
                    setIsExportModalOpen(false);
                    setExportStatus(null);
                }, 2500);
            } else {
                const formData = new FormData();
                formData.append('email', exportEmail);
                formData.append('pdf_file', pdfBlob, `LiteCook_List_${exportScope}.pdf`);

                await api.post(`${ENDPOINTS.WEEKLY_MENU}email_pdf/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                setExportStatus({ type: 'success', text: 'PDF відправлено на вашу пошту!' });

                // Закриваємо модалку через 2.5 секунди
                setTimeout(() => {
                    setIsExportModalOpen(false);
                    setExportStatus(null);
                }, 2500);
            }
        } catch (error) {
            console.error(error);
            setExportStatus({ type: 'error', text: 'Виникла помилка при генерації або відправці PDF. Спробуйте ще раз.' });
            // Таймер на зникнення
            exportErrorTimeoutRef.current = setTimeout(() => {
                setExportStatus(null);
            }, 4000);
        }
    };

    // Допоміжна функція для красивого виводу кількості з правильним відмінюванням
    const formatIngredientAmount = (amount, unitKey) => {
        // Якщо кількість = 0 або null (наприклад, "за смаком", "для прикраси")
        if (amount === null || parseFloat(amount) === 0) {
            // Перевіряємо, чи це випадково не специфічний юніт (за смаком, для смаження)
            const unitTranslation = DICTIONARIES.units[unitKey];

            if (['taste', 'garnish', 'frying'].includes(unitKey)) {
                 return unitTranslation; // Виведе: "за смаком"
            }
            return `за потребою / 1 ${Array.isArray(unitTranslation) ? unitTranslation[0] : unitTranslation}`;
        }

        const numAmount = parseFloat(amount);
        const unitData = DICTIONARIES.units[unitKey];

        // Якщо в словнику це масив (наприклад, ['зубчик', 'зубчики', 'зубчиків'])
        if (Array.isArray(unitData)) {
            return `${numAmount} ${getPluralForm(numAmount, unitData)}`;
        }

        return `${numAmount} ${unitData || unitKey}`;
    };

    // Логіка інтелектуального пошуку з Recipes.jsx
    const capitalizeSearch = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    // Логіка визначення поточного слова для підказок
    const getCurrentSearchTerm = () => {
        if (!searchQuery) return '';
        const parts = searchQuery.split(',').map(p => p.trim());
        return parts[parts.length - 1].toLowerCase();
    };

    const currentTerm = getCurrentSearchTerm();
    const suggestedIngredients = currentTerm.length > 0
        ? allIngredients.filter(ing => ing.name.toLowerCase().includes(currentTerm))
        : [];

    const isIngredientInQuery = (query, ingredientName) => {
        if (!query) return false;
        const queryTerms = query.toLowerCase().split(',').map(t => t.trim()).filter(t => t.length > 0);
        return queryTerms.includes(ingredientName.toLowerCase().trim());
    };

    const handleAddIngredientToSearch = (ingredientName) => {
        if (isIngredientInQuery(searchQuery, ingredientName)) {
            setDuplicateError(ingredientName);
            setShowSuggestions(false);
            if (inputRef.current) inputRef.current.focus();
            return;
        }

        setDuplicateError(null);
        const query = searchQuery;
        const lastIndex = Math.max(query.lastIndexOf(','), query.lastIndexOf(' '));

        let newQuery = '';
        if (lastIndex === -1) {
            newQuery = ingredientName + ', ';
        } else {
            newQuery = query.substring(0, lastIndex + 1).trim() + ' ' + ingredientName + ', ';
        }

        setSearchQuery(capitalizeSearch(newQuery));
        setShowSuggestions(false);
        if (inputRef.current) inputRef.current.focus();
    };

    const handleInputChange = (e) => {
        setSearchQuery(formatCapitalization(e.target.value));
        setShowSuggestions(true);

        setDuplicateError(null); // Очищаємо помилку, коли користувач починає вводити чи видаляти текст

        const terms = e.target.value.toLowerCase().split(',').map(t => t.trim()).filter(Boolean);

        if (terms.length < 2) return;

        const uniqueTerms = new Set(terms);

        if (uniqueTerms.size !== terms.length) {
            const duplicates = terms.filter((item, index) => terms.indexOf(item) !== index);
            const duplicatedWord = duplicates[0];

            const foundIng = allIngredients.find(ing => ing.name.toLowerCase() === duplicatedWord);
            setDuplicateError(foundIng ? foundIng.name : capitalizeFirstLetter(duplicatedWord));
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#F6F3F4] flex items-center justify-center text-2xl font-['El_Messiri']">Завантаження...</div>;
    }

    return (
        <div className="bg-[#F6F3F4] w-full min-h-[calc(100vh-80px)] flex flex-col font-sans pb-24">

            {toastMessage && (
                <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-[9999] transition-all font-medium flex items-center gap-2">
                    {toastMessage}
                </div>
            )}

            <div className="px-4 sm:px-6 lg:px-25 w-full pt-10 lg:pt-12">

                {/* ЗАГОЛОВОК (Зелений квадратик + ТИЖНЕВЕ МЕНЮ) */}
                <div className="flex items-center gap-3 md:gap-4 mb-3 shrink-0">
                     <div className="w-4 h-4 md:w-5 md:h-5 bg-[#5B826B] shrink-0"></div>
                     <h2 className="text-2xl md:text-3xl font-['El_Messiri'] font-bold text-[#1A1A1A] tracking-widest uppercase whitespace-nowrap">
                         ТИЖНЕВЕ МЕНЮ
                     </h2>
                </div>

                <div className="border-t-2 border-gray-800 mb-6 w-full shrink-0"></div>

                {/* БЛОК 1: ДНІ ТИЖНЯ */}
                <div className="mb-10 w-full shrink-0">
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        {DAYS_OF_WEEK.map((day) => (
                            <button
                                key={day.id}
                                onClick={() => setActiveDay(day.id)}
                                className={`
                                    px-5 sm:px-6 md:px-8 lg:px-10 py-3 md:py-3.5
                                    font-['Inter'] font-semibold text-sm md:text-base lg:text-lg
                                    transition-all duration-300 rounded-xl
                                    border
                                    cursor-pointer transition-all duration-300 ease-out active:scale-95 group
                                    ${
                                        activeDay === day.id
                                            ? 'bg-[#6A907B] text-white border-[#6A907B] shadow-md transform scale-[1.02]'
                                            : 'bg-white text-gray-900 border-gray-300 hover:border-[#6A907B] hover:text-[#6A907B] hover:bg-gray-50 shadow-sm'
                                    }
                                `}
                            >
                                <span className="hidden lg:inline">{day.name}</span>
                                <span className="lg:hidden">{day.short}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full flex-grow">

                    {/* БЛОК 2: КАРТКИ РЕЦЕПТІВ */}
                    <div className="flex-grow w-full lg:w-2/3 xl:w-3/4 flex flex-col">

                        <h1 className="text-3xl md:text-4xl font-['El_Messiri'] font-bold text-[#1A1A1A] mb-4">
                            {DAYS_OF_WEEK.find(d => d.id === activeDay)?.name || 'Понеділок'}
                        </h1>
                        <div className="border-t-2 border-gray-300 mb-8 w-full shrink-0"></div>

                        {/* Блоки прийомів їжі (Сніданок, Обід, Вечеря) */}
                        <div className="space-y-8 flex-grow">
                            {[
                                { id: 'breakfast', name: 'Сніданок' },
                                { id: 'lunch', name: 'Обід' },
                                { id: 'dinner', name: 'Вечеря' }
                            ].map((meal) => {
                                const mealItems = activeDayItems.filter(item => item.meal_type === meal.id);

                                return (
                                    <div key={meal.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col">

                                        <h3 className="text-xl font-['El_Messiri'] font-bold text-[#1A1A1A] mb-5 pl-4 border-l-[4px] border-[#6A907B] uppercase tracking-wider">
                                            {meal.name}
                                        </h3>

                                        {mealItems.length > 0 ? (
                                            <div className="space-y-4 mb-6">
                                                {mealItems.map((item) => {
                                                    const recipe = item.recipe;

                                                    return (
                                                        <div key={item.id} className="bg-transparent flex flex-col xl:flex-row items-center xl:items-stretch gap-4 xl:gap-6 group transition-all py-1.5 border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">

                                                            {/* Зображення (Адаптивне та збільшене) */}
                                                            <div className="w-full xl:w-[280px] h-56 md:h-64 xl:h-40 shrink-0 relative">
                                                                <Link to={`/recipe/${recipe.id}`} className="block w-full h-full">
                                                                    <img
                                                                        src={getImageUrl(recipe.image)}
                                                                        alt={recipe.title}
                                                                        className="w-full h-full object-cover rounded-[1rem] shadow-sm group-hover:scale-105 transition-transform duration-700 cursor-pointer transition-all duration-300 ease-out active:scale-100 group"
                                                                    />
                                                                </Link>

                                                                {/* Кнопка видалення (На мобільних і планшетах на картинці) */}
                                                                <button
                                                                    onClick={() => removeFromMenu(item.id)}
                                                                    className="absolute top-3 right-3 xl:hidden w-9 h-9 bg-white/90 backdrop-blur-sm text-gray-500 hover:text-red-500 rounded-full flex items-center justify-center shadow-md transition-colors z-10 cursor-pointer transition-all duration-300 ease-out active:scale-95 group"
                                                                    title="Видалити з меню"
                                                                >
                                                                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                                </button>
                                                            </div>

                                                            {/* Текстова інформація */}
                                                            <div className="flex-grow flex flex-col justify-center text-center xl:text-left w-full py-1 min-w-0">
                                                                <Link to={`/recipe/${recipe.id}`} className="font-['El_Messiri'] font-bold text-lg md:text-xl lg:text-2xl uppercase text-[#1A1A1A] hover:text-[#6A907B] transition-colors line-clamp-1 mb-1.5 cursor-pointer transition-all duration-300 ease-out active:scale-98 group">
                                                                    {recipe.title}
                                                                </Link>

                                                                <p className="text-sm md:text-[15px] text-gray-600 font-['Inter'] line-clamp-3 leading-relaxed mb-3 px-2 xl:px-0">
                                                                    {recipe.description || 'Чудовий вибір для вашого меню! Завдяки збалансованому складу ви отримаєте заряд енергії та неперевершений смак.'}
                                                                </p>

                                                                <div className="flex items-center justify-center xl:justify-start mt-auto gap-2">
                                                                    {/* Статистика (час, калорії) */}
                                                                    <p className="text-[13px] md:text-sm text-gray-500 font-['Inter'] font-semibold tracking-wide flex items-center justify-center xl:justify-start gap-2 sm:gap-3 flex-wrap">
                                                                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                                                                            <svg className="w-4 h-4 md:w-5 md:h-5 text-[#B47231]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                                            {recipe.cooking_time} {getPluralForm(recipe.cooking_time, ['хвилина', 'хвилини', 'хвилин'])}
                                                                        </span>
                                                                        <span className="text-gray-300">|</span>
                                                                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                                                                            <svg className="w-4 h-4 md:w-5 md:h-5 text-[#B47231]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
                                                                            {recipe.calories} ккал/порція
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Кнопка видалення (На ПК - збоку) */}
                                                            <div className="hidden xl:flex items-center justify-center shrink-0 lg:pr-2">
                                                                <button
                                                                    onClick={() => removeFromMenu(item.id)}
                                                                    className="w-10 h-10 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shrink-0 cursor-pointer transition-all duration-300 ease-out active:scale-95 group"
                                                                    title="Видалити з меню"
                                                                >
                                                                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 font-['Inter'] text-sm mb-6 px-2">
                                                На {meal.name.toLowerCase()} ще не додано жодного рецепту.
                                            </p>
                                        )}

                                        {/* Зменшена кнопка додавання рецепту */}
                                        <button
                                            onClick={() => openAddModal(meal.id)}
                                            className="w-full py-3 sm:py-3.5 mt-2 bg-gray-50 border-2 border-dashed border-[#6A907B]/40 hover:border-[#6A907B] text-[#6A907B] rounded-2xl hover:bg-[#6A907B]/5 transition-all duration-300 font-['Inter'] font-semibold text-sm sm:text-[15px] flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out active:scale-97 group"
                                        >
                                            <div className="w-7 h-7 rounded-full bg-[#6A907B]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                            </div>
                                            Додати рецепт
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* БЛОК 3: СПИСОК ПРОДУКТІВ (Світлий дизайн) */}
                    <div className="w-full lg:w-[320px] xl:w-[380px] shrink-0">
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 md:p-8 sticky top-10 flex flex-col">

                            <h3 className="text-xl font-['El_Messiri'] font-bold text-[#1A1A1A] mb-5 pl-4 border-l-[4px] border-[#B47231] uppercase tracking-wider">
                                Список продуктів
                            </h3>

                            {/* Тогл "Враховувати мої продукти" */}
                            <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-3 mb-4 transition-colors hover:bg-gray-100">
                                <span className="text-sm text-gray-700 font-['Inter'] font-semibold">
                                    Мої продукти
                                </span>
                                 <button
                                    onClick={() => {
                                        const newFridgeState = !useFridge;
                                        setUseFridge(newFridgeState);
                                        if (activeListScope) {
                                            setIsShoppingListLoading(true);
                                            const url = activeListScope === 'day'
                                                ? `${ENDPOINTS.WEEKLY_MENU}shopping_list/?day_of_week=${activeDay}&use_fridge=${newFridgeState}`
                                                : `${ENDPOINTS.WEEKLY_MENU}shopping_list/?use_fridge=${newFridgeState}`;

                                            api.get(url).then(res => {
                                                const listToDisplay = res.data.filter(item => !item.is_fully_stocked);
                                                setShoppingList(listToDisplay);
                                                setIsShoppingListLoading(false);
                                            });
                                        }
                                    }}
                                    className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 cursor-pointer transition-all duration-300 ease-out active:scale-95 group focus:outline-none ${useFridge ? 'bg-[#6A907B]' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${useFridge ? 'transform translate-x-5' : ''}`}></div>
                                </button>
                            </div>

                            <p className="text-gray-500 text-xs font-['Inter'] mb-6 leading-relaxed">
                                {useFridge
                                    ? "Ми автоматично віднімемо інгредієнти, які вже є у ваших збережених запасах."
                                    : "Повний список усіх необхідних інгредієнтів без урахування ваших запасів."}
                            </p>

                            <div className="space-y-3 font-['Inter'] font-semibold text-[15px]">
                                <button
                                    onClick={() => generateShoppingList('day')}
                                    className={`w-full py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border cursor-pointer transition-all duration-300 ease-out active:scale-95 group ${
                                        activeListScope === 'day'
                                            ? 'bg-[#6A907B] text-white border-[#6A907B] shadow-md'
                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    На {DAYS_ACCUSATIVE[activeDay]}
                                </button>
                                <button
                                    onClick={() => generateShoppingList('week')}
                                    className={`w-full py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border cursor-pointer transition-all duration-300 ease-out active:scale-95 group ${
                                        activeListScope === 'week'
                                            ? 'bg-[#B47231] text-white border-[#B47231] shadow-md'
                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    На весь тиждень
                                </button>

                                {/* Відображення згенерованого списку */}
                                {isShoppingListLoading ? (
                                    <div className="py-8 text-center">
                                        <svg className="animate-spin h-8 w-8 mx-auto text-[#6A907B]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    </div>
                                ) : shoppingList !== null && (
                                    <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-4 max-h-[350px] overflow-y-auto custom-scrollbar">

                                        {!hasRecipesForScope ? (
                                            <div className="text-center py-4">
                                                <div className="text-3xl mb-2">🍽️</div>
                                                <p className="text-sm text-gray-500 font-bold">
                                                    Меню порожнє
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">Додайте рецепти, щоб згенерувати список.</p>
                                            </div>
                                        ) : shoppingList.length === 0 ? (
                                            <div className="text-center py-4">
                                                <div className="text-3xl mb-2">🎉</div>
                                                <p className="text-sm text-[#6A907B] font-bold">
                                                    У вас є всі продукти!
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">Купувати нічого не потрібно.</p>
                                            </div>
                                        ) : (
                                            <ul className="space-y-3">
                                                {shoppingList.map((item, idx) => (
                                                    <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                                                        <span className="text-gray-800 font-medium">
                                                            {capitalizeFirstLetter(item.ingredient_name)}
                                                        </span>
                                                        <span className="text-[#B47231] font-bold whitespace-nowrap ml-3">
                                                            {(() => {
                                                                let amountStr = formatIngredientAmount(item.to_buy !== undefined ? item.to_buy : item.required_amount, item.unit);

                                                                if (item.required_amount === null && item.already_have > 0) {
                                                                    const safeHave = Math.round(item.already_have);

                                                                    // Використовуємо реальну одиницю з холодильника
                                                                    const actualUnit = item.inventory_unit || 'g';
                                                                    let unitTranslation = DICTIONARIES.units[actualUnit] || actualUnit;
                                                                    if (Array.isArray(unitTranslation)) unitTranslation = unitTranslation[0];

                                                                    amountStr += ` (є ${safeHave} ${unitTranslation})`;
                                                                }
                                                                return amountStr;
                                                            })()}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}

                                <div className="pt-4 mt-6 border-t border-gray-100">
                                    <button
                                        onClick={() => {
                                            setIsExportModalOpen(true);
                                            setExportStatus(null);
                                            setExportEmail('');
                                        }}
                                        // ЗМІНЕНО: Додано px-3 sm:px-4, lg:text-[15px] xl:text-[16px]
                                        className="w-full px-3 sm:px-4 flex flex-col min-[350px]:flex-row items-center justify-center border-2 border-dashed border-[#6A907B]/40 text-[#6A907B] py-3 sm:py-3.5 rounded-xl hover:bg-[#6A907B]/5 hover:border-[#6A907B] transition-colors gap-2 cursor-pointer transition-all duration-300 ease-out active:scale-95 group"
                                    >
                                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                        {/* ЗМІНЕНО: Додано класи для розміру тексту */}
                                        <span className="text-center font-bold text-[13px] sm:text-[14px] lg:text-[15px] xl:text-[16px] leading-tight">
                                            Завантажити / Надіслати на пошту
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* МОДАЛКА 1: Додавання рецепту */}
            {isAddModalOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transform-gpu w-full h-full"
                    onClick={() => { setIsAddModalOpen(false); setModalError(null); setDuplicateError(null); }}
                >
                    <div
                        className="bg-white rounded-[2.5rem] p-5 sm:p-8 w-full max-w-4xl h-[90vh] sm:h-[85vh] flex flex-col shadow-2xl relative font-['Inter']"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => {
                                setIsAddModalOpen(false);
                                setModalError(null);
                                setDuplicateError(null);
                            }}
                            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer transition-all duration-300 ease-out active:scale-95 group"
                        >
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <h2 className="text-xl sm:text-2xl font-bold font-['El_Messiri'] text-gray-900 mb-6 uppercase tracking-wide pr-10">
                            Підібрати рецепт на {MEAL_NAMES_ACCUSATIVE[selectedMealForAdd]}
                        </h2>

                        {modalError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2 shrink-0 animate-pulse">
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                {modalError}
                            </div>
                        )}

                        {/* Блок пошуку з підказками */}
                        <div className="mb-4 shrink-0 relative" ref={suggestionsRef}>

                            {/* Повідомлення про дублювання */}
                            {duplicateError && (
                                <div className="absolute -top-3 left-0 animate-fade-in w-max max-w-[100%] px-3 py-1.5 bg-red-100 border border-red-300 rounded-lg text-red-700 text-[11px] sm:text-[13px] font-medium flex items-center gap-1.5 shadow-sm z-20">
                                    <svg className="shrink-0" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                    <span className="truncate">Інгредієнт <b>«{duplicateError}»</b> вже додано до пошуку.</span>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                <p className="text-[11px] sm:text-[13px] md:text-[15px] text-gray-800 text-green-900 px-1 mt-1 sm:mt-0 order-2 sm:order-1 leading-tight">
                                    💡 Розділяйте інгредієнти <b>комою</b> (наприклад: картопля, білий рис)
                                </p>
                            </div>

                            <div className="relative shadow-sm rounded-xl flex">
                                <div className="relative flex-grow">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder="Листя салату, Картопля, Бринза..."
                                        value={searchQuery}
                                        onChange={handleInputChange}
                                        onFocus={() => setShowSuggestions(true)}
                                        className={`w-full bg-white border-2 rounded-xl px-5 py-3.5 sm:py-4 pl-12 pr-10 outline-none transition-colors text-gray-800 font-medium font-['Inter'] ${
                                            (modalError || duplicateError) 
                                            ? 'border-red-300 focus:border-red-500 bg-red-50/50 text-red-900 placeholder-red-300' 
                                            : 'border-gray-200 focus:border-[#6A907B]'
                                        }`}
                                    />
                                    {/* Іконка лупи зліва */}
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>

                                    {/* Кнопка очищення вводу справа (показується тільки якщо є текст) */}
                                    {searchQuery && (
                                        <button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setDuplicateError(null);
                                                if (inputRef.current) inputRef.current.focus();
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                                            title="Очистити поле"
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

                        {/* Швидкий скролячий список інгредієнтів (горизонтальна стрічка) */}
                        <div className="mb-4 sm:mb-6 shrink-0 w-full">
                            <div className="flex gap-2.5 overflow-x-auto custom-scrollbar pb-2 pt-1 px-1">
                                {allIngredients
                                    .filter(ing => !isIngredientInQuery(searchQuery, ing.name))
                                    .map(ing => (
                                    <button
                                        key={ing.id}
                                        onClick={() => handleAddIngredientToSearch(ing.name)}
                                        className="px-3.5 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-[13.5px] font-medium text-gray-700 hover:border-[#6A907B] hover:text-[#6A907B] hover:shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer transition-all duration-300 ease-out active:scale-95 group"
                                    >
                                        {ing.image ? (
                                            <img src={getImageUrl(ing.image)} alt={ing.name} className="w-5 h-5 rounded-full object-cover bg-white shadow-sm group-hover:scale-110 transition-transform" />
                                        ) : (
                                            <span className="text-gray-400">•</span>
                                        )}
                                        <span className="capitalize">{ing.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Список результатів */}
                        <div
                            className="flex-grow overflow-y-auto pr-1 sm:pr-2 space-y-3 sm:space-y-4 custom-scrollbar"
                            onScroll={handleScroll}
                        >
                            {isSearching ? (
                                <div className="flex justify-center items-center py-10">
                                    <svg className="animate-spin h-8 w-8 text-[#5B826B]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                </div>
                            ) : availableRecipes.length === 0 ? (
                                <div className="text-center text-gray-500 font-['Inter'] py-10">
                                    {searchQuery ? "За вашим запитом нічого не знайдено." : "Тут з'являться рецепти."}
                                </div>
                            ) : (
                                availableRecipes.map(recipe => (
                                    <div key={recipe.id} className="bg-white border border-gray-100 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-6 hover:shadow-md transition-shadow">

                                        <Link to={`/recipe/${recipe.id}`} className="w-full sm:w-50 md:w-60 h-40 sm:h-28 md:h-34 shrink-0 flex items-center justify-center cursor-pointer transition-all duration-300 ease-out active:scale-98">
                                            <img src={getImageUrl(recipe.image || recipe.image_url)} alt={recipe.title} className="w-full h-full rounded-xl object-cover shadow-sm" />
                                        </Link>

                                        <div className="flex-grow w-full flex flex-col justify-center text-center sm:text-left py-1">
                                            <Link
                                                to={`/recipe/${recipe.id}`}
                                                className="font-['El_Messiri'] font-bold text-lg md:text-xl text-gray-900 line-clamp-2 hover:text-[#6A907B] transition-colors inline-block mb-1.5 cursor-pointer transition-all duration-300 ease-out active:scale-98 group"
                                            >
                                                {recipe.title}
                                            </Link>

                                            {/* ЗМІНЕНО: бейджик з кількістю збігів */}
                                            {recipe.match_count > 0 && recipe.total_count > 0 && (
                                                <div className="inline-flex items-start sm:items-center justify-center sm:justify-start gap-1.5 text-[13px] sm:text-sm font-semibold text-[#6A907B] mb-2 text-left">
                                                    {/* shrink-0 забороняє іконці стискатися */}
                                                    <svg className="shrink-0 mt-[2px] sm:mt-0" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                        <path d="M4 12.5C4 12.5 7.5 17 8.5 18C10 14 15 7.5 20 5"></path>
                                                    </svg>
                                                    {/* leading-tight допомагає при переносі тексту на кілька рядків */}
                                                    <span className="leading-tight">Знайдено {recipe.match_count} з {recipe.total_count} інгредієнтів</span>
                                                </div>
                                            )}

                                            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-auto">
                                                {recipe.cooking_time} хв • {recipe.calories} ккал
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-center w-full sm:w-auto shrink-0 pb-1 sm:pb-0">
                                            <button
                                                onClick={() => handleAddRecipeToMenu(recipe.id)}
                                                className="w-full sm:w-auto px-8 py-3 sm:py-3 md:py-3.5 bg-[#1A1A1A] text-white rounded-xl text-sm md:text-base font-semibold hover:bg-[#6A907B] transition-colors shadow-sm cursor-pointer transition-all duration-300 ease-out active:scale-95 group"
                                            >
                                                Додати
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}

                            {!searchQuery && allFetchedRecipes.length > 0 && (
                                <p className="text-center text-xs text-gray-400 py-4 italic">
                                    Показано 10 випадкових рецептів. Скористайтеся пошуком, щоб знайти інші.
                                </p>
                            )}

                            {searchQuery && visibleRecipeCount >= allFetchedRecipes.length && allFetchedRecipes.length > 0 && (
                                <p className="text-center text-xs text-gray-400 py-4">
                                    Це всі знайдені рецепти за вашим запитом.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* МОДАЛКА 2: Експорт PDF */}
            {isExportModalOpen && (
                <div
                    className="fixed top-0 left-0 w-screen h-screen z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transform-gpu transition-all"
                    onClick={() => {
                        setIsExportModalOpen(false);
                        setExportStatus(null);
                        setExportEmail(''); // очищуємо пошту при закритті по фону
                    }}
                >
                    <div
                        className="bg-white rounded-[2.5rem] p-8 sm:p-10 w-full max-w-[460px] shadow-2xl relative font-['Inter']"
                        onClick={(e) => e.stopPropagation()} // блокуємо закриття при кліку на саме вікно
                    >
                        <button
                            onClick={() => {
                                setIsExportModalOpen(false);
                                setExportStatus(null);
                                setExportEmail(''); // очищуємо пошту при натисканні на хрестик
                            }}
                            className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-all cursor-pointer duration-300 ease-out active:scale-95 group"
                        >
                            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <div className="flex justify-center mb-5">
                            <div className="w-16 h-16 bg-[#B47231]/10 rounded-full flex items-center justify-center text-[#B47231]">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold font-['El_Messiri'] text-gray-900 mb-2 text-center uppercase tracking-wide">
                            Завантаження списку
                        </h2>
                        <p className="text-[13px] text-gray-500 mb-4 text-center font-medium leading-relaxed px-4">
                            Завантажте файл на пристрій або відправте його собі на електронну пошту.
                        </p>

                        <div className="flex bg-gray-100 p-1 rounded-[1.2rem] mb-6">
                            <button
                                onClick={() => setExportScope('day')}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 cursor-pointer ease-out active:scale-95 group ${exportScope === 'day' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                На день ({DAYS_ACCUSATIVE[activeDay]})
                            </button>
                            <button
                                onClick={() => setExportScope('week')}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 cursor-pointer ease-out active:scale-95 group ${exportScope === 'week' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                На тиждень
                            </button>
                        </div>

                        {/* Повідомлення про помилку ЕКСПОРТУ В МОДАЛЦІ - НАД КНОПКОЮ */}
                        {exportStatus && (
                            <div className={`mb-4 p-3 border rounded-xl text-sm font-medium flex items-center justify-center gap-2 shrink-0 transition-colors w-max max-w-[100%] mx-auto ${
                                exportStatus.type === 'error' ? 'bg-red-100 border-red-300 text-red-700 animate-fade-in' :
                                exportStatus.type === 'loading' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                                'bg-green-50 border-green-200 text-green-700'
                            }`}>
                                {exportStatus.type === 'error' && (
                                    <svg className="shrink-0" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                )}
                                {exportStatus.type === 'loading' && (
                                    <svg className="animate-spin shrink-0 text-blue-500" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                )}
                                {exportStatus.type === 'success' && (
                                    <svg className="shrink-0" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                )}
                                <span className="flex-1 break-words leading-tight text-center sm:text-left">{exportStatus.text}</span>
                            </div>
                        )}

                        {/* Кнопка Завантаження */}
                        <div className="overflow-y-auto custom-scrollbar flex-grow pr-1 space-y-4">
                            <button
                                onClick={() => handleExport('download')}
                                className="w-full bg-[#5B826B] text-white py-3.5 rounded-[1.2rem] font-bold hover:bg-gray-800 transition-all shadow-md flex justify-center items-center gap-2 shrink-0 cursor-pointer duration-300 ease-out active:scale-95 group"
                            >
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                Завантажити
                            </button>

                            <div className="relative flex py-1 items-center shrink-0">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">Або на пошту</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>

                            <div className="relative shrink-0">
                                <input
                                    type="email"
                                    placeholder="Введіть email..."
                                    value={exportEmail}
                                    onChange={(e) => setExportEmail(e.target.value)}
                                    className="w-full bg-transparent border-2 border-gray-200 rounded-[1.2rem] px-5 py-3.5 outline-none focus:border-[#B47231] text-gray-800 font-semibold text-sm transition-colors"
                                />
                            </div>

                            <button
                                onClick={() => handleExport('email')}
                                className="w-full bg-white border-2 border-[#B47231] text-[#B47231] py-3.5 rounded-[1.2rem] font-bold hover:bg-[#B47231] hover:text-white transition-all flex justify-center items-center gap-2 shrink-0 cursor-pointer duration-300 ease-out active:scale-95 group"
                            >
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                Надіслати на пошту
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Menu;