import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import logo from '../assets/global/logo.png';
import aboutUs1 from '../assets/about/about-us_1.jpg';
import aboutUs2 from '../assets/about/about-us_2.png';

const About = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full bg-[#F6F3F4] min-h-screen pb-20 font-['Inter'] relative overflow-hidden">

            {/* Стилізована кнопка "Назад" */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-4 sm:left-6 md:top-6 md:left-17 flex items-center px-4 md:px-5 py-2.5 bg-[#1A1A1A] text-white rounded-full hover:bg-gray-800 transition font-['Inter'] font-medium text-xs md:text-sm shadow-md z-30"
            >
                <svg className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Назад
            </button>

            <div className="w-full">
                {/* Сітка на 2 колонки. Без gap, відступи регулюються всередині блоків */}
                <div className="grid grid-cols-1 lg:grid-cols-2">

                    {/* ================= БЛОК 1: Верхній лівий (Головний Текст) ================= */}
                    <div className="flex flex-col justify-center order-2 lg:order-1 pl-6 lg:pl-16 pr-6 lg:pr-10 py-10 lg:py-20">

                        <h1 className="text-6xl md:text-7xl lg:text-[80px] font-['El_Messiri'] text-[#1A1A1A] mb-2 tracking-wide leading-none mt-6 lg:mt-0">
                            LITE cook
                        </h1>
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-['El_Messiri'] text-[#974F23] mb-6 font-bold">
                            Готує із того, що є у тебе вдома
                        </h2>

                        <div className="border-t border-[#974F23] w-full max-w-[400px] mb-8"></div>

                        <p className="font-bold text-[#1A1A1A] text-lg md:text-xl mb-6 leading-snug">
                            Хочеш готувати просто, швидко і з тим, що є вдома? Тоді вітаємо на нашому сайті!
                        </p>

                        <p className="text-gray-700 text-base md:text-lg mb-6 leading-relaxed">
                            <strong className="text-[#1A1A1A]">LITE cook</strong> - винахідливий помічник, який відсортує, та знайде рецепт особисто під тебе та твої побажання. Просто скажи йому які у тебе є інгредієнти, і він швиденько знайде для тебе щось смачненьке.
                        </p>

                        <p className="text-gray-700 text-base md:text-lg mb-8 leading-relaxed">
                            Ніякого стресу перед порожнім холодильником — тільки смачні ідеї на основі доступних продуктів!
                        </p>

                        <p className="font-bold text-[#1A1A1A] text-base md:text-lg leading-snug">
                            Повір, хороша їжа не вимагає складних рецептів, багато часу, чи екзотичних інгредієнтів!<br/>
                            <span className="font-normal text-gray-700 mt-2 block">Достатньо взяти, що є поруч та разом з LITE cook створити власний кулінарний шедевр.</span>
                        </p>
                    </div>

                    {/* ================= БЛОК 2: Верхній правий (Фото зі сковорідкою) ================= */}
                    <div className="order-1 lg:order-2 relative w-full h-[400px] md:h-[500px] lg:h-full lg:min-h-[600px] group overflow-hidden rounded-b-[2rem] lg:rounded-b-none lg:rounded-bl-[4rem] border border-t-0 border-gray-300">
                         <img src={aboutUs1} alt="Інгредієнти" className="w-full h-full object-cover transition duration-700" />

                         {/* Іконка та текст "ПРО НАС" */}
                         <div className="absolute top-4 right-6 lg:top-6 lg:right-22 flex items-center gap-3 font-['El_Messiri'] font-bold text-lg lg:text-xl text-[#1A1A1A] uppercase tracking-widest">
                              <svg className="w-6 h-6 lg:w-8 lg:h-8 text-[#2A5E44]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                   <path fillRule="evenodd" clipRule="evenodd" d="M3 3H21V21H3V3ZM5 5V19H19V5H5Z" fill="currentColor"/>
                                   <path d="M9 5H15V13L12 11L9 13V5Z" fill="currentColor"/>
                              </svg>
                              Про нас
                         </div>

                         <Link to="/recipes" className="absolute bottom-8 left-6 lg:bottom-16 lg:left-16 bg-white/95 backdrop-blur-sm px-8 py-3 rounded-full font-bold text-sm md:text-base text-[#1A1A1A] border border-gray-200 hover:bg-[#1A1A1A] hover:text-white transition shadow-lg">
                               Підібрати рецепт
                         </Link>
                    </div>

                    {/* ================= БЛОК 3: Нижній лівий (Шеф-кухар) ================= */}
                    <div className="order-3 md:left-17 lg:order-3 relative w-full  h-[400px] sm:h-[500px] lg:h-full min-h-[500px] lg:min-h-[600px] rounded-[2rem] lg:rounded-[3rem] flex items-center lg:items-end justify-start md:justify-center pl-6 md:pl-0 z-10 overflow-hidden">
                        <img
                                src={aboutUs2}
                                alt="Шеф-кухар"
                                className="w-[95%] md:w-[90%] lg:w-full h-auto max-h-[95%] lg:max-h-[105%] object-contain drop-shadow-xl translate-y-2 lg:translate-y-4 rounded-b-[2rem] lg:rounded-b-[3rem] clip-path-[inset(0_round_1.5rem)]"
                        />
                    </div>

                    {/* ================= БЛОК 4: Нижній правий (Як працює LITE cook) ================= */}
                    <div className="order-4 lg:order-4 flex flex-col justify-center pl-6 lg:pl-10 pr-6 lg:pr-16 pt-16 pb-52 lg:pb-32 lg:pt-20 relative z-0 bg-[#F6F3F4]">

                        <h3 className="text-3xl md:text-4xl font-['El_Messiri'] font-bold text-center text-[#1A1A1A] tracking-widest mb-12 uppercase">
                            Як працює LITE cook
                        </h3>

                        <div className="flex justify-between items-start mb-10 w-full max-w-[600px] mx-auto lg:bottom-6 relative z-20">
                            <div className="flex flex-col items-center gap-4 text-center">
                                <svg className="w-10 h-10 text-[#974F23]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="1.5"/><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/></svg>
                                <span className="text-sm md:text-base font-semibold text-gray-800">Економія часу</span>
                            </div>
                            <div className="flex flex-col items-center gap-4 text-center">
                                <svg className="w-10 h-10 text-[#974F23]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 4V2m4 2V2m4 2V2"/></svg>
                                <span className="text-sm md:text-base font-semibold text-gray-800">Менше покупок</span>
                            </div>
                            <div className="flex flex-col items-center gap-4 text-center">
                                <svg className="w-10 h-10 text-[#974F23]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" strokeWidth="1.5"/><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"/></svg>
                                <span className="text-sm md:text-base font-semibold text-gray-800">Сезонне меню</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-400 w-full mb-12 max-w-[700px] mx-auto lg:bottom-9 relative z-20"></div>

                        <div className="space-y-5 max-w-[700px] mx-auto relative z-20 lg:bottom-12">
                            <div className="flex gap-6 items-center">
                                <div className="w-11 h-11 shrink-0 border border-gray-400 flex items-center justify-center font-['El_Messiri'] text-2xl text-gray-400 rounded-sm">1</div>
                                <div>
                                    <h4 className="font-bold text-[#1A1A1A] text-xl mb-1">Введіть інгредієнти</h4>
                                    <p className="text-base md:text-lg text-gray-600 leading-relaxed">Вкажіть продукти, які у вас є вдома. Система підкаже варіанти зі схожими назвами.</p>
                                </div>
                            </div>

                            <div className="flex gap-6 items-center">
                                <div className="w-11 h-11 shrink-0 border border-gray-400 flex items-center justify-center font-['El_Messiri'] text-2xl text-gray-400 rounded-sm">2</div>
                                <div>
                                    <h4 className="font-bold text-[#1A1A1A] text-xl mb-1">Отримайте рецепти</h4>
                                    <p className="text-base md:text-lg text-gray-600 leading-relaxed">Алгоритм підбере найкращі рецепти на основі ваших інгредієнтів та фільтрів.</p>
                                </div>
                            </div>

                            <div className="flex gap-6 items-center">
                                <div className="w-11 h-11 shrink-0 border border-gray-400 flex items-center justify-center font-['El_Messiri'] text-2xl text-gray-400 rounded-sm">3</div>
                                <div>
                                    <h4 className="font-bold text-[#1A1A1A] text-xl mb-1">Готуйте легко</h4>
                                    <p className="text-base md:text-lg text-gray-600 leading-relaxed">Покрокові інструкції з чіткими пропорціями. Зберігайте рецепти та плануйте меню на тиждень.</p>
                                </div>
                            </div>
                        </div>

                        {/* Плаваючий банер знизу */}
                        <div className="bg-[#F6F3F4] backdrop-blur-md border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-2xl p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 w-[90%] max-w-[810px] mx-auto absolute bottom-8 lg:bottom-0 left-1/2 -translate-x-1/2 z-30">
                            <div className="flex items-center gap-4">
                                <img src={logo} alt="LITE cook" className="h-12 object-contain mix-blend-multiply shrink-0" />
                                <span className="font-bold text-[#1A1A1A] text-base md:text-xl text-center sm:text-left">Готові спробувати прямо зараз?</span>
                            </div>
                            <Link
                                to="/recipes"
                                className="bg-[#1A1A1A] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition whitespace-nowrap shadow-md w-full sm:w-auto text-center shrink-0"
                            >
                                Підібрати рецепт
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;