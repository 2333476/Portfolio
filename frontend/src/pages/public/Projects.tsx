import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink, Code2, Loader2, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GridBackground from '../../components/layout/GridBackground';
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
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const isEn = i18n.language === 'en';

    useEffect(() => {
        api.get('/projects')
            .then(({ data }) => {
                setProjects(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch projects:", err);
                setLoading(false);
            });
    }, []);

    return (
        <section className="bg-white dark:bg-gray-950 min-h-screen pt-28 pb-20 px-4 font-sans text-gray-900 dark:text-white transition-colors duration-300 relative overflow-hidden">
            <GridBackground />
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
                        <Code2 className="text-purple-600 dark:text-purple-500" size={40} />
                        <span>{t('projects.title')}</span>
                    </h2>
                </motion.div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-purple-600 dark:text-purple-500" size={48} />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center bg-gray-100 dark:bg-white/5 rounded-2xl p-10 border border-transparent dark:border-white/10 backdrop-blur-sm max-w-2xl mx-auto shadow-lg dark:shadow-none">
                        <Layers className="mx-auto text-gray-400 dark:text-gray-600 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('projects.no_projects')}</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        {projects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group bg-gray-100 dark:bg-[#121212] border border-transparent dark:border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all flex flex-col h-full shadow-sm dark:shadow-none"
                            >
                                {/* Image Area */}
                                <div className="p-6 bg-gray-100 dark:bg-[#0f0f12] group-hover:bg-gray-200 dark:group-hover:bg-black/40 transition-colors duration-500">
                                    <div className="h-56 overflow-hidden relative bg-white rounded-2xl shadow-inner flex items-center justify-center p-4 group-hover:shadow-lg transition-all duration-500">
                                        {project.imageUrl ? (
                                            <img
                                                src={project.imageUrl}
                                                alt={isEn ? project.titleEn : project.titleFr}
                                                className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-700">
                                                <Code2 size={48} className="mb-2 opacity-50" />
                                                <span className="text-sm font-medium uppercase tracking-widest opacity-50">No Preview</span>
                                            </div>
                                        )}

                                        {/* Overlay Links */}
                                        <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-900/10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 backdrop-blur-[1px]">
                                            {project.demoLink && (
                                                <a
                                                    href={project.demoLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:bg-purple-600 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                                                    title={t('projects.view_demo')}
                                                >
                                                    <ExternalLink size={20} />
                                                </a>
                                            )}
                                            {project.repoLink && (
                                                <a
                                                    href={project.repoLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="w-12 h-12 bg-gray-900 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all transform hover:scale-110 shadow-lg"
                                                    title={t('projects.view_repo')}
                                                >
                                                    <Github size={20} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                        {isEn ? project.titleEn : project.titleFr}
                                    </h3>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {project.techStack.map(tech => (
                                            <span
                                                key={tech}
                                                className="text-xs font-medium px-2.5 py-1 bg-purple-100 text-purple-700 dark:bg-white/5 dark:text-purple-200/80 rounded border border-purple-200 dark:border-white/5"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm mb-6 flex-1">
                                        {isEn ? project.descEn : project.descFr}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
