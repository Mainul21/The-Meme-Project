import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAFr9YAUEKJOfdRFjZjBvG88gOsPvxPRGI",
  authDomain: "the-meme-project-b8bdc.firebaseapp.com",
  projectId: "the-meme-project-b8bdc",
  storageBucket: "the-meme-project-b8bdc.firebasestorage.app",
  messagingSenderId: "300552378912",
  appId: "1:300552378912:web:5d5a297c1eb0573282ba45",
  measurementId: "G-VRK8B2ERDP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
