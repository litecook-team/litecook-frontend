import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import logo from '../assets/global/logo.png';
import avokado_avatar from '../assets/global/avokado_avatar.png';


const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const timeoutRef = useRef(null);

    // Створюємо рефи (посилання) на елементи, щоб відслідковувати кліки по них
    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const mobileBtnRef = useRef(null);

    // Шукаємо токен в обох сховищах
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    const isAuthenticated = !!token;

    useEffect(() => {
        const fetchUserRole = async () => {
            if (isAuthenticated) {
                try {
                    // Використовуємо api.get. Він сам підставить токен!
                    const response = await api.get('/api/auth/user/');
                    setUser(response.data);
                } catch (err) {
                    // Очищаємо обидва сховища при помилці
                    localStorage.clear();
                    sessionStorage.clear();
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };
        fetchUserRole();
        setIsMobileMenuOpen(false);
    }, [isAuthenticated, token, location.pathname]);

    // Миттєве оновлення даних хедера при зміні профілю
    useEffect(() => {
        const handleUserUpdate = (event) => {
            setUser(event.detail); // Отримуємо нові дані з події
        };

        window.addEventListener('userProfileUpdated', handleUserUpdate);
        return () => window.removeEventListener('userProfileUpdated', handleUserUpdate);
    }, []);

    // Ефект для відслідковування кліків за межами меню
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Якщо клік був поза меню профілю (аватарки) — закриваємо його
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }

            // Якщо клік був поза мобільним меню ТА поза кнопкою "гамбургер" — закриваємо його
            if (
                mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) &&
                mobileBtnRef.current && !mobileBtnRef.current.contains(event.target)
            ) {
                setIsMobileMenuOpen(false);
            }
        };

        // Слухаємо події кліку миші та дотику до екрану (для телефонів)
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        // Очищаємо слухачів при демонтажі компонента
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        // Очищаємо обидва сховища при виході
        localStorage.clear();
        sessionStorage.clear();

        setUser(null);
        window.location.href = '/login';
    };

    const handleMouseEnter = () => {
        clearTimeout(timeoutRef.current);
        setIsDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsDropdownOpen(false);
        }, 150);
    };

    // Для мобільних зручніше закривати меню при повторному тапі на аватарку
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <header className="bg-[#F6F3F4] py-3 px-4 sm:px-6 lg:px-8 xl:px-16 w-full border-b-1 border-gray-500 relative z-50 min-h-[64px] md:h-[80px]">
            <div className="flex justify-between items-center w-full h-full">

                {/* Ліва частина: Логотип + Навігація */}
                <div className="flex items-center space-x-8 xl:space-x-12 relative z-20 h-full">
                    <Link to="/" className="flex-shrink-0 block">
                        <img src={logo} alt="LITE cook" className="h-8 md:h-10 lg:h-12 mix-blend-multiply object-contain cursor-pointer transition-all ease-out active:scale-88 group" />
                    </Link>

                    <nav className="hidden md:flex max-[900px]:space-x-5 items-center space-x-6 lg:space-x-8 text-[#1A1A1A] font-['Inter'] font-medium text-sm lg:text-[15px] h-full">
                        <Link to="/" className="hover:text-[#42705D] transition duration-300 cursor-pointer transition-all ease-out active:scale-88 group">Головна</Link>
                        <Link to="/recipes" className="hover:text-[#42705D] transition duration-300 cursor-pointer transition-all ease-out active:scale-88 group">Підібрати рецепт</Link>

                        {isAuthenticated && (
                            <>
                                <Link to="/favorites" className="hover:text-[#42705D] transition duration-300 cursor-pointer transition-all ease-out active:scale-88 group">Улюблені</Link>
                                <Link to="/menu" className="hover:text-[#42705D] transition duration-300 cursor-pointer transition-all ease-out active:scale-88 group">Тижневе меню</Link>
                            </>
                        )}

                        <Link to="/about" className="hover:text-[#42705D] transition duration-300 cursor-pointer transition-all ease-out active:scale-88 group">Про нас</Link>
                    </nav>
                </div>

                {/* Права частина: Аватарка / Кнопки + Мобільне меню */}
                <div className="flex justify-end items-center space-x-3 sm:space-x-5 relative z-20 h-full">

                    {isAuthenticated ? (
                        <div className="flex items-center space-x-4 h-full">

                            {/* Кнопка Адмін-панелі */}
                            {user?.is_staff && (
                                <a
                                    href={`${import.meta.env.VITE_API_URL}/${import.meta.env.VITE_ADMIN_URL}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hidden md:flex items-center justify-center space-x-2.5 px-5 py-2.5 max-[920px]:px-3 max-[920px]:py-1.5 max-[920px]:space-x-1.5 max-[900px]:w-10 max-[900px]:h-10 max-[900px]:p-0 max-[900px]:space-x-0 bg-gradient-to-tr from-white via-[#fcfbf9] to-[#f4f7f5] border border-[#B47231]/30 text-gray-800 text-[11px] uppercase tracking-widest font-bold rounded-full transition-all duration-300 font-['Inter'] shadow-[0_2px_10px_-2px_rgba(180,114,49,0.15)] hover:shadow-[0_4px_15px_-2px_rgba(180,114,49,0.3)] hover:border-[#B47231]/60 transform hover:-translate-y-0.5 group relative overflow-hidden"
                                >
                                    {/* Блік при наведенні */}
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

                                    <svg className="w-6 h-6 max-[920px]:w-5 max-[920px]:h-5 text-[#B47231] group-hover:scale-110 transition-transform duration-500 relative z-10 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4"></path>
                                    </svg>
                                    <span className="max-[900px]:hidden max-[900px]:text-[10px] relative z-10 group-hover:text-[#B47231] transition-colors cursor-pointer transition-all ease-out active:scale-88 group">Адмін-панель</span>
                                </a>
                            )}

                            {/* ref={dropdownRef} та onClick */}
                            <div
                                ref={dropdownRef}
                                className="relative h-full flex items-center"
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                <div
                                    onClick={toggleDropdown}
                                    className="w-10 h-10 md:w-14 md:h-14 rounded-full border-[2.5px] border-[#1A1A1A] overflow-hidden cursor-pointer hover:scale-105 transition duration-300 bg-white shadow-sm flex items-center justify-center"
                                >
                                    <img
                                        key={user?.avatar || 'default'}
                                        src={user?.avatar || avokado_avatar}
                                        alt="User"
                                        className={`rounded-full ${user?.avatar ? 'object-cover' : 'w-[80%] h-[80%] object-contain'}`}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = avokado_avatar;
                                            e.target.className = "rounded-full w-[80%] h-[80%] object-contain";
                                        }}
                                    />
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 top-full pt-2 w-52 z-50">
                                        <div className="bg-white rounded-2xl shadow-xl py-3 border border-gray-100 font-['Inter'] transform origin-top-right transition-all">

                                            <div className="px-5 py-2 mb-2 border-b border-gray-50">
                                                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Увійшли як</p>
                                                <p className="text-sm text-gray-900 font-medium truncate">{user?.first_name || user?.email || "Користувач"}</p>
                                            </div>

                                            <Link to="/profile" className="flex items-center px-5 py-2.5 text-sm text-gray-700 hover:bg-[#F6F7FB] hover:text-[#42705D] transition cursor-pointer transition-all ease-out active:scale-88 group">
                                                <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                                Мій профіль
                                            </Link>

                                            <button onClick={handleLogout} className="w-full flex items-center px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition mt-1 cursor-pointer transition-all ease-out active:scale-88 group">
                                                <svg className="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                                Вийти
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex space-x-2 sm:space-x-3 font-['Inter']">
                            <Link to="/register" className="px-5 md:px-7 py-2.5 rounded-full bg-[#1A1A1A] text-white text-xs md:text-[14px] font-medium hover:bg-gray-800 transition shadow-sm cursor-pointer transition-all ease-out active:scale-88 group">Реєстрація</Link>
                            <Link to="/login" className="px-5 md:px-7 py-2.5 rounded-full bg-[#1A1A1A] text-white text-xs md:text-[14px] font-medium hover:bg-gray-800 transition shadow-sm cursor-pointer transition-all ease-out active:scale-88 group">Увійти</Link>
                        </div>
                    )}

                    <button
                        ref={mobileBtnRef}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden text-[#1A1A1A] hover:text-[#42705D] transition p-1"
                    >
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Мобільне меню */}
            {isMobileMenuOpen && (
                <div ref={mobileMenuRef} className="absolute top-full left-0 w-full bg-[#F6F7FB] border-t border-gray-200 shadow-lg md:hidden font-['Inter'] font-medium transition-all duration-300 z-40">
                    <nav className="flex flex-col px-6 py-4 space-y-1">
                        <Link to="/" className="py-3 text-gray-800 hover:text-[#42705D] border-b border-gray-100 cursor-pointer transition-all ease-out active:scale-98 group">Головна</Link>
                        <Link to="/recipes" className="py-3 text-gray-800 hover:text-[#42705D] border-b border-gray-100 cursor-pointer transition-all ease-out active:scale-98 group">Підібрати рецепт</Link>
                        {isAuthenticated && (
                            <>
                                <Link to="/favorites" className="py-3 text-gray-800 hover:text-[#42705D] border-b border-gray-100 cursor-pointer transition-all ease-out active:scale-98 group">Улюблені</Link>
                                <Link to="/menu" className="py-3 text-gray-800 hover:text-[#42705D] border-b border-gray-100 cursor-pointer transition-all ease-out active:scale-98 group">Тижневе меню</Link>
                            </>
                        )}
                        <Link to="/about" className="py-3 text-gray-800 hover:text-[#42705D] border-b border-gray-100 cursor-pointer transition-all ease-out active:scale-98 group">Про нас</Link>

                        {/* Мобільна кнопка Адмін-панелі */}
                        {user?.is_staff && (
                            <a
                                href={`${import.meta.env.VITE_API_URL}/${import.meta.env.VITE_ADMIN_URL}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 mb-2 py-3 px-4 bg-gradient-to-tr from-white via-[#fcfbf9] to-[#f4f7f5] text-gray-800 rounded-xl flex items-center justify-center shadow-[0_2px_10px_-2px_rgba(180,114,49,0.15)] font-bold tracking-wide transition-transform active:scale-95 group border border-[#B47231]/30 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-active:animate-[shimmer_1s_infinite]"></div>
                                <svg className="w-5 h-5 mr-2.5 text-[#B47231] group-hover:scale-110 transition-transform duration-500 relative z-10 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4"></path>
                                </svg>
                                <span className="relative z-10">Адмін-панель</span>
                            </a>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;