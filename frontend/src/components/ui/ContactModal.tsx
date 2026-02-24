import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Linkedin, Github, Instagram, Send, Loader2, Zap, Bug, Heart, Sun, Moon, Star, Bell, Coffee } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { getClientUUID } from '../../utils/security';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', fax: '', website_url: '', company_name: '' });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const openTimeRef = useRef(0);
    const [verificationState, setVerificationState] = useState<'idle' | 'verified' | 'error'>('idle');
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [targetIcon, setTargetIcon] = useState('zap');
    const [displayIcons, setDisplayIcons] = useState<{ id: string, icon: React.ElementType }[]>([]);

    const iconPool = useMemo(() => [
        { id: 'zap', icon: Zap },
        { id: 'bug', icon: Bug },
        { id: 'heart', icon: Heart },
        { id: 'sun', icon: Sun },
        { id: 'moon', icon: Moon },
        { id: 'star', icon: Star },
        { id: 'bell', icon: Bell },
        { id: 'coffee', icon: Coffee }
    ], []);

    useEffect(() => {
        if (isOpen) {
            // 🛡️ Impure updates (Math.random, Date.now) and setState must be deferred 
            // to satisfy strict purity and avoid cascading render warnings.
            const timer = setTimeout(() => {
                openTimeRef.current = Date.now();
                setVerificationState('idle');

                const shuffled = [...iconPool].sort(() => Math.random() - 0.5);
                const selected = shuffled.slice(0, 3);
                const target = selected[Math.floor(Math.random() * 3)].id;

                setDisplayIcons(selected);
                setTargetIcon(target);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isOpen, iconPool]);
    const MAX_CHARS = 500;

    const contactInfo = {
        email: 'isaa.nachate1725258@gmail.com',
        socials: [
            { name: 'LinkedIn', url: 'https://www.linkedin.com/in/isaac-nachate-b59229343/', icon: Linkedin },
            { name: 'Instagram', url: 'https://www.instagram.com/isaac.nct/', icon: Instagram },
            { name: 'GitHub', url: 'https://github.com/2333476', icon: Github },
        ]
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(label);
        showToast(t('contact_modal.email_copied'), 'success');
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (verificationState !== 'verified') {
            setVerificationState('error');
            showToast(t('common.security.retry'), 'error');
            return;
        }

        if (form.message.length > MAX_CHARS) {
            showToast(`${t('common.error')}: Message too long (${form.message.length}/${MAX_CHARS})`, 'error');
            return;
        }

        setStatus('submitting');
        try {
            const submission_token = btoa(openTimeRef.current.toString());
            // Catching bots that bypass React state via direct DOM manipulation (like in the console demo)
            const faxVal = (document.getElementById('fax') as HTMLInputElement)?.value;
            const websiteVal = (document.getElementById('website_url') as HTMLInputElement)?.value;
            const companyVal = (document.getElementById('company_name') as HTMLInputElement)?.value;

            await api.post('/messages', {
                ...form,
                fax: faxVal || form.fax,
                website_url: websiteVal || form.website_url,
                company_name: companyVal || form.company_name,
                submission_token,
                turnstile_token: turnstileToken,
                client_uuid: getClientUUID()
            }, {
                headers: { 'X-Client-UUID': getClientUUID() }
            });

            setStatus('success');
            setForm({ name: '', email: '', subject: '', message: '', fax: '', website_url: '', company_name: '' });
            showToast(t('contact_modal.success_msg'), 'success');
            setTimeout(() => {
                setStatus('idle');
                onClose();
            }, 2000);
        } catch (error) {
            setStatus('error');
            const axiosError = error as { response?: { data?: { error?: string, message?: string } } };
            const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || t('contact_modal.error_msg');
            showToast(errorMessage, 'error');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 w-full max-w-4xl rounded-3xl overflow-hidden pointer-events-auto relative shadow-2xl transition-colors duration-300 flex flex-col md:flex-row max-h-[95vh] md:max-h-[90vh] overflow-y-auto md:overflow-visible">

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-10 p-2 bg-gray-100 dark:bg-black/50 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="bg-gray-50 dark:bg-[#1a1a1a] p-6 md:p-8 md:w-1/3 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('contact_modal.info_title')}</h3>
                                <div className="space-y-4">
                                    <div className="group bg-white dark:bg-black/20 border border-gray-200 dark:border-white/5 p-4 rounded-2xl flex items-center justify-between gap-3 transition-colors hover:border-purple-500/30">
                                        <div className="min-w-0">
                                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-0.5">{t('contact_modal.email')}</div>
                                            <div className="text-gray-900 dark:text-white font-semibold truncate text-sm">{contactInfo.email}</div>
                                        </div>
                                        <button onClick={() => copyToClipboard(contactInfo.email, 'Email')} className="text-gray-400 hover:text-purple-500">
                                            {copiedField === 'Email' ? <Check size={18} /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-center gap-4 mt-8">
                                    {contactInfo.socials.map((social) => (
                                        <a
                                            key={social.name}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 bg-white dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white transition-all shadow-sm border border-gray-200 dark:border-white/5"
                                            title={social.name}
                                        >
                                            <social.icon size={20} />
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 md:p-8 md:w-2/3 flex flex-col">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('contact_modal.form_title')}</h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{t('contact_modal.form_subtitle')}</p>

                                <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact_modal.name')}</label>
                                            <input
                                                required
                                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
                                                placeholder="John Doe"
                                                value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact_modal.email')}</label>
                                            <input
                                                required
                                                type="email"
                                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
                                                placeholder="john@example.com"
                                                value={form.email}
                                                onChange={e => setForm({ ...form, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact_modal.subject')}</label>
                                        <input
                                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
                                            placeholder="..."
                                            value={form.subject}
                                            onChange={e => setForm({ ...form, subject: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">{t('contact_modal.message')}</label>
                                            <span className={`text-[10px] ${form.message.length > MAX_CHARS ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                                {form.message.length}/{MAX_CHARS} {t('common.chars')}
                                            </span>
                                        </div>
                                        <textarea
                                            required
                                            className={`w-full h-32 bg-gray-50 dark:bg-black/20 border ${form.message.length > MAX_CHARS ? 'border-red-500' : 'border-gray-200 dark:border-white/10'} rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors resize-none text-sm`}
                                            placeholder={t('contact_modal.placeholder_msg')}
                                            value={form.message}
                                            onChange={e => setForm({ ...form, message: e.target.value })}
                                        />
                                    </div>

                                    {/* Honeypot fields (hidden from humans) */}
                                    <div className="absolute opacity-0 pointer-events-none -z-50 h-0 overflow-hidden" aria-hidden="true">
                                        <label htmlFor="fax">{t('contact_modal.fax_label')}</label>
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

                                    {/* Visual Challenge */}
                                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10">
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

                                    <button
                                        type="submit"
                                        disabled={status === 'submitting' || verificationState !== 'verified'}
                                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {status === 'submitting' ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                        {t('contact_modal.send_btn')}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
