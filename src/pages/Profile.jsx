import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // ІМПОРТ ПЕРЕКЛАДУ
import api from '../api';
import { ENDPOINTS, API_URL } from '../constants/api';
import { DICTIONARIES } from '../constants/translations';

import defaultAvatar from '../assets/global/avokado_avatar.png';
import profileBg from '../assets/profile/profile-bg.jpg';

import advice1 from '../assets/profile/advice1.jpg';
import advice2 from '../assets/profile/advice2.jpg';
import advice3 from '../assets/profile/advice3.jpg';

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

import riceCookerIcon from '../assets/profile/rice_cooker.png';
import commercialIcon from '../assets/profile/commercial.png';
import fridgeIcon from '../assets/profile/fridge.png';

const getPluralForm = (number, titles) => {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return titles[2];
    if (n1 > 1 && n1 < 5) return titles[1];
    if (n1 === 1) return titles[0];
    return titles[2];
};

const Profile = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [userData, setUserData] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState(null);

    const [activeTab, setActiveTab] = useState(null);

    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');

    const [showAddAllergy, setShowAddAllergy] = useState(false);
    const [showAddDiet, setShowAddDiet] = useState(false);
    const [showAddCuisine, setShowAddCuisine] = useState(false);

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', newPasswordConfirm: '' });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const [newAllergy, setNewAllergy] = useState('');
    const [newDiet, setNewDiet] = useState('');
    const [newCuisine, setNewCuisine] = useState('');
    const [newFridgeItem, setNewFridgeItem] = useState({ ingredient: '', amount: '', unit: 'g' });
    const [editingInventoryId, setEditingInventoryId] = useState(null);

    const [allergySearch, setAllergySearch] = useState('');
    const [fridgeSearch, setFridgeSearch] = useState('');
    const [isFridgeDropdownOpen, setIsFridgeDropdownOpen] = useState(false);
    const [isDeleteAvatarModalOpen, setIsDeleteAvatarModalOpen] = useState(false);

    const [activeAdviceModal, setActiveAdviceModal] = useState(null);

    const [isCuisineModalOpen, setIsCuisineModalOpen] = useState(false);
    const [isAllergyModalOpen, setIsAllergyModalOpen] = useState(false);
    const [isDietModalOpen, setIsDietModalOpen] = useState(false);
    const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

    const [inventoryMessage, setInventoryMessage] = useState(null);

    const inventoryMessageTimerRef = useRef(null);

    const addAllergyWrapperRef = useRef(null);
    const addDietWrapperRef = useRef(null);
    const addCuisineWrapperRef = useRef(null);
    const addFridgeWrapperRef = useRef(null);

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const pwdErrorTimerRef = useRef(null);

    const showPasswordErrorMessage = (text) => {
        setPasswordError(text);
        if (pwdErrorTimerRef.current) clearTimeout(pwdErrorTimerRef.current);
        pwdErrorTimerRef.current = setTimeout(() => setPasswordError(''), 5000);
    };

    const calculateStrength = (password) => {
        let score = 0;
        if (!password) return 0;
        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password) || /[А-ЯІЇЄҐ]/.test(password)) score += 1;
        if (/[a-z]/.test(password) || /[а-яіїєґ]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9А-Яа-яІіЇїЄєҐґ]/.test(password)) score += 1;
        return score;
    };

    const pwdStrength = calculateStrength(passwordData.newPassword);
    const strengthColors = ['bg-gray-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
    const strengthLabels = ['', t('profile_page.pwd_strength_1'), t('profile_page.pwd_strength_2'), t('profile_page.pwd_strength_3'), t('profile_page.pwd_strength_4'), t('profile_page.pwd_strength_5')];

    useEffect(() => {
        fetchData();
        window.scrollTo(0, 0);
    }, [navigate, i18n.language]);

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

    const CUISINE_IMAGES = {
        'eu': euCuisine, 'mediterranean': mediterraneanCuisine, 'it': itCuisine, 'mx': mxCuisine, 'intl': intlCuisine,
        'ua': uaCuisine, 'fr': frCuisine, 'us': usCuisine, 'cn': cnCuisine, 'jp': jpCuisine, 'asian': asianCuisine,
        'gb': gbCuisine, 'author': authorCuisine, 'in': inCuisine
    };

    const DIET_IMAGES = {
        'traditional': traditionalDiet, 'vegetarian': vegetarianDiet, 'vegan': veganDiet, 'dietary': dietaryDiet,
        'gluten_free': glutenFreeDiet, 'lactose_free': lactoseFreeDiet, 'sugar_free': sugarFreeDiet,
        'high_protein': highProteinDiet, 'meat_diet': meatDiet, 'seafood_diet': seafoodDiet
    };

    const CATEGORY_UNIT_MAP = {
        'fruits': ['g', 'kg'], 'vegetables': ['g', 'kg'], 'dairy': ['g', 'kg', 'ml', 'l'],
        'oils_liquids': ['ml', 'l', 'tbsp', 'tsp'], 'spices': ['g', 'tsp'], 'meat_beef': ['g', 'kg'],
        'meat_pork': ['g', 'kg'], 'meat_bird': ['g', 'kg'], 'meat_products': ['g', 'kg', 'slice'],
        'grains': ['g', 'kg'], 'cheese': ['g', 'kg', 'slice'], 'seafood': ['g', 'kg'],
        'fish_red': ['g', 'kg'], 'fish_white': ['g', 'kg'], 'sweets': ['g', 'kg'],
        'greens': ['bunch', 'g', 'sprig'], 'mushrooms': ['g', 'kg'], 'nuts': ['g', 'kg'],
        'flour': ['g', 'kg'], 'alt_protein': ['g', 'kg'],
    };

    const EXACT_UNIT_MATCH = {
        'яйця': ['pcs'], 'eggs': ['pcs'], 'jajka': ['pcs'],
        'перепелині яйця': ['pcs'], 'quail eggs': ['pcs'], 'jajka przepiórcze': ['pcs'],
        'лимон': ['pcs', 'g'], 'lemon': ['pcs', 'g'], 'cytryna': ['pcs', 'g'],
        'лайм': ['pcs', 'g'], 'lime': ['pcs', 'g'], 'limonka': ['pcs', 'g'],
        'авокадо': ['pcs', 'g'], 'avocado': ['pcs', 'g'], 'awokado': ['pcs', 'g'],
        'банан': ['pcs', 'g'], 'banana': ['pcs', 'g'], 'banan': ['pcs', 'g'],
        'часник': ['g', 'kg', 'clove'], 'garlic': ['g', 'kg', 'clove'], 'czosnek': ['g', 'kg', 'clove'],
        'вода': ['ml', 'l'], 'water': ['ml', 'l'], 'woda': ['ml', 'l'],
        'бульйон': ['ml', 'l'], 'broth': ['ml', 'l'], 'bulion': ['ml', 'l'],
        'овочевий бульйон': ['ml', 'l'], 'vegetable broth': ['ml', 'l'], 'bulion warzywny': ['ml', 'l'],
        'сіль': ['g', 'kg'], 'salt': ['g', 'kg'], 'sól': ['g', 'kg'],
        'перець чорний': ['g'], 'black pepper': ['g'], 'czarny pieprz': ['g'],
        'хліб': ['slice', 'g'], 'bread': ['slice', 'g'], 'chleb': ['slice', 'g'],
        'кокосове молоко': ['ml', 'l', 'can'], 'coconut milk': ['ml', 'l', 'can'], 'mleko kokosowe': ['ml', 'l', 'can'],
        'томатна паста': ['g', 'tbsp', 'can'], 'tomato paste': ['g', 'tbsp', 'can'], 'koncentrat pomidorowy': ['g', 'tbsp', 'can'],
        'пападам': ['pcs'], 'papadum': ['pcs'],
        'вершкове масло': ['g', 'kg'], 'butter': ['g', 'kg'], 'masło': ['g', 'kg'],
        'шоколад': ['g', 'pcs'], 'chocolate': ['g', 'pcs'], 'czekolada': ['g', 'pcs'],
        'темний шоколад': ['g', 'pcs'], 'dark chocolate': ['g', 'pcs'], 'ciemna czekolada': ['g', 'pcs'],
        'розпушувач': ['g', 'tsp'], 'baking powder': ['g', 'tsp'], 'proszek do pieczenia': ['g', 'tsp'],
        'желатин': ['g', 'tsp'], 'gelatin': ['g', 'tsp'], 'żelatyna': ['g', 'tsp'],
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

    const dispatchUserUpdate = (updatedData) => {
        window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: updatedData }));
    };

    // Використовуємо .toLowerCase() для безпечного пошуку
    const getDefaultUnit = (ingredient) => {
        if (!ingredient) return 'g';
        const ingNameLower = ingredient.name.toLowerCase();
        if (EXACT_UNIT_MATCH[ingNameLower]) {
            return EXACT_UNIT_MATCH[ingNameLower][0];
        }
        const units = CATEGORY_UNIT_MAP[ingredient.category] || ['g'];
        return units[0];
    };

    const resetInventoryForm = () => {
        setFridgeSearch('');
        setNewFridgeItem({ ingredient: '', amount: '', unit: 'g' });
        setIsFridgeDropdownOpen(false);
        setEditingInventoryId(null);
        setInventoryMessage(null);
    };

    const showInventoryMessage = (type, text, duration = 4000) => {
        setInventoryMessage({ type, text });
        if (inventoryMessageTimerRef.current) {
            clearTimeout(inventoryMessageTimerRef.current);
        }
        inventoryMessageTimerRef.current = setTimeout(() => {
            setInventoryMessage(null);
        }, duration);
    };

    const transliterate = (text) => {
        if (!text) return 'user';
        const cyrillic = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye', 'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya',
            'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Ґ': 'G', 'Д': 'D', 'Е': 'E', 'Є': 'Ye', 'Ж': 'Zh', 'З': 'Z', 'И': 'Y', 'І': 'I', 'Ї': 'Yi', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ь': '', 'Ю': 'Yu', 'Я': 'Ya'
        };

        return text.split('').map(char => cyrillic[char] || char)
            .join('')
            .replace(/[^a-zA-Z0-9]/g, '_')
            .replace(/_+/g, '_')
            .toLowerCase();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const safeUserName = transliterate(userData?.first_name);
        const date = new Date();
        const dateString = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;
        const extension = file.name.split('.').pop().toLowerCase();
        const newFileName = `${safeUserName}_${dateString}.${extension}`;
        const renamedFile = new File([file], newFileName, { type: file.type });

        const formData = new FormData();
        formData.append('avatar', renamedFile);

        try {
            const res = await api.patch('/api/auth/user/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const updatedUser = { ...res.data };
            if (updatedUser.avatar) {
                const separator = updatedUser.avatar.includes('?') ? '&' : '?';
                updatedUser.avatar = `${updatedUser.avatar}${separator}t=${new Date().getTime()}`;
            }

            setUserData(updatedUser);
            dispatchUserUpdate(updatedUser);
            showToast(t('profile_page.toast_avatar_updated'));
        } catch (err) {
            showToast(t('profile_page.toast_err_avatar'));
        }
    };

    const handleNameSave = async () => {
        try {
            const res = await api.patch('/api/auth/user/', { first_name: editNameValue });
            setUserData(res.data);
            dispatchUserUpdate(res.data);
            setIsEditProfileModalOpen(false);
            showToast(t('profile_page.toast_profile_updated'));
        } catch (err) {
            showToast(t('profile_page.toast_err_profile'));
        }
    };

    const updateArrayField = async (field, newArray) => {
        try {
            const res = await api.patch('/api/auth/user/', { [field]: newArray });
            setUserData(res.data);
            return true;
        } catch (err) {
            showToast(t('profile_page.toast_err_general'));
            return false;
        }
    };

    const safeAllergies = userData?.allergies || [];
    const addAllergyById = async (id) => {
        if (safeAllergies.includes(id)) return;
        const updatedAllergies = [...safeAllergies, id];
        const success = await updateArrayField('allergies', updatedAllergies);
        if (success) {
            setAllergySearch('');
            setShowAddAllergy(false);
        }
    };
    const removeAllergy = async (idToRemove) => {
        const updatedAllergies = safeAllergies.filter(id => id !== idToRemove);
        await updateArrayField('allergies', updatedAllergies);
    };

    const safeDiets = userData?.dietary_preferences || [];
    const removeDiet = async (dietToRemove) => {
        const updatedDiets = safeDiets.filter(d => d !== dietToRemove);
        await updateArrayField('dietary_preferences', updatedDiets);
    };

    const safeCuisines = userData?.favorite_cuisines || [];
    const removeCuisine = async (cuisineToRemove) => {
        const updatedCuisines = safeCuisines.filter(c => c !== cuisineToRemove);
        await updateArrayField('favorite_cuisines', updatedCuisines);
    };

    const clearAllCuisines = async () => {
        if (safeCuisines.length === 0) return;
        const success = await updateArrayField('favorite_cuisines', []);
        if (success) showToast(t('profile_page.toast_clear_cuisines'));
    };

    const clearAllDiets = async () => {
        if (safeDiets.length === 0) return;
        const success = await updateArrayField('dietary_preferences', []);
        if (success) showToast(t('profile_page.toast_clear_diets'));
    };

    const clearAllAllergies = async () => {
        if (safeAllergies.length === 0) return;
        const success = await updateArrayField('allergies', []);
        if (success) showToast(t('profile_page.toast_clear_allergies'));
    };

    const clearAllInventory = async () => {
        if (safeInventory.length === 0) return;
        try {
            await Promise.all(safeInventory.map(item => api.delete(`/api/inventory/${item.id}/`)));
            setUserData(prev => ({ ...prev, inventory: [] }));
            resetInventoryForm();
            showToast(t('profile_page.toast_inv_all_deleted'));
        } catch (err) {
            showToast(t('profile_page.toast_err_inv_all'));
        }
    };

    const safeInventory = userData?.inventory || [];
    const inventoryUrl = ENDPOINTS?.INVENTORY || '/api/inventory/';

    const addFridgeItem = async () => {
        setInventoryMessage(null);

        if (!newFridgeItem.ingredient) {
            showInventoryMessage('error', t('profile_page.inv_err_select'), 3000);
            return;
        }

        let parsedAmount = null;
        if (newFridgeItem.amount) {
            parsedAmount = parseFloat(newFridgeItem.amount);
            parsedAmount = Math.round(parsedAmount * 10) / 10;
        }

        if (newFridgeItem.unit !== 'taste' && (parsedAmount === null || parsedAmount <= 0 || isNaN(parsedAmount))) {
            showInventoryMessage('error', t('profile_page.inv_err_amount'), 3000);
            return;
        }

        const existingItem = safeInventory.find(item => item.ingredient === parseInt(newFridgeItem.ingredient));

        if (existingItem && editingInventoryId !== existingItem.id) {
            showInventoryMessage('error', t('profile_page.inv_err_duplicate'), 4000);
            return;
        }

        try {
            if (editingInventoryId) {
                const res = await api.patch(`${inventoryUrl}${editingInventoryId}/`, {
                    amount: parsedAmount,
                    unit: newFridgeItem.unit
                });

                const updatedInventory = safeInventory.map(item =>
                    item.id === editingInventoryId ? res.data : item
                );
                setUserData({ ...userData, inventory: updatedInventory });
                showInventoryMessage('success', t('profile_page.inv_toast_updated'), 3000);

            } else {
                const res = await api.post(inventoryUrl, {
                    ingredient: parseInt(newFridgeItem.ingredient),
                    amount: parsedAmount,
                    unit: newFridgeItem.unit
                });
                setUserData({ ...userData, inventory: [res.data, ...safeInventory] });
                showInventoryMessage('success', t('profile_page.inv_toast_added'), 3000);
            }

            setNewFridgeItem({ ingredient: '', amount: '', unit: 'g' });
            setFridgeSearch('');
            setIsFridgeDropdownOpen(false);
            setEditingInventoryId(null);

        } catch (err) {
            if (err.response && err.response.data) {
                 showInventoryMessage('error', `Помилка: ${JSON.stringify(err.response.data)}`, 5000);
            } else {
                 showInventoryMessage('error', t('profile_page.toast_err_general'), 4000);
            }
        }
    };

    const handleSelectFridgeIngredient = (ing) => {
        setFridgeSearch(ing.name);
        setIsFridgeDropdownOpen(false);

        const existingItem = safeInventory.find(item => item.ingredient === ing.id);

        if (existingItem) {
            setEditingInventoryId(existingItem.id);
            setNewFridgeItem({
                ingredient: ing.id,
                amount: existingItem.amount ? parseFloat(existingItem.amount) : '',
                unit: existingItem.unit
            });
            showToast(t('profile_page.toast_already_in_list'));
        } else {
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

            if (editingInventoryId === itemId) {
                resetInventoryForm();
            }

            showToast(t('profile_page.toast_inv_deleted'));
        } catch (err) {
            showToast(t('profile_page.toast_err_delete'));
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (addAllergyWrapperRef.current && !addAllergyWrapperRef.current.contains(event.target)) {
                setShowAddAllergy(false);
                setAllergySearch('');
            }
            if (addDietWrapperRef.current && !addDietWrapperRef.current.contains(event.target)) setShowAddDiet(false);
            if (addCuisineWrapperRef.current && !addCuisineWrapperRef.current.contains(event.target)) setShowAddCuisine(false);

            if (addFridgeWrapperRef.current && !addFridgeWrapperRef.current.contains(event.target)) {
                 setIsFridgeDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');

        if (passwordData.newPassword.length < 8) {
            showPasswordErrorMessage(t('profile_page.pwd_err_length'));
            return;
        }

        if (pwdStrength < 3) {
            showPasswordErrorMessage(t('profile_page.pwd_err_weak'));
            return;
        }

        if (passwordData.newPassword !== passwordData.newPasswordConfirm) {
            showPasswordErrorMessage(t('profile_page.pwd_err_match'));
            return;
        }

        if (passwordData.oldPassword === passwordData.newPassword) {
            showPasswordErrorMessage(t('profile_page.pwd_err_same'));
            return;
        }

        try {
            await api.post('/api/auth/password/change/', {
                old_password: passwordData.oldPassword,
                new_password1: passwordData.newPassword,
                new_password2: passwordData.newPasswordConfirm
            });

            setIsPasswordModalOpen(false);
            setPasswordData({ oldPassword: '', newPassword: '', newPasswordConfirm: '' });
            setPasswordSuccess(true);
            setTimeout(() => setPasswordSuccess(false), 2000);
        } catch (err) {
            const data = err.response?.data;
            if (data) {
                if (data.old_password) {
                    showPasswordErrorMessage(t('profile_page.pwd_err_wrong'));
                } else if (data.new_password1) {
                    showPasswordErrorMessage(data.new_password1[0]);
                } else if (data.non_field_errors) {
                    showPasswordErrorMessage(data.non_field_errors[0]);
                }
            } else {
                showPasswordErrorMessage(t('profile_page.pwd_err_conn'));
            }
        }
    };

    const getIngredientData = (id) => ingredients.find(i => i.id === id);
    const availableAllergies = ingredients.filter(i => !safeAllergies.includes(i.id));
    const availableFridgeIngredients = ingredients;

    const getFavoritesWord = (count) => {
        return getPluralForm(count, [t('profile_page.tab_fav_1'), t('profile_page.tab_fav_2'), t('profile_page.tab_fav_5')]);
    };

    const formatDisplayAmount = (amount, unit) => {
        if (!amount) return '';
        const num = parseFloat(amount);

        const integerUnits = ['g', 'ml', 'pcs', 'clove', 'sprig', 'bunch', 'drop', 'pinch'];

        if (integerUnits.includes(unit)) {
            return Math.round(num).toString();
        }

        return num.toFixed(1).replace(/\.0$/, '');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-2xl font-['El_Messiri'] text-gray-800">{t('profile_page.loading')}</div>;

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
                            {t('profile_page.toast_pwd_success')}
                        </h2>
                    </div>
                </div>
            )}

            <div className="w-full px-4 sm:px-6 lg:px-24 pt-48 lg:pt-60 relative z-10">

                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14 mb-14 lg:pl-5 xl:pl-12">
                    <div className="relative group shrink-0">
                        <div className="w-80 h-80 sm:w-90 sm:h-90 md:w-80 md:h-80 lg:w-[400px] lg:h-[400px] xl:w-[420px] xl:h-[420px] rounded-full overflow-hidden shadow-sm bg-[#C4D5BD] relative flex items-center justify-center">
                            <img
                                key={userData?.avatar || 'default'}
                                src={getImageUrl(userData.avatar)}
                                alt="Avatar"
                                className={`rounded-full transition-all duration-300 ${userData?.avatar ? 'w-full h-full object-cover' : 'w-[60%] h-[60%] object-contain'}`}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = defaultAvatar;
                                    e.target.className = "rounded-full transition-all duration-300 w-[60%] h-[60%] object-contain";
                                }}
                            />
                            <div className="absolute w-[100%] h-[100%] bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full gap-4">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRef.current.click();
                                    }}
                                    className="flex items-center gap-2 text-white hover:text-[#C4D5BD] transition-colors cursor-pointer bg-black/40 px-6 py-3 rounded-full hover:bg-black/60 backdrop-blur-sm"
                                >
                                    <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    <span className="font-semibold text-sm md:text-base">{t('profile_page.change_photo')}</span>
                                </button>

                                {userData?.avatar && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsDeleteAvatarModalOpen(true);
                                        }}
                                        className="flex items-center gap-2 text-red-300 hover:text-red-500 transition-colors cursor-pointer bg-black/40 px-6 py-2.5 rounded-full hover:bg-black/60 backdrop-blur-sm"
                                    >
                                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        <span className="font-semibold text-sm md:text-base">{t('profile_page.delete_photo')}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                    </div>

                    <div className="flex flex-col items-center md:items-start w-full md:mt-50">
                        <div className="flex flex-col items-center xl:items-start text-center xl:text-left w-full xl:w-auto bg-white/60 backdrop-blur-md p-5 sm:p-4 rounded-[2rem] shadow-sm transition-all duration-500">
                            <div className="w-full flex justify-center xl:justify-start pt-2 sm:pt-4 mb-4 md:mb-8">
                                <h1 className="text-4xl md:text-[46px] lg:text-[54px] font-['El_Messiri'] font-medium text-[#1A1A1A] tracking-wide drop-shadow-sm max-w-full lg:max-w-2xl xl:max-w-3xl break-words leading-tight">
                                    {userData.first_name || t('profile_page.user_default')}
                                </h1>
                            </div>

                            <div className="flex flex-col xl:flex-row items-center gap-4 sm:gap-6 w-full xl:w-auto">
                                <div className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5 md:px-12 md:py-3 bg-white/50 border border-gray-800 rounded-full text-gray-900 font-['Inter'] font-medium text-[15px] md:text-[18px] shrink-0 backdrop-blur-sm">
                                    {userData.email}
                                </div>
                                <button
                                    onClick={() => setIsEditProfileModalOpen(true)}
                                    className="relative overflow-hidden w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 md:px-12 md:py-3 bg-[#C4D5BD] text-[#974F23] rounded-full font-['Inter'] font-bold text-[15px] md:text-[18px] hover:bg-[#a6bb9f] transition-all whitespace-nowrap shrink-0 cursor-pointer duration-300 ease-out active:scale-95 group shadow-md hover:shadow-lg border border-[#B3C6AC]"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                        {t('profile_page.edit_profile')}
                                    </span>
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
                        onClick={() => setIsCuisineModalOpen(true)}
                        className={`flex items-center gap-2 sm:gap-3 px-5 py-2 rounded-full transition-all duration-300 ease-out active:scale-95 group border cursor-pointer ${
                            safeCuisines.length > 0 
                                ? 'bg-[#CCFBF1] border-cyan-300 text-gray-900 shadow-inner' 
                                : 'bg-[#E3ECD9] border-transparent text-[#1A1A1A] hover:brightness-95'
                        }`}
                    >
                        <img
                            src={riceCookerIcon}
                            alt="Кухня"
                            className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 object-contain group-hover:scale-110 transition-transform"
                        />
                        <span className="font-['Inter'] font-semibold text-[#1A1A1A] text-[15px] sm:text-base md:text-[18px] lg:text-[20px] group-hover:text-[#42705D] transition-colors">
                            {safeCuisines.length > 0 ? `${t('profile_page.tab_cuisine')} (${safeCuisines.length})` : t('profile_page.tab_cuisine')}
                        </span>
                    </button>

                    <button
                        onClick={() => setIsAllergyModalOpen(true)}
                        className={`flex items-center gap-2 sm:gap-3 px-5 py-2 rounded-full font-['Inter'] font-semibold text-[15px] sm:text-[16px] transition-colors cursor-pointer transition-all duration-300 ease-out active:scale-95 group border ${
                            safeAllergies.length > 0 
                                ? 'bg-[#FEE2E2] border-red-300 text-gray-900 shadow-inner' 
                                : 'bg-[#E3ECD9] border-transparent text-[#1A1A1A] hover:brightness-95 hover:text-[#42705D]'
                        }`}
                    >
                        <svg className="w-6 h-6 md:w-8 md:h-8 text-red-500 group-hover:scale-110 transition-transform fill-red-500" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12" stroke="white" strokeWidth="3" strokeLinecap="round"></line></svg>
                        <span className="font-['Inter'] font-semibold text-[#1A1A1A] text-[15px] sm:text-base md:text-[18px] lg:text-[20px] transition-colors">
                            {safeAllergies.length > 0 ? `${t('profile_page.tab_allergies')} (${safeAllergies.length})` : t('profile_page.tab_allergies')}
                        </span>
                    </button>

                    <button
                        onClick={() => setIsDietModalOpen(true)}
                        className={`flex items-center gap-2 sm:gap-3 px-5 py-2 rounded-full transition-all duration-300 ease-out active:scale-95 group border cursor-pointer ${
                            safeDiets.length > 0 
                                ? 'bg-[#DBEAFE] border-blue-300 text-gray-900 shadow-inner' 
                                : 'bg-[#E3ECD9] border-transparent text-[#1A1A1A] hover:brightness-95'
                        }`}
                    >
                        <img
                            src={commercialIcon}
                            alt="Харчові обмеження"
                            className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 object-contain group-hover:scale-110 transition-transform"
                        />
                        <span className="font-['Inter'] font-semibold text-[#1A1A1A] text-[15px] sm:text-base md:text-[18px] lg:text-[20px] group-hover:text-[#42705D] transition-colors">
                            {safeDiets.length > 0 ? `${t('profile_page.tab_diets')} (${safeDiets.length})` : t('profile_page.tab_diets')}
                        </span>
                    </button>

                    <button
                        onClick={() => setIsInventoryModalOpen(true)}
                        className={`flex items-center gap-2 sm:gap-3 px-5 py-2 rounded-full transition-all duration-300 ease-out active:scale-95 group border cursor-pointer ${
                            safeInventory.length > 0 
                                ? 'bg-[#CCFBF1] border-cyan-300 text-gray-900 shadow-inner' 
                                : 'bg-[#E3ECD9] border-transparent text-[#1A1A1A] hover:brightness-95'
                        }`}
                    >
                        <img
                            src={fridgeIcon}
                            alt="Мої продукти"
                            className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 object-contain group-hover:scale-110 transition-transform"
                        />
                        <span className="font-['Inter'] font-semibold text-[#1A1A1A] text-[15px] sm:text-base md:text-[18px] lg:text-[20px] group-hover:text-[#42705D] transition-colors">
                            {safeInventory.length > 0 ? `${t('profile_page.tab_inventory')} (${safeInventory.length})` : t('profile_page.tab_inventory')}
                        </span>
                    </button>
                </div>

                {/* ================= ФУТЕР БЛОК З ПОВІДОМЛЕННЯМ ================= */}
                <div className="mt-10 mx-auto max-w-3xl xl:max-w-5xl border border-gray-800 rounded-full py-3.5 px-6 text-center shadow-sm">
                    <p className="text-[10px] sm:text-[12px] md:text-[15px] lg:text-[16px] xl:text-[20px] font-medium text-gray-800 font-['Inter']">
                        {t('profile_page.footer_note')}
                    </p>
                </div>

                {/* ================= БЛОК ПОРАД ================= */}
                <div className="mt-10 mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-4 h-4 bg-[#6A907B] rounded-sm shrink-0"></div>
                        <h2 className="text-[16px] sm:text-[19px] md:text-[22px] lg:text-[25px] xl:text-[30px] font-['El_Messiri'] text-gray-800 uppercase tracking-widest whitespace-nowrap">{t('profile_page.advice_title')}</h2>
                        <div className="w-full border-t-1 border-gray-800"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div onClick={() => setActiveAdviceModal('greens')} className="flex flex-col group cursor-pointer hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 min-h-[450px] shadow-md hover:shadow-xl rounded-3xl">
                            <div className="h-77 relative z-10 rounded-3xl overflow-hidden isolate transform-gpu bg-white">
                                <img src={advice1} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <div className="bg-white border-x border-b border-gray-500 group-hover:border-gray-500 rounded-b-3xl flex-grow flex flex-col justify-center text-center p-6 pt-12 -mt-6 relative z-0 transition-colors duration-300">
                                <h3 className="font-['El_Messiri'] font-bold text-gray-900 text-lg leading-snug">{t('profile_page.advice1_title')}</h3>
                            </div>
                        </div>

                        <div onClick={() => setActiveAdviceModal('pan')} className="flex flex-col group cursor-pointer hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 min-h-[450px] shadow-md hover:shadow-xl rounded-3xl">
                            <div className="h-77 relative z-10 rounded-3xl overflow-hidden isolate transform-gpu bg-white">
                                <img src={advice2} alt="" className="w-full h-full object-cover -scale-x-100 -scale-y-100 group-hover:scale-x-[-1.05] group-hover:scale-y-[-1.05] transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <div className="bg-white border-x border-b border-gray-500 group-hover:border-gray-500 rounded-b-3xl flex-grow flex flex-col justify-center text-center p-6 pt-12 -mt-6 relative z-0 transition-colors duration-300">
                                <h3 className="font-['El_Messiri'] font-bold text-gray-900 text-lg leading-snug">{t('profile_page.advice2_title')}</h3>
                            </div>
                        </div>

                        <div onClick={() => setActiveAdviceModal('chocolate')} className="flex flex-col group cursor-pointer hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 min-h-[450px] shadow-md hover:shadow-xl rounded-3xl">
                            <div className="h-77 relative z-10 rounded-3xl overflow-hidden isolate transform-gpu bg-white">
                                <img src={advice3} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            <div className="bg-white border-x border-b border-gray-500 group-hover:border-gray-500 rounded-b-3xl flex-grow flex flex-col justify-center text-center p-6 pt-12 -mt-6 relative z-0 transition-colors duration-300">
                                <h3 className="font-['El_Messiri'] font-bold text-gray-900 text-lg leading-snug">{t('profile_page.advice3_title')}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= СУЧАСНЕ МОДАЛЬНЕ ВІКНО ПОРАД ================= */}
                {activeAdviceModal && (
                    <div className="fixed inset-0 z-[200] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300" onClick={() => setActiveAdviceModal(null)}>
                        <div className="bg-white w-full sm:max-w-2xl max-h-[90vh] flex flex-col rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-[slideUp_0.4s_ease-out] sm:animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setActiveAdviceModal(null)} className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 hover:text-red-500 rounded-full shadow-md transition-all z-50 cursor-pointer">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>

                            <div className="overflow-y-auto custom-scrollbar flex-1">
                                {activeAdviceModal === 'greens' && (
                                    <>
                                        <div className="w-full h-64 sm:h-80 relative shrink-0">
                                            <img src={advice1} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-6 sm:p-10">
                                            <h2 className="text-2xl sm:text-3xl font-bold font-['Inter'] text-gray-900 mb-8 leading-tight">{t('profile_page.advice1_title')}</h2>
                                            <div className="space-y-6 text-gray-800 font-medium text-[15px] sm:text-[16px] leading-relaxed font-['Inter']">
                                                <p><span className="font-bold text-black">1.</span> {t('profile_page.advice1_p1')}</p>
                                                <p><span className="font-bold text-black">2.</span> {t('profile_page.advice1_p2')}</p>
                                                <p><span className="font-bold text-black">3.</span> {t('profile_page.advice1_p3')}</p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeAdviceModal === 'pan' && (
                                    <>
                                        <div className="w-full h-64 sm:h-80 relative shrink-0">
                                            <img src={advice2} alt="" className="w-full h-full object-cover -scale-x-100 -scale-y-100" />
                                        </div>
                                        <div className="p-6 sm:p-10">
                                            <h2 className="text-2xl sm:text-3xl font-bold font-['Inter'] text-gray-900 mb-6 leading-tight">{t('profile_page.advice2_title')}</h2>
                                            <p className="text-gray-600 font-medium mb-6 font-['Inter']">{t('profile_page.advice2_subtitle')}</p>
                                            <ul className="space-y-4 text-gray-800 font-medium text-[15px] sm:text-[16px] leading-relaxed list-disc pl-5 marker:text-gray-400 font-['Inter']">
                                                <li><span className="font-bold text-black">{t('profile_page.advice2_p1_b')}</span>{t('profile_page.advice2_p1')}</li>
                                                <li><span className="font-bold text-black">{t('profile_page.advice2_p2_b')}</span>{t('profile_page.advice2_p2')}</li>
                                                <li><span className="font-bold text-black">{t('profile_page.advice2_p3_b')}</span>{t('profile_page.advice2_p3')}</li>
                                                <li><span className="font-bold text-black">{t('profile_page.advice2_p4_b')}</span>{t('profile_page.advice2_p4')}</li>
                                            </ul>
                                        </div>
                                    </>
                                )}

                                {activeAdviceModal === 'chocolate' && (
                                    <>
                                        <div className="w-full h-64 sm:h-80 relative shrink-0">
                                            <img src={advice3} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-6 sm:p-10">
                                            <h2 className="text-2xl sm:text-3xl font-bold font-['Inter'] text-gray-900 mb-6 leading-tight">{t('profile_page.advice3_title')}</h2>
                                            <p className="text-gray-600 font-medium mb-6 font-['Inter']">{t('profile_page.advice3_subtitle')}</p>
                                            <ul className="space-y-4 text-gray-800 font-medium text-[15px] sm:text-[16px] leading-relaxed list-disc pl-5 marker:text-gray-400 font-['Inter']">
                                                <li><span className="font-bold text-black">{t('profile_page.advice3_p1_b')}</span>{t('profile_page.advice3_p1')}</li>
                                                <li><span className="font-bold text-black">{t('profile_page.advice3_p2_b')}</span>{t('profile_page.advice3_p2')}</li>
                                                <li><span className="font-bold text-black">{t('profile_page.advice3_p3_b')}</span>{t('profile_page.advice3_p3')}</li>
                                                <li><span className="font-bold text-black">{t('profile_page.advice3_p4_b')}</span>{t('profile_page.advice3_p4')}</li>
                                                <li><span className="font-bold text-black">{t('profile_page.advice3_p5_b')}</span>{t('profile_page.advice3_p5')}</li>
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
                        <div className="bg-white w-full max-w-[95%] sm:max-w-lg rounded-[2.5rem] shadow-2xl relative animate-scaleIn overflow-hidden my-auto shrink-0" onClick={(e) => e.stopPropagation()}>
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[#B9D0B2] to-[#E5D48B] opacity-40 rounded-b-[40%] z-0 pointer-events-none"></div>
                            <button onClick={() => { setIsEditProfileModalOpen(false); setEditNameValue(userData.first_name || ''); setIsPasswordModalOpen(false); setPasswordError(''); setPasswordData({ oldPassword: '', newPassword: '', newPasswordConfirm: '' }); }} className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 rounded-full shadow-md backdrop-blur-sm transition-all z-20 cursor-pointer">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>

                            <div className="pt-12 pb-4 text-center px-6 relative z-10">
                                <h2 className="text-3xl sm:text-4xl font-bold font-['El_Messiri'] text-gray-900 tracking-wide">{t('profile_page.settings_title')}</h2>
                                <p className="text-sm sm:text-base text-gray-500 font-medium mt-2">{t('profile_page.settings_subtitle')}</p>
                            </div>

                            <div className="p-6 sm:p-8 pt-2 relative z-10">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <label className="absolute -top-2.5 left-4 px-1 bg-white text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider group-focus-within:text-[#6A907B] transition-colors z-10">{t('profile_page.full_name')}</label>
                                            <input type="text" value={editNameValue} onChange={(e) => setEditNameValue(e.target.value)} maxLength={40} className="w-full bg-transparent border-2 border-gray-200 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 outline-none focus:border-[#6A907B] transition-colors font-bold text-gray-900 text-base sm:text-lg hover:border-gray-300 relative z-0" />
                                        </div>
                                        <div className="relative opacity-70">
                                            <label className="absolute -top-2.5 left-4 px-1 bg-white text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider z-10">{t('profile_page.email')}</label>
                                            <input type="email" value={userData.email} disabled className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 outline-none text-gray-500 font-bold cursor-not-allowed text-base sm:text-lg relative z-0" />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10"><svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-gray-100 w-full my-4 sm:my-6"></div>

                                    <div className="bg-gray-50 rounded-3xl border border-gray-200 overflow-hidden transition-all duration-500">
                                        <button onClick={() => { if (isPasswordModalOpen) { setPasswordData({ oldPassword: '', newPassword: '', newPasswordConfirm: '' }); setPasswordError(''); } setIsPasswordModalOpen(!isPasswordModalOpen); }} className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${isPasswordModalOpen ? 'bg-[#974F23] text-white' : 'bg-gray-200 text-gray-600'}`}><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg></div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">{t('profile_page.security')}</h3>
                                                    <p className="text-[10px] sm:text-xs font-medium text-gray-500 mt-0.5">{t('profile_page.change_pwd')}</p>
                                                </div>
                                            </div>
                                            <svg className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-400 transition-transform duration-300 ${isPasswordModalOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </button>

                                        <div className={`transition-all duration-500 ease-in-out origin-top ${isPasswordModalOpen ? 'max-h-[500px] opacity-100 p-4 sm:p-5 pt-0 border-t border-gray-200' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                            {passwordError && (
                                                <div className="mb-4 mt-4 bg-red-100 border border-red-200 text-red-600 px-3 py-2 sm:px-4 sm:py-3 rounded-xl text-[11px] sm:text-sm font-semibold text-center flex items-center gap-2 leading-tight">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                    {passwordError}
                                                </div>
                                            )}

                                            <form onSubmit={handlePasswordChange} className="space-y-3 sm:space-y-4 mt-4 relative">
                                                <div className="relative">
                                                    <input type={showOldPassword ? "text" : "password"} required placeholder={t('profile_page.old_pwd')} value={passwordData.oldPassword} onChange={(e) => { setPasswordData({...passwordData, oldPassword: e.target.value}); setPasswordError(''); if (pwdErrorTimerRef.current) clearTimeout(pwdErrorTimerRef.current); }} className={`w-full bg-white border rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 outline-none transition-all font-medium text-sm sm:text-base pr-10 ${passwordError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-[#974F23] focus:ring-2 focus:ring-[#974F23]/20'}`} />
                                                    {passwordData.oldPassword.length > 0 && (
                                                        <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#974F23]">
                                                            {showOldPassword ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
                                                        </button>
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="relative">
                                                        <input type={showNewPassword ? "text" : "password"} required placeholder={t('profile_page.new_pwd')} value={passwordData.newPassword} onChange={(e) => { setPasswordData({...passwordData, newPassword: e.target.value}); setPasswordError(''); if (pwdErrorTimerRef.current) clearTimeout(pwdErrorTimerRef.current); }} className={`w-full bg-white border rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 outline-none transition-all font-medium text-sm sm:text-base pr-10 ${passwordError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-[#974F23] focus:ring-2 focus:ring-[#974F23]/20'}`} />
                                                        {passwordData.newPassword.length > 0 && (
                                                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#974F23]">
                                                                {showNewPassword ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
                                                            </button>
                                                        )}
                                                    </div>

                                                    {passwordData.newPassword && (
                                                        <div className="mt-2 px-1">
                                                            <div className="flex gap-1 h-1.5">
                                                                {[1, 2, 3, 4, 5].map(level => (
                                                                    <div key={level} className={`w-full rounded-full transition-colors duration-300 ${pwdStrength >= level ? strengthColors[pwdStrength] : 'bg-gray-200'}`} />
                                                                ))}
                                                            </div>
                                                            <div className="flex justify-between items-center mt-1">
                                                                <span className={`text-[10px] ${strengthColors[pwdStrength].replace('bg-', 'text-')}`}>{strengthLabels[pwdStrength]}</span>
                                                            </div>
                                                            <ul className="text-[10px] text-gray-500 mt-1 grid grid-cols-2 gap-1 font-['Inter']">
                                                                {passwordData.newPassword.length < 8 && (<li><span className="text-gray-400 mr-1">○</span>{t('profile_page.pwd_req_length')}</li>)}
                                                                {!/[A-ZА-ЯІЇЄҐ]/.test(passwordData.newPassword) && (<li><span className="text-gray-400 mr-1">○</span>{t('profile_page.pwd_req_upper')}</li>)}
                                                                {!/[0-9]/.test(passwordData.newPassword) && (<li><span className="text-gray-400 mr-1">○</span>{t('profile_page.pwd_req_number')}</li>)}
                                                                {!/[^A-Za-z0-9А-Яа-яІіЇїЄєҐґ]/.test(passwordData.newPassword) && (<li><span className="text-gray-400 mr-1">○</span>{t('profile_page.pwd_req_special')}</li>)}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="relative">
                                                    <input type={showConfirmPassword ? "text" : "password"} required placeholder={t('profile_page.confirm_pwd')} value={passwordData.newPasswordConfirm} onChange={(e) => { setPasswordData({...passwordData, newPasswordConfirm: e.target.value}); setPasswordError(''); if (pwdErrorTimerRef.current) clearTimeout(pwdErrorTimerRef.current); }} className={`w-full bg-white border rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 outline-none transition-all font-medium text-sm sm:text-base pr-10 ${passwordError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-[#974F23] focus:ring-2 focus:ring-[#974F23]/20'}`} />
                                                    {passwordData.newPasswordConfirm.length > 0 && (
                                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#974F23]">
                                                            {showConfirmPassword ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
                                                        </button>
                                                    )}
                                                </div>

                                                <button type="submit" className="w-full bg-[#974F23] text-white py-2.5 sm:py-3 rounded-xl font-bold hover:bg-[#7a3e1a] transition-colors shadow-md active:scale-95 duration-200 cursor-pointer text-sm sm:text-base mt-2">
                                                    {t('profile_page.update_pwd_btn')}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 sm:px-8 pb-8 pt-2 relative z-10">
                                <button onClick={handleNameSave} className="w-full relative overflow-hidden bg-[#1A1A1A] text-white py-3.5 sm:py-4 rounded-[1.5rem] font-bold text-base sm:text-lg hover:bg-black transition-all shadow-xl active:scale-95 duration-200 group cursor-pointer">
                                    <span className="relative z-10">{t('profile_page.save_changes')}</span>
                                    <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= МОДАЛКА ПІДТВЕРДЖЕННЯ ВИДАЛЕННЯ АВАТАРА ================= */}
                {isDeleteAvatarModalOpen && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300" onClick={() => setIsDeleteAvatarModalOpen(false)}>
                        <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 flex flex-col items-center text-center relative animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner text-red-500">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </div>
                            <h3 className="text-2xl font-bold font-['El_Messiri'] text-gray-900 mb-2">{t('profile_page.delete_avatar_title')}</h3>
                            <p className="text-gray-500 font-medium mb-8">{t('profile_page.delete_avatar_desc')}</p>
                            <div className="flex gap-4 w-full">
                                <button onClick={() => setIsDeleteAvatarModalOpen(false)} className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-colors cursor-pointer">{t('profile_page.cancel')}</button>
                                <button onClick={async () => {
                                    try {
                                        const res = await api.patch('/api/auth/user/', { avatar: null });
                                        const updatedUser = { ...res.data };
                                        updatedUser.avatar = null;
                                        setUserData(updatedUser);
                                        dispatchUserUpdate(updatedUser);
                                        setIsDeleteAvatarModalOpen(false);
                                        showToast(t('profile_page.toast_avatar_deleted'));
                                    } catch (err) {
                                        showToast(t('profile_page.toast_err_avatar_delete'));
                                    }
                                }} className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-bold hover:bg-red-600 transition-colors cursor-pointer shadow-md">{t('profile_page.delete_btn')}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= МОДАЛКА КУХНІ ================= */}
                {isCuisineModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex flex-col justify-start items-center p-4 pt-24 sm:p-4 sm:pt-24 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsCuisineModalOpen(false)}>
                        <div className="bg-[#F6F3F4] w-full sm:max-w-4xl max-h-[85vh] flex flex-col rounded-3xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-[slideDown_0.4s_ease-out] sm:animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                            <div className="p-5 sm:p-8 border-b border-gray-200 bg-white flex justify-between items-start sm:items-center z-10 shrink-0">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold font-['El_Messiri'] text-gray-900 leading-tight">{t('profile_page.cuisine_title')}</h2>
                                        {safeCuisines.length > 0 && (
                                            <button onClick={clearAllCuisines} className="hidden sm:flex text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95">{t('profile_page.clear_all')}</button>
                                        )}
                                    </div>
                                    <p className="text-gray-500 font-medium font-['Inter'] text-sm sm:text-base">{t('profile_page.cuisine_desc')}</p>
                                    {safeCuisines.length > 0 && (
                                        <button onClick={clearAllCuisines} className="sm:hidden mt-3 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95 inline-block">{t('profile_page.clear_all_count', { count: safeCuisines.length })}</button>
                                    )}
                                </div>
                                <button onClick={() => setIsCuisineModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-red-500 rounded-full transition-all cursor-pointer shrink-0 ml-4"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                            </div>

                            <div className="overflow-y-auto custom-scrollbar p-5 sm:p-8 flex-1">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                                    {Object.keys(DICTIONARIES.cuisine).map(cuisineKey => {
                                        const isSelected = safeCuisines.includes(cuisineKey);
                                        return (
                                            <div key={cuisineKey} onClick={() => {
                                                if (isSelected) { removeCuisine(cuisineKey); } else { api.patch('/api/auth/user/', { favorite_cuisines: [...safeCuisines, cuisineKey] }).then(res => { setUserData(res.data); dispatchUserUpdate(res.data); }); }
                                            }} className={`relative flex flex-col group cursor-pointer rounded-2xl overflow-hidden shadow-sm transition-all duration-200 border-2 ${isSelected ? 'border-[#6A907B] shadow-md scale-95 bg-[#F0F5ED]' : 'border-transparent hover:border-gray-200 hover:shadow-md bg-white'}`}>
                                                <div className={`h-20 sm:h-24 w-full relative flex items-center justify-center p-4 transition-colors ${isSelected ? 'bg-[#E3ECD9]' : 'bg-gray-50 group-hover:bg-gray-100'}`}>
                                                    <img src={CUISINE_IMAGES[cuisineKey]} alt="" className="w-12 h-12 sm:w-16 sm:h-16 object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-sm" />
                                                    {isSelected && (<div className="absolute top-2 right-2 w-5 h-5 bg-[#6A907B] rounded-full flex items-center justify-center text-white shadow-sm z-10"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg></div>)}
                                                </div>
                                                <div className="p-2 sm:p-3 text-center flex-grow flex items-center justify-center">
                                                    <span className={`font-semibold font-['Inter'] text-xs sm:text-sm ${isSelected ? 'text-[#42705D]' : 'text-gray-800'}`}>{DICTIONARIES.cuisine[cuisineKey]}</span>
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
                    <div className="fixed inset-0 z-[9999] flex flex-col justify-start items-center p-4 pt-24 sm:p-4 sm:pt-32 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsAllergyModalOpen(false)}>
                        <div className="bg-[#F6F3F4] w-full sm:max-w-3xl max-h-[85vh] flex flex-col rounded-3xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-[slideDown_0.4s_ease-out] sm:animate-scaleIn shrink-0" onClick={(e) => e.stopPropagation()}>
                            <div className="p-5 sm:p-8 pb-4 border-b border-gray-200 bg-white z-10 shrink-0">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-1">
                                            <h2 className="text-2xl sm:text-3xl font-bold font-['El_Messiri'] text-gray-900 leading-tight">{t('profile_page.allergy_title')}</h2>
                                            {safeAllergies.length > 0 && (<button onClick={clearAllAllergies} className="hidden sm:flex text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95">{t('profile_page.clear_all')}</button>)}
                                        </div>
                                        <p className="text-gray-500 font-medium font-['Inter'] text-sm sm:text-base">{t('profile_page.allergy_desc')}</p>
                                        {safeAllergies.length > 0 && (<button onClick={clearAllAllergies} className="sm:hidden mt-3 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95 inline-block">{t('profile_page.clear_all_count', { count: safeAllergies.length })}</button>)}
                                    </div>
                                    <button onClick={() => setIsAllergyModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-red-500 rounded-full transition-all cursor-pointer shrink-0 ml-4"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div>
                                    <input type="text" placeholder={t('profile_page.allergy_search_placeholder')} value={allergySearch} onChange={(e) => setAllergySearch(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3 sm:py-4 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all text-gray-800 font-medium" autoFocus />
                                </div>
                                {safeAllergies.length > 0 && (
                                    <div className="mt-5 pt-5 border-t border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('profile_page.already_selected')}</p>
                                        <div className="flex flex-wrap gap-2.5">
                                            {safeAllergies.map(id => {
                                                const ing = getIngredientData(id);
                                                return (
                                                    <div key={id} className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full pl-1.5 pr-2 py-1.5 shadow-sm group">
                                                        <div className="w-7 h-7 rounded-full bg-white overflow-hidden border border-red-100 shrink-0 flex items-center justify-center">
                                                            {ing?.image ? (<img src={getImageUrl(ing.image)} alt={ing.name} className="w-full h-full object-cover" />) : (<svg className="w-3.5 h-3.5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>)}
                                                        </div>
                                                        <span className="font-medium text-red-900 text-sm">{ing ? ing.name : '...'}</span>
                                                        <button onClick={() => removeAllergy(id)} className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors ml-1 cursor-pointer active:scale-90"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="overflow-y-auto custom-scrollbar bg-white flex-1 p-2 sm:p-4">
                                {allergySearch.trim() === '' ? (
                                    <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 rounded-2xl m-2 border border-gray-100 border-dashed">
                                        <div className="w-20 h-20 mb-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100"><svg className="w-10 h-10 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-1 font-['El_Messiri']">{t('profile_page.allergy_empty_title')}</h3>
                                        <p className="font-medium text-gray-500 text-sm max-w-xs font-['Inter']">{t('profile_page.allergy_empty_desc')}</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {availableAllergies.filter(i => i.name.toLowerCase().includes(allergySearch.toLowerCase()) && !safeAllergies.includes(i.id)).slice(0, 50).map(ing => (
                                            <div key={ing.id} onClick={() => { addAllergyById(ing.id); setAllergySearch(''); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100 cursor-pointer transition-colors group">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                                    {ing.image ? (<img src={getImageUrl(ing.image)} alt={ing.name} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center text-gray-300"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>)}
                                                </div>
                                                <span className="font-semibold text-gray-800 group-hover:text-red-700 flex-1">{ing.name}</span>
                                                <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-red-200 flex items-center justify-center text-gray-400 group-hover:text-red-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg></div>
                                            </div>
                                        ))}
                                        {availableAllergies.filter(i => i.name.toLowerCase().includes(allergySearch.toLowerCase()) && !safeAllergies.includes(i.id)).length === 0 && (
                                            <div className="col-span-full p-12 text-center flex flex-col items-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3"><svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                                                <p className="text-gray-500 font-medium font-['Inter'] text-sm">{t('profile_page.ing_not_found')}</p>
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
                    <div className="fixed inset-0 z-[9999] flex flex-col justify-start items-center p-4 pt-24 sm:p-4 sm:pt-32 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsDietModalOpen(false)}>
                        <div className="bg-[#F6F3F4] w-full sm:max-w-4xl max-h-[85vh] flex flex-col rounded-3xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-[slideDown_0.4s_ease-out] sm:animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                            <div className="p-5 sm:p-8 border-b border-gray-200 bg-white flex justify-between items-start sm:items-center z-10 shrink-0">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold font-['El_Messiri'] text-gray-900 leading-tight">{t('profile_page.diet_title')}</h2>
                                        {safeDiets.length > 0 && (<button onClick={clearAllDiets} className="hidden sm:flex text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95">{t('profile_page.clear_all')}</button>)}
                                    </div>
                                    <p className="text-gray-500 font-medium font-['Inter'] text-sm sm:text-base">{t('profile_page.diet_desc')}</p>
                                    {safeDiets.length > 0 && (<button onClick={clearAllDiets} className="sm:hidden mt-3 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95 inline-block">{t('profile_page.clear_all_count', { count: safeDiets.length })}</button>)}
                                </div>
                                <button onClick={() => setIsDietModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-red-500 rounded-full transition-all cursor-pointer shrink-0 ml-4"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                            </div>
                            <div className="overflow-y-auto custom-scrollbar p-5 sm:p-8 flex-1">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                                    {Object.keys(DICTIONARIES.profile_dietary_tags).map(dietKey => {
                                        const isSelected = safeDiets.includes(dietKey);
                                        return (
                                            <div key={dietKey} onClick={() => {
                                                if (isSelected) { removeDiet(dietKey); } else { api.patch('/api/auth/user/', { dietary_preferences: [...safeDiets, dietKey] }).then(res => { setUserData(res.data); dispatchUserUpdate(res.data); }); }
                                            }} className={`relative flex flex-col group cursor-pointer rounded-2xl overflow-hidden shadow-sm transition-all duration-200 border-2 ${isSelected ? 'border-blue-400 shadow-md scale-95 bg-blue-50' : 'border-transparent hover:border-gray-200 hover:shadow-md bg-white'}`}>
                                                <div className={`h-20 sm:h-24 w-full relative flex items-center justify-center p-4 transition-colors ${isSelected ? 'bg-blue-100' : 'bg-gray-50 group-hover:bg-gray-100'}`}>
                                                    <img src={DIET_IMAGES[dietKey]} alt="" className="w-12 h-12 sm:w-16 sm:h-16 object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-sm" />
                                                    {isSelected && (<div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-sm z-10"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg></div>)}
                                                </div>
                                                <div className="p-2 sm:p-3 text-center flex-grow flex items-center justify-center">
                                                    <span className={`font-semibold font-['Inter'] text-xs sm:text-sm ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>{DICTIONARIES.profile_dietary_tags[dietKey]}</span>
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
                    <div className="fixed inset-0 z-[9999] flex flex-col justify-start items-center p-4 pt-24 sm:p-4 sm:pt-32 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onClick={() => { setIsInventoryModalOpen(false); resetInventoryForm(); }}>
                        <div className="bg-[#F6F3F4] w-full sm:max-w-4xl max-h-[85vh] flex flex-col rounded-3xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-[slideDown_0.4s_ease-out] sm:animate-scaleIn shrink-0" onClick={(e) => e.stopPropagation()}>
                            <div className="p-4 sm:p-8 pb-4 border-b border-gray-200 bg-white z-20 shrink-0 relative">
                                <div className="flex justify-between items-start sm:items-center mb-4 sm:mb-6">
                                    <div className="flex items-start sm:items-center gap-3 flex-1">
                                        <div className="w-12 h-12 bg-cyan-50 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                                            <img src={fridgeIcon} alt="Холодильник" className="w-8 h-8 object-contain" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-1">
                                                <h2 className="text-2xl sm:text-3xl font-bold font-['El_Messiri'] text-gray-900 leading-tight">{t('profile_page.inv_title')}</h2>
                                                {safeInventory.length > 0 && (<button onClick={clearAllInventory} className="hidden sm:flex text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95">{t('profile_page.clear_all')}</button>)}
                                            </div>
                                            <p className="hidden sm:block text-gray-500 font-medium font-['Inter'] text-sm sm:text-base">{t('profile_page.inv_desc')}</p>
                                            {safeInventory.length > 0 && (<button onClick={clearAllInventory} className="sm:hidden mt-1 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95 inline-block">{t('profile_page.clear_all_count', { count: safeInventory.length })}</button>)}
                                        </div>
                                    </div>
                                    <button onClick={() => { setIsInventoryModalOpen(false); resetInventoryForm(); }} className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-500 rounded-full transition-all cursor-pointer shrink-0 ml-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                                </div>

                                <div ref={addFridgeWrapperRef} className="flex flex-col gap-3 w-full relative z-30 mb-2">
                                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 bg-gray-50 border border-gray-200 p-2 md:pl-4 rounded-2xl w-full focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-100 transition-all relative">
                                        <div className="flex items-center gap-2 w-full md:flex-1 relative">
                                            <svg className="w-5 h-5 text-gray-400 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                            <input type="text" placeholder={t('profile_page.inv_search_placeholder')} value={fridgeSearch} onChange={(e) => { setFridgeSearch(e.target.value); setIsFridgeDropdownOpen(true); setNewFridgeItem({...newFridgeItem, ingredient: ''}); }} onFocus={() => setIsFridgeDropdownOpen(true)} className="w-full bg-transparent outline-none text-gray-800 font-medium py-2 px-2 sm:px-0 pr-8" />
                                            {fridgeSearch && (<button onClick={() => { setFridgeSearch(''); setNewFridgeItem({ ingredient: '', amount: '', unit: 'g' }); setIsFridgeDropdownOpen(false); if (editingInventoryId) { resetInventoryForm(); } }} className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer active:scale-95"><svg className="w-4 h-4 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button>)}
                                        </div>
                                        <div className="hidden md:block h-8 w-px bg-gray-300 mx-2"></div>
                                        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 border-t border-gray-200 md:border-t-0 pt-2 md:pt-0">
                                            <input type="number" min="0" step="0.1" placeholder={t('profile_page.inv_amount_placeholder')} value={newFridgeItem.amount} onChange={(e) => { let val = e.target.value; if (val === '' || /^[0-9]*[.,]?[0-9]{0,1}$/.test(val)) { setNewFridgeItem({...newFridgeItem, amount: val.replace(',', '.')}); } }} className="w-1/2 md:w-24 bg-transparent outline-none text-gray-800 font-bold text-center py-2 border-b-2 border-gray-300 md:border-transparent focus:border-cyan-400 transition-colors placeholder:font-normal" />
                                            <select value={newFridgeItem.unit} onChange={(e) => setNewFridgeItem({...newFridgeItem, unit: e.target.value})} className="w-1/2 md:w-28 bg-transparent outline-none text-gray-800 font-semibold py-2 cursor-pointer border-b-2 border-gray-300 md:border-transparent focus:border-cyan-400">
                                                {(() => {
                                                    const selectedIng = availableFridgeIngredients.find(i => i.id === newFridgeItem.ingredient);
                                                    let allowedUnits = ['g'];
                                                    if (selectedIng) {
                                                        const ingNameLower = selectedIng.name.toLowerCase();
                                                        if (EXACT_UNIT_MATCH[ingNameLower]) {
                                                            allowedUnits = EXACT_UNIT_MATCH[ingNameLower];
                                                        } else {
                                                            allowedUnits = CATEGORY_UNIT_MAP[selectedIng.category] || ['g'];
                                                        }
                                                    } else { allowedUnits = Object.keys(DICTIONARIES.units); }
                                                    return allowedUnits.map(key => (<option key={key} value={key}>{Array.isArray(DICTIONARIES.units[key]) ? DICTIONARIES.units[key][0] : DICTIONARIES.units[key]}</option>));
                                                })()}
                                            </select>
                                        </div>
                                        {isFridgeDropdownOpen && fridgeSearch && (
                                            <ul className="absolute top-[105%] left-0 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-48 sm:max-h-60 overflow-y-auto py-2 z-50">
                                                {availableFridgeIngredients.filter(i => i.name.toLowerCase().includes(fridgeSearch.toLowerCase())).slice(0, 20).map(ing => (
                                                        <li key={ing.id} onClick={() => handleSelectFridgeIngredient(ing)} className="flex items-center gap-3 px-4 py-3 hover:bg-cyan-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-gray-100">{ing.image ? <img src={getImageUrl(ing.image)} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">•</div>}</div>
                                                            <span className="font-semibold text-gray-800">{ing.name}</span>
                                                        </li>
                                                ))}
                                                {availableFridgeIngredients.filter(i => i.name.toLowerCase().includes(fridgeSearch.toLowerCase())).length === 0 && (
                                                    <li className="px-4 py-3 text-gray-500 text-sm text-center">{t('profile_page.ing_not_found')}</li>
                                                )}
                                            </ul>
                                        )}
                                    </div>

                                    {inventoryMessage && (
                                        <div className={`w-full p-3 rounded-2xl flex items-start gap-3 animate-fadeIn border ${inventoryMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-teal-50 border-teal-200 text-teal-800'}`}>
                                            {inventoryMessage.type === 'error' ? (<div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0"><svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></div>) : (<div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0"><svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg></div>)}
                                            <p className="font-medium text-[14px] leading-snug pt-1">{inventoryMessage.text}</p>
                                        </div>
                                    )}

                                    <div className="flex justify-center gap-2 w-full">
                                        <button onClick={addFridgeItem} disabled={!newFridgeItem.ingredient || (!newFridgeItem.amount && newFridgeItem.unit !== 'taste')} className={`flex-1 md:flex-none md:w-88 py-3 rounded-2xl text-[15px] font-bold text-gray-900 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 ${editingInventoryId ? 'bg-[#E5D48B] hover:bg-[#D4C37A]' : 'bg-[#CCFBF1] hover:bg-[#a6f7e9]'}`}>
                                            {editingInventoryId ? t('profile_page.inv_update_btn') : t('profile_page.inv_add_btn')}
                                        </button>
                                        {editingInventoryId && (
                                            <button onClick={resetInventoryForm} className="flex-1 md:flex-none md:w-32 py-3 bg-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-300 transition-all cursor-pointer active:scale-95">{t('profile_page.cancel')}</button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-y-auto custom-scrollbar bg-gray-50 flex-1 p-4 sm:p-6 relative z-0">
                                {safeInventory.length === 0 ? (
                                    <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-gray-100 border-dashed m-2">
                                        <img src={fridgeIcon} alt="Порожньо" className="w-16 h-16 opacity-20 mb-4 grayscale" />
                                        <h3 className="text-lg font-bold text-gray-800 mb-1 font-['El_Messiri']">{t('profile_page.inv_empty_title')}</h3>
                                        <p className="font-medium text-gray-500 text-sm max-w-xs font-['Inter']">{t('profile_page.inv_empty_desc')}</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                        {safeInventory.map(item => (
                                            <div key={item.id} className={`flex items-center gap-4 bg-white border rounded-2xl p-3 shadow-sm transition-all group ${editingInventoryId === item.id ? 'border-cyan-400 ring-2 ring-cyan-50 scale-[1.02]' : 'border-gray-200 hover:border-cyan-200'}`}>
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                                                    {item.ingredient_image ? (<img src={getImageUrl(item.ingredient_image)} className="w-full h-full object-cover" alt="" />) : (<div className="w-full h-full flex items-center justify-center text-gray-300"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-900 text-[14px] sm:text-base truncate" title={item.ingredient_name}>{item.ingredient_name}</h4>
                                                    <span className="inline-block mt-1 text-cyan-800 font-bold text-xs sm:text-sm bg-cyan-100/50 px-2 py-0.5 rounded-lg border border-cyan-100/50">
                                                        {item.amount ? `${formatDisplayAmount(item.amount, item.unit)} ` : ''}
                                                        {DICTIONARIES.units[item.unit] ? (Array.isArray(DICTIONARIES.units[item.unit]) ? DICTIONARIES.units[item.unit][0] : DICTIONARIES.units[item.unit]) : item.unit}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                                    <button onClick={() => { setEditingInventoryId(item.id); setFridgeSearch(item.ingredient_name); setNewFridgeItem({ ingredient: item.ingredient, amount: item.amount, unit: item.unit }); if (addFridgeWrapperRef.current) { addFridgeWrapperRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' }); } }} className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer active:scale-90 ${editingInventoryId === item.id ? 'bg-[#E5D48B] text-gray-900' : 'bg-gray-50 text-gray-400 hover:bg-yellow-100 hover:text-yellow-700'}`} title={t('profile_page.inv_edit_tooltip')}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                                                    <button onClick={() => removeFridgeItem(item.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer active:scale-90" title={t('profile_page.inv_delete_tooltip')}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
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