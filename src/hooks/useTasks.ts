import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  steps?: string[];
  currentStep?: number;
  completedAt?: Date;
}

export function useTasks(userId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar tarefas
  useEffect(() => {
    if (!userId) return;
    
    loadTasks();
  }, [userId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTasks: Task[] = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        completed: task.completed,
        priority: task.priority as 'urgent' | 'high' | 'medium' | 'low',
        steps: task.steps || undefined,
        currentStep: task.current_step || undefined,
        completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
      }));

      setTasks(formattedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  // Adicionar tarefa
  const addTask = async (title: string, priority: 'urgent' | 'high' | 'medium' | 'low' = 'medium') => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          title,
          priority,
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;

      const newTask: Task = {
        id: data.id,
        title: data.title,
        completed: data.completed,
        priority: data.priority as 'urgent' | 'high' | 'medium' | 'low',
      };

      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar tarefa');
      throw err;
    }
  };

  // Alternar conclusão de tarefa
  const toggleTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const newCompleted = !task.completed;
      const completedAt = newCompleted ? new Date().toISOString() : null;

      const { error } = await supabase
        .from('tasks')
        .update({ 
          completed: newCompleted,
          completed_at: completedAt,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, completed: newCompleted, completedAt: newCompleted ? new Date() : undefined }
          : t
      ));

      // Se completou a tarefa, atualizar stats
      if (newCompleted) {
        await updateStats(userId, 'task_completed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar tarefa');
      throw err;
    }
  };

  // Deletar tarefa
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar tarefa');
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    toggleTask,
    deleteTask,
    refreshTasks: loadTasks,
  };
}

// Função auxiliar para atualizar estatísticas
async function updateStats(userId: string, action: 'task_completed' | 'focus_session') {
  try {
    // Buscar stats atuais
    const { data: currentStats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!currentStats) {
      // Criar stats se não existir
      await supabase.from('user_stats').insert({
        user_id: userId,
        tasks_completed: action === 'task_completed' ? 1 : 0,
        focus_sessions: action === 'focus_session' ? 1 : 0,
        total_points: action === 'task_completed' ? 20 : 50,
        level: 1,
        current_streak: 1,
      });
    } else {
      // Atualizar stats existentes
      const updates: any = {
        updated_at: new Date().toISOString(),
      };

      if (action === 'task_completed') {
        updates.tasks_completed = currentStats.tasks_completed + 1;
        updates.total_points = currentStats.total_points + 20;
      } else if (action === 'focus_session') {
        updates.focus_sessions = currentStats.focus_sessions + 1;
        updates.total_points = currentStats.total_points + 50;
      }

      updates.level = Math.floor(updates.total_points / 100) + 1;

      await supabase
        .from('user_stats')
        .update(updates)
        .eq('user_id', userId);
    }
  } catch (err) {
    console.error('Erro ao atualizar stats:', err);
  }
}
