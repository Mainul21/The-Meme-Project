import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Loader2, Trash2, Users, Image as ImageIcon, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Basic protection - proper check happens on backend
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = user?.accessToken;
                // Since we didn't implement an explicit stats endpoint in api.js, we'll fetch direct or add it
                // Let's assume we add it to api.js or fetch here. 
                // For keeping it clean, I'll fetch here for now using the token in headers
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://meme-backend-3i5g.onrender.com/api'}/admin/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch admin stats. You might not be an admin.');
                }

                const data = await response.json();
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-violet-500" /></div>;
    if (error) return <div className="text-red-400 text-center p-10">{error}</div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                    Admin Dashboard
                </h2>
                <p className="text-slate-400 mt-2">Overview of platform statistics and moderation.</p>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl">
                                <ImageIcon size={24} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Total Memes</p>
                                <h3 className="text-2xl font-bold text-slate-200">{stats.totalMemes}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl">
                                <BarChart size={24} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Recent Memes (24h)</p>
                                <h3 className="text-2xl font-bold text-slate-200">{stats.recentMemes}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 col-span-1 md:col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Top Creators</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {stats.topUsers.map((u, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <span className="text-slate-300">{u._id}</span>
                                    <span className="text-slate-500">{u.count} memes</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
