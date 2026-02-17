import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';

export default function Contact() {
    const { t } = useTranslation();
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        try {
            await api.post('/messages', form);
            setStatus('success');
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch {
            setStatus('error');
        }
    };

    return (
        <section id="contact" className="py-24 bg-gray-950 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-gray-950 to-gray-950 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10 max-w-4xl">
                <motion.div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('contact.title')}</h2>
                    <p className="text-gray-400">{t('contact.subtitle')}</p>
                </motion.div>

                <div className="glass-panel p-8 md:p-10 rounded-2xl border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
                    {status === 'success' ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-black">✓</div>
                            <h3 className="text-2xl font-bold text-white mb-2">{t('contact.success_title')}</h3>
                            <p className="text-gray-400">{t('contact.success_body')}</p>
                            <button onClick={() => setStatus('idle')} className="mt-6 text-green-400 hover:text-green-300 underline">{t('contact.send_another')}</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">{t('contact.name')}</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                                        placeholder="John Doe"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">{t('contact.email')}</label>
                                    <input
                                        type="email"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                                        placeholder="john@example.com"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">{t('contact.subject')}</label>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                                    placeholder="Project Inquiry"
                                    value={form.subject}
                                    onChange={e => setForm({ ...form, subject: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">{t('contact.message')}</label>
                                <textarea
                                    rows={5}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                                    placeholder={t('contact.placeholder_msg')}
                                    value={form.message}
                                    onChange={e => setForm({ ...form, message: e.target.value })}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold rounded-lg hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {status === 'submitting' ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                                <span>{status === 'submitting' ? t('contact.sending') : t('contact.send')}</span>
                            </button>

                            {status === 'error' && <p className="text-red-400 text-center">{t('contact.error')}</p>}
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
