import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Stats {
  tasksCompleted: number;
  focusSessions: number;
  currentStreak: number;
  totalPoints: number;
  level: number;
}

export function useStats(userId: string) {
  const [stats, setStats] = useState<Stats>({
    tasksCompleted: 0,
    focusSessions: 0,
    currentStreak: 0,
    totalPoints: 0,
    level: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    loadStats();

    // Subscrever a mudanças em tempo real
    const subscription = supabase
      .channel('user_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            const data = payload.new as any;
            setStats({
              tasksCompleted: data.tasks_completed,
              focusSessions: data.focus_sessions,
              currentStreak: data.current_streak,
              totalPoints: data.total_points,
              level: data.level,
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setStats({
          tasksCompleted: data.tasks_completed,
          focusSessions: data.focus_sessions,
          currentStreak: data.current_streak,
          totalPoints: data.total_points,
          level: data.level,
        });
      } else {
        // Criar stats iniciais se não existir
        const { data: newStats, error: insertError } = await supabase
          .from('user_stats')
          .insert({
            user_id: userId,
            tasks_completed: 0,
            focus_sessions: 0,
            current_streak: 0,
            total_points: 0,
            level: 1,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        if (newStats) {
          setStats({
            tasksCompleted: newStats.tasks_completed,
            focusSessions: newStats.focus_sessions,
            currentStreak: newStats.current_streak,
            totalPoints: newStats.total_points,
            level: newStats.level,
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const incrementFocusSession = async () => {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .update({
          focus_sessions: stats.focusSessions + 1,
          total_points: stats.totalPoints + 50,
          level: Math.floor((stats.totalPoints + 50) / 100) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setStats({
          tasksCompleted: data.tasks_completed,
          focusSessions: data.focus_sessions,
          currentStreak: data.current_streak,
          totalPoints: data.total_points,
          level: data.level,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao incrementar sessão de foco');
      throw err;
    }
  };

  return {
    stats,
    loading,
    error,
    incrementFocusSession,
    refreshStats: loadStats,
  };
}
