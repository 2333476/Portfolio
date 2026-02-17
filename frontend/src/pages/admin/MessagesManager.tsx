import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../../services/api';

interface Message {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
}

export default function MessagesManager() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const { data } = await api.get('/messages');
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch messages', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-purple-500" /></div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Inbox</h2>
            <div className="space-y-4">
                {messages.length === 0 ? <p className="text-gray-500">No messages found.</p> : null}

                {messages.map(msg => (
                    <div key={msg.id} className="glass-panel p-6 rounded-xl relative">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{msg.subject || 'No Subject'}</h3>
                                <p className="text-sm text-gray-400">From: <span className="text-white">{msg.name}</span> &lt;{msg.email}&gt;</p>
                            </div>
                            <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="bg-black/20 p-4 rounded text-gray-200 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
