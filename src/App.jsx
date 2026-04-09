import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// =========================================================================
// HOC (High Order Component) для захисту сторінок, доступних ТІЛЬКИ ГОСТЯМ
// (наприклад, Login, Register). Якщо юзер вже увійшов - його перекине в профіль.
// =========================================================================
const GuestRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem(TOKEN_KEY) || !!sessionStorage.getItem(TOKEN_KEY);

  if (isAuthenticated) {
    // replace: true замінює поточний запис в історії браузера, щоб юзер не міг повернутися кнопкою "Назад"
    return <Navigate to="/profile" replace />;
  }

  // Якщо юзер не авторизований - показуємо сторінку (дітей цього компонента)
  return children;
};

// =========================================================================
// Опціонально: HOC для сторінок, доступних ТІЛЬКИ АВТОРИЗОВАНИМ користувачам
// (наприклад, Профіль, Улюблені). Можливо знадобиться в майбутньому.
// =========================================================================
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem(TOKEN_KEY) || !!sessionStorage.getItem(TOKEN_KEY);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans bg-[#fbfbfb]">
        <Header />
        <main className="flex-grow flex flex-col w-full">
            <Routes>
                {/* Публічні сторінки (доступні всім) */}
                <Route path="/" element={<Home />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password-confirm/:uid/:token" element={<ResetPasswordConfirm />} />
                <Route path="/confirm-email/:key" element={<ConfirmEmail />} />
                <Route path="/recipe/:id" element={<RecipeDetail />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/about" element={<About />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/privacy/:section" element={<PrivacyDetail />} />

                {/* ЗМІНЕНО: Сторінки ТІЛЬКИ ДЛЯ ГОСТЕЙ (перенаправлять в /profile, якщо юзер увійшов) */}
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

                {/* ЗМІНЕНО: Захищені сторінки (можна використовувати ProtectedRoute, якщо треба закрити доступ неавторизованим) */}
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
            </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;