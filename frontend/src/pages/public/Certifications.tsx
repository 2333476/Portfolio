import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import CertificationsCarousel from '../../components/ui/3DCarousel';
import GridBackground from '../../components/layout/GridBackground';

interface Certification {
    id: string;
    nameEn: string;
    nameFr: string;
    issuer: string;
    date: string;
    url?: string;
    imageUrl?: string;
}

export default function Certifications() {
    const { t, i18n } = useTranslation();
    const [certs, setCerts] = useState<Certification[]>([]);
    const [loading, setLoading] = useState(true);

    const isEn = i18n.language === 'en';

    useEffect(() => {
        api.get('/certifications')
            .then(({ data }) => {
                setCerts(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch certifications:", err);
                setLoading(false);
            });
    }, []);

    // Map API data to Carousel interface
    const carouselData = certs.map(c => ({
        id: c.id,
        name: isEn ? c.nameEn : c.nameFr,
        issuer: c.issuer,
        date: c.date,
        credentialUrl: c.url,
        imageUrl: c.imageUrl
    }));

    return (
        <section className="bg-white dark:bg-gray-950 min-h-screen pt-24 pb-20 px-4 font-sans text-gray-900 dark:text-white overflow-hidden transition-colors duration-300 relative">
            <GridBackground />
            <div className="max-w-7xl mx-auto flex flex-col items-center relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
                        <Award className="text-purple-600 dark:text-purple-500" size={40} />
                        <span>{t('certifications.title')}</span>
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">{t('certifications.subtitle')}</p>
                </motion.div>

                {/* Carousel */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-purple-500" size={48} />
                    </div>
                ) : (
                    <CertificationsCarousel certifications={carouselData} />
                )}
            </div>
        </section>
    );
}
