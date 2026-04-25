import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // ІМПОРТ ПЕРЕКЛАДУ

// Імпортуємо фонове зображення
import bgPrivacy from '../assets/privacy/fon_privacy.jpg';

// 1. ЛОГІКА ДАТИ: Змінювати дату лише тут, коли оновлюємо текст політики
const POLICY_LAST_UPDATED_DATE = "05.04.2026";

// Допоміжні класи для перевикористання
const classes = {
    h3: "text-2xl md:text-3xl font-bold font-['El_Messiri'] text-[#1A1A1A] mt-12 mb-6 flex items-center gap-3",
    h3Accent: "text-[#42705D] text-3xl font-light leading-none",
    p: "mb-6 text-gray-700 leading-loose text-[17px]",
    ul: "space-y-4 mb-8 text-[17px]",
    liIcon: "flex items-start gap-3 text-gray-700 leading-relaxed",
};

// Створюємо функцію замість константи, щоб передати `t`
const getPrivacyContent = (t, date) => ({
    'data': {
        title: t('privacy_page.card_1_title'),
        content: (
            <>
                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.data_1_h3')}</h3>
                <p className={classes.p}>{t('privacy_page.data_1_p')}</p>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.data_2_h3')}</h3>
                <p className="mb-4 text-gray-700 text-[17px]">{t('privacy_page.data_2_p')}</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>👤</span> {t('privacy_page.data_2_li1')}</li>
                    <li className={classes.liIcon}><span>📧</span> {t('privacy_page.data_2_li2')}</li>
                    <li className={classes.liIcon}><span>🔐</span> {t('privacy_page.data_2_li3')}</li>
                    <li className={classes.liIcon}><span>🖱️</span> {t('privacy_page.data_2_li4')}</li>
                    <li className={classes.liIcon}><span>📱</span> {t('privacy_page.data_2_li5')}</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.data_3_h3')}</h3>
                <p className="mb-4 text-gray-700 text-[17px]">{t('privacy_page.data_3_p')}</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>📝</span> {t('privacy_page.data_3_li1')}</li>
                    <li className={classes.liIcon}><span>🔑</span> {t('privacy_page.data_3_li2')}</li>
                    <li className={classes.liIcon}><span>💻</span> {t('privacy_page.data_3_li3')}</li>
                    <li className={classes.liIcon}><span>🍪</span> {t('privacy_page.data_3_li4')}</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.data_4_h3')}</h3>
                <p className={classes.p}>{t('privacy_page.data_4_p')}</p>
            </>
        )
    },
    'usage': {
        title: t('privacy_page.card_2_title'),
        content: (
            <>
                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.usage_1_h3')}</h3>
                <p className="mb-4 text-gray-700 text-[17px]">{t('privacy_page.usage_1_p')}</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>✅</span> {t('privacy_page.usage_1_li1')}</li>
                    <li className={classes.liIcon}><span>✅</span> {t('privacy_page.usage_1_li2')}</li>
                    <li className={classes.liIcon}><span>✅</span> {t('privacy_page.usage_1_li3')}</li>
                    <li className={classes.liIcon}><span>✅</span> {t('privacy_page.usage_1_li4')}</li>
                    <li className={classes.liIcon}><span>✅</span> {t('privacy_page.usage_1_li5')}</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.usage_2_h3')}</h3>
                <p className="mb-4 text-gray-700 text-[17px]">{t('privacy_page.usage_2_p')}</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>📨</span> {t('privacy_page.usage_2_li1')}</li>
                    <li className={classes.liIcon}><span>🔄</span> {t('privacy_page.usage_2_li2')}</li>
                    <li className={classes.liIcon}><span>⚠️</span> {t('privacy_page.usage_2_li3')}</li>
                    <li className={classes.liIcon}><span>🔔</span> {t('privacy_page.usage_2_li4')}</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.usage_3_h3')}</h3>
                <p className="mb-4 text-gray-700 text-[17px]">{t('privacy_page.usage_3_p')}</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>🎨</span> {t('privacy_page.usage_3_li1')}</li>
                    <li className={classes.liIcon}><span>🔍</span> {t('privacy_page.usage_3_li2')}</li>
                    <li className={classes.liIcon}><span>💡</span> {t('privacy_page.usage_3_li3')}</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.usage_4_h3')}</h3>
                <p className={classes.p}>{t('privacy_page.usage_4_p')}</p>
            </>
        )
    },
    'cookies': {
        title: t('privacy_page.card_3_title'),
        content: (
            <>
                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.cook_1_h3')}</h3>
                <p className={classes.p}>{t('privacy_page.cook_1_p')}</p>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.cook_2_h3')}</h3>
                <p className="mb-4 text-gray-700 text-[17px]">{t('privacy_page.cook_2_p')}</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>🍪</span> {t('privacy_page.cook_2_li1')}</li>
                    <li className={classes.liIcon}><span>🍪</span> {t('privacy_page.cook_2_li2')}</li>
                    <li className={classes.liIcon}><span>🍪</span> {t('privacy_page.cook_2_li3')}</li>
                    <li className={classes.liIcon}><span>🍪</span> {t('privacy_page.cook_2_li4')}</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.cook_3_h3')}</h3>
                <p className="mb-4 text-gray-700 text-[17px]">{t('privacy_page.cook_3_p')}</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>⚙️</span> <b>{t('privacy_page.cook_3_li1')}</b>{t('privacy_page.cook_3_li1_desc')}</li>
                    <li className={classes.liIcon}><span>📊</span> <b>{t('privacy_page.cook_3_li2')}</b>{t('privacy_page.cook_3_li2_desc')}</li>
                    <li className={classes.liIcon}><span>🛠️</span> <b>{t('privacy_page.cook_3_li3')}</b>{t('privacy_page.cook_3_li3_desc')}</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.cook_4_h3')}</h3>
                <p className="mb-4 text-gray-700 text-[17px]">{t('privacy_page.cook_4_p')}</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>🔧</span> {t('privacy_page.cook_4_li1')}</li>
                    <li className={classes.liIcon}><span>🗑️</span> {t('privacy_page.cook_4_li2')}</li>
                    <li className={classes.liIcon}><span>🛑</span> {t('privacy_page.cook_4_li3')}</li>
                </ul>
                <p className={classes.p}>{t('privacy_page.cook_4_p2')}</p>
            </>
        )
    },
    'control': {
        title: t('privacy_page.card_4_title'),
        content: (
            <>
                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.ctrl_1_h3')}</h3>
                <p className="mb-4 text-gray-700 text-[17px]">{t('privacy_page.ctrl_1_p')}</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>🔑</span> {t('privacy_page.ctrl_1_li1')}</li>
                    <li className={classes.liIcon}><span>✏️</span> {t('privacy_page.ctrl_1_li2')}</li>
                    <li className={classes.liIcon}><span>🗑️</span> {t('privacy_page.ctrl_1_li3')}</li>
                    <li className={classes.liIcon}><span>✋</span> {t('privacy_page.ctrl_1_li4')}</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.ctrl_2_h3')}</h3>
                <p className={classes.p}>{t('privacy_page.ctrl_2_p')}</p>
                <p className="mb-4 text-gray-700 text-[17px]">{t('privacy_page.ctrl_2_p2')}</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>🧹</span> {t('privacy_page.ctrl_2_li1')}</li>
                    <li className={classes.liIcon}><span>🚫</span> {t('privacy_page.ctrl_2_li2')}</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.ctrl_3_h3')}</h3>
                <p className="mb-4 text-gray-700 text-[17px]">{t('privacy_page.ctrl_3_p')}</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>🔒</span> {t('privacy_page.ctrl_3_li1')}</li>
                    <li className={classes.liIcon}><span>🛡️</span> {t('privacy_page.ctrl_3_li2')}</li>
                    <li className={classes.liIcon}><span>🛂</span> {t('privacy_page.ctrl_3_li3')}</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.ctrl_4_h3')}</h3>
                <p className={classes.p}>{t('privacy_page.ctrl_4_p')}</p>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.ctrl_5_h3')}</h3>
                <p className="mb-2 text-gray-700 text-[17px]">{t('privacy_page.ctrl_5_p')}</p>
                <p className="flex items-center gap-3 text-lg font-medium text-[#2B4B3C]">
                    <span className="text-2xl">📧</span> support@litecook.com
                </p>
            </>
        )
    },
    'full': {
        title: t('privacy_page.full_title'),
        content: (
            <>
                <p className="text-gray-500 font-medium tracking-wide mb-8 uppercase text-sm">
                    {t('privacy_page.last_update')} {date}
                </p>
                <p className={classes.p}>{t('privacy_page.full_intro')}</p>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.full_1_h3')}</h3>
                <p className="mb-4 text-gray-700 text-[17px]">{t('privacy_page.full_1_p')}</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>👤</span> <div><b>{t('privacy_page.full_1_li1_b')}</b>{t('privacy_page.full_1_li1_d')}</div></li>
                    <li className={classes.liIcon}><span>🔐</span> <div><b>{t('privacy_page.full_1_li2_b')}</b>{t('privacy_page.full_1_li2_d')}</div></li>
                    <li className={classes.liIcon}><span>📱</span> <div><b>{t('privacy_page.full_1_li3_b')}</b>{t('privacy_page.full_1_li3_d')}</div></li>
                    <li className={classes.liIcon}><span>🖱️</span> <div><b>{t('privacy_page.full_1_li4_b')}</b>{t('privacy_page.full_1_li4_d')}</div></li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.full_2_h3')}</h3>
                <p className="mb-4 text-gray-700 text-[17px]">{t('privacy_page.full_2_p')}</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>✅</span> {t('privacy_page.full_2_li1')}</li>
                    <li className={classes.liIcon}><span>✅</span> {t('privacy_page.full_2_li2')}</li>
                    <li className={classes.liIcon}><span>✅</span> {t('privacy_page.full_2_li3')}</li>
                    <li className={classes.liIcon}><span>✅</span> {t('privacy_page.full_2_li4')}</li>
                    <li className={classes.liIcon}><span>✅</span> {t('privacy_page.full_2_li5')}</li>
                </ul>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.full_3_h3')}</h3>
                <p className="mb-4 text-gray-700 text-[17px]">{t('privacy_page.full_3_p')}</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>🔒</span> {t('privacy_page.full_3_li1')}</li>
                    <li className={classes.liIcon}><span>🛡️</span> {t('privacy_page.full_3_li2')}</li>
                    <li className={classes.liIcon}><span>🛂</span> {t('privacy_page.full_3_li3')}</li>
                </ul>
                <p className={classes.p}>{t('privacy_page.full_3_p2')}</p>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.full_4_h3')}</h3>
                <p className="mb-4 text-gray-700 text-[17px]">{t('privacy_page.full_4_p')}</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>⚙️</span> {t('privacy_page.full_4_li1')}</li>
                    <li className={classes.liIcon}><span>🛠️</span> {t('privacy_page.full_4_li2')}</li>
                    <li className={classes.liIcon}><span>📊</span> {t('privacy_page.full_4_li3')}</li>
                </ul>
                <p className={classes.p}>{t('privacy_page.full_4_p2')}</p>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.full_5_h3')}</h3>
                <p className="mb-4 text-gray-700 text-[17px]">{t('privacy_page.full_5_p')}</p>
                <ul className={classes.ul}>
                    <li className={classes.liIcon}><span>🔑</span> {t('privacy_page.full_5_li1')}</li>
                    <li className={classes.liIcon}><span>✏️</span> {t('privacy_page.full_5_li2')}</li>
                    <li className={classes.liIcon}><span>✋</span> {t('privacy_page.full_5_li3')}</li>
                </ul>
                <p className={classes.p}>{t('privacy_page.full_5_p2')}</p>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.full_6_h3')}</h3>
                <p className={classes.p}>{t('privacy_page.full_6_p')}</p>

                <h3 className={classes.h3}><span className={classes.h3Accent}>~</span> {t('privacy_page.full_7_h3')}</h3>
                <p className="mb-4 text-gray-700 text-[17px]">{t('privacy_page.full_7_p')}</p>
                <div className="flex flex-col gap-3">
                    <p className="flex items-center gap-3 text-lg font-medium text-[#2B4B3C]">
                        <span className="text-2xl">📧</span> Email: info@litecook.com
                    </p>
                    <p className="flex items-center gap-3 text-lg font-medium text-[#2B4B3C]">
                        <span className="text-2xl">🌐</span> {t('privacy_page.full_7_site')} https://lite-cook.pp.ua/
                    </p>
                </div>
            </>
        )
    }
});

