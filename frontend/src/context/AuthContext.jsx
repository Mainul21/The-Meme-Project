import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import Swal from 'sweetalert2';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
            if (user) {
                // Initialize last activity on login/load
                localStorage.setItem('auth_last_activity', Date.now().toString());
            }
        });

        return unsubscribe;
    }, []);

    // Idle Timeout Logic
    useEffect(() => {
        if (!user) return;

        const IDLE_TIMEOUT = 60 * 60 * 1000; // 1 hour
        const CHECK_INTERVAL = 60 * 1000; // Check every minute

        const updateActivity = () => {
            // Throttle updates to local storage (limit to once per minute)
            const lastActivity = parseInt(localStorage.getItem('auth_last_activity') || '0', 10);
            if (Date.now() - lastActivity > 10000) {
                localStorage.setItem('auth_last_activity', Date.now().toString());
            }
        };

        const checkIdle = () => {
            const lastActivity = parseInt(localStorage.getItem('auth_last_activity') || '0', 10);
            if (Date.now() - lastActivity > IDLE_TIMEOUT) {
                console.log('Session timed out due to inactivity');
                logout();
                Swal.fire({
                    icon: 'warning',
                    title: 'Session Expired',
                    text: 'Your session has expired due to inactivity. Please sign in again.',
                    confirmButtonColor: '#7c3aed'
                });
            }
        };

        // listeners for activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, updateActivity));

        // interval to check timeout
        const intervalId = setInterval(checkIdle, CHECK_INTERVAL);

        return () => {
            events.forEach(event => window.removeEventListener(event, updateActivity));
            clearInterval(intervalId);
        };
    }, [user]);

    const signup = async (email, password, displayName) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });

        // Force token refresh to ensure custom claims (like name) are updated in the token
        await userCredential.user.getIdToken(true);
        await userCredential.user.reload();

        // Update local state with new user info
        setUser({ ...userCredential.user });

        return userCredential.user;
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        user,
        signup,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
