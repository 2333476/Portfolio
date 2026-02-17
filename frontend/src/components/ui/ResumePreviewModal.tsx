import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ResumePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    resumeUrl: string | null;
}

export default function ResumePreviewModal({ isOpen, onClose, resumeUrl }: ResumePreviewModalProps) {
    return (
        <AnimatePresence>
            {isOpen && resumeUrl && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <div className="absolute top-5 right-5 z-[10001]">
                        <button
                            onClick={onClose}
                            className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#1e1e1e] w-full max-w-5xl h-[85vh] rounded-xl flex flex-col shadow-2xl border border-white/10 overflow-hidden"
                    >
                        <div className="flex-1 relative bg-gray-900">
                            <iframe
                                src={resumeUrl}
                                className="w-full h-full border-none"
                                title="Resume PDF"
                                loading="lazy"
                            />
                            {/* Fallback overlay in case of blocked iframe */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity bg-black/40">
                                <a
                                    href={resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="pointer-events-auto bg-purple-600 text-white px-6 py-2 rounded-lg font-bold"
                                >
                                    Open in New Tab if Blank
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
