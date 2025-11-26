"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Sparkles, 
  Timer, 
  Mic, 
  Camera, 
  Zap,
  Eye,
  EyeOff,
  ChevronRight,
  Play,
  Pause,
  SkipForward,
  ListTodo,
  Settings,
  Moon,
  Trophy,
  Target,
  Flame,
  Star,
  Award,
  TrendingUp,
  Users,
  Share2,
  Calendar,
  BarChart3,
  BookOpen,
  Lightbulb,
  Heart,
  Database,
  AlertCircle
} from "lucide-react";
import { useUser } from "@/components/UserProvider";
import { useTasks } from "@/hooks/useTasks";
import { useStats } from "@/hooks/useStats";
import { useAchievements } from "@/hooks/useAchievements";
import { useCaptures } from "@/hooks/useCaptures";

// Tipos
type Priority = "urgent" | "high" | "medium" | "low";
type ViewMode = "all" | "focus";
type Theme = "soft" | "vibrant" | "contrast" | "dark";

// Componente Principal
export default function LumiApp() {
  const { userId, isConnected, error: connectionError } = useUser();
  
  // Hooks do banco de dados
  const { tasks, loading: tasksLoading, addTask: addTaskDB, toggleTask: toggleTaskDB } = useTasks(userId);
  const { stats, loading: statsLoading, incrementFocusSession } = useStats(userId);
  const { achievements, loading: achievementsLoading } = useAchievements(userId);
  const { captures, loading: capturesLoading, addCapture: addCaptureDB } = useCaptures(userId);

  const [currentView, setCurrentView] = useState<"home" | "tasks" | "focus" | "emergency" | "capture" | "settings" | "gamification" | "community" | "stats" | "learn">("home");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [theme, setTheme] = useState<Theme>("soft");
  const [newTaskInput, setNewTaskInput] = useState("");
  const [newCaptureInput, setNewCaptureInput] = useState("");
  
  // Timer Pomodoro
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(25);

  // Modo Emergência
  const [emergencyTaskIndex, setEmergencyTaskIndex] = useState(0);

  // Frases motivacionais
  const motivationalPhrases = [
    "Você está indo bem! 🌟",
    "Um passo de cada vez",
    "Progresso é progresso, não importa o tamanho",
    "Você consegue! ✨",
    "Respire fundo, você está no controle",
    "Cada tarefa concluída é uma vitória! 🎉",
    "Seu foco está ficando mais forte 💪",
    "Continue assim, você está arrasando! 🚀"
  ];
  const [currentPhrase, setCurrentPhrase] = useState(motivationalPhrases[0]);

  // Efeito para frase motivacional
  useEffect(() => {
    const randomPhrase = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];
    setCurrentPhrase(randomPhrase);
  }, []);

  // Timer Pomodoro
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive) {
      interval = setInterval(() => {
        if (timerSeconds === 0) {
          if (timerMinutes === 0) {
            setTimerActive(false);
            // Incrementar sessões de foco no banco
            if (isConnected) {
              incrementFocusSession();
            }
          } else {
            setTimerMinutes(timerMinutes - 1);
            setTimerSeconds(59);
          }
        } else {
          setTimerSeconds(timerSeconds - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerMinutes, timerSeconds, isConnected, incrementFocusSession]);

  // Funções de tarefas
  const handleToggleTask = async (id: string) => {
    if (isConnected) {
      await toggleTaskDB(id);
    }
  };

  const handleAddTask = async () => {
    if (newTaskInput.trim()) {
      if (isConnected) {
        await addTaskDB(newTaskInput, "medium");
      }
      setNewTaskInput("");
    }
  };

  const handleAddCapture = async (type: "text" | "audio" | "photo") => {
    if (type === "text" && newCaptureInput.trim()) {
      if (isConnected) {
        await addCaptureDB(newCaptureInput, type);
      }
      setNewCaptureInput("");
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "urgent": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-blue-500";
      case "low": return "bg-green-500";
    }
  };

  const getThemeClasses = () => {
    switch (theme) {
      case "soft":
        return "bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50";
      case "vibrant":
        return "bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100";
      case "contrast":
        return "bg-white";
      case "dark":
        return "bg-gray-900 text-white";
    }
  };

  const incompleteTasks = tasks.filter(t => !t.completed);
  const urgentTasks = incompleteTasks.filter(t => t.priority === "urgent" || t.priority === "high");
  const displayTasks = viewMode === "focus" ? urgentTasks : incompleteTasks;

  // Banner de status da conexão
  const ConnectionBanner = () => {
    if (!connectionError) return null;
    
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-3 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Banco de dados não configurado</p>
            <p className="text-sm text-white/90">
              Configure o Supabase para salvar seus dados permanentemente. Veja SUPABASE_SETUP.md
            </p>
          </div>
          <Database className="w-6 h-6 flex-shrink-0 opacity-50" />
        </div>
      </div>
    );
  };

  // Loading state
  if (tasksLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-500 animate-pulse" />
          <p className="text-xl text-gray-600">Carregando LUMI...</p>
        </div>
      </div>
    );
  }

  // Tela Home
  if (currentView === "home") {
    return (
      <>
        <ConnectionBanner />
        <div className={`min-h-screen ${getThemeClasses()} p-4 sm:p-6 transition-all duration-300 ${connectionError ? 'pt-24' : ''}`}>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12 mt-4 sm:mt-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500" />
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  LUMI
                </h1>
              </div>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6">
                {currentPhrase}
              </p>
              
              {/* Stats Rápidas */}
              <div className="flex justify-center gap-3 sm:gap-4 mb-6 flex-wrap">
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="font-bold text-gray-800 dark:text-white">{stats.currentStreak}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">dias</span>
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="font-bold text-gray-800 dark:text-white">Nível {stats.level}</span>
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-500" />
                    <span className="font-bold text-gray-800 dark:text-white">{stats.totalPoints}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">pts</span>
                  </div>
                </div>
              </div>

              <div className="inline-block bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 sm:px-6 py-3 rounded-2xl shadow-lg">
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200">
                  <span className="font-semibold">{incompleteTasks.length}</span> tarefas pendentes
                </p>
              </div>
            </div>

            {/* Menu Principal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {/* Tarefas */}
              <button
                onClick={() => setCurrentView("tasks")}
                className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <ListTodo className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Tarefas</h2>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 text-left">
                  Organize e visualize suas atividades
                </p>
              </button>

              {/* Foco Guiado */}
              <button
                onClick={() => setCurrentView("focus")}
                className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <Timer className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Foco</h2>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 text-left">
                  Timer flexível para concentração
                </p>
              </button>

              {/* Modo Emergência */}
              <button
                onClick={() => setCurrentView("emergency")}
                className="bg-gradient-to-br from-red-500 to-pink-500 p-6 sm:p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Só Uma Coisa</h2>
                </div>
                <p className="text-sm sm:text-base text-white/90 text-left">
                  Foco total em uma tarefa por vez
                </p>
              </button>

              {/* Captura Rápida */}
              <button
                onClick={() => setCurrentView("capture")}
                className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Registrar</h2>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 text-left">
                  Capture ideias rapidamente
                </p>
              </button>

              {/* Conquistas */}
              <button
                onClick={() => setCurrentView("gamification")}
                className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 sm:p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:scale-110 transition-transform">
                    <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Conquistas</h2>
                </div>
                <p className="text-sm sm:text-base text-white/90 text-left">
                  Veja seu progresso e recompensas
                </p>
              </button>

              {/* Estatísticas */}
              <button
                onClick={() => setCurrentView("stats")}
                className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Estatísticas</h2>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 text-left">
                  Análise do seu desempenho
                </p>
              </button>

              {/* Comunidade */}
              <button
                onClick={() => setCurrentView("community")}
                className="bg-gradient-to-br from-pink-500 to-rose-500 p-6 sm:p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Comunidade</h2>
                </div>
                <p className="text-sm sm:text-base text-white/90 text-left">
                  Conecte-se e compartilhe
                </p>
              </button>

              {/* Aprender */}
              <button
                onClick={() => setCurrentView("learn")}
                className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Aprender</h2>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 text-left">
                  Dicas e conteúdo sobre TDAH
                </p>
              </button>
            </div>

            {/* Botão Configurações */}
            <button
              onClick={() => setCurrentView("settings")}
              className="w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Personalizar LUMI</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  // Tela de Gamificação
  if (currentView === "gamification") {
    const unlockedAchievements = achievements.filter(a => a.unlocked);
    const lockedAchievements = achievements.filter(a => !a.unlocked);

    return (
      <>
        <ConnectionBanner />
        <div className={`min-h-screen ${getThemeClasses()} p-4 sm:p-6 ${connectionError ? 'pt-24' : ''}`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentView("home")}
                className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Conquistas</h1>
              <div className="w-10"></div>
            </div>

            {/* Progresso do Nível */}
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-6 sm:p-8 rounded-3xl shadow-xl mb-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold mb-1">Nível {stats.level}</h2>
                  <p className="text-white/80">Você está arrasando! 🚀</p>
                </div>
                <Trophy className="w-16 h-16 opacity-20" />
              </div>
              <div className="bg-white/20 rounded-full h-4 mb-2">
                <div 
                  className="bg-white rounded-full h-4 transition-all duration-500"
                  style={{ width: `${(stats.totalPoints % 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-white/80">
                {stats.totalPoints % 100} / 100 pontos para o próximo nível
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.tasksCompleted}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Tarefas</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg text-center">
                <Timer className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.focusSessions}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Sessões</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg text-center">
                <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.currentStreak}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Sequência</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalPoints}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Pontos</p>
              </div>
            </div>

            {/* Conquistas Desbloqueadas */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Desbloqueadas ({unlockedAchievements.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {unlockedAchievements.map(achievement => (
                  <div key={achievement.id} className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 p-5 rounded-2xl shadow-lg border-2 border-yellow-400">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-1">{achievement.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{achievement.description}</p>
                        {achievement.progress !== undefined && achievement.total && (
                          <div className="mt-2 bg-white/50 rounded-full h-2">
                            <div 
                              className="bg-yellow-500 rounded-full h-2"
                              style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                      <Award className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conquistas Bloqueadas */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Em Progresso ({lockedAchievements.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {lockedAchievements.map(achievement => (
                  <div key={achievement.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg opacity-75">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl grayscale">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-1">{achievement.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{achievement.description}</p>
                        {achievement.progress !== undefined && achievement.total && (
                          <div className="mt-2">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                              <div 
                                className="bg-purple-500 rounded-full h-2 transition-all"
                                style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500">{achievement.progress} / {achievement.total}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Tela de Estatísticas
  if (currentView === "stats") {
    const completedTasks = tasks.filter(t => t.completed);
    const todayTasks = completedTasks.filter(t => {
      if (!t.completedAt) return false;
      const today = new Date();
      const taskDate = new Date(t.completedAt);
      return taskDate.toDateString() === today.toDateString();
    });

    return (
      <>
        <ConnectionBanner />
        <div className={`min-h-screen ${getThemeClasses()} p-4 sm:p-6 ${connectionError ? 'pt-24' : ''}`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentView("home")}
                className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Estatísticas</h1>
              <div className="w-10"></div>
            </div>

            {/* Resumo do Dia */}
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6 sm:p-8 rounded-3xl shadow-xl mb-6 text-white">
              <h2 className="text-2xl font-bold mb-4">Hoje</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold">{todayTasks.length}</p>
                  <p className="text-white/80">Tarefas concluídas</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.focusSessions}</p>
                  <p className="text-white/80">Sessões de foco</p>
                </div>
              </div>
            </div>

            {/* Gráficos e Insights */}
            <div className="space-y-6">
              {/* Produtividade Semanal */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Produtividade Semanal</h3>
                <div className="flex items-end justify-between h-40 gap-2">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => {
                    const height = Math.random() * 100 + 20;
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-lg transition-all hover:opacity-80"
                          style={{ height: `${height}%` }}
                        ></div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{day}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Insights */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Insights</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Sua produtividade aumentou 23% esta semana! Continue assim! 🎉
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <Timer className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Você completa mais tarefas entre 9h e 11h. Aproveite esse horário!
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <Target className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Você está a apenas 2 tarefas de bater seu recorde semanal!
                    </p>
                  </div>
                </div>
              </div>

              {/* Tempo de Foco */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Tempo de Foco</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-bold text-gray-800 dark:text-white">{stats.focusSessions * 25}</p>
                    <p className="text-gray-600 dark:text-gray-400">minutos esta semana</p>
                  </div>
                  <div className="relative">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
                      <circle 
                        cx="48" 
                        cy="48" 
                        r="40" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.65)}`}
                        className="text-purple-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-800 dark:text-white">65%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Tela de Comunidade
  if (currentView === "community") {
    const communityPosts = [
      { id: 1, user: "Ana Silva", avatar: "👩", content: "Consegui manter minha sequência por 10 dias! Melhor sensação! 🎉", likes: 24, time: "2h atrás" },
      { id: 2, user: "Pedro Santos", avatar: "👨", content: "Dica: uso o modo emergência quando estou muito sobrecarregado. Funciona demais!", likes: 18, time: "5h atrás" },
      { id: 3, user: "Maria Costa", avatar: "👩‍🦰", content: "Alguém mais tem dificuldade de começar as tarefas pela manhã?", likes: 31, time: "1d atrás" },
      { id: 4, user: "João Oliveira", avatar: "👨‍🦱", content: "Completei 50 tarefas! Obrigado LUMI por me ajudar a me organizar 💜", likes: 42, time: "2d atrás" },
    ];

    return (
      <>
        <ConnectionBanner />
        <div className={`min-h-screen ${getThemeClasses()} p-4 sm:p-6 ${connectionError ? 'pt-24' : ''}`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentView("home")}
                className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Comunidade</h1>
              <button className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all">
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            {/* Banner da Comunidade */}
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-6 sm:p-8 rounded-3xl shadow-xl mb-6 text-white">
              <div className="flex items-center gap-4 mb-4">
                <Users className="w-12 h-12" />
                <div>
                  <h2 className="text-2xl font-bold">Bem-vindo à Comunidade LUMI</h2>
                  <p className="text-white/80">12.5k membros ativos</p>
                </div>
              </div>
              <p className="text-white/90">
                Conecte-se com outras pessoas, compartilhe suas conquistas e aprenda juntos! 💜
              </p>
            </div>

            {/* Criar Post */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl mb-6">
              <textarea
                placeholder="Compartilhe algo com a comunidade..."
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px] resize-none mb-3"
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
                    <Camera className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
                    <Trophy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <button className="px-6 py-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  Publicar
                </button>
              </div>
            </div>

            {/* Feed */}
            <div className="space-y-4">
              {communityPosts.map(post => (
                <div key={post.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-3xl">{post.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-800 dark:text-white">{post.user}</h3>
                        <span className="text-sm text-gray-500">{post.time}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors">
                      <Heart className="w-5 h-5" />
                      <span className="text-sm font-medium">{post.likes}</span>
                    </button>
                    <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-500 transition-colors font-medium">
                      Comentar
                    </button>
                    <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors font-medium">
                      Compartilhar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Tela de Aprendizado
  if (currentView === "learn") {
    const articles = [
      { 
        id: 1, 
        title: "Entendendo o TDAH", 
        description: "Aprenda sobre como o TDAH afeta o cérebro e o comportamento",
        category: "Fundamentos",
        duration: "5 min",
        icon: "🧠"
      },
      { 
        id: 2, 
        title: "Técnica Pomodoro para TDAH", 
        description: "Como adaptar a técnica Pomodoro para pessoas neurodivergentes",
        category: "Produtividade",
        duration: "8 min",
        icon: "⏱️"
      },
      { 
        id: 3, 
        title: "Gerenciando a Sobrecarga Sensorial", 
        description: "Estratégias para lidar com ambientes estimulantes",
        category: "Bem-estar",
        duration: "6 min",
        icon: "🎧"
      },
      { 
        id: 4, 
        title: "Construindo Rotinas Sustentáveis", 
        description: "Como criar hábitos que realmente funcionam para você",
        category: "Hábitos",
        duration: "10 min",
        icon: "📅"
      },
      { 
        id: 5, 
        title: "Hiperfoco: Aliado ou Inimigo?", 
        description: "Aprenda a usar o hiperfoco a seu favor",
        category: "Foco",
        duration: "7 min",
        icon: "🎯"
      },
      { 
        id: 6, 
        title: "Comunicação e TDAH", 
        description: "Dicas para melhorar suas relações pessoais e profissionais",
        category: "Relacionamentos",
        duration: "9 min",
        icon: "💬"
      },
    ];

    return (
      <>
        <ConnectionBanner />
        <div className={`min-h-screen ${getThemeClasses()} p-4 sm:p-6 ${connectionError ? 'pt-24' : ''}`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentView("home")}
                className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Aprender</h1>
              <div className="w-10"></div>
            </div>

            {/* Banner */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 sm:p-8 rounded-3xl shadow-xl mb-6 text-white">
              <div className="flex items-center gap-4 mb-4">
                <BookOpen className="w-12 h-12" />
                <div>
                  <h2 className="text-2xl font-bold">Centro de Aprendizado</h2>
                  <p className="text-white/80">Conteúdo especializado sobre TDAH</p>
                </div>
              </div>
              <p className="text-white/90">
                Artigos, vídeos e dicas práticas para entender melhor o TDAH e melhorar sua qualidade de vida.
              </p>
            </div>

            {/* Categorias */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['Todos', 'Fundamentos', 'Produtividade', 'Bem-estar', 'Hábitos', 'Foco'].map(category => (
                <button
                  key={category}
                  className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl font-medium text-sm whitespace-nowrap shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Artigos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {articles.map(article => (
                <div key={article.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer group">
                  <div className="text-4xl mb-4">{article.icon}</div>
                  <div className="mb-3">
                    <span className="text-xs font-medium px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">{article.duration}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 group-hover:text-purple-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {article.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Vídeo em Destaque */}
            <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <Play className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Vídeo em Destaque</h3>
              </div>
              <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center mb-4">
                <Play className="w-16 h-16 text-purple-500" />
              </div>
              <h4 className="font-bold text-gray-800 dark:text-white mb-2">
                Como o LUMI Pode Transformar Sua Rotina
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Descubra como usar todas as funcionalidades do LUMI para maximizar sua produtividade e bem-estar.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Tela de Tarefas
  if (currentView === "tasks") {
    return (
      <>
        <ConnectionBanner />
        <div className={`min-h-screen ${getThemeClasses()} p-4 sm:p-6 ${connectionError ? 'pt-24' : ''}`}>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentView("home")}
                className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Minhas Tarefas</h1>
              <div className="w-10"></div>
            </div>

            {/* Toggle View Mode */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setViewMode("all")}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  viewMode === "all"
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                }`}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                Ver Tudo ({incompleteTasks.length})
              </button>
              <button
                onClick={() => setViewMode("focus")}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  viewMode === "focus"
                    ? "bg-purple-500 text-white shadow-lg"
                    : "bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                }`}
              >
                <EyeOff className="w-4 h-4 inline mr-2" />
                Só o Importante ({urgentTasks.length})
              </button>
            </div>

            {/* Nova Tarefa */}
            <div className="mb-6 flex gap-2">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
                placeholder="Adicionar nova tarefa..."
                className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleAddTask}
                className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {/* Lista de Tarefas */}
            <div className="space-y-3">
              {displayTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                  <p className="text-xl text-gray-600 dark:text-gray-300">
                    {viewMode === "focus" 
                      ? "Nenhuma tarefa urgente! Você está em dia ✨"
                      : "Nenhuma tarefa pendente! Hora de relaxar 🎉"
                    }
                  </p>
                </div>
              ) : (
                displayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className="mt-1 flex-shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400 group-hover:text-purple-500 transition-colors" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p className={`text-base sm:text-lg ${task.completed ? "line-through text-gray-400" : "text-gray-800 dark:text-white"}`}>
                          {task.title}
                        </p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0 mt-2`}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Tela de Foco (Timer Pomodoro)
  if (currentView === "focus") {
    const progress = ((timerDuration * 60 - (timerMinutes * 60 + timerSeconds)) / (timerDuration * 60)) * 100;
    
    return (
      <>
        <ConnectionBanner />
        <div className={`min-h-screen ${getThemeClasses()} p-4 sm:p-6 flex items-center justify-center ${connectionError ? 'pt-24' : ''}`}>
          <div className="max-w-2xl w-full">
            <button
              onClick={() => setCurrentView("home")}
              className="mb-6 p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all"
            >
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>

            <div className="bg-white dark:bg-gray-800 p-8 sm:p-12 rounded-3xl shadow-2xl">
              <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
                Foco Guiado
              </h1>

              {/* Timer Display */}
              <div className="relative mb-8">
                <svg className="w-full h-64" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 80}`}
                    strokeDashoffset={`${2 * Math.PI * 80 * (1 - progress / 100)}`}
                    transform="rotate(-90 100 100)"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl sm:text-6xl font-bold text-gray-800 dark:text-white">
                      {String(timerMinutes).padStart(2, "0")}:{String(timerSeconds).padStart(2, "0")}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {timerActive ? "Em foco..." : "Pronto para começar"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Controles */}
              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  className="p-4 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  {timerActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                </button>
                <button
                  onClick={() => {
                    setTimerActive(false);
                    setTimerMinutes(timerDuration);
                    setTimerSeconds(0);
                  }}
                  className="p-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <SkipForward className="w-8 h-8" />
                </button>
              </div>

              {/* Duração */}
              <div className="space-y-3">
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">Duração do ciclo</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {[10, 15, 20, 25].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => {
                        setTimerDuration(duration);
                        setTimerMinutes(duration);
                        setTimerSeconds(0);
                        setTimerActive(false);
                      }}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        timerDuration === duration
                          ? "bg-purple-500 text-white shadow-lg"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white"
                      }`}
                    >
                      {duration} min
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Modo Emergência
  if (currentView === "emergency") {
    const currentTask = incompleteTasks[emergencyTaskIndex];

    return (
      <>
        <ConnectionBanner />
        <div className={`min-h-screen bg-gradient-to-br from-red-500 to-pink-500 p-4 sm:p-6 flex items-center justify-center ${connectionError ? 'pt-24' : ''}`}>
          <div className="max-w-2xl w-full">
            <button
              onClick={() => setCurrentView("home")}
              className="mb-6 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all text-white"
            >
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>

            {incompleteTasks.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-sm p-12 rounded-3xl shadow-2xl text-center">
                <Sparkles className="w-20 h-20 mx-auto mb-6 text-purple-500" />
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Tudo feito! 🎉
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Você completou todas as tarefas. Hora de relaxar!
                </p>
                <button
                  onClick={() => setCurrentView("home")}
                  className="px-8 py-4 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  Voltar ao Início
                </button>
              </div>
            ) : (
              <div className="bg-white/95 backdrop-blur-sm p-8 sm:p-12 rounded-3xl shadow-2xl">
                <div className="text-center mb-8">
                  <Zap className="w-16 h-16 mx-auto mb-4 text-red-500" />
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                    Só Uma Coisa Agora
                  </h1>
                  <p className="text-gray-600">
                    Tarefa {emergencyTaskIndex + 1} de {incompleteTasks.length}
                  </p>
                </div>

                {currentTask && (
                  <>
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-2xl mb-8 min-h-[200px] flex items-center justify-center">
                      <p className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
                        {currentTask.title}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          handleToggleTask(currentTask.id);
                          if (emergencyTaskIndex < incompleteTasks.length - 1) {
                            setEmergencyTaskIndex(emergencyTaskIndex + 1);
                          } else {
                            setEmergencyTaskIndex(0);
                          }
                        }}
                        className="w-full py-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                      >
                        ✓ Fiz!
                      </button>
                      <button
                        onClick={() => {
                          if (emergencyTaskIndex < incompleteTasks.length - 1) {
                            setEmergencyTaskIndex(emergencyTaskIndex + 1);
                          } else {
                            setEmergencyTaskIndex(0);
                          }
                        }}
                        className="w-full py-4 bg-gray-200 text-gray-700 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                      >
                        Pular
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // Tela de Captura Rápida
  if (currentView === "capture") {
    return (
      <>
        <ConnectionBanner />
        <div className={`min-h-screen ${getThemeClasses()} p-4 sm:p-6 ${connectionError ? 'pt-24' : ''}`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentView("home")}
                className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Captura Rápida</h1>
              <div className="w-10"></div>
            </div>

            {/* Input de Captura */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl mb-6">
              <textarea
                value={newCaptureInput}
                onChange={(e) => setNewCaptureInput(e.target.value)}
                placeholder="Digite algo que você quer lembrar..."
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px] resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleAddCapture("text")}
                  className="flex-1 py-3 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Salvar
                </button>
                <button className="p-3 bg-blue-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <Mic className="w-6 h-6" />
                </button>
                <button className="p-3 bg-purple-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <Camera className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Caixa de Entrada */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Caixa de Entrada</h2>
              <div className="space-y-3">
                {captures.length === 0 ? (
                  <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-2xl">
                    <p className="text-gray-600 dark:text-gray-400">
                      Nenhuma captura ainda. Comece registrando algo!
                    </p>
                  </div>
                ) : (
                  captures.map((capture) => (
                    <div
                      key={capture.id}
                      className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg"
                    >
                      <p className="text-gray-800 dark:text-white mb-2">{capture.content}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(capture.timestamp).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Tela de Configurações
  if (currentView === "settings") {
    return (
      <>
        <ConnectionBanner />
        <div className={`min-h-screen ${getThemeClasses()} p-4 sm:p-6 ${connectionError ? 'pt-24' : ''}`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentView("home")}
                className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Configurações</h1>
              <div className="w-10"></div>
            </div>

            <div className="space-y-6">
              {/* Tema */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Tema Visual</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTheme("soft")}
                    className={`p-4 rounded-2xl font-medium transition-all ${
                      theme === "soft"
                        ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white"
                    }`}
                  >
                    Suave
                  </button>
                  <button
                    onClick={() => setTheme("vibrant")}
                    className={`p-4 rounded-2xl font-medium transition-all ${
                      theme === "vibrant"
                        ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white"
                    }`}
                  >
                    Vibrante
                  </button>
                  <button
                    onClick={() => setTheme("contrast")}
                    className={`p-4 rounded-2xl font-medium transition-all ${
                      theme === "contrast"
                        ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white"
                    }`}
                  >
                    Alto Contraste
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`p-4 rounded-2xl font-medium transition-all ${
                      theme === "dark"
                        ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white"
                    }`}
                  >
                    <Moon className="w-5 h-5 inline mr-2" />
                    Escuro
                  </button>
                </div>
              </div>

              {/* Sobre o LUMI */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Sobre o LUMI</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  LUMI foi projetado especialmente para pessoas com TDAH. Nosso objetivo é reduzir sobrecarga mental, 
                  melhorar organização e tornar sua rotina mais leve e clara. Um passo de cada vez. ✨
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}
