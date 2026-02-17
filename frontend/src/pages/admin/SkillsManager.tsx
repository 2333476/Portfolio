import { useEffect, useState, useRef, useCallback } from 'react';
import { Cpu, Trash, Plus, Check, Search, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../context/ToastContext';

interface Skill {
    id: string;
    nameEn: string;
    nameFr: string;
    level: number;
    category: string;
    imageUrl?: string;
}

interface DeviconSkill {
    name: string;
    tags: string[];
    versions: {
        svg: string[];
        font: string[];
    };
    color: string;
    aliases: string[];
}

const PRESET_SKILLS = [
    { name: 'Auth0', icon: 'logos:auth0-icon' },
    { name: 'Express', icon: 'logos:express' },
    { name: 'Vercel', icon: 'logos:vercel-icon' },
    { name: 'Azure', icon: 'logos:microsoft-azure' },
    { name: 'Java', icon: 'logos:java' },
    { name: 'Spring', icon: 'logos:spring-icon' },
    { name: 'PHP', icon: 'logos:php' },
    { name: 'C#', icon: 'logos:c-sharp' },
    { name: 'Android Studio', icon: 'logos:android-icon' },
    { name: 'CI/CD', icon: 'logos:github-actions' },
    { name: 'Pandas', icon: 'logos:pandas-icon' },
];

interface UnifiedSuggestion {
    name: string;
    displayName?: string;
    source: 'devicon' | 'iconify' | 'preset';
    versions?: {
        svg: string[];
    };
    tags?: string[];
}

export default function SkillsManager() {
    const { showToast } = useToast();
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSkill, setCurrentSkill] = useState<Partial<Skill>>({});

    // Devicon Data
    const [deviconData, setDeviconData] = useState<DeviconSkill[]>([]);
    const [suggestions, setSuggestions] = useState<UnifiedSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [skillToDelete, setSkillToDelete] = useState<string | null>(null);

    const fetchDevicons = useCallback(async () => {
        try {
            console.log("Fetching devicons from JSDelivr...");
            const res = await fetch('https://cdn.jsdelivr.net/gh/devicons/devicon@master/devicon.json');
            if (!res.ok) throw new Error(`Network response was not ok: ${res.status}`);
            const data = await res.json();
            console.log("Devicon data fetched successfully:", data.length, "items");
            setDeviconData(data);
        } catch (error) {
            console.error("Failed to fetch devicons:", error);
            showToast("Failed to load skill suggestions", "error");
        }
    }, [showToast]);

    const fetchSkills = useCallback(async () => {
        try {
            const { data } = await api.get('/skills');
            setSkills(data);
        } catch (error) {
            console.error('Failed to fetch skills', error);
            showToast('Failed to fetch skills', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchSkills();
        fetchDevicons();

        // Click outside to close suggestions
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [fetchSkills, fetchDevicons]);

    const handleSearch = async (query: string) => {
        setCurrentSkill({ ...currentSkill, nameEn: query });
        if (query.length > 1) {
            const lower = query.toLowerCase();

            // 0. Preset Filter (Featured)
            const presetMatched = PRESET_SKILLS.filter(p =>
                p.name.toLowerCase().includes(lower)
            ).map(p => ({
                name: p.icon,
                displayName: p.name,
                source: 'preset' as const
            }));

            // 1. Local Devicon Filter
            const deviconFiltered = deviconData.filter(d => {
                const nameMatch = typeof d.name === 'string' && d.name.toLowerCase().includes(lower);
                const tagMatch = Array.isArray(d.tags) && d.tags.some(t => typeof t === 'string' && t.toLowerCase().includes(lower));
                const aliasMatch = Array.isArray(d.aliases) && d.aliases.some(a => typeof a === 'string' && a.toLowerCase().includes(lower));
                return nameMatch || tagMatch || aliasMatch;
            }).map(d => ({
                name: d.name,
                source: 'devicon' as const,
                versions: d.versions,
                tags: d.tags
            }));

            // 2. Iconify Global Search
            let iconifyResults: UnifiedSuggestion[] = [];
            try {
                const res = await fetch(`https://api.iconify.design/search?query=${query}&limit=30`);
                if (res.ok) {
                    const data = await res.json();
                    iconifyResults = (data.icons || []).map((icon: string) => ({
                        name: icon,
                        source: 'iconify' as const
                    }));
                }
            } catch (err) {
                console.error("Iconify search failed", err);
            }

            // Combine and prioritize high-quality sets like 'skill-icons' or 'logos'
            const combined = [...deviconFiltered, ...iconifyResults];
            const sorted = combined.sort((a, b) => {
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();

                // Prioritize skill-icons prefix
                if (aName.startsWith('skill-icons:') && !bName.startsWith('skill-icons:')) return -1;
                if (!aName.startsWith('skill-icons:') && bName.startsWith('skill-icons:')) return 1;

                // Prioritize logos prefix
                if (aName.startsWith('logos:') && !bName.startsWith('logos:')) return -1;
                if (!aName.startsWith('logos:') && bName.startsWith('logos:')) return 1;

                return 0;
            });

            setSuggestions([...presetMatched, ...sorted].slice(0, 20));
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const selectIcon = (item: UnifiedSuggestion) => {
        let url = '';
        const name = item.displayName || item.name;

        if (item.source === 'devicon' && item.versions) {
            const version = item.versions.svg.includes('original') ? 'original'
                : item.versions.svg.includes('plain') ? 'plain'
                    : item.versions.svg[0];
            url = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${item.name}/${item.name}-${version}.svg`;
        } else {
            // Preset or Iconify
            // URL pattern: https://api.iconify.design/prefix/name.svg
            const iconToUse = item.name.includes(':') ? item.name : `logos:${item.name}`;
            const [prefix, iconName] = iconToUse.split(':');
            url = `https://api.iconify.design/${prefix}/${iconName}.svg`;
        }

        setCurrentSkill({
            ...currentSkill,
            nameEn: name,
            imageUrl: url
        });
        setShowSuggestions(false);
    };

    const confirmDelete = (id: string) => {
        setSkillToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!skillToDelete) return;
        try {
            await api.delete(`/skills/${skillToDelete}`);
            fetchSkills();
            showToast('Skill deleted successfully', 'success');
        } catch (error) {
            console.error('Failed to delete', error);
            showToast('Failed to delete skill', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setSkillToDelete(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...currentSkill, level: Number(currentSkill.level) };

            if (currentSkill.id) {
                await api.put(`/skills/${currentSkill.id}`, payload);
                showToast('Skill updated successfully', 'success');
            } else {
                await api.post('/skills', payload);
                showToast('Skill created successfully', 'success');
            }
            setIsEditing(false);
            setCurrentSkill({});
            fetchSkills();
        } catch (error) {
            console.error('Failed to save', error);
            showToast('Failed to save skill', 'error');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Cpu className="text-cyan-400" /> Skills Manager
                </h2>
                {skills.length > 0 && (
                    <button
                        onClick={() => { setIsEditing(true); setCurrentSkill({}); }}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                        <Plus size={18} /> Add Skill
                    </button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-xl space-y-4 border border-white/10 bg-gray-900/50">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        {currentSkill.id ? 'Edit' : 'Add'} Skill
                        {currentSkill.imageUrl && (
                            <img src={currentSkill.imageUrl} alt="Preview" className="w-8 h-8 ml-2" />
                        )}
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative" ref={wrapperRef}>
                            <label className="block text-sm text-gray-400 mb-1">Name (EN) / Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    value={currentSkill.nameEn || ''}
                                    onChange={e => handleSearch(e.target.value)}
                                    onFocus={() => { if (currentSkill.nameEn && currentSkill.nameEn.length > 1) setShowSuggestions(true); }}
                                    placeholder="Search technology (e.g. React, Docker...)"
                                    required
                                    autoComplete="off"
                                />
                            </div>

                            {/* Autocomplete Suggestions */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {suggestions.map((s, idx) => (
                                        <button
                                            key={`${s.name}-${idx}`}
                                            type="button"
                                            onClick={() => selectIcon(s)}
                                            className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors border-b border-white/5 last:border-0"
                                        >
                                            <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center p-1.5 shadow-inner">
                                                {s.source === 'devicon' && s.versions ? (
                                                    <img
                                                        src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${s.name}/${s.name}-${s.versions.svg.includes('original') ? 'original' : s.versions.svg[0]}.svg`}
                                                        alt=""
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <img
                                                        src={`https://api.iconify.design/${s.name.replace(':', '/')}.svg`}
                                                        alt=""
                                                        className="w-full h-full object-contain"
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <span className="font-bold text-white text-sm">{s.displayName || (s.name.includes(':') ? s.name.split(':')[1] : s.name)}</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded leading-none ${s.source === 'preset' ? 'bg-green-500/20 text-green-400' :
                                                        s.source === 'devicon' ? 'bg-cyan-500/20 text-cyan-400' :
                                                            'bg-purple-500/20 text-purple-400'
                                                        }`}>
                                                        {s.source === 'preset' ? 'FEATURED' : s.source.toUpperCase()}
                                                    </span>
                                                    {s.source !== 'devicon' && s.name.includes(':') && (
                                                        <span className="text-[9px] text-gray-500">{s.name.split(':')[0]}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {!currentSkill.imageUrl && currentSkill.nameEn && currentSkill.nameEn.length > 2 && !showSuggestions && (
                                <p className="text-xs text-yellow-500 mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} /> Unknown technology (custom icon required)
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Name (FR)</label>
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                value={currentSkill.nameFr || ''}
                                onChange={e => setCurrentSkill({ ...currentSkill, nameFr: e.target.value })}
                                placeholder="Translate name if needed"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Level (1-100)</label>
                            <input
                                type="number"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                value={currentSkill.level || ''}
                                onChange={e => setCurrentSkill({ ...currentSkill, level: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Category</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                value={currentSkill.category || ''}
                                onChange={e => setCurrentSkill({ ...currentSkill, category: e.target.value })}
                                required
                            >
                                <option value="" className="bg-gray-900">Select Category</option>
                                <option value="Frontend" className="bg-gray-900">Frontend</option>
                                <option value="Backend" className="bg-gray-900">Backend</option>
                                <option value="Tools" className="bg-gray-900">Tools</option>
                                <option value="Other" className="bg-gray-900">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Hidden Image URL (Managed by selection) */}
                    <input type="hidden" value={currentSkill.imageUrl || ''} />

                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                            Save Skill
                        </button>
                        <button type="button" onClick={() => setIsEditing(false)} className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-lg transition-colors border border-white/10">
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skills.length === 0 ? (
                        <div className="col-span-1 md:col-span-2">
                            <EmptyState
                                icon={Cpu}
                                title="No Skills Added"
                                description="List your technical skills and proficiency levels."
                                actionLabel="Add First Skill"
                                onAction={() => { setIsEditing(true); setCurrentSkill({}); }}
                            />
                        </div>
                    ) : (
                        skills.map(s => (
                            <div key={s.id} className="glass-panel p-4 rounded-xl flex justify-between items-center group hover:bg-white/5 transition-colors border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 p-2 flex items-center justify-center overflow-hidden">
                                        {s.imageUrl ? (
                                            <img src={s.imageUrl} alt={s.nameEn} className="w-full h-full object-contain" />
                                        ) : (
                                            <Cpu size={20} className="text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">{s.nameEn}</h3>
                                        <p className="text-xs text-gray-400">{s.category} • {s.level}%</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => { setCurrentSkill(s); setIsEditing(true); }}
                                        className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Check size={16} className="rotate-0 scale-100 transition-all" />
                                        <span className="sr-only">Edit</span>
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(s.id)}
                                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash size={16} />
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
                title="Delete Skill"
                message="Are you sure you want to delete this skill? This action cannot be undone."
                confirmText="Delete"
                isDestructive={true}
            />
        </div>
    );
}
