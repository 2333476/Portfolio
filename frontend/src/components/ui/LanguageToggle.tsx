import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function LanguageToggle() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'fr' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors shadow-sm"
        >
            <span className={i18n.language === 'en' ? 'text-purple-600 dark:text-purple-400' : ''}>EN</span>
            <span className="w-px h-3 bg-gray-300 dark:bg-gray-700" />
            <span className={i18n.language === 'fr' ? 'text-purple-600 dark:text-purple-400' : ''}>FR</span>
        </motion.button>
    );
}
