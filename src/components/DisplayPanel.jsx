import React from 'react';

const DisplayPanel = () => {
  const panelStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    // backgroundColor: 'var(--color-background-primary)', // O pai (MainContentLayout) já define
    color: 'var(--color-text-primary)',
    padding: '10px', // Adicionado padding interno ao painel
    boxSizing: 'border-box'
  };

  return (
    <div style={panelStyle}>
      <h2>Display</h2>
      {/* Conteúdo do display (HTML/Markdown) aqui */}
      <p>Conteúdo renderizado (HTML, Markdown) será exibido aqui.</p>
    </div>
  );
};

export default DisplayPanel;
