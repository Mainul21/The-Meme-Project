import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Save, Loader2 } from 'lucide-react';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Card from '../components/UI/Card';
import { updateProfile } from 'firebase/auth';

const Profile = () => {
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await updateProfile(user, { displayName });
            // Force token refresh to update claims (like name) for backend requests
            await user.getIdToken(true);
            await user.reload();

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pt-10">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent mb-8">
                Your Profile
            </h2>

            <Card>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-20 h-20 rounded-full bg-violet-600 flex items-center justify-center text-3xl font-bold text-white">
                            {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                            <p className="text-slate-200 font-medium text-lg">{user?.email}</p>
                            <p className="text-slate-500 text-sm">Member since {new Date(user?.metadata.creationTime).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-slate-400 text-sm mb-1 block">Display Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <Input
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="pl-10"
                                    placeholder="Enter your display name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-slate-400 text-sm mb-1 block">Email</label>
                            <div className="relative opacity-50">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <Input
                                    value={user?.email}
                                    disabled
                                    className="pl-10 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {message.text}
                        </div>
                    )}

                    <Button type="submit" variant="primary" className="w-full flex items-center justify-center gap-2" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default Profile;
