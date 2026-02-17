import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout, FileText, User, LogOut, Briefcase, GraduationCap, Award, MessageSquare, Code, Cpu } from 'lucide-react';
import ProjectsManager from './ProjectsManager';
import SkillsManager from './SkillsManager';
import ExperienceManager from './ExperienceManager';
import EducationManager from './EducationManager';
import CertificationsManager from './CertificationsManager';
import TestimonialsManager from './TestimonialsManager';
import MessagesManager from './MessagesManager';
import ResumeManager from './ResumeManager';

export default function Dashboard() {
    const navigate = useNavigate();
    const [section, setSection] = useState('projects');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/admin/login');
    };

    const navItems = [
        { id: 'projects', label: 'Projects', icon: Code },
        { id: 'skills', label: 'Skills', icon: Cpu },
        { id: 'experience', label: 'Experience', icon: Briefcase },
        { id: 'education', label: 'Education', icon: GraduationCap },
        { id: 'certifications', label: 'Certifications', icon: Award },
        { id: 'resume', label: 'Resume', icon: FileText },
        { id: 'testimonials', label: 'Testimonials', icon: User },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
    ];

    const renderContent = () => {
        switch (section) {
            case 'projects': return <ProjectsManager />;
            case 'skills': return <SkillsManager />;
            case 'experience': return <ExperienceManager />;
            case 'education': return <EducationManager />;
            case 'certifications': return <CertificationsManager />;
            case 'resume': return <ResumeManager />;
            case 'testimonials': return <TestimonialsManager />;
            case 'messages': return <MessagesManager />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-950 text-white font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0f0f12] border-r border-white/5 flex flex-col fixed h-full z-20">
                <div className="p-8 border-b border-white/5">
                    <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <Layout className="text-purple-500" />
                        <span>Admin Panel</span>
                    </h1>
                    <p className="text-xs text-gray-500 mt-2">v2.0 • Portfolio Manager</p>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = section === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setSection(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                    ${isActive
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                <Icon size={18} className={isActive ? 'text-white' : 'text-gray-500'} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-10 bg-gray-950 min-h-screen">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight capitalize text-white">{section}</h2>
                        <p className="text-gray-400 text-sm mt-1">Manage and update your portfolio content.</p>
                    </div>
                </header>

                <motion.div
                    key={section}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderContent()}
                </motion.div>
            </main>
        </div>
    );
}
