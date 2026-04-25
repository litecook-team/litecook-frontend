import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import axios from 'axios';

import uk from './locales/uk.json';
import en from './locales/en.json';
import pl from './locales/pl.json';

// Задаємо мову при першому завантаженні для Axios
axios.defaults.headers.common['Accept-Language'] = localStorage.getItem('i18nextLng') || 'uk';

i18n
  .use(LanguageDetector) // Автоматично визначає мову браузера
  .use(initReactI18next) // Підключає до React
  .init({
// Ваші локальні словники
    resources: {
      uk: { translation: uk },
      en: { translation: en },
      pl: { translation: pl }
    },

    // 1. Жорстко вказуємо ТІЛЬКИ ті мови, які реально є на нашому сайті
    supportedLngs: ['uk', 'en', 'pl'],

    // 2. Якщо мова браузера (напр. 'ru' чи 'de') не входить у список вище,
    // автоматично вмикаємо англійську
    fallbackLng: 'en',

    // Додатково: щоб i18next відкидав регіони (наприклад, 'en-US' перетворював на просто 'en')
    load: 'languageOnly',

    // 3. Налаштування визначення мови
    detection: {
      order: ['localStorage', 'navigator'], // Спочатку шукаємо вибір юзера, потім мову браузера
      caches: ['localStorage'], // Зберігаємо вибір користувача у localStorage
    },

    interpolation: {
      escapeValue: false // React вже самостійно захищає від XSS
    }
  });

// Оновлюємо мову для запитів на бекенд, коли користувач її перемикає
i18n.on('languageChanged', (lng) => {
    axios.defaults.headers.common['Accept-Language'] = lng;
});

export default i18n;