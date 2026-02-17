import { Plus } from 'lucide-react';

interface EmptyStateProps {
    icon: any;
    title: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white/5 rounded-xl border border-white/10 border-dashed">
            <div className="bg-white/10 p-4 rounded-full mb-4">
                <Icon size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 mb-6 max-w-sm">{description}</p>
            <button
                onClick={onAction}
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
                <Plus size={20} />
                {actionLabel}
            </button>
        </div>
    );
}
