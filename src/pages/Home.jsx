import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { ENDPOINTS, API_URL, TOKEN_KEY } from '../constants/api';
import { DICTIONARIES } from '../constants/translations';

// Імпортуємо зображення
import topBg from '../assets/home/top-bg.jpg';
import bottomBg from '../assets/home/bottom-bg.jpg';
import logo from '../assets/global/logo.png';
import iconLocation from '../assets/home/icon-location.png';
import iconSun from '../assets/home/icon-sun.png';
import iconLeaf from '../assets/home/icon-leaf.png';

// Допоміжна функція для відмінювання (хвилина/хвилини)
const getPluralForm = (number, titles) => {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return titles[2];
    if (n1 > 1 && n1 < 5) return titles[1];
    if (n1 === 1) return titles[0];
    return titles[2];
};

const Home = () => {
    const navigate = useNavigate();
    const [recipeOfDay, setRecipeOfDay] = useState(null);
    const [loading, setLoading] = useState(true);

    // Перевірка чи користувач авторизований
    const isAuthenticated = !!localStorage.getItem(TOKEN_KEY) || !!sessionStorage.getItem(TOKEN_KEY);

    useEffect(() => {
        fetchRecipeOfTheDay();
    }, []);

    const fetchRecipeOfTheDay = async () => {
        setLoading(true);
        try {
            // ЗМІНЕНО: Прибрано локальне кешування, тепер завжди беремо актуальні дані з бекенду.
            // Якщо ви зміните рецепт в адмінці, фронтенд побачить це при оновленні сторінки.
            const response = await api.get(`${ENDPOINTS.RECIPES}random_recipe/`);
            setRecipeOfDay(response.data);
        } catch (error) {
            console.error("Помилка завантаження рецепту дня:", error);
        } finally {
            setLoading(false);
        }
    };

// функція з кешуванням і отриманням з локалсторідж
//     const fetchRecipeOfTheDay = async () => {
//         // Отримуємо поточну дату у форматі YYYY-MM-DD
//         const today = new Date().toLocaleDateString('en-CA');
//         const cachedDate = localStorage.getItem('recipe_of_day_date');
//         const cachedRecipe = localStorage.getItem('recipe_of_day_data');
//
//         // Якщо сьогоднішній рецепт вже є в кеші — використовуємо його
//         if (cachedDate === today && cachedRecipe) {
//             setRecipeOfDay(JSON.parse(cachedRecipe));
//             setLoading(false);
//             return;
//         }
//
//         // Якщо новий день або кеш порожній — йдемо на бекенд за новим рандомним
//         try {
//             const response = await api.get(`${ENDPOINTS.RECIPES}random_recipe/`);
//             setRecipeOfDay(response.data);
//
//             // Зберігаємо новий рецепт та сьогоднішню дату в пам'ять
//             localStorage.setItem('recipe_of_day_date', today);
//             localStorage.setItem('recipe_of_day_data', JSON.stringify(response.data));
//         } catch (error) {
//             console.error("Помилка завантаження рецепту дня:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${API_URL}${path}`;
    };

    return (
        <div className="w-full min-h-screen font-sans bg-[#F6F3F4] flex flex-col">

            {/* ================= ВЕРХНІЙ БЛОК З АВОКАДО ================= */}
            <div
                className="relative w-full min-h-[60vh] md:min-h-[75vh] lg:min-h-[95vh] bg-cover flex items-center overflow-hidden pt-[140px] md:pt-[180px] lg:pt-[220px] xl:pt-[260px] pb-[100px] md:pb-[140px] lg:pb-[180px]"
                style={{
                    backgroundImage: `url(${topBg})`,
                    backgroundPosition: 'center top 100%'
                }}
            >
                {/* Легке затемнення фону для кращого читання тексту */}
                <div className="absolute inset-0 md:bg-transparent"></div>
                {/* ЛОГОТИП*/}
                <div className="absolute top-15 md:top-21 left-1/2 -translate-x-1/2 md:left-auto md:right-10 lg:right-20 xl:right-48 md:translate-x-0 z-20">
                    <img
                        src={logo}
                        alt="LITE cook"
                        className="h-24 md:h-30 lg:h-34 mix-blend-multiply"
                    />
                </div>

                {/* КОНТЕЙНЕР ТЕКСТУ */}
                <div className="relative z-10 w-full px-6 lg:px-20 xl:px-55 flex justify-center md:justify-end mt-20 md:mt-40 lg:mt-32 xl:mt-1 transition-all">

                    {/* Класи bg-white/40 backdrop-blur-md створюють матове скло. */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-4xl lg:max-w-3xl xl:max-w-4xl lg:mr-0 xl:mr-12 bg-white/70 min-[1600px]:bg-transparent backdrop-blur-md min-[1600px]:backdrop-blur-none p-6 sm:p-8 xl:p-2 rounded-[2rem] transition-all duration-500">

                        <h2 className="text-[#8B0021] text-xl md:text-2xl lg:text-[45px] font-['El_Messiri'] mb-3 lg:mb-5 leading-tight drop-shadow-sm">
                            Твій особистий шеф-кухар
                        </h2>
                        <h1 className="text-6xl md:text-7xl lg:text-[90px] font-['El_Messiri'] text-[#1A1A1A] mb-3 lg:mb-6 tracking-wide drop-shadow-sm leading-none">
                            LITE cook
                        </h1>
                        <p className="text-gray-800 text-lg md:text-xl lg:text-[45px] font-['El_Messiri'] mb-8 lg:mb-12 whitespace-nowrap leading-tight drop-shadow-sm">
                            Готує із того, що є вдома
                        </p>

                        <Link
                            to="/recipes"
                            className="px-8 py-3 bg-white/50 lg:bg-transparent border lg:text-[20px] border-black rounded-[30px] font-['Inter'] hover:bg-white/80 transition-colors shadow-sm"
                        >
                            Підібрати рецепт
                        </Link>

                    </div>
                </div>
            </div>

            {/* ================= ОБ'ЄДНАНИЙ НИЖНІЙ БЛОК (ФОН + КАРТКИ + РЕЦЕПТ ДНЯ) ================= */}
            <div
                className="relative w-full bg-cover flex flex-col"
                style={{
                    backgroundImage: `url(${bottomBg})`,
                    backgroundPosition: 'center bottom 100%'
                }}
            >
                {/* Світле перекриття (градієнт), щоб текст і картки добре читалися */}
                <div className="absolute inset-0 bg-gradient-to-b "></div>

                {/* ================= БЛОК КАРТОК ПОСЕРЕДИНІ (OVERLAPPING) ================= */}
                <div className="relative z-20 w-full px-4 sm:px-6 lg:px-20 -mt-9 sm:-mt-17 lg:-mt-25 mb-16 lg:mb-20 font-['Inter']">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 max-w-[1400px] mx-auto">

                        {/* Картка 1: Веде на сторінку "Про нас" (/about) */}
                        <Link to="/about" className="bg-[#F6F3F4] backdrop-blur-md rounded-2xl px-6 py-10 sm:px-8 sm:py-10 flex flex-col items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.08)] transform hover:-translate-y-1 transition-transform">
                            <div className="w-12 h-12 mb-4 flex items-center justify-center">
                                <img src={iconLocation} alt="Готує із того, що є вдома" className="w-14 h-14 object-contain drop-shadow-sm" />
                            </div>
                            <h3 className="font-bold text-[#1A1A1A] text-xl">Готує із того, що є в холодильнику</h3>
                            <p className="text-lg text-gray-800">Рецепти під твій запит та смак</p>
                        </Link>

                        {/* Картка 2: Веде на сторінку "Підбір рецепта" (/recipes) */}
                        <Link to="/recipes" className="bg-[#F6F3F4] backdrop-blur-md rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.08)] transform hover:-translate-y-1 transition-transform">
                            <div className="w-12 h-12 mb-4 flex items-center justify-center">
                                <img src={iconSun} alt="Прості інгредієнти" className="w-14 h-14 object-contain drop-shadow-sm" />
                            </div>
                            <h3 className="font-bold text-[#1A1A1A] text-xl">Прості інгредієнти</h3>
                            <p className="text-lg text-gray-800 ">Страви з сезонних продуктів</p>
                        </Link>

                        {/* Картка 3: Веде на сторінку "Вхід" (/login) */}
                        <Link
                            to={isAuthenticated ? "/menu" : "/login"}
                            className="bg-[#F6F3F4] backdrop-blur-md rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.08)] transform hover:-translate-y-1 transition-transform"
                        >
                            <div className="w-12 h-12 mb-4 flex items-center justify-center">
                                <img src={iconLeaf} alt="Швидко та легко" className="w-14 h-14 object-contain drop-shadow-sm" />
                            </div>
                            <h3 className="font-bold text-[#1A1A1A] text-xl">Швидко та легко</h3>
                            <p className="text-lg text-gray-800 ">Смачне та корисне меню</p>
                        </Link>

                    </div>
                </div>

                {/* ================= РЕЦЕПТ ДНЯ ================= */}
                <div className="relative z-10 w-full px-4 sm:px-6 lg:px-38 max-w-[1400px] flex flex-col pb-24 lg:pb-48 -mt-2 lg:-mt-2">

                    <div className="border-t-2 border-gray-500 w-full mb-7"></div>

                    <div className="flex items-center justify-center md:justify-start gap-3 mb-6 text-[#2B4B3C] lg:-ml-13">
                        <svg className="w-10 h-10 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        <h3 className="text-xl md:text-3xl font-['El_Messiri'] font-bold">Рецепт дня</h3>
                    </div>

                    {/* Картка Рецепту Дня */}
                    {loading ? (
                         <div className="flex justify-center items-center py-20">
                             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#42705D]"></div>
                         </div>
                    ) : recipeOfDay ? (
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-16 w-full max-w-7xl mr-auto mb-10">

                            {/* фото */}
                            <div className="w-[90%] sm:w-[400px] h-64 md:w-80 md:h-80 lg:w-[390px] lg:h-[270px] shrink-0 mx-auto md:mx-0 md:ml-4 lg:ml-10 mt-1 rounded-3xl overflow-hidden shadow-lg bg-white">
                                <Link to={`/recipe/${recipeOfDay.id}`} className="block w-full h-full">
                                    <img
                                        src={getImageUrl(recipeOfDay.image)}
                                        alt={recipeOfDay.title}
                                        className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-110"
                                    />
                                </Link>
                            </div>

                            {/* Інформація про рецепт */}
                            <div className="flex flex-col text-center md:text-left mt-0 bg-white/70 min-[1700px]:bg-transparent backdrop-blur-md min-[1700px]:backdrop-blur-none p-6 md:p-8 xl:p-2 rounded-[2rem] flex-1 w-full transition-all duration-500">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-['El_Messiri'] text-[#1A1A1A] mb-4 mt-2">
                                    <Link to={`/recipe/${recipeOfDay.id}`} className="hover:text-[#42705D] transition-colors">
                                        {recipeOfDay.title}
                                    </Link>
                                </h2>

                                {/* Іконки статистики */}
                                <div className="flex flex-wrap justify-center md:justify-start gap-6 lg:gap-10 mb-5 font-['El_Messiri']">

                                    {/* Час приготування */}
                                    <div className="flex flex-col items-center gap-2">
                                        <svg className="w-20 h-10 text-[#B47231]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"></path>
                                        </svg>
                                        <span className="text-sm lg:text-[18px] text-black">
                                            {recipeOfDay.cooking_time} {getPluralForm(recipeOfDay.cooking_time, ['хвилина', 'хвилини', 'хвилин'])}
                                        </span>
                                    </div>

                                    {/* Порції */}
                                    <div className="flex flex-col items-center gap-2">
                                        <svg className="w-20 h-10 text-[#B47231]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v3M12 3v3M16 3v3"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h14v5a4 4 0 01-4 4H8a4 4 0 01-4-4v-5z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 10h1a2 2 0 012 2v1a2 2 0 01-2 2h-1"></path>
                                        </svg>
                                        <span className="text-sm lg:text-[18px] font-semibold text-black">
                                            {recipeOfDay.portions} {getPluralForm(recipeOfDay.portions, ['порція', 'порції', 'порцій'])}
                                        </span>
                                    </div>

                                    {/* Калорії */}
                                    <div className="flex flex-col items-center gap-2">
                                        <svg className="w-20 h-10 text-[#B47231]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                                        </svg>
                                        <span className="text-sm lg:text-base font-semibold text-black">
                                            {recipeOfDay.calories} ккал / порція
                                        </span>
                                    </div>

                                    {/* Складність */}
                                    <div className="flex flex-col items-center gap-2">
                                        <svg className="w-20 h-10 text-[#B47231]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="5"></circle>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
                                        </svg>
                                        <span className="text-sm lg:text-[18px] font-semibold text-black capitalize">
                                            {DICTIONARIES.difficulty[recipeOfDay.difficulty] || recipeOfDay.difficulty}
                                        </span>
                                    </div>

                                </div>

                                <p className="text-[#1A1A1A] italic font-['Inter'] mb-5 text-lg px-3 md:px-0">
                                    {recipeOfDay.description}
                                </p>

                                <div className="flex justify-center md:justify-start mb-4 ml-4 md:ml-0">
                                    <Link
                                        to={`/recipe/${recipeOfDay.id}`}
                                        className="px-10 py-3 border-2 border-black rounded-[30px] font-['Inter'] lg:text-[18px] hover:bg-black hover:text-white transition-colors w-max"
                                    >
                                        Переглянути рецепт
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center text-gray-500 font-medium flex-grow">Не вдалося завантажити рецепт дня</div>
                    )}

                    <div className="border-t-2 border-gray-500 w-full mb-12"></div>

                    {/* Плаваючий банер внизу */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 w-full max-w-4xl mr-auto mt-auto">

                         <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-3 sm:gap-5">

                             <img src={logo} alt="LITE cook" className="h-14 sm:h-16 lg:ml-5 lg:mr-5" />

                             <div>
                                 <h3 className="font-['Inter'] text-gray-900 text-xl md:text-2xl mb-1">
                                     Маєте продукти вдома?
                                 </h3>
                                 <p className="text-gray-900 font-['Inter'] text-lg sm:text-xl md:text-2xl">
                                     Знайдіть рецепт прямо зараз
                                 </p>
                             </div>
                         </div>

                         <button
                             onClick={() => navigate('/recipes')}
                             className="px-8 py-2.5 border border-black rounded-[30px] font-['Inter'] text-lg lg:mr-5 hover:bg-black hover:text-white transition-colors whitespace-nowrap"
                         >
                             Підібрати рецепт
                         </button>

                     </div>

                </div>
            </div>
        </div>
    );
};

export default Home;