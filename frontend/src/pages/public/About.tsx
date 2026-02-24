import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import GridBackground from '../../components/layout/GridBackground';

const TypewriterText = ({ text, delay = 0, speed = 50, onComplete, className = '' }: { text: string, delay?: number, speed?: number, onComplete?: () => void, className?: string }) => {
    const [displayedText, setDisplayedText] = useState('');
    const hasStarted = useRef(false);
    const onCompleteRef = useRef(onComplete);

    // Keep ref updated with latest callback
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        setDisplayedText('');
        hasStarted.current = false;
    }, [text]);

    useEffect(() => {
        if (!text) return;
        if (hasStarted.current) return; // Prevent restart

        const startTimeout = setTimeout(() => {
            hasStarted.current = true;
            let currentIndex = 0;

            const interval = setInterval(() => {
                setDisplayedText(text.slice(0, currentIndex + 1));
                currentIndex++;

                if (currentIndex === text.length) {
                    clearInterval(interval);
                    onCompleteRef.current?.();
                }
            }, speed);

            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(startTimeout);
    }, [text, delay, speed]); // Removed onComplete from deps

    return <span className={className}>{displayedText}</span>;
};

export default function About() {
    const { t } = useTranslation();
    // 0: Initial Delay
    // 1: Type Welcome
    // 2: Prompt 1
    // 3: Command 1 (about_me)
    // 4: List 1
    // 5: Prompt 2
    // 6: Command 2 (current_strengths)
    // 7: List 2
    // 8: Final Prompt + Footer
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (step === 0) {
            const timer = setTimeout(() => setStep(1), 500);
            return () => clearTimeout(timer);
        }
    }, [step]);

    return (
        <section id="about" className="relative min-h-screen pt-20 pb-16 md:pt-24 overflow-hidden dark:bg-gray-950 flex items-center justify-center px-4 transition-colors duration-300">
            <GridBackground />
            {/* Terminal Window */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                drag
                dragConstraints={{ left: -100, right: 100, top: -50, bottom: 50 }}
                className="w-full max-w-lg sm:max-w-2xl lg:max-w-4xl bg-[#1e1e1e] rounded-xl shadow-2xl border border-white/10 overflow-hidden relative z-10 scale-[0.85] sm:scale-100 font-mono text-[13px] md:text-[14px] leading-normal flex flex-col"
                style={{ height: 'min(580px, 70vh)' }}
            >
                {/* Header */}
                <div className="bg-[#1f2029] px-4 py-3 flex items-center gap-2 border-b border-gray-800 shrink-0">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                    </div>
                    <div className="ml-3 text-slate-400 font-medium text-xs tracking-wide">about.sh</div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-5 text-gray-300 overflow-y-auto flex-1 flex flex-col pt-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">

                    {/* Welcome Message */}
                    {step >= 1 && (
                        <div className="min-h-[24px] mb-6 mt-2">
                            <TypewriterText
                                text={t('about_page.welcome')}
                                className="text-cyan-400 font-bold text-base md:text-lg"
                                speed={40}
                                onComplete={() => setStep(2)}
                            />
                        </div>
                    )}

                    {/* Block 1: About Me */}
                    {step >= 2 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-pink-500 font-bold">$</span>
                                <span className="text-purple-400 font-bold">isaac@portfolio:~$</span>
                                {step >= 2 && (
                                    <TypewriterText
                                        text={t('about_page.cmd_about')}
                                        delay={500}
                                        speed={80}
                                        className="text-pink-500 font-medium"
                                        onComplete={() => setStep(3)}
                                    />
                                )}
                            </div>

                            {step >= 3 && (
                                <ul className="space-y-2 ml-6 text-sky-300 list-none mt-1">
                                    <li className="flex gap-2">
                                        <span className="text-gray-500">•</span>
                                        <TypewriterText
                                            text={t('about_page.name')}
                                            speed={20}
                                            onComplete={() => step === 3 && setStep(4)}
                                        />
                                    </li>
                                    {step >= 4 && (
                                        <li className="flex gap-2">
                                            <span className="text-gray-500">•</span>
                                            <TypewriterText
                                                delay={200}
                                                speed={20}
                                                text={t('about_page.location')}
                                                onComplete={() => step === 4 && setStep(5)}
                                            />
                                        </li>
                                    )}
                                    {step >= 5 && (
                                        <li className="flex gap-2">
                                            <span className="text-gray-500">•</span>
                                            <TypewriterText
                                                delay={200}
                                                speed={20}
                                                text={t('about_page.passion')}
                                                onComplete={() => step === 5 && setStep(6)}
                                            />
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>
                    )}

                    {/* Block 2: Current Strengths */}
                    {step >= 6 && (
                        <div className="mt-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-pink-500 font-bold">$</span>
                                <span className="text-purple-400 font-bold">isaac@portfolio:~$</span>
                                <TypewriterText
                                    text={t('about_page.cmd_strengths')}
                                    delay={500}
                                    speed={80}
                                    className="text-pink-500 font-medium"
                                    onComplete={() => setStep(7)}
                                />
                            </div>

                            {step >= 7 && (
                                <ul className="space-y-2 ml-6 text-sky-300 list-none mt-1">
                                    <li className="flex gap-2">
                                        <span className="text-gray-500">•</span>
                                        <TypewriterText
                                            text={t('about_page.skills')}
                                            speed={20}
                                            onComplete={() => step === 7 && setStep(8)}
                                        />
                                    </li>
                                    {step >= 8 && (
                                        <li className="flex gap-2">
                                            <span className="text-gray-500">•</span>
                                            <TypewriterText
                                                delay={200}
                                                speed={20}
                                                text={t('about_page.blend')}
                                                onComplete={() => step === 8 && setStep(9)}
                                            />
                                        </li>
                                    )}
                                    {step >= 9 && (
                                        <li className="flex gap-2">
                                            <span className="text-gray-500">•</span>
                                            <TypewriterText
                                                delay={200}
                                                speed={20}
                                                text={t('about_page.cv_note')}
                                                onComplete={() => step === 9 && setStep(10)}
                                            />
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>
                    )}

                    {/* Final Prompt */}
                    {step >= 10 && (
                        <div className="mt-8">
                            <TypewriterText
                                text={t('about_page.connect')}
                                className="text-cyan-400 font-medium block mb-3 opacity-90"
                                speed={40}
                                delay={500}
                                onComplete={() => setStep(11)}
                            />

                            <div className="flex items-center gap-2 animate-pulse">
                                <span className="text-pink-500 font-bold">$</span>
                                <span className="text-purple-400 font-bold">isaac@portfolio:~$</span>
                                <span className="w-2.5 h-5 bg-gray-400 block"></span>
                            </div>

                            {/* Guard spacer for floating buttons on short screens */}
                            <div className="h-20 shrink-0" />
                        </div>
                    )}
                </div>
            </motion.div>
        </section>
    );
}
