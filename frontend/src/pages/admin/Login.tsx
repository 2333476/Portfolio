import { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            navigate('/admin/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
            <form onSubmit={handleLogin} className="glass-panel p-8 rounded-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm text-gray-400 mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded transition">
                    Login
                </button>

                <div className="mt-6 text-center">
                    <a href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
                        &larr; Go to Website
                    </a>
                </div>
            </form>
        </div>
    );
}
