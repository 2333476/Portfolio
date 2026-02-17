import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import api from '../../services/api';
import { getSkillIcon } from '../../utils/skillIcons';

interface Skill {
    id: string;
    nameEn: string;
    nameFr: string;
    category: string;
    level: number;
    imageUrl?: string;
}

export default function SkillsImmersive() {
    const { t, i18n } = useTranslation();
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isImmersed, setIsImmersed] = useState(false);

    const isEn = i18n.language === 'en';

    useEffect(() => {
        api.get('/skills').then(({ data }) => setSkills(data)).catch(console.error);
    }, []);

    const toggleImmersion = () => setIsImmersed(!isImmersed);

    // Group for marquee preview
    const row1 = skills.slice(0, Math.ceil(skills.length / 2));

    return (
        <>
            {/* Standard Section View - Clickable */}
            <section
                id="skills"
                className="py-24 bg-gray-950 relative overflow-hidden cursor-pointer group"
                onClick={toggleImmersion}
            >
                {/* Hover Overlay Hint */}
                <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-sm">
                    <p className="text-3xl font-bold text-white tracking-widest uppercase animate-pulse">{t('skills.dive_in')}</p>
                </div>

                <div className="container mx-auto px-6 mb-12 relative z-10 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{t('skills.title')}</h2>
                    <p className="text-gray-400">{t('skills.immersive_subtitle')}</p>
                </div>

                {/* Preview Marquee */}
                <div className="flex overflow-hidden opacity-50 group-hover:opacity-20 transition-opacity">
                    <motion.div
                        className="flex gap-8 px-8 min-w-full"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ ease: "linear", duration: 30, repeat: Infinity }}
                    >
                        {[...row1, ...row1, ...row1].map((skill, i) => (
                            <div key={`${skill.id}-${i}`} className="flex-shrink-0 bg-white/5 border border-white/10 px-6 py-3 rounded-xl flex items-center gap-3">
                                <span className="text-white font-medium text-lg">{isEn ? skill.nameEn : skill.nameFr}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Immersive Underwater Overlay */}
            <AnimatePresence>
                {isImmersed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-gradient-to-b from-[#0f172a] to-[#020617] h-screen w-screen overflow-hidden flex items-center justify-center"
                    >
                        {/* Close Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsImmersed(false); }}
                            className="absolute top-8 right-8 text-white/50 hover:text-white z-50 p-4 transition-colors"
                        >
                            <FaTimes size={32} />
                        </button>

                        {/* Underwater Particles / Bubbles */}
                        <div className="absolute inset-0 pointer-events-none">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <BubbleParticle key={`bubble-${i}`} />
                            ))}
                        </div>

                        {/* Interactive Skills Bubbles */}
                        <div className="relative w-full h-full max-w-6xl mx-auto flex flex-wrap items-center justify-center content-center gap-x-8 gap-y-12 p-10">
                            {skills.map((skill, i) => (
                                <Bubble key={skill.id} skill={skill} index={i} isEn={isEn} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

const BubbleParticle = () => {
    const [config] = useState(() => ({
        initialX: Math.random() * window.innerWidth,
        scale: Math.random() * 0.5 + 0.5,
        targetX: Math.random() * 100,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5,
        size: Math.random() * 20 + 5
    }));

    return (
        <motion.div
            className="absolute bg-white/5 rounded-full"
            initial={{
                x: config.initialX,
                y: window.innerHeight + 100,
                scale: config.scale
            }}
            animate={{
                y: -100,
                x: `calc(${config.targetX}vw)`
            }}
            transition={{
                duration: config.duration,
                repeat: Infinity,
                ease: "linear",
                delay: config.delay
            }}
            style={{
                width: config.size,
                height: config.size
            }}
        />
    );
};

const Bubble = ({ skill, index, isEn }: { skill: Skill, index: number, isEn: boolean }) => {
    // Generate random float animation params with larger range for more organic feel
    const [visuals] = useState(() => ({
        randomY: Math.random() * 40 - 20,
        randomX: Math.random() * 40 - 20,
        duration: Math.random() * 3 + 4,
        marginX: Math.random() * 20 - 10,
        marginY: Math.random() * 20 - 10
    }));

    const iconName = getSkillIcon(skill.nameEn);
    const color = '#4ade80'; // Revert to standard Green for all bubbles

    return (
        <motion.div
            drag
            dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
            whileHover={{ scale: 1.2, zIndex: 10 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
                scale: 1,
                opacity: 1,
                y: [0, visuals.randomY, 0],
                x: [0, visuals.randomX, 0]
            }}
            transition={{
                scale: { delay: index * 0.05, type: "spring" },
                y: { duration: visuals.duration, repeat: Infinity, ease: "easeInOut" },
                x: { duration: visuals.duration * 1.2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-20 h-20 md:w-28 md:h-28 rounded-full cursor-grab active:cursor-grabbing backdrop-blur-md bg-white/10 border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)] flex flex-col items-center justify-center text-center p-2 group"
            style={{
                borderColor: `${color}40`,
                boxShadow: `0 0 20px ${color}20`,
                marginLeft: `${visuals.marginX}px`,
                marginTop: `${visuals.marginY}px`,
            }}
        >
            {skill.imageUrl ? (
                <img
                    src={skill.imageUrl}
                    alt=""
                    className="w-8 h-8 md:w-12 md:h-12 mb-2 object-contain filter drop-shadow-md"
                />
            ) : (
                <Icon
                    icon={iconName}
                    className="w-8 h-8 md:w-12 md:h-12 mb-2 object-contain filter drop-shadow-md text-white"
                />
            )}
            <span className="text-white font-bold text-xs md:text-sm pointer-events-none select-none">{isEn ? skill.nameEn : skill.nameFr}</span>

            <div className="w-12 h-1 bg-white/20 rounded-full mt-2 overflow-hidden pointer-events-none opacity-50">
                <div className="h-full" style={{ width: `${skill.level}%`, backgroundColor: color }} />
            </div>

            {/* Glow on hover */}
            <div
                className="absolute inset-0 rounded-full transition-colors duration-500 -z-10 blur-xl opacity-0 group-hover:opacity-40"
                style={{ backgroundColor: color }}
            />
        </motion.div>
    );
};
