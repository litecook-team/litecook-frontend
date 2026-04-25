import React, { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // ІМПОРТ ПЕРЕКЛАДУ
import authBg from '../assets/auth/exit.jpg';

const ResetPasswordConfirm = () => {
    const { t } = useTranslation(); // ІНІЦІАЛІЗАЦІЯ ПЕРЕКЛАДУ

    const { uid, token } = useParams();
    const navigate = useNavigate();

    const [passwords, setPasswords] = useState({ new_password1: '', new_password2: '' });
    const [message, setMessage] = useState('');
    const [passwordError, setPasswordError] = useState(''); // Для локальних помилок пароля

    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

    const pwdErrorTimerRef = useRef(null);

    const showPasswordErrorMessage = (text) => {
        setPasswordError(text);
        if (pwdErrorTimerRef.current) clearTimeout(pwdErrorTimerRef.current);
        pwdErrorTimerRef.current = setTimeout(() => setPasswordError(''), 5000);
    };

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });

        // Миттєве очищення помилки при новому вводі
        setPasswordError('');
        if (pwdErrorTimerRef.current) clearTimeout(pwdErrorTimerRef.current);
    };

    const calculateStrength = (password) => {
        let score = 0;
        if (!password) return 0;
        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password) || /[А-ЯІЇЄҐ]/.test(password)) score += 1;
        if (/[a-z]/.test(password) || /[а-яіїєґ]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9А-Яа-яІіЇїЄєҐґ]/.test(password)) score += 1;
        return score;
    };

    const pwdStrength = calculateStrength(passwords.new_password1);
    const strengthColors = ['bg-gray-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

    // Беремо підписи міцності з перекладу сторінки реєстрації (щоб не дублювати)
    const strengthLabels = [t('register_page.str_0'), t('register_page.str_1'), t('register_page.str_2'), t('register_page.str_3'), t('register_page.str_4'), t('register_page.str_5')];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');

        if (passwords.new_password1.length < 8) {
            showPasswordErrorMessage(t('register_page.error_length'));
            return;
        }

        if (pwdStrength < 3) {
            showPasswordErrorMessage(t('register_page.error_weak'));
            return;
        }

        if (passwords.new_password1 !== passwords.new_password2) {
            showPasswordErrorMessage(t('register_page.error_match'));
            return;
        }

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/password/reset/confirm/`, {
                uid: uid,
                token: token,
                new_password1: passwords.new_password1,
                new_password2: passwords.new_password2,
            });
            setMessage(t('reset_password_page.success_msg'));
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                // ДИНАМІЧНЕ ПОВІДОМЛЕННЯ: беремо текст помилки прямо від сервера
                if (errorData.new_password1) {
                    showPasswordErrorMessage(errorData.new_password1[0]);
                } else if (errorData.non_field_errors) {
                    showPasswordErrorMessage(errorData.non_field_errors[0]);
                } else if (errorData.uid || errorData.token) {
                    setMessage(t('reset_password_page.error_invalid_link'));
                } else {
                    showPasswordErrorMessage(t('reset_password_page.error_unknown'));
                }
            } else {
                showPasswordErrorMessage(t('reset_password_page.error_server'));
            }
        }
    };

    return (
        <div className="flex-grow w-full flex justify-center md:justify-end items-center p-4 py-16 sm:p-6 md:py-24 md:pr-10 lg:pr-24 xl:pr-32 relative bg-[#f9fafb] bg-[position:-50px_center] md:bg-left bg-cover bg-no-repeat"
             style={{ backgroundImage: `url(${authBg})` }}>

            <Link
                to="/login"
                className="absolute top-6 left-4 sm:left-6 md:top-10 md:left-10 flex items-center px-6 sm:px-10 py-2 bg-white text-gray-800 rounded-[30px] border border-black hover:bg-[#1A1A1A] hover:text-white hover:border-transparent hover:shadow-md transition font-['Inter'] font-medium text-[13px] sm:text-[14px] lg:text-[15px] shadow-lg z-20 gap-2 cursor-pointer transition-all duration-300 ease-out active:scale-95 group"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 8 8 12 12 16"></polyline>
                    <line x1="16" y1="12" x2="8" y2="12"></line>
                </svg>
                {t('reset_password_page.back_btn')}
            </Link>

            <div className="flex flex-col items-center w-full max-w-[700px] z-10 pt-12 md:pt-0">

                <div className="text-5xl sm:text-6xl lg:text-7xl xl:text-[80px] font-['El_Messiri'] text-[#1A1A1A] mb-8 md:mb-12 tracking-wide lg:tracking-[0.15em] whitespace-nowrap w-max pl-[0.05em] lg:pl-[0.15em] drop-shadow-sm text-center">
                    L I T E &nbsp; c o o k
                </div>

                <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-[2rem] p-6 sm:p-10 w-full max-w-[580px] font-['Inter'] mx-auto">

                    <h1 className="text-3xl md:text-3xl font-['El_Messiri'] font-black mb-6 md:mb-8 text-[#1A1A1A] text-center md:text-left drop-shadow-sm">
                        {t('reset_password_page.title')}
                    </h1>

                    <div className={`transition-all duration-500 overflow-hidden ${message ? 'max-h-24 opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'}`}>
                        <div className={`text-xs md:text-[13px] p-3 rounded-lg font-medium border bg-white/80 backdrop-blur-sm inline-block ${message.includes('успішно') || message.includes('success') || message.includes('pomyślnie') ? 'text-green-600 border-green-200' : 'text-red-500 border-red-200'}`}>
                            {message}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* БЛОК ПАРОЛІВ */}
                        <div className="bg-gray-50/50 p-3 -mx-3 rounded-2xl border border-transparent transition-colors duration-300">

                            {/* ЛОКАЛЬНА ПОМИЛКА ПАРОЛЯ */}
                            <div className={`transition-all duration-500 overflow-hidden ${passwordError ? 'max-h-20 opacity-100 mb-3' : 'max-h-0 opacity-0 -mb-3'}`}>
                                <div className="text-red-500 text-[12px] md:text-[13px] font-medium bg-red-50 border border-red-200 px-4 py-2 rounded-xl flex items-center gap-2">
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    {passwordError}
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="inline-block text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 mb-1 ml-4">{t('reset_password_page.password_label')}</label>
                                <div className="relative">
                                    <input type={showPassword1 ? "text" : "password"} name="new_password1" value={passwords.new_password1} onChange={handleChange} required placeholder={t('reset_password_page.password_placeholder')} className={`w-full px-5 py-3 md:py-2.5 font-['El_Messiri'] rounded-full border focus:outline-none transition text-base md:text-lg text-gray-700 bg-white pr-12 ${passwordError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-[#42705D]'}`} />
                                    {passwords.new_password1.length > 0 && (
                                        <button type="button" onClick={() => setShowPassword1(!showPassword1)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#42705D] transition-colors focus:outline-none">
                                            {showPassword1 ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
                                        </button>
                                    )}
                                </div>

                                {passwords.new_password1 && (
                                    <div className="mt-2 px-2">
                                        <div className="flex gap-1 h-1.5">
                                            {[1, 2, 3, 4, 5].map(level => (
                                                <div key={level} className={`w-full rounded-full transition-colors duration-300 ${pwdStrength >= level ? strengthColors[pwdStrength] : 'bg-gray-200'}`} />
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className={`text-[11px] ${strengthColors[pwdStrength].replace('bg-', 'text-')}`}>{strengthLabels[pwdStrength]}</span>
                                        </div>
                                        <ul className="text-[11px] text-gray-500 mt-1 grid grid-cols-2 gap-1 font-['Inter']">
                                            {passwords.new_password1.length < 8 && (<li><span className="text-gray-400 mr-1">○</span>{t('register_page.req_length')}</li>)}
                                            {!/[A-ZА-ЯІЇЄҐ]/.test(passwords.new_password1) && (<li><span className="text-gray-400 mr-1">○</span>{t('register_page.req_upper')}</li>)}
                                            {!/[0-9]/.test(passwords.new_password1) && (<li><span className="text-gray-400 mr-1">○</span>{t('register_page.req_number')}</li>)}
                                            {!/[^A-Za-z0-9А-Яа-яІіЇїЄєҐґ]/.test(passwords.new_password1) && (<li><span className="text-gray-400 mr-1">○</span>{t('register_page.req_special')}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="inline-block text-sm md:text-base font-semibold font-['El_Messiri'] text-gray-800 mb-1 ml-4">{t('reset_password_page.password_confirm_label')}</label>
                                <div className="relative">
                                    <input type={showPassword2 ? "text" : "password"} name="new_password2" value={passwords.new_password2} onChange={handleChange} required placeholder={t('reset_password_page.password_confirm_placeholder')} className={`w-full px-5 py-3 md:py-2.5 font-['El_Messiri'] rounded-full border focus:outline-none transition text-base md:text-lg text-gray-700 bg-white pr-12 ${passwordError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-[#42705D]'}`} />
                                    {passwords.new_password2.length > 0 && (
                                        <button type="button" onClick={() => setShowPassword2(!showPassword2)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#42705D] transition-colors focus:outline-none">
                                            {showPassword2 ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-[#1A1A1A] text-white font-['El_Messiri'] font-medium rounded-full py-3 md:py-2.5 hover:bg-gray-800 transition mt-6 text-base md:text-lg shadow-md cursor-pointer transition-all duration-300 ease-out active:scale-95 group">
                            {t('reset_password_page.save_btn')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordConfirm;