import React, { useState, useContext, useRef, useEffect } from 'react';
import { IoMdSend, IoMdRefresh } from 'react-icons/io';
import { FaCopy, FaThumbtack } from 'react-icons/fa';
import { FiEdit2 } from 'react-icons/fi'; // Added Edit Icon
import ReactMarkdown from 'react-markdown';
import { AuthContext } from '../contexts/AuthContext';
import { SessionContext } from '../contexts/SessionContext';
import { supabase } from '../services/supabaseClient';

const ChatPanel = () => {
  const [chatInput, setChatInput] = useState('');
  const [markedContextMessages, setMarkedContextMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isAgentReplying, setIsAgentReplying] = useState(false); // For loading indicator
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentSessionTitle, setCurrentSessionTitle] = useState('');


  const { user } = useContext(AuthContext);
  const { activeSessionId, setActiveSessionId, sessionsList, updateSessionName } = useContext(SessionContext);

  const activeSession = sessionsList.find(s => s.id === activeSessionId);

  useEffect(() => {
    if (activeSession) {
      setCurrentSessionTitle(activeSession.name || "Nova Conversa");
    } else {
      setCurrentSessionTitle("");
    }
    setIsEditingTitle(false); // Reset editing state when session changes
  }, [activeSessionId, sessionsList, activeSession]);


  console.log('[ChatPanel] Initial activeSessionId from context:', activeSessionId); // DEBUG

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // --- Estilos (mantidos como antes, podem precisar de ajustes com o novo conteúdo) ---
  const panelStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    color: 'var(--color-text-primary)',
    padding: '10px',
    boxSizing: 'border-box',
    gap: '10px',
  };

  const messagesContainerStyle = {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '10px',
    border: '1px solid var(--color-border-light)',
    borderRadius: '6px',
    backgroundColor: 'var(--color-background-primary-muted)',
    display: 'flex', // Added for alignSelf to work
    flexDirection: 'column', // Added for messages to stack vertically
  };

  const messageStyle = (senderRole) => {
    const baseStyle = {
      marginBottom: '12px',
      padding: '10px 15px',
      borderRadius: '10px',
      maxWidth: '80%',
      wordWrap: 'break-word',
      alignSelf: senderRole === 'user' ? 'flex-end' : 'flex-start',
      marginLeft: senderRole === 'user' ? 'auto' : '0',
      marginRight: senderRole === 'user' ? '0' : 'auto',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    };

    if (senderRole === 'user') {
      return {
        ...baseStyle,
        backgroundColor: 'var(--user-message-background-color, #4A5568)', // Fallback to a neutral dark gray
        color: 'var(--user-message-text-color, #FFFFFF)', // Fallback to white text
        // border: '1px solid var(--user-message-border-color, var(--color-text-secondary))', // Border removed for now, focusing on background
      };
    } else { // Agent or System messages
      return {
        ...baseStyle,
        backgroundColor: 'var(--color-accent-chat-agent)', // Existing agent style
        color: 'var(--color-text-primary)',
      };
    }
  };

  const messageMetaStyle = {
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)',
    marginTop: '5px',
    textAlign: 'right',
  };

  const messageActionsStyle = {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
    justifyContent: 'flex-end',
  };

  const actionIconStyle = (isMarked) => ({
    cursor: 'pointer',
    color: isMarked ? 'var(--color-accent-strong)' : 'var(--color-icon-action)',
    fontSize: '0.9rem',
  });
  
  const chatInputAreaStyle = {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    padding: '8px',
    borderTop: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-secondary)',
  };

  const textareaStyle = {
    flexGrow: 1,
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid var(--color-border-input)',
    backgroundColor: 'var(--color-background-input)',
    color: 'var(--color-text-input)',
    fontSize: '1rem',
    lineHeight: '1.5',
    resize: 'none',
    overflowY: 'hidden',
    minHeight: '24px', // Corresponds to roughly one line with padding
    maxHeight: '250px', // Adjusted maxHeight
  };

  const sendButtonStyle = {
    padding: '10px 15px',
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-text-button)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '44px',
  };

  const chatHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between', // To space title and edit icon
    padding: '8px 12px',
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-secondary)', // Or another appropriate color
    minHeight: '40px', // Ensure header has some height
  };

  const chatTitleStyle = {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    margin: 0,
    flexGrow: 1, // Allow title to take space
  };

  const titleInputStyle = {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--color-text-input)',
    backgroundColor: 'var(--color-background-input)',
    border: '1px solid var(--color-border-input)',
    borderRadius: '4px',
    padding: '4px 8px',
    flexGrow: 1,
  };

  const editTitleIconStyle = {
    cursor: 'pointer',
    color: 'var(--color-icon-action)',
    marginLeft: '10px', // Space from title
  };


  // --- Funções de Ação ---
  const handleCopyMessage = async (messageContent) => {
    try {
      await navigator.clipboard.writeText(messageContent);
      console.log('Mensagem copiada!');
    } catch (err) {
      console.error('Falha ao copiar mensagem:', err);
    }
  };

  const handleToggleMarkContext = (messageObject) => {
    setMarkedContextMessages(prevMarked => {
      const isAlreadyMarked = prevMarked.some(msg => msg.id === messageObject.id);
      if (isAlreadyMarked) {
        return prevMarked.filter(msg => msg.id !== messageObject.id);
      } else {
        return [...prevMarked, { id: messageObject.id, sender_role: messageObject.sender_role, content: messageObject.content }];
      }
    });
  };

  const handleResendUserMessage = (messageContent) => {
    setChatInput(messageContent);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // --- Efeitos ---
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = parseFloat(getComputedStyle(textareaRef.current).maxHeight);
      if (scrollHeight > maxHeight) {
        textareaRef.current.style.height = `${maxHeight}px`;
        textareaRef.current.style.overflowY = 'auto';
      } else {
        textareaRef.current.style.height = `${scrollHeight}px`;
        textareaRef.current.style.overflowY = 'hidden';
      }
    }
  }, [chatInput]);

  useEffect(() => {
    const fetchMessages = async () => {
      console.log('[ChatPanel] fetchMessages triggered. activeSessionId:', activeSessionId); // DEBUG
      if (!activeSessionId) {
        console.log('[ChatPanel] No activeSessionId, clearing messages.'); // DEBUG
        setMessages([]);
        setMarkedContextMessages([]);
        return;
      }
      setLoadingMessages(true);
      try {
        console.log(`[ChatPanel] Fetching messages for session_id: ${activeSessionId}`); // DEBUG
        const { data: rawMessages, error } = await supabase
          .from('n8n_chat')
          .select('id, message, session_id')
          .eq('session_id', activeSessionId)
          .order('id', { ascending: true });

        if (error) {
          console.error('[ChatPanel] Supabase error fetching messages:', error); // DEBUG
          throw error;
        }

        console.log('[ChatPanel] Raw messages from Supabase:', rawMessages); // DEBUG

        const parsedMessages = rawMessages.map((row, index) => {
          console.log(`[ChatPanel] Parsing message ${index + 1}, id: ${row.id}, raw content:`, row.message); // DEBUG
          try {
            const messageJson = typeof row.message === 'string' ? JSON.parse(row.message) : row.message;
            let senderRole = 'agent';
            let content = '';

            if (messageJson.type === 'human') {
              senderRole = 'user';
              content = messageJson.content || ''; // CORRECTED: was messageJson.input
              console.log(`[ChatPanel] Parsed as HUMAN: role=${senderRole}, content=${content.substring(0,50)}...`); // DEBUG
            } else if (messageJson.type === 'ai') {
              senderRole = 'agent';
              if (typeof messageJson.content === 'string') {
                try {
                  const aiContentParsed = JSON.parse(messageJson.content);
                  content = aiContentParsed?.output?.response_content?.content || 'Não foi possível extrair a resposta da IA.';
                  console.log(`[ChatPanel] Parsed as AI (from string): role=${senderRole}, content=${content.substring(0,50)}...`); // DEBUG
                } catch (e) {
                  console.error('[ChatPanel] Error parsing inner AI message content (string):', e, messageJson.content); // DEBUG
                  content = 'Erro ao processar mensagem da IA.';
                }
              } else {
                 content = messageJson.content?.output?.response_content?.content || 'Estrutura de IA inesperada.';
                 console.log(`[ChatPanel] Parsed as AI (from object): role=${senderRole}, content=${content.substring(0,50)}...`); // DEBUG
              }
            } else {
              console.warn('[ChatPanel] Unknown message type:', messageJson.type, row); // DEBUG
              content = 'Mensagem de tipo desconhecido.';
            }
            
            return {
              id: row.id,
              sender_role: senderRole,
              content: content,
            };
          } catch (e) {
            console.error('[ChatPanel] Critical error parsing message JSON from DB:', e, row.message); // DEBUG
            return {
              id: row.id,
              sender_role: 'system',
              content: `Erro ao processar mensagem ID: ${row.id}. Verifique o console.`,
            };
          }
        }).filter(Boolean);

        console.log('[ChatPanel] Parsed messages for display:', parsedMessages); // DEBUG
        setMessages(parsedMessages);
        setMarkedContextMessages([]);
      } catch (error) {
        console.error('[ChatPanel] Error in fetchMessages catch block:', error); // DEBUG
        setMessages([]);
      } finally {
        setLoadingMessages(false);
        console.log('[ChatPanel] fetchMessages finished.'); // DEBUG
      }
    };
    fetchMessages();

    // --- Supabase Realtime Subscription for Chat Messages ---
    let chatChannel;
    if (activeSessionId) {
      console.log(`[ChatPanel] Realtime: Setting up chat message subscription for session ${activeSessionId}`);
      chatChannel = supabase
        .channel(`chat-session-${activeSessionId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT', // Only listen for new messages
            schema: 'public',
            table: 'n8n_chat',
            filter: `session_id=eq.${activeSessionId}`,
          },
          (payload) => {
            console.log('[ChatPanel] Realtime: Nova mensagem de chat recebida!', payload);
            // It's often better to re-fetch all messages to ensure order and handle potential missed messages
            // or simply append the new message if confident about the data structure and order.
            // For simplicity and robustness, re-fetching is safer.
            // However, to make it more "real-time" feeling, we can try to append.
            // This assumes the payload.new contains the fully formed message as expected by the parsing logic.

            const newMessage = payload.new;
            if (newMessage && newMessage.message) {
                console.log(`[ChatPanel] Realtime: Parsing new message id: ${newMessage.id}, raw content:`, newMessage.message); // DEBUG
                try {
                  const messageJson = typeof newMessage.message === 'string' ? JSON.parse(newMessage.message) : newMessage.message;
                  let senderRole = 'agent';
                  let content = '';
      
                  if (messageJson.type === 'human') {
                    senderRole = 'user';
                    content = messageJson.content || ''; // CORRECTED: was messageJson.input
                  } else if (messageJson.type === 'ai') {
                    senderRole = 'agent';
                    if (typeof messageJson.content === 'string') {
                      try {
                        const aiContentParsed = JSON.parse(messageJson.content);
                        content = aiContentParsed?.output?.response_content?.content || 'Não foi possível extrair a resposta da IA.';
                      } catch (e) {
                        content = 'Erro ao processar mensagem da IA (realtime).';
                      }
                    } else {
                       content = messageJson.content?.output?.response_content?.content || 'Estrutura de IA inesperada (realtime).';
                    }
                  } else {
                    content = 'Mensagem de tipo desconhecido (realtime).';
                  }
                  
                  const parsedNewMessage = {
                    id: newMessage.id, // Use the ID from the database
                    sender_role: senderRole,
                    content: content,
                  };
                  
                  // Avoid adding duplicates if optimistic update already added a temp message
                  // This check is basic; more robust de-duplication might be needed if N8N could send
                  // the same message content that was optimistically added.
                  // For now, we assume IDs from DB are unique and different from temp IDs.
                  setMessages(prevMessages => {
                    if (prevMessages.find(msg => msg.id === parsedNewMessage.id)) {
                      return prevMessages; // Already exists
                    }
                    return [...prevMessages, parsedNewMessage];
                  });

                } catch (e) {
                  console.error('[ChatPanel] Realtime: Erro ao parsear nova mensagem JSON:', e, newMessage.message);
                  // Fallback to re-fetching all messages on error
                  fetchMessages();
                }
            } else {
                // If payload is not as expected, fall back to fetching all messages
                console.warn('[ChatPanel] Realtime: Payload da nova mensagem inesperado, recarregando todas as mensagens.');
                fetchMessages();
            }
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log(`[ChatPanel] Realtime: Conectado ao canal de chat para sessão ${activeSessionId}!`);
          }
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error(`[ChatPanel] Realtime: Erro no canal de chat para sessão ${activeSessionId}.`, err);
          }
          if (status === 'CLOSED') {
            console.log(`[ChatPanel] Realtime: Canal de chat para sessão ${activeSessionId} fechado.`);
          }
        });
    }

    // Cleanup function
    return () => {
      if (chatChannel) {
        console.log(`[ChatPanel] Realtime: Removendo subscrição do canal de chat para sessão ${activeSessionId}.`);
        supabase.removeChannel(chatChannel);
      }
    };
    // --- End Realtime Subscription ---

  }, [activeSessionId]); // Re-subscribe when activeSessionId changes

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleInputChange = (event) => {
    setChatInput(event.target.value);
  };

  const handleSendMessage = async () => {
    const currentMessageContent = chatInput.trim();
    if (!currentMessageContent) return;
    if (!user || !user.id) {
      console.error("[ChatPanel] SendMessage: User not authenticated."); // DEBUG
      alert("Erro: Usuário não autenticado para enviar mensagem.");
      return;
    }

    const userId = user.id;
    let sessionIdForRequest = activeSessionId;
    console.log(`[ChatPanel] handleSendMessage: Initial activeSessionId = ${activeSessionId}, userId = ${userId}`); // DEBUG

    const optimisticUserMessage = {
      id: `temp-${Date.now()}`,
      sender_role: 'user',
      content: currentMessageContent,
      // session_id: sessionIdForRequest, // Not needed for local rendering, but useful for context
    };
    
    setIsAgentReplying(true); // Start loading indicator
    // Add optimistic user message immediately
    setMessages(prevMessages => [...prevMessages, optimisticUserMessage]);
    setChatInput(''); // Clear input after adding optimistic message
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height for next input
      textareaRef.current.style.overflowY = 'hidden';
    }

    try {
      if (!sessionIdForRequest) {
        console.log("[ChatPanel] handleSendMessage: No active session. Attempting to create a new one."); // DEBUG
        const { data: newSession, error: sessionError } = await supabase
          .from('sessions')
          .insert([{ user_id: userId, name: "Nova Conversa" }]) // UPDATED NAME
          .select('id')
          .single();

        if (sessionError) {
          console.error("[ChatPanel] handleSendMessage: Error creating new session:", sessionError); // DEBUG
          throw new Error(`Erro ao criar sessão: ${sessionError.message}`);
        }
        if (!newSession || !newSession.id) {
          console.error("[ChatPanel] handleSendMessage: New session ID not returned from Supabase."); // DEBUG
          throw new Error('ID da nova sessão não retornado.');
        }
        
        sessionIdForRequest = newSession.id;
        console.log(`[ChatPanel] handleSendMessage: New session CREATED with ID: ${sessionIdForRequest}. Setting it as active.`); // DEBUG
        setActiveSessionId(sessionIdForRequest); // This will trigger fetchMessages if successful
      } else {
        console.log(`[ChatPanel] handleSendMessage: Using existing activeSessionId: ${sessionIdForRequest}`); // DEBUG
      }
      
      // Optimistic user message is already added above

      let contextInputString = null;
      if (markedContextMessages.length > 0) {
        contextInputString = JSON.stringify(
          markedContextMessages.map(msg => ({ role: msg.sender_role, content: msg.content }))
        );
      }

      const webhookUrl = new URL('http://localhost:5678/webhook/Fanya');
      webhookUrl.searchParams.append('chatInput', currentMessageContent);
      webhookUrl.searchParams.append('session_id', sessionIdForRequest);
      webhookUrl.searchParams.append('user_id', userId);
      if (contextInputString) {
        webhookUrl.searchParams.append('contextInput', contextInputString);
      }
      
      console.log(`[ChatPanel] handleSendMessage: Calling N8N webhook: ${webhookUrl.toString()}`); // DEBUG

      const response = await fetch(webhookUrl.toString(), { method: 'GET' }); // N8N usually expects POST for data, but GET is used here.
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`[ChatPanel] handleSendMessage: N8N Webhook error: ${response.status}`, errorData); // DEBUG
        // Remove optimistic user message on error
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== optimisticUserMessage.id));
        // Add an error message to the chat
        setMessages(prevMessages => [...prevMessages, {
          id: `error-${Date.now()}`,
          sender_role: 'system',
          content: `Erro ao contatar o agente: ${response.status}. Detalhes: ${errorData.substring(0, 100)}...`
        }]);
        throw new Error(`Erro no webhook Fanya: ${response.status}. Detalhes: ${errorData}`);
      }
      
      const agentResponseArray = await response.json(); // Expecting an array
      console.log('[ChatPanel] handleSendMessage: N8N Webhook call successful. Response array:', agentResponseArray); // DEBUG

      // Process the first element of the array if it exists
      const agentResponseData = Array.isArray(agentResponseArray) && agentResponseArray.length > 0 
                                ? agentResponseArray[0] 
                                : null;

      if (!agentResponseData) {
        console.warn('[ChatPanel] Resposta do N8N estava vazia ou não era um array com elementos.');
        setMessages(prevMessages => [...prevMessages, {
          id: `agent-empty-${Date.now()}`,
          sender_role: 'agent',
          content: "O agente processou sua solicitação, mas a resposta está vazia.",
        }]);
      } else {
        // Log message might be outside the main response object or within it, adjust if necessary
        // For now, assuming it's not present in this new structure example.
        // if (agentResponseData.log_message) {
        //   console.log('[ChatPanel] N8N Log:', agentResponseData.log_message);
        // }

        // Check the new structure: agentResponseData.output.action_type and agentResponseData.output.response_content
        if (agentResponseData.output && 
            agentResponseData.output.action_type === "response" && // Adjusted path
            agentResponseData.output.response_content) {
          
          const responseContent = agentResponseData.output.response_content;
          const agentMessage = {
            id: `agent-${Date.now()}`, // Temporary ID
            sender_role: 'agent',
            content: responseContent.content || "O agente respondeu, mas o conteúdo está vazio.",
            // type: responseContent.type, // e.g. "text" or "text/markdown"
          };
          setMessages(prevMessages => [...prevMessages, agentMessage]);
        } else {
          console.warn('[ChatPanel] Resposta do N8N não continha uma ação de resposta ao usuário válida na nova estrutura:', agentResponseData);
          setMessages(prevMessages => [...prevMessages, {
            id: `agent-fallback-${Date.now()}`,
            sender_role: 'agent',
            content: "O agente processou sua solicitação, mas não forneceu uma resposta direta para o chat (formato inesperado).",
          }]);
        }
      }
      // Note: The Realtime listener for n8n_chat should ideally handle de-duplication
      // or update this temporary agent message with one from the database.

    } catch (error) {
      console.error('[ChatPanel] handleSendMessage: Failure in sending message (catch block):', error); // DEBUG
      // Error message is already added to chat if it was a webhook error.
      // If it's another type of error (e.g., session creation), an alert might be better.
      if (!String(error.message).includes("Erro no webhook Fanya")) { // Avoid double alert/message
        alert(`Falha ao enviar mensagem: ${error.message}`);
      }
       // Ensure optimistic message is removed if it wasn't already by a specific error handler
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== optimisticUserMessage.id));
    } finally {
      setIsAgentReplying(false); // Stop loading indicator
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleTitleChange = (e) => {
    setCurrentSessionTitle(e.target.value);
  };

  const handleSaveTitle = async () => {
    if (!activeSessionId || !updateSessionName) return;
    if (currentSessionTitle.trim() === (activeSession?.name || "Nova Conversa") || currentSessionTitle.trim() === "") {
      setIsEditingTitle(false);
      setCurrentSessionTitle(activeSession?.name || "Nova Conversa"); // Revert if unchanged or empty
      return;
    }
    try {
      await updateSessionName(activeSessionId, currentSessionTitle.trim());
    } catch (error) {
      console.error("Erro ao salvar título da sessão no ChatPanel:", error);
      alert(`Falha ao renomear sessão: ${error.message}`);
      setCurrentSessionTitle(activeSession?.name || "Nova Conversa"); // Revert on error
    } finally {
      setIsEditingTitle(false);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setCurrentSessionTitle(activeSession?.name || "Nova Conversa"); // Revert
    }
  };


  return (
    <div style={panelStyle}>
      {activeSessionId && (
        <div style={chatHeaderStyle}>
          {isEditingTitle ? (
            <input
              type="text"
              value={currentSessionTitle}
              onChange={handleTitleChange}
              onKeyDown={handleTitleKeyDown}
              onBlur={handleSaveTitle}
              style={titleInputStyle}
              autoFocus
            />
          ) : (
            <h2 style={chatTitleStyle} onClick={() => setIsEditingTitle(true)} title="Clique para editar o título">
              {activeSession?.name || "Nova Conversa"}
            </h2>
          )}
          {!isEditingTitle && (
            <FiEdit2
              size={18}
              style={editTitleIconStyle}
              onClick={() => setIsEditingTitle(true)}
              title="Renomear Sessão"
            />
          )}
        </div>
      )}
      <div style={messagesContainerStyle}>
        {loadingMessages && <p>Carregando mensagens...</p>}
        {!loadingMessages && !activeSessionId && <p style={{textAlign: 'center', color: 'var(--color-text-secondary)'}}>Selecione ou crie uma sessão para começar a conversar.</p>}
        {!loadingMessages && activeSessionId && messages.length === 0 && !isAgentReplying && <p style={{textAlign: 'center', color: 'var(--color-text-secondary)'}}>Nenhuma mensagem nesta sessão ainda. Envie uma!</p>}
        
        {messages.map((message) => {
          const isMarked = markedContextMessages.some(m => m.id === message.id);
          return (
            <div key={message.id} style={messageStyle(message.sender_role)}>
              <ReactMarkdown components={{ p: ({node, ...props}) => <p style={{margin: 0}} {...props} /> }}>
                {message.content}
              </ReactMarkdown>
              {message.sender_role !== 'system' && ( // Don't show actions for system messages
                <div style={messageActionsStyle}>
                  <FaCopy 
                    style={actionIconStyle(false)}
                    title="Copiar mensagem" 
                    onClick={() => handleCopyMessage(message.content)} 
                  />
                  <FaThumbtack 
                    style={actionIconStyle(isMarked)} 
                    title={isMarked ? "Desmarcar como contexto" : "Marcar como contexto"}
                    onClick={() => handleToggleMarkContext(message)} 
                  />
                  {message.sender_role === 'user' && (
                    <IoMdRefresh 
                      style={actionIconStyle(false)} 
                      title="Reenviar mensagem"
                      onClick={() => handleResendUserMessage(message.content)} 
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
        {isAgentReplying && (
          <div style={{ ...messageStyle('agent'), opacity: 0.7, fontStyle: 'italic', alignSelf: 'flex-start' }}>
            Agente está digitando...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={chatInputAreaStyle}>
        <textarea
          ref={textareaRef}
          style={textareaStyle}
          value={chatInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem... (Shift+Enter para nova linha)"
          rows="1"
        />
        <button style={sendButtonStyle} onClick={handleSendMessage} title="Enviar Mensagem">
          <IoMdSend size={20} />
        </button>
      </div>
      {markedContextMessages.length > 0 && (
        <div style={{ padding: '5px', border: '1px dashed var(--color-border)', fontSize: '0.9em', maxHeight: '100px', overflowY: 'auto' }}>
          <p style={{margin: '0 0 5px 0'}}><strong>Contexto Marcado:</strong> ({markedContextMessages.length})</p>
          <ul style={{margin:0, paddingLeft: '20px'}}>
            {markedContextMessages.map(msg => (
              <li key={msg.id}><em>{msg.sender_role}:</em> {msg.content.substring(0, 30)}...</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
