import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Loader2, Layout, Server, Wrench, Package, ArrowLeft } from 'lucide-react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { getSkillIcon } from '../../utils/skillIcons';
import GridBackground from '../../components/layout/GridBackground';

interface Skill {
    id: string;
    nameEn: string;
    nameFr: string;
    level: number;
    category: string;
    imageUrl?: string;
}

const normalizeCategory = (skill: Skill): 'frontend' | 'backend' | 'tools' | 'other' => {
    const text = (skill.category || skill.nameEn).toLowerCase();
    if (text.includes('front') || text.includes('web') || text.includes('ui') || text.includes('react') || text.includes('css') || text.includes('java script') || text.includes('javascript') || text.includes('typescript') || text.includes('redux') || text.includes('vite') || text.includes('tailwind') || text.includes('next') || text.includes('vue') || text.includes('angular') || text.includes('html')) {
        return 'frontend';
    }
    if (text.includes('back') || text.includes('api') || text.includes('database') || text.includes('sql') || text.includes('data') || text.includes('node') || text.includes('php') || text.includes('java') || text.includes('python') || text.includes('go') || text.includes('c#') || text.includes('c++') || text.includes('ruby') || text.includes('spring')) {
        return 'backend';
    }
    if (text.includes('tool') || text.includes('devops') || text.includes('git') || text.includes('docker') || text.includes('aws') || text.includes('cloud') || text.includes('linux') || text.includes('bash') || text.includes('jenkins') || text.includes('testing')) {
        return 'tools';
    }
    return 'other';
};

// Reused exact component user loved
const SkillItem = ({ skill, index, containerRef, isEn }: { skill: Skill, index: number, containerRef: React.RefObject<HTMLDivElement | null>, isEn: boolean }) => {
    const iconName = getSkillIcon(skill.nameEn);
    const [brandColor] = useState<string>('#a855f7'); // Default purple (simpler without extractor for now)

    // Stable random values
    const [visuals] = useState(() => ({
        duration: 4 + Math.random() * 3,
        delay: Math.random() * 2,
        y: Math.random() * 20 - 10,
        x: Math.random() * 15 - 7.5,
        marginTop: Math.random() * 60
    }));

    const skillName = isEn ? skill.nameEn : skill.nameFr;

    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference - ((skill.level || 0) / 100) * circumference;

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
                scale: 1,
                opacity: 1,
                y: [0, visuals.y, 0, -visuals.y, 0],
                x: [0, visuals.x, 0, -visuals.x, 0]
            }}
            transition={{
                scale: { type: "spring", stiffness: 260, damping: 20, delay: index * 0.05 },
                opacity: { delay: index * 0.05 },
                y: { duration: visuals.duration, repeat: Infinity, ease: "easeInOut", delay: visuals.delay },
                x: { duration: visuals.duration * 1.3, repeat: Infinity, ease: "easeInOut", delay: visuals.delay }
            }}
            whileHover={{ scale: 1.15, zIndex: 50, cursor: 'grab' }}
            whileTap={{ scale: 0.95, cursor: 'grabbing' }}
            drag
            dragConstraints={containerRef}
            style={{ marginTop: `${visuals.marginTop}px`, '--brand-color': brandColor } as React.CSSProperties & { [key: string]: string | number }}
            className="flex flex-col items-center justify-center relative group"
        >
            <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
                <div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-40 transition-all duration-500 blur-xl"
                    style={{ backgroundColor: brandColor }}
                />
                <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-lg z-10" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                    <motion.circle
                        cx="60" cy="60" r={radius} stroke={brandColor} strokeWidth="4" fill="transparent"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        whileInView={{ strokeDashoffset: progressOffset }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                    />
                </svg>
                <div
                    className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gray-900/80 border border-white/10 flex items-center justify-center p-4 shadow-inner backdrop-blur-md z-20 relative overflow-hidden group-hover:bg-gray-900/90 transition-all duration-300"
                    style={{ borderColor: `${brandColor}40` }}
                >
                    <div
                        className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-300"
                        style={{ background: `radial-gradient(circle, ${brandColor}, transparent 70%)` }}
                    />
                    {skill.imageUrl ? (
                        <img
                            src={skill.imageUrl}
                            alt=""
                            className="w-full h-full object-contain filter drop-shadow-md relative z-30 group-hover:scale-110 transition-transform duration-300 pointer-events-none"
                        />
                    ) : (
                        <Icon
                            icon={iconName}
                            className="w-full h-full object-contain filter drop-shadow-md relative z-30 group-hover:scale-110 transition-transform duration-300 pointer-events-none text-white"
                        />
                    )}
                </div>
                <div
                    className="absolute -bottom-3 px-2 py-0.5 bg-gray-900 border border-white/10 rounded-full text-[10px] md:text-xs font-mono font-bold text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-40 translate-y-2 group-hover:translate-y-0"
                    style={{ borderColor: brandColor, color: brandColor, boxShadow: `0 4px 12px ${brandColor}30` }}
                >
                    {skill.level}%
                </div>
            </div>
            <div className="mt-2 text-center pointer-events-none">
                <h3
                    className="font-bold text-xs md:text-sm tracking-wide transition-colors duration-300 text-gray-900 dark:text-white"
                    style={{ textShadow: `0 0 15px ${brandColor}40` }}
                >
                    {skillName}
                </h3>
            </div>
        </motion.div>
    );
};

