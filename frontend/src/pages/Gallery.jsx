import React, { useState, useEffect } from 'react';
import Card from '../components/UI/Card';
import { deleteMeme as deleteLocalMeme } from '../utils/memeStorage';
import { api } from '../services/api';
import { Download, Trash2, X, Loader2, ChevronDown } from 'lucide-react';
import { useMemeContext } from '../context/MemeContext';

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
  
  const [selectedMeme, setSelectedMeme] = useState(null);

  useEffect(() => {
    loadMemes(1);
  }, [loadMemes]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadMemes(page + 1);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this meme?')) {
      try {
        if (isOnline) {
          // Delete from MongoDB
          await api.deleteMeme(id);
        } else {
          // Delete from localStorage
          deleteLocalMeme(id);
        }
        
        // Remove from context
        removeMeme(id);
        
        if (selectedMeme?.id === id) {
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            Your Gallery
          </h2>
          {!isOnline && (
            <p className="text-sm text-amber-500 mt-1">⚠️ Offline - Showing local memes only</p>
          )}
        </div>
        <div className="text-slate-400">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              Loading...
            </div>
          ) : (
            `${savedMemes.length} meme${savedMemes.length !== 1 ? 's' : ''} loaded`
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-violet-500" size={48} />
        </div>
      ) : savedMemes.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-slate-500 text-lg mb-2">No memes saved yet</div>
          <div className="text-slate-600 text-sm">Create and save your first meme to see it here!</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedMemes.map((meme) => (
              <Card key={meme.id} className="group hover:border-violet-500/50 transition-colors">
                <div 
                  className="h-64 rounded-lg overflow-hidden bg-slate-800 mb-4 relative cursor-pointer"
                  onClick={() => setSelectedMeme(meme)}
                >
                  <img 
                    src={meme.url} 
                    alt={meme.name}
                    loading="lazy"
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(meme);
                      }}
                    >
                      <Download size={20} />
                    </button>
                    <button 
                      className="p-2 bg-white/10 rounded-full hover:bg-red-500/50 text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(meme.id);
                      }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-medium text-slate-200 truncate">{meme.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{meme.template}</span>
                    <span className="text-xs text-slate-500">{meme.date}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && isOnline && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Loading more...
                  </>
                ) : (
                  <>
                    <ChevronDown size={20} />
                    Load More
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal for viewing full-size meme */}
      {selectedMeme && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMeme(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl border border-slate-800 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
              onClick={() => setSelectedMeme(null)}
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-200">{selectedMeme.name}</h3>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white transition-colors flex items-center gap-2"
                    onClick={() => handleDownload(selectedMeme)}
                  >
                    <Download size={18} />
                    Download
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors flex items-center gap-2"
                    onClick={() => handleDelete(selectedMeme.id)}
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="overflow-auto max-h-[70vh] flex items-center justify-center bg-slate-950 rounded-lg p-4">
                <img 
                  src={selectedMeme.url} 
                  alt={selectedMeme.name}
                  className="max-w-full h-auto object-contain rounded"
                  style={{ maxHeight: '65vh' }}
                />
              </div>
              
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Template: {selectedMeme.template}</span>
                <span>Created: {selectedMeme.date}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
