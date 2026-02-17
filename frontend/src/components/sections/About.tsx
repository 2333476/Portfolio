import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaUniversity, FaGamepad, FaCode } from 'react-icons/fa';
import { useTranslation, Trans } from 'react-i18next';

export default function About() {
    const { t } = useTranslation();

    const hobbyList = t('about_section.hobby_list', { returnObjects: true }) as string[];

    return (
        <section id="about" className="py-24 bg-black relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-green-900/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center mb-16 text-center"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{t('about_section.title')}</h2>
                    <p className="text-gray-400 max-w-2xl text-lg">
                        {t('about_section.subtitle')}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 max-w-6xl mx-auto auto-rows-[200px]">

                    {/* Card 1: Main Bio (Large) */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="md:col-span-4 bg-[#111] rounded-3xl p-8 border border-white/10 flex flex-col justify-center relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all" />
                        <h3 className="text-2xl font-bold text-white mb-4">{t('about_section.who_i_am')}</h3>
                        <p className="text-gray-400 leading-relaxed text-lg">
                            <Trans i18nKey="about_section.bio">
                                I am a passionate <span className="text-green-400 font-semibold">Full Stack Developer</span> based in Montreal.
                                I specialize in building scalable web applications and intuitive user interfaces.
                                My journey started with a curiosity for how things work, and now I architect digital solutions.
                            </Trans>
                        </p>
                    </motion.div>

                    {/* Card 2: Location (Small) */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="md:col-span-2 bg-[#111] rounded-3xl p-6 border border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 text-blue-400 text-3xl group-hover:scale-110 transition-transform">
                            <FaMapMarkerAlt />
                        </div>
                        <h4 className="text-xl font-bold text-white">Montreal, CA</h4>
                        <p className="text-gray-500 text-sm mt-1">{t('about_section.based_in')}</p>
                    </motion.div>

                    {/* Card 3: Education (Medium) */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="md:col-span-2 bg-[#111] rounded-3xl p-6 border border-white/10 flex flex-col justify-between relative overflow-hidden"
                    >
                        <div className="absolute -bottom-4 -right-4 text-8xl text-white/5 rotate-12">
                            <FaUniversity />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">{t('about_section.edu_title')}</h4>
                        <div>
                            <p className="text-gray-300 font-medium">{t('about_section.degree')}</p>
                            <p className="text-gray-500 text-sm">{t('about_section.university')}</p>
                        </div>
                    </motion.div>

                    {/* Card 4: Stack / Tech Spirit (Large) */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="md:col-span-2 bg-gradient-to-br from-green-900/20 to-black rounded-3xl p-6 border border-white/10 flex flex-col items-center justify-center text-center relative"
                    >
                        <FaCode className="text-5xl text-green-500 mb-4 opacity-80" />
                        <h4 className="text-xl font-bold text-white">{t('about_section.clean_code')}</h4>
                        <p className="text-gray-400 text-sm mt-2">{t('about_section.code_tagline')}</p>
                    </motion.div>

                    {/* Card 5: Hobbies (Medium) */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="md:col-span-2 bg-[#111] rounded-3xl p-6 border border-white/10 flex flex-col justify-center relative overflow-hidden group"
                    >
                        <h4 className="text-xl font-bold text-white mb-4 z-10 relative">{t('about_section.hobbies')}</h4>
                        <div className="flex flex-wrap gap-2 z-10 relative">
                            {hobbyList.map(hobby => (
                                <span key={hobby} className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-300 border border-white/5 group-hover:border-white/20 transition-colors">
                                    {hobby}
                                </span>
                            ))}
                        </div>
                        <FaGamepad className="absolute bottom-4 right-4 text-6xl text-purple-500/10 group-hover:text-purple-500/20 transition-colors transform -rotate-12" />
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
