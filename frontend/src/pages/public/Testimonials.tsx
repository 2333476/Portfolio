import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Star, Send, Loader2, Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import GridBackground from '../../components/layout/GridBackground';
import { useToast } from '../../context/ToastContext';

interface Testimonial {
    id: string;
    author: string;
    role?: string;
    contentEn: string;
    contentFr: string; // fallback or same
    createdAt: string;
}

export default function Testimonials() {
    const { t, i18n } = useTranslation();
    const { showToast } = useToast();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);

    // Form State
    const [form, setForm] = useState({ author: '', role: '', content: '' });
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const MAX_CHARS = 300;

    const currentIsEn = i18n.language === 'en';

    useEffect(() => {
        api.get('/testimonials')
            .then(({ data }) => {
                setTestimonials(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch testimonials:", err);
                setLoading(false);
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.content.length > MAX_CHARS) {
            alert(`Please keep your testimonial under ${MAX_CHARS} characters. You have ${form.content.length}.`);
            return;
        }

        setSubmitStatus('submitting');
        try {
            await api.post('/testimonials', {
                author: form.author,
                role: form.role,
                contentEn: form.content,
                contentFr: form.content
            });
            setSubmitStatus('success');
            setTimeout(() => {
                setIsModalOpen(false);
                setSubmitStatus('idle');
                setForm({ author: '', role: '', content: '' });
            }, 2000);
        } catch (error: any) {
            console.error(error);
            setSubmitStatus('error');
            const errorMessage = error.response?.data?.error || 'Failed to submit testimonial.';
            showToast(errorMessage, 'error');
        }
    };

    return (
        <section className="bg-white dark:bg-gray-950 min-h-screen pt-28 pb-20 px-4 font-sans text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300">
            <GridBackground />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center p-3 rounded-full bg-purple-500/10 mb-4"
                    >
                        <MessageSquare className="text-purple-600 dark:text-purple-500" size={32} />
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        {t('testimonials.title')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto mb-8">
                        {t('testimonials.subtitle')}
                    </p>
                    <motion.button
                        onClick={() => setIsModalOpen(true)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{
                            scale: [1, 1.05, 1], // Beating effect
                            boxShadow: [
                                "0px 0px 0px rgba(168, 85, 247, 0)",
                                "0px 0px 20px rgba(168, 85, 247, 0.5)",
                                "0px 0px 0px rgba(168, 85, 247, 0)"
                            ]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold flex items-center gap-2 mx-auto"
                    >
                        <Star size={18} className="fill-current" />
                        {t('testimonials.write_btn')}
                    </motion.button>
                </motion.div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-purple-600" size={48} />
                    </div>
                ) : testimonials.length === 0 ? (
                    <div className="text-center bg-gray-100 dark:bg-white/5 rounded-2xl p-10 max-w-2xl mx-auto border border-transparent dark:border-white/10">
                        <Quote size={48} className="mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500 text-lg">{t('testimonials.no_testimonials')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {testimonials.map((t_item, index) => (
                            <motion.div
                                key={t_item.id}
                                layoutId={t_item.id}
                                onClick={() => setSelectedTestimonial(t_item)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gray-50 dark:bg-[#121212] p-8 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all relative group cursor-pointer hover:border-purple-500/30"
                            >
                                <Quote className="absolute top-6 right-6 text-purple-200 dark:text-purple-900/30 rotate-180" size={48} />
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex-1 mb-6">
                                        <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed line-clamp-4 break-words">
                                            "{currentIsEn ? t_item.contentEn : t_item.contentFr}"
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 mt-auto">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                                            {t_item.author.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{t_item.author}</h4>
                                            {t_item.role && <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">{t_item.role}</p>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Write Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-[#1a1a1a] p-8 rounded-3xl shadow-2xl w-full max-w-lg relative z-10"
                        >
                            {submitStatus === 'success' ? (
                                <div className="text-center py-10">
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                        <svg width="40" height="40" viewBox="0 0 52 52" className="text-green-600 dark:text-green-400">
                                            <motion.circle
                                                cx="26"
                                                cy="26"
                                                r="24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 1 }}
                                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                            />
                                            <motion.path
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M14.1 27.2l7.1 7.2 16.7-16.8"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 1 }}
                                                transition={{ delay: 0.3, duration: 0.5, ease: "easeInOut" }}
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('testimonials.thank_you')}</h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {t('testimonials.success_msg')}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('testimonials.write_btn')}</h3>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('testimonials.form_name')}</label>
                                            <input
                                                required
                                                value={form.author}
                                                onChange={e => setForm({ ...form, author: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('testimonials.form_role')}</label>
                                            <input
                                                value={form.role}
                                                onChange={e => setForm({ ...form, role: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
                                                placeholder="CEO at TechCorp"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('testimonials.form_msg')}</label>
                                                <span className={`text-xs ${form.content.length > MAX_CHARS ? 'text-red-500' : 'text-gray-400'}`}>
                                                    {form.content.length}/{MAX_CHARS} {t('testimonials.chars')}
                                                </span>
                                            </div>
                                            <textarea
                                                required
                                                rows={4}
                                                value={form.content}
                                                onChange={e => setForm({ ...form, content: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 dark:text-white resize-none"
                                                placeholder="..."
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setIsModalOpen(false)}
                                                className="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-medium transition-colors"
                                            >
                                                {t('testimonials.form_cancel')}
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitStatus === 'submitting'}
                                                className="flex-1 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors flex items-center justify-center gap-2"
                                            >
                                                {submitStatus === 'submitting' ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                                {t('testimonials.form_submit')}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedTestimonial && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedTestimonial(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            layoutId={selectedTestimonial.id}
                            className="bg-white dark:bg-[#1a1a1a] p-8 rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 max-h-[80vh] overflow-y-auto"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl shrink-0">
                                    {selectedTestimonial.author.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTestimonial.author}</h4>
                                    {selectedTestimonial.role && <p className="text-purple-600 dark:text-purple-400 font-medium">{selectedTestimonial.role}</p>}
                                </div>
                            </div>

                            <div className="relative">
                                <Quote className="text-purple-200 dark:text-purple-900/30 mb-4" size={32} />
                                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap break-words">
                                    "{currentIsEn ? selectedTestimonial.contentEn : selectedTestimonial.contentFr}"
                                </p>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={() => setSelectedTestimonial(null)}
                                    className="px-6 py-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-medium hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                                >
                                    {t('testimonials.modal_close')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
