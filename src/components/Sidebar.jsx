import React from 'react'; // Removido useState daqui, pois não é usado diretamente no corpo do componente Sidebar
import PropTypes from 'prop-types'; // Adicionado PropTypes
import { FiUser, FiMessageSquare, FiLogOut, FiChevronsLeft, FiChevronsRight, FiSun, FiMoon, FiLayout, FiTerminal } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext'; // Importar useAuth
import '../App.css'; // Para estilos globais, se houver

const Sidebar = ({ isCollapsed: propIsCollapsed, toggleSidebar: propToggleSidebar }) => {
  // Se App.jsx gerencia o estado de colapso, usamos as props.
  // Caso contrário, podemos ter um estado local como fallback ou para componentes independentes.
  // Para este exemplo, vamos assumir que App.jsx controla o estado.
  // Se propIsCollapsed e propToggleSidebar não forem passados, precisaria de estado local.
  const isExpanded = !propIsCollapsed; 
  const toggleSidebar = propToggleSidebar;

  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth(); // Obter usuário e função signOut
  const displayName = user ? (user.user_metadata?.full_name || user.user_metadata?.name || user.email) : '';

  const handleLogout = async () => {
    await signOut();
    // O onAuthStateChange no AuthContext cuidará de redirecionar/atualizar a UI
  };

  // Ícones para os itens da sidebar (apenas exemplos)
  const menuItems = [
    { id: 'chat', name: 'Chat', icon: <FiMessageSquare size={24} /> },
    { id: 'display', name: 'Display', icon: <FiLayout size={24} /> },
    { id: 'console', name: 'Console', icon: <FiTerminal size={24} /> },
  ];

  const sidebarStyle = {
    width: isExpanded ? '250px' : '60px',
    backgroundColor: 'var(--color-background-primary)',
    color: 'var(--color-text-primary)',
    padding: '10px',
    transition: 'width 0.3s ease, background-color 0.3s ease, color 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: isExpanded ? 'flex-start' : 'center',
    borderRight: '1px solid var(--color-highlight)',
    height: '100vh',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-primary)',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // Para que o botão ocupe a largura
    boxSizing: 'border-box'
  };

  const menuItemStyle = {
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
    width: '100%',
    boxSizing: 'border-box',
    color: 'var(--color-text-primary)', // Garante que o texto do item use a cor correta
  };

  const iconStyle = {
    marginRight: isExpanded ? '10px' : '0',
    flexShrink: 0
  };

  return (
    <div style={sidebarStyle} className={`sidebar ${!isExpanded ? 'collapsed' : 'expanded'} ${theme}`}>
      <button onClick={toggleSidebar} style={{ ...buttonStyle, alignSelf: isExpanded ? 'flex-end' : 'center', marginBottom: '20px' }}>
        {isExpanded ? <FiChevronsLeft /> : <FiChevronsRight />}
      </button>

      {/* Itens de Navegação */}
      <nav style={{ width: '100%', flexGrow: 1 /* Para empurrar o rodapé para baixo */ }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {menuItems.map(item => (
            <li key={item.id} title={!isExpanded ? item.name : ''} style={menuItemStyle}>
              <a href={`#${item.id}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', width: '100%' }}>
                <span style={iconStyle}>{item.icon}</span>
                {isExpanded && <span>{item.name}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Rodapé da Sidebar: Informações do Usuário e Controles */}
      <div style={{ 
        marginTop: 'auto', 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', // Empilha UserInfo e ControlsContainer
        alignItems: 'center', 
        paddingBottom: '10px'
      }}>
        {/* Informações do Usuário (Movido para cá) */}
        {user && (
          <div 
            style={{ 
              ...menuItemStyle, // Reutiliza estilo base para padding, etc.
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: isExpanded ? 'flex-start' : 'center', 
              width: '100%', 
              marginBottom: '10px', // Espaço antes dos botões de controle
              paddingLeft: isExpanded ? '8px' : '0', // Ajusta padding para centralizar ícone quando colapsado
              paddingRight: isExpanded ? '8px' : '0',
            }} 
            title={user.email} // Tooltip com o email completo
          >
            <FiUser size={24} style={{ marginRight: isExpanded ? '10px' : '0', flexShrink: 0 }} />
            {isExpanded && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</span>}
          </div>
        )}

        {/* Container dos Botões de Controle (Tema e Logout) */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: isExpanded ? 'row' : 'column', // Linha se expandido, coluna se colapsado
          justifyContent: isExpanded ? 'space-evenly' : 'center',
          alignItems: 'center',
        }}>
          {/* Botão de Tema */}
          <button
            onClick={toggleTheme}
            style={{ 
              ...buttonStyle, 
              width: 'auto', 
              padding: '8px', 
              ...(isExpanded ? {} : { marginBottom: '8px' }) // Margem abaixo quando colapsado e em coluna
            }}
            title={theme === 'light' ? "Mudar para Tema Escuro" : "Mudar para Tema Claro"}
          >
            {theme === 'light' ? <FiMoon size={24} /> : <FiSun size={24} />}
          </button>

          {/* Botão de Logout */}
          {user && (
            <button
              onClick={handleLogout}
              style={{ 
                ...buttonStyle, 
                width: 'auto', 
                padding: '8px', 
                ...(isExpanded ? { marginLeft: '10px' } : { marginLeft: '0' }) // Margem à esquerda só se expandido e em linha
              }}
              title="Logout"
            >
              <FiLogOut size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Adicionando PropTypes para as props que vêm de App.jsx
Sidebar.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Sidebar;
