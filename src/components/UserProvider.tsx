"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface UserContextType {
  userId: string;
  isConnected: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType>({
  userId: '00000000-0000-0000-0000-000000000001', // ID padrão de teste
  isConnected: false,
  error: null,
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId] = useState('00000000-0000-0000-0000-000000000001'); // Usuário de teste
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      // Tentar fazer uma query simples para verificar conexão
      const { error } = await supabase.from('users').select('id').limit(1);
      
      if (error) {
        setError('Banco de dados não configurado. Siga as instruções em SUPABASE_SETUP.md');
        setIsConnected(false);
      } else {
        setIsConnected(true);
        setError(null);
      }
    } catch (err) {
      setError('Erro ao conectar com Supabase');
      setIsConnected(false);
    }
  };

  return (
    <UserContext.Provider value={{ userId, isConnected, error }}>
      {children}
    </UserContext.Provider>
  );
}
