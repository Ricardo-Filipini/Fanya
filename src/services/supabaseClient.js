// Importa a função createClient da biblioteca @supabase/supabase-js
import { createClient } from '@supabase/supabase-js';

// Define as credenciais do Supabase a partir das variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Valida se as variáveis de ambiente foram carregadas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias.");
}

// Inicializa o cliente Supabase com a URL e a chave Anon
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
