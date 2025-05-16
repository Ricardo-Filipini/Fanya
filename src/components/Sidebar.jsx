import React, { useState, useEffect } from 'react'; // Added useEffect
import PropTypes from 'prop-types';
import { 
  FiUser, FiMessageSquare, FiLogOut, FiChevronsLeft, FiChevronsRight, 
  FiSun, FiMoon, FiLayout, FiTerminal, FiList, FiAlertCircle, FiPlusSquare,
  FiEdit2, FiArchive, FiTrash2, FiUploadCloud // Added Trash and Restore Icons
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
    fetchSessions,
    updateSessionName,
    archiveSession,
    unarchiveSession, // Get unarchiveSession from context
  } = useSession();

  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingSessionName, setEditingSessionName] = useState('');
  const [showArchivedPanel, setShowArchivedPanel] = useState(false);
  const [archivedSessions, setArchivedSessions] = useState([]);
  const [loadingArchived, setLoadingArchived] = useState(false);
  
  const fullDisplayName = user ? (user.user_metadata?.full_name || user.user_metadata?.name || user.email) : '';
  const displayName = fullDisplayName.split(' ')[0]; // Get first name

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
      name: "Nova Conversa", // UPDATED NAME
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
        // Fetch sessions to update the list, then start editing the new one
        if (fetchSessions) {
            await fetchSessions(user.id); // Wait for list to update
        }
        // After list is updated (or assuming it will update quickly via realtime/refetch),
        // find the new session in the list to get its potentially default name for editing.
        // However, since we set it to "Nova Conversa", we can use that.
        handleStartEditSession(newSession); // Start editing the newly created session
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

  const handleStartEditSession = (session) => {
    setEditingSessionId(session.id);
    setEditingSessionName(session.name || ''); // Use current name or empty string
  };

  const handleCancelEditSession = () => {
    setEditingSessionId(null);
    setEditingSessionName('');
  };

  const handleSaveSessionName = async () => {
    if (!editingSessionId || editingSessionName.trim() === '') {
      // Optionally, if name is empty, revert or keep old name, or delete session?
      // For now, just cancel if empty.
      handleCancelEditSession();
      return;
    }
    try {
      await updateSessionName(editingSessionId, editingSessionName.trim());
      console.log(`Sessão ${editingSessionId} renomeada para: ${editingSessionName.trim()}`);
    } catch (error) {
      console.error('Erro ao salvar nome da sessão na sidebar:', error);
      alert(`Falha ao renomear sessão: ${error.message}`);
      // Optionally, revert input to original name if save fails
    } finally {
      handleCancelEditSession(); // Exit editing mode
    }
  };

  const handleEditingInputChange = (e) => {
    setEditingSessionName(e.target.value);
  };

  const handleEditingInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveSessionName();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEditSession();
    }
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
    // justifyContent: isExpanded ? 'flex-start' : 'center', // Will be handled by inner flex
    backgroundColor: isActive ? 'var(--color-accent-soft, rgba(var(--color-accent-rgb), 0.15))' : 'transparent',
    borderLeft: isActive ? `3px solid var(--color-accent)` : 'none',
    paddingLeft: isActive ? '7px' : '10px', // Adjusted for border
    position: 'relative', // For positioning edit icon or input
  });

  const sessionContentStyle = {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    cursor: 'pointer', // Make the text part clickable to select session
  };
  
  const editIconStyle = {
    // marginLeft: 'auto', // Pushes icon to the right
    padding: '4px',
    borderRadius: '4px',
    cursor: 'pointer',
    color: 'var(--color-icon-action)',
    flexShrink: 0,
  };

  const sessionInputStyle = {
    flexGrow: 1,
    padding: '6px 8px',
    border: `1px solid var(--color-border-input)`,
    borderRadius: '4px',
    backgroundColor: 'var(--color-background-input)',
    color: 'var(--color-text-input)',
    fontSize: '0.85rem',
    marginRight: '5px', // Space before potential save/cancel buttons if added
  };


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

  const archivedPanelStyle = {
    position: 'absolute',
    top: '50%',
    left: isExpanded ? '270px' : '70px', // Position next to sidebar
    transform: 'translateY(-50%)',
    width: '300px',
    maxHeight: '80vh',
    backgroundColor: 'var(--color-background-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    color: 'var(--color-text-primary)',
  };

  const archivedListStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    overflowY: 'auto',
    flexGrow: 1,
  };

  const archivedItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid var(--color-border-light)',
  };

  const handleToggleArchivedPanel = async () => {
    const newShowState = !showArchivedPanel;
    setShowArchivedPanel(newShowState);
    if (newShowState && user && user.id) {
      setLoadingArchived(true);
      try {
        const allSessions = await fetchSessions(user.id, true); // Fetch all including archived
        if (allSessions) {
          setArchivedSessions(allSessions.filter(s => s.arquivado));
        }
      } catch (error) {
        console.error("Erro ao buscar sessões arquivadas:", error);
        alert("Falha ao carregar sessões arquivadas.");
      } finally {
        setLoadingArchived(false);
      }
    }
  };

  const handleUnarchiveAndSelect = async (sessionIdToUnarchive) => {
    try {
      await unarchiveSession(sessionIdToUnarchive);
      // Optimistically remove from local archived list
      setArchivedSessions(prev => prev.filter(s => s.id !== sessionIdToUnarchive));
      // The main list will refresh via context/realtime.
      // Optionally, set as active:
      // setActiveSessionId(sessionIdToUnarchive); 
      // setShowArchivedPanel(false); // Close panel after unarchiving
    } catch (error) {
      console.error("Falha ao desarquivar sessão:", error);
      alert(`Erro ao desarquivar sessão: ${error.message}`);
    }
  };


  return (
    <>
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
                        // onClick is now on the inner div for session selection
                        title={editingSessionId === session.id ? "Editando nome..." : formatSessionDisplayName(session)}
                      >
                        {editingSessionId === session.id ? (
                          <input
                            type="text"
                            value={editingSessionName}
                            onChange={handleEditingInputChange}
                            onKeyDown={handleEditingInputKeyDown}
                            onBlur={handleSaveSessionName} // Save on blur
                            style={sessionInputStyle}
                            autoFocus
                          />
                        ) : (
                          <div style={sessionContentStyle} onClick={() => setActiveSessionId(session.id)}>
                            <FiList size={18} style={{ ...iconStyle, color: session.id === activeSessionId ? 'var(--color-accent)' : 'var(--color-text-secondary)' }} />
                            <span style={{...textStyle, flexGrow: 1}}>
                              {formatSessionDisplayName(session)}
                            </span>
                            {isExpanded && ( 
                              <>
                                <FiEdit2
                                  size={16}
                                  style={{...editIconStyle, marginRight: '8px'}}
                                  onClick={(e) => {
                                    e.stopPropagation(); 
                                    handleStartEditSession(session);
                                  }}
                                  title="Renomear Sessão"
                                />
                                <FiArchive
                                  size={16}
                                  style={editIconStyle} // Can reuse style or make a new one
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Tem certeza que deseja arquivar a sessão "${formatSessionDisplayName(session)}"?`)) {
                                      try {
                                        await archiveSession(session.id);
                                        console.log(`Sessão ${session.id} arquivada.`);
                                      } catch (error) {
                                        console.error("Falha ao arquivar sessão:", error);
                                        alert(`Erro ao arquivar sessão: ${error.message}`);
                                      }
                                    }
                                  }}
                                  title="Arquivar Sessão"
                                />
                              </>
                            )}
                          </div>
                        )}
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
        padding: '10px',
        borderTop: `1px solid var(--color-border)`,
        boxSizing: 'border-box',
      }}>
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isExpanded ? 'space-between' : 'center',
            flexDirection: isExpanded ? 'row' : 'column',
            width: '100%',
            marginBottom: '10px',
          }}>
            <div 
              style={{ 
                display: 'flex',
                alignItems: 'center',
                cursor: 'default',
                // For expanded, allow it to take space, for collapsed, center it
                marginRight: isExpanded ? 'auto' : '0', 
                padding: isExpanded ? '0' : '0 0 8px 0', // Add bottom padding in collapsed
              }} 
              title={fullDisplayName}
            >
              <FiUser size={22} style={{...iconStyle, marginRight: isExpanded ? '12px' : '0'}} />
              {isExpanded && <span style={textStyle}>{displayName}</span>}
            </div>
            {isExpanded && ( // Logout button next to user name when expanded
              <button
                onClick={handleLogout}
                style={{ ...buttonStyle, padding: '4px' }} // Smaller padding for icon button
                title="Logout"
              >
                <FiLogOut size={20} />
              </button>
            )}
          </div>
        )}

        {/* Collapsed Mode: Icons stacked below user */}
        {!isExpanded && user && (
          <button
            onClick={handleLogout}
            style={{ ...buttonStyle, width: '100%', marginBottom: '8px' }}
            title="Logout"
          >
            <FiLogOut size={20} />
          </button>
        )}

        {/* Theme and Archive Toggles */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: isExpanded ? 'flex-start' : 'center', // Align left when expanded
          alignItems: 'center',
          gap: '10px', // Gap between theme and archive
          flexDirection: isExpanded ? 'row' : 'column', // Stack when collapsed
        }}>
          <button
            onClick={toggleTheme}
            style={{ ...buttonStyle, ...(isExpanded ? {} : {width: '100%', marginBottom: '8px'}) }}
            title={theme === 'light' ? "Mudar para Tema Escuro" : "Mudar para Tema Claro"}
          >
            {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>

          {user && (
            <button
              onClick={handleToggleArchivedPanel}
              style={{ ...buttonStyle, ...(isExpanded ? {} : {width: '100%'}) }}
              title="Sessões Arquivadas"
            >
              <FiTrash2 size={20} />
            </button>
          )}
        </div>
      </div>
    </div>

    {showArchivedPanel && user && (
      <div style={archivedPanelStyle}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
          <h4 style={{margin:0, fontSize: '1.1rem'}}>Sessões Arquivadas</h4>
          <button onClick={() => setShowArchivedPanel(false)} style={{...buttonStyle, fontSize:'1.2rem', padding:'4px'}} title="Fechar">
            &times;
          </button>
        </div>
        {loadingArchived && <p>Carregando arquivadas...</p>}
        {!loadingArchived && archivedSessions.length === 0 && <p>Nenhuma sessão arquivada.</p>}
        {!loadingArchived && archivedSessions.length > 0 && (
          <ul style={archivedListStyle}>
            {archivedSessions.map(session => (
              <li key={session.id} style={archivedItemStyle}>
                <span style={{...textStyle, flexGrow: 1, marginRight: '10px'}} title={formatSessionDisplayName(session)}>
                  {formatSessionDisplayName(session)}
                </span>
                <FiUploadCloud
                  size={18}
                  style={{...editIconStyle, color: 'var(--color-accent)'}}
                  onClick={() => handleUnarchiveAndSelect(session.id)}
                  title="Restaurar Sessão"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    )}
    </>
  );
};

Sidebar.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Sidebar;
