import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ui/ConfirmModal';

interface Testimonial {
    id: string;
    author: string;
    role?: string;
    contentEn: string;
    contentFr: string;
    approved: boolean;
}

export default function TestimonialsManager() {
    const { showToast } = useToast();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [testimonialToDelete, setTestimonialToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const { data } = await api.get('/testimonials/admin');
            setTestimonials(data);
        } catch (error) {
            console.error('Failed to fetch testimonials', error);
            showToast('Failed to fetch testimonials', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleApproval = async (t: Testimonial) => {
        try {
            await api.put(`/testimonials/${t.id}`, { approved: !t.approved });
            fetchTestimonials();
            showToast(`Testimonial ${!t.approved ? 'approved' : 'rejected'}`, 'success');
        } catch (error) {
            console.error("Failed to update", error);
            showToast('Failed to update testimonial', 'error');
        }
    };

    const confirmDelete = (id: string) => {
        setTestimonialToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!testimonialToDelete) return;
        try {
            await api.delete(`/testimonials/${testimonialToDelete}`);
            fetchTestimonials();
            showToast('Testimonial deleted successfully', 'success');
        } catch (error) {
            console.error('Failed to delete', error);
            showToast('Failed to delete testimonial', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setTestimonialToDelete(null);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Testimonials</h2>
            <div className="grid gap-4">
                {testimonials.length === 0 ? <p className="text-gray-500">No testimonials yet.</p> : null}

                {testimonials.map(t => (
                    <div key={t.id} className={`glass-panel p-4 rounded-xl border-l-4 ${t.approved ? 'border-green-500' : 'border-yellow-500'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold">{t.author}</h3>
                                <p className="text-sm text-gray-400">{t.role}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs px-2 py-1 rounded ${t.approved ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'}`}>
                                    {t.approved ? 'Public' : 'Pending'}
                                </span>
                                <button
                                    onClick={() => toggleApproval(t)}
                                    className="text-blue-400 hover:text-blue-300 text-sm"
                                >
                                    {t.approved ? 'Reject' : 'Approve'}
                                </button>
                                <button
                                    onClick={() => confirmDelete(t.id)}
                                    className="text-red-400 hover:text-red-300 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm mt-3">
                            <div className="bg-black/20 p-2 rounded">
                                <p className="text-gray-500 text-xs mb-1">English</p>
                                <p className="break-words line-clamp-4">{t.contentEn}</p>
                            </div>
                            <div className="bg-black/20 p-2 rounded">
                                <p className="text-gray-500 text-xs mb-1">French</p>
                                <p className="break-words line-clamp-4">{t.contentFr}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Testimonial"
                message="Are you sure you want to delete this testimonial? This action cannot be undone."
                confirmText="Delete"
                isDestructive={true}
            />
        </div>
    );
}
