import React from 'react';

const ConsolePanel = () => {
  const panelStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    // backgroundColor: 'var(--color-background-primary)', // O pai (MainContentLayout) já define
    color: 'var(--color-text-primary)',
    padding: '10px', // Adicionado padding interno ao painel
    boxSizing: 'border-box',
    fontFamily: 'monospace', // Fonte monoespaçada para console
    fontSize: '0.9em'
  };

  return (
    <div style={panelStyle}>
      <h2>Console</h2>
      {/* Conteúdo do console aqui */}
      <p>Logs e mensagens do sistema serão exibidos aqui.</p>
    </div>
  );
};

export default ConsolePanel;
