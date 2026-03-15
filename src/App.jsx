import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import ConfirmEmail from './pages/ConfirmEmail';
import Register from './pages/Register';
import Profile from './pages/Profile';


import Recipes from './pages/Recipes';
import Favorites from './pages/Favorites';
import Menu from './pages/Menu';
import About from './pages/About';
import Contacts from './pages/Contacts';
import ResetPassword from './pages/ResetPassword';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans bg-[#fbfbfb]">
        <Header />
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password-confirm/:uid/:token" element={<ResetPasswordConfirm />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/confirm-email/:key" element={<ConfirmEmail />} />

            <Route path="/recipes" element={<Recipes />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/about" element={<About />} />
            <Route path="/contacts" element={<Contacts />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;