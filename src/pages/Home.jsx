import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import heroVeggies from '../assets/hero-veggies.jpg';

const Home = () => {
    return (
        <div className="w-full">

            {/* Перший екран (Hero Section) */}
            <section className="relative flex flex-col md:flex-row items-center justify-center pt-20 pb-16 px-8 md:px-16 overflow-hidden">

                {/* Зліва: Великий логотип */}
                <div className="md:w-1/3 flex justify-center mb-10 md:mb-0">
                    {/* mix-blend-multiply прибирає білий фон з картинки логотипу */}
                    <img src={logo} alt="LITE cook logo" className="w-64 md:w-80 object-contain mix-blend-multiply" />
                </div>

                {/* По центру: Головний текст */}
                <div className="md:w-1/3 flex flex-col items-center text-center z-10">
                    <h1 className="text-6xl md:text-7xl font-serif text-gray-900 tracking-wider mb-4">
                        LITE cook
                    </h1>

                    {/* Використовуємо кастомний колір, схожий на коричнево-помаранчевий з макета */}
                    <h2 className="text-2xl md:text-3xl text-[#9B5C3C] font-serif mb-4">
                        Твій особистий шеф-кухар
                    </h2>

                    <p className="text-lg text-gray-700 mb-8 font-light">
                        Готуй із того, що є вдома
                    </p>

                    {/* Кнопка "Підібрати рецепт" */}
                    <Link
                        to="/recipes"
                        className="bg-lite-green text-gray-800 px-8 py-3 rounded-md shadow-sm hover:shadow-md hover:bg-[#d4ecd9] transition duration-300 font-medium"
                    >
                        підібрати рецепт
                    </Link>
                </div>

                {/* Справа: Місце для майбутніх картинок (морква, часник тощо) */}
                <div className="md:w-1/3 hidden md:flex flex-col items-center justify-center relative h-full">
                    {/* Поки що тут пусто, пізніше додамо сюди теги <img> з овочами */}
                    <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-400 text-sm">
                        Місце для фото овочів
                    </div>
                </div>

            </section>

            {/* Тут пізніше буде блок "Рецепт дня" та "Сніданок чемпіона" */}

        </div>
    );
};

export default Home;