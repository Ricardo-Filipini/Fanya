import React from 'react';
import PropTypes from 'prop-types';
import { 
  FiUser, FiMessageSquare, FiLogOut, FiChevronsLeft, FiChevronsRight, 
  FiSun, FiMoon, FiLayout, FiTerminal, FiList, FiAlertCircle, FiPlusSquare
} from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import { supabase } from '../services/supabaseClient'; // Import supabase client
import '../App.css'; // Para estilos globais, se houver

const Sidebar = ({ isCollapsed: propIsCollapsed, toggleSidebar: propToggleSidebar }) => {
  const isExpanded = !propIsCollapsed;
  const toggleSidebar = propToggleSidebar;

  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { 
    sessionsList, 
    activeSessionId, 
    setActiveSessionId, 
    loadingSessions, 
    errorSessions,
    fetchSessions, // Get fetchSessions from context
  } = useSession();
  
  const displayName = user ? (user.user_metadata?.full_name || user.user_metadata?.name || user.email) : '';

  const handleLogout = async () => {
    await signOut();
  };

  const handleCreateNewSession = async () => {
    if (!user || !user.id) {
      console.error("Usuário não autenticado para criar sessão.");
      alert("Você precisa estar logado para criar uma nova sessão.");
      return;
    }

    const now = new Date().toISOString();
    const newSessionData = {
      user_id: user.id,
      name: null, 
      created_at: now,
      last_activity_at: now,
    };

    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert(newSessionData)
        .select(); 

      if (error) {
        console.error('Erro ao criar nova sessão no Supabase:', error);
        throw error;
      }

      if (data && data.length > 0) {
        const newSession = data[0];
        setActiveSessionId(newSession.id); 
        if (fetchSessions) { 
            await fetchSessions(user.id); 
        }
      } else {
        console.error('Nenhum dado retornado após a inserção da sessão.');
      }
    } catch (err) {
      console.error('Falha ao criar nova sessão:', err.message);
      alert(`Erro ao criar sessão: ${err.message}`);
    }
  };

  const formatSessionDisplayName = (session) => {
    if (session.name && session.name.trim() !== '') return session.name;
    if (session.created_at) {
      try {
        return `Sessão de ${new Date(session.created_at).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })}`;
      } catch (e) {
        console.error("Erro ao formatar data da sessão:", e);
        return 'Sessão (data inválida)';
      }
    }
    return 'Sessão sem nome';
  };

  const menuItems = [
    { id: 'chat', name: 'Chat', icon: <FiMessageSquare size={24} /> },
    { id: 'display', name: 'Display', icon: <FiLayout size={24} /> },
    { id: 'console', name: 'Console', icon: <FiTerminal size={24} /> },
  ];

  const sidebarStyle = {
    width: isExpanded ? '260px' : '60px',
    backgroundColor: 'var(--color-background-primary)',
    color: 'var(--color-text-primary)',
    transition: 'width 0.3s ease, background-color 0.3s ease, color 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    boxSizing: 'border-box',
    borderRight: '1px solid var(--color-border)',
  };

  const buttonStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-primary)',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'auto',
    boxSizing: 'border-box',
  };

  const baseItemStyle = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '5px',
    cursor: 'pointer',
    boxSizing: 'border-box',
    color: 'var(--color-text-primary)',
    transition: 'background-color 0.2s ease, color 0.2s ease',
  };
  
  const navMenuItemStyle = {
    ...baseItemStyle,
    justifyContent: isExpanded ? 'flex-start' : 'center',
  };

  const sessionListItemStyle = (isActive) => ({
    ...baseItemStyle,
    justifyContent: isExpanded ? 'flex-start' : 'center',
    backgroundColor: isActive ? 'var(--color-accent-soft, rgba(var(--color-accent-rgb), 0.15))' : 'transparent',
    borderLeft: isActive ? `3px solid var(--color-accent)` : 'none',
    paddingLeft: isActive ? '7px' : '10px',
  });

  const sessionsSectionStyle = {
    padding: isExpanded ? '0 10px' : '0 5px',
    marginTop: '15px',
    borderTop: isExpanded ? `1px solid var(--color-border)` : 'none',
    paddingTop: isExpanded ? '15px' : '0',
  };
  
  const sessionsTitleStyle = {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--color-text-secondary)',
    padding: '0 0 10px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const iconStyle = {
    marginRight: isExpanded ? '12px' : '0',
    flexShrink: 0,
  };

  const textStyle = {
    overflow: 'hidden', 
    textOverflow: 'ellipsis', 
    whiteSpace: 'nowrap',
    fontSize: '0.9rem',
  };

  return (
    <div style={sidebarStyle} className={`sidebar ${!isExpanded ? 'collapsed' : 'expanded'} ${theme}`}>
      <div style={{ padding: '10px', display: 'flex', justifyContent: isExpanded ? 'flex-end' : 'center', alignItems: 'center', borderBottom: `1px solid var(--color-border)`, marginBottom: '10px' }}>
        <button onClick={toggleSidebar} style={{...buttonStyle, padding: '5px'}} title={isExpanded ? "Recolher sidebar" : "Expandir sidebar"}>
          {isExpanded ? <FiChevronsLeft size={22}/> : <FiChevronsRight size={22}/>}
        </button>
      </div>

      <div style={{ width: '100%', flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '0 10px' }}>
        <nav style={{ width: '100%' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {menuItems.map(item => (
              <li key={item.id} title={!isExpanded ? item.name : ''} style={navMenuItemStyle}>
                <a href={`#${item.id}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', width: '100%' }}>
                  <span style={iconStyle}>{item.icon}</span>
                  {isExpanded && <span style={textStyle}>{item.name}</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {user && (
          <div style={sessionsSectionStyle}>
            {isExpanded ? (
              <React.Fragment>
                <h3 style={sessionsTitleStyle}>
                  Sessões
                  <button 
                    title="Nova Sessão" 
                    style={{...buttonStyle, padding: '4px', color: 'var(--color-accent)'}} 
                    onClick={handleCreateNewSession}
                  >
                    <FiPlusSquare size={18} />
                  </button>
                </h3>
                {loadingSessions && <p style={{ padding: '8px 0', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Carregando sessões...</p>}
                {errorSessions && (
                  <div style={{ padding: '8px 0', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}>
                    <FiAlertCircle style={{ marginRight: '8px', flexShrink: 0 }} size={18}/> {errorSessions}
                  </div>
                )}
                {!loadingSessions && !errorSessions && sessionsList.length === 0 && (
                  <p style={{ padding: '8px 0', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Nenhuma sessão encontrada.</p>
                )}
                {!loadingSessions && !errorSessions && sessionsList.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto' }}>
                    {sessionsList.map(session => (
                      <li
                        key={session.id}
                        style={sessionListItemStyle(session.id === activeSessionId)}
                        onClick={() => setActiveSessionId(session.id)}
                        title={formatSessionDisplayName(session)}
                      >
                        <FiList size={18} style={{ ...iconStyle, color: session.id === activeSessionId ? 'var(--color-accent)' : 'var(--color-text-secondary)' }} />
                        <span style={textStyle}>
                          {formatSessionDisplayName(session)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </React.Fragment>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                <div 
                  style={{ ...navMenuItemStyle, justifyContent: 'center', marginTop: '20px', marginBottom: '10px' }} 
                  title={`Sessões (${sessionsList.length})`}
                >
                  <FiList size={24} style={{ ...iconStyle, marginRight: 0 }} />
                </div>
                <button
                  onClick={handleCreateNewSession}
                  style={{ ...buttonStyle, width: '100%', padding: '8px 0' }}
                  title="Nova Sessão"
                >
                  <FiPlusSquare size={22} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ 
        marginTop: 'auto', 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        padding: '10px',
        borderTop: `1px solid var(--color-border)`,
      }}>
        {user && (
          <div 
            style={{ 
              ...baseItemStyle,
              justifyContent: isExpanded ? 'flex-start' : 'center', 
              marginBottom: '10px',
              cursor: 'default',
            }} 
            title={user.email}
          >
            <FiUser size={22} style={iconStyle} />
            {isExpanded && <span style={textStyle}>{displayName}</span>}
          </div>
        )}

        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: isExpanded ? 'row' : 'column',
          justifyContent: isExpanded ? 'space-between' : 'center',
          alignItems: 'center',
        }}>
          <button
            onClick={toggleTheme}
            style={{ 
              ...buttonStyle, 
              ...(isExpanded ? {} : { marginBottom: '8px' })
            }}
            title={theme === 'light' ? "Mudar para Tema Escuro" : "Mudar para Tema Claro"}
          >
            {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>

          {user && (
            <button
              onClick={handleLogout}
              style={{ 
                ...buttonStyle,
                ...(isExpanded ? { marginLeft: '10px' } : {}) 
              }}
              title="Logout"
            >
              <FiLogOut size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Sidebar;
