import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Hero from '../../components/sections/Hero';
import Loader from '../../components/layout/Loader';

export default function Home() {
    // Initialize based on session storage to prevent flash of loader
    const [loading, setLoading] = useState(() => !sessionStorage.getItem('introShown'));

    useEffect(() => {
        if (loading) {
            // Simulate loading time only if not seen
            const timer = setTimeout(() => {
                setLoading(false);
                sessionStorage.setItem('introShown', 'true');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    return (
        <div className="bg-gray-950 min-h-screen text-white font-sans selection:bg-green-500 selection:text-black">
            <AnimatePresence>
                {loading && <Loader key="loader" />}
            </AnimatePresence>

            {!loading && (
                <Hero />
            )}
        </div>
    );
}
