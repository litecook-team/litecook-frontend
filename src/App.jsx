import React, { useState, useEffect } from 'react'; // Додали useState та useEffect
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import api from './api'; // Додали імпорт api
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import ConfirmEmail from './pages/ConfirmEmail';
import Register from './pages/Register';
import Profile from './pages/Profile';
import RecipeDetail from './pages/RecipeDetail';

import Recipes from './pages/Recipes';
import Favorites from './pages/Favorites';
import Menu from './pages/Menu';
import About from './pages/About';
import ResetPassword from './pages/ResetPassword';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PrivacyDetail from './pages/PrivacyDetail';
import { TOKEN_KEY } from './constants/api'; // Імпорт ключа токена

import NotFound from './pages/NotFound';
import Banned from './pages/Banned';

// ІМПОРТУЄМО НАШОГО АСИСТЕНТА
import ChatAssistant from './components/ChatAssistant';

// =========================================================================
// HOC (High Order Component) для захисту сторінок, доступних ТІЛЬКИ ГОСТЯМ
// =========================================================================
const GuestRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem(TOKEN_KEY) || !!sessionStorage.getItem(TOKEN_KEY);

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

// =========================================================================
// HOC для сторінок, доступних ТІЛЬКИ АВТОРИЗОВАНИМ користувачам
// =========================================================================
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem(TOKEN_KEY) || !!sessionStorage.getItem(TOKEN_KEY);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// =========================================================================
// ОБГОРТКА ДЛЯ ЧАТУ (Вона перевіряє авторизацію та статус ШІ ПРИ КОЖНОМУ ПЕРЕХОДІ)
// =========================================================================
const ChatAssistantWrapper = () => {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem(TOKEN_KEY) || !!sessionStorage.getItem(TOKEN_KEY);
  const [isAiEnabled, setIsAiEnabled] = useState(false);

  // Перевіряємо на бекенді, чи адміністратор увімкнув чат
  useEffect(() => {
    if (isAuthenticated) {
      api.get('/api/ai-chat/')
         .then(res => setIsAiEnabled(res.data.is_enabled))
         .catch(() => setIsAiEnabled(false)); // Якщо помилка або вимкнено — ховаємо чат
    }
  }, [isAuthenticated, location.pathname]); // Перевіряємо при вході та зміні сторінок

  // Якщо користувач не увійшов, АБО адмін вимкнув ШІ — не показуємо кнопку взагалі
  if (!isAuthenticated || !isAiEnabled) return null;

  return <ChatAssistant />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans bg-[#fbfbfb]">
        <Header />
        <main className="flex-grow flex flex-col w-full">
            <Routes>
                {/* Публічні сторінки */}
                <Route path="/" element={<Home />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password-confirm/:uid/:token" element={<ResetPasswordConfirm />} />
                <Route path="/confirm-email/:key" element={<ConfirmEmail />} />
                <Route path="/banned" element={<Banned />} />
                <Route path="/recipe/:id" element={<RecipeDetail />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/about" element={<About />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/privacy/:section" element={<PrivacyDetail />} />

                {/* Сторінки ТІЛЬКИ ДЛЯ ГОСТЕЙ */}
                <Route path="/login" element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                } />
                <Route path="/register" element={
                  <GuestRoute>
                    <Register />
                  </GuestRoute>
                } />

                {/* Захищені сторінки */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/favorites" element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                } />
                <Route path="/menu" element={
                  <ProtectedRoute>
                    <Menu />
                  </ProtectedRoute>
                } />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </main>
        <Footer />

        {/* Наш розумний помічник Gemini */}
        <ChatAssistantWrapper />

      </div>
    </Router>
  );
}

export default App;