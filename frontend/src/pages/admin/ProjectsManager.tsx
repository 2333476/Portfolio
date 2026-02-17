import { useEffect, useState, useCallback } from 'react';
import { FolderGit2, Plus, Upload, X, Loader2 } from 'lucide-react';
import api from '../../services/api';
import ConfirmModal from '../../components/ui/ConfirmModal';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';

interface Project {
    id: string;
    titleEn: string;
    titleFr: string;
    descEn: string;
    descFr: string;
    techStack: string[];
    demoLink?: string;
    repoLink?: string;
    imageUrl?: string;
}

export default function ProjectsManager() {
    const { showToast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProject, setCurrentProject] = useState<Partial<Project>>({});
    const [uploading, setUploading] = useState(false);

    // Confirm Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        try {
            const { data } = await api.get('/projects');
            setProjects(data);
        } catch (error) {
            console.error('Failed to fetch projects', error);
            showToast('Failed to fetch projects', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const confirmDelete = (id: string) => {
        setProjectToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!projectToDelete) return;
        try {
            await api.delete(`/projects/${projectToDelete}`);
            fetchProjects();
            showToast('Project deleted successfully', 'success');
        } catch (error) {
            console.error('Failed to delete', error);
            showToast('Failed to delete project', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setProjectToDelete(null);
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
            setCurrentProject({ ...currentProject, imageUrl: uploadRes.data.url });
            showToast('Image uploaded successfully', 'success');
        } catch (error) {
            console.error("Upload failed:", error);
            showToast('Failed to upload image', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentProject.id) {
                await api.put(`/projects/${currentProject.id}`, currentProject);
                showToast('Project updated successfully', 'success');
            } else {
                await api.post('/projects', currentProject);
                showToast('Project created successfully', 'success');
            }
            setIsEditing(false);
            setCurrentProject({});
            fetchProjects();
        } catch (error) {
            console.error('Failed to save', error);
            showToast('Failed to save project', 'error');
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-purple-500" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FolderGit2 className="text-purple-400" /> Projects
                </h2>
                {projects.length > 0 && (
                    <button
                        onClick={() => { setIsEditing(true); setCurrentProject({}); }}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                        <Plus size={20} /> Add Project
                    </button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-xl space-y-4">
                    <h3 className="text-xl font-bold mb-4">{currentProject.id ? 'Edit' : 'Add'} Project</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400">Title (EN)</label>
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2"
                                value={currentProject.titleEn || ''}
                                onChange={e => setCurrentProject({ ...currentProject, titleEn: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400">Title (FR)</label>
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2"
                                value={currentProject.titleFr || ''}
                                onChange={e => setCurrentProject({ ...currentProject, titleFr: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400">Description (EN)</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2"
                                value={currentProject.descEn || ''}
                                onChange={e => setCurrentProject({ ...currentProject, descEn: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400">Description (FR)</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2"
                                value={currentProject.descFr || ''}
                                onChange={e => setCurrentProject({ ...currentProject, descFr: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Simplified Tech Stack Input */}
                    <div>
                        <label className="block text-sm text-gray-400">Tech Stack (Comma separated)</label>
                        <input
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                            value={currentProject.techStack?.join(', ') || ''}
                            onChange={e => setCurrentProject({ ...currentProject, techStack: e.target.value.split(',').map(s => s.trim()) })}
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Project Image</label>
                        <div className="flex items-center gap-4">
                            {currentProject.imageUrl && (
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                                    <img src={currentProject.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setCurrentProject({ ...currentProject, imageUrl: '' })}
                                        className="absolute top-0 right-0 bg-black/60 p-1 hover:bg-red-500/80 transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                            <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors">
                                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                <span>Upload Image</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400">Demo URL (Optional)</label>
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                                placeholder="https://mysite.com"
                                value={currentProject.demoLink || ''}
                                onChange={e => setCurrentProject({ ...currentProject, demoLink: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400">GitHub URL (Optional)</label>
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                                placeholder="https://github.com/myrepo"
                                value={currentProject.repoLink || ''}
                                onChange={e => setCurrentProject({ ...currentProject, repoLink: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button type="submit" className="bg-blue-600 px-4 py-2 rounded">Save</button>
                        <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
                    </div>
                </form>
            ) : (
                <div className="grid gap-4">
                    {projects.length === 0 ? (
                        <EmptyState
                            icon={FolderGit2}
                            title="No Projects Yet"
                            description="Add your first project to showcase your work."
                            actionLabel="Add Project"
                            onAction={() => { setIsEditing(true); setCurrentProject({}); }}
                        />
                    ) : (
                        projects.map(p => (
                            <div key={p.id} className="glass-panel p-4 rounded-xl flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    {p.imageUrl && (
                                        <img src={p.imageUrl} alt={p.titleEn} className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                                    )}
                                    <div>
                                        <h3 className="font-bold">{p.titleEn} / {p.titleFr}</h3>
                                        <p className="text-sm text-gray-400">{p.techStack.join(', ')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setCurrentProject(p); setIsEditing(true); }} className="text-blue-400 hover:text-blue-300">Edit</button>
                                    <button onClick={() => confirmDelete(p.id)} className="text-red-400 hover:text-red-300">Delete</button>
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
                title="Delete Project"
                message="Are you sure you want to delete this project? This will also delete the associated image."
                confirmText="Delete"
                isDestructive={true}
            />
        </div>
    );
}
