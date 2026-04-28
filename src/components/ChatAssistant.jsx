import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import api from '../api';

const ChatAssistant = () => {
    const { t, i18n } = useTranslation();

    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmClear, setShowConfirmClear] = useState(false);

    // Стан для мікрофона (закоментовано)
    // const [isListening, setIsListening] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

    // === ПОКРАЩЕНА ФУНКЦІЯ ОЗВУЧКИ (Без символів та URL) ===
    const speakText = (text) => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();

        // 1. Витягуємо текст з посилань: перетворюємо [Назва рецепту](/url) просто на "Назва рецепту"
        let cleanText = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

        // 2. Видаляємо всі технічні символи Markdown (зірочки, решітки, підкреслення, дужки)
        cleanText = cleanText.replace(/[*#_`~\[\]()]/g, '').trim();

        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = i18n.language === 'en' ? 'en-US' : (i18n.language === 'pl' ? 'pl-PL' : 'uk-UA');

        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            const voice = voices.find(v => v.lang.startsWith(utterance.lang.substring(0, 2)));
            if (voice) utterance.voice = voice;
        }

        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
        }
    }, []);

    useEffect(() => {
        const savedSession = localStorage.getItem('litecook_ai_session');
        if (savedSession) {
            const { timestamp, history } = JSON.parse(savedSession);
            if (Date.now() - timestamp < SESSION_TIMEOUT_MS) {
                setMessages(history);
            } else {
                localStorage.removeItem('litecook_ai_session');
            }
        }
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('litecook_ai_session', JSON.stringify({
                timestamp: Date.now(),
                history: messages
            }));
        }
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // === ПРАВИЛЬНА АСИНХРОННА ВІДПРАВКА БЕЗ ДУБЛЮВАННЯ ===
    const triggerMessageSend = async (messageText) => {
        if (!messageText.trim() || isLoading) return;

        setInput('');
        setIsLoading(true);

        // 1. Оновлюємо інтерфейс локально (показуємо повідомлення юзера)
        const userMsg = { role: 'user', text: messageText };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);

        // 2. Відправляємо запит
        try {
            const res = await api.post('/api/ai-chat/', {
                message: messageText,
                current_path: location.pathname,
                history: messages // відправляємо стару історію
            });

            let replyText = res.data.reply;

            // Перевіряємо наявність команди переходу
            const navRegex = /^\[NAVIGATE:([^\]]+)\]\s*/i;
            const match = replyText.match(navRegex);

            if (match) {
                const pathToNavigate = match[1];
                replyText = replyText.replace(navRegex, '').trim();
                navigate(pathToNavigate);
                // setIsOpen(false); // автоматично закриває вікно чату після переходу на іншу сторінку
            }

            // Додаємо відповідь ШІ
            setMessages([...updatedMessages, { role: 'model', text: replyText }]);

            // Озвучуємо відповідь (ШІ продовжує розмовляти з нами)
            setTimeout(() => speakText(replyText), 100);

        } catch (error) {
            const errorText = error.response?.data?.error || t('ai_chat.error_conn');
            setMessages([...updatedMessages, { role: 'model', text: errorText }]);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if ('speechSynthesis' in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
        triggerMessageSend(input);
    };

    /* === ЗАКОМЕНТОВАНА ФУНКЦІЯ МІКРОФОНА ===
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert(t('ai_chat.no_mic_support') || "Ваш браузер не підтримує голосовий ввід.");
            return;
        }

        if ('speechSynthesis' in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));

        const recognition = new SpeechRecognition();
        recognition.lang = i18n.language === 'en' ? 'en-US' : (i18n.language === 'pl' ? 'pl-PL' : 'uk-UA');
        recognition.interimResults = false;
        recognition.continuous = false;

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev + (prev.length > 0 && !prev.endsWith(' ') ? ' ' : '') + transcript);
        };

        recognition.onerror = (event) => {
            console.error("Помилка мікрофона:", event.error);
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);

        recognition.start();
    };
    */

    const confirmClearChat = () => {
        setMessages([]);
        localStorage.removeItem('litecook_ai_session');
        setShowConfirmClear(false);
    };

    const markdownComponents = {
        p: ({node, ...props}) => <p className="mb-2.5 last:mb-0 leading-relaxed" {...props} />,
        strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
        ul: ({node, ...props}) => <ul className="list-none pl-1 mb-3 space-y-2 mt-2" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-2 mt-2 font-bold text-gray-800 marker:text-[#5B826B]" {...props} />,
        li: ({node, ...props}) => (
            <li className="flex items-start gap-2">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#5B826B] mt-2"></span>
                <span className="flex-1 font-normal text-gray-800" {...props} />
            </li>
        ),
        h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2 mt-3 text-[#5B826B] font-['El_Messiri']" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2 mt-3 text-[#5B826B] font-['El_Messiri']" {...props} />,
        a: ({node, href, children, ...props}) => {
            if (href && href.startsWith('/')) {
                return (
                    <Link to={href} className="inline-flex items-center gap-1 text-[#B47231] font-bold hover:text-[#974F23] underline decoration-[#B47231]/30 hover:decoration-[#974F23] transition-colors mt-1">
                        {children}
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </Link>
                );
            }
            return <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#B47231] font-bold underline" {...props}>{children}</a>;
        }
    };

    const windowClasses = isExpanded
        ? "w-[95vw] sm:w-[650px] md:w-[800px] h-[85vh] sm:h-[80vh]"
        : "w-[90vw] sm:w-[380px] h-[75vh] sm:h-[500px] max-h-[80vh]";

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
            {isOpen && (
                <div className={`mb-4 bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-scaleIn origin-bottom-right transition-all duration-300 ease-in-out relative ${windowClasses}`}>

                    {showConfirmClear && (
                        <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-fadeIn">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-100 shadow-sm">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </div>
                            <h3 className="text-2xl font-bold font-['El_Messiri'] text-gray-900 mb-2 text-center tracking-wide">{t('ai_chat.confirm_title')}</h3>
                            <p className="text-[15px] font-['Inter'] text-gray-600 text-center mb-8 px-4 leading-relaxed">
                                {t('ai_chat.confirm_desc')}
                            </p>

                            <div className="flex gap-3 w-full max-w-[280px]">
                                <button onClick={() => setShowConfirmClear(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-colors cursor-pointer">
                                    {t('ai_chat.btn_cancel')}
                                </button>
                                <button onClick={confirmClearChat} className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-bold hover:bg-red-600 transition-colors shadow-md cursor-pointer">
                                    {t('ai_chat.btn_clear')}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="bg-[#5B826B] text-white p-3.5 sm:p-4 flex justify-between items-center shrink-0 shadow-sm z-10">
                        <div className="flex items-center gap-2">
                            <span className="text-xl drop-shadow-md">✨</span>
                            <h3 className="font-bold font-['El_Messiri'] text-[19px] tracking-wide">{t('ai_chat.title')}</h3>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                            {messages.length > 0 && (
                                <button onClick={() => setShowConfirmClear(true)} className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-xl transition-all cursor-pointer" title={t('ai_chat.clear_tooltip')}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            )}

                            <button onClick={() => setIsExpanded(!isExpanded)} className="hidden sm:flex text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-xl transition-all cursor-pointer" title={isExpanded ? t('ai_chat.shrink_tooltip') : t('ai_chat.expand_tooltip')}>
                                {isExpanded ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H1m14 0h6m-6 0a2 2 0 00-2 2v6m-4-6a2 2 0 012-2h6"></path></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                                )}
                            </button>

                            <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-1 rounded-xl transition-all ml-1 cursor-pointer">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#F6F3F4] space-y-5 custom-scrollbar relative">
                        {messages.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 opacity-60">
                                <span className="text-5xl grayscale opacity-50 mb-4">🥑</span>
                                <h4 className="font-['El_Messiri'] font-bold text-gray-800 text-lg mb-1">{t('ai_chat.title_empty')}</h4>
                                <p className="text-sm font-['Inter'] text-gray-600">{t('ai_chat.welcome')}</p>
                            </div>
                        )}

                        <div className="relative z-10 space-y-5">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[92%] sm:max-w-[85%] px-4 py-3 rounded-2xl text-[14.5px] font-['Inter'] shadow-sm ${
                                        msg.role === 'user' 
                                        ? 'bg-[#B47231] text-white rounded-br-sm' 
                                        : 'bg-white text-gray-700 border border-gray-100 rounded-bl-sm'
                                    }`}>
                                        {msg.role === 'user' ? (
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                        ) : (
                                            <div className="prose-sm">
                                                <ReactMarkdown components={markdownComponents}>{msg.text}</ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5 border border-gray-100 h-[45px]">
                                        <div className="w-2 h-2 bg-[#5B826B]/50 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-[#5B826B]/70 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                        <div className="w-2 h-2 bg-[#5B826B] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <form onSubmit={sendMessage} className="p-3 sm:p-4 bg-white border-t border-gray-100 flex gap-2 shrink-0 items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            // placeholder={isListening ? "Слухаю вас..." : t('ai_chat.placeholder')} // Закоментовано
                            placeholder={t('ai_chat.placeholder')}
                            // className={`flex-1 border rounded-full px-5 py-3.5 outline-none text-[15px] font-['Inter'] transition-all shadow-inner ${isListening ? 'bg-red-50 border-red-300 text-red-900 placeholder:text-red-400' : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-[#5B826B] focus:bg-white placeholder:text-gray-400'}`}
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3.5 outline-none text-[15px] text-gray-800 font-['Inter'] focus:border-[#5B826B] focus:bg-white transition-all shadow-inner placeholder:text-gray-400"
                        />

                        {/* КНОПКА МІКРОФОНА (ЗАКОМЕНТОВАНО)
                        <button
                            type="button"
                            onClick={startListening}
                            className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer active:scale-95 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            title="Голосовий ввід"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 1v10M12 1v10m0 0a4 4 0 01-4-4v-4a4 4 0 018 0v4a4 4 0 01-4 4zM5 11v2a7 7 0 0014 0v-2M12 18v4M8 22h8"></path></svg>
                        </button>
                        */}

                        <button type="submit" disabled={!input.trim() || isLoading} className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full bg-[#5B826B] text-white flex items-center justify-center hover:bg-[#42705D] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-md active:scale-95 group cursor-pointer">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-1 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        </button>
                    </form>
                </div>
            )}

            {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="w-16 h-16 bg-[#B47231] text-white rounded-full shadow-2xl hover:scale-110 hover:shadow-[0_10px_30px_rgba(180,114,49,0.4)] transition-all duration-300 flex items-center justify-center group border-2 border-white/20 z-50 cursor-pointer">
                    <svg className="w-8 h-8 group-hover:rotate-12 transition-transform drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                </button>
            )}
        </div>
    );
};

export default ChatAssistant;