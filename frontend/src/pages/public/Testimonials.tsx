import { useEffect, useState, useMemo } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Star, Send, Loader2, Quote, Check, Zap, Bug, Heart, Sun, Moon, Star as StarIcon, Bell, Coffee } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import GridBackground from '../../components/layout/GridBackground';
import { useToast } from '../../context/ToastContext';
import { useContactModal } from '../../context/ContactModalContext';
import { getClientUUID } from '../../utils/security';

interface Testimonial {
    id: string;
    author: string;
    role?: string;
    contentEn: string;
    contentFr: string;
    createdAt: string;
}

export default function Testimonials() {
    const { t, i18n } = useTranslation();
    const { showToast } = useToast();
    const { setTestimonialModalOpen } = useContactModal();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);

    // Sync with global modal state for FloatingControls to hide
    useEffect(() => {
        setTestimonialModalOpen(isModalOpen || !!selectedTestimonial);
    }, [isModalOpen, selectedTestimonial, setTestimonialModalOpen]);

    // Form State
    const [form, setForm] = useState({ author: '', role: '', content: '', fax: '', website_url: '', company_name: '' });
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [openTime, setOpenTime] = useState(Date.now());
    const [verificationState, setVerificationState] = useState<'idle' | 'verified' | 'error'>('idle');
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [targetIcon, setTargetIcon] = useState('zap');
    const [displayIcons, setDisplayIcons] = useState<{ id: string, icon: any }[]>([]);

    const iconPool = useMemo(() => [
        { id: 'zap', icon: Zap },
        { id: 'bug', icon: Bug },
        { id: 'heart', icon: Heart },
        { id: 'sun', icon: Sun },
        { id: 'moon', icon: Moon },
        { id: 'star', icon: StarIcon },
        { id: 'bell', icon: Bell },
        { id: 'coffee', icon: Coffee }
    ], []);

    useEffect(() => {
        if (isModalOpen) {
            setOpenTime(Date.now());
            setVerificationState('idle');

            // 1. Randomly select 3 unique icons
            const shuffled = [...iconPool].sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, 3);
            setDisplayIcons(selected);

            // 2. Randomly select one of the 3 as target
            const target = selected[Math.floor(Math.random() * 3)].id;
            setTargetIcon(target);
        }
    }, [isModalOpen, iconPool]);
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

        if (verificationState !== 'verified') {
            setVerificationState('error');
            showToast(t('common.security.retry'), 'error');
            return;
        }

        if (form.content.length > MAX_CHARS) {
            showToast(`${t('common.error')}: Testimonial too long (${form.content.length}/${MAX_CHARS})`, 'error');
            return;
        }

        setSubmitStatus('submitting');
        try {
            const submission_token = btoa(openTime.toString());
            // Catching bots that bypass React state via direct DOM manipulation
            const faxVal = (document.getElementById('fax') as HTMLInputElement)?.value;
            const websiteVal = (document.getElementById('website_url') as HTMLInputElement)?.value;
            const companyVal = (document.getElementById('company_name') as HTMLInputElement)?.value;

            const payload = {
                ...form,
                fax: faxVal || form.fax,
                website_url: websiteVal || form.website_url,
                company_name: companyVal || form.company_name,
                contentEn: form.content,
                contentFr: form.content,
                submission_token,
                turnstile_token: turnstileToken,
                client_uuid: getClientUUID()
            };
            await api.post('/testimonials', payload, {
                headers: { 'X-Client-UUID': getClientUUID() }
            });
            setSubmitStatus('success');
            setTimeout(() => {
                setIsModalOpen(false);
                setSubmitStatus('idle');
                setForm({ author: '', role: '', content: '', fax: '', website_url: '', company_name: '' });
                setVerificationState('idle');
            }, 2000);
        } catch (error) {
            const axiosError = error as { response?: { data?: { error?: string, message?: string } } };
            const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Failed to submit testimonial.';
            showToast(errorMessage, 'error');
        }
    };

    return (
        <section id="testimonials" className="bg-white dark:bg-gray-950 min-h-screen pt-20 pb-12 md:pt-28 md:pb-20 px-4 font-sans text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300">
            <GridBackground />

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10 md:mb-16"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center p-2 md:p-3 rounded-full bg-purple-500/10 mb-2 md:mb-4"
                    >
                        <MessageSquare className="text-purple-600 dark:text-purple-500" size={24} />
                    </motion.div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4 tracking-tight">
                        {t('testimonials.title')}
                    </h2>
                    <p className="text-sm md:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-6 md:mb-8">
                        {t('testimonials.subtitle')}
                    </p>
                    <motion.button
                        onClick={() => {
                            setOpenTime(Date.now());
                            setIsModalOpen(true);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{
                            scale: [1, 1.05, 1],
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
                            className="bg-white dark:bg-[#1a1a1a] p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto"
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
                                            <div className="absolute opacity-0 pointer-events-none -z-50 h-0 overflow-hidden" aria-hidden="true">
                                                <label htmlFor="fax">Fax</label>
                                                <input
                                                    id="fax"
                                                    type="text"
                                                    name="fax"
                                                    tabIndex={-1}
                                                    autoComplete="off"
                                                    value={form.fax}
                                                    onChange={e => setForm(prev => ({ ...prev, fax: e.target.value }))}
                                                />
                                                <label htmlFor="website_url">Website URL</label>
                                                <input
                                                    id="website_url"
                                                    type="text"
                                                    name="website_url"
                                                    tabIndex={-1}
                                                    autoComplete="off"
                                                    value={form.website_url}
                                                    onChange={e => setForm(prev => ({ ...prev, website_url: e.target.value }))}
                                                />
                                                <label htmlFor="company_name">Company Name</label>
                                                <input
                                                    id="company_name"
                                                    type="text"
                                                    name="company_name"
                                                    tabIndex={-1}
                                                    autoComplete="off"
                                                    value={form.company_name}
                                                    onChange={e => setForm(prev => ({ ...prev, company_name: e.target.value }))}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 mt-4">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                        {t('common.security.title')}
                                                    </span>
                                                    {verificationState === 'verified' && (
                                                        <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                                                            <Check size={12} /> {t('common.security.success')}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                    {t('common.security.verify', { target: t(`common.security.${targetIcon}`) })}
                                                </p>
                                                <div className="flex justify-center gap-6 py-2">
                                                    {displayIcons.map((item) => (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => {
                                                                if (item.id === targetIcon) {
                                                                    setVerificationState('verified');
                                                                } else {
                                                                    setVerificationState('error');
                                                                }
                                                            }}
                                                            className={`p-3 rounded-xl transition-all ${verificationState === 'verified' && item.id === targetIcon
                                                                ? 'bg-green-500/20 text-green-500 border-green-500'
                                                                : verificationState === 'error' && item.id !== targetIcon
                                                                    ? 'bg-red-500/10 text-gray-400 border-transparent opacity-50 shadow-inner'
                                                                    : 'bg-white dark:bg-black/40 text-gray-400 hover:text-purple-500 border-gray-200 dark:border-white/10'
                                                                } border border-2`}
                                                        >
                                                            <item.icon size={20} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bot Protection Widget */}
                                        <div className="absolute opacity-0 pointer-events-none">
                                            <Turnstile
                                                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAACgndPYlhYSMThHR"}
                                                onSuccess={(token) => setTurnstileToken(token)}
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-6">
                                            <button
                                                type="button"
                                                onClick={() => setIsModalOpen(false)}
                                                className="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-medium transition-colors"
                                            >
                                                {t('testimonials.form_cancel')}
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitStatus === 'submitting' || verificationState !== 'verified'}
                                                className="flex-1 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                            className="bg-white dark:bg-[#1a1a1a] p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 max-h-[90vh] md:max-h-[80vh] overflow-y-auto"
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
