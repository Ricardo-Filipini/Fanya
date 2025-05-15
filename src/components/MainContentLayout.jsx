import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ChatPanel from './ChatPanel';
import ConsolePanel from './ConsolePanel';
import DisplayPanel from './DisplayPanel';

const MainContentLayout = () => {
  // O "ponto central" para redimensionamento 2D simultâneo é complexo
  // e não é suportado nativamente por react-resizable-panels.
  // Implementaremos os redimensionadores lineares.

  const panelStyle = {
    padding: '10px',
    border: '1px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'auto', // Para caso o conteúdo exceda o painel
  };

  const resizeHandleStyle = {
    width: '8px', // Largura do divisor horizontal
    height: '8px', // Altura do divisor vertical
    backgroundColor: '#c0c0c0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  
  // Estilo específico para o divisor vertical entre as colunas principais
  const verticalResizeHandleStyle = {
    ...resizeHandleStyle,
    width: '8px', // Largura do divisor
    margin: '0 2px', // Pequena margem para não colar nos painéis
  };

  // Estilo específico para o divisor horizontal entre Chat e Console
  const horizontalResizeHandleStyle = {
    ...resizeHandleStyle,
    height: '8px', // Altura do divisor
    margin: '2px 0', // Pequena margem
  };


  return (
    <div style={{ flexGrow: 1, height: '100%', display: 'flex' }}>
      <PanelGroup direction="horizontal" style={{ width: '100%', height: '100%' }}>
        <Panel defaultSize={50} minSize={20}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={70} minSize={20} style={panelStyle}>
              <ChatPanel />
            </Panel>
            <PanelResizeHandle style={horizontalResizeHandleStyle} />
            <Panel defaultSize={30} minSize={10} style={panelStyle}>
              <ConsolePanel />
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle style={verticalResizeHandleStyle} />
        <Panel defaultSize={50} minSize={20} style={panelStyle}>
          <DisplayPanel />
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default MainContentLayout;
