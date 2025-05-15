import { useState } from 'react'; // Adicionado useState
import './App.css';
import Sidebar from './components/Sidebar';
import MainContentLayout from './components/MainContentLayout';
import { useAuth } from './contexts/AuthContext';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared'; // ThemeSupa ainda é útil
import { supabase } from './services/supabaseClient';
// Removida a importação explícita do CSS, confiando que ThemeSupa lida com isso.
import { useTheme } from './contexts/ThemeContext'; // Para aplicar o tema do app

function App() {
  const { session } = useAuth();
  const { theme } = useTheme(); // Obter o tema atual

  if (!session) {
    return (
      <div className={`app ${theme}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ width: '320px' /* ou o tamanho desejado para o widget de auth */ }}>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }} // Pode ser personalizado depois para combinar com os temas
            providers={['google', 'email']} // Adicionado 'google'
            // theme={theme === 'dark' ? 'dark' : 'default'} // Tenta sincronizar o tema do Auth UI
            // Configurações para auto-confirmação e redirecionamento podem ser necessárias
            // dependendo de como o Supabase está configurado no backend.
            // Por padrão, o Auth UI lida bem com o fluxo de criação/login.
          />
        </div>
      </div>
    );
  }

  // O estado de isSidebarCollapsed e toggleSidebar precisa ser gerenciado aqui
  // ou movido para um contexto se Sidebar e MainContentLayout precisarem interagir com ele de forma mais complexa.
  // Por enquanto, vamos simplificar e assumir que Sidebar gerencia seu próprio estado ou recebe props fixas.
  // Para o layout funcionar como antes, precisamos do estado de colapso da sidebar.
  // Vamos adicionar um estado simples aqui por enquanto.
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);


  return (
    <div className={`app ${theme}`} style={{ display: 'flex', height: '100vh' }}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <MainContentLayout isSidebarCollapsed={isSidebarCollapsed} />
    </div>
  );
}

export default App;
