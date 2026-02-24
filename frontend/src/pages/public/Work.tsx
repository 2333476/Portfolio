import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Briefcase, Globe, Loader2, Cpu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import GridBackground from '../../components/layout/GridBackground';
import { useContactModal } from '../../context/ContactModalContext';

interface Experience {
    id: string;
    company: string;
    roleEn: string;
    roleFr: string;
    period: string;
    descEn: string;
    descFr: string;
    bullets?: string[];
    logoUrl?: string;
}

export default function Work() {
    const { t, i18n } = useTranslation();
    const { setWorkModalOpen } = useContactModal();
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [selectedExp, setSelectedExp] = useState<Experience | null>(null);
    const [loading, setLoading] = useState(true);

    // Sync with global modal state for FloatingControls to hide
    useEffect(() => {
        setWorkModalOpen(!!selectedExp);
    }, [selectedExp, setWorkModalOpen]);

    const isEn = i18n.language === 'en';

    useEffect(() => {
        let mounted = true;
        api.get('/experiences')
            .then(({ data }) => {
                if (mounted) setExperiences(Array.isArray(data) ? data : []);
            })
            .catch(console.error)
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => { mounted = false; };
    }, []);

    return (
        <section id="work" className="bg-white dark:bg-gray-950 min-h-screen pt-20 pb-12 md:pt-28 md:pb-20 px-4 relative overflow-x-hidden font-sans transition-colors duration-300">
            <GridBackground />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10 md:mb-20"
            >
                <h2 className="text-3xl md:text-6xl font-bold text-gray-900 dark:text-white mb-2 md:mb-4">
                    {t('work.title')}
                </h2>
            </motion.div>

            <div className="max-w-7xl mx-auto relative">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="animate-spin text-purple-600 dark:text-purple-500" size={48} />
                    </div>
                ) : experiences.length === 0 ? (
                    <div className="text-center bg-gray-100 dark:bg-white/5 rounded-2xl p-10 border border-transparent dark:border-white/10 backdrop-blur-sm max-w-2xl mx-auto">
                        <Briefcase size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('work.no_experience')}</h3>
                    </div>
                ) : (
                    <div className="relative pt-10 pb-20">
                        {/* Horizontal Timeline Line */}
                        <div className="hidden md:block absolute top-[140px] left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50 z-0" />

                        <div className="grid grid-cols-1 md:flex md:flex-row md:flex-wrap lg:flex-nowrap justify-center gap-12 md:gap-4 relative z-10">
                            {experiences.map((exp, index) => (
                                <motion.div
                                    key={exp.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex flex-col items-center w-full md:w-1/4 lg:flex-1"
                                >
                                    {/* Card Container */}
                                    <motion.div
                                        onClick={() => setSelectedExp(exp)}
                                        whileHover={{ scale: 1.02, y: -5 }}
                                        className="w-full max-w-[280px] aspect-[1.6/1] bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col items-center justify-between text-center cursor-pointer relative shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all group"
                                    >
                                        {/* Company Logo Box */}
                                        <div className="w-12 h-12 bg-white dark:bg-black rounded-lg border border-gray-100 dark:border-white/10 p-2 shadow-sm flex items-center justify-center overflow-hidden">
                                            {exp.logoUrl ? (
                                                <img src={exp.logoUrl} alt={exp.company} className="w-full h-full object-contain" />
                                            ) : (
                                                <Briefcase size={20} className="text-gray-400" />
                                            )}
                                        </div>

                                        {/* Text Content */}
                                        <div className="flex-1 flex flex-col justify-center mt-3">
                                            <h3 className="text-gray-900 dark:text-white font-bold text-lg leading-tight mb-1 group-hover:text-purple-500 transition-colors">
                                                {isEn ? exp.roleEn : exp.roleFr}
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                                {exp.company}
                                            </p>
                                        </div>

                                        {/* Plus Button */}
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-white dark:bg-[#1a1a1a] rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-md">
                                            <Plus size={14} />
                                        </div>
                                    </motion.div>

                                    {/* Date Label (Outside Card) */}
                                    <div className="mt-8 text-gray-500 dark:text-gray-500 text-xs font-bold uppercase tracking-widest text-center">
                                        {exp.period}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Detailed Experience Modal */}
            <AnimatePresence>
                {selectedExp && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedExp(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-3xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 md:p-14 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedExp(null)}
                                className="absolute top-8 right-8 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex flex-col gap-8">
                                {/* Header: Icon + Title */}
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-4">
                                            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                                <Cpu className="text-gray-900 dark:text-white" size={32} />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                                                    {isEn ? selectedExp.roleEn : selectedExp.roleFr}
                                                </h2>
                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-gray-600 dark:text-gray-400 font-medium text-lg">
                                                    <div className="flex items-center gap-2">
                                                        <Globe size={20} className="text-purple-500" />
                                                        <span>{selectedExp.company}</span>
                                                    </div>
                                                    <span className="text-gray-400">|</span>
                                                    <span className="text-gray-500">{selectedExp.period}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Accomplishments List */}
                                <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-white/5">
                                    {((isEn ? selectedExp.descEn : selectedExp.descFr).split('\n')).map((bullet, i) => (
                                        bullet.trim() && (
                                            <div key={i} className="flex gap-4 group">
                                                <div className="mt-2.5 w-2 h-2 rounded-full bg-purple-500 shrink-0 group-hover:scale-125 transition-transform" />
                                                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                                    {bullet.trim().startsWith('•') ? bullet.trim().substring(1).trim() : bullet.trim()}
                                                </p>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
