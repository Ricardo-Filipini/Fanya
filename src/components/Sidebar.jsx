import React, { useState } from 'react';
import { FiMenu, FiUser, FiMessageSquare, FiSettings, FiLogOut, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi'; // Ícones de exemplo

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div style={{
      width: isExpanded ? '250px' : '60px',
      backgroundColor: '#f0f0f0',
      padding: '10px',
      transition: 'width 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: isExpanded ? 'flex-start' : 'center',
      borderRight: '1px solid #ccc'
    }}>
      <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', fontSize: '1.5rem', marginBottom: '20px', cursor: 'pointer', alignSelf: 'flex-end' }}>
        {isExpanded ? <FiChevronsLeft /> : <FiChevronsRight />}
      </button>

      <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
        <FiUser size={24} style={{ marginRight: isExpanded ? '10px' : '0' }} />
        {isExpanded && <span>Info Usuário</span>}
      </div>
      <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
        <FiMessageSquare size={24} style={{ marginRight: isExpanded ? '10px' : '0' }} />
        {isExpanded && <span>Lista de Sessões</span>}
      </div>
      <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
        <FiSettings size={24} style={{ marginRight: isExpanded ? '10px' : '0' }} />
        {isExpanded && <span>Seletor de Tema</span>}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center' }}> {/* Empurra o logout para baixo */}
        <FiLogOut size={24} style={{ marginRight: isExpanded ? '10px' : '0' }} />
        {isExpanded && <span>Logout</span>}
      </div>
    </div>
  );
};

export default Sidebar;
