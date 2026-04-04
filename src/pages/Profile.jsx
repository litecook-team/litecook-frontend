import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ENDPOINTS, API_URL } from '../constants/api';
import { DICTIONARIES } from '../constants/translations';

import defaultAvatar from '../assets/global/avokado_avatar.png';

const Profile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Refs для скролінгу до секцій
    const cuisinesRef = useRef(null);
    const allergiesRef = useRef(null);
    const dietsRef = useRef(null);

    // Основні дані
    const [userData, setUserData] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState(null);

    // Стани для форми редагування
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');

    // Стани для відкриття полів додавання
    const [showAddAllergy, setShowAddAllergy] = useState(false);
    const [showAddDiet, setShowAddDiet] = useState(false);
    const [showAddCuisine, setShowAddCuisine] = useState(false);
    const [isFridgeOpen, setIsFridgeOpen] = useState(false); // Відкриття холодильника як блоку

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
    // Стан для пошуку в холодильнику
    const [fridgeSearch, setFridgeSearch] = useState('');
    // Стан для керування видимістю випадаючого списку
    const [isFridgeDropdownOpen, setIsFridgeDropdownOpen] = useState(false);

    const addAllergyWrapperRef = useRef(null);
    const addDietWrapperRef = useRef(null);
    const addCuisineWrapperRef = useRef(null);
    // Ref для закриття списку пошуку холодильника
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

    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

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

    const handleNavClick = (ref) => {
        clearAllUnsavedInputs(); // Очищаємо перед переходом
        if (isFridgeOpen) {
            setIsFridgeOpen(false); // Ховаємо холодильник
            // Даємо React мілісекунду на рендер блоків перед тим, як до них скролити
            setTimeout(() => {
                ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } else {
            ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const toggleFridge = () => {
        clearAllUnsavedInputs(); // Очищаємо перед переходом
        setIsFridgeOpen(!isFridgeOpen);
    };

    // Сповіщаємо Хедер про оновлення профілю
    const dispatchUserUpdate = (updatedData) => {
        window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: updatedData }));
    };

    // ================= ОБРОБНИКИ ДЛЯ ПРОФІЛЮ =================

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await api.patch('/api/auth/user/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Додаємо унікальний час до URL, щоб скинути кеш браузера
            const updatedUser = { ...res.data };
            if (updatedUser.avatar) {
                // Якщо в URL вже є знак питання, використовуємо &, інакше ?
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
            setIsEditingName(false);
            showToast("✅ Ім'я оновлено!");
        } catch (err) {
            showToast("❌ Помилка оновлення імені");
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

    // ================= ХОЛОДИЛЬНИК (ІНВЕНТАР) =================
    const safeInventory = userData?.inventory || [];
    const inventoryUrl = ENDPOINTS?.INVENTORY || '/api/inventory/';

    // Функція вміє і створювати (POST), і оновлювати (PATCH)
    const addFridgeItem = async () => {
        if (!newFridgeItem.ingredient) {
            showToast("❌ Спочатку оберіть продукт зі списку!");
            return;
        }

        try {
            if (editingInventoryId) {
                // РЕЖИМ ОНОВЛЕННЯ (Продукт вже був у холодильнику)
                const res = await api.patch(`${inventoryUrl}${editingInventoryId}/`, {
                    amount: newFridgeItem.amount ? parseFloat(newFridgeItem.amount) : null,
                    unit: newFridgeItem.unit
                });

                // Оновлюємо список локально
                const updatedInventory = safeInventory.map(item =>
                    item.id === editingInventoryId ? res.data : item
                );
                setUserData({ ...userData, inventory: updatedInventory });
                showToast(`✅ Кількість продукту оновлено!`);
            } else {
                // РЕЖИМ СТВОРЕННЯ (Новий продукт)
                const res = await api.post(inventoryUrl, {
                    ingredient: parseInt(newFridgeItem.ingredient),
                    amount: newFridgeItem.amount ? parseFloat(newFridgeItem.amount) : null,
                    unit: newFridgeItem.unit
                });
                setUserData({ ...userData, inventory: [res.data, ...safeInventory] });
                showToast(`🍲 Продукт додано до холодильника!`);
            }

            // Очищаємо всі поля і виходимо з режиму редагування
            setNewFridgeItem({ ingredient: '', amount: '', unit: 'g' });
            setFridgeSearch('');
            setEditingInventoryId(null);

        } catch (err) {
            showToast("❌ Помилка збереження продукту");
        }
    };

    // Вибір продукту без миттєвого збереження + перевірка на існування
    const handleSelectFridgeIngredient = (ing) => {
        setFridgeSearch(ing.name);
        setIsFridgeDropdownOpen(false);

        // Перевіряємо, чи є вже такий продукт у холодильнику
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

    const removeFridgeItem = async (inventoryId) => {
        try {
            await api.delete(`${inventoryUrl}${inventoryId}/`);
            setUserData({ ...userData, inventory: safeInventory.filter(item => item.id !== inventoryId) });
        } catch (err) {
            showToast("❌ Помилка видалення продукту");
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

            // Закриваємо випадаючий список пошуку холодильника, якщо клікнули повз
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

            // ЗМІНЕНО: Одразу закриваємо вікно і показуємо красиве сповіщення
            setIsPasswordModalOpen(false);
            setPasswordData({ oldPassword: '', newPassword: '', newPasswordConfirm: '' });
            setPasswordSuccess(true);

            // ЗМІНЕНО: Повідомлення зникне рівно через 2 секунди (2000 мс)
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
                backgroundImage: "url('/src/assets/profile/profile-bg.jpg')",
                backgroundColor: "#F6F3F4",
                // Якщо нове зображення вже обрізане дизайнерами як треба, можливо вам більше не потрібне "center top -150px".
                // Якщо воно з'їхало - змініть на просто "center top"
                backgroundPosition: "center top -150px"
            }}
        >
            {/* ЗМІНЕНО: Прибрано backdrop-blur-[2px], тепер фото буде ідеально чітким. bg-white/60 робить фон світлішим, щоб текст легко читався */}
            <div className="absolute inset-0 w-full h-full z-0"></div>

            {toastMessage && (
                <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 transition-all font-medium flex items-center gap-2">
                    {toastMessage}
                </div>
            )}

            {/* ЗМІНЕНО: Повідомлення про пароль тепер просто спливає по центру без білого фону на весь екран */}
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
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-14 mb-14 lg:pl-16 xl:pl-24">

                    {/* Аватар (Дизайн за шаблоном) */}
                    <div className="relative group shrink-0">
                        <div className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-[340px] lg:h-[340px] xl:w-[420px] xl:h-[420px] rounded-full overflow-hidden shadow-sm bg-[#C4D5BD] relative flex items-center justify-center">

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
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="absolute w-[100%] h-[100%] bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                            >
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                    </div>

                    {/* Текстова інформація */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:mt-20">

                        <div className="w-full flex justify-center md:justify-start pt-4 sm:pt-10 lg:pt-32 xl:pt-45 mb-4 md:mb-8">
                            {isEditingName ? (
                                <input
                                    type="text"
                                    value={editNameValue}
                                    onChange={(e) => setEditNameValue(e.target.value)}
                                    className="w-full max-w-md bg-white/90 border border-gray-400 rounded-full px-6 py-3 outline-none font-['El_Messiri'] text-2xl md:text-3xl font-bold text-gray-900 text-center md:text-left shadow-sm"
                                    autoFocus
                                />
                            ) : (
                                <h1 className="text-4xl md:text-[46px] lg:text-[54px] font-['El_Messiri'] font-medium text-[#1A1A1A] tracking-wide">
                                    {userData.first_name || 'Ваше Ім\'я'}
                               </h1>
                            )}
                        </div>

                        <div className="flex flex-col xl:flex-row items-center gap-4 sm:gap-6 w-full xl:w-auto">

                            {/* Email */}
                            <div className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5 md:px-12 md:py-3 bg-transparent border border-gray-800 rounded-full text-gray-900 font-['Inter'] font-medium text-[15px] md:text-[18px] shrink-0">
                                {userData.email}
                            </div>

                            {/* Кнопки керування */}
                            {isEditingName ? (
                                <div className="flex flex-wrap justify-center xl:justify-start gap-3 w-full xl:w-auto">
                                    <button
                                        onClick={handleNameSave}
                                        className="px-6 py-2.5 md:px-8 md:py-3 bg-[#C4D5BD] text-gray-900 rounded-full font-['Inter'] font-bold text-[15px] md:text-[18px] hover:bg-[#B3C6AC] transition-colors shadow-sm"
                                    >
                                        Зберегти
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditingName(false);
                                            setEditNameValue(userData.first_name || '');
                                        }}
                                        className="px-6 py-2.5 md:px-8 md:py-3 bg-white border border-gray-400 text-gray-800 rounded-full font-['Inter'] font-bold text-[15px] md:text-[18px] hover:bg-gray-100 transition-colors shadow-sm"
                                    >
                                        Скасувати
                                    </button>
                                    {/* Кнопка зміни пароля */}
                                    <button
                                        onClick={() => {
                                            setIsPasswordModalOpen(true);
                                            setPasswordError(''); // Очищаємо помилки при відкритті
                                        }}
                                        className="flex items-center gap-2 px-6 py-2.5 md:px-8 md:py-3 bg-transparent border-2 border-[#974F23] text-[#974F23] rounded-full font-['Inter'] font-bold text-[15px] md:text-[18px] hover:bg-[#974F23] hover:text-white transition-colors shadow-sm"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                                        Пароль
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditingName(true)}
                                    className="w-full sm:w-auto px-6 py-2.5 md:px-12 md:py-3 bg-[#C4D5BD] text-[#974F23] rounded-full font-['Inter'] font-medium text-[15px] md:text-[18px] hover:bg-[#B3C6AC] transition-colors whitespace-nowrap shrink-0"
                                >
                                    Редагувати профіль
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ================= СМУГА СТАТИСТИКИ ТА НАВІГАЦІЇ ================= */}
                <div className="border-t-2 border-gray-800 pt-6 pb-4 mb-10 flex flex-wrap justify-center lg:justify-between px-4 lg:px-12 gap-4 sm:gap-6 lg:gap-8">

                    <div className="flex items-center gap-2 sm:gap-3 cursor-default">
                        <svg className="w-6 h-6 md:w-8 md:h-8 text-red-100 fill-red-500" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        <span className="font-['Inter'] font-semibold text-[#1A1A1A] text-[15px] sm:text-base md:text-[20px] lg:text-[22px]">
                            {userData.favorites_count} {getFavoritesWord(userData.favorites_count)}
                        </span>
                    </div>

                    <button onClick={() => handleNavClick(cuisinesRef)} className="flex items-center gap-2 sm:gap-3 hover:text-[#42705D] transition-colors group">
                        {/* Іконка кухні (сіра каструля) */}
                        <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-500 group-hover:text-[#42705D] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/><line x1="2" y1="8" x2="22" y2="8"/><path d="M12 2v2"/><path d="M8 2v2"/><path d="M16 2v2"/></svg>
                        <span className="font-['Inter'] font-semibold text-[#1A1A1A] text-[15px] sm:text-base md:text-[20px] lg:text-[22px]">Кухня</span>
                    </button>

                    <button onClick={() => handleNavClick(allergiesRef)} className="flex items-center gap-2 sm:gap-3 hover:text-[#42705D] transition-colors group">
                        {/* Іконка алергії (червоний мінус) */}
                        <svg className="w-6 h-6 md:w-8 md:h-8 text-red-500 fill-red-500" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12" stroke="white" strokeWidth="3" strokeLinecap="round"></line></svg>
                        <span className="font-['Inter'] font-semibold text-[#1A1A1A] text-[15px] sm:text-base md:text-[20px] lg:text-[22px]">Алергії</span>
                    </button>

                    <button onClick={() => handleNavClick(dietsRef)} className="flex items-center gap-2 sm:gap-3 hover:text-[#42705D] transition-colors group">
                        {/* ЗМІНЕНО: Іконка обмежень (щит з галочкою - безпека) */}
                        <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-500 group-hover:text-[#42705D] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>
                        <span className="font-['Inter'] font-semibold text-[#1A1A1A] text-[15px] sm:text-base md:text-[20px] lg:text-[22px]">Харчові обмеження</span>
                    </button>

                    <button
                        onClick={toggleFridge}
                        className="flex items-center gap-2 sm:gap-3 transition-colors hover:text-[#42705D] group"
                    >
                        {/* ЗМІНЕНО: Сучасна іконка холодильника */}
                        <svg className="w-6 h-6 md:w-8 md:h-8 text-cyan-600 group-hover:text-[#42705D] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="4" y1="9" x2="20" y2="9"></line><line x1="9" y1="14" x2="9" y2="17"></line><line x1="9" y1="5" x2="9" y2="6"></line></svg>
                        <span className="font-['Inter'] font-semibold text-[#1A1A1A] text-[15px] sm:text-base md:text-[20px] lg:text-[22px]">Мої продукти</span>
                    </button>

                </div>

                {/* ================= ВЗАЄМОВИКЛЮЧНІ БЛОКИ ================= */}
                {isFridgeOpen ? (
                    <div className="transition-all lg:pl-16 xl:pl-24 space-y-6">

                        {/* Сучасна панель пошуку і додавання продукту */}
                        <div ref={addFridgeWrapperRef} className="relative z-20 flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full max-w-4xl">

                            {/* Блок з полями вводу */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/90 p-3 sm:p-2 sm:pl-5 rounded-3xl sm:rounded-full border border-gray-400 shadow-sm transition-all focus-within:border-[#6A907B] focus-within:ring-2 focus-within:ring-[#6A907B]/20 w-full">

                                {/* Пошук */}
                                <div className="flex items-center gap-2 w-full">
                                    <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    <input
                                        type="text"
                                        placeholder="Пошук продукту..."
                                        value={fridgeSearch}
                                        onChange={(e) => {
                                            setFridgeSearch(e.target.value);
                                            setIsFridgeDropdownOpen(true);
                                            setNewFridgeItem({...newFridgeItem, ingredient: ''});
                                        }}
                                        onFocus={() => setIsFridgeDropdownOpen(true)}
                                        className="flex-grow bg-transparent outline-none text-gray-800 font-medium text-[16px] w-full"
                                    />
                                </div>

                                <div className="h-px w-full sm:h-6 sm:w-px bg-gray-300 mx-1"></div>

                                {/* Кількість та одиниця */}
                                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-between sm:justify-start pr-2">
                                    <div className="flex items-center border-b-2 border-transparent focus-within:border-[#42705D] pb-1 w-1/2 sm:w-auto">
                                        <input
                                            type="number"
                                            placeholder="Скільки?"
                                            value={newFridgeItem.amount}
                                            onChange={(e) => setNewFridgeItem({...newFridgeItem, amount: e.target.value})}
                                            className="w-full sm:w-20 bg-transparent outline-none text-gray-800 font-medium text-center"
                                        />
                                    </div>
                                    <div className="border-b-2 border-transparent focus-within:border-[#42705D] pb-1 w-1/2 sm:w-auto">
                                        <select
                                            value={newFridgeItem.unit}
                                            onChange={(e) => setNewFridgeItem({...newFridgeItem, unit: e.target.value})}
                                            className="w-full sm:w-24 bg-transparent outline-none text-gray-800 font-medium cursor-pointer"
                                        >
                                            {Object.entries(DICTIONARIES.units).map(([key, val]) => (
                                                <option key={key} value={key}>{Array.isArray(val) ? val[0] : val}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Кнопка "Зберегти" винесена назовні */}
                            <button onClick={addFridgeItem} className={`w-full sm:w-auto border text-gray-900 px-6 sm:px-8 py-3 sm:py-2.5 rounded-full text-[15px] sm:text-[16px] font-bold transition-colors shrink-0 shadow-sm mt-1 sm:mt-0 ${editingInventoryId ? 'bg-[#E5D48B] border-[#B47231] hover:bg-[#D4C37A]' : 'bg-[#B9D0B2] border-gray-800 hover:bg-[#A8C0A0]'}`}>
                                {editingInventoryId ? 'Оновити' : 'Зберегти'}
                            </button>

                            {/* Випадаючий список результатів пошуку */}
                            {isFridgeDropdownOpen && fridgeSearch && (
                                <ul className="absolute top-[110%] sm:top-full left-0 w-full sm:w-[calc(100%-140px)] mt-2 bg-white border border-gray-200 rounded-3xl shadow-xl max-h-64 overflow-y-auto py-2 custom-scrollbar z-50">
                                    {availableFridgeIngredients.filter(i => i.name.toLowerCase().includes(fridgeSearch.toLowerCase())).map(ing => (
                                        <li
                                            key={ing.id}
                                            onClick={() => handleSelectFridgeIngredient(ing)}
                                            className="flex items-center justify-between px-5 py-2.5 hover:bg-[#F6F7FB] cursor-pointer transition-colors border-b border-gray-50 last:border-0 group"
                                        >
                                            <div className="flex items-center gap-4">
                                                {ing.image ? (
                                                    <img src={getImageUrl(ing.image)} className="w-10 h-10 rounded-full object-cover shadow-sm" alt="" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs shadow-sm">•</div>
                                                )}
                                                <span className="font-medium text-gray-800 text-[16px]">{ing.name}</span>
                                            </div>
                                        </li>
                                    ))}
                                    {availableFridgeIngredients.filter(i => i.name.toLowerCase().includes(fridgeSearch.toLowerCase())).length === 0 && (
                                        <li className="px-5 py-4 text-gray-500 text-center font-medium">Продукт не знайдено</li>
                                    )}
                                </ul>
                            )}
                        </div>

                        {/* Список продуктів у вигляді капсул (тегів) */}
                        <div className="flex flex-wrap gap-4 mt-6">
                            {safeInventory.map(item => (
                                <div key={item.id} className="flex items-center gap-3 bg-white/90 border border-gray-800 rounded-full pl-2 pr-5 py-2 shadow-sm hover:border-[#6A907B] transition-colors">
                                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-sm">
                                        {item.ingredient_image ? (
                                            <img src={getImageUrl(item.ingredient_image)} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">•</div>
                                        )}
                                    </div>

                                    <span className="font-['Inter'] font-semibold text-gray-900 text-[15px] sm:text-[16px]">{item.ingredient_name}</span>

                                    <span className="text-[#B47231] font-bold text-[13px] sm:text-sm bg-[#B47231]/10 px-2 py-0.5 rounded-full ml-1">
                                        {item.amount ? `${parseFloat(item.amount)} ` : ''}
                                        {DICTIONARIES.units[item.unit] ? (Array.isArray(DICTIONARIES.units[item.unit]) ? DICTIONARIES.units[item.unit][0] : DICTIONARIES.units[item.unit]) : item.unit}
                                    </span>

                                    <button onClick={() => removeFridgeItem(item.id)} className="text-gray-900 font-bold text-lg ml-1 hover:text-red-500">✕</button>
                                </div>
                            ))}

                            {safeInventory.length === 0 && (
                                <div className="text-gray-500 font-medium py-4 px-2 w-full text-center sm:text-left">Ваш холодильник порожній. Почніть шукати продукти вище!</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-16 transition-all lg:pl-8 xl:pl-2">

                        {/* ОБМЕЖЕННЯ (ДІЄТИ) */}
                        <div ref={dietsRef}>
                            <div className="flex items-center gap-4 mb-6">
                                <button
                                    onClick={() => setShowAddDiet(!showAddDiet)}
                                    className="bg-[#B9D0B2] border border-gray-800 text-gray-900 px-5 md:px-6 py-2 md:py-2.5 rounded-full text-[15px] md:text-[18px] font-semibold hover:bg-[#A8C0A0] transition-colors shadow-sm whitespace-nowrap"
                                >
                                    + Додати обмеження
                                </button>
                                <div className="flex-grow border-t-2 border-gray-800"></div>
                            </div>

                            {showAddDiet && (
                                <div ref={addDietWrapperRef} className="flex items-center gap-3 mb-6 bg-white/90 p-2 pl-4 rounded-full border border-gray-400 shadow-sm max-w-lg z-20 relative">
                                    <select
                                        value={newDiet} onChange={(e) => setNewDiet(e.target.value)}
                                        className="flex-grow bg-transparent outline-none text-gray-800 font-medium text-[15px] sm:text-[16px]"
                                    >
                                        <option value="">Оберіть дієту...</option>
                                        {availableDiets.map(key => <option key={key} value={key}>{DICTIONARIES.profile_dietary_tags[key]}</option>)}
                                    </select>
                                    <button onClick={() => setShowAddDiet(false)} className="text-gray-400 hover:text-gray-800 px-2 font-bold text-lg transition-colors">✕</button>
                                    <button onClick={addDiet} className="bg-gray-900 text-white px-5 md:px-6 py-2 rounded-full text-[14px] sm:text-[15px] font-bold hover:bg-gray-700 transition-colors shadow-sm">Зберегти</button>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-4">
                                {safeDiets.map(diet => (
                                    <div key={diet} className="flex items-center gap-3 bg-white/90 border border-gray-800 rounded-full pl-2 pr-5 py-2 shadow-sm hover:border-blue-400 transition-colors">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                            <img src={getDietIcon(diet)} alt="" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                                        </div>
                                        <span className="font-['Inter'] font-semibold text-gray-900 text-[15px] md:text-[18px]">{DICTIONARIES.profile_dietary_tags[diet]}</span>
                                        <button onClick={() => removeDiet(diet)} className="text-gray-900 font-bold ml-2 hover:text-red-500">✕</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* АЛЕРГІЇ (НОВИЙ ПОШУК З КАРТИНКАМИ) */}
                        <div ref={allergiesRef}>
                            <div className="flex items-center gap-4 mb-6">
                                <button
                                    onClick={() => setShowAddAllergy(!showAddAllergy)}
                                    className="bg-[#B9D0B2] border border-gray-800 text-gray-900 px-5 md:px-6 py-2 md:py-2.5 rounded-full text-[15px] md:text-[18px] font-semibold hover:bg-[#A8C0A0] transition-colors shadow-sm whitespace-nowrap"
                                >
                                    + Додати алергію
                                </button>
                                <div className="flex-grow border-t-2 border-gray-800"></div>
                            </div>

                            {showAddAllergy && (
                                <div ref={addAllergyWrapperRef} className="relative mb-6 max-w-lg z-20">
                                    <div className="flex items-center gap-3 bg-white/90 p-2 pl-4 sm:pl-5 rounded-full border border-gray-400 shadow-sm transition-all focus-within:border-[#6A907B] focus-within:ring-2 focus-within:ring-[#6A907B]/20">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                        <input
                                            type="text"
                                            placeholder="Пошук інгредієнта..."
                                            value={allergySearch}
                                            onChange={(e) => setAllergySearch(e.target.value)}
                                            className="flex-grow bg-transparent outline-none text-gray-800 font-medium text-[15px] sm:text-[16px]"
                                            autoFocus
                                        />
                                        <button onClick={() => { setShowAddAllergy(false); setAllergySearch(''); }} className="text-gray-400 hover:text-gray-800 px-3 font-bold text-lg transition-colors">✕</button>
                                    </div>

                                    {allergySearch && (
                                        <ul className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-3xl shadow-xl max-h-64 overflow-y-auto py-2 custom-scrollbar">
                                            {availableAllergies.filter(i => i.name.toLowerCase().includes(allergySearch.toLowerCase())).map(ing => (
                                                <li
                                                    key={ing.id}
                                                    onClick={() => addAllergyById(ing.id)}
                                                    className="flex items-center gap-4 px-5 py-2.5 hover:bg-[#F6F7FB] cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                                                >
                                                    {ing.image ? (
                                                        <img src={getImageUrl(ing.image)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shadow-sm" alt="" />
                                                    ) : (
                                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs shadow-sm">•</div>
                                                    )}
                                                    <span className="font-medium text-gray-800 text-[15px] sm:text-[16px]">{ing.name}</span>
                                                </li>
                                            ))}
                                            {availableAllergies.filter(i => i.name.toLowerCase().includes(allergySearch.toLowerCase())).length === 0 && (
                                                <li className="px-5 py-4 text-gray-500 text-center font-medium text-sm sm:text-base">Інгредієнт не знайдено</li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-4">
                                {safeAllergies.map(id => {
                                    const ing = getIngredientData(id);
                                    return (
                                        <div key={id} className="flex items-center gap-3 bg-white/90 border border-gray-800 rounded-full pl-2 pr-5 py-2 shadow-sm hover:border-red-400 transition-colors">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden shrink-0 shadow-sm">
                                                {ing?.image ? (
                                                    <img src={getImageUrl(ing.image)} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-red-100 flex items-center justify-center text-red-500 text-sm font-bold">•</div>
                                                )}
                                            </div>
                                            <span className="font-['Inter'] font-semibold text-gray-900 text-[15px] md:text-[18px]">{ing ? ing.name : '...'}</span>
                                            <button onClick={() => removeAllergy(id)} className="text-gray-900 font-bold ml-2 hover:text-red-500">✕</button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* КУХНІ */}
                        <div ref={cuisinesRef}>
                            <div className="flex items-center gap-4 mb-6">
                                <button
                                    onClick={() => setShowAddCuisine(!showAddCuisine)}
                                    className="bg-[#B9D0B2] border border-gray-800 text-gray-900 px-5 md:px-6 py-2 md:py-2.5 rounded-full text-[15px] md:text-[18px] font-semibold hover:bg-[#A8C0A0] transition-colors shadow-sm whitespace-nowrap"
                                >
                                    + Додати кухню
                                </button>
                                <div className="flex-grow border-t-2 border-gray-800"></div>
                            </div>

                            {showAddCuisine && (
                                <div ref={addCuisineWrapperRef} className="flex items-center gap-3 mb-6 bg-white/80 p-2 pl-4 rounded-full border border-gray-400 shadow-sm max-w-lg z-20 relative">
                                    <select
                                        value={newCuisine} onChange={(e) => setNewCuisine(e.target.value)}
                                        className="flex-grow bg-transparent outline-none text-gray-800 font-medium text-[15px] sm:text-[16px]"
                                    >
                                        <option value="">Оберіть кухню...</option>
                                        {availableCuisines.map(key => <option key={key} value={key}>{DICTIONARIES.cuisine[key]}</option>)}
                                    </select>
                                    <button onClick={() => setShowAddCuisine(false)} className="text-gray-400 hover:text-gray-800 px-2 font-bold text-lg transition-colors">✕</button>
                                    <button onClick={addCuisine} className="bg-gray-900 text-white px-5 md:px-6 py-2 rounded-full text-[14px] sm:text-[15px] font-bold hover:bg-gray-700 transition-colors shadow-sm">Зберегти</button>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-4">
                                {safeCuisines.map(cuisine => (
                                    <div key={cuisine} className="flex items-center gap-3 bg-white/90 border border-gray-800 rounded-full pl-2 pr-5 py-2 shadow-sm hover:border-yellow-500 transition-colors">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                            <img src={getCuisineIcon(cuisine)} alt="" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                                        </div>
                                        <span className="font-['Inter'] font-semibold text-gray-900 text-[15px] md:text-[18px]">{DICTIONARIES.cuisine[cuisine]}</span>
                                        <button onClick={() => removeCuisine(cuisine)} className="text-gray-900 font-bold ml-2 hover:text-red-500">✕</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}

                {/* ФУТЕР БЛОК З ПОВІДОМЛЕННЯМ */}
                <div className="mt-16 mx-auto max-w-3xl border border-gray-800 rounded-full py-3.5 px-6 text-center bg-white/80 backdrop-blur-sm shadow-sm">
                    <p className="text-[15px] font-medium text-gray-800 font-['Inter']">
                        Ми автоматично приховаємо рецепти, які містять ці інгредієнти та особисті обмеження
                    </p>
                </div>

            {/* ================= МОДАЛКА ЗМІНИ ПАРОЛЯ ================= */}
            {isPasswordModalOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => {
                        setIsPasswordModalOpen(false);
                        setPasswordError('');
                        setPasswordData({ oldPassword: '', newPassword: '', newPasswordConfirm: '' });
                    }}
                >
                    <div
                        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold font-['El_Messiri'] text-gray-900 mb-2 text-center">
                            Зміна пароля
                        </h2>

                        {passwordError && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium text-center">
                                {passwordError}
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1 pl-2">Поточний пароль</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.oldPassword}
                                    onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-5 py-3 outline-none focus:border-[#6A907B] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1 pl-2">Новий пароль</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-5 py-3 outline-none focus:border-[#6A907B] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1 pl-2">Підтвердіть новий пароль</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.newPasswordConfirm}
                                    onChange={(e) => setPasswordData({...passwordData, newPasswordConfirm: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-5 py-3 outline-none focus:border-[#6A907B] transition-colors"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsPasswordModalOpen(false);
                                        setPasswordError('');
                                        setPasswordData({ oldPassword: '', newPassword: '', newPasswordConfirm: '' });
                                    }}
                                    className="w-1/2 bg-gray-100 text-gray-800 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Скасувати
                                </button>
                                <button
                                    type="submit"
                                    className="w-1/2 bg-[#1A1A1A] text-white py-3 rounded-2xl font-bold hover:bg-[#6A907B] transition-colors"
                                >
                                    Зберегти
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            </div>
        </div>
    );
};

export default Profile;