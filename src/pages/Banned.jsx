import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Banned = () => {
    // Отримуємо причину бану з URL параметрів (якщо вона там є)
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const reason = queryParams.get('reason') || "Порушення політики конфіденційності";

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#F6F3F4] flex items-center justify-center p-6 font-['Inter']">
            <div className="bg-white rounded-[2rem] p-10 w-full max-w-md shadow-[0_10px_40px_rgba(0,0,0,0.08)] text-center border border-red-100 relative overflow-hidden">

                {/* Декоративний червоний градієнт зверху */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-800"></div>

                {/* Іконка блокування */}
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm relative z-10">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                </div>

                <h2 className="text-3xl font-['El_Messiri'] text-gray-900 mb-2">Доступ обмежено</h2>
                <h3 className="text-lg text-red-600 font-medium mb-6 uppercase tracking-wider text-[13px]">Акаунт заблоковано</h3>

                <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left border border-gray-100">
                    <p className="text-gray-500 text-sm uppercase tracking-wider mb-1 font-semibold">Причина блокування:</p>
                    <p className="text-gray-800 italic leading-relaxed">«{reason}»</p>
                </div>

                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                    Ваш сеанс було примусово завершено.<br/>
                    Якщо ви вважаєте, що це сталося помилково, будь ласка, зверніться до служби підтримки LITE cook.
                </p>

                <Link to="/" className="inline-block bg-black text-white px-10 py-3.5 rounded-full hover:bg-gray-800 transition font-medium cursor-pointer transition-all duration-300 ease-out active:scale-95 shadow-md w-full">
                    Повернутися на головну
                </Link>
            </div>
        </div>
    );
};

export default Banned;