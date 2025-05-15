import React, { useState } from 'react';
import { FiUser, FiMessageSquare, FiLogOut, FiChevronsLeft, FiChevronsRight, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { theme, toggleTheme } = useTheme();

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

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
    height: '100vh', // Garante que a sidebar ocupe toda a altura
    boxSizing: 'border-box' // Para que padding e border não aumentem o tamanho total
  };

  const buttonStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-primary)',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '5px', // Adiciona um pouco de padding para facilitar o clique
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const menuItemStyle = {
    marginBottom: '20px', // Aumenta o espaçamento entre itens
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer', // Adiciona cursor pointer para indicar interatividade
    padding: '8px', // Adiciona padding para melhor área de clique
    borderRadius: '4px', // Bordas arredondadas
    width: '100%', // Para que o hover ocupe toda a largura
    boxSizing: 'border-box'
  };

  const menuItemHoverStyle = {
    // Estilos de hover podem ser adicionados via CSS global ou classes
    // backgroundColor: 'var(--color-highlight)',
    // color: 'var(--color-background-primary)'
  };


  return (
    <div style={sidebarStyle}>
      <button onClick={toggleSidebar} style={{ ...buttonStyle, alignSelf: isExpanded ? 'flex-end' : 'center', marginBottom: '20px' }}>
        {isExpanded ? <FiChevronsLeft /> : <FiChevronsRight />}
      </button>

      <div style={menuItemStyle} title="Informações do Usuário">
        <FiUser size={24} style={{ marginRight: isExpanded ? '10px' : '0', flexShrink: 0 }} />
        {isExpanded && <span>Info Usuário</span>}
      </div>
      <div style={menuItemStyle} title="Lista de Sessões">
        <FiMessageSquare size={24} style={{ marginRight: isExpanded ? '10px' : '0', flexShrink: 0 }} />
        {isExpanded && <span>Sessões</span>}
      </div>

      {/* Botão de Tema */}
      <button onClick={toggleTheme} style={{ ...buttonStyle, ...menuItemStyle, width: isExpanded ? '100%' : 'auto' }} title={theme === 'light' ? "Mudar para Tema Escuro" : "Mudar para Tema Claro"}>
        {theme === 'light' ? <FiMoon size={24} style={{ marginRight: isExpanded ? '10px' : '0', flexShrink: 0 }} /> : <FiSun size={24} style={{ marginRight: isExpanded ? '10px' : '0', flexShrink: 0 }} />}
        {isExpanded && (theme === 'light' ? <span>Tema Escuro</span> : <span>Tema Claro</span>)}
      </button>

      {/* Logout empurrado para baixo */}
      <div style={{ ...menuItemStyle, marginTop: 'auto' }} title="Logout">
        <FiLogOut size={24} style={{ marginRight: isExpanded ? '10px' : '0', flexShrink: 0 }} />
        {isExpanded && <span>Logout</span>}
      </div>
    </div>
  );
};

export default Sidebar;
