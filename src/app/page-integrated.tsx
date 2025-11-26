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
  }, [timerActive, timerMinutes, timerSeconds, isConnected]);

  // Funções de tarefas
  const handleToggleTask = async (id: string) => {
    if (isConnected) {
      await toggleTaskDB(id);
    }
  };

  const handleAddTask = async () => {
    if (newTaskInput.trim() && isConnected) {
      await addTaskDB(newTaskInput, "medium");
      setNewTaskInput("");
    }
  };

  const handleAddCapture = async (type: "text" | "audio" | "photo") => {
    if (type === "text" && newCaptureInput.trim() && isConnected) {
      await addCaptureDB(newCaptureInput, type);
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
              O app está funcionando com dados locais. Para salvar permanentemente, configure o Supabase seguindo o arquivo SUPABASE_SETUP.md
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

  // [CONTINUA COM AS OUTRAS TELAS - Vou criar em arquivo separado para não exceder limite]
  // Por enquanto, retornar para home se outras views
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6 flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl text-gray-600 mb-4">Tela em desenvolvimento</p>
        <button
          onClick={() => setCurrentView("home")}
          className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
        >
          Voltar para Home
        </button>
      </div>
    </div>
  );
}
