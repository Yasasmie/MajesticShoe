// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";

// Create context
const AuthContext = createContext(null);

// Hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user || null);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    authLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!authLoading && children}
    </AuthContext.Provider>
  );
}
