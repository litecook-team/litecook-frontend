import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// 1. ЛОГІКА ДАТИ: Змінювати дату лише тут, коли оновлюємо текст політики
const POLICY_LAST_UPDATED_DATE = "05.04.2026";

// Допоміжні класи для перевикористання
const classes = {
    h3: "text-2xl md:text-3xl font-bold font-['El_Messiri'] text-[#1A1A1A] mt-12 mb-6 flex items-center gap-3",
    h3Accent: "text-[#42705D] text-3xl font-light leading-none",
    p: "mb-6 text-gray-700 leading-loose",
    ul: "space-y-4 mb-8",
    liIcon: "flex items-start gap-3 text-gray-700 leading-relaxed",
};

// Словник з текстами
const PRIVACY_CONTENT = {
    'data': {
        title: 'Збір даних',
        content: (
            <>
                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> Загальна інформація</h3>
                <p className={classes.p}>Сервіс LITE cook збирає певні персональні дані користувачів для забезпечення коректної роботи платформи та надання персоналізованого досвіду.</p>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> Які дані ми збираємо</h3>
                <p className="mb-4 text-gray-700">Під час користування сайтом ми можемо збирати такі дані:</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>👤</span> Ім'я користувача</li>
                    <li className={classes.liIcon}><span>📧</span> Адреса електронної пошти</li>
                    <li className={classes.liIcon}><span>🔐</span> Дані для входу (логін та зашифрований пароль)</li>
                    <li className={classes.liIcon}><span>🖱️</span> Інформація про взаємодію з сайтом (пошуки, переглянуті рецепти)</li>
                    <li className={classes.liIcon}><span>📱</span> Дані про пристрій (тип браузера, операційна система, IP-адреса)</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> Як ми отримуємо дані</h3>
                <p className="mb-4 text-gray-700">Ми отримуємо інформацію:</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>📝</span> під час реєстрації на сайті</li>
                    <li className={classes.liIcon}><span>🔑</span> при вході в акаунт</li>
                    <li className={classes.liIcon}><span>💻</span> під час використання функціоналу платформи</li>
                    <li className={classes.liIcon}><span>🍪</span> через автоматичні технології (cookies, аналітика)</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> Добровільність надання даних</h3>
                <p className={classes.p}>Надання персональних даних є добровільним, але без цього деякі функції сайту можуть бути недоступні.</p>
            </>
        )
    },
    'usage': {
        title: 'Використання',
        content: (
            <>
                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> Основні цілі використання</h3>
                <p className="mb-4 text-gray-700">Зібрані дані використовуються для:</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>✅</span> створення та обслуговування облікового запису</li>
                    <li className={classes.liIcon}><span>✅</span> надання персоналізованих рецептів</li>
                    <li className={classes.liIcon}><span>✅</span> покращення функціоналу сайту</li>
                    <li className={classes.liIcon}><span>✅</span> аналізу поведінки користувачів</li>
                    <li className={classes.liIcon}><span>✅</span> забезпечення безпеки платформи</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> Комунікація з користувачем</h3>
                <p className="mb-4 text-gray-700">Ми можемо використовувати вашу електронну пошту для:</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>📨</span> підтвердження реєстрації</li>
                    <li className={classes.liIcon}><span>🔄</span> відновлення пароля</li>
                    <li className={classes.liIcon}><span>⚠️</span> надсилання важливих повідомлень</li>
                    <li className={classes.liIcon}><span>🔔</span> інформування про оновлення сервісу</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> Аналітика</h3>
                <p className="mb-4 text-gray-700">Ми аналізуємо використання сайту для:</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>🎨</span> покращення інтерфейсу</li>
                    <li className={classes.liIcon}><span>🔍</span> оптимізації пошуку рецептів</li>
                    <li className={classes.liIcon}><span>💡</span> розробки нових функцій</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> Обмеження використання</h3>
                <p className={classes.p}>Ми не використовуємо ваші дані для продажу третім особам або для агресивної реклами.</p>
            </>
        )
    },
    'cookies': {
        title: 'Куки (Cookies)',
        content: (
            <>
                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> Що таке cookies</h3>
                <p className={classes.p}>Cookies — це невеликі текстові файли, які зберігаються на вашому пристрої під час використання сайту.</p>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> Для чого ми використовуємо cookies</h3>
                <p className="mb-4 text-gray-700">Ми використовуємо cookies для:</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>🍪</span> забезпечення стабільної роботи сайту</li>
                    <li className={classes.liIcon}><span>🍪</span> збереження ваших налаштувань</li>
                    <li className={classes.liIcon}><span>🍪</span> автоматичного входу в акаунт</li>
                    <li className={classes.liIcon}><span>🍪</span> збору аналітичних даних</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> Типи cookies</h3>
                <p className="mb-4 text-gray-700">На сайті можуть використовуватись:</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>⚙️</span> <b>Необхідні cookies</b> — для роботи сайту</li>
                    <li className={classes.liIcon}><span>📊</span> <b>Аналітичні cookies</b> — для аналізу використання</li>
                    <li className={classes.liIcon}><span>🛠️</span> <b>Функціональні cookies</b> — для збереження налаштувань</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> Керування cookies</h3>
                <p className="mb-4 text-gray-700">Ви можете:</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>🔧</span> змінити налаштування cookies у браузері</li>
                    <li className={classes.liIcon}><span>🗑️</span> видалити cookies у будь-який момент</li>
                    <li className={classes.liIcon}><span>🛑</span> обмежити їх використання</li>
                </ul>
                <p className={classes.p}>Зверніть увагу: вимкнення cookies може вплинути на роботу сайту.</p>
            </>
        )
    },
    'control': {
        title: 'Контроль',
        content: (
            <>
                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> Права користувача</h3>
                <p className="mb-4 text-gray-700">Кожен користувач має право:</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>🔑</span> отримати доступ до своїх даних</li>
                    <li className={classes.liIcon}><span>✏️</span> змінити персональну інформацію</li>
                    <li className={classes.liIcon}><span>🗑️</span> видалити акаунт</li>
                    <li className={classes.liIcon}><span>✋</span> відкликати згоду на обробку даних</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> Видалення акаунту</h3>
                <p className={classes.p}>Користувач може видалити свій акаунт у будь-який момент через налаштування профілю або звернувшись до служби підтримки.</p>
                <p className="mb-4 text-gray-700">Після видалення:</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>🧹</span> персональні дані будуть видалені або анонімізовані</li>
                    <li className={classes.liIcon}><span>🚫</span> доступ до акаунту буде втрачено</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> Захист даних</h3>
                <p className="mb-4 text-gray-700">Ми застосовуємо сучасні заходи безпеки:</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>🔒</span> шифрування даних</li>
                    <li className={classes.liIcon}><span>🛡️</span> захист серверів</li>
                    <li className={classes.liIcon}><span>🛂</span> контроль доступу</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> Зміни політики</h3>
                <p className={classes.p}>Ми залишаємо за собою право змінювати цю Політику. Оновлення публікуються на цій сторінці.</p>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> Контакти</h3>
                <p className="mb-2 text-gray-700">Якщо у вас є питання:</p>
                <p className="flex items-center gap-3 text-lg font-medium text-[#2B4B3C]">
                    <span className="text-2xl">📧</span> support@litecook.com
                </p>
            </>
        )
    },
    'full': {
        title: 'Політика конфіденційності',
        content: (
            <>
                <p className="text-gray-500 font-medium tracking-wide mb-8 uppercase text-sm">
                    {/* Використовуємо змінну з датою */}
                    Останнє оновлення: {POLICY_LAST_UPDATED_DATE}
                </p>
                <p className={classes.p}>Ласкаво просимо до LITE cook! Ми поважаємо вашу конфіденційність та прагнемо захищати ваші персональні дані. У цій Політиці конфіденційності пояснюється, які дані ми збираємо, як їх використовуємо та як захищаємо.</p>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> 1. Які дані ми збираємо</h3>
                <p className="mb-4 text-gray-700">Ми можемо збирати такі типи інформації:</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>👤</span> <div><b>Персональні дані:</b> ім'я, електронна пошта (під час реєстрації)</div></li>
                    <li className={classes.liIcon}><span>🔐</span> <div><b>Дані облікового запису:</b> логін, пароль (у зашифрованому вигляді)</div></li>
                    <li className={classes.liIcon}><span>📱</span> <div><b>Технічна інформація:</b> IP-адреса, тип браузера, пристрій</div></li>
                    <li className={classes.liIcon}><span>🖱️</span> <div><b>Дані використання:</b> переглянуті рецепти, обрані інгредієнти, пошукові запити</div></li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> 2. Як ми використовуємо ваші дані</h3>
                <p className="mb-4 text-gray-700">Ми використовуємо інформацію для:</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>✅</span> створення та керування вашим акаунтом</li>
                    <li className={classes.liIcon}><span>✅</span> надання персоналізованих рецептів</li>
                    <li className={classes.liIcon}><span>✅</span> покращення роботи сайту</li>
                    <li className={classes.liIcon}><span>✅</span> аналізу використання платформи</li>
                    <li className={classes.liIcon}><span>✅</span> зв'язку з вами (наприклад, для відновлення пароля)</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> 3. Зберігання та захист даних</h3>
                <p className="mb-4 text-gray-700">Ми застосовуємо сучасні технічні та організаційні заходи для захисту ваших даних:</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>🔒</span> шифрування паролів</li>
                    <li className={classes.liIcon}><span>🛡️</span> захист серверів</li>
                    <li className={classes.liIcon}><span>🛂</span> обмежений доступ до інформації</li>
                </ul>
                <p className={classes.p}>Ми не передаємо ваші персональні дані третім особам без вашої згоди, окрім випадків, передбачених законом.</p>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> 4. Cookies</h3>
                <p className="mb-4 text-gray-700">Наш сайт використовує файли cookie для:</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>⚙️</span> коректної роботи сайту</li>
                    <li className={classes.liIcon}><span>🛠️</span> запам'ятовування ваших налаштувань</li>
                    <li className={classes.liIcon}><span>📊</span> аналітики використання</li>
                </ul>
                <p className={classes.p}>Ви можете змінити налаштування cookie у своєму браузері.</p>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> 5. Ваші права</h3>
                <p className="mb-4 text-gray-700">Ви маєте право:</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>🔑</span> отримати доступ до своїх даних</li>
                    <li className={classes.liIcon}><span>✏️</span> змінити або видалити їх</li>
                    <li className={classes.liIcon}><span>✋</span> відкликати згоду на обробку</li>
                </ul>
                <p className={classes.p}>Для цього зв'яжіться з нами через контактну інформацію нижче.</p>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> 6. Зміни до політики</h3>
                <p className={classes.p}>Ми можемо оновлювати цю Політику конфіденційності. Усі зміни будуть опубліковані на цій сторінці.</p>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> 7. Контакти</h3>
                <p className="mb-4 text-gray-700">Якщо у вас є питання щодо цієї Політики, зв'яжіться з нами:</p>
                <div className="flex flex-col gap-3">
                    <p className="flex items-center gap-3 text-lg font-medium text-[#2B4B3C]">
                        <span className="text-2xl">📧</span> Email: info@litecook.com
                    </p>
                    <p className="flex items-center gap-3 text-lg font-medium text-[#2B4B3C]">
                        <span className="text-2xl">🌐</span> Сайт: https://lite-cook.pp.ua/
                    </p>
                </div>
            </>
        )
    }
};

