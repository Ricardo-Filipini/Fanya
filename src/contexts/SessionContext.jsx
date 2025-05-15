import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './AuthContext'; // To get the logged-in user

const SessionContext = createContext();

export function useSession() {
  return useContext(SessionContext);
}

export function SessionProvider({ children }) {
  const [sessionsList, setSessionsList] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [errorSessions, setErrorSessions] = useState(null);
  const { user } = useAuth(); // Get user from AuthContext

  // Function to fetch sessions (will be implemented in the next step)
  const fetchSessions = async (userId) => {
    if (!userId) {
      setSessionsList([]);
      setActiveSessionId(null);
      return;
    }
    setLoadingSessions(true);
    setErrorSessions(null);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_activity_at', { ascending: false });

      if (error) {
        throw error;
      }
      setSessionsList(data || []);
      // Optionally, set the first session as active if none is active
      // if (data && data.length > 0 && !activeSessionId) {
      //   setActiveSessionId(data[0].id);
      // }
    } catch (err) {
      console.error('Erro ao buscar sessões:', err);
      setErrorSessions(err.message || 'Falha ao carregar sessões.');
      setSessionsList([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchSessions(user.id);
    } else {
      // Clear sessions if user logs out or is not available
      setSessionsList([]);
      setActiveSessionId(null);
      setLoadingSessions(false);
    }
  }, [user]); // Re-fetch when user changes

  const value = {
    sessionsList,
    setSessionsList, // Exposing this might be useful for optimistic updates later
    activeSessionId,
    setActiveSessionId,
    loadingSessions,
    errorSessions,
    fetchSessions, // Expose fetchSessions if manual refresh is needed
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

SessionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
