const admin = require('firebase-admin');

// Initialize Firebase Admin (this will be called in server.js)
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    res.status(403).json({ error: 'Unauthorized: Invalid token' });
  }
};

const isAdmin = async (req, res, next) => {
  if (req.user && req.user.admin === true) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
};

module.exports = { verifyToken, isAdmin };
