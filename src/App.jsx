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
import { SessionProvider } from './contexts/SessionContext'; // Importar SessionProvider

function App() {
  const { session } = useAuth();
  const { theme } = useTheme(); // Obter o tema atual

  // Definições de localização para Português (Brasil)
  const ptBR = {
    sign_up: {
      email_label: 'Seu e-mail',
      password_label: 'Crie uma senha',
      email_input_placeholder: 'exemplo@email.com',
      password_input_placeholder: 'Sua senha segura',
      button_label: 'Cadastrar',
      loading_button_label: 'Cadastrando...',
      social_provider_text: 'Entrar com {{provider}}',
      link_text: 'Não tem uma conta? Cadastre-se',
      confirmation_text: 'Verifique seu e-mail para o link de confirmação.',
      empty_email_address: 'O e-mail não pode ficar em branco.',
      empty_password: 'A senha não pode ficar em branco.',
      password_length_too_short: 'A senha deve ter pelo menos 6 caracteres.',
    },
    sign_in: {
      email_label: 'Seu e-mail',
      password_label: 'Sua senha',
      email_input_placeholder: 'exemplo@email.com',
      password_input_placeholder: 'Sua senha',
      button_label: 'Entrar',
      loading_button_label: 'Entrando...',
      social_provider_text: 'Entrar com {{provider}}',
      link_text: 'Já tem uma conta? Entre',
    },
    magic_link: {
      email_input_label: 'Seu e-mail',
      email_input_placeholder: 'exemplo@email.com',
      button_label: 'Enviar link mágico',
      loading_button_label: 'Enviando...',
      link_text: 'Enviar um link mágico por e-mail',
      confirmation_text: 'Verifique seu e-mail para o link mágico.',
    },
    forgotten_password: {
      email_label: 'Seu e-mail',
      email_input_placeholder: 'exemplo@email.com',
      button_label: 'Enviar instruções',
      loading_button_label: 'Enviando...',
      link_text: 'Esqueceu sua senha?',
      confirmation_text: 'Verifique seu e-mail para o link de redefinição.',
    },
    update_password: {
      password_label: 'Nova senha',
      password_input_placeholder: 'Sua nova senha segura',
      button_label: 'Atualizar senha',
      loading_button_label: 'Atualizando...',
      confirmation_text: 'Sua senha foi atualizada.',
    },
    verify_otp: {
      email_input_label: 'Seu e-mail',
      email_input_placeholder: 'exemplo@email.com',
      phone_input_label: 'Seu telefone',
      phone_input_placeholder: 'Seu número de telefone',
      token_input_label: 'Token',
      token_input_placeholder: 'Seu token OTP',
      button_label: 'Verificar token',
      loading_button_label: 'Verificando...',
    },
    common: {
      password_Mismatch: 'As senhas não correspondem.',
      empty_password: 'A senha não pode ficar em branco.',
      password_length_too_short: 'A senha deve ter pelo menos 6 caracteres.',
    }
  };

  // Customização da aparência
  const customAppearance = {
    theme: ThemeSupa,
    variables: {
      default: {
        colors: {
          brand: 'var(--color-accent)', // Usar a cor de destaque do tema do app
          brandAccent: 'var(--color-accent-hover)',
          defaultButtonBackground: 'var(--color-background-secondary)',
          defaultButtonBackgroundHover: 'var(--color-background-tertiary)',
          defaultButtonBorder: 'var(--color-border)',
          defaultButtonText: 'var(--color-text-primary)',
          inputBackground: 'var(--color-background-secondary)',
          inputBorder: 'var(--color-border)',
          inputBorderHover: 'var(--color-accent)',
          inputBorderFocus: 'var(--color-accent)',
          inputText: 'var(--color-text-primary)',
          inputLabelText: 'var(--color-text-secondary)',
          inputPlaceholder: 'var(--color-text-placeholder)',
          messageText: 'var(--color-text-secondary)',
          messageTextDanger: 'var(--color-danger)',
          anchorTextColor: 'var(--color-accent)',
          anchorTextColorHover: 'var(--color-accent-hover)',
        },
        space: {
          spaceSmall: '8px',
          spaceMedium: '12px',
          spaceLarge: '20px',
          labelBottomMargin: '8px',
          anchorBottomMargin: '8px',
          emailInputSpacing: '8px',
          socialAuthSpacing: '8px',
          buttonPadding: '12px 18px',
          inputPadding: '12px 15px',
        },
        fontSizes: {
          baseBodySize: '1rem', // 16px
          baseInputSize: '1rem',
          baseLabelSize: '0.9rem', // 14.4px
          baseButtonSize: '1rem',
        },
        fonts: {
          bodyFontFamily: 'var(--font-family-sans)',
          buttonFontFamily: 'var(--font-family-sans)',
          inputFontFamily: 'var(--font-family-sans)',
          labelFontFamily: 'var(--font-family-sans)',
        },
        radii: {
          borderRadiusButton: '8px',
          buttonBorderRadius: '8px',
          inputBorderRadius: '8px',
        },
      },
    },
    // Adicionar classes customizadas se necessário para um estilo mais fino
    // className: {
    //   container: 'custom-auth-container',
    //   button: 'custom-auth-button',
    //   input: 'custom-auth-input',
    // },
  };


  if (!session) {
    return (
      <div className={`app ${theme}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px' }}>
        <h1 style={{ marginBottom: '30px', color: 'var(--color-text-primary)', fontSize: '2.5rem', fontWeight: '600' }}>
          Bem-vindo ao Fanya
        </h1>
        <div style={{ width: '100%', maxWidth: '420px', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'var(--color-background-primary)' }}>
          <Auth
            supabaseClient={supabase}
            appearance={customAppearance}
            localization={{ variables: ptBR }}
            providers={['google', 'email']} // Ensures Google and Email/Password form are options
            view="sign_in" // Explicitly set the default view to sign-in
            socialLayout="horizontal" // Botões sociais lado a lado
            theme={theme === 'dark' ? 'dark' : 'default'} // Explicitly set ThemeSupa's theme
            onlyThirdPartyProviders={false} // Ensures email/password form is shown
            showLinks={true} // Ensure links like "Forgot password?" and "Don't have an account?" are shown
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
    <SessionProvider> {/* Envolver a parte autenticada com SessionProvider */}
      <div className={`app ${theme}`} style={{ display: 'flex', height: '100vh' }}>
        <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
        <MainContentLayout isSidebarCollapsed={isSidebarCollapsed} />
      </div>
    </SessionProvider>
  );
}

export default App;
