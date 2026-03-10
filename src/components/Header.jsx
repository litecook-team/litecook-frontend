import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.jpg';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Хук для відслідковування зміни сторінок
    const [user, setUser] = useState(null);

    // Перевіряємо токен
    const token = localStorage.getItem('access_token');
    const isAuthenticated = !!token;

    // Цей useEffect спрацьовує щоразу, коли користувач переходить на нову сторінку
    useEffect(() => {
        const fetchUserRole = async () => {
            if (isAuthenticated) {
                try {
                    const response = await axios.get('http://127.0.0.1:8000/api/auth/user/', {
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

    return (
        <header className="bg-lite-green py-4 px-8 md:px-16 flex justify-between items-center shadow-sm relative">
            <div className="flex items-center">
                <Link to="/">
                    <img src={logo} alt="LITE cook" className="h-12 mix-blend-multiply" />
                </Link>
            </div>

            <nav className="hidden md:flex space-x-8 text-gray-800 font-medium">
                <Link to="/" className="hover:text-green-700 transition duration-300">Головна</Link>
                <Link to="/recipes" className="hover:text-green-700 transition duration-300">Підібрати рецепти</Link>

                {isAuthenticated && (
                    <>
                        <Link to="/favorites" className="hover:text-green-700 transition duration-300">Улюблені</Link>
                        <Link to="/menu" className="hover:text-green-700 transition duration-300">Тижневе меню</Link>
                    </>
                )}

                <Link to="/about" className="hover:text-green-700 transition duration-300">Про проєкт</Link>
            </nav>

            <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                    <>
                        <Link to="/profile" className="text-gray-800 font-medium hover:text-green-700 transition duration-300">
                            Мій профіль
                        </Link>

                        {/* Кнопка показується ТІЛЬКИ якщо користувач є персоналом (Модератор/Адмін) */}
                        {user?.is_staff && (
                            <a href="http://127.0.0.1:8000/admin/" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1 rounded bg-blue-50">
                                Адмін-панель
                            </a>
                        )}

                        <button onClick={handleLogout} className="border border-gray-300 rounded-md px-4 py-1.5 bg-white text-sm font-medium text-red-600 hover:bg-red-50 transition">
                            Вийти
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="text-gray-800 font-medium hover:text-green-700 transition duration-300">
                        Увійти
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Header;