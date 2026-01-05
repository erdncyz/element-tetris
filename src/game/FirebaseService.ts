import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';

// TODO: Bu yapılandırmayı Firebase Konsolundan alıp doldurmanız gerekiyor
const firebaseConfig = {
    apiKey: "API_KEY_BURAYA",
    authDomain: "PROJE_ID.firebaseapp.com",
    projectId: "PROJE_ID",
    storageBucket: "PROJE_ID.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID",
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
