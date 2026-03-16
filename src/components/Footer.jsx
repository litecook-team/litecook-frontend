import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-[#F6F3F4] pt-10 pb-6 px-6 lg:px-16 font-['Inter'] text-[#1A1A1A]">

            <div className="w-full">

                <div className="flex flex-col md:flex-row justify-between items-center mb-6 w-full">
                    <Link to="/" className="mb-6 md:mb-0">
                        <img src={logo} alt="LITE cook" className="h-10 md:h-12 mix-blend-multiply object-contain" />
                    </Link>

                    <nav className="flex space-x-8 font-medium text-sm md:text-base">
                        <Link to="/" className="hover:text-[#42705D] transition duration-300">Головна</Link>
                        <Link to="/about" className="hover:text-[#42705D] transition duration-300">Про нас</Link>
                    </nav>
                </div>

                <div className="border-t-2 border-gray-300 w-full mb-6"></div>

                <div className="flex flex-col md:flex-row justify-between items-center text-xs md:text-sm font-medium text-gray-600 space-y-4 md:space-y-0 w-full">

                    <div className="text-center md:text-left text-sm sm:text-base font-medium">
                        &copy; {currentYear} LITE cook. Всі права захищені.
                    </div>

                    <div className="flex justify-center md:justify-end space-x-5">

                        {/* Facebook */}
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-[#1A1A1A] hover:text-[#42705D] transition duration-300 ease-in-out">
                            <svg className="w-6 h-6 md:w-7 md:h-7" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                            </svg>
                        </a>

                        {/* Instagram */}
                        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#1A1A1A] hover:text-[#42705D] transition duration-300 ease-in-out">
                            <svg className="w-6 h-6 md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;