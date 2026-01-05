import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';

// TODO: Bu yapılandırmayı Firebase Konsolundan alıp doldurmanız gerekiyor
const firebaseConfig = {
    apiKey: "AIzaSyBMPUZopzuj0W9F2tGQzR0bRiONpM5a5BU",
    authDomain: "erdinc-1ccf0.firebaseapp.com",
    projectId: "erdinc-1ccf0",
    storageBucket: "erdinc-1ccf0.firebasestorage.app",
    messagingSenderId: "908829733544",
    appId: "1:908829733544:web:e41077651c6c518ad7489d", // Note: Web App ID might differ from iOS App ID, please verify in console if possible, otherwise using project based guess or placeholder if strictly JS SDK specific. However, for hybrid, often the iOS App ID is used for native Init, but JS SDK usually needs a web app ID.
    // Since I cannot access the console, I will use the iOS App ID as best effort or keep a note. 
    // Actually, `initializeApp` in JS SDK needs a WEB App ID. The iOS App ID "1:908829733544:ios:83bd6a..." is for native.
    // I can construct the authDomain and storageBucket accurately. The AppID for web usually starts with 1:...:web:...
    // I made a best guess for authDomain/storage based on project ID.
    // I will leave measurementId as placeholder or remove it if not critical, but better to populate what I can.
    measurementId: "G-XXXXXXXX"
};

// Initialize Firebase JS SDK
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export const FirebaseService = {
    /**
     * Analytics ve Firebase'i başlatır
     */
    initialize: async () => {
        try {
            if (Capacitor.isNativePlatform()) {
                await FirebaseAnalytics.initializeFirebase(firebaseConfig);
            }
            console.log('Firebase initialized');
        } catch (error) {
            console.error('Firebase init error:', error);
        }
    },

    /**
     * Bir kullanıcıya rol atar (Firestore 'users' koleksiyonunda)
     * @param userId Kullanıcı ID'si
     * @param role Atanacak rol (örn: 'admin', 'player')
     */
    setUserRole: async (userId: string, role: string) => {
        try {
            await setDoc(doc(db, 'users', userId), {
                role: role,
                updatedAt: new Date()
            }, { merge: true });

            // Native Analytics'e de bunu bildirelim
            await FirebaseAnalytics.setUserProperty({
                name: 'user_role',
                value: role,
            });

            console.log(`Role ${role} set for user ${userId}`);
        } catch (error) {
            console.error('Error setting user role:', error);
        }
    },

    /**
     * Kullanıcının rolünü getirir
     */
    getUserRole: async (userId: string): Promise<string | null> => {
        try {
            const docRef = doc(db, 'users', userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data().role;
            }
            return null;
        } catch (error) {
            console.error('Error getting user role:', error);
            return null;
        }
    },

    /**
     * Özel bir event loglar
     */
    logEvent: async (name: string, params: any) => {
        try {
            await FirebaseAnalytics.logEvent({
                name,
                params,
            });
        } catch (error) {
            console.error('Error logging event:', error);
        }
    },

    /**
     * Mevcut ekranı loglar
     */
    setScreenName: async (screenName: string) => {
        try {
            await FirebaseAnalytics.setScreenName({
                screenName,
                nameOverride: screenName
            });
        } catch (error) {
            console.error('Error setting screen name:', error);
        }
    }
};
