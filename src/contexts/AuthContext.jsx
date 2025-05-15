import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // setLoading(true) no início para garantir que o estado de carregamento seja resetado em re-montagens
    setLoading(true); 
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Verifica a sessão inicial
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("AuthContext: Initial session:", initialSession);
      setSession(initialSession); 
      setUser(initialSession?.user ?? null); 
      setLoading(false); 
    }).catch((error) => {
        console.error("AuthContext: Error getting initial session:", error);
        setSession(null); 
        setUser(null); 
        setLoading(false); 
    });

    return () => {
      subscription?.unsubscribe(); 
    };
  }, []);

  const value = {
    session,
    user,
    signOut: () => supabase.auth.signOut(),
    // loading, // Optionally expose loading for debugging elsewhere
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <p style={{ textAlign: 'center', marginTop: '20%', fontSize: '1.2em' }}>Carregando autenticação...</p> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
