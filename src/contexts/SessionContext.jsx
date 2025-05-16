import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './AuthContext'; // To get the logged-in user

export const SessionContext = createContext(); // Adicionado export

export function useSession() {
  return useContext(SessionContext);
}

export function SessionProvider({ children }) {
  const [sessionsList, setSessionsList] = useState([]);
  const [_activeSessionId, _setActiveSessionId] = useState(null); // Renamed internal state
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [errorSessions, setErrorSessions] = useState(null);
  const { user } = useAuth(); // Get user from AuthContext

  const activeSessionId = _activeSessionId; // Expose the original value

  const setActiveSessionId = (sessionId) => {
    _setActiveSessionId(sessionId);
    if (sessionId) {
      setSessionsList(prevList => {
        const selectedSession = prevList.find(s => s.id === sessionId);
        if (!selectedSession) return prevList; // Should not happen if ID is valid
        const otherSessions = prevList.filter(s => s.id !== sessionId);
        return [selectedSession, ...otherSessions];
      });
    }
  };
  
  // Function to fetch sessions (defaults to non-archived)
  const fetchSessions = async (userId, includeArchived = false) => {
    if (!userId) {
      setSessionsList([]);
      _setActiveSessionId(null); // Use internal setter
      return;
    }
    setLoadingSessions(true);
    setErrorSessions(null);
    try {
      let query = supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId);

      if (!includeArchived) {
        query = query.eq('arquivado', false);
      }
      // For fetching only archived, the caller would set includeArchived=true and filter client-side, or we add another param.
      // For now, this covers the main list (non-archived) and fetching all (for a potential archived view).
      
      query = query.order('last_activity_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      
      // If fetching for the main list, update sessionsList
      // If fetching for an archived view, the caller will handle the data.
      // This logic might need refinement if fetchSessions is used for multiple purposes.
      // For now, assume if !includeArchived, it's for the main list.
      if (!includeArchived) {
        setSessionsList(data || []);
        // If current active session is now archived or deleted, clear it
        if (_activeSessionId && !data.some(s => s.id === _activeSessionId)) {
          _setActiveSessionId(null);
        }
      }
      
      // Optionally, set the first session as active if none is active and list is not empty
      if (!includeArchived && data && data.length > 0 && !_activeSessionId) {
         // setActiveSessionId(data[0].id); // This would reorder.
      }
      return data; // Return data for other uses (e.g., fetching archived list)
    } catch (err) {
      console.error(`Erro ao buscar sessões (includeArchived: ${includeArchived}):`, err);
      setErrorSessions(err.message || 'Falha ao carregar sessões.');
      setSessionsList([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchSessions(user.id);

      // --- Supabase Realtime Subscription for Sessions ---
      const channel = supabase
        .channel(`sessions-user-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'sessions',
            filter: `user_id=eq.${user.id}`, // Only for the current user's sessions
          },
          (payload) => {
            console.log('Realtime: Mudança nas sessões recebida!', payload);
            // Re-fetch sessions to ensure data consistency and correct ordering
            // This is simpler than trying to manually merge changes, especially with ordering.
            fetchSessions(user.id); 
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log('Realtime: Conectado ao canal de sessões!');
          }
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('Realtime: Erro no canal de sessões.', err);
            // Optionally, attempt to re-subscribe or notify user
          }
          if (status === 'CLOSED') {
            console.log('Realtime: Canal de sessões fechado.');
          }
        });

      // Cleanup function to remove the channel subscription when the component unmounts or user changes
      return () => {
        console.log('Realtime: Removendo subscrição do canal de sessões.');
        supabase.removeChannel(channel);
      };
      // --- End Realtime Subscription ---

    } else {
      // Clear sessions if user logs out or is not available
      setSessionsList([]);
      _setActiveSessionId(null); // Use internal setter
      setLoadingSessions(false);
    }
  }, [user]); // Re-fetch and re-subscribe when user changes

  const value = {
    sessionsList,
    setSessionsList, // Exposing this might be useful for optimistic updates later
    activeSessionId: _activeSessionId, // Expose the state variable
    setActiveSessionId, // Expose the wrapped function
    loadingSessions,
    errorSessions,
    fetchSessions, 
    updateSessionName,
    archiveSession,    // Add new function
    unarchiveSession,  // Add new function
  };

  async function updateSession(sessionId, updates) {
    if (!user || !user.id) throw new Error("Usuário não autenticado.");
    if (!sessionId) throw new Error("ID da sessão não fornecido.");

    setLoadingSessions(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update({ ...updates, last_activity_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Refresh the main list of non-archived sessions
      // The realtime listener will also pick this up, but an explicit fetch ensures UI consistency faster.
      await fetchSessions(user.id, false); 
      
      // If the active session was archived, clear it
      if (updates.arquivado === true && _activeSessionId === sessionId) {
        _setActiveSessionId(null);
      }

      return data;
    } catch (err) {
      console.error('Erro ao atualizar sessão:', err.message, updates);
      setErrorSessions(err.message || 'Falha ao atualizar sessão.');
      throw err;
    } finally {
      setLoadingSessions(false);
    }
  }

  async function archiveSession(sessionId) {
    console.log(`Context: Tentando arquivar sessão ${sessionId}`);
    return updateSession(sessionId, { arquivado: true });
  }

  async function unarchiveSession(sessionId) {
    console.log(`Context: Tentando desarquivar sessão ${sessionId}`);
    return updateSession(sessionId, { arquivado: false });
  }

  // Function to update a session's name
  async function updateSessionName(sessionId, newName) {
    if (!user || !user.id) {
      console.error("Usuário não autenticado para renomear sessão.");
      throw new Error("Usuário não autenticado.");
    }
    if (!sessionId || typeof newName !== 'string') {
      console.error("ID da sessão ou novo nome inválido.");
      throw new Error("Dados inválidos para renomear sessão.");
    }

    setLoadingSessions(true); // Indicate loading state
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update({ name: newName.trim(), last_activity_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', user.id) // Ensure user can only update their own sessions
        .select()
        .single();

      if (error) {
        console.error('Erro ao renomear sessão no Supabase:', error);
        throw error;
      }

      if (data) {
        // Update the specific session in the local list
        setSessionsList(prevSessions =>
          prevSessions.map(session =>
            session.id === sessionId ? { ...session, name: data.name, last_activity_at: data.last_activity_at } : session
          )
        );
        // Re-sort if needed, or rely on existing order if last_activity_at is used for sorting
        // For simplicity, we'll assume the list re-renders correctly or fetchSessions is called if order is critical
        console.log('Sessão renomeada com sucesso:', data);
      }
      return data;
    } catch (err) {
      console.error('Falha ao renomear sessão:', err.message);
      setErrorSessions(err.message || 'Falha ao renomear sessão.');
      throw err; // Re-throw to be caught by caller if needed
    } finally {
      setLoadingSessions(false);
    }
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

SessionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
