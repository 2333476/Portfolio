import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

interface Skill {
    id: string;
    nameEn: string;
    nameFr: string;
    category: string;
    level: number;
    imageUrl?: string;
}

export default function Skills() {
    const { t, i18n } = useTranslation();
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);

    const isEn = i18n.language === 'en';

    useEffect(() => {
        api.get('/skills')
            .then(({ data }) => {
                setSkills(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // Split skills into rows for marquee
    const row1 = skills.slice(0, Math.ceil(skills.length / 2));
    const row2 = skills.slice(Math.ceil(skills.length / 2));

    return (
        <section id="skills" className="py-24 bg-gray-950 relative overflow-hidden">
            {/* Gradient Overlay for Fade Effect */}
            <div className="absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-gray-950 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-gray-950 to-transparent pointer-events-none" />

            <div className="container mx-auto px-6 mb-12 relative z-10 text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{t('skills.title')}</h2>
                <p className="text-gray-400">{t('skills.subtitle')}</p>
            </div>

            {loading ? (
                <div className="text-center text-gray-500 py-10">
                    <p>{t('skills.loading')}</p>
                </div>
            ) : skills.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                    <p>{t('skills.no_skills')}</p>
                </div>
            ) : (
                <>
                    {/* Marquee Row 1 */}
                    <div className="flex overflow-hidden mb-8 group">
                        <motion.div
                            className="flex gap-8 px-8 min-w-full"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ ease: "linear", duration: 30, repeat: Infinity }}
                        >
                            {[...row1, ...row1, ...row1].map((skill, i) => (
                                <div key={`${skill.id}-${i}-r1`} className="flex-shrink-0 bg-white/5 border border-white/10 px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors">
                                    <div className="w-8 h-8 flex items-center justify-center p-1 bg-white/5 rounded">
                                        {skill.imageUrl ? (
                                            <img src={skill.imageUrl} alt="" className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-green-400 font-bold">#</span>
                                        )}
                                    </div>
                                    <span className="text-white font-medium text-lg">{isEn ? skill.nameEn : skill.nameFr}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Marquee Row 2 (Reverse) */}
                    <div className="flex overflow-hidden group">
                        <motion.div
                            className="flex gap-8 px-8 min-w-full"
                            animate={{ x: ["-50%", "0%"] }}
                            transition={{ ease: "linear", duration: 35, repeat: Infinity }}
                        >
                            {[...row2, ...row2, ...row2].map((skill, i) => (
                                <div key={`${skill.id}-${i}-r2`} className="flex-shrink-0 bg-white/5 border border-white/10 px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors">
                                    <div className="w-8 h-8 flex items-center justify-center p-1 bg-white/5 rounded">
                                        {skill.imageUrl ? (
                                            <img src={skill.imageUrl} alt="" className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                                        )}
                                    </div>
                                    <span className="text-white font-medium text-lg">{isEn ? skill.nameEn : skill.nameFr}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </>
            )}
        </section>
    );
}
