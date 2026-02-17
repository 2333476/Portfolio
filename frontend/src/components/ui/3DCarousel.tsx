import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, ChevronLeft, ChevronRight } from 'lucide-react';

interface Certification {
    id: string;
    name: string;
    issuer: string;
    date: string;
    credentialUrl?: string; // URL to the certificate
    imageUrl?: string; // Logo of issuer
}

interface CertificationsCarouselProps {
    certifications: Certification[];
}

export default function CertificationsCarousel({ certifications }: CertificationsCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % certifications.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + certifications.length) % certifications.length);
    };

    // Calculate visible range (center, left, right) for simple 3-card view logic
    // But for a true carousel feel with many items, we often just render the center and neighbors.
    // Let's use a mapping approach where the active one is scale 1.1, z-index 10.

    if (certifications.length === 0) {
        return <div className="text-center text-gray-500">No certifications added yet.</div>;
    }

    return (
        <div className="relative w-full max-w-5xl mx-auto h-[500px] flex items-center justify-center perspective-1000">
            {/* Controls */}
            {certifications.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 md:left-0 z-20 p-3 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white transition-all backdrop-blur-sm shadow-md dark:shadow-none"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 md:right-0 z-20 p-3 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white transition-all backdrop-blur-sm shadow-md dark:shadow-none"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <AnimatePresence initial={false} mode='popLayout'>
                    {certifications.map((cert, index) => {
                        // Calculate offset from current index
                        let offset = index - currentIndex;
                        // Handle wrap-around logic for smoother infinite feel if needed, 
                        // but for simple list, let's keep it simple or implement circular logic if length > 2

                        // Circular logic
                        const len = certifications.length;
                        if (len > 2) {
                            if (offset > len / 2) offset -= len;
                            if (offset < -len / 2) offset += len;
                        }

                        // Determine styles based on offset
                        const isActive = offset === 0;
                        const isPrev = offset === -1;
                        const isNext = offset === 1;
                        const isVisible = isActive || isPrev || isNext;

                        if (!isVisible) return null; // Or hide with opacity 0

                        return (
                            <motion.div
                                key={cert.id}
                                layout
                                initial={{
                                    scale: 0.8,
                                    opacity: 0,
                                    x: offset * 300 // Initial guess
                                }}
                                animate={{
                                    scale: isActive ? 1.1 : 0.85,
                                    opacity: isActive ? 1 : 0.4,
                                    x: offset * (window.innerWidth < 768 ? 50 : 250), // Overlap nicely
                                    zIndex: isActive ? 10 : 5,
                                    filter: isActive ? 'blur(0px)' : 'blur(2px)',
                                    rotateY: offset * -15
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="absolute w-[280px] md:w-[350px] bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl transition-colors duration-300"
                                style={{
                                    boxShadow: isActive ? '0 20px 50px rgba(0,0,0,0.1), 0 0 20px rgba(168,85,247,0.2)' : 'none'
                                }}
                            >
                                {/* Logo Area */}
                                <div className="w-24 h-24 bg-gray-50 dark:bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg p-2 border border-gray-100 dark:border-transparent">
                                    {cert.imageUrl ? (
                                        <img src={cert.imageUrl} alt={cert.issuer} className="w-full h-full object-contain" />
                                    ) : (
                                        <Award className="text-gray-900" size={40} />
                                    )}
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">{cert.name}</h3>
                                <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">{cert.issuer}</p>
                                <p className="text-sm text-gray-500 mb-6">{cert.date}</p>

                                {/* Action */}
                                <a
                                    href={cert.credentialUrl || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3 bg-[#6344F5] hover:bg-[#7257F7] text-white rounded-xl font-bold transition-all shadow-[0_4px_20px_rgba(99,68,245,0.4)] hover:shadow-[0_4px_25px_rgba(99,68,245,0.6)] flex items-center justify-center gap-2"
                                >
                                    View Credential
                                </a>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Pagination Dots */}
            <div className="absolute bottom-4 flex gap-2">
                {certifications.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-purple-600 dark:bg-white w-6' : 'bg-gray-300 dark:bg-white/20'}`}
                    />
                ))}
            </div>
        </div>
    );
}
