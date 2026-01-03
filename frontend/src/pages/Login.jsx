import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Failed to sign in: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent mb-6 text-center">
                    Welcome Back
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-slate-800 border-slate-700 text-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-slate-800 border-slate-700 text-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
                    >
                        {loading && <Loader2 className="animate-spin" size={20} />}
                        Sign In
                    </button>
                </form>

                <div className="mt-6 text-center text-slate-400 text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-violet-400 hover:text-violet-300 transition-colors">
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