export default function Skills() {
    const { t, i18n } = useTranslation();
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<'frontend' | 'backend' | 'tools' | 'other' | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const isEn = i18n.language === 'en';

    useEffect(() => {
        api.get('/skills')
            .then(({ data }) => {
                setSkills(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch skills:", err);
                setLoading(false);
            });
    }, []);

    const categories = [
        { id: 'frontend', label: t('skills_page.cat_frontend'), icon: Layout, color: 'text-purple-400', border: 'hover:border-purple-500/50', gradient: 'hover:bg-purple-500/10' },
        { id: 'backend', label: t('skills_page.cat_backend'), icon: Server, color: 'text-blue-400', border: 'hover:border-blue-500/50', gradient: 'hover:bg-blue-500/10' },
        { id: 'tools', label: t('skills_page.cat_tools'), icon: Wrench, color: 'text-orange-400', border: 'hover:border-orange-500/50', gradient: 'hover:bg-orange-500/10' },
        { id: 'other', label: t('skills_page.cat_other'), icon: Package, color: 'text-emerald-400', border: 'hover:border-emerald-500/50', gradient: 'hover:bg-emerald-500/10' },
    ] as const;

    const filteredSkills = selectedCategory ? skills.filter(s => normalizeCategory(s) === selectedCategory) : [];

    return (
        <section id="skills" className="bg-white dark:bg-gray-950 min-h-screen pt-20 pb-12 md:pt-28 md:pb-20 px-4 font-sans text-gray-900 dark:text-white overflow-hidden relative transition-colors duration-300">
            <GridBackground />
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-[90rem] mx-auto h-full flex flex-col">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6 md:mb-10 z-10"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4 flex items-center justify-center gap-3">
                        <Cpu className="text-purple-600 dark:text-purple-500" size={32} />
                        <span>{t('skills_page.title')}</span>
                    </h2>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">{t('skills_page.subtitle')}</p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-purple-600 dark:text-purple-500" size={48} />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center w-full max-w-7xl mx-auto">
                        <AnimatePresence mode="wait">
                            {!selectedCategory ? (
                                <motion.div
                                    key="categories"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-6xl px-4"
                                >
                                    {categories.map((cat) => {
                                        const count = skills.filter(s => normalizeCategory(s) === cat.id).length;
                                        return (
                                            <motion.button
                                                key={cat.id}
                                                whileHover={{ scale: 1.05, y: -5 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setSelectedCategory(cat.id)}
                                                className={`group relative h-40 md:h-56 rounded-2xl border border-transparent dark:border-white/10 bg-gray-100 dark:bg-white/5 backdrop-blur-md p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 shadow-sm dark:shadow-none ${cat.border} ${cat.gradient}`}
                                            >
                                                <div className={`p-3 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                                                    <cat.icon size={32} />
                                                </div>
                                                <div className="text-center">
                                                    <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-gray-100 transition-colors">{cat.label}</h3>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{count} {t('skills_page.skills_count')}</span>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="skills-cloud"
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, filter: 'blur(10px)' }}
                                    className="flex flex-col items-start w-full h-full"
                                >
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className="mb-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-all group z-50 text-sm md:text-base font-medium text-gray-700 dark:text-white shadow-sm dark:shadow-none"
                                    >
                                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                        {t('skills_page.back')}
                                    </button>

                                    <h3 className="text-2xl md:text-3xl font-bold mb-8 capitalize px-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-500">
                                        {categories.find(c => c.id === selectedCategory)?.label} {t('skills_page.development')}
                                    </h3>

                                    <div className="flex-1 w-full min-h-[60vh] relative" ref={containerRef}>
                                        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 p-4">
                                            {filteredSkills.map((skill, index) => (
                                                <SkillItem
                                                    key={skill.id}
                                                    skill={skill}
                                                    index={index}
                                                    containerRef={containerRef}
                                                    isEn={isEn}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </section>
    );
}
