import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Download, Trash2, X, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { api } from '../services/api';
import Swal from 'sweetalert2';

const MyGallery = () => {
    const { user } = useAuth();
    const [memes, setMemes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMeme, setSelectedMeme] = useState(null);

    useEffect(() => {
        const fetchUserMemes = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const userMemes = await api.getUserMemes(user.uid);
                const formattedMemes = userMemes.map(meme => ({
                    id: meme._id,
                    url: meme.imageData,
                    name: meme.name,
                    template: meme.template,
                    date: new Date(meme.createdAt).toISOString().split('T')[0],
                    authorName: meme.authorName || 'Me',
                    authorUID: meme.authorUID,
                    upvotes: meme.upvotes || [],
                    downvotes: meme.downvotes || []
                }));
                setMemes(formattedMemes);
            } catch (error) {
                console.error('Failed to fetch user memes:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserMemes();
    }, [user]);

    const handleDelete = async (memeId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.deleteMeme(memeId, user.accessToken);
                setMemes(prev => prev.filter(m => m.id !== memeId));
                if (selectedMeme?.id === memeId) setSelectedMeme(null);

                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your meme has been deleted.',
                    icon: 'success',
                    confirmButtonColor: '#7c3aed',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error('Failed to delete meme:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Delete Failed',
                    text: 'Failed to delete meme. Please try again.',
                    confirmButtonColor: '#ef4444'
                });
            }
        }
    };

    const handleDownload = (meme) => {
        const link = document.createElement('a');
        link.download = `${meme.name}-${meme.id}.png`;
        link.href = meme.url;
        link.click();
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <p className="text-xl mb-4">Please log in to view your gallery</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent mb-12">
                My Gallery
            </h1>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-violet-500" size={48} />
                </div>
            ) : memes.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-slate-500 text-lg mb-2">You haven't created any memes yet</div>
                    <button
                        onClick={() => window.location.href = '/upload'}
                        className="mt-4 px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors"
                    >
                        Create Your First Meme
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {memes.map((meme) => (
                        <div key={meme.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all duration-300 flex flex-col">
                            <div className="p-4 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/30">
                                <span className="text-[10px] text-slate-500">{meme.date}</span>
                                <button
                                    className="text-slate-600 hover:text-red-400 transition-colors p-1"
                                    onClick={() => handleDelete(meme.id)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col">
                                <div className="px-4 py-3">
                                    <h3 className="text-base text-slate-100 font-medium leading-tight line-clamp-2">{meme.name}</h3>
                                </div>
                                <div
                                    className="bg-black/20 cursor-pointer overflow-hidden relative group"
                                    onClick={() => setSelectedMeme(meme)}
                                >
                                    <img
                                        src={meme.url}
                                        alt={meme.name}
                                        className="w-full h-auto object-cover max-h-[400px] transition-transform duration-700 group-hover:scale-[1.02]"
                                    />
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-800/50 bg-slate-900/30 flex justify-between items-center">
                                <div className="flex gap-4 text-slate-400 text-xs">
                                    <span className="flex items-center gap-1"><ThumbsUp size={12} /> {meme.upvotes.length}</span>
                                    <span className="flex items-center gap-1"><ThumbsDown size={12} /> {meme.downvotes.length}</span>
                                </div>
                                <button
                                    className="text-slate-400 hover:text-violet-400 transition-colors p-2 hover:bg-slate-800/50 rounded-full"
                                    onClick={() => handleDownload(meme)}
                                >
                                    <Download size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedMeme && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedMeme(null)}
                >
                    <button
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
                        onClick={() => setSelectedMeme(null)}
                    >
                        <X size={24} />
                    </button>
                    <div
                        className="w-full max-w-5xl max-h-[95vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col md:flex-row h-full">
                            <div className="flex-1 bg-black flex items-center justify-center p-4">
                                <img
                                    src={selectedMeme.url}
                                    alt={selectedMeme.name}
                                    className="max-w-full max-h-[80vh] object-contain"
                                />
                            </div>
                            <div className="w-full md:w-[320px] p-6 flex flex-col">
                                <h2 className="text-xl font-bold text-slate-100 mb-2">{selectedMeme.name}</h2>
                                <p className="text-sm text-slate-500 mb-6 font-mono">Template: {selectedMeme.template}</p>

                                <div className="mt-auto space-y-3">
                                    <button
                                        className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                        onClick={() => handleDownload(selectedMeme)}
                                    >
                                        <Download size={20} />
                                        Download
                                    </button>
                                    <button
                                        className="w-full py-3 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                        onClick={() => handleDelete(selectedMeme.id)}
                                    >
                                        <Trash2 size={20} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyGallery;
