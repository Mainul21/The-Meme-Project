const admin = require('firebase-admin');
require('dotenv').config({ path: '../.env' });

// Initialize Firebase Admin
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    // If running locally with GOOGLE_APPLICATION_CREDENTIALS set
    admin.initializeApp();
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  process.exit(1);
}

const email = process.argv[2];

if (!email) {
  console.log('Usage: node makeAdmin.js <user_email>');
  process.exit(1);
}

const makeAdmin = async (email) => {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ Success! User ${email} is now an admin.`);
    console.log('They may need to sign out and sign back in for changes to take effect.');
  } catch (error) {
    console.error('❌ Error setting admin claim:', error.message);
  } finally {
    process.exit();
  }
};

makeAdmin(email);
