import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import axios from 'axios';

import uk from './locales/uk.json';
import en from './locales/en.json';
import pl from './locales/pl.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      uk: { translation: uk },
      en: { translation: en },
      pl: { translation: pl }
    },
    supportedLngs: ['uk', 'en', 'pl'],
    fallbackLng: 'en', // Англійська як універсальний запасний варіант
    load: 'languageOnly',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false
    }
  });

// ================= СУЧАСНІ ПРАКТИКИ =================

// 1. Динамічно змінюємо <html lang="..."> для SEO та правильної роботи браузерних перекладачів
i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
});
// Встановлюємо правильний lang при першому завантаженні
document.documentElement.lang = i18n.resolvedLanguage || i18n.language || 'en';


// 2. AXIOS INTERCEPTOR: Найбільш надійний спосіб передавати мову на бекенд.
// Перед кожним запитом ми беремо АКТУАЛЬНУ мову прямо з i18n.
axios.interceptors.request.use((config) => {
    // resolvedLanguage віддає чисту мову (напр. 'en'), ігноруючи регіони ('en-US')
    const currentLang = i18n.resolvedLanguage || i18n.language || 'en';

    // Встановлюємо заголовок
    config.headers['Accept-Language'] = currentLang;

    return config;
});

export default i18n;