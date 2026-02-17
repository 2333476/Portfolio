import { useState, useRef } from 'react';
// motion was imported but not used, causing build error
import { Upload, X, Loader2 } from 'lucide-react';
import api from '../../services/api';

interface ImageUploadProps {
    onUpload: (url: string) => void;
    initialImage?: string;
    label?: string;
}

export default function ImageUpload({ onUpload, initialImage = '', label = 'Upload Image' }: ImageUploadProps) {
    const [image, setImage] = useState(initialImage);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('image', file);

        try {
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Assume backend returns { url: '/uploads/filename.jpg' }
            // We might need to prepend base URL if not already absolute, but relative is mostly fine for same-domain serving
            // or if stored in public folder
            setImage(data.url);
            onUpload(data.url);
        } catch (err) {
            const error = err as Error;
            console.error(error);
            setError('Upload failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        setImage('');
        onUpload('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">{label}</label>

            <div className="flex items-center gap-4">
                {image ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/20 group">
                        <img
                            // If local upload, it's relative. If cloud, absolute.
                            // Ensure backend returns accessible URL.
                            src={image.startsWith('http') ? image : `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${image}`}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <button
                            onClick={handleRemove}
                            type="button"
                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-red-400"
                        >
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-700 hover:border-blue-500 cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-blue-500 transition-colors"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Upload size={24} />}
                        <span className="text-xs mt-1">{loading ? '...' : 'Upload'}</span>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}
