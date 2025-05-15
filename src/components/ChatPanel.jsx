import React from 'react';

const ChatPanel = () => {
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
      <h2>Chat</h2>
      {/* Conteúdo do chat aqui */}
      <p>Interface de chat para interagir com o agente Fanya.</p>
    </div>
  );
};

export default ChatPanel;
