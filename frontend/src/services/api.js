const API_URL = import.meta.env.VITE_API_URL || 'https://meme-backend-3i5g.onrender.com/api';

// API service for communicating with backend
export const api = {
  // Upload a new meme to MongoDB
  async uploadMeme(memeData, token) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/memes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: memeData.name,
          imageData: memeData.url,
          template: memeData.template,
          captions: memeData.captions
        })
      });

      if (!response.ok) {
        throw new Error('Failed to upload meme');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading meme:', error);
      throw error;
    }
  },

  // Get all memes from MongoDB
  async getAllMemes(page = 1, limit = 20) {
    try {
      const response = await fetch(`${API_URL}/memes?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch memes');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching memes:', error);
      throw error;
    }
  },

  // Get memes by user UID
  async getUserMemes(uid) {
    try {
      const response = await fetch(`${API_URL}/memes/user/${uid}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user memes');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user memes:', error);
      throw error;
    }
  },


  // Get single meme by ID
  async getMeme(id) {
    try {
      const response = await fetch(`${API_URL}/memes/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch meme');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching meme:', error);
      throw error;
    }
  },

  // Vote on a meme
  async voteMeme(id, type, token) {
    try {
      const response = await fetch(`${API_URL}/memes/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      return await response.json();
    } catch (error) {
      console.error('Error voting on meme:', error);
      throw error;
    }
  },

  // Delete a meme from MongoDB
  async deleteMeme(id, token) {
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/memes/${id}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to delete meme');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting meme:', error);
      throw error;
    }
  },

  // Check if backend is available
  async checkHealth() {
    try {
      const response = await fetch(`${API_URL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};
