import React, { createContext, useState, useContext, useCallback } from 'react';
import { api } from '../services/api';
import { getSavedMemes } from '../utils/memeStorage';

const MemeContext = createContext();

export const useMemeContext = () => useContext(MemeContext);

export const MemeProvider = ({ children }) => {
  const [memes, setMemes] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastFetched, setLastFetched] = useState(0);

  const loadMemes = useCallback(async (pageNum = 1, force = false) => {
    // If we have data and it's a fresh request for page 1 without force, don't reload
    if (pageNum === 1 && memes.length > 0 && !force) {
      return;
    }

    if (pageNum === 1) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const limit = 12;
      const response = await api.getAllMemes(pageNum, limit);
      
      const memesFromDB = response.memes.map(meme => ({
        id: meme._id,
        url: meme.imageData,
        name: meme.name,
        template: meme.template,
        date: new Date(meme.createdAt).toISOString().split('T')[0]
      }));

      if (pageNum === 1) {
        setMemes(memesFromDB);
      } else {
        setMemes(prev => {
          // Filter out duplicates just in case
          const existingIds = new Set(prev.map(m => m.id));
          const newMemes = memesFromDB.filter(m => !existingIds.has(m.id));
          return [...prev, ...newMemes];
        });
      }
      
      setHasMore(response.currentPage < response.totalPages);
      setPage(pageNum);
      setIsOnline(true);
      setLastFetched(Date.now());
    } catch (error) {
      console.error('Failed to fetch from server:', error);
      // Fallback to localStorage only on first load
      if (pageNum === 1) {
        const localMemes = getSavedMemes();
        setMemes(localMemes);
        setIsOnline(false);
        setHasMore(false);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [memes.length]);

  const refreshMemes = useCallback(() => {
    return loadMemes(1, true);
  }, [loadMemes]);

  const addMeme = useCallback((newMeme) => {
    setMemes(prev => [newMeme, ...prev]);
  }, []);

  const removeMeme = useCallback((id) => {
    setMemes(prev => prev.filter(m => m.id !== id));
  }, []);

  const value = {
    memes,
    page,
    hasMore,
    isLoading,
    isLoadingMore,
    isOnline,
    loadMemes,
    refreshMemes,
    addMeme,
    removeMeme
  };

  return (
    <MemeContext.Provider value={value}>
      {children}
    </MemeContext.Provider>
  );
};
