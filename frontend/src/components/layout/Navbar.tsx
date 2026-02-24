import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useContactModal } from '../../context/ContactModalContext';
import { useTheme } from '../../context/ThemeContext';
import LanguageToggle from '../ui/LanguageToggle';

export default function Navbar() {
    const { t } = useTranslation();
    const { openContactModal } = useContactModal();
    const { theme, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        const timeout = setTimeout(() => setIsOpen(false), 0);
        return () => clearTimeout(timeout);
    }, [location]);

    const navLinks = [
        { name: t('nav.home'), to: '/' },
        { name: t('nav.about'), to: '/about' },
        { name: t('nav.work'), to: '/work' },
        { name: t('nav.education'), to: '/education' },
        { name: t('nav.certifications'), to: '/certifications' },
        { name: t('nav.skills'), to: '/skills' },
        { name: t('nav.projects'), to: '/projects' },
        { name: t('nav.testimonials'), to: '/testimonials' },
    ];

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled
            ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-md py-3 shadow-sm dark:shadow-none'
            : 'bg-transparent py-4'
            }`}>
            <div className="max-w-7xl mx-auto px-8 lg:px-12 flex justify-between items-center">
                <NavLink to="/" className="text-2xl font-bold text-gray-900 dark:text-white tracking-tighter hover:text-purple-600 dark:hover:text-purple-400 transition-colors shrink-0">
                    Isaac Nachate
                </NavLink>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center space-x-6 lg:space-x-8">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) => `
                                text-sm font-medium transition-colors duration-200
                                ${isActive
                                    ? 'text-purple-600 dark:text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white'
                                }
                            `}
                        >
                            {link.name}
                        </NavLink>
                    ))}

                    {/* Contact Button */}
                    <button
                        onClick={() => { setIsOpen(false); openContactModal(); }}
                        className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white transition-colors duration-200"
                    >
                        {t('nav.contact')}
                    </button>

                    <div className="flex items-center gap-4">
                        <LanguageToggle />

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white transition-all"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>

                    {/* Login Link */}
                    <a href="/admin/login" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white text-xs border border-gray-300 dark:border-gray-700 hover:border-purple-600 dark:hover:border-gray-500 px-3 py-1.5 rounded transition-all">Login</a>
                </div>

                {/* Mobile Menu Button */}
                <div className="lg:hidden flex items-center gap-4">
                    <LanguageToggle />
                    <button
                        onClick={toggleTheme}
                        className="text-gray-900 dark:text-white"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                    </button>
                    <button onClick={() => setIsOpen(!isOpen)} className="text-gray-900 dark:text-white text-2xl">
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="lg:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 shadow-xl"
                    >
                        <div className="flex flex-col p-6 space-y-4 items-center">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) => `
                                        text-lg font-medium transition-colors
                                        ${isActive ? 'text-purple-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-green-400'}
                                    `}
                                >
                                    {link.name}
                                </NavLink>
                            ))}
                            <button
                                onClick={() => { setIsOpen(false); openContactModal(); }}
                                className="text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-green-400 transition-colors"
                            >
                                {t('nav.contact')}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
