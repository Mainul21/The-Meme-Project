// Utility functions for saving and loading memes from localStorage

const STORAGE_KEY = 'saved_memes';

export const saveMeme = (memeData) => {
  try {
    const savedMemes = getSavedMemes();
    const newMeme = {
      id: Date.now(),
      ...memeData,
      date: new Date().toISOString().split('T')[0],
    };
    savedMemes.unshift(newMeme); // Add to beginning
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMemes));
    return newMeme;
  } catch (error) {
    console.error('Error saving meme:', error);
    return null;
  }
};

export const getSavedMemes = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading memes:', error);
    return [];
  }
};

export const deleteMeme = (id) => {
  try {
    const savedMemes = getSavedMemes();
    const filtered = savedMemes.filter(meme => meme.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting meme:', error);
    return false;
  }
};
