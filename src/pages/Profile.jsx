import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ENDPOINTS, API_URL } from '../constants/api';
import { DICTIONARIES } from '../constants/translations';

import defaultAvatar from '../assets/global/avokado_avatar.png';
import profileBg from '../assets/profile/profile-bg.jpg';

// ІМПОРТ ЗОБРАЖЕНЬ ДЛЯ ПОРАД
import advice1 from '../assets/profile/advice1.jpg'; // Зелень
import advice2 from '../assets/profile/advice2.jpg'; // Сковорода
import advice3 from '../assets/profile/advice3.jpg'; // Шоколад

// ================= ІМПОРТИ ЗОБРАЖЕНЬ КУХОНЬ =================
import euCuisine from '../assets/profile/cuisines/eu.png';
import mediterraneanCuisine from '../assets/profile/cuisines/mediterranean.png';
import itCuisine from '../assets/profile/cuisines/it.png';
import mxCuisine from '../assets/profile/cuisines/mx.png';
import intlCuisine from '../assets/profile/cuisines/intl.png';
import uaCuisine from '../assets/profile/cuisines/ua.png';
import frCuisine from '../assets/profile/cuisines/fr.png';
import usCuisine from '../assets/profile/cuisines/us.png';
import cnCuisine from '../assets/profile/cuisines/cn.png';
import jpCuisine from '../assets/profile/cuisines/jp.png';
import asianCuisine from '../assets/profile/cuisines/asian.png';
import gbCuisine from '../assets/profile/cuisines/gb.png';
import authorCuisine from '../assets/profile/cuisines/author.png';
import inCuisine from '../assets/profile/cuisines/in.png';

// ================= ІМПОРТИ ЗОБРАЖЕНЬ ДІЄТ =================
import traditionalDiet from '../assets/profile/diets/traditional.png';
import vegetarianDiet from '../assets/profile/diets/vegetarian.png';
import veganDiet from '../assets/profile/diets/vegan.png';
import dietaryDiet from '../assets/profile/diets/dietary.png';
import glutenFreeDiet from '../assets/profile/diets/gluten_free.png';
import sugarFreeDiet from '../assets/profile/diets/sugar_free.png';
import lactoseFreeDiet from '../assets/profile/diets/lactose_free.png';
import highProteinDiet from '../assets/profile/diets/high_protein.png';
import meatDiet from '../assets/profile/diets/meat_diet.png';
import seafoodDiet from '../assets/profile/diets/seafood_diet.png';

// ІМПОРТ ЗОБРАЖЕНЬ ДЛЯ КУХНІ ХАРЧОВИХ ОБМЕЖЕНЬ ТА ПРОДУКТІВ
import riceCookerIcon from '../assets/profile/rice_cooker.png';
import commercialIcon from '../assets/profile/commercial.png';
import fridgeIcon from '../assets/profile/fridge.png';

