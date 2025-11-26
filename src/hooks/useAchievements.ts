import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  total?: number;
}

const ACHIEVEMENT_DEFINITIONS = [
  { id: '1', title: 'Primeiro Passo', description: 'Complete sua primeira tarefa', icon: '🎯', total: 1 },
  { id: '2', title: 'Foco Total', description: 'Complete 5 sessões de foco', icon: '🔥', total: 5 },
  { id: '3', title: 'Sequência de 7', description: 'Mantenha uma sequência de 7 dias', icon: '⭐', total: 7 },
  { id: '4', title: 'Mestre da Produtividade', description: 'Complete 50 tarefas', icon: '🏆', total: 50 },
  { id: '5', title: 'Madrugador', description: 'Complete uma tarefa antes das 8h', icon: '🌅', total: 1 },
  { id: '6', title: 'Organizador', description: 'Organize 20 tarefas em categorias', icon: '📋', total: 20 },
];

export function useAchievements(userId: string) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    loadAchievements();
  }, [userId]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      
      // Buscar conquistas do usuário
      const { data: userAchievements, error: fetchError } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId);

      if (fetchError) throw fetchError;

      // Mapear com as definições
      const achievementsMap = new Map(
        (userAchievements || []).map(a => [a.achievement_id, a])
      );

      const formattedAchievements: Achievement[] = ACHIEVEMENT_DEFINITIONS.map(def => {
        const userAch = achievementsMap.get(def.id);
        return {
          id: def.id,
          title: def.title,
          description: def.description,
          icon: def.icon,
          unlocked: userAch?.unlocked || false,
          progress: userAch?.progress || 0,
          total: def.total,
        };
      });

      setAchievements(formattedAchievements);

      // Criar conquistas que não existem ainda
      const missingAchievements = ACHIEVEMENT_DEFINITIONS.filter(
        def => !achievementsMap.has(def.id)
      );

      if (missingAchievements.length > 0) {
        await supabase.from('achievements').insert(
          missingAchievements.map(def => ({
            user_id: userId,
            achievement_id: def.id,
            unlocked: false,
            progress: 0,
          }))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar conquistas');
    } finally {
      setLoading(false);
    }
  };

  const updateAchievementProgress = async (achievementId: string, progress: number) => {
    try {
      const achievement = achievements.find(a => a.id === achievementId);
      if (!achievement) return;

      const unlocked = achievement.total ? progress >= achievement.total : false;

      const { error } = await supabase
        .from('achievements')
        .update({
          progress,
          unlocked,
          unlocked_at: unlocked ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('achievement_id', achievementId);

      if (error) throw error;

      setAchievements(prev => prev.map(a =>
        a.id === achievementId
          ? { ...a, progress, unlocked }
          : a
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar conquista');
      throw err;
    }
  };

  return {
    achievements,
    loading,
    error,
    updateAchievementProgress,
    refreshAchievements: loadAchievements,
  };
}
