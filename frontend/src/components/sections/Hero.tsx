import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaFileDownload, FaInstagram, FaEnvelope, FaEye } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import GridBackground from '../layout/GridBackground';
import ResumePreviewModal from '../ui/ResumePreviewModal';
import { useToast } from '../../context/ToastContext';
import { useContactModal } from '../../context/ContactModalContext';

import api from '../../services/api';

const TypewriterLoop = ({ texts, speed = 100, pause = 1500 }: { texts: string[], speed?: number, pause?: number }) => {
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);

    // Blinking cursor
    const [blink, setBlink] = useState(true);

    // Typing effect
    useEffect(() => {
        if (!texts || texts.length === 0) return;

        if (subIndex === texts[index].length + 1 && !reverse) {
            const timeout = setTimeout(() => setReverse(true), pause);
            return () => clearTimeout(timeout);
        }

        if (subIndex === 0 && reverse) {
            const timeout = setTimeout(() => {
                setReverse(false);
                setIndex((prev) => (prev + 1) % texts.length);
            }, 0);
            return () => clearTimeout(timeout);
        }

        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, speed);

        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse, texts, speed, pause]);

    // Reset subtitles when texts change (language switch)
    useEffect(() => {
        const timeout = setTimeout(() => {
            setSubIndex(0);
            setReverse(false);
            setIndex(0);
        }, 0);
        return () => clearTimeout(timeout);
    }, [texts]);

    // Cursor blinking
    useEffect(() => {
        const timeout2 = setInterval(() => {
            setBlink((prev) => !prev);
        }, 500);
        return () => clearInterval(timeout2);
    }, []);

    if (!texts || texts.length === 0) return null;

    return (
        <span>
            {texts[index].substring(0, subIndex)}
            <span className={`${blink ? 'opacity-100' : 'opacity-0'} ml-1`}>|</span>
        </span>
    );
};

export default function Hero() {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { openContactModal } = useContactModal();
    const [resumeUrl, setResumeUrl] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        api.get('/resumes')
            .then(({ data }) => {
                if (Array.isArray(data) && data.length > 0) {
                    setResumeUrl(data[0].fileUrl);
                }
            })
            .catch(console.error);
    }, []);

    const roles = t('hero.roles', { returnObjects: true }) as string[];

    return (
        <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-[#0a0a0a] text-center px-6 transition-colors duration-300">
            <GridBackground />

            <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
                {/* Profile Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6 p-1 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 shadow-xl"
                >
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white dark:border-[#0a0a0a] bg-gray-100 dark:bg-gray-800 shadow-inner">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Isaac"
                            alt="Isaac N."
                            className="w-full h-full object-cover"
                        />
                    </div>
                </motion.div>

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <h2 className="text-lg md:text-xl font-medium text-gray-900 dark:text-gray-300 mb-3">
                        {t('hero.greeting')} <span className="text-purple-600 dark:text-pink-500 font-bold">
                            <TypewriterLoop
                                texts={roles}
                            />
                        </span>
                    </h2>

                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight drop-shadow-sm dark:drop-shadow-none">
                        Isaac Nachate
                    </h1>

                    <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed font-medium dark:font-normal">
                        {t('hero.tagline')}
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                        <button
                            onClick={() => {
                                if (resumeUrl) {
                                    setShowPreview(true);
                                } else {
                                    showToast(t('hero.resume_not_found'), 'info');
                                }
                            }}
                            className={`w-12 h-12 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/20 rounded-full flex items-center justify-center text-gray-700 dark:text-white transition-all hover:scale-105 shadow-sm dark:shadow-none ${!resumeUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={t('hero.view_cv')}
                        >
                            <FaEye size={20} />
                        </button>
                        <a
                            href={resumeUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                                if (!resumeUrl) {
                                    e.preventDefault();
                                    showToast(t('hero.resume_not_found'), 'info');
                                }
                            }}
                            className={`px-6 py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all flex items-center gap-2 text-sm md:text-base cursor-pointer shadow-lg hover:shadow-xl ${!resumeUrl ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        >
                            <FaFileDownload /> {t('hero.download_cv')}
                        </a>
                        <button
                            onClick={openContactModal}
                            className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-sm md:text-base"
                        >
                            {t('nav.contact')}
                        </button>
                    </div>

                    {/* Socials */}
                    <div className="flex justify-center gap-5">
                        <a href="https://www.instagram.com/isaac.nct/" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white transition-colors bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 shadow-sm dark:shadow-none">
                            <FaInstagram size={18} />
                        </a>
                        <a href="https://www.linkedin.com/in/isaac-nachate-b59229343/" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white transition-colors bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 shadow-sm dark:shadow-none">
                            <FaLinkedin size={18} />
                        </a>
                        <a href="https://github.com/2333476" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white transition-colors bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 shadow-sm dark:shadow-none">
                            <FaGithub size={18} />
                        </a>
                        <button onClick={openContactModal} className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white transition-colors bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 shadow-sm dark:shadow-none">
                            <FaEnvelope size={18} />
                        </button>
                    </div>

                </motion.div>
            </div>


            <ResumePreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                resumeUrl={resumeUrl}
            />
        </section>
    );
}
