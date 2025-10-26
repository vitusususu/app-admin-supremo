'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, limit, getDocs } from 'firebase/firestore';

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loading: boolean;
  isSuperAdmin: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextProps | null>(null);

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
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          let userDoc = await getDoc(userDocRef);

          // --- LÓGICA DE BOOTSTRAP AUTOMÁTICO ---
          if (!userDoc.exists()) {
            const usersCollectionRef = collection(db, 'users');
            const q = query(usersCollectionRef, limit(1));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
              await setDoc(userDocRef, {
                email: user.email,
                role: 'SUPER_ADMIN',
              });
              userDoc = await getDoc(userDocRef);
            }
          }
          // --- FIM LÓGICA DE BOOTSTRAP ---

          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role === 'SUPER_ADMIN' || userData.role === 'STORE_ADMIN') {
              setUser(user);
              setIsSuperAdmin(userData.role === 'SUPER_ADMIN');
              setAuthError(null);
            } else {
              setAuthError('Você não tem permissão para acessar este painel.');
              await signOut(auth);
            }
          } else {
            setAuthError('Dados do usuário não encontrados. O acesso foi negado.');
            await signOut(auth);
          }
        } catch (error) {
          console.error("Erro ao verificar permissões:", error);
          setAuthError("Ocorreu um erro ao verificar suas permissões.");
          await signOut(auth);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setIsSuperAdmin(false);
        setAuthError(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      let errorMessage = "Ocorreu um erro ao tentar fazer login.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "E-mail ou senha inválidos.";
      }
      setAuthError(errorMessage);
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    await signOut(auth);
  };

  const register = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        role: 'CUSTOMER',
      });
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    isSuperAdmin,
    authError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};