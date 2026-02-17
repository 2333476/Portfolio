
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Trash2, Eye, Loader2, X, Download } from 'lucide-react';
import api from '../../services/api';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../context/ToastContext';

interface Resume {
    id: string;
    fileUrl: string;
    updatedAt: string;
}

export default function ResumeManager() {
    const { showToast } = useToast();
    const [resume, setResume] = useState<Resume | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Confirm Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const fetchResume = useCallback(async () => {
        try {
            const { data } = await api.get('/resumes');
            // Assuming sorting is correct now
            if (Array.isArray(data) && data.length > 0) {
                setResume(data[0]);
            } else {
                setResume(null);
            }
        } catch (error) {
            console.error("Failed to fetch resume:", error);
            showToast("Failed to fetch resume information", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchResume();
    }, [fetchResume]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file); // API expects 'image' key even for pdf based on upload.js

        try {
            // 1. Upload File
            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const fileUrl = uploadRes.data.url;

            // 2. Create or Update Resume Record
            if (resume) {
                // Update existing
                await api.put(`/resumes/${resume.id}`, { fileUrl });
            } else {
                // Create new
                await api.post('/resumes', { fileUrl });
            }

            await fetchResume();
            showToast("Resume uploaded successfully!", "success");
        } catch (error) {
            console.error("Upload failed:", error);
            showToast("Failed to upload resume. Please try again.", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!resume) return;

        try {
            await api.delete(`/resumes/${resume.id}`);
            setResume(null);
            showToast("Resume deleted successfully!", "success");
        } catch (error) {
            console.error("Delete failed:", error);
            showToast("Failed to delete resume.", "error");
        } finally {
            setIsDeleteModalOpen(false); // Close modal regardless of success/failure
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-purple-500" /></div>;

    return (
        <div className="bg-[#1a1a2e] rounded-xl border border-white/5 p-8 relative overflow-hidden">

            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FileText className="text-purple-500" />
                        <span>Resume Management</span>
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Upload and manage your CV visible on the public site.</p>
                </div>
            </div>

            {/* Current Resume Display or Upload Placeholder */}
            {resume ? (
                <div className="bg-[#121212] border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-6 min-h-[300px]">
                    <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-2">
                        <FileText size={40} />
                    </div>

                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white">Current Experience CV</h3>
                        <p className="text-gray-500 text-sm mt-1">Last updated: {new Date(resume.updatedAt).toLocaleDateString()}</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowPreview(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors"
                        >
                            <Eye size={18} />
                            View
                        </button>

                        <label className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium cursor-pointer transition-colors shadow-lg shadow-purple-900/20">
                            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                            <span>Replace</span>
                            <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                        </label>

                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors"
                        >
                            <Trash2 size={18} />
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <div className="border-2 border-dashed border-white/10 rounded-xl min-h-[300px] flex flex-col items-center justify-center gap-4 bg-white/5 hover:bg-white/[0.07] transition-colors cursor-pointer relative group">
                    <input
                        type="file"
                        accept=".pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                        {uploading ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-white">Upload Resume</h3>
                        <p className="text-gray-500 text-sm">PDF files only, max 5MB</p>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreview && resume && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1e1e1e] w-full max-w-5xl h-[85vh] rounded-xl flex flex-col shadow-2xl border border-white/10"
                        >
                            {/* Modal Header */}
                            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-[#121212] rounded-t-xl">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <FileText size={18} className="text-purple-400" />
                                    Resume Preview
                                </h3>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={resume.fileUrl}
                                        download="resume.pdf"
                                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        title="Download"
                                    >
                                        <Download size={20} />
                                    </a>
                                    <button
                                        onClick={() => setShowPreview(false)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* PDF Viewer using iframe */}
                            <div className="flex-1 bg-gray-900 relative">
                                <iframe
                                    src={`${resume.fileUrl}#view=FitH`}
                                    className="w-full h-full border-none"
                                    title="Resume PDF"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Resume"
                message="Are you sure you want to delete your resume? This action cannot be undone and the file will be permanently removed from the server."
                confirmText="Yes, Delete"
                isDestructive={true}
            />
        </div>
    );
}

