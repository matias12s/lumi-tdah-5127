import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface QuickCapture {
  id: string;
  content: string;
  type: 'text' | 'audio' | 'photo';
  timestamp: Date;
}

export function useCaptures(userId: string) {
  const [captures, setCaptures] = useState<QuickCapture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    loadCaptures();
  }, [userId]);

  const loadCaptures = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quick_captures')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const formattedCaptures: QuickCapture[] = (data || []).map(capture => ({
        id: capture.id,
        content: capture.content,
        type: capture.type as 'text' | 'audio' | 'photo',
        timestamp: new Date(capture.timestamp),
      }));

      setCaptures(formattedCaptures);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar capturas');
    } finally {
      setLoading(false);
    }
  };

  const addCapture = async (content: string, type: 'text' | 'audio' | 'photo' = 'text') => {
    try {
      const { data, error } = await supabase
        .from('quick_captures')
        .insert({
          user_id: userId,
          content,
          type,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const newCapture: QuickCapture = {
        id: data.id,
        content: data.content,
        type: data.type as 'text' | 'audio' | 'photo',
        timestamp: new Date(data.timestamp),
      };

      setCaptures(prev => [newCapture, ...prev]);
      return newCapture;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar captura');
      throw err;
    }
  };

  const deleteCapture = async (captureId: string) => {
    try {
      const { error } = await supabase
        .from('quick_captures')
        .delete()
        .eq('id', captureId);

      if (error) throw error;

      setCaptures(prev => prev.filter(c => c.id !== captureId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar captura');
      throw err;
    }
  };

  return {
    captures,
    loading,
    error,
    addCapture,
    deleteCapture,
    refreshCaptures: loadCaptures,
  };
}
