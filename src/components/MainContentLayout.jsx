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
    // border: '1px solid var(--color-highlight)', // Removida a borda dos painéis internos
    backgroundColor: 'var(--color-background-primary)', // Usando variável de tema
    color: 'var(--color-text-primary)', // Usando variável de tema
    display: 'flex',
    flexDirection: 'column', // Para que o conteúdo interno possa se expandir
    // alignItems: 'center', // Removido para permitir que o conteúdo interno defina seu alinhamento
    // justifyContent: 'center', // Removido para permitir que o conteúdo interno defina seu alinhamento
    overflow: 'auto', // Para caso o conteúdo exceda o painel
    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease', // Transição suave
  };

  const resizeHandleStyle = {
    backgroundColor: 'var(--color-grid-handle)', // Usando nova variável de tema para cor cinza
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.3s ease', // Transição suave
    position: 'relative', // Para posicionar o grabber
  };

  const grabberStyle = {
    width: '10px',
    height: '10px',
    borderRadius: '3px',
    backgroundColor: 'var(--color-grid-grabber)', // Usando nova variável de tema para o pegador
  };

  const mainGrabberStyle = { // Estilo para o pegador maior na interseção principal
    width: '14px', // Maior
    height: '14px', // Maior
    borderRadius: '4px', // Um pouco mais arredondado
    backgroundColor: 'var(--color-grid-grabber)',
  };

  const intersectionNubStyle = { // Estilo para o novo "nub" na interseção T
    width: '12px',
    height: '12px',
    borderRadius: '3px',
    backgroundColor: 'var(--color-grid-grabber)',
    position: 'absolute',
    right: '-4px', // Posiciona para centralizar na linha vertical do divisor (12px nub - 4px handle / 2 = 4px offset)
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 1, // Para garantir que fique sobre o handle
  };
  
  // Estilo específico para o divisor vertical entre as colunas principais
  const verticalResizeHandleStyle = {
    ...resizeHandleStyle,
    width: '4px', // Largura do divisor reduzida
    margin: '0 1px', // Margem ajustada
  };

  // Estilo específico para o divisor horizontal entre Chat e Console
  const horizontalResizeHandleStyle = {
    ...resizeHandleStyle,
    height: '4px', // Altura do divisor reduzida
    margin: '1px 0', // Margem ajustada
  };


  return (
    <div style={{ flexGrow: 1, height: '100%', display: 'flex' }}>
      <PanelGroup direction="horizontal" style={{ width: '100%', height: '100%' }}>
        <Panel defaultSize={50} minSize={1}> {/* minSize ainda mais reduzido */}
          <PanelGroup direction="vertical">
            <Panel defaultSize={70} minSize={1} style={panelStyle}> {/* minSize ainda mais reduzido */}
              <ChatPanel />
            </Panel>
            <PanelResizeHandle style={horizontalResizeHandleStyle}>
              <div style={grabberStyle} /> {/* Pegador central no handle horizontal */}
              <div style={intersectionNubStyle} /> {/* Novo pegador na junção T */}
            </PanelResizeHandle>
            <Panel defaultSize={30} minSize={1} style={panelStyle}> {/* minSize ainda mais reduzido */}
              <ConsolePanel />
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle style={verticalResizeHandleStyle}>
          <div style={mainGrabberStyle} /> {/* Usando o pegador maior */}
        </PanelResizeHandle>
        <Panel defaultSize={50} minSize={1} style={panelStyle}> {/* minSize ainda mais reduzido */}
          <DisplayPanel />
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default MainContentLayout;