const PrivacyDetail = () => {
    const { t } = useTranslation(); // ПІДКЛЮЧЕННЯ ПЕРЕКЛАДУ
    const { section } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [section]);

    // Викликаємо функцію з поточним перекладачем і датою
    const CONTENT = getPrivacyContent(t, POLICY_LAST_UPDATED_DATE);
    const pageData = CONTENT[section] || CONTENT['full'];

    return (
        <div
            className="w-full min-h-screen text-[#1A1A1A] font-['Inter'] pt-10 md:pt-12 pb-20 px-6 sm:px-12 md:px-20 flex flex-col items-center selection:bg-[#DCE8D9] bg-cover bg-center"
            style={{ backgroundImage: `url(${bgPrivacy})` }}
        >

            {/* КОНТЕЙНЕР ДЛЯ КНОПКИ НАЗАД */}
            <div className="w-full max-w-[1400px] mb-8 md:mb-12">
                <button
                    onClick={() => navigate(-1)}
                    className="px-8 py-2.5 bg-transparent border border-gray-800 rounded-full flex items-center gap-2 hover:bg-[#1A1A1A] hover:text-white hover:border-transparent transition-all duration-300 font-medium w-max cursor-pointer transition-all duration-300 ease-out active:scale-95 group"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 8 8 12 12 16"></polyline>
                        <line x1="16" y1="12" x2="8" y2="12"></line>
                    </svg>
                    {t('privacy_page.back_btn')}
                </button>
            </div>

            {/* КОНТЕЙНЕР ДЛЯ ТЕКСТУ СТОРІНКИ (ПЛАШКА) */}
            <div className="w-full max-w-7xl relative bg-[#F6F3F4] backdrop-blur-md rounded-[2.5rem] p-8 sm:p-12 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border-2 border-black/70">
                {/* Заголовок сторінки */}
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-['El_Messiri'] mb-10 text-[#1A1A1A] tracking-tight text-center">
                    {pageData.title}
                </h1>

                {/* ТЕКСТ СТОРІНКИ */}
                <div className="w-full max-w-5xl mx-auto">
                    {pageData.content}
                </div>
            </div>

        </div>
    );
};

export default PrivacyDetail;