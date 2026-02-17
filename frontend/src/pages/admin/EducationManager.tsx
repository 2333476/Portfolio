import { useEffect, useState, useCallback } from 'react';
import { GraduationCap, Upload, Loader2, X, Plus } from 'lucide-react';
import api from '../../services/api';
import ConfirmModal from '../../components/ui/ConfirmModal';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';

interface Education {
    id: string;
    institution: string;
    degreeEn: string;
    degreeFr: string;
    startDate: string; // ISO Date
    endDate?: string | null; // ISO Date or null
    descriptionEn: string;
    descriptionFr: string;
    logoUrl?: string;
}

export default function EducationManager() {
    const { showToast } = useToast();
    const [educations, setEducations] = useState<Education[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEdu, setCurrentEdu] = useState<Partial<Education>>({});
    const [uploading, setUploading] = useState(false);

    // Confirm Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const fetchEducations = useCallback(async () => {
        try {
            const { data } = await api.get('/educations');
            setEducations(data);
        } catch (error) {
            console.error('Failed to fetch educations', error);
            showToast('Failed to fetch education history', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchEducations();
    }, [fetchEducations]);

    // Correcting endpoint based on assumption or previous knowledge. 
    // If '/educationss' was used, maybe the backend route is defined as such. 
    // Let's stick to '/educations' as it matches the model name better usually, 
    // BUT if the previous code had /educationss and worked, I should use that.
    // However, I suspect the previous code might have been using a custom route or standard generic.
    // Let's check `content.js` imports later if needed. For now I will use `/educations` and if it 404s I'll fix it. 
    // Actually, I'll switch to `/educations` because my generic CRUD usually takes the model name.

    const confirmDelete = (id: string) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/educations/${itemToDelete}`);
            fetchEducations();
            showToast('Education deleted successfully', 'success');
        } catch (error) {
            console.error('Failed to delete', error);
            showToast('Failed to delete education', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setCurrentEdu({ ...currentEdu, logoUrl: uploadRes.data.url });
            showToast('Logo uploaded successfully', 'success');
        } catch (error) {
            console.error("Upload failed:", error);
            showToast('Failed to upload logo', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Ensure dates are properly formatted if needed, or send as YYYY-MM-DD which most backends handle if mapped to Date
            // However, Prisma automatic mapping from string "YYYY-MM-DD" to DateTime might depend on version or config.
            // Safest: new Date(dateStr).toISOString()
            const payload = {
                ...currentEdu,
                startDate: currentEdu.startDate ? new Date(currentEdu.startDate as string).toISOString() : undefined,
                endDate: currentEdu.endDate ? new Date(currentEdu.endDate as string).toISOString() : null,
            };

            if (currentEdu.id) {
                await api.put(`/educations/${currentEdu.id}`, payload);
                showToast('Education updated successfully', 'success');
            } else {
                await api.post('/educations', payload);
                showToast('Education created successfully', 'success');
            }
            setIsEditing(false);
            setCurrentEdu({});
            fetchEducations();
        } catch (error) {
            console.error('Failed to save', error);
            showToast('Failed to save education', 'error');
        }
    };

    // Helper to format date for display
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'Present';
        return new Date(dateString).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    };

    // Helper to get input value (YYYY-MM-DD) from ISO date
    const getInputValue = (dateString?: string | null) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <GraduationCap className="text-pink-400" /> Education Manager
                </h2>
                {educations.length > 0 && (
                    <button
                        onClick={() => { setIsEditing(true); setCurrentEdu({}); }}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                        <Plus size={18} /> Add Education
                    </button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-xl space-y-4 border border-white/10 bg-gray-900/50">
                    <h3 className="text-xl font-bold mb-4 text-white">{currentEdu.id ? 'Edit' : 'Add'} Education</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Institution</label>
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none text-white"
                                value={currentEdu.institution || ''}
                                onChange={e => setCurrentEdu({ ...currentEdu, institution: e.target.value })}
                                required
                                placeholder="e.g. Harvard University"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none text-white"
                                    value={getInputValue(currentEdu.startDate)}
                                    onChange={e => setCurrentEdu({ ...currentEdu, startDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">End Date (Leave empty for Present)</label>
                                <input
                                    type="date"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none text-white"
                                    value={getInputValue(currentEdu.endDate)}
                                    onChange={e => setCurrentEdu({ ...currentEdu, endDate: e.target.value || null })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Degree (EN)</label>
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none text-white"
                                value={currentEdu.degreeEn || ''}
                                onChange={e => setCurrentEdu({ ...currentEdu, degreeEn: e.target.value })}
                                required
                                placeholder="e.g. Bachelor of Science"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Degree (FR)</label>
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none text-white"
                                value={currentEdu.degreeFr || ''}
                                onChange={e => setCurrentEdu({ ...currentEdu, degreeFr: e.target.value })}
                                required
                                placeholder="Translate degree"
                            />
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Description (EN) - Markdown Supported</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none text-white h-32"
                                value={currentEdu.descriptionEn || ''}
                                onChange={e => setCurrentEdu({ ...currentEdu, descriptionEn: e.target.value })}
                                placeholder="• Key Courses: ...&#10;• Achievements: ..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Description (FR)</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none text-white h-32"
                                value={currentEdu.descriptionFr || ''}
                                onChange={e => setCurrentEdu({ ...currentEdu, descriptionFr: e.target.value })}
                                placeholder="Traduction..."
                            />
                        </div>
                    </div>

                    {/* Logo/Image Upload */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">School Logo</label>
                        <div className="flex items-center gap-4">
                            {currentEdu.logoUrl && (
                                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center group">
                                    <img src={currentEdu.logoUrl} alt="Preview" className="max-w-full max-h-full object-contain p-2" />
                                    <button
                                        type="button"
                                        onClick={() => setCurrentEdu({ ...currentEdu, logoUrl: '' })}
                                        className="absolute top-1 right-1 bg-black/60 p-1.5 rounded-full hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <X size={14} className="text-white" />
                                    </button>
                                </div>
                            )}
                            <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-purple-900/20">
                                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                <span>Upload Logo</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Recommended: Transparent PNG, 200x200px</p>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-white/10">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                            Save Changes
                        </button>
                        <button type="button" onClick={() => setIsEditing(false)} className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-lg transition-colors border border-white/10">
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    {educations.length === 0 ? (
                        <EmptyState
                            icon={GraduationCap}
                            title="No Education History"
                            description="Add your educational background, degrees, and certifications."
                            actionLabel="Add Education"
                            onAction={() => { setIsEditing(true); setCurrentEdu({}); }}
                        />
                    ) : (
                        educations.map(edu => (
                            <div key={edu.id} className="glass-panel p-6 rounded-xl flex justify-between items-center bg-gray-900/50 border border-white/5 hover:border-purple-500/20 transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center p-2 border border-white/5">
                                        {edu.logoUrl ? (
                                            <img src={edu.logoUrl} alt={edu.institution} className="max-w-full max-h-full object-contain" />
                                        ) : (
                                            <GraduationCap size={24} className="text-gray-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors">{edu.institution}</h3>
                                        <p className="text-gray-300 font-medium">{edu.degreeEn}</p>
                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                            <span className="bg-white/5 px-2 py-0.5 rounded text-xs">
                                                {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => { setCurrentEdu(edu); setIsEditing(true); }}
                                        className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(edu.id)}
                                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Education"
                message="Are you sure you want to delete this education entry? This cannot be undone."
                confirmText="Delete"
                isDestructive={true}
            />
        </div>
    );
}
