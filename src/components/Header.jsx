import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Хук для відслідковування зміни сторінок
    const [user, setUser] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Стан для випливаючого меню

    // Перевіряємо токен
    const token = localStorage.getItem('access_token');
    const isAuthenticated = !!token;

    // Цей useEffect спрацьовує щоразу, коли користувач переходить на нову сторінку
    useEffect(() => {
        const fetchUserRole = async () => {
            if (isAuthenticated) {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/user/`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(response.data); // Зберігаємо дані юзера (включаючи is_staff)
                } catch (err) {
                    // Якщо токен прострочений - викидаємо з системи
                    localStorage.removeItem('access_token');
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };
        fetchUserRole();
    }, [isAuthenticated, token, location.pathname]); // Залежності: оновлюємо при зміні шляху або токена

    // Надійна функція виходу (з примусовим перезавантаженням стану)
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setUser(null);
        // Замість звичайного navigate використовуємо window.location для 100% очищення пам'яті
        window.location.href = '/login';
    };

    // Дефолтна іконка авокадо, якщо користувач не завантажив свою
    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/6866/6866538.png";

return (
        <header className="bg-[#F6F7FB] py-4 px-8 md:px-16 flex justify-between items-center shadow-sm relative z-50 h-[80px]">

            {/* Ліва частина: Навігація */}
            <nav className="hidden md:flex flex-1 items-center space-x-8 text-[#1A1A1A] font-['Inter'] font-medium text-sm lg:text-base">
                <Link to="/" className="hover:text-[#42705D] transition duration-300">Головна</Link>
                <Link to="/recipes" className="hover:text-[#42705D] transition duration-300">Підібрати рецепт</Link>

                {isAuthenticated && (
                    <>
                        <Link to="/favorites" className="hover:text-[#42705D] transition duration-300">Улюблені</Link>
                        <Link to="/menu" className="hover:text-[#42705D] transition duration-300">Тижневе меню</Link>
                    </>
                )}

                <div className="flex items-center cursor-pointer hover:text-[#42705D] transition duration-300 group relative">
                    <span>Про нас</span>
                    <svg className="w-4 h-4 ml-1 text-gray-500 group-hover:text-[#42705D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </nav>

            {/* ЦЕНТРАЛЬНА ЧАСТИНА: Ідеально відцентрований логотип */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
                <Link to="/">
                    <img src={logo} alt="LITE cook" className="h-10 lg:h-12 mix-blend-multiply object-contain" />
                </Link>
            </div>

            {/* Права частина: Аватарка / Кнопки */}
            <div className="flex flex-1 justify-end items-center space-x-6">
                {isAuthenticated ? (
                    <div
                        className="relative"
                        onMouseEnter={() => setIsDropdownOpen(true)}
                        onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                        {/* Аватарка */}
                        <div className="w-11 h-11 rounded-full border-2 border-[#42705D] overflow-hidden cursor-pointer hover:shadow-md transition bg-white">
                            <img src={user?.avatar || defaultAvatar} alt="User" className="w-full h-full object-cover p-0.5 rounded-full" />
                        </div>

                        {/* Випливаюче меню */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-0 w-48 bg-white rounded-xl shadow-xl py-2 border border-gray-100 transform opacity-100 scale-100 transition-all font-['Inter']">
                                <Link to="/profile" className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-[#D8E3CA] hover:text-[#42705D] transition">
                                    Мій профіль
                                </Link>
                                {user?.is_staff && (
                                    <a
                                        href={`${import.meta.env.VITE_API_URL}/admin/`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block px-5 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition"
                                    >
                                        Адмін-панель
                                    </a>
                                )}
                                <div className="border-t border-gray-100 my-1"></div>
                                <button onClick={handleLogout} className="block w-full text-left px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition">
                                    Вийти
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex space-x-3 font-['Inter']">
                        <Link to="/register" className="px-6 py-2.5 rounded-full bg-[#1A1A1A] text-white text-sm font-medium hover:bg-gray-800 transition">
                            Реєстрація
                        </Link>
                        <Link to="/login" className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-800 text-sm font-medium hover:bg-gray-50 transition">
                            Увійти
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;