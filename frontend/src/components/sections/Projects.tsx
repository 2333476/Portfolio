import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

interface Project {
    id: string;
    titleEn: string;
    titleFr: string;
    descEn: string;
    descFr: string;
    techStack: string[];
    demoLink?: string;
    repoLink?: string;
    imageUrl?: string;
}

export default function Projects() {
    const { t, i18n } = useTranslation();
    const isEn = i18n.language === 'en';
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        api.get('/projects').then(({ data }) => setProjects(data)).catch(console.error);
    }, []);

    const nextProject = () => {
        if (projects.length === 0) return;
        setActiveIndex((prev) => (prev + 1) % projects.length);
    };

    const prevProject = () => {
        if (projects.length === 0) return;
        setActiveIndex((prev) => (prev - 1 + projects.length) % projects.length);
    };

    const getCardStyle = (index: number) => {
        const diff = (index - activeIndex + projects.length) % projects.length;

        // Center card
        if (diff === 0) return {
            scale: 1,
            opacity: 1,
            zIndex: 10,
            x: 0,
            rotateY: 0
        };

        // Immediate next (Right)
        if (diff === 1 || diff === - (projects.length - 1)) return {
            scale: 0.85,
            opacity: 0.6,
            zIndex: 5,
            x: '60%',
            rotateY: -15
        };

        // Immediate prev (Left)
        if (diff === projects.length - 1 || diff === -1) return {
            scale: 0.85,
            opacity: 0.6,
            zIndex: 5,
            x: '-60%',
            rotateY: 15
        };

        // Others (Hidden/Far back)
        return {
            scale: 0.5,
            opacity: 0,
            zIndex: 1,
            x: 0,
            rotateY: 0
        };
    };

    if (projects.length === 0) return null;

    return (
        <section id="projects" className="py-24 bg-gray-950 relative overflow-hidden">
            <div className="container mx-auto px-6 h-full min-h-[600px] flex flex-col justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center mb-12 text-center"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">{t('projects_section.title')}</h2>
                    <p className="text-gray-400">{t('projects_section.subtitle')}</p>
                </motion.div>

                {/* Carousel Container */}
                <div className="relative h-[550px] flex items-center justify-center perspective-1000">
                    <AnimatePresence mode="popLayout">
                        {projects.map((project, index) => {
                            return (
                                <motion.div
                                    key={project.id}
                                    className="absolute w-[350px] md:w-[600px] h-[400px] bg-[#0a0a0a] rounded-3xl border border-white/5 shadow-2xl overflow-hidden flex flex-col md:flex-row cursor-pointer"
                                    animate={getCardStyle(index)}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    onClick={() => setActiveIndex(index)}
                                >
                                    {/* Image Side (Top on mobile, Left on Desktop) */}
                                    <div className="h-1/2 md:h-full md:w-1/2 relative bg-gray-900 overflow-hidden">
                                        {project.imageUrl ? (
                                            <img
                                                src={project.imageUrl}
                                                alt={isEn ? project.titleEn : project.titleFr}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                <span className="font-bold">NO IMAGE</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    </div>

                                    {/* Content Side */}
                                    <div className="h-1/2 md:h-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between relative bg-[#0a0a0a]">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-2">{isEn ? project.titleEn : project.titleFr}</h3>
                                            <p className="text-gray-400 text-sm line-clamp-3 md:line-clamp-5 leading-relaxed mb-4">
                                                {isEn ? project.descEn : project.descFr}
                                            </p>
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {project.techStack.slice(0, 3).map((tech, i) => (
                                                    <span key={i} className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-300">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex gap-4">
                                                {project.demoLink && (
                                                    <a href={project.demoLink} target="_blank" rel="noreferrer" className="px-6 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full transition-colors text-sm">
                                                        {t('projects_section.visit_site')}
                                                    </a>
                                                )}
                                                {project.repoLink && (
                                                    <a href={project.repoLink} target="_blank" rel="noreferrer" className="p-2 border border-white/20 rounded-full text-white hover:bg-white/10 transition-colors">
                                                        <FaGithub size={20} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Navigation Controls */}
                <div className="flex justify-center gap-8 mt-8">
                    <button onClick={prevProject} className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5">
                        <FaChevronLeft />
                    </button>
                    <button onClick={nextProject} className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5">
                        <FaChevronRight />
                    </button>
                </div>

            </div>
        </section>
    );
}
