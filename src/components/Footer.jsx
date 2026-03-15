import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-[#F6F7FB] pt-10 pb-6 px-6 lg:px-16 font-['Inter'] text-[#1A1A1A]">

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

                <div className="border-t border-gray-200 w-full mb-6"></div>

                <div className="flex flex-col md:flex-row justify-between items-center text-xs md:text-sm font-medium text-gray-600 space-y-4 md:space-y-0 w-full">

                    <div className="text-center md:text-left text-sm sm:text-base font-['El_Messiri']">
                        &copy; {currentYear} LITE cook. Всі права захищені.
                    </div>

                    {/* Кольорові іконки соцмереж */}
                    <div className="flex justify-center md:justify-end space-x-4">

                        {/* Facebook - Синій */}
                        <a href="#" className="transform hover:scale-110 transition duration-300 ease-in-out">
                            <svg className="w-6 h-6 md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 12.073C24 5.405 18.627 0 12 0C5.373 0 0 5.405 0 12.073C0 18.098 4.388 23.09 10.125 24V15.562H7.078V12.073H10.125V9.412C10.125 6.4 11.72 4.733 14.453 4.733C15.772 4.733 17.156 4.968 17.156 4.968V7.936H15.632C14.133 7.936 13.666 8.865 13.666 9.82V12.073H17.016L16.539 15.562H13.666V24C19.612 23.09 24 18.098 24 12.073Z" fill="#1877F2"/>
                                <path d="M16.539 15.562L17.016 12.073H13.666V9.82C13.666 8.865 14.133 7.936 15.632 7.936H17.156V4.968C17.156 4.968 15.772 4.733 14.453 4.733C11.72 4.733 10.125 6.4 10.125 9.412V12.073H7.078V15.562H10.125V24C10.742 24.093 11.368 24.146 12 24.146C12.632 24.146 13.258 24.093 13.875 24V15.562H16.539Z" fill="white"/>
                            </svg>
                        </a>

                        {/* Instagram - Градієнт */}
                        <a href="#" className="transform hover:scale-110 transition duration-300 ease-in-out">
                            <svg className="w-6 h-6 md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="24" height="24" rx="5.333" fill="url(#paint0_radial_instagram)"/>
                                <path d="M12 7.842C9.708 7.842 7.842 9.708 7.842 12C7.842 14.292 9.708 16.158 12 16.158C14.292 16.158 16.158 14.292 16.158 12C16.158 9.708 14.292 7.842 12 7.842ZM12 14.77C10.473 14.77 9.23 13.527 9.23 12C9.23 10.473 10.473 9.23 12 9.23C13.527 9.23 14.77 10.473 14.77 12C14.77 13.527 13.527 14.77 12 14.77Z" fill="white"/>
                                <circle cx="17.06" cy="6.938" r="0.923" fill="white"/>
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2.163C15.204 2.163 15.584 2.175 16.85 2.233C18.113 2.29 18.975 2.482 19.73 2.775C20.51 3.076 21.171 3.526 21.705 4.102C22.239 4.678 22.628 5.343 22.925 6.126C23.218 6.88 23.41 7.743 23.467 9.006C23.525 10.272 23.537 10.652 23.537 13.856C23.537 17.06 23.525 17.44 23.467 18.706C23.41 19.969 23.218 20.832 22.925 21.586C22.628 22.369 22.239 23.034 21.705 23.61C21.171 24.186 20.51 24.636 19.73 24.937C18.975 25.23 18.113 25.422 16.85 25.479C15.584 25.537 15.204 25.549 12 25.549C8.796 25.549 8.416 25.537 7.15 25.479C5.887 25.422 5.025 25.23 4.27 24.937C3.49 24.636 2.829 24.186 2.295 23.61C1.761 23.034 1.372 22.369 1.075 21.586C0.782 20.832 0.59 19.969 0.533 18.706C0.475 17.44 0.463 17.06 0.463 13.856C0.463 10.652 0.475 10.272 0.533 9.006C0.59 7.743 0.782 6.88 1.075 6.126C1.372 5.343 1.761 4.678 2.295 4.102C2.829 3.526 3.49 3.076 4.27 2.775C5.025 2.482 5.887 2.29 7.15 2.233C8.416 2.175 8.796 2.163 12 2.163ZM12 4.276C8.847 4.276 8.452 4.288 7.195 4.346C6.035 4.399 5.353 4.603 4.898 4.78C4.295 5.015 3.864 5.305 3.411 5.759C2.958 6.212 2.668 6.643 2.433 7.246C2.256 7.702 2.052 8.384 1.999 9.544C1.941 10.801 1.929 11.196 1.929 14.349C1.929 17.502 1.941 17.897 1.999 19.154C2.052 20.314 2.256 20.996 2.433 21.452C2.668 22.055 2.958 22.486 3.411 22.939C3.864 23.393 4.295 23.683 4.898 23.918C5.353 24.095 6.035 24.299 7.195 24.352C8.452 24.41 8.847 24.422 12 24.422C15.153 24.422 15.548 24.41 16.805 24.352C17.965 24.299 18.647 24.095 19.102 23.918C19.705 23.683 20.136 23.393 20.589 22.939C21.042 22.486 21.332 22.055 21.567 21.452C21.744 20.996 21.948 20.314 22.001 19.154C22.059 17.897 22.071 17.502 22.071 14.349C22.071 11.196 22.059 10.801 22.001 9.544C21.948 8.384 21.744 7.702 21.567 7.246C21.332 6.643 21.042 6.212 20.589 5.759C20.136 5.305 19.705 5.015 19.102 4.78C18.647 4.603 17.965 4.399 16.805 4.346C15.548 4.288 15.153 4.276 12 4.276Z" fill="white"/>
                                <defs>
                                    <radialGradient id="paint0_radial_instagram" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(6.5 22.5) rotate(-55.3758) scale(26.6833)">
                                        <stop stopColor="#FA8F21"/>
                                        <stop offset="0.25" stopColor="#D82D7E"/>
                                        <stop offset="0.5" stopColor="#9C26B0"/>
                                        <stop offset="0.75" stopColor="#515BD4"/>
                                        <stop offset="1" stopColor="#515BD4"/>
                                    </radialGradient>
                                </defs>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;