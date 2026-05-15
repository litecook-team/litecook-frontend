import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next'; // ІМПОРТ ПЕРЕКЛАДУ
import FacebookLogin from '@greatsumini/react-facebook-login';
import authBg from '../assets/auth/registration.jpg';
import ReCAPTCHA from "react-google-recaptcha";

const Register = () => {
    const { t, i18n } = useTranslation(); // ІНІЦІАЛІЗАЦІЯ ПЕРЕКЛАДУ

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_name: '', email: '', password1: '', password2: ''
    });
    const [agreed, setAgreed] = useState(false);

    const [message, setMessage] = useState({ text: '', type: '' });
    const [passwordError, setPasswordError] = useState('');

    const [isMessageVisible, setIsMessageVisible] = useState(false);
    const [isPasswordErrorVisible, setIsPasswordErrorVisible] = useState(false);

    // Точно визначає, яке поле має світитися червоним
    const [errorField, setErrorField] = useState(null);

    const [showTerms, setShowTerms] = useState(false);
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

    // Стан для контролю видимості підказок пароля (фокус на полі)
    const [isPassword1Focused, setIsPassword1Focused] = useState(false);

    const errorTimerRef = useRef(null);
    const pwdErrorTimerRef = useRef(null);

    // Створюємо посилання на компонент reCAPTCHA
    const recaptchaRef = useRef();

    // Оновлена функція тепер приймає назву поля
    const showGlobalMessage = (text, type, field = null) => {
        setMessage({ text, type });
        setIsMessageVisible(true);
        setErrorField(field);

        // if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
        // errorTimerRef.current = setTimeout(() => {
        //     setIsMessageVisible(false);
        // }, 5000);
    };

    // Оновлена функція тепер приймає назву поля
    const showPasswordErrorMessage = (text, field = 'password1') => {
        setPasswordError(text);
        setIsPasswordErrorVisible(true);
        setErrorField(field);

        if (pwdErrorTimerRef.current) clearTimeout(pwdErrorTimerRef.current);
        pwdErrorTimerRef.current = setTimeout(() => setIsPasswordErrorVisible(false), 5000);
    };

    const handleChange = (e) => {
        let { name, value } = e.target;

        // 1. Логіка для EMAIL
        if (name === 'email') {
            const cleanValue = value.replace(/\s/g, '').toLowerCase();
            value = cleanValue;

            setTimeout(() => {
                if (e.target && e.target.value !== cleanValue) {
                    e.target.value = cleanValue;
                }
            }, 0);
        }

        // 2. Логіка для ПАРОЛІВ
        if (name === 'password1' || name === 'password2') {
            if (value.includes(' ')) return; // Блокуємо пробіли
        }

        // 3. Логіка для ІМЕНІ
        if (name === 'first_name') {
            value = value.replace(/^\s+/, '').replace(/\s{2,}/g, ' ');
        }

        // Зберігаємо оновлене значення
        setFormData({ ...formData, [name]: value });

        // МИТТЄВО ховаємо всі помилки і знімаємо червону підсвітку при вводі
        setIsMessageVisible(false);
        setIsPasswordErrorVisible(false);
        setErrorField(null);
        if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
        if (pwdErrorTimerRef.current) clearTimeout(pwdErrorTimerRef.current);
    };

    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) return t('register_page.error_email_format');

        const domain = email.split('@')[1].toLowerCase();

        const ruDomains = ['.ru', '.su', '.рф', 'yandex', 'mail.ru', 'bk.ru', 'inbox.ru', 'list.ru'];
        if (ruDomains.some(ru => domain.endsWith(ru) || domain.includes(ru))) {
            return t('register_page.error_email_ru');
        }

        const blockedTypos = ['gmail.co', 'gmail.c', 'gmai.com', 'gmal.com', 'ukr.ne', 'yahoo.c', 'yaho.com'];
        if (blockedTypos.includes(domain)) return t('register_page.error_email_typo');

        return '';
    };

    const calculateStrength = (password) => {
        let score = 0;
        if (!password) return 0;
        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password) || /[А-ЯІЇЄҐ]/.test(password)) score += 1;
        if (/[a-z]/.test(password) || /[а-яіїєґ]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9А-Яа-яІіЇїЄєҐґ\s]/.test(password)) score += 1;
        return score;
    };

    const pwdStrength = calculateStrength(formData.password1);
    const strengthColors = ['bg-gray-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
    const strengthLabels = [t('register_page.str_0'), t('register_page.str_1'), t('register_page.str_2'), t('register_page.str_3'), t('register_page.str_4'), t('register_page.str_5')];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setPasswordError('');

        // Ховаємо попередні повідомлення
        setIsMessageVisible(false);
        setIsPasswordErrorVisible(false);
        setErrorField(null);
        if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
        if (pwdErrorTimerRef.current) clearTimeout(pwdErrorTimerRef.current);

        // ПОСЛІДОВНІ ПЕРЕВІРКИ (Підсвічуємо лише те поле, де помилка)
        if (!formData.first_name || formData.first_name.trim() === '') {
            showGlobalMessage(t('register_page.error_name_empty'), 'error', 'first_name');
            return;
        }

        if (!formData.email.trim()) {
            showGlobalMessage(t('register_page.error_email_empty'), 'error', 'email');
            return;
        }

        const emailError = validateEmail(formData.email);
        if (emailError) {
            showGlobalMessage(emailError, 'error', 'email');
            return;
        }

        if (!formData.password1.trim()) {
            showPasswordErrorMessage(t('register_page.error_password_empty'), 'password1');
            return;
        }

        if (formData.password1.length < 8) {
            showPasswordErrorMessage(t('register_page.error_length'), 'password1');
            return;
        }

        if (pwdStrength < 3) {
            showPasswordErrorMessage(t('register_page.error_weak'), 'password1');
            return;
        }

        if (formData.password1 !== formData.password2) {
            showPasswordErrorMessage(t('register_page.error_match'), 'password2');
            return;
        }

        if (!agreed) {
            showGlobalMessage(t('register_page.error_terms'), 'error');
            return;
        }

        try {
            const token = await recaptchaRef.current.executeAsync();

            if (!token) {
                 showGlobalMessage(t('register_page.error_captcha'), 'error');
                 if (recaptchaRef.current) recaptchaRef.current.reset();
                 return;
            }

            setIsLoading(true);

            const payloadData = {
                ...formData,
                captcha_token: token
            };

            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/registration/`, payloadData);
            showGlobalMessage(t('register_page.success_msg'), 'success');
            setFormData({ first_name: '', email: '', password1: '', password2: '' });

            if (recaptchaRef.current) recaptchaRef.current.reset();
            setIsLoading(false);
        } catch (err) {
            if (recaptchaRef.current) recaptchaRef.current.reset();
            setIsLoading(false);

            if (err.response) {
                if (err.response.status === 429) {
                    showGlobalMessage(t('register_page.error_too_many'), 'error');
                    return;
                }
                if (err.response.data) {
                    if (err.response.data.email) {
                        const backendError = Array.isArray(err.response.data.email)
                            ? err.response.data.email[0]
                            : err.response.data.email;

                        if (backendError.toLowerCase().includes('коректн') || backendError.toLowerCase().includes('valid')) {
                            showGlobalMessage(t('register_page.error_email_format'), 'error', 'email');
                        } else {
                            showGlobalMessage(t('register_page.error_exists'), 'error', 'email');
                        }
                    } else if (err.response.data.first_name) {
                        const nameError = Array.isArray(err.response.data.first_name)
                            ? err.response.data.first_name[0]
                            : err.response.data.first_name;
                        showGlobalMessage(nameError, 'error', 'first_name');
                    } else if (err.response.data.password1) {
                        showPasswordErrorMessage(err.response.data.password1[0], 'password1');
                    } else if (err.response.data.password) {
                        showPasswordErrorMessage(err.response.data.password[0], 'password1');
                    } else if (err.response.data.detail) {
                        showGlobalMessage(err.response.data.detail, 'error');
                    } else if (typeof err.response.data === 'string') {
                        showGlobalMessage(err.response.data, 'error');
                    }
                }
            } else {
                 showGlobalMessage(t('register_page.error_server'), 'error');
            }
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/social/google/`, { access_token: tokenResponse.access_token });
                localStorage.setItem('access_token', res.data.access);
                navigate('/');
            } catch (err) { showGlobalMessage(t('register_page.error_server'), 'error'); }
        }
    });

    return (
        <div className="flex-grow w-full flex justify-center md:justify-end items-center p-4 py-16 sm:p-6 md:py-24 md:pr-10 lg:pr-24 xl:pr-32 relative bg-white bg-cover bg-no-repeat bg-top md:bg-left-top"
             style={{ backgroundImage: `url(${authBg})` }}>

            <Link to="/" className="absolute top-6 left-4 sm:left-6 md:top-10 md:left-10 flex items-center px-6 sm:px-10 py-2 bg-white text-gray-800 rounded-[30px] border border-black hover:bg-[#1A1A1A] hover:text-white hover:border-transparent hover:shadow-md transition font-['Inter'] font-medium text-[13px] sm:text-[14px] lg:text-[15px] shadow-lg z-20 gap-2 cursor-pointer transition-all duration-300 ease-out active:scale-95 group">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"></circle><polyline points="12 8 8 12 12 16"></polyline><line x1="16" y1="12" x2="8" y2="12"></line></svg>
                {t('register_page.back_btn')}
            </Link>

            <style>{`
                .grecaptcha-badge { 
                    visibility: hidden !important; 
                }
            `}</style>

            <div className="flex flex-col items-center w-full max-w-[700px] z-10 pt-12 md:pt-0">

                <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-[80px] font-['El_Messiri'] text-[#1A1A1A] mb-8 md:mb-12 tracking-wide lg:tracking-[0.15em] whitespace-nowrap w-max pl-[0.05em] lg:pl-[0.15em] drop-shadow-sm text-center">
                    L I T E &nbsp; c o o k
                </div>

                <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-[2rem] p-6 sm:p-10 w-full max-w-[580px] font-['Inter'] mx-auto">

                    <h1 className="text-2xl md:text-4xl font-['El_Messiri'] font-bold mb-6 text-[#1A1A1A] text-center md:text-left">
                        {t('register_page.title')}
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                        {/* АНІМОВАНИЙ БЛОК ГЛОБАЛЬНОЇ ПОМИЛКИ/УСПІХУ */}
                        <div className={`transition-all duration-500 overflow-hidden w-full ${isMessageVisible ? 'max-h-24 opacity-100 mb-2' : 'max-h-0 opacity-0 mb-0'}`}>
                            <div className={`w-full text-xs md:text-[13px] p-3 rounded-lg font-medium border bg-white/90 backdrop-blur-sm shadow-sm inline-block ${message.type === 'error' ? 'text-red-600 border-red-200' : 'text-green-700 border-green-200'}`}>
                                {message.text}
                            </div>
                        </div>

                        <div>
                            <label className="inline-block text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 mb-1 ml-4">{t('register_page.name_label')}</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                                placeholder={t('register_page.name_placeholder')}
                                className={`w-full px-5 font-['El_Messiri'] py-3 md:py-2.5 rounded-full border focus:outline-none transition-colors duration-300 text-base md:text-lg text-gray-700 bg-white ${
                                    isMessageVisible && errorField === 'first_name'
                                        ? 'border-red-500 focus:border-red-600 bg-red-50/30' 
                                        : 'border-gray-300 focus:border-[#42705D]'
                                }`}
                            />
                        </div>

                        <div>
                            <label className="inline-block text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 mb-1 ml-4">{t('register_page.email_label')}</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onKeyDown={(e) => {
                                    if (e.key === ' ') e.preventDefault();
                                }}
                                required
                                placeholder={t('register_page.email_placeholder')}
                                className={`w-full px-5 font-['El_Messiri'] py-3 md:py-2.5 rounded-full border focus:outline-none transition-colors duration-300 text-base md:text-lg text-gray-700 bg-white ${
                                    isMessageVisible && errorField === 'email'
                                        ? 'border-red-500 focus:border-red-600 bg-red-50/30' 
                                        : 'border-gray-300 focus:border-[#42705D]'
                                }`}
                            />
                        </div>

                        {/* Блок з паролями */}
                        <div className="bg-gray-50/50 p-3 -mx-3 rounded-2xl border border-transparent transition-colors duration-300 relative">

                            {/* АНІМОВАНИЙ БЛОК ПОМИЛКИ ПАРОЛЯ */}
                            <div className={`transition-all duration-500 overflow-hidden ${isPasswordErrorVisible ? 'max-h-20 opacity-100 mb-3' : 'max-h-0 opacity-0 -mb-3'}`}>
                                <div className="text-red-500 text-[12px] md:text-[13px] font-medium bg-red-50 border border-red-200 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    {passwordError}
                                </div>
                            </div>

                            <div className="mb-3 relative">
                                <label className="inline-block text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 mb-1 ml-4">{t('register_page.password_label')}</label>
                                <div className="relative z-20">
                                    <input
                                        type={showPassword1 ? "text" : "password"}
                                        name="password1"
                                        value={formData.password1}
                                        onChange={handleChange}
                                        onFocus={() => setIsPassword1Focused(true)}
                                        onBlur={() => setIsPassword1Focused(false)}
                                        required
                                        placeholder={t('register_page.password_placeholder')}
                                        className={`w-full px-5 py-3 md:py-2.5 font-['El_Messiri'] rounded-full border focus:outline-none transition-colors duration-300 text-base md:text-lg text-gray-700 bg-white pr-12 ${
                                            isPasswordErrorVisible && errorField === 'password1'
                                                ? 'border-red-500 focus:border-red-600 bg-red-50/30' 
                                                : 'border-gray-300 focus:border-[#42705D]'
                                        }`}
                                    />
                                    {formData.password1.length > 0 && (
                                        <button type="button" onClick={() => setShowPassword1(!showPassword1)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#42705D] transition-colors focus:outline-none z-30">
                                            {showPassword1 ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
                                        </button>
                                    )}
                                </div>

                                {/* === АБСОЛЮТНИЙ БЛОК ПІДКАЗОК === */}
                                <div className={`absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 p-4 z-40 transition-all duration-300 origin-top pointer-events-none ${
                                    // Тільки якщо є фокус І пароль ще слабкий
                                    (isPassword1Focused && pwdStrength < 5)
                                    ? 'opacity-100 scale-y-100 translate-y-0'
                                    : 'opacity-0 scale-y-95 -translate-y-2'
                                }`}>
                                    <div className="flex gap-1 h-1.5 mb-2">
                                        {[1, 2, 3, 4, 5].map(level => (
                                            <div key={level} className={`w-full rounded-full transition-colors duration-300 ${pwdStrength >= level ? strengthColors[pwdStrength] : 'bg-gray-200'}`} />
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-[11px] font-bold ${strengthColors[pwdStrength].replace('bg-', 'text-')}`}>{strengthLabels[pwdStrength]}</span>
                                    </div>
                                    <ul className="text-[11px] text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-['Inter']">
                                        <li className="flex items-center gap-1.5">
                                            {formData.password1.length >= 8
                                                ? <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                : <span className="text-gray-300 shrink-0 text-sm leading-none">•</span>}
                                            <span className={formData.password1.length >= 8 ? 'text-green-600 font-medium' : ''}>{t('register_page.req_length')}</span>
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            {/[A-ZА-ЯІЇЄҐ]/.test(formData.password1)
                                                ? <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                : <span className="text-gray-300 shrink-0 text-sm leading-none">•</span>}
                                            <span className={/[A-ZА-ЯІЇЄҐ]/.test(formData.password1) ? 'text-green-600 font-medium' : ''}>{t('register_page.req_upper')}</span>
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            {/[0-9]/.test(formData.password1)
                                                ? <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                : <span className="text-gray-300 shrink-0 text-sm leading-none">•</span>}
                                            <span className={/[0-9]/.test(formData.password1) ? 'text-green-600 font-medium' : ''}>{t('register_page.req_number')}</span>
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            {/[^A-Za-z0-9А-Яа-яІіЇїЄєҐґ]/.test(formData.password1)
                                                ? <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                : <span className="text-gray-300 shrink-0 text-sm leading-none">•</span>}
                                            <span className={/[^A-Za-z0-9А-Яа-яІіЇїЄєҐґ]/.test(formData.password1) ? 'text-green-600 font-medium' : ''}>{t('register_page.req_special')}</span>
                                        </li>
                                    </ul>
                                </div>
                                {/* ======================================== */}
                            </div>

                            <div className="relative z-10 mt-2">
                                <label className="inline-block text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 mb-1 ml-4">{t('register_page.password_confirm_label')}</label>
                                <div className="relative">
                                    <input
                                        type={showPassword2 ? "text" : "password"}
                                        name="password2"
                                        value={formData.password2}
                                        onChange={handleChange}
                                        required
                                        placeholder={t('register_page.password_confirm_placeholder')}
                                        className={`w-full px-5 py-3 md:py-2.5 font-['El_Messiri'] rounded-full border focus:outline-none transition-colors duration-300 text-base md:text-lg text-gray-700 bg-white pr-12 ${
                                            isPasswordErrorVisible && errorField === 'password2'
                                                ? 'border-red-500 focus:border-red-600 bg-red-50/30' 
                                                : 'border-gray-300 focus:border-[#42705D]'
                                        }`}
                                    />
                                    {formData.password2.length > 0 && (
                                        <button type="button" onClick={() => setShowPassword2(!showPassword2)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#42705D] transition-colors focus:outline-none">
                                            {showPassword2 ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start pl-4 pt-0">
                            <div className="flex items-center h-5">
                                <input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 text-[#42705D] bg-gray-100 border-gray-300 rounded focus:ring-[#42705D] cursor-pointer shrink-0" />
                            </div>
                            <div className="ml-2 text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 leading-tight pt-[1px]">
                                <label htmlFor="terms" className="cursor-pointer">{t('register_page.terms_agree')}</label>
                                <span onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-blue-600 hover:text-[#42705D] hover:underline cursor-pointer transition">
                                    {t('register_page.terms_link')}
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-[#1A1A1A] text-white font-['El_Messiri'] font-medium rounded-full py-3 md:py-2.5 hover:bg-gray-800 transition mt-1 text-base md:text-lg shadow-md cursor-pointer transition-all duration-300 ease-out active:scale-95 group ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isLoading ? 'Обробка...' : t('register_page.register_btn')}
                        </button>

                        <p className="text-[10px] text-gray-400 text-center mt-0 font-['Inter'] leading-tight">
                            {t('register_page.captcha_notice')} <a href="https://policies.google.com/privacy" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a> {t('register_page.and')} <a href="https://policies.google.com/terms" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">Terms of Service</a> apply.
                        </p>
                    </form>

                    <div className="flex items-center my-5 md:my-6">
                        <div className="flex-grow border-t border-gray-400/50"></div>
                        <span className="px-4 text-sm md:text-base font-['El_Messiri'] text-gray-600 font-bold">{t('register_page.or')}</span>
                        <div className="flex-grow border-t border-gray-400/50"></div>
                    </div>

                    <div className="space-y-3">
                        <button type="button" onClick={() => handleGoogleLogin()} className="w-full flex items-center justify-center gap-2 sm:gap-3 border border-gray-300 rounded-full py-2.5 hover:bg-gray-50 transition text-sm sm:text-base font-medium text-gray-700 hover:border-[#FBBC05] bg-white cursor-pointer transition-all duration-300 ease-out active:scale-95 group">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/><path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"/><path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.545 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
                            <span className="truncate font-['El_Messiri']">{t('register_page.google_btn')}</span>
                        </button>
                    </div>

                    <div className="mt-8 text-center text-sm md:text-base font-['El_Messiri'] text-gray-800 font-medium">
                        {t('register_page.have_account')} <Link to="/login" className="text-blue-600 hover:text-[#42705D] hover:underline font-bold ml-1 transition">{t('register_page.login_link')}</Link>
                    </div>
                </div>

                {showTerms && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left">
                        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto relative shadow-2xl font-['Inter']">
                            <button onClick={() => setShowTerms(false)} className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-[#1A1A1A] transition bg-gray-100 rounded-full p-1 md:bg-transparent md:p-0">
                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                            <h2 className="text-xl md:text-2xl font-['El_Messiri'] font-bold mb-4 md:mb-6 text-[#1A1A1A] pr-8">{t('register_page.terms_title')}</h2>
                            <div className="space-y-3 md:space-y-4 text-sm md:text-base text-gray-600 font-['El_Messiri'] leading-relaxed">
                                <p><strong className="text-gray-800">{t('register_page.terms_1')}</strong><br/>{t('register_page.terms_1_text')}</p>
                                <p><strong className="text-gray-800">{t('register_page.terms_2')}</strong><br/>{t('register_page.terms_2_text')}</p>
                                <p><strong className="text-gray-800">{t('register_page.terms_3')}</strong><br/>{t('register_page.terms_3_text')}</p>
                                <p><strong className="text-gray-800">{t('register_page.terms_4')}</strong><br/>{t('register_page.terms_4_text')}</p>
                                <p><strong className="text-gray-800">{t('register_page.terms_5')}</strong><br/>{t('register_page.terms_5_text')}</p>
                            </div>
                            <div className="mt-6 md:mt-8 flex justify-end">
                                <button onClick={() => { setShowTerms(false); setAgreed(true); }} className="w-full md:w-auto bg-[#1A1A1A] text-white font-medium font-['El_Messiri'] px-8 py-3 rounded-full hover:bg-gray-800 transition shadow-md text-sm md:text-base cursor-pointer transition-all duration-300 ease-out active:scale-95 group">
                                    {t('register_page.terms_btn')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY_2}
                size="invisible"
                badge="bottomright"
                hl={i18n.language === 'en' ? 'en' : i18n.language === 'pl' ? 'pl' : 'uk'}
                onErrored={() => recaptchaRef.current && recaptchaRef.current.reset()}
                onExpired={() => recaptchaRef.current && recaptchaRef.current.reset()}
            />
        </div>
    );
};

export default Register;