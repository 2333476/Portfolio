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
                        <iframe
                            src={`${resumeUrl}#view=FitH`}
                            className="w-full h-full border-none bg-gray-900"
                            title="Resume PDF"
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
