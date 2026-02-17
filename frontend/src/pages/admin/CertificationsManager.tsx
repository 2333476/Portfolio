import { useEffect, useState } from 'react';
import { Award, Upload, Loader2, X } from 'lucide-react';
import api from '../../services/api';
import ConfirmModal from '../../components/ui/ConfirmModal';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';

interface Certification {
    id: string;
    nameEn: string;
    nameFr: string;
    issuer: string;
    date: string;
    url?: string;
    imageUrl?: string;
    logoUrl?: string; // New: Logo upload support
}

export default function CertificationsManager() {
    const { showToast } = useToast();
    const [certs, setCerts] = useState<Certification[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCert, setCurrentCert] = useState<Partial<Certification>>({});
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    // Confirm Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchCerts();
    }, []);

    const fetchCerts = async () => {
        try {
            const { data } = await api.get('/certifications');
            setCerts(data);
        } catch (error) {
            console.error('Failed to fetch certifications', error);
            showToast('Failed to fetch certifications', 'error');
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
            await api.delete(`/certifications/${itemToDelete}`);
            fetchCerts();
            showToast('Certification deleted successfully', 'success');
        } catch (error) {
            console.error('Failed to delete', error);
            showToast('Failed to delete certification', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'logoUrl') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const setUploading = field === 'imageUrl' ? setUploadingImage : setUploadingLogo;
        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setCurrentCert(prev => ({ ...prev, [field]: uploadRes.data.url }));
            showToast(`${field === 'imageUrl' ? 'Image' : 'Logo'} uploaded successfully`, 'success');
        } catch (error) {
            console.error("Upload failed:", error);
            showToast(`Failed to upload ${field === 'imageUrl' ? 'image' : 'logo'}`, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentCert.id) {
                await api.put(`/certifications/${currentCert.id}`, currentCert);
                showToast('Certification updated successfully', 'success');
            } else {
                await api.post('/certifications', currentCert);
                showToast('Certification created successfully', 'success');
            }
            setIsEditing(false);
            setCurrentCert({});
            fetchCerts();
        } catch (error) {
            console.error('Failed to save', error);
            showToast('Failed to save certification', 'error');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Award className="text-yellow-400" /> Certifications
                </h2>
                {certs.length > 0 && (
                    <button
                        onClick={() => { setIsEditing(true); setCurrentCert({}); }}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
                    >
                        Add Certification
                    </button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-xl space-y-4">
                    <h3 className="text-xl font-bold mb-4">{currentCert.id ? 'Edit' : 'Add'} Certification</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400">Name (EN)</label>
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2"
                                value={currentCert.nameEn || ''}
                                onChange={e => setCurrentCert({ ...currentCert, nameEn: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400">Name (FR)</label>
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2"
                                value={currentCert.nameFr || ''}
                                onChange={e => setCurrentCert({ ...currentCert, nameFr: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400">Issuer</label>
                        <input
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2"
                            value={currentCert.issuer || ''}
                            onChange={e => setCurrentCert({ ...currentCert, issuer: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400">Date (e.g. Nov 2022)</label>
                        <input
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2"
                            value={currentCert.date || ''}
                            onChange={e => setCurrentCert({ ...currentCert, date: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400">URL</label>
                        <input
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2"
                            value={currentCert.url || ''}
                            onChange={e => setCurrentCert({ ...currentCert, url: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Certificate Image Upload */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Certificate Image</label>
                            <div className="flex items-center gap-4">
                                {currentCert.imageUrl && (
                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                                        <img src={currentCert.imageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                                        <button
                                            type="button"
                                            onClick={() => setCurrentCert({ ...currentCert, imageUrl: '' })}
                                            className="absolute top-0 right-0 bg-black/60 p-1 hover:bg-red-500/80 transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                                <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors">
                                    {uploadingImage ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                    <span>Upload Image</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'imageUrl')} disabled={uploadingImage} />
                                </label>
                            </div>
                        </div>

                        {/* Issuer Logo Upload */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Issuer Logo (Optional)</label>
                            <div className="flex items-center gap-4">
                                {currentCert.logoUrl && (
                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                                        <img src={currentCert.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                                        <button
                                            type="button"
                                            onClick={() => setCurrentCert({ ...currentCert, logoUrl: '' })}
                                            className="absolute top-0 right-0 bg-black/60 p-1 hover:bg-red-500/80 transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors">
                                    {uploadingLogo ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                    <span>Upload Logo</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'logoUrl')} disabled={uploadingLogo} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button type="submit" className="bg-blue-600 px-4 py-2 rounded">Save</button>
                        <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    {certs.length === 0 ? (
                        <EmptyState
                            icon={Award}
                            title="No Certifications Found"
                            description="Showcase your professional achievements and certifications here."
                            actionLabel="Add Certification"
                            onAction={() => { setIsEditing(true); setCurrentCert({}); }}
                        />
                    ) : (
                        certs.map(cert => (
                            <div key={cert.id} className="glass-panel p-6 rounded-xl flex justify-between items-center">
                                {/* ... existing item content ... */}
                                <div className="flex items-center gap-4">
                                    {cert.imageUrl && (
                                        <div className="w-16 h-12 bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                                            <img src={cert.imageUrl} alt={cert.nameEn} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-lg">{cert.nameEn}</h3>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            {cert.logoUrl && <img src={cert.logoUrl} alt={cert.issuer} className="w-4 h-4 rounded-full" />}
                                            <p>{cert.issuer} • {cert.date}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setCurrentCert(cert); setIsEditing(true); }} className="text-blue-400 hover:text-blue-300">Edit</button>
                                    <button onClick={() => confirmDelete(cert.id)} className="text-red-400 hover:text-red-300">Delete</button>
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
                title="Delete Certification"
                message="Are you sure you want to delete this certification? Visual assets associated with it will also be deleted."
                confirmText="Delete"
                isDestructive={true}
            />
        </div>
    );
}