const Profile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Основні дані
    const [userData, setUserData] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState(null);

    // СТАН ДЛЯ АКТИВНОГО ТАБУ
    // 'inventory', 'cuisine', 'allergies', 'diets'
    const [activeTab, setActiveTab] = useState(null);

    // Стани для модалки "Редагувати профіль"
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');

    // Стани для відкриття полів додавання
    const [showAddAllergy, setShowAddAllergy] = useState(false);
    const [showAddDiet, setShowAddDiet] = useState(false);
    const [showAddCuisine, setShowAddCuisine] = useState(false);
    // const [isFridgeOpen, setIsFridgeOpen] = useState(false); // Відкриття списку продуктів користувача як блоку

    // Стани для модалки зміни пароля
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', newPasswordConfirm: '' });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Стани для нових елементів
    const [newAllergy, setNewAllergy] = useState('');
    const [newDiet, setNewDiet] = useState('');
    const [newCuisine, setNewCuisine] = useState('');
    const [newFridgeItem, setNewFridgeItem] = useState({ ingredient: '', amount: '', unit: 'g' });
    // Стан, який вказує, чи ми редагуємо існуючий продукт (зберігає ID запису в інвентарі)
    const [editingInventoryId, setEditingInventoryId] = useState(null);

    // === СТАНИ ТА REFS ДЛЯ НОВИХ БЛОКІВ ===
    const [allergySearch, setAllergySearch] = useState('');
    // Стан для пошуку в списку продуктах користувача
    const [fridgeSearch, setFridgeSearch] = useState('');
    // Стан для керування видимістю випадаючого списку
    const [isFridgeDropdownOpen, setIsFridgeDropdownOpen] = useState(false);
    // Стан для модалки підтвердження видалення аватара
    const [isDeleteAvatarModalOpen, setIsDeleteAvatarModalOpen] = useState(false);

    // Стан для модального вікна "Поради" (зберігає ID або назву відкритої поради)
    const [activeAdviceModal, setActiveAdviceModal] = useState(null);

    // Стан для модалки кухонь
    const [isCuisineModalOpen, setIsCuisineModalOpen] = useState(false);

    // Стан для модалки алергій
    const [isAllergyModalOpen, setIsAllergyModalOpen] = useState(false);

    // Стан для модалки дієт
    const [isDietModalOpen, setIsDietModalOpen] = useState(false);

    // Стан для модалки мої продукти
    const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

    // Стан для повідомлень всередині модалки інвентаря (успіх або помилка)
    const [inventoryMessage, setInventoryMessage] = useState(null); // { type: 'error' | 'success', text: '' }

    // Зберігаємо таймер, щоб не було накладання
    const inventoryMessageTimerRef = useRef(null);

    const addAllergyWrapperRef = useRef(null);
    const addDietWrapperRef = useRef(null);
    const addCuisineWrapperRef = useRef(null);
    // Ref для закриття списку пошуку продуктів користувача
    const addFridgeWrapperRef = useRef(null);

    useEffect(() => {
        fetchData();
        window.scrollTo(0, 0);
    }, [navigate]);

    const fetchData = async () => {
        try {
            const ingredientsUrl = ENDPOINTS?.INGREDIENTS || '/api/ingredients/';
            const [userRes, ingredientsRes] = await Promise.all([
                api.get('/api/auth/user/'),
                api.get(ingredientsUrl)
            ]);

            setUserData(userRes.data);
            setEditNameValue(userRes.data.first_name || '');

            let ingredientsData = [];
            if (Array.isArray(ingredientsRes.data)) {
                ingredientsData = ingredientsRes.data;
            } else if (ingredientsRes.data && Array.isArray(ingredientsRes.data.results)) {
                ingredientsData = ingredientsRes.data.results;
            }

            setIngredients(ingredientsData);
            setLoading(false);
        } catch (error) {
            console.error("Помилка завантаження даних", error);
            navigate('/login');
        }
    };

    // Об'єкт-маппінг, щоб пов'язати ключ кухні із зображенням
    // Ключі точно збігаються з ключами в DICTIONARIES.cuisine
    const CUISINE_IMAGES = {
        'eu': euCuisine,
        'mediterranean': mediterraneanCuisine,
        'it': itCuisine,
        'mx': mxCuisine,
        'intl': intlCuisine,
        'ua': uaCuisine,
        'fr': frCuisine,
        'us': usCuisine,
        'cn': cnCuisine,
        'jp': jpCuisine,
        'asian': asianCuisine,
        'gb': gbCuisine,
        'author': authorCuisine,
        'in': inCuisine
    };

    // Об'єкт-маппінг для дієт
    const DIET_IMAGES = {
        'traditional': traditionalDiet,
        'vegetarian': vegetarianDiet,
        'vegan': veganDiet,
        'dietary': dietaryDiet,
        'gluten_free': glutenFreeDiet,
        'lactose_free': lactoseFreeDiet,
        'sugar_free': sugarFreeDiet,
        'high_protein': highProteinDiet,
        'meat_diet': meatDiet,
        'seafood_diet': seafoodDiet
    };

    // Маппінг категорій інгредієнтів до логічних одиниць виміру (ДЛЯ ІНВЕНТАРЯ)
    const CATEGORY_UNIT_MAP = {
        'fruits': ['g', 'kg'],
        'vegetables': ['g', 'kg'],
        'dairy': ['g', 'kg', 'ml', 'l'],
        'oils_liquids': ['ml', 'l', 'tbsp', 'tsp'],
        'spices': ['g', 'tsp'],
        'meat_beef': ['g', 'kg'],
        'meat_pork': ['g', 'kg'],
        'meat_bird': ['g', 'kg'],
        'meat_products': ['g', 'kg', 'slice'],
        'grains': ['g', 'kg', 'tbsp', 'glass'],
        'cheese': ['g', 'kg', 'slice'],
        'seafood': ['g', 'kg'],
        'fish_red': ['g', 'kg'],
        'fish_white': ['g', 'kg'],
        'sweets': ['g', 'tsp', 'tbsp'],
        'greens': ['bunch', 'g', 'sprig'],
        'mushrooms': ['g', 'kg'],
        'nuts': ['g', 'kg'],
        'flour': ['g', 'kg', 'tbsp', 'glass'],
        'alt_protein': ['g', 'kg'],
    };

    // СУВОРІ ПЕРЕВИЗНАЧЕННЯ ДЛЯ КОНКРЕТНИХ ІНГРЕДІЄНТІВ (ДЛЯ ІНВЕНТАРЯ)
    const EXACT_UNIT_MATCH = {
        'Яйця': ['pcs'],
        'Перепелині яйця': ['pcs'],
        'Лимон': ['pcs', 'g'], // Лимон в холодильнику міряють штуками
        'Лайм': ['pcs', 'g'],
        'Авокадо': ['pcs', 'g'],
        'Банан': ['pcs', 'g'],
        'Часник': ['g', 'kg', 'clove'],
        'Вода': ['ml', 'l'],
        'Бульйон': ['ml', 'l'],
        'Овочевий бульйон': ['ml', 'l'],
        'Сіль': ['g', 'kg'],
        'Перець чорний': ['g'],
        'Хліб': ['slice', 'g'],
        'Кокосове молоко': ['ml', 'l', 'can'],
        'Томатна паста': ['g', 'tbsp', 'can'],
        'Пападам': ['pcs'],
        'Вершкове масло': ['g', 'kg'],
        'Шоколад': ['g', 'pcs'],
        'Темний шоколад': ['g', 'pcs'],
        'Розпушувач': ['g', 'tsp'],
        'Желатин': ['g', 'tsp'],
    };

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const getImageUrl = (path) => {
        if (!path) return defaultAvatar;
        if (path.startsWith('http')) return path;
        return `${API_URL}${path}`;
    };

    // Отримання іконок (заглушки під майбутні картинки дизайнерів)
    const getDietIcon = (key) => `/src/assets/profile/diets/${key}.png`;
    const getCuisineIcon = (key) => `/src/assets/profile/cuisines/${key}.png`;


    // Спільна функція для очищення ВСІХ незбережених станів
    const clearAllUnsavedInputs = () => {
        setNewFridgeItem({ ingredient: '', amount: '', unit: 'g' });
        setFridgeSearch('');
        setEditingInventoryId(null);
        setIsFridgeDropdownOpen(false);
        setAllergySearch('');
        setNewAllergy('');
        setNewDiet('');
        setNewCuisine('');
        setShowAddAllergy(false);
        setShowAddDiet(false);
        setShowAddCuisine(false);
    };

    // Обробник перемикання табів
    const handleTabClick = (tabName) => {
        clearAllUnsavedInputs();
        // Якщо клікаємо на вже відкритий таб - закриваємо його (ставимо null)
        if (activeTab === tabName) {
            setActiveTab(null);
        } else {
            setActiveTab(tabName);
        }
    };

    // Сповіщаємо Хедер про оновлення профілю
    const dispatchUserUpdate = (updatedData) => {
        window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: updatedData }));
    };

    // Функція для отримання безпечної дефолтної одиниці
    const getDefaultUnit = (ingredient) => {
        if (!ingredient) return 'g';
        if (EXACT_UNIT_MATCH[ingredient.name]) {
            return EXACT_UNIT_MATCH[ingredient.name][0];
        }
        const units = CATEGORY_UNIT_MAP[ingredient.category] || ['g'];
        return units[0];
    };

    const resetInventoryForm = () => {
        setFridgeSearch('');
        setNewFridgeItem({ ingredient: '', amount: '', unit: 'g' });
        setIsFridgeDropdownOpen(false);
        setEditingInventoryId(null);
        setInventoryMessage(null); // Очищаємо повідомлення при закритті/скасуванні
    };

    // Єдина функція для показу повідомлень в модалці інвентаря, яка сама зникає
    const showInventoryMessage = (type, text, duration = 4000) => {
        setInventoryMessage({ type, text });

        // Очищаємо попередній таймер, якщо він був
        if (inventoryMessageTimerRef.current) {
            clearTimeout(inventoryMessageTimerRef.current);
        }

        // Ставимо новий таймер на зникнення
        inventoryMessageTimerRef.current = setTimeout(() => {
            setInventoryMessage(null);
        }, duration);
    };

    // ================= ОБРОБНИКИ ДЛЯ ПРОФІЛЮ =================

    // Допоміжна функція для безпечної транслітерації імені
    const transliterate = (text) => {
        if (!text) return 'user';
        const cyrillic = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye', 'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya',
            'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Ґ': 'G', 'Д': 'D', 'Е': 'E', 'Є': 'Ye', 'Ж': 'Zh', 'З': 'Z', 'И': 'Y', 'І': 'I', 'Ї': 'Yi', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ь': '', 'Ю': 'Yu', 'Я': 'Ya'
        };

        return text.split('').map(char => cyrillic[char] || char)
            .join('')
            .replace(/[^a-zA-Z0-9]/g, '_') // Замінюємо пробіли та спецсимволи на підкреслення
            .replace(/_+/g, '_') // Прибираємо зайві підкреслення підряд
            .toLowerCase();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 1. Формуємо безпечне ім'я з імені користувача
        const safeUserName = transliterate(userData?.first_name);

        // 2. Формуємо рядок з датою (Формат: YYYYMMDD_HHMM)
        const date = new Date();
        const dateString = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;

        // 3. Отримуємо оригінальне розширення файлу (наприклад, jpg або png)
        const extension = file.name.split('.').pop().toLowerCase();

        // 4. Збираємо нове ім'я файлу
        const newFileName = `${safeUserName}_${dateString}.${extension}`;

        // 5. Створюємо новий об'єкт File з нашою новою назвою
        const renamedFile = new File([file], newFileName, { type: file.type });

        const formData = new FormData();
        formData.append('avatar', renamedFile); // Передаємо ПЕРЕЙМЕНОВАНИЙ файл

        try {
            const res = await api.patch('/api/auth/user/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Додаємо унікальний час до URL, щоб скинути кеш браузера і показати нове фото
            const updatedUser = { ...res.data };
            if (updatedUser.avatar) {
                const separator = updatedUser.avatar.includes('?') ? '&' : '?';
                updatedUser.avatar = `${updatedUser.avatar}${separator}t=${new Date().getTime()}`;
            }

            setUserData(updatedUser);
            dispatchUserUpdate(updatedUser); // Оновлюємо хедер
            showToast("✅ Фото профілю оновлено!");
        } catch (err) {
            showToast("❌ Помилка завантаження фото");
        }
    };

    const handleNameSave = async () => {
        try {
            const res = await api.patch('/api/auth/user/', { first_name: editNameValue });
            setUserData(res.data);
            dispatchUserUpdate(res.data); // Оновлюємо хедер
            setIsEditProfileModalOpen(false);
            showToast("✅ Дані профілю оновлено!");
        } catch (err) {
            showToast("❌ Помилка оновлення даних");
        }
    };

    const updateArrayField = async (field, newArray) => {
        try {
            const res = await api.patch('/api/auth/user/', { [field]: newArray });
            setUserData(res.data);
            return true;
        } catch (err) {
            showToast("❌ Сталася помилка");
            return false;
        }
    };

    // ================= АЛЕРГІЇ =================
    const safeAllergies = userData?.allergies || [];
    const addAllergy = async () => {
        if (!newAllergy) return;
        const updatedAllergies = [...safeAllergies, parseInt(newAllergy)];
        const success = await updateArrayField('allergies', updatedAllergies);
        if (success) { setNewAllergy(''); setShowAddAllergy(false); }
    };
    const removeAllergy = async (idToRemove) => {
        const updatedAllergies = safeAllergies.filter(id => id !== idToRemove);
        await updateArrayField('allergies', updatedAllergies);
    };

    // ================= ОБМЕЖЕННЯ (ДІЄТИ) =================
    const safeDiets = userData?.dietary_preferences || [];
    const addDiet = async () => {
        if (!newDiet || safeDiets.includes(newDiet)) return;
        const updatedDiets = [...safeDiets, newDiet];
        const success = await updateArrayField('dietary_preferences', updatedDiets);
        if (success) { setNewDiet(''); setShowAddDiet(false); }
    };
    const removeDiet = async (dietToRemove) => {
        const updatedDiets = safeDiets.filter(d => d !== dietToRemove);
        await updateArrayField('dietary_preferences', updatedDiets);
    };

    // ================= КУХНІ =================
    const safeCuisines = userData?.favorite_cuisines || [];
    const addCuisine = async () => {
        if (!newCuisine || safeCuisines.includes(newCuisine)) return;
        const updatedCuisines = [...safeCuisines, newCuisine];
        const success = await updateArrayField('favorite_cuisines', updatedCuisines);
        if (success) { setNewCuisine(''); setShowAddCuisine(false); }
    };
    const removeCuisine = async (cuisineToRemove) => {
        const updatedCuisines = safeCuisines.filter(c => c !== cuisineToRemove);
        await updateArrayField('favorite_cuisines', updatedCuisines);
    };

    // ================= ФУНКЦІЇ МАСОВОГО ОЧИЩЕННЯ =================

    const clearAllCuisines = async () => {
        if (safeCuisines.length === 0) return;
        const success = await updateArrayField('favorite_cuisines', []);
        if (success) showToast("✅ Всі кухні видалено");
    };

    const clearAllDiets = async () => {
        if (safeDiets.length === 0) return;
        const success = await updateArrayField('dietary_preferences', []);
        if (success) showToast("✅ Всі харчові обмеження видалено");
    };

    const clearAllAllergies = async () => {
        if (safeAllergies.length === 0) return;
        const success = await updateArrayField('allergies', []);
        if (success) showToast("✅ Всі алергії видалено");
    };

    const clearAllInventory = async () => {
        if (safeInventory.length === 0) return;

        // Оскільки в нас немає спеціального ендпоінту для масового видалення,
        // ми видаляємо кожен продукт по черзі. Для невеликих списків це працює миттєво.
        try {
            await Promise.all(safeInventory.map(item => api.delete(`/api/inventory/${item.id}/`)));
            setUserData(prev => ({ ...prev, inventory: [] }));
            resetInventoryForm();
            showToast("✅ Всі продукти видалено");
        } catch (err) {
            showToast("❌ Помилка під час масового видалення продуктів");
            console.error(err);
        }
    };

    // ================= Продукти користувача (ІНВЕНТАР) =================
    const safeInventory = userData?.inventory || [];
    const inventoryUrl = ENDPOINTS?.INVENTORY || '/api/inventory/';

    // Функція вміє створювати (POST) і оновлювати (PATCH)
    const addFridgeItem = async () => {
        setInventoryMessage(null); // Очищаємо попередні повідомлення миттєво при натисканні

        // 1. Базові перевірки
        if (!newFridgeItem.ingredient) {
            showInventoryMessage('error', "Спочатку оберіть продукт зі списку!", 3000);
            return;
        }

        const parsedAmount = newFridgeItem.amount ? parseFloat(newFridgeItem.amount) : null;

        if (newFridgeItem.unit !== 'taste' && (parsedAmount === null || parsedAmount <= 0 || isNaN(parsedAmount))) {
            showInventoryMessage('error', "Введіть коректну кількість продукту!", 3000);
            return;
        }

        // 2. ЖОРСТКА ПЕРЕВІРКА НА ДУБЛІКАТИ
        const existingItem = safeInventory.find(item => item.ingredient === parseInt(newFridgeItem.ingredient));

        if (existingItem && editingInventoryId !== existingItem.id) {
            showInventoryMessage('error', "Цей продукт вже є у вашому списку. Знайдіть його та оновіть кількість.", 4000);
            return; // ЗУПИНЯЄМО ВИКОНАННЯ
        }

        try {
            if (editingInventoryId) {
                // РЕЖИМ ОНОВЛЕННЯ
                const res = await api.patch(`${inventoryUrl}${editingInventoryId}/`, {
                    amount: parsedAmount,
                    unit: newFridgeItem.unit
                });

                const updatedInventory = safeInventory.map(item =>
                    item.id === editingInventoryId ? res.data : item
                );
                setUserData({ ...userData, inventory: updatedInventory });
                showInventoryMessage('success', "Кількість продукту успішно оновлено!", 3000);

            } else {
                // РЕЖИМ СТВОРЕННЯ
                const res = await api.post(inventoryUrl, {
                    ingredient: parseInt(newFridgeItem.ingredient),
                    amount: parsedAmount,
                    unit: newFridgeItem.unit
                });
                setUserData({ ...userData, inventory: [res.data, ...safeInventory] });
                showInventoryMessage('success', "Продукт успішно додано до списку продуктів!", 3000);
            }

            // Очищаємо поля вводу після успішного збереження
            setNewFridgeItem({ ingredient: '', amount: '', unit: 'g' });
            setFridgeSearch('');
            setIsFridgeDropdownOpen(false);
            setEditingInventoryId(null);

        } catch (err) {
            console.error("Inventory error:", err);
            // Виводимо повідомлення про помилку мережі/сервера і даємо йому 5 секунд, щоб юзер встиг прочитати
            if (err.response && err.response.data) {
                 showInventoryMessage('error', `Помилка: ${JSON.stringify(err.response.data)}`, 5000);
            } else {
                 showInventoryMessage('error', "Помилка з'єднання з сервером", 4000);
            }
        }
    };

    // Вибір продукту без миттєвого збереження + перевірка на існування
    const handleSelectFridgeIngredient = (ing) => {
        setFridgeSearch(ing.name);
        setIsFridgeDropdownOpen(false);

        // Перевіряємо, чи є вже такий продукт у списку продуктів
        const existingItem = safeInventory.find(item => item.ingredient === ing.id);

        if (existingItem) {
            // Якщо є - переходимо в режим "Редагування"
            setEditingInventoryId(existingItem.id);
            setNewFridgeItem({
                ingredient: ing.id,
                amount: existingItem.amount ? parseFloat(existingItem.amount) : '',
                unit: existingItem.unit
            });
            showToast("ℹ️ Цей продукт вже є в списку продуктів. Можете оновити кількість.");
        } else {
            // Якщо немає - звичайний режим "Створення"
            setEditingInventoryId(null);
            setNewFridgeItem({ ingredient: ing.id, amount: '', unit: 'g' });
        }
    };

    const removeFridgeItem = async (itemId) => {
        try {
            await api.delete(`/api/inventory/${itemId}/`);
            setUserData(prev => ({
                ...prev,
                inventory: prev.inventory.filter(item => item.id !== itemId)
            }));

            // АВТООЧИЩЕННЯ: якщо видаляємо продукт, який зараз редагується
            if (editingInventoryId === itemId) {
                resetInventoryForm();
            }

            showToast("✅ Продукт видалено");
        } catch (err) {
            showToast("❌ Помилка видалення");
        }
    };

    // Закриття блоків при кліку поза їх межами
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (addAllergyWrapperRef.current && !addAllergyWrapperRef.current.contains(event.target)) {
                setShowAddAllergy(false);
                setAllergySearch('');
            }
            if (addDietWrapperRef.current && !addDietWrapperRef.current.contains(event.target)) setShowAddDiet(false);
            if (addCuisineWrapperRef.current && !addCuisineWrapperRef.current.contains(event.target)) setShowAddCuisine(false);

            // Закриваємо випадаючий список пошуку своїх продуктів, якщо клікнули повз
            if (addFridgeWrapperRef.current && !addFridgeWrapperRef.current.contains(event.target)) {
                 setIsFridgeDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Функція додавання алергії напряму зі списку пошуку
    const addAllergyById = async (id) => {
        if (safeAllergies.includes(id)) return;
        const updatedAllergies = [...safeAllergies, id];
        const success = await updateArrayField('allergies', updatedAllergies);
        if (success) {
            setAllergySearch('');
            setShowAddAllergy(false);
        }
    };

    // Функція зміни пароля
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError(''); // Очищаємо попередні помилки

        // Фронтенд перевірки
        if (passwordData.newPassword.length < 8) {
            setPasswordError("Новий пароль має містити щонайменше 8 символів.");
            return;
        }

        if (passwordData.newPassword !== passwordData.newPasswordConfirm) {
            setPasswordError("Нові паролі не співпадають. Перевірте правильність вводу.");
            return;
        }

        if (passwordData.oldPassword === passwordData.newPassword) {
            setPasswordError("Новий пароль не може співпадати з поточним.");
            return;
        }

        try {
            await api.post('/api/auth/password/change/', {
                old_password: passwordData.oldPassword,
                new_password1: passwordData.newPassword,
                new_password2: passwordData.newPasswordConfirm
            });

            // Одразу закриваємо вікно і показуємо красиве сповіщення
            setIsPasswordModalOpen(false);
            setPasswordData({ oldPassword: '', newPassword: '', newPasswordConfirm: '' });
            setPasswordSuccess(true);

            // Повідомлення зникне рівно через 2 секунди (2000 мс)
            setTimeout(() => {
                setPasswordSuccess(false);
            }, 2000);

        } catch (err) {
            const data = err.response?.data;
            let errorMsg = "Виникла помилка. Перевірте правильність даних.";

            if (data) {
                if (data.old_password) errorMsg = "Поточний пароль введено невірно.";
                else if (data.new_password1) errorMsg = data.new_password1[0];
                else if (data.non_field_errors) errorMsg = data.non_field_errors[0];
            }

            setPasswordError(errorMsg);
        }
    };

    // Допоміжні функції для селектів
    const getIngredientData = (id) => ingredients.find(i => i.id === id);
    const availableAllergies = ingredients.filter(i => !safeAllergies.includes(i.id));
    const availableDiets = Object.keys(DICTIONARIES.profile_dietary_tags).filter(k => !safeDiets.includes(k));
    const availableCuisines = Object.keys(DICTIONARIES.cuisine).filter(k => !safeCuisines.includes(k));
    const availableFridgeIngredients = ingredients;

    // Допоміжна функція для правильного відмінювання слова
    const getFavoritesWord = (count) => {
        const num = Math.abs(count || 0) % 100;
        const lastDigit = num % 10;
        if (num >= 11 && num <= 19) return 'Улюблених';
        if (lastDigit === 1) return 'Улюблений';
        if (lastDigit >= 2 && lastDigit <= 4) return 'Улюблені';
        return 'Улюблених';
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-2xl font-['El_Messiri'] text-gray-800">Завантаження профілю...</div>;

    return (
        <div
            className="w-full min-h-screen font-sans pb-24 relative bg-cover bg-no-repeat overflow-x-hidden"
            style={{
                backgroundImage: `url(${profileBg})`,
                backgroundColor: "#F6F3F4",
                backgroundPosition: "center top -150px"
            }}
        >
            <div className="absolute inset-0 w-full h-full z-0"></div>

            {toastMessage && (
                <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 transition-all font-medium flex items-center gap-2">
                    {toastMessage}
                </div>
            )}

            {passwordSuccess && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[200] transition-all duration-500">
                    <div className="bg-[#C4D5BD] px-10 py-6 rounded-3xl shadow-2xl flex flex-col items-center border-2 border-white">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm text-[#42705D]">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-2xl font-bold font-['El_Messiri'] text-gray-900 text-center">
                            Пароль успішно змінено!
                        </h2>
                    </div>
                </div>
            )}

            <div className="w-full px-4 sm:px-6 lg:px-24 pt-48 lg:pt-60 relative z-10">

                {/* ================= БАНЕР ТА ІНФО КОРИСТУВАЧА ================= */}
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14 mb-14 lg:pl-5 xl:pl-12">

                    {/* Аватар */}
                    <div className="relative group shrink-0">
                        <div className="w-80 h-80 sm:w-90 sm:h-90 md:w-80 md:h-80 lg:w-[400px] lg:h-[400px] xl:w-[420px] xl:h-[420px] rounded-full overflow-hidden shadow-sm bg-[#C4D5BD] relative flex items-center justify-center">
                            <img
                                key={userData?.avatar || 'default'} // гарантує повне оновлення картинки
                                src={getImageUrl(userData.avatar)}
                                alt="Аватар"
                                className={`rounded-full transition-all duration-300 ${userData?.avatar ? 'w-full h-full object-cover' : 'w-[60%] h-[60%] object-contain'}`}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = defaultAvatar;
                                    e.target.className = "rounded-full transition-all duration-300 w-[60%] h-[60%] object-contain";
                                }}
                            />
                            {/* Оверлей при наведенні */}
                            <div className="absolute w-[100%] h-[100%] bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full gap-4">

                                {/* Кнопка "Завантажити нове" */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRef.current.click();
                                    }}
                                    className="flex items-center gap-2 text-white hover:text-[#C4D5BD] transition-colors cursor-pointer bg-black/40 px-6 py-3 rounded-full hover:bg-black/60 backdrop-blur-sm"
                                >
                                    <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    <span className="font-semibold text-sm md:text-base">Змінити фото</span>
                                </button>

                                {/* Кнопка "Видалити" */}
                                {userData?.avatar && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsDeleteAvatarModalOpen(true); // Відкриваємо кастомну модалку
                                        }}
                                        className="flex items-center gap-2 text-red-300 hover:text-red-500 transition-colors cursor-pointer bg-black/40 px-6 py-2.5 rounded-full hover:bg-black/60 backdrop-blur-sm"
                                    >
                                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        <span className="font-semibold text-sm md:text-base">Видалити</span>
                                    </button>
                                )}
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                    </div>

                    {/* Інфо */}
                    <div className="flex flex-col items-center md:items-start w-full md:mt-50">
                        <div className="flex flex-col items-center xl:items-start text-center xl:text-left w-full xl:w-auto bg-white/60 backdrop-blur-md p-5 sm:p-4 rounded-[2rem] shadow-sm transition-all duration-500">

                            <div className="w-full flex justify-center xl:justify-start pt-2 sm:pt-4 mb-4 md:mb-8">
                                <h1 className="text-4xl md:text-[46px] lg:text-[54px] font-['El_Messiri'] font-medium text-[#1A1A1A] tracking-wide drop-shadow-sm max-w-full lg:max-w-2xl xl:max-w-3xl break-words leading-tight">
                                    {userData.first_name || 'Користувач'}
                                </h1>
                            </div>

                            <div className="flex flex-col xl:flex-row items-center gap-4 sm:gap-6 w-full xl:w-auto">
                                {/* Email */}
                                <div className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5 md:px-12 md:py-3 bg-white/50 border border-gray-800 rounded-full text-gray-900 font-['Inter'] font-medium text-[15px] md:text-[18px] shrink-0 backdrop-blur-sm">
                                    {userData.email}
                                </div>

                                {/* Редагувати профіль */}
                                <button
                                    onClick={() => setIsEditProfileModalOpen(true)}
                                    className="relative overflow-hidden w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 md:px-12 md:py-3 bg-[#C4D5BD] text-[#974F23] rounded-full font-['Inter'] font-bold text-[15px] md:text-[18px] hover:bg-[#a6bb9f] transition-all whitespace-nowrap shrink-0 cursor-pointer duration-300 ease-out active:scale-95 group shadow-md hover:shadow-lg border border-[#B3C6AC]"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                        Редагувати профіль
                                    </span>
                                    {/* Анімація блиску */}
                                    <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= НАВІГАЦІЯ (ТАБИ) ================= */}
                <div className="border-t-2 border-gray-800 pt-6 pb-4 mb-10 flex flex-wrap justify-center md:justify-center lg:justify-center xl:justify-between px-4 lg:px-12 gap-4 sm:gap-6 lg:gap-8">
                    <button
                        onClick={() => navigate('/favorites')}
                        className={`flex items-center gap-2 sm:gap-3 px-4 py-2 rounded-full font-['Inter'] font-semibold text-[15px] sm:text-[16px] transition-colors cursor-pointer transition-all duration-300 ease-out active:scale-95 group border ${'bg-[#FEE2E2] border-transparent text-gray-800 hover:brightness-95'}`}
                    >
                        <svg className="w-6 h-6 md:w-8 md:h-8 text-red-100 fill-red-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        <span className="font-['Inter'] font-semibold text-[#1A1A1A] text-[15px] sm:text-base md:text-[18px] lg:text-[20px] group-hover:text-[#42705D] transition-colors">{userData.favorites_count} {getFavoritesWord(userData.favorites_count)}</span>
                    </button>

                    <button
                        // Відкриваємо модалку замість табу
                        onClick={() => setIsCuisineModalOpen(true)}
                        className={`flex items-center gap-2 sm:gap-3 px-5 py-2 rounded-full transition-all duration-300 ease-out active:scale-95 group border cursor-pointer ${
                            // Логіка активного стану: якщо є вибрані кухні - кнопка зелена
                            safeCuisines.length > 0 
                                ? 'bg-[#CCFBF1] border-cyan-300 text-gray-900 shadow-inner' 
                                : 'bg-[#E3ECD9] border-transparent text-[#1A1A1A] hover:brightness-95'
                        }`}
                    >
                        <img
                            src={riceCookerIcon}
                            alt="Іконка кухні"
                            className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 object-contain group-hover:scale-110 transition-transform"
                        />

                        <span className="font-['Inter'] font-semibold text-[#1A1A1A] text-[15px] sm:text-base md:text-[18px] lg:text-[20px] group-hover:text-[#42705D] transition-colors">
                            {safeCuisines.length > 0 ? `Кухня (${safeCuisines.length})` : 'Кухня'}
                        </span>
                    </button>

                    <button
                        // Відкриваємо модалку замість табу
                        onClick={() => setIsAllergyModalOpen(true)}
                        className={`flex items-center gap-2 sm:gap-3 px-5 py-2 rounded-full font-['Inter'] font-semibold text-[15px] sm:text-[16px] transition-colors cursor-pointer transition-all duration-300 ease-out active:scale-95 group border ${
                            safeAllergies.length > 0 
                                ? 'bg-[#FEE2E2] border-red-300 text-gray-900 shadow-inner' 
                                : 'bg-[#E3ECD9] border-transparent text-[#1A1A1A] hover:brightness-95 hover:text-[#42705D]'
                        }`}
                    >
                        <svg className="w-6 h-6 md:w-8 md:h-8 text-red-500 group-hover:scale-110 transition-transform fill-red-500" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12" stroke="white" strokeWidth="3" strokeLinecap="round"></line></svg>
                        <span className="font-['Inter'] font-semibold text-[#1A1A1A] text-[15px] sm:text-base md:text-[18px] lg:text-[20px] transition-colors">
                            {safeAllergies.length > 0 ? `Алергії (${safeAllergies.length})` : 'Алергії'}
                        </span>
                    </button>

                    <button
                        // модалка замість табу
                        onClick={() => setIsDietModalOpen(true)}
                        className={`flex items-center gap-2 sm:gap-3 px-5 py-2 rounded-full transition-all duration-300 ease-out active:scale-95 group border cursor-pointer ${
                            // Логіка активного стану
                            safeDiets.length > 0 
                                ? 'bg-[#DBEAFE] border-blue-300 text-gray-900 shadow-inner' 
                                : 'bg-[#E3ECD9] border-transparent text-[#1A1A1A] hover:brightness-95'
                        }`}
                    >
                        <img
                            src={commercialIcon}
                            alt="Іконка харчових обмежень"
                            className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 object-contain group-hover:scale-110 transition-transform"
                        />

                        <span className="font-['Inter'] font-semibold text-[#1A1A1A] text-[15px] sm:text-base md:text-[18px] lg:text-[20px] group-hover:text-[#42705D] transition-colors">
                            {safeDiets.length > 0 ? `Харчові обмеження (${safeDiets.length})` : 'Харчові обмеження'}
                        </span>
                    </button>

                    <button
                        // ВІДКРИВАЄМО МОДАЛКУ
                        onClick={() => setIsInventoryModalOpen(true)}
                        className={`flex items-center gap-2 sm:gap-3 px-5 py-2 rounded-full transition-all duration-300 ease-out active:scale-95 group border cursor-pointer ${
                            safeInventory.length > 0 
                                ? 'bg-[#CCFBF1] border-cyan-300 text-gray-900 shadow-inner' 
                                : 'bg-[#E3ECD9] border-transparent text-[#1A1A1A] hover:brightness-95'
                        }`}
                    >
                        <img
                            src={fridgeIcon}
                            alt="Іконка мої продукти"
                            className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 object-contain group-hover:scale-110 transition-transform"
                        />

                        <span className="font-['Inter'] font-semibold text-[#1A1A1A] text-[15px] sm:text-base md:text-[18px] lg:text-[20px] group-hover:text-[#42705D] transition-colors">
                            {safeInventory.length > 0 ? `Мої продукти (${safeInventory.length})` : 'Мої продукти'}
                        </span>
                    </button>
                </div>

                {/* ================= ФУТЕР БЛОК З ПОВІДОМЛЕННЯМ ================= */}
                <div className="mt-10 mx-auto max-w-3xl xl:max-w-5xl border border-gray-800 rounded-full py-3.5 px-6 text-center shadow-sm">
                    <p className="text-[10px] sm:text-[12px] md:text-[15px] lg:text-[16px] xl:text-[20px] font-medium text-gray-800 font-['Inter']">
                        Ми автоматично приховаємо рецепти, які містять ці інгредієнти та особисті обмеження
                    </p>
                </div>

                {/* ================= БЛОК ПОРАД ================= */}
                <div className="mt-10 mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-4 h-4 bg-[#6A907B] rounded-sm shrink-0"></div>
                        <h2 className="text-[16px] sm:text-[19px] md:text-[22px] lg:text-[25px] xl:text-[30px] font-['El_Messiri'] text-gray-800 uppercase tracking-widest whitespace-nowrap">Поради від LITE cook</h2>
                        <div className="w-full border-t-1 border-gray-800"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Порада 1 */}
                        <div
                            onClick={() => setActiveAdviceModal('greens')}
                            className="flex flex-col group cursor-pointer hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 min-h-[450px] shadow-md hover:shadow-xl rounded-3xl"
                        >
                            {/* БЛОК ЗОБРАЖЕННЯ: isolate transform-gpu bg-white без блимання кутів */}
                            <div className="h-77 relative z-10 rounded-3xl overflow-hidden isolate transform-gpu bg-white">
                                <img src={advice1} alt="Як правильно зберігати зелень" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>

                            {/* ТЕКСТОВИЙ БЛОК: бордер з боків і знизу, -mt-6 ховає верхній стик під картинку, pt-12 компенсує відступ */}
                            <div className="bg-white border-x border-b border-gray-500 group-hover:border-gray-500 rounded-b-3xl flex-grow flex flex-col justify-center text-center p-6 pt-12 -mt-6 relative z-0 transition-colors duration-300">
                                <h3 className="font-['El_Messiri'] font-bold text-gray-900 text-lg leading-snug">Як правильно зберігати зелень в холодильнику: 3 прості способи</h3>
                            </div>
                        </div>

                        {/* Порада 2 */}
                        <div
                            onClick={() => setActiveAdviceModal('pan')}
                            className="flex flex-col group cursor-pointer hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 min-h-[450px] shadow-md hover:shadow-xl rounded-3xl"
                        >
                            <div className="h-77 relative z-10 rounded-3xl overflow-hidden isolate transform-gpu bg-white">
                                <img src={advice2} alt="Яку сковорідку обрати" className="w-full h-full object-cover -scale-x-100 -scale-y-100 group-hover:scale-x-[-1.05] group-hover:scale-y-[-1.05] transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <div className="bg-white border-x border-b border-gray-500 group-hover:border-gray-500 rounded-b-3xl flex-grow flex flex-col justify-center text-center p-6 pt-12 -mt-6 relative z-0 transition-colors duration-300">
                                <h3 className="font-['El_Messiri'] font-bold text-gray-900 text-lg leading-snug">Яку сковорідку обрати для індукційної плити: основні критерії вибору</h3>
                            </div>
                        </div>

                        {/* Порада 3 */}
                        <div
                            onClick={() => setActiveAdviceModal('chocolate')}
                            className="flex flex-col group cursor-pointer hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 min-h-[450px] shadow-md hover:shadow-xl rounded-3xl"
                        >
                            <div className="h-77 relative z-10 rounded-3xl overflow-hidden isolate transform-gpu bg-white">
                                <img src={advice3} alt="Замість лікаря шоколадка" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <div className="bg-white border-x border-b border-gray-500 group-hover:border-gray-500 rounded-b-3xl flex-grow flex flex-col justify-center text-center p-6 pt-12 -mt-6 relative z-0 transition-colors duration-300">
                                <h3 className="font-['El_Messiri'] font-bold text-gray-900 text-lg leading-snug">Замість лікаря - шоколадка: лікувальні властивості чорного шоколаду</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= СУЧАСНЕ МОДАЛЬНЕ ВІКНО ПОРАД (Bottom Sheet / Drawer) ================= */}
                {activeAdviceModal && (
                    <div
                        className="fixed inset-0 z-[200] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setActiveAdviceModal(null)}
                    >
                        <div
                            // ГОЛОВНИЙ БЛОК
                            className="bg-white w-full sm:max-w-2xl max-h-[90vh] flex flex-col rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-[slideUp_0.4s_ease-out] sm:animate-scaleIn"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Кнопка закриття (зафіксована зверху праворуч) */}
                            <button
                                onClick={() => setActiveAdviceModal(null)}
                                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 hover:text-red-500 rounded-full shadow-md transition-all z-50 cursor-pointer"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>

                            {/* Зона контенту, що скролиться ЯК ОДНЕ ЦІЛЕ */}
                            <div className="overflow-y-auto custom-scrollbar flex-1">

                                {/* ПОРАДА 1: Зелень */}
                                {activeAdviceModal === 'greens' && (
                                    <>
                                        {/* Зображення зверху */}
                                        <div className="w-full h-64 sm:h-80 relative shrink-0">
                                            <img src={advice1} alt="Як правильно зберігати зелень" className="w-full h-full object-cover" />
                                        </div>

                                        {/* Текст знизу */}
                                        <div className="p-6 sm:p-10">
                                            <h2 className="text-2xl sm:text-3xl font-bold font-['Inter'] text-gray-900 mb-8 leading-tight">
                                                Як правильно зберігати зелень в холодильнику: 3 прості способи
                                            </h2>
                                            <div className="space-y-6 text-gray-800 font-medium text-[15px] sm:text-[16px] leading-relaxed font-['Inter']">
                                                <p>
                                                    <span className="font-bold text-black">1.</span> Поставте стебла зелені (кріп, петрушка, кінза) у склянку з холодною водою. Зверху накрийте поліетиленовим пакетом.
                                                </p>
                                                <p>
                                                    <span className="font-bold text-black">2.</span> Покладіть суху зелень у пакет із застібкою, випустіть повітря та закрийте. Можна покласти всередину паперову серветку для контролю вологи.
                                                </p>
                                                <p>
                                                    <span className="font-bold text-black">3.</span> Зберігання в тканині: Загорніть зелень у чистий, злегка зволожений вафельний рушник і покладіть у пакет або контейнер.
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* ПОРАДА 2: Сковорідка */}
                                {activeAdviceModal === 'pan' && (
                                    <>
                                        <div className="w-full h-64 sm:h-80 relative shrink-0">
                                            <img src={advice2} alt="Яку сковорідку обрати" className="w-full h-full object-cover -scale-x-100 -scale-y-100" />
                                        </div>

                                        <div className="p-6 sm:p-10">
                                            <h2 className="text-2xl sm:text-3xl font-bold font-['Inter'] text-gray-900 mb-6 leading-tight">
                                                Яку сковорідку обрати для індукційної плити
                                            </h2>
                                            <p className="text-gray-600 font-medium mb-6 font-['Inter']">Основні критерії вибору:</p>
                                            <ul className="space-y-4 text-gray-800 font-medium text-[15px] sm:text-[16px] leading-relaxed list-disc pl-5 marker:text-gray-400 font-['Inter']">
                                                <li><span className="font-bold text-black">Матеріал дна:</span> Шукайте вироби з чавуну, нержавіючої сталі або алюмінію зі спеціальною сталевою вставкою.</li>
                                                <li><span className="font-bold text-black">Якість дна:</span> Воно має бути ідеально рівним, гладким та щільно прилягати до поверхні. Оптимальна товщина дна — від 3-5 мм, щоб уникнути деформації при нагріванні.</li>
                                                <li><span className="font-bold text-black">Діаметр:</span> Бажано, щоб діаметр дна збігався з розміром конфорки (не менше 12 см), інакше плита може не «побачити» посуд.</li>
                                                <li><span className="font-bold text-black">Тест магнітом:</span> Якщо ви сумніваєтеся, прикладіть звичайний магніт до дна — якщо він прилипає, сковорода підходить.</li>
                                            </ul>
                                        </div>
                                    </>
                                )}

                                {/* ПОРАДА 3: Шоколад */}
                                {activeAdviceModal === 'chocolate' && (
                                    <>
                                        <div className="w-full h-64 sm:h-80 relative shrink-0">
                                            <img src={advice3} alt="Замість лікаря шоколадка" className="w-full h-full object-cover" />
                                        </div>

                                        <div className="p-6 sm:p-10">
                                            <h2 className="text-2xl sm:text-3xl font-bold font-['Inter'] text-gray-900 mb-6 leading-tight">
                                                Замість лікаря - шоколадка: лікувальні властивості чорного шоколаду
                                            </h2>
                                            <p className="text-gray-600 font-medium mb-6 font-['Inter']">Основні лікувальні властивості чорного шоколаду:</p>
                                            <ul className="space-y-4 text-gray-800 font-medium text-[15px] sm:text-[16px] leading-relaxed list-disc pl-5 marker:text-gray-400 font-['Inter']">
                                                <li><span className="font-bold text-black">Здоров'я серця та судин:</span> Флавоноїли розслаблюють судини, покращують кровотік та знижують артеріальний тиск. Регулярне вживання може знизити ризик ішемічної хвороби серця та інсульту.</li>
                                                <li><span className="font-bold text-black">Боротьба зі стресом та покращення настрою:</span> Шоколад стимулює вироблення ендорфінів та серотоніну ("гормонів щастя"), що допомагає знизити рівень стресу та покращити настрій.</li>
                                                <li><span className="font-bold text-black">Підтримка мозку:</span> Какао покращує кровопостачання мозку, що корисно для когнітивних функцій.</li>
                                                <li><span className="font-bold text-black">Антиоксидантний захист:</span> Високий вміст антиоксидантів захищає клітини від окислювального стресу.</li>
                                                <li><span className="font-bold text-black">Контроль апетиту:</span> Невелика кількість чорного шоколаду за 15-20 хвилин до їди може знизити відчуття голоду.</li>
                                            </ul>
                                        </div>
                                    </>
                                )}

                            </div>
                        </div>
                    </div>
                )}

                {/* ================= МОДАЛКА РЕДАГУВАННЯ ПРОФІЛЮ ================= */}
                {isEditProfileModalOpen && (
                    <div
                        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-md overflow-y-auto transition-opacity duration-300 custom-scrollbar p-4 pt-24 sm:p-4 sm:pt-32 flex flex-col items-center sm:justify-center"
                        onClick={() => {
                            setIsEditProfileModalOpen(false);
                            setEditNameValue(userData.first_name || '');
                            setIsPasswordModalOpen(false);
                            setPasswordError('');
                            setPasswordData({ oldPassword: '', newPassword: '', newPasswordConfirm: '' });
                        }}
                    >
                        {/* 3. МОДАЛКА */}
                        <div
                            className="bg-white w-full max-w-[95%] sm:max-w-lg rounded-[2.5rem] shadow-2xl relative animate-scaleIn overflow-hidden my-auto shrink-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Декоративний фон (шапка) */}
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[#B9D0B2] to-[#E5D48B] opacity-40 rounded-b-[40%] z-0 pointer-events-none"></div>

                            {/* Кнопка закриття */}
                            <button
                                onClick={() => {
                                    setIsEditProfileModalOpen(false);
                                    setEditNameValue(userData.first_name || '');
                                    setIsPasswordModalOpen(false);
                                    setPasswordError('');
                                    setPasswordData({ oldPassword: '', newPassword: '', newPasswordConfirm: '' });
                                }}
                                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 rounded-full shadow-md backdrop-blur-sm transition-all z-20 cursor-pointer"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>

                            {/* Заголовок */}
                            <div className="pt-12 pb-4 text-center px-6 relative z-10">
                                <h2 className="text-3xl sm:text-4xl font-bold font-['El_Messiri'] text-gray-900 tracking-wide">
                                    Налаштування
                                </h2>
                                <p className="text-sm sm:text-base text-gray-500 font-medium mt-2">Керуйте своїми даними та безпекою.</p>
                            </div>

                            {/* Основний контент */}
                            <div className="p-6 sm:p-8 pt-2 relative z-10">
                                <div className="space-y-6">

                                    {/* БЛОК: Основні дані */}
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <label className="absolute -top-2.5 left-4 px-1 bg-white text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider group-focus-within:text-[#6A907B] transition-colors z-10">
                                                Прізвище та Ім'я
                                            </label>
                                            <input
                                                type="text"
                                                value={editNameValue}
                                                onChange={(e) => setEditNameValue(e.target.value)}
                                                maxLength={40}
                                                className="w-full bg-transparent border-2 border-gray-200 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 outline-none focus:border-[#6A907B] transition-colors font-bold text-gray-900 text-base sm:text-lg hover:border-gray-300 relative z-0"
                                            />
                                        </div>

                                        <div className="relative opacity-70">
                                            <label className="absolute -top-2.5 left-4 px-1 bg-white text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider z-10">
                                                Електронна пошта
                                            </label>
                                            <input
                                                type="email"
                                                value={userData.email}
                                                disabled
                                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 outline-none text-gray-500 font-bold cursor-not-allowed text-base sm:text-lg relative z-0"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Роздільник */}
                                    <div className="h-px bg-gray-100 w-full my-4 sm:my-6"></div>

                                    {/* БЛОК: Зміна пароля (Акордеон) */}
                                    <div className="bg-gray-50 rounded-3xl border border-gray-200 overflow-hidden transition-all duration-500">
                                        <button
                                            onClick={() => {
                                                if (isPasswordModalOpen) {
                                                    setPasswordData({ oldPassword: '', newPassword: '', newPasswordConfirm: '' });
                                                    setPasswordError('');
                                                }
                                                setIsPasswordModalOpen(!isPasswordModalOpen);
                                            }}
                                            className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${isPasswordModalOpen ? 'bg-[#974F23] text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">Безпека</h3>
                                                    <p className="text-[10px] sm:text-xs font-medium text-gray-500 mt-0.5">Змінити пароль доступу</p>
                                                </div>
                                            </div>
                                            <svg className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-400 transition-transform duration-300 ${isPasswordModalOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </button>

                                        {/* Форма пароля */}
                                        <div className={`transition-all duration-500 ease-in-out origin-top ${isPasswordModalOpen ? 'max-h-[500px] opacity-100 p-4 sm:p-5 pt-0 border-t border-gray-200' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                            {passwordError && (
                                                <div className="mb-4 mt-4 bg-red-100 border border-red-200 text-red-600 px-3 py-2 sm:px-4 sm:py-3 rounded-xl text-[11px] sm:text-sm font-semibold text-center flex items-center gap-2 leading-tight">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                    {passwordError}
                                                </div>
                                            )}

                                            <form onSubmit={(e) => {
                                                e.preventDefault();
                                                handlePasswordChange(e).then(() => {
                                                    if(passwordSuccess) {
                                                        setIsPasswordModalOpen(false);
                                                    }
                                                });
                                            }} className="space-y-3 sm:space-y-4 mt-4">
                                                <input
                                                    type="password" required placeholder="Поточний пароль"
                                                    value={passwordData.oldPassword} onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                                                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 outline-none focus:border-[#974F23] focus:ring-2 focus:ring-[#974F23]/20 transition-all font-medium text-sm sm:text-base"
                                                />
                                                <input
                                                    type="password" required placeholder="Новий пароль"
                                                    value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 outline-none focus:border-[#974F23] focus:ring-2 focus:ring-[#974F23]/20 transition-all font-medium text-sm sm:text-base"
                                                />
                                                <input
                                                    type="password" required placeholder="Підтвердіть новий пароль"
                                                    value={passwordData.newPasswordConfirm} onChange={(e) => setPasswordData({...passwordData, newPasswordConfirm: e.target.value})}
                                                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 outline-none focus:border-[#974F23] focus:ring-2 focus:ring-[#974F23]/20 transition-all font-medium text-sm sm:text-base"
                                                />
                                                <button type="submit" className="w-full bg-[#974F23] text-white py-2.5 sm:py-3 rounded-xl font-bold hover:bg-[#7a3e1a] transition-colors shadow-md active:scale-95 duration-200 cursor-pointer text-sm sm:text-base">
                                                    Оновити пароль
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Кнопка збереження */}
                            <div className="px-6 sm:px-8 pb-8 pt-2 relative z-10">
                                <button
                                    onClick={handleNameSave}
                                    className="w-full relative overflow-hidden bg-[#1A1A1A] text-white py-3.5 sm:py-4 rounded-[1.5rem] font-bold text-base sm:text-lg hover:bg-black transition-all shadow-xl active:scale-95 duration-200 group cursor-pointer"
                                >
                                    <span className="relative z-10">Зберегти зміни</span>
                                    <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= МОДАЛКА ПІДТВЕРДЖЕННЯ ВИДАЛЕННЯ АВАТАРА ================= */}
                {isDeleteAvatarModalOpen && (
                    <div
                        className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300"
                        onClick={() => setIsDeleteAvatarModalOpen(false)}
                    >
                        <div
                            className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 flex flex-col items-center text-center relative animate-scaleIn"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Іконка попередження */}
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner text-red-500">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </div>

                            <h3 className="text-2xl font-bold font-['El_Messiri'] text-gray-900 mb-2">
                                Видалити фото?
                            </h3>
                            <p className="text-gray-500 font-medium mb-8">
                                Ваш аватар буде видалено без можливості відновлення.
                            </p>

                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={() => setIsDeleteAvatarModalOpen(false)}
                                    className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    Скасувати
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            // Використовуємо PATCH і передаємо avatar: null
                                            // Це стандартний спосіб очищення полів у Django REST
                                            const res = await api.patch('/api/auth/user/', { avatar: null });

                                            // Щоб React оновив картинку, додаємо унікальний час
                                            const updatedUser = { ...res.data };
                                            updatedUser.avatar = null; // Примусово ставимо null

                                            setUserData(updatedUser);
                                            dispatchUserUpdate(updatedUser);
                                            setIsDeleteAvatarModalOpen(false);
                                            showToast("✅ Фото профілю видалено");
                                        } catch (err) {
                                            console.error("Помилка видалення:", err);
                                            showToast("❌ Помилка видалення фото");
                                        }
                                    }}
                                    className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-bold hover:bg-red-600 transition-colors cursor-pointer shadow-md"
                                >
                                    Видалити
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= МОДАЛКА КУХНІ (Виїжджає зверху) ================= */}
                {isCuisineModalOpen && (
                    <div
                        className="fixed inset-0 z-[9999] flex flex-col justify-start items-center p-4 pt-24 sm:p-4 sm:pt-24 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setIsCuisineModalOpen(false)}
                    >
                        <div
                            // Анімація виїзду зверху (slideDown)
                            className="bg-[#F6F3F4] w-full sm:max-w-4xl max-h-[85vh] flex flex-col rounded-3xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-[slideDown_0.4s_ease-out] sm:animate-scaleIn"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-5 sm:p-8 border-b border-gray-200 bg-white flex justify-between items-start sm:items-center z-10 shrink-0">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold font-['El_Messiri'] text-gray-900 leading-tight">
                                            Улюблені кухні
                                        </h2>
                                        {safeCuisines.length > 0 && (
                                            <button onClick={clearAllCuisines} className="hidden sm:flex text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95">
                                                Видалити всі
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-gray-500 font-medium font-['Inter'] text-sm sm:text-base">
                                        Оберіть одну або кілька кухонь, щоб ми пропонували відповідні рецепти.
                                    </p>
                                    {safeCuisines.length > 0 && (
                                        <button onClick={clearAllCuisines} className="sm:hidden mt-3 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95 inline-block">
                                            Видалити всі ({safeCuisines.length})
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsCuisineModalOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-red-500 rounded-full transition-all cursor-pointer shrink-0 ml-4"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>

                            <div className="overflow-y-auto custom-scrollbar p-5 sm:p-8 flex-1">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                                    {Object.keys(DICTIONARIES.cuisine).map(cuisineKey => {
                                        const isSelected = safeCuisines.includes(cuisineKey);
                                        return (
                                            <div
                                                key={cuisineKey}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        removeCuisine(cuisineKey);
                                                    } else {
                                                        api.patch('/api/auth/user/', {
                                                            favorite_cuisines: [...safeCuisines, cuisineKey]
                                                        }).then(res => {
                                                            setUserData(res.data);
                                                            dispatchUserUpdate(res.data);
                                                        });
                                                    }
                                                }}
                                                className={`relative flex flex-col group cursor-pointer rounded-2xl overflow-hidden shadow-sm transition-all duration-200 border-2 ${
                                                    isSelected 
                                                        ? 'border-[#6A907B] shadow-md scale-95 bg-[#F0F5ED]' 
                                                        : 'border-transparent hover:border-gray-200 hover:shadow-md bg-white'
                                                }`}
                                            >
                                                {/* Адаптований блок для іконок */}
                                                <div className={`h-20 sm:h-24 w-full relative flex items-center justify-center p-4 transition-colors ${isSelected ? 'bg-[#E3ECD9]' : 'bg-gray-50 group-hover:bg-gray-100'}`}>
                                                    <img
                                                        src={CUISINE_IMAGES[cuisineKey]}
                                                        alt={DICTIONARIES.cuisine[cuisineKey]}
                                                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-sm"
                                                    />

                                                    {/* Галочка, якщо вибрано */}
                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2 w-5 h-5 bg-[#6A907B] rounded-full flex items-center justify-center text-white shadow-sm z-10">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Назва кухні */}
                                                <div className="p-2 sm:p-3 text-center flex-grow flex items-center justify-center">
                                                    <span className={`font-semibold font-['Inter'] text-xs sm:text-sm ${isSelected ? 'text-[#42705D]' : 'text-gray-800'}`}>
                                                        {DICTIONARIES.cuisine[cuisineKey]}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= МОДАЛКА АЛЕРГІЙ ================= */}
                {isAllergyModalOpen && (
                    <div
                        className="fixed inset-0 z-[9999] flex flex-col justify-start items-center p-4 pt-24 sm:p-4 sm:pt-32 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setIsAllergyModalOpen(false)}
                    >
                        <div
                            className="bg-[#F6F3F4] w-full sm:max-w-3xl max-h-[85vh] flex flex-col rounded-3xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-[slideDown_0.4s_ease-out] sm:animate-scaleIn shrink-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Шапка модалки */}
                            <div className="p-5 sm:p-8 pb-4 border-b border-gray-200 bg-white z-10 shrink-0">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-1">
                                            <h2 className="text-2xl sm:text-3xl font-bold font-['El_Messiri'] text-gray-900 leading-tight">
                                                Алергії
                                            </h2>
                                            {safeAllergies.length > 0 && (
                                                <button onClick={clearAllAllergies} className="hidden sm:flex text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95">
                                                    Видалити всі
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-gray-500 font-medium font-['Inter'] text-sm sm:text-base">
                                            Вкажіть інгредієнти, які ви не вживаєте. Ми виключимо їх з ваших рекомендацій
                                        </p>
                                        {safeAllergies.length > 0 && (
                                            <button onClick={clearAllAllergies} className="sm:hidden mt-3 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95 inline-block">
                                                Видалити всі ({safeAllergies.length})
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setIsAllergyModalOpen(false)}
                                        className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-red-500 rounded-full transition-all cursor-pointer shrink-0 ml-4"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>

                                {/* Поле пошуку */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Почніть вводити назву інгредієнта..."
                                        value={allergySearch}
                                        onChange={(e) => setAllergySearch(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3 sm:py-4 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all text-gray-800 font-medium"
                                        autoFocus
                                    />
                                </div>

                                {/* Вибрані алергії (Хмарка тегів з картинками) */}
                                {safeAllergies.length > 0 && (
                                    <div className="mt-5 pt-5 border-t border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ви вже обрали:</p>
                                        <div className="flex flex-wrap gap-2.5">
                                            {safeAllergies.map(id => {
                                                const ing = getIngredientData(id);
                                                return (
                                                    <div key={id} className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full pl-1.5 pr-2 py-1.5 shadow-sm group">

                                                        {/* Міні-картинка для тегу */}
                                                        <div className="w-7 h-7 rounded-full bg-white overflow-hidden border border-red-100 shrink-0 flex items-center justify-center">
                                                            {ing?.image ? (
                                                                <img src={getImageUrl(ing.image)} alt={ing.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <svg className="w-3.5 h-3.5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                            )}
                                                        </div>

                                                        <span className="font-medium text-red-900 text-sm">{ing ? ing.name : '...'}</span>

                                                        <button
                                                            onClick={() => removeAllergy(id)}
                                                            className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors ml-1 cursor-pointer active:scale-90"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Результати пошуку (Нижня частина, що скролиться) */}
                            <div className="overflow-y-auto custom-scrollbar bg-white flex-1 p-2 sm:p-4">
                                {allergySearch.trim() === '' ? (
                                    // Красиво стилізований порожній стан
                                    <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 rounded-2xl m-2 border border-gray-100 border-dashed">
                                        <div className="w-20 h-20 mb-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                                            <svg className="w-10 h-10 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-1 font-['El_Messiri']">Пошук інгредієнтів</h3>
                                        <p className="font-medium text-gray-500 text-sm max-w-xs font-['Inter']">Введіть назву продукту у поле вище, щоб знайти та додати його до списку обмежень.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {availableAllergies
                                            .filter(i => i.name.toLowerCase().includes(allergySearch.toLowerCase()) && !safeAllergies.includes(i.id))
                                            .slice(0, 50)
                                            .map(ing => (
                                                <div
                                                    key={ing.id}
                                                    onClick={() => {
                                                        addAllergyById(ing.id);
                                                        setAllergySearch('');
                                                    }}
                                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100 cursor-pointer transition-colors group"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                                        {ing.image ? (
                                                            <img src={getImageUrl(ing.image)} alt={ing.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <span className="font-semibold text-gray-800 group-hover:text-red-700 flex-1">{ing.name}</span>

                                                    <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-red-200 flex items-center justify-center text-gray-400 group-hover:text-red-600 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                        {availableAllergies.filter(i => i.name.toLowerCase().includes(allergySearch.toLowerCase()) && !safeAllergies.includes(i.id)).length === 0 && (
                                            <div className="col-span-full p-12 text-center flex flex-col items-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                </div>
                                                <p className="text-gray-500 font-medium font-['Inter'] text-sm">Інгредієнт не знайдено.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= МОДАЛКА ДІЄТ ТА ОБМЕЖЕНЬ ================= */}
                {isDietModalOpen && (
                    <div
                        className="fixed inset-0 z-[9999] flex flex-col justify-start items-center p-4 pt-24 sm:p-4 sm:pt-32 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setIsDietModalOpen(false)}
                    >
                        <div
                            className="bg-[#F6F3F4] w-full sm:max-w-4xl max-h-[85vh] flex flex-col rounded-3xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-[slideDown_0.4s_ease-out] sm:animate-scaleIn"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-5 sm:p-8 border-b border-gray-200 bg-white flex justify-between items-start sm:items-center z-10 shrink-0">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold font-['El_Messiri'] text-gray-900 leading-tight">
                                            Харчові обмеження
                                        </h2>
                                        {safeDiets.length > 0 && (
                                            <button onClick={clearAllDiets} className="hidden sm:flex text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95">
                                                Видалити всі
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-gray-500 font-medium font-['Inter'] text-sm sm:text-base">
                                        Оберіть свій тип харчування або дієту для точніших рекомендацій.
                                    </p>
                                    {safeDiets.length > 0 && (
                                        <button onClick={clearAllDiets} className="sm:hidden mt-3 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95 inline-block">
                                            Видалити всі ({safeDiets.length})
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsDietModalOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-red-500 rounded-full transition-all cursor-pointer shrink-0 ml-4"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>

                            <div className="overflow-y-auto custom-scrollbar p-5 sm:p-8 flex-1">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                                    {Object.keys(DICTIONARIES.profile_dietary_tags).map(dietKey => {
                                        const isSelected = safeDiets.includes(dietKey);
                                        return (
                                            <div
                                                key={dietKey}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        removeDiet(dietKey);
                                                    } else {
                                                        // Викликаємо ваш API для додавання дієти
                                                        api.patch('/api/auth/user/', {
                                                            dietary_preferences: [...safeDiets, dietKey]
                                                        }).then(res => {
                                                            setUserData(res.data);
                                                            dispatchUserUpdate(res.data);
                                                        });
                                                    }
                                                }}
                                                className={`relative flex flex-col group cursor-pointer rounded-2xl overflow-hidden shadow-sm transition-all duration-200 border-2 ${
                                                    isSelected 
                                                        ? 'border-blue-400 shadow-md scale-95 bg-blue-50' 
                                                        : 'border-transparent hover:border-gray-200 hover:shadow-md bg-white'
                                                }`}
                                            >
                                                {/* Блок для іконок */}
                                                <div className={`h-20 sm:h-24 w-full relative flex items-center justify-center p-4 transition-colors ${isSelected ? 'bg-blue-100' : 'bg-gray-50 group-hover:bg-gray-100'}`}>
                                                    <img
                                                        src={DIET_IMAGES[dietKey]}
                                                        alt={DICTIONARIES.profile_dietary_tags[dietKey]}
                                                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-sm"
                                                    />

                                                    {/* Галочка, якщо вибрано (використовуємо синій колір для дієт) */}
                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-sm z-10">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Назва дієти */}
                                                <div className="p-2 sm:p-3 text-center flex-grow flex items-center justify-center">
                                                    <span className={`font-semibold font-['Inter'] text-xs sm:text-sm ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                                                        {DICTIONARIES.profile_dietary_tags[dietKey]}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= МОДАЛКА МОЇ ПРОДУКТИ (ІНВЕНТАР) ================= */}
                {isInventoryModalOpen && (
                    <div
                        className="fixed inset-0 z-[9999] flex flex-col justify-start items-center p-4 pt-24 sm:p-4 sm:pt-32 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => {
                            setIsInventoryModalOpen(false)
                            resetInventoryForm(); // АВТООЧИЩЕННЯ ПРИ ЗАКРИТТІ
                        }}
                    >
                        <div
                            className="bg-[#F6F3F4] w-full sm:max-w-4xl max-h-[85vh] flex flex-col rounded-3xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-[slideDown_0.4s_ease-out] sm:animate-scaleIn shrink-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Шапка модалки */}
                            <div className="p-4 sm:p-8 pb-4 border-b border-gray-200 bg-white z-20 shrink-0 relative">
                                <div className="flex justify-between items-start sm:items-center mb-4 sm:mb-6">
                                    <div className="flex items-start sm:items-center gap-3 flex-1">
                                        <div className="w-12 h-12 bg-cyan-50 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                                            <img src={fridgeIcon} alt="Холодильник" className="w-8 h-8 object-contain" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-1">
                                                <h2 className="text-2xl sm:text-3xl font-bold font-['El_Messiri'] text-gray-900 leading-tight">
                                                    Мої продукти
                                                </h2>
                                                {safeInventory.length > 0 && (
                                                    <button onClick={clearAllInventory} className="hidden sm:flex text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95">
                                                        Видалити всі
                                                    </button>
                                                )}
                                            </div>
                                            <p className="hidden sm:block text-gray-500 font-medium font-['Inter'] text-sm sm:text-base">
                                                Додайте ваші запаси для ідеального підбору рецептів та оптимізації списку покупок.
                                            </p>
                                            {safeInventory.length > 0 && (
                                                <button onClick={clearAllInventory} className="sm:hidden mt-1 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95 inline-block">
                                                    Видалити всі ({safeInventory.length})
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsInventoryModalOpen(false);
                                            resetInventoryForm();
                                        }}
                                        className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-500 rounded-full transition-all cursor-pointer shrink-0 ml-2"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>

                                {/* БЛОК ДОДАВАННЯ ПРОДУКТУ */}
                                <div ref={addFridgeWrapperRef} className="flex flex-col gap-3 w-full relative z-30 mb-2">
                                    {/* Контейнер полів: на мобільному вони будуть один під одним, на ПК - в один рядок */}
                                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 bg-gray-50 border border-gray-200 p-2 md:pl-4 rounded-2xl w-full focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-100 transition-all relative">

                                        {/* 1. Пошук */}
                                        <div className="flex items-center gap-2 w-full md:flex-1 relative">
                                            <svg className="w-5 h-5 text-gray-400 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                            <input
                                                type="text"
                                                placeholder="Введіть назву продукту..."
                                                value={fridgeSearch}
                                                onChange={(e) => {
                                                    setFridgeSearch(e.target.value);
                                                    setIsFridgeDropdownOpen(true);
                                                    setNewFridgeItem({...newFridgeItem, ingredient: ''});
                                                }}
                                                onFocus={() => setIsFridgeDropdownOpen(true)}
                                                className="w-full bg-transparent outline-none text-gray-800 font-medium py-2 px-2 sm:px-0 pr-8" // Додано pr-8 для місця під кнопку
                                            />

                                            {/* Кнопка Очищення (Хрестик) */}
                                            {fridgeSearch && (
                                                <button
                                                    onClick={() => {
                                                        setFridgeSearch('');
                                                        setNewFridgeItem({ ingredient: '', amount: '', unit: 'g' });
                                                        setIsFridgeDropdownOpen(false);
                                                        // Якщо користувач очищає під час редагування існуючого продукту,
                                                        // можливо, варто і вийти з режиму редагування:
                                                        if (editingInventoryId) {
                                                             resetInventoryForm();
                                                        }
                                                    }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer active:scale-95"
                                                    title="Очистити поле"
                                                >
                                                    <svg className="w-4 h-4 hover:text-red-500 transition-colors cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                </button>
                                            )}
                                        </div>

                                        {/* Роздільник (тільки для десктопів) */}
                                        <div className="hidden md:block h-8 w-px bg-gray-300 mx-2"></div>

                                        {/* 2. Кількість та Одиниці виміру */}
                                        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 border-t border-gray-200 md:border-t-0 pt-2 md:pt-0">
                                            <input
                                                type="number"
                                                min="0" // Запобігає введенню від'ємних чисел через стрілочки
                                                step="any" // Дозволяє вводити десяткові числа (наприклад, 0.5)
                                                placeholder="К-ть"
                                                value={newFridgeItem.amount}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    // Регулярний вираз: дозволяє тільки цифри та ОДНУ крапку/кому. Забороняє мінус.
                                                    if (val === '' || /^[0-9]*[.,]?[0-9]*$/.test(val)) {
                                                        // Замінюємо кому на крапку для коректної відправки на бекенд
                                                        setNewFridgeItem({...newFridgeItem, amount: val.replace(',', '.')});
                                                    }
                                                }}
                                                className="w-1/2 md:w-24 bg-transparent outline-none text-gray-800 font-bold text-center py-2 border-b-2 border-gray-300 md:border-transparent focus:border-cyan-400 transition-colors placeholder:font-normal"
                                            />

                                            {/* РОЗУМНИЙ ВИБІР ОДИНИЦЬ */}
                                            <select
                                                value={newFridgeItem.unit}
                                                onChange={(e) => setNewFridgeItem({...newFridgeItem, unit: e.target.value})}
                                                className="w-1/2 md:w-28 bg-transparent outline-none text-gray-800 font-semibold py-2 cursor-pointer border-b-2 border-gray-300 md:border-transparent focus:border-cyan-400"
                                            >
                                                {(() => {
                                                    const selectedIng = availableFridgeIngredients.find(i => i.id === newFridgeItem.ingredient);
                                                    let allowedUnits = ['g'];
                                                    if (selectedIng) {
                                                        if (EXACT_UNIT_MATCH[selectedIng.name]) {
                                                            allowedUnits = EXACT_UNIT_MATCH[selectedIng.name];
                                                        } else {
                                                            allowedUnits = CATEGORY_UNIT_MAP[selectedIng.category] || ['g'];
                                                        }
                                                    } else {
                                                        allowedUnits = Object.keys(DICTIONARIES.units);
                                                    }

                                                    return allowedUnits.map(key => (
                                                        <option key={key} value={key}>
                                                            {Array.isArray(DICTIONARIES.units[key]) ? DICTIONARIES.units[key][0] : DICTIONARIES.units[key]}
                                                        </option>
                                                    ));
                                                })()}
                                            </select>
                                        </div>

                                        {/* Dropdown результатів пошуку */}
                                        {isFridgeDropdownOpen && fridgeSearch && (
                                            <ul className="absolute top-[105%] left-0 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-48 sm:max-h-60 overflow-y-auto py-2 z-50">
                                                {availableFridgeIngredients
                                                    .filter(i => i.name.toLowerCase().includes(fridgeSearch.toLowerCase()))
                                                    .slice(0, 20)
                                                    .map(ing => (
                                                        <li
                                                            key={ing.id}
                                                            onClick={() => {
                                                                setFridgeSearch(ing.name);
                                                                setIsFridgeDropdownOpen(false);
                                                                setNewFridgeItem({
                                                                    ingredient: ing.id,
                                                                    amount: '',
                                                                    unit: getDefaultUnit(ing)
                                                                });
                                                            }}
                                                            className="flex items-center gap-3 px-4 py-3 hover:bg-cyan-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                                                                {ing.image ? <img src={getImageUrl(ing.image)} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">•</div>}
                                                            </div>
                                                            <span className="font-semibold text-gray-800">{ing.name}</span>
                                                        </li>
                                                ))}
                                                {availableFridgeIngredients.filter(i => i.name.toLowerCase().includes(fridgeSearch.toLowerCase())).length === 0 && (
                                                    <li className="px-4 py-3 text-gray-500 text-sm text-center">Інгредієнт не знайдено</li>
                                                )}
                                            </ul>
                                        )}
                                    </div>

                                    {/* === ФЕЄРИЧНЕ ПОВІДОМЛЕННЯ (ПОМИЛКА АБО УСПІХ) === */}
                                    {inventoryMessage && (
                                        <div className={`w-full p-3 rounded-2xl flex items-start gap-3 animate-fadeIn border ${
                                            inventoryMessage.type === 'error' 
                                                ? 'bg-red-50 border-red-200 text-red-700' 
                                                : 'bg-teal-50 border-teal-200 text-teal-800'
                                        }`}>
                                            {inventoryMessage.type === 'error' ? (
                                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                                                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                                </div>
                                            )}
                                            <p className="font-medium text-[14px] leading-snug pt-1">
                                                {inventoryMessage.text}
                                            </p>
                                        </div>
                                    )}

                                    {/* Кнопки Зберегти / Скасувати */}
                                    <div className="flex justify-center gap-2 w-full">
                                        <button
                                            onClick={addFridgeItem}
                                            disabled={!newFridgeItem.ingredient || (!newFridgeItem.amount && newFridgeItem.unit !== 'taste')}
                                            className={`flex-1 md:flex-none md:w-88 py-3 rounded-2xl text-[15px] font-bold text-gray-900 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 ${editingInventoryId ? 'bg-[#E5D48B] hover:bg-[#D4C37A]' : 'bg-[#CCFBF1] hover:bg-[#a6f7e9]'}`}
                                        >
                                            {editingInventoryId ? 'Оновити' : 'Додати'}
                                        </button>

                                        {editingInventoryId && (
                                            <button
                                                onClick={resetInventoryForm}
                                                className="flex-1 md:flex-none md:w-32 py-3 bg-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-300 transition-all cursor-pointer active:scale-95"
                                            >
                                                Скасувати
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* СПИСОК ДОДАНИХ ПРОДУКТІВ (Скролиться) */}
                            <div className="overflow-y-auto custom-scrollbar bg-gray-50 flex-1 p-4 sm:p-6 relative z-0">
                                {safeInventory.length === 0 ? (
                                    <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-gray-100 border-dashed m-2">
                                        <img src={fridgeIcon} alt="Порожньо" className="w-16 h-16 opacity-20 mb-4 grayscale" />
                                        <h3 className="text-lg font-bold text-gray-800 mb-1 font-['El_Messiri']">У вас немає продуктів!</h3>
                                        <p className="font-medium text-gray-500 text-sm max-w-xs font-['Inter']">Вкажіть наявні продукти, а ми підлаштуємо ваш список покупок.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                        {safeInventory.map(item => (
                                            <div key={item.id} className={`flex items-center gap-4 bg-white border rounded-2xl p-3 shadow-sm transition-all group ${editingInventoryId === item.id ? 'border-cyan-400 ring-2 ring-cyan-50 scale-[1.02]' : 'border-gray-200 hover:border-cyan-200'}`}>
                                                {/* Фото продукту */}
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                                                    {item.ingredient_image ? (
                                                        <img src={getImageUrl(item.ingredient_image)} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
                                                    )}
                                                </div>

                                                {/* Назва та кількість */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-900 text-[14px] sm:text-base truncate" title={item.ingredient_name}>{item.ingredient_name}</h4>
                                                    <span className="inline-block mt-1 text-cyan-800 font-bold text-xs sm:text-sm bg-cyan-100/50 px-2 py-0.5 rounded-lg border border-cyan-100/50">
                                                        {item.amount ? `${parseFloat(item.amount)} ` : ''}
                                                        {DICTIONARIES.units[item.unit] ? (Array.isArray(DICTIONARIES.units[item.unit]) ? DICTIONARIES.units[item.unit][0] : DICTIONARIES.units[item.unit]) : item.unit}
                                                    </span>
                                                </div>

                                                {/* Кнопки керування (Редагувати / Видалити) */}
                                                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                                    {/* Кнопка Редагувати */}
                                                    <button
                                                        onClick={() => {
                                                            setEditingInventoryId(item.id);
                                                            setFridgeSearch(item.ingredient_name);
                                                            setNewFridgeItem({ ingredient: item.ingredient, amount: item.amount, unit: item.unit });

                                                            // Плавний скрол на мобільних пристроях до поля вводу
                                                            if (addFridgeWrapperRef.current) {
                                                                addFridgeWrapperRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
                                                            }
                                                        }}
                                                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer active:scale-90 ${editingInventoryId === item.id ? 'bg-[#E5D48B] text-gray-900' : 'bg-gray-50 text-gray-400 hover:bg-yellow-100 hover:text-yellow-700'}`}
                                                        title="Редагувати кількість"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                    </button>

                                                    {/* Кнопка Видалити */}
                                                    <button
                                                        onClick={() => removeFridgeItem(item.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer active:scale-90"
                                                        title="Видалити продукт"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Profile;