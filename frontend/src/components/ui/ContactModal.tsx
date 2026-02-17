import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Linkedin, Github, Instagram, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Form State
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

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
        setStatus('submitting');
        try {
            await api.post('/messages', form);
            setStatus('success');
            setForm({ name: '', email: '', subject: '', message: '' });
            showToast(t('contact_modal.success_msg'), 'success');
            setTimeout(() => {
                setStatus('idle');
                onClose();
            }, 2000);
        } catch (error) {
            setStatus('error');
            const axiosError = error as { response?: { data?: { error?: string } } };
            const errorMessage = axiosError.response?.data?.error || 'Failed to send message.';
            showToast(errorMessage, 'error');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 w-full max-w-4xl rounded-3xl overflow-hidden pointer-events-auto relative shadow-2xl transition-colors duration-300 flex flex-col md:flex-row max-h-[90vh]">

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-10 p-2 bg-gray-100 dark:bg-black/50 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            {/* Left Side: Contact Info */}
                            <div className="bg-gray-50 dark:bg-[#1a1a1a] p-8 md:w-1/3 flex flex-col justify-center border-r border-gray-100 dark:border-white/5">
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

                            {/* Right Side: Contact Form */}
                            <div className="p-8 md:w-2/3 flex flex-col overflow-y-auto">
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
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact_modal.message')}</label>
                                        <textarea
                                            required
                                            className="w-full h-32 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 transition-colors resize-none text-sm"
                                            placeholder={t('contact_modal.placeholder_msg')}
                                            value={form.message}
                                            onChange={e => setForm({ ...form, message: e.target.value })}
                                        />
                                    </div>

                                    {/* Honeypot field (hidden from humans) */}
                                    <div className="hidden" aria-hidden="true">
                                        <label htmlFor="fax">{t('contact_modal.fax_label')}</label>
                                        <input
                                            id="fax"
                                            type="text"
                                            name="fax"
                                            tabIndex={-1}
                                            autoComplete="off"
                                            value={(form as Record<string, string>).fax || ''}
                                            onChange={e => setForm(prev => ({ ...prev, fax: e.target.value }))}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === 'submitting'}
                                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
