import { useEffect, useState } from 'react';
import { Briefcase, Upload, Loader2, X } from 'lucide-react';
import api from '../../services/api';
import ConfirmModal from '../../components/ui/ConfirmModal';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';

interface Experience {
    id: string;
    company: string;
    roleEn: string;
    roleFr: string;
    period: string;
    descEn: string;
    descFr: string;
    logoUrl?: string; // Optional image URL
}

export default function ExperienceManager() {
    const { showToast } = useToast();
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentExperience, setCurrentExperience] = useState<Partial<Experience>>({});
    const [uploading, setUploading] = useState(false);

    // Confirm Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchExperiences();
    }, []);

    const fetchExperiences = async () => {
        try {
            const { data } = await api.get('/experiences');
            setExperiences(data);
        } catch (error) {
            console.error('Failed to fetch experiences', error);
            showToast('Failed to fetch experiences', 'error');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (id: string) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/experiences/${itemToDelete}`);
            fetchExperiences();
            showToast('Experience deleted successfully', 'success');
        } catch (error) {
            console.error('Failed to delete', error);
            showToast('Failed to delete experience', 'error');
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
            setCurrentExperience({ ...currentExperience, logoUrl: uploadRes.data.url });
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
            if (currentExperience.id) {
                await api.put(`/experiences/${currentExperience.id}`, currentExperience);
                showToast('Experience updated successfully', 'success');
            } else {
                await api.post('/experiences', currentExperience);
                showToast('Experience created successfully', 'success');
            }
            setIsEditing(false);
            setCurrentExperience({});
            fetchExperiences();
        } catch (error) {
            console.error('Failed to save', error);
            showToast('Failed to save experience', 'error');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Briefcase className="text-cyan-400" /> Experience
                </h2>
                {experiences.length > 0 && (
                    <button
                        onClick={() => { setIsEditing(true); setCurrentExperience({}); }}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
                    >
                        Add Experience
                    </button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-xl space-y-4">
                    <h3 className="text-xl font-bold mb-4">{currentExperience.id ? 'Edit' : 'Add'} Experience</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400">Company</label>
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2"
                                value={currentExperience.company || ''}
                                onChange={e => setCurrentExperience({ ...currentExperience, company: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400">Period</label>
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2"
                                value={currentExperience.period || ''}
                                onChange={e => setCurrentExperience({ ...currentExperience, period: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400">Role (EN)</label>
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2"
                                value={currentExperience.roleEn || ''}
                                onChange={e => setCurrentExperience({ ...currentExperience, roleEn: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400">Role (FR)</label>
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2"
                                value={currentExperience.roleFr || ''}
                                onChange={e => setCurrentExperience({ ...currentExperience, roleFr: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400">Description (EN)</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 h-32"
                                value={currentExperience.descEn || ''}
                                onChange={e => setCurrentExperience({ ...currentExperience, descEn: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400">Description (FR)</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 h-32"
                                value={currentExperience.descFr || ''}
                                onChange={e => setCurrentExperience({ ...currentExperience, descFr: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Logo/Image Upload */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Company Logo</label>
                        <div className="flex items-center gap-4">
                            {currentExperience.logoUrl && (
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                                    <img src={currentExperience.logoUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                                    <button
                                        type="button"
                                        onClick={() => setCurrentExperience({ ...currentExperience, logoUrl: '' })}
                                        className="absolute top-0 right-0 bg-black/60 p-1 hover:bg-red-500/80 transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                            <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors">
                                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                <span>Upload Logo</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button type="submit" className="bg-blue-600 px-4 py-2 rounded">Save</button>
                        <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    {experiences.length === 0 ? (
                        <EmptyState
                            icon={Briefcase}
                            title="No Experience Found"
                            description="Add your professional work experience."
                            actionLabel="Add Experience"
                            onAction={() => { setIsEditing(true); setCurrentExperience({}); }}
                        />
                    ) : (
                        experiences.map(exp => (
                            <div key={exp.id} className="glass-panel p-6 rounded-xl flex justify-between items-center">
                                {/* ... existing item content ... */}
                                <div className="flex items-center gap-4">
                                    {exp.logoUrl && (
                                        <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center p-1">
                                            <img src={exp.logoUrl} alt={exp.company} className="max-w-full max-h-full object-contain" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-lg">{exp.company}</h3>
                                        <p className="text-cyan-400">{exp.roleEn} / {exp.roleFr}</p>
                                        <p className="text-sm text-gray-400">{exp.period}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setCurrentExperience(exp); setIsEditing(true); }} className="text-blue-400 hover:text-blue-300">Edit</button>
                                    <button onClick={() => confirmDelete(exp.id)} className="text-red-400 hover:text-red-300">Delete</button>
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
                title="Delete Experience"
                message="Are you sure you want to delete this experience entry? This will also delete the associated logo."
                confirmText="Delete"
                isDestructive={true}
            />
        </div>
    );
}
