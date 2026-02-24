import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { Turnstile } from '@marsidev/react-turnstile';
import { getClientUUID } from '../utils/security';

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

// Custom Animated Avatar (Lumi)
const LumiAvatar = ({ isActive = false }: { isActive?: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.circle
            cx="12" cy="12" r="8"
            stroke="currentColor" strokeWidth="2"
            initial={{ scale: 0.8 }}
            animate={{ scale: isActive ? [0.8, 1.1, 0.9, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
        <motion.circle
            cx="12" cy="12" r="3"
            fill="currentColor"
            animate={{ opacity: isActive ? [1, 0.5, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
        />
        <motion.path
            d="M12 2L12 4M12 20L12 22M2 12L4 12M20 12L22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: isActive ? 1 : 0, rotate: isActive ? 180 : 0 }}
            transition={{ duration: 0.5 }}
        />
    </svg>
);

export default function ChatWidget() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', text: t('chat.welcome_msg') }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const { data } = await api.post('/chat', {
                message: userMsg,
                turnstile_token: turnstileToken,
                client_uuid: getClientUUID()
            }, {
                headers: { 'X-Client-UUID': getClientUUID() }
            });
            setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', text: t('chat.error_msg') }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative z-50 flex flex-col items-end pointer-events-none">
            <div className="pointer-events-auto">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="mb-4 w-[350px] md:w-[400px] bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                            style={{ maxHeight: 'min(500px, 80vh)' }}
                        >
                            {/* Header */}
                            <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 flex justify-between items-center border-b border-white/10">
                                <div className="flex items-center gap-3 text-white">
                                    <div className="text-white">
                                        <LumiAvatar isActive={loading} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm tracking-wide">{t('chat.lumi_name')}</h3>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-300 animate-pulse' : 'bg-green-400'}`} />
                                            <span className="text-[10px] text-white/80 uppercase">{loading ? t('chat.thinking') : t('chat.online')}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-purple-600 text-white rounded-br-none'
                                                : 'bg-[#1a1a2e] border border-white/10 text-gray-200 rounded-bl-none'
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl px-4 py-3 rounded-bl-none flex gap-1 items-center">
                                            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" />
                                            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-75" />
                                            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-150" />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-black/20">
                                <div className="relative flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={t('chat.input_placeholder')}
                                        className="w-full bg-[#0f0f1a] border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors text-sm"
                                    />
                                    {/* Bot Protection Triggered on Open or Message */}
                                    <div className="absolute opacity-0 pointer-events-none">
                                        <Turnstile
                                            siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAACgndPYlhYSMThHR"}
                                            onSuccess={(token) => setTurnstileToken(token)}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !input.trim()}
                                        className="absolute right-2 p-2 bg-purple-600 rounded-lg text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative z-50">
                    <AnimatePresence>
                        {!isOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: [0, 0.5, 0], scale: [1, 1.5] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                    className="absolute inset-0 bg-purple-500 rounded-full z-0"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: [0, 0.5, 0], scale: [1, 1.5] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
                                    className="absolute inset-0 bg-purple-500 rounded-full z-0"
                                />
                            </>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-14 h-14 bg-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-purple-500/40 transition-shadow relative z-10"
                    >
                        <AnimatePresence mode='wait'>
                            {isOpen ? (
                                <motion.div
                                    key="close"
                                    initial={{ opacity: 0, rotate: -90 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: 90 }}
                                >
                                    <X size={24} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="chat"
                                    initial={{ opacity: 0, rotate: 90 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: -90 }}
                                >
                                    <MessageCircle size={28} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Floating Tooltip Bubble - Matches Image */}
                        {!isOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                className="absolute bottom-full mb-3 right-0 px-4 py-3 bg-[#1a1a1a] text-white text-sm font-medium rounded-xl rounded-br-sm shadow-xl whitespace-nowrap flex items-center gap-2 border border-white/5"
                            >
                                <Sparkles size={16} className="text-yellow-400" />
                                <span>{t('chat.tooltip')}</span>
                            </motion.div>
                        )}
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
