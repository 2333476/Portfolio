import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Calendar, Plus, Minus, Loader2, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import GridBackground from '../../components/layout/GridBackground';

interface Education {
    id: string;
    institution: string;
    degreeEn: string;
    degreeFr: string;
    startDate: string;
    endDate?: string | null;
    descriptionEn: string;
    descriptionFr: string;
    logoUrl?: string; // Added support for logo
}

export default function Education() {
    const { t, i18n } = useTranslation();
    const [educations, setEducations] = useState<Education[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const isEn = i18n.language === 'en';

    useEffect(() => {
        api.get('/educations')
            .then(({ data }) => {
                // Sort by startDate descending (newest first)
                const sorted = (Array.isArray(data) ? data : []).sort((a: Education, b: Education) =>
                    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                );
                setEducations(sorted);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch education:", err);
                setLoading(false);
            });
    }, []);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return isEn ? 'Present' : 'Présent';
        return new Date(dateString).toLocaleDateString(isEn ? 'en-US' : 'fr-FR', { month: 'short', year: 'numeric' });
    };

    // Helper to parse description content (bullets and bold)
    const renderDescription = (text: string) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => {
            const cleanLine = line.trim();
            if (!cleanLine) return null;

            // Remove leading dash or bullet if present
            const content = cleanLine.replace(/^[•-]\s*/, '');

            // Split by markdown bold syntax: **text**
            const parts = content.split(/(\*\*.*?\*\*)/g);

            return (
                <li key={i} className="text-gray-400 text-sm md:text-base mb-1 marker:text-purple-500">
                    {parts.map((part, index) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={index} className="text-gray-900 dark:text-white font-bold">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </li>
            );
        });
    };

    return (
        <section id="education" className="bg-white dark:bg-[#0a0a0a] min-h-screen pt-20 pb-12 md:pt-32 md:pb-20 px-4 md:px-8 font-sans text-gray-900 dark:text-white overflow-hidden transition-colors duration-300 relative">
            <GridBackground />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-7xl mx-auto"
            >
                {/* Header */}
                <div className="text-center mb-10 md:mb-16">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center justify-center p-2 md:p-3 rounded-full bg-purple-500/10 mb-2 md:mb-4"
                    >
                        <GraduationCap className="text-purple-600 dark:text-purple-500" size={32} />
                    </motion.div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4 tracking-tight text-gray-900 dark:text-white">
                        {t('education.title')}
                    </h2>
                    <p className="text-sm md:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                        {t('education.subtitle')}
                    </p>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-purple-600 dark:text-purple-500" size={48} />
                    </div>
                ) : educations.length === 0 ? (
                    <div className="text-center bg-gray-100 dark:bg-[#121212] rounded-2xl p-10 border border-transparent dark:border-white/5 shadow-lg dark:shadow-none">
                        <GraduationCap size={48} className="mx-auto mb-4 text-gray-500 dark:text-gray-700" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('education.no_education')}</h3>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Vertical Timeline Line (Center on Desktop, Left on Mobile) */}
                        <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/50 via-purple-500/20 to-transparent block -translate-x-0 md:-translate-x-1/2"></div>

                        <div className="flex flex-col gap-16 md:gap-24 py-10">
                            {educations.map((edu, index) => {
                                const isExpanded = expandedId === edu.id;
                                const isEven = index % 2 === 0;
                                const period = `${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`;

                                return (
                                    <motion.div
                                        layout
                                        key={edu.id}
                                        initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: "-50px" }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                        className={`relative md:w-1/2 w-full ${isEven ? 'md:mr-auto md:pr-16 pl-8 md:pl-0' : 'md:ml-auto md:pl-16 pl-8'}`}
                                    >
                                        {/* Timeline Dot */}
                                        <div className="absolute left-0 top-10 md:left-auto md:top-10 w-5 h-5 rounded-full bg-white dark:bg-[#0a0a0a] border-4 border-purple-600 dark:border-purple-500 z-20 shadow-[0_0_15px_rgba(168,85,247,0.4)] dark:shadow-[0_0_15px_rgba(168,85,247,0.8)] 
                                        -translate-x-[9px] 
                                        md:absolute 
                                        md:translate-x-0
                                        md:right-auto
                                        md:left-auto
                                        ${isEven ? 'md:-right-[10px]' : 'md:-left-[10px]'}
                                    "></div>

                                        {/* Card */}
                                        <motion.div
                                            layout
                                            className={`bg-gray-100 dark:bg-[#121212] border ${isExpanded ? 'border-purple-500/50 dark:border-purple-500/50 shadow-purple-500/10' : 'border-transparent dark:border-white/5'} rounded-3xl overflow-hidden transition-all duration-300 hover:border-purple-500/30 w-full shadow-sm hover:shadow-lg dark:shadow-none`}
                                        >
                                            {/* Card Header */}
                                            <div
                                                onClick={() => toggleExpand(edu.id)}
                                                className="p-6 md:p-8 grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-6 items-center cursor-pointer group"
                                            >
                                                {/* Left Section: Logo + Text */}
                                                <div className="flex items-center gap-6">
                                                    {/* Logo */}
                                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white dark:bg-white p-3 flex items-center justify-center shrink-0 shadow-sm border border-gray-100 dark:border-purple-500/20">
                                                        {edu.logoUrl ? (
                                                            <img src={edu.logoUrl} alt={edu.institution} className="w-full h-full object-contain" />
                                                        ) : (
                                                            <Building2 className="text-gray-900" size={32} />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                            {edu.institution}
                                                        </h3>
                                                        <div className="text-gray-600 dark:text-gray-400 font-medium text-base md:text-lg">
                                                            {isEn ? edu.degreeEn : edu.degreeFr}
                                                        </div>
                                                        {/* Mobile Period */}
                                                        <div className="xl:hidden mt-3 text-sm text-purple-600 dark:text-purple-400 font-medium flex items-center gap-2 bg-purple-500/10 w-fit px-3 py-1 rounded-full">
                                                            <Calendar size={14} />
                                                            {period}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Desktop Period & Toggle */}
                                                <div className="hidden xl:flex items-center gap-8 pl-4 border-l border-gray-200 dark:border-white/5">
                                                    <div className="text-right">
                                                        <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">{t('education.period_label')}</div>
                                                        <div className="text-base text-purple-600 dark:text-purple-400 font-bold whitespace-nowrap bg-purple-500/10 px-3 py-1 rounded-lg">
                                                            {period}
                                                        </div>
                                                    </div>

                                                    <button
                                                        className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 ${isExpanded ? 'bg-purple-600 border-purple-600 text-white rotate-180 shadow-lg' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/30'}`}
                                                    >
                                                        {isExpanded ? <Minus size={22} /> : <Plus size={22} />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expandable Content */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    >
                                                        <div className="px-6 md:px-8 pb-8 pt-0">
                                                            <div className="w-full h-px bg-gray-200 dark:bg-white/5 mb-6"></div>
                                                            <div className="md:pl-[6.5rem]">
                                                                <h4 className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                                                    {t('education.highlights')}
                                                                </h4>
                                                                <ul className="space-y-3 leading-relaxed text-gray-700 dark:text-gray-300">
                                                                    {(isEn ? edu.descriptionEn : edu.descriptionFr) ? renderDescription(isEn ? edu.descriptionEn : edu.descriptionFr) : (
                                                                        <p className="text-gray-500 italic">{t('education.no_details')}</p>
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </motion.div>
        </section>
    );
}
