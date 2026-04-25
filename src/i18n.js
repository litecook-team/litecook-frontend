import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import axios from 'axios';

import uk from './locales/uk.json';
import en from './locales/en.json';
import pl from './locales/pl.json';

// Задаємо мову при першому завантаженні
axios.defaults.headers.common['Accept-Language'] = localStorage.getItem('i18nextLng') || 'uk';

i18n
  .use(LanguageDetector) // Автоматично визначає мову браузера
  .use(initReactI18next) // Підключає до React
  .init({
    resources: {
      uk: { translation: uk },
      en: { translation: en },
      pl: { translation: pl }
    },
    fallbackLng: 'uk', // Якщо мова не знайдена, показуємо українську
    interpolation: {
      escapeValue: false
    }
  });

// Оновлюємо мову для запитів, коли користувач її перемикає
i18n.on('languageChanged', (lng) => {
    axios.defaults.headers.common['Accept-Language'] = lng;
});

export default i18n;