const PrivacyDetail = () => {
    const { section } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [section]);

    const pageData = PRIVACY_CONTENT[section] || PRIVACY_CONTENT['full'];

    return (
        <div className="w-full min-h-screen bg-[#F6F3F4] text-[#1A1A1A] font-['Inter'] pt-10 md:pt-12 pb-20 px-6 sm:px-12 md:px-20 flex flex-col items-center selection:bg-[#DCE8D9]">

            {/* КОНТЕЙНЕР ДЛЯ КНОПКИ НАЗАД */}
            <div className="w-full max-w-[1400px] mb-8 md:mb-12">
                <button
                    onClick={() => navigate(-1)}
                    className="px-8 py-2.5 bg-transparent border border-gray-800 rounded-full flex items-center gap-2 hover:bg-[#1A1A1A] hover:text-white hover:border-transparent transition-all duration-300 font-medium w-max"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 8 8 12 12 16"></polyline>
                        <line x1="16" y1="12" x2="8" y2="12"></line>
                    </svg>
                    Назад
                </button>
            </div>

            {/* КОНТЕЙНЕР ДЛЯ ТЕКСТУ СТОРІНКИ */}
            <div className="w-full max-w-5xl relative">
                {/* Заголовок сторінки з декоративною лінією */}
                <h1 className="text-4xl md:text-6xl font-bold font-['El_Messiri'] mb-12 text-[#1A1A1A] tracking-tight border-b-2 border-gray-400 pb-6">
                    {pageData.title}
                </h1>

                {/* ТЕКСТ СТОРІНКИ */}
                <div className="text-lg w-full">
                    {pageData.content}
                </div>
            </div>

        </div>
    );
};

export default PrivacyDetail;