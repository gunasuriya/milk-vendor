"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db, appId } from '@/lib/firebase';
import { User, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, DocumentData, QueryDocumentSnapshot, FirestoreError } from 'firebase/firestore';

// Define the types for our data
export interface Buyer {
  id: string;
  name: string;
  phone: string;
  series: string;
  flat: number;
  flatFull: string;
}

export interface Entry {
  id: string;
  date: string;
  liters: number;
  buyerId: string;
  buyerName: string;
  timestamp: Date;
  addedBy: string;
}

export interface Payment {
  id: string;
  status: 'paid' | 'unpaid';
}

// Define the shape of our context
interface AppContextType {
  currentUser: User | null;
  loading: boolean;
  allBuyers: Buyer[];
  allEntries: Entry[];
  allPayments: Record<string, Payment>; // Use a map for O(1) lookups
  handleSignIn: () => void;
  handleSignOut: () => void;
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create the Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [allBuyers, setAllBuyers] = useState<Buyer[]>([]);
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [allPayments, setAllPayments] = useState<Record<string, Payment>>({});

  // --- Authentication ---
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle setting the user
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // --- Auth State Listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe(); // Cleanup
  }, []);

  // --- Firestore Data Listeners ---
  useEffect(() => {
    if (currentUser) {
      // User is logged in, fetch data
      
      // 1. Buyers
      const buyersQuery = query(collection(db, 'artifacts', appId, 'public/data', 'buyers'));
      const unsubBuyers = onSnapshot(buyersQuery, (snapshot) => {
        const buyersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Buyer[];
        buyersList.sort((a, b) => { // Sort buyers
          if (a.series < b.series) return -1;
          if (a.series > b.series) return 1;
          return a.flat - b.flat;
        });
        setAllBuyers(buyersList);
      }, (err: FirestoreError) => console.error("Error fetching buyers: ", err));

      // 2. Entries
      const entriesQuery = query(collection(db, 'artifacts', appId, 'public/data', 'entries'));
      const unsubEntries = onSnapshot(entriesQuery, (snapshot) => {
        const entriesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: (doc.data().timestamp as any).toDate() // Convert Firestore timestamp
        })) as Entry[];
        setAllEntries(entriesList);
      }, (err: FirestoreError) => console.error("Error fetching entries: ", err));

      // 3. Payments
      const paymentsQuery = query(collection(db, 'artifacts', appId, 'public/data', 'payments'));
      const unsubPayments = onSnapshot(paymentsQuery, (snapshot) => {
        const paymentsMap: Record<string, Payment> = {};
        snapshot.docs.forEach(doc => {
          paymentsMap[doc.id] = { id: doc.id, ...doc.data() } as Payment;
        });
        setAllPayments(paymentsMap);
      }, (err: FirestoreError) => console.error("Error fetching payments: ", err));
      
      // Cleanup function
      return () => {
        unsubBuyers();
        unsubEntries();
        unsubPayments();
      };

    } else {
      // User is logged out, clear data
      setAllBuyers([]);
      setAllEntries([]);
      setAllPayments({});
    }
  }, [currentUser]); // Re-run this effect when the user logs in or out

  const value = {
    currentUser,
    loading,
    allBuyers,
    allEntries,
    allPayments,
    handleSignIn,
    handleSignOut,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Create a custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};