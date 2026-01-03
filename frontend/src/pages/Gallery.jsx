import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMemeContext } from '../context/MemeContext';
import { Download, Trash2, X, Loader2, ChevronDown, ThumbsUp, ThumbsDown } from 'lucide-react';
import Card from '../components/UI/Card';
import { api } from '../services/api';
import { deleteMeme as deleteLocalMeme } from '../utils/memeStorage';

const Gallery = () => {
  const {
    memes: savedMemes,
    page,
    hasMore,
    isLoading,
    isLoadingMore,
    isOnline,
    loadMemes,
    removeMeme
  } = useMemeContext();

  const { user } = useAuth();
  const [selectedMeme, setSelectedMeme] = useState(null);
  const [votingMap, setVotingMap] = useState({}); // track local optimistic votes

  useEffect(() => {
    loadMemes(1);
  }, [loadMemes]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadMemes(page + 1);
    }
  };

  /* 
   Helper to get current vote stats merging server data + local optimistic updates 
  */
  const getMemeStats = (meme) => {
    const local = votingMap[meme.id];
    if (local) return local;

    // Default from server data
    const upvotes = meme.upvotes || [];
    const downvotes = meme.downvotes || [];
    let userVote = null;
    if (user && upvotes.includes(user.uid)) userVote = 'up';
    if (user && downvotes.includes(user.uid)) userVote = 'down';

    return {
      upvotes: upvotes.length,
      downvotes: downvotes.length,
      userVote
    };
  };

  const handleVote = async (memeId, type) => {
    if (!user) {
      alert('Please login to vote!');
      return;
    }

    // Calculate new state based on current
    // We need to know the *current* state (from server or previous local update)
    const meme = savedMemes.find(m => m.id === memeId);
    if (!meme) return;

    const currentStats = getMemeStats(meme);

    let newUp = currentStats.upvotes;
    let newDown = currentStats.downvotes;
    let newUserVote = currentStats.userVote;

    // Toggle logic
    // If clicking same vote type -> remove vote
    if (newUserVote === (type === 'upvote' ? 'up' : 'down')) {
      if (newUserVote === 'up') newUp--;
      if (newUserVote === 'down') newDown--;
      newUserVote = null;
    } else {
      // If changing vote or new vote
      // Remove old vote if exists
      if (newUserVote === 'up') newUp--;
      if (newUserVote === 'down') newDown--;

      // Add new vote
      if (type === 'upvote') newUp++;
      if (type === 'downvote') newDown++;
      newUserVote = type === 'upvote' ? 'up' : 'down';
    }

    // Optimistic Update
    setVotingMap(prev => ({
      ...prev,
      [memeId]: {
        upvotes: newUp,
        downvotes: newDown,
        userVote: newUserVote
      }
    }));

    try {
      await api.voteMeme(memeId, type, user.accessToken);
    } catch (error) {
      console.error('Vote failed:', error);
      // Revert by removing the local override, causing it to fall back to server data
      setVotingMap(prev => {
        const newState = { ...prev };
        delete newState[memeId];
        return newState;
      });
      alert('Failed to submit vote');
    }
  };

  const handleDelete = async (meme) => {
    if (!user) return;

    if (meme.authorUID && meme.authorUID !== user.uid && !user.admin) {
      alert("You can only delete your own memes.");
      return;
    }

    if (confirm('Are you sure you want to delete this meme?')) {
      try {
        if (isOnline) {
          await api.deleteMeme(meme.id, user.accessToken);
        } else {
          deleteLocalMeme(meme.id);
        }

        removeMeme(meme.id);

        if (selectedMeme?.id === meme.id) {
          setSelectedMeme(null);
        }
      } catch (error) {
        console.error('Failed to delete meme:', error);
        alert('Failed to delete meme. Please try again.');
      }
    }
  };

  const handleDownload = (meme) => {
    const link = document.createElement('a');
    link.download = `${meme.name}-${meme.id}.png`;
    link.href = meme.url;
    link.click();
  };

  // Render Helper
  const renderVoteButton = (meme, type) => {
    const stats = getMemeStats(meme);
    const isUp = type === 'upvote';
    const isActive = isUp ? stats.userVote === 'up' : stats.userVote === 'down';
    const count = isUp ? stats.upvotes : stats.downvotes;

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleVote(meme.id, type);
        }}
        className={`flex items-center gap-1 transition-colors ${isActive
          ? (isUp ? 'text-green-400' : 'text-red-400')
          : 'text-slate-400 hover:text-slate-200'
          }`}
      >
        {isUp ? <ThumbsUp size={14} className={isActive ? 'fill-current' : ''} /> : <ThumbsDown size={14} className={isActive ? 'fill-current' : ''} />}
        <span className="text-xs">{count}</span>
      </button>
    );
  };

  // Helper for relative time or date formatting
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    // If it's a new ISO string from createdAt, we could prettify it, 
    // but for now relying on the simple stored date string is fine.
    return dateStr;
  };

  // Helper to generate a color from name for avatar
  const getAvatarColor = (name) => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent mb-12">
        Meme Feed
      </h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-violet-500" size={48} />
        </div>
      ) : savedMemes.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-slate-500 text-lg mb-2">No memes shared yet</div>
          <div className="text-slate-600 text-sm">Be the first to post a meme!</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {savedMemes.map((meme) => {
              const authorName = meme.authorName && meme.authorName.includes('@') ? meme.authorName.split('@')[0] : (meme.authorName || 'Anonymous');
              const initial = authorName.charAt(0).toUpperCase();

              return (
                <div key={meme.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all duration-300 flex flex-col">

                  {/* Card Header: Author Info */}
                  <div className="p-4 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${getAvatarColor(authorName)} flex items-center justify-center text-white font-bold text-sm select-none`}>
                        {initial}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-200">{authorName}</span>
                        <span className="text-[10px] text-slate-500">{meme.date}</span>
                      </div>
                    </div>
                    {/* Context Menu / Delete for Owner */}
                    {(user && (user.admin || user.uid === meme.authorUID)) && (
                      <button
                        className="text-slate-600 hover:text-red-400 transition-colors p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(meme);
                        }}
                        title="Delete Meme"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Card Body: Image and Caption */}
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
                        loading="lazy"
                        className="w-full h-auto object-cover max-h-[400px] transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                        <span className="bg-black/50 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                          Click to view
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Actions */}
                  <div className="p-4 border-t border-slate-800/50 bg-slate-900/30">
                    <div className="flex items-center justify-between">
                      {/* Vote Actions */}
                      <div className="flex items-center gap-4 bg-slate-800/50 px-3 py-1.5 rounded-full">
                        {renderVoteButton(meme, 'upvote')}
                        <div className="w-[1px] h-4 bg-slate-700"></div>
                        {renderVoteButton(meme, 'downvote')}
                      </div>

                      {/* Other Actions */}
                      <button
                        className="text-slate-400 hover:text-violet-400 transition-colors p-2 hover:bg-slate-800/50 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(meme);
                        }}
                        title="Download"
                      >
                        <Download size={20} />
                      </button>
                    </div>
                    <div className="mt-3 text-xs text-slate-500">
                      Template: {meme.template}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Load More Button */}
          {hasMore && isOnline && (
            <div className="flex justify-center mt-12">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="flex items-center gap-2 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-all hover:ring-2 hover:ring-violet-500/50 disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={20} />
                    <span>Load More Memes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Enhanced Modal */}
      {selectedMeme && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedMeme(null)}
        >
          {/* Close Button specific to full screen overlay */}
          <button
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[60]"
            onClick={() => setSelectedMeme(null)}
          >
            <X size={24} />
          </button>

          <div
            className="w-full max-w-5xl max-h-[95vh] flex flex-col md:flex-row bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Section - Large and dominant */}
            <div className="flex-1 bg-black flex items-center justify-center p-4 relative min-h-[50vh] md:min-h-0">
              <img
                src={selectedMeme.url}
                alt={selectedMeme.name}
                className="max-w-full max-h-[85vh] object-contain"
              />
            </div>

            {/* Sidebar Section (on Desktop) or Bottom (Mobile) - Details */}
            <div className="w-full md:w-[320px] lg:w-[400px] flex flex-col border-l border-slate-800 bg-slate-900">
              {/* Header */}
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3 px-1">
                  <div className={`w-10 h-10 rounded-full ${getAvatarColor(selectedMeme.authorName || 'Anonymous')} flex items-center justify-center text-white font-bold text-lg select-none`}>
                    {(selectedMeme.authorName || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100">{selectedMeme.authorName && selectedMeme.authorName.includes('@') ? selectedMeme.authorName.split('@')[0] : (selectedMeme.authorName || 'Anonymous')}</h3>
                    <span className="text-xs text-slate-500">{selectedMeme.date}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 overflow-y-auto">
                <h2 className="text-xl font-semibold text-slate-100 mb-2">{selectedMeme.name}</h2>
                <p className="text-sm text-slate-400 mb-6 font-mono bg-slate-950/50 p-2 rounded">Template: {selectedMeme.template}</p>

                <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-xl mb-4">
                  {renderVoteButton(selectedMeme, 'upvote')}
                  <div className="w-[1px] h-6 bg-slate-700"></div>
                  {renderVoteButton(selectedMeme, 'downvote')}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-6 border-t border-slate-800 bg-slate-900 safe-area-bottom">
                <button
                  className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 mb-3"
                  onClick={() => handleDownload(selectedMeme)}
                >
                  <Download size={20} />
                  Download Image
                </button>

                {(user && (user.admin || user.uid === selectedMeme.authorUID)) && (
                  <button
                    className="w-full py-3 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    onClick={() => {
                      handleDelete(selectedMeme);
                      setSelectedMeme(null); // Close modal on delete
                    }}
                  >
                    <Trash2 size={20} />
                    Delete Post
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
