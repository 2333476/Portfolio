import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
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
    createdAt: string;
}

export default function ProjectTimeline() {
    const { t } = useTranslation();
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        api.get('/projects').then(({ data }) => setProjects(data)).catch(console.error);
    }, []);

    if (projects.length === 0) return null;

    return (
        <section className="bg-gray-950 min-h-screen py-20 relative overflow-hidden flex flex-col justify-center">
            <div className="container mx-auto px-6 mb-12 text-center z-10">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold text-white mb-4"
                >
                    {t('projects.timeline_title')}
                </motion.h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    {t('projects.timeline_subtitle')}
                </p>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="w-full overflow-x-auto pb-12 pt-10 scrollbar-hide cursor-grab active:cursor-grabbing">
                <div className="min-w-max flex items-center px-10 md:px-24 relative">

                    {/* The Timeline Line */}
                    <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-800 -translate-y-1/2 z-0 mx-10" />

                    {projects.map((project, index) => (
                        <TimelineItem key={project.id} project={project} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function TimelineItem({ project, index }: { project: Project; index: number }) {
    const { t, i18n } = useTranslation();
    const isEn = i18n.language === 'en';
    // Alternate top/bottom alignment
    const isEven = index % 2 === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className={`relative w-[350px] md:w-[450px] flex-none px-6 z-10 group`}
        >
            {/* Dot on the line */}
            <div className="absolute left-1/2 top-1/2 w-4 h-4 bg-green-500 rounded-full -translate-x-1/2 -translate-y-1/2 border-4 border-gray-950 shadow-[0_0_15px_rgba(34,197,94,0.5)] z-20 group-hover:scale-125 transition-transform" />

            {/* Connector Line */}
            <div className={`absolute left-1/2 w-0.5 bg-gray-700 -translate-x-1/2 z-0 transition-all duration-300 group-hover:bg-green-500/50
                ${isEven ? 'bottom-1/2 h-12 md:h-16 origin-bottom' : 'top-1/2 h-12 md:h-16 origin-top'}
            `} />

            {/* Card */}
            <div className={`
                relative bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 hover:border-green-500/30 transition-colors shadow-xl
                ${isEven ? 'mb-24 md:mb-32' : 'mt-24 md:mt-32'}
            `}>
                <div className="absolute inset-0 bg-green-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {project.imageUrl && (
                    <div className="h-40 w-full mb-4 rounded-lg overflow-hidden relative">
                        <img src={project.imageUrl} alt={isEn ? project.titleEn : project.titleFr} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </div>
                )}

                <h3 className="text-2xl font-bold text-white mb-2">{isEn ? project.titleEn : project.titleFr}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">{isEn ? project.descEn : project.descFr}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                    {project.techStack.slice(0, 4).map((tech, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded bg-white/5 text-emerald-400 border border-emerald-500/20">
                            {tech}
                        </span>
                    ))}
                </div>

                <div className="flex gap-4 pt-2 border-t border-white/5">
                    {project.demoLink && (
                        <a href={project.demoLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
                            <FaExternalLinkAlt size={14} /> {t('projects.live_demo')}
                        </a>
                    )}
                    {project.repoLink && (
                        <a href={project.repoLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
                            <FaGithub size={16} /> {t('projects.code')}
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
