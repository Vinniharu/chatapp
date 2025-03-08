'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as authSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, database } from '../firebase/config';
import { ref, set, onDisconnect, onValue, off } from 'firebase/database';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  onlineUsers: OnlineUser[];
}

interface OnlineUser {
  uid: string;
  email: string | null;
  lastSeen: number;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // If user is logged in, update their online status
      if (currentUser) {
        const userStatusRef = ref(database, `status/${currentUser.uid}`);
        
        const userStatus = {
          uid: currentUser.uid,
          email: currentUser.email,
          lastSeen: Date.now()
        };
        
        // Set user as online
        set(userStatusRef, userStatus);
        
        // Remove user status when they disconnect
        onDisconnect(userStatusRef).remove();
      }
    });

    // Fetch online users
    const statusRef = ref(database, 'status');
    onValue(statusRef, (snapshot) => {
      const statuses = snapshot.val();
      if (statuses) {
        const userList: OnlineUser[] = Object.values(statuses);
        setOnlineUsers(userList);
      } else {
        setOnlineUsers([]);
      }
    });

    return () => {
      unsubscribe();
      off(statusRef);
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    if (user) {
      // Remove user from online status
      const userStatusRef = ref(database, `status/${user.uid}`);
      await set(userStatusRef, null);
    }
    return authSignOut(auth);
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    onlineUsers
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 