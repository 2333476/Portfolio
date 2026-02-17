import { useState, useEffect } from 'react';
import { Download, Eye } from 'lucide-react';
import ChatWidget from './ChatWidget';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import ResumePreviewModal from './ui/ResumePreviewModal';
import { useToast } from '../context/ToastContext';

export default function FloatingControls() {
    const { t } = useTranslation();
    const location = useLocation();
    const { showToast } = useToast();

    const [resumeUrl, setResumeUrl] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        api.get('/resumes')
            .then(({ data }) => {
                if (Array.isArray(data) && data.length > 0) {
                    setResumeUrl(data[0].fileUrl);
                }
            })
            .catch(console.error);
    }, []);

    // Hide on admin routes
    if (location.pathname.startsWith('/admin')) return null;

    // Check if we are on home page
    const isHome = location.pathname === '/';

    return (
        <>
            <div className="fixed bottom-7 z-[9999] w-full pointer-events-none flex justify-between items-end px-6 md:px-12">
                <div className="pointer-events-auto hidden md:flex items-center gap-3">
                    {!isHome && (
                        <>
                            <a
                                href={resumeUrl || '#'}
                                onClick={(e) => {
                                    if (!resumeUrl) {
                                        e.preventDefault();
                                        showToast(t('hero.resume_not_found'), 'info');
                                    }
                                }}
                                download={resumeUrl ? "resume.pdf" : undefined}
                                className={`bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 shadow-lg shadow-purple-900/20 transition-all hover:scale-105 ${!resumeUrl ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                            >
                                <Download size={18} />
                                <span>{t('hero.download_cv')}</span>
                            </a>
                            <button
                                onClick={() => {
                                    if (resumeUrl) {
                                        setShowPreview(true);
                                    } else {
                                        showToast(t('hero.resume_not_found'), 'info');
                                    }
                                }}
                                className={`w-12 h-12 bg-gray-900/50 hover:bg-purple-900/30 backdrop-blur-md rounded-full flex items-center justify-center text-gray-200 hover:text-white border border-white/10 hover:border-purple-500/50 transition-all hover:scale-105 shadow-lg ${!resumeUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={t('hero.view_cv')}
                            >
                                <Eye size={20} />
                            </button>
                        </>
                    )}
                </div>

                {/* Chat Widget - Hidden on Mobile */}
                <div className="pointer-events-auto hidden md:block">
                    <ChatWidget />
                </div>
            </div>

            <ResumePreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                resumeUrl={resumeUrl}
            />
        </>
    );
}
