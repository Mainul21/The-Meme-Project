require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const memeRoutes = require('./routes/memes');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['https://meme-frontend-l6zg.onrender.com', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
const admin = require('firebase-admin');

// Initialize Firebase Admin
// Note: You need to set GOOGLE_APPLICATION_CREDENTIALS in .env or provide a service account
// For now, we'll try default application credentials or a placeholder if in dev
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    admin.initializeApp({ projectId: 'the-meme-project-b8bdc' });
    console.log('⚠️ Firebase Admin initialized with Project ID only (for token verification)');
  }
  console.log('✅ Firebase Admin Initialized');
} catch (error) {
  console.warn('⚠️ Firebase Admin initialization failed:', error.message);
}

// MongoDB Connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err);
      // Don't exit process so the server can still start for health checks
    });
} else {
  console.warn('⚠️ MONGODB_URI is not defined. Database features will not work.');
}

// Routes
app.use('/api/memes', memeRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
