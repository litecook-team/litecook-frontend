import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-lite-green py-6 px-8 md:px-16 flex flex-col md:flex-row justify-between items-center text-gray-800">

            {/* Логотип текстом */}
            <div className="font-bold text-lg tracking-widest mb-4 md:mb-0 uppercase">
                LITE COOK
            </div>

            {/* Навігація по центру */}
            <nav className="flex space-x-12 mb-4 md:mb-0 font-medium">
                <Link to="/about" className="hover:text-green-700 transition duration-300">Про проєкт</Link>
                <Link to="/contacts" className="hover:text-green-700 transition duration-300">Контакти</Link>
            </nav>

            {/* Копірайт */}
            <div className="text-gray-600 font-medium">
                © 2026
            </div>

        </footer>
    );
};

export default Footer;