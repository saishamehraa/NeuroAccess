import { useState } from "react";
import { AIAssistant } from "./AIAssistant";
import { Charts } from "./Charts";
import { History } from "./History";
import { LLMSection } from "./LLMSection";
import { supabase } from '../../supabaseClient';
import {
  BarChart3,
  Bot,
  History as HistoryIcon,
  LogOut,
  Brain,
  GitCompare,
} from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
//import { useChatHistory, type ChatMessage } from "../../hooks/useChatHistory";
import { useChatHistory } from "../../hooks/useChatHistory";
import { DashboardCard } from "./DashboardCard";
import { APP_URLS } from "../../utils/urls";

interface DashboardProps {
  session: any;
}

type Section =
  | "chat"
  | "charts"
  | "llms"
  | "history"
  | "prompts"
  | "comparison";

export default function Dashboard({ session }: DashboardProps) {
  const [activeSection, setActiveSection] = useState<Section>("chat");
  const [selectedModel] = useState(
    "google/gemma-3n-e4b-it:free"
  );
  const { theme } = useTheme();
  //const { updateCurrentSessionMessages } = useChatHistory();
  const {} = useChatHistory();

  const navigateToSection = (section: Section) => {
    setActiveSection(section);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // redirect back to NeuroVault landing page
      window.location.href = APP_URLS.neurovault;
    } catch (err: any) {
      alert(`Logout failed: ${err.message}`);
    }
  };

  const handleModelSelect = (modelId: string) => {
    // Redirect to NeuroAIComparison and pass the selected model via query string
    const target = `${APP_URLS.aicomparison}?model=${encodeURIComponent(modelId)}`;
    window.location.href = target;
  };

  /*const handleLoadSessionFromHistory = (messages: ChatMessage[]) => {
    updateCurrentSessionMessages(messages);
    setActiveSection("chat");
  };*/

  const renderActiveSection = () => {
    switch (activeSection) {
      case "charts":
        return <Charts onModelSelect={handleModelSelect} />;
      case "llms":
        return <LLMSection onModelSelect={handleModelSelect} />;
      case "history":
        return (
          <History
            //onLoadSession={handleLoadSessionFromHistory}
            onSwitchToChat={() => setActiveSection("chat")}
          />
        );
      case "prompts":
        return (
          <div className="space-y-6">
            <DashboardCard
              title="Prompt Gallery"
              icon={<Brain size={20} className={theme === "dark" ? "text-purple-400" : "text-purple-600"} />}
            >
              <p className={`mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Discover 20+ curated prompts for every use case - from creative writing to business strategy.
              </p>
              <button
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-purple-500 hover:bg-purple-600"
                } text-white`}
                onClick={() => (window.location.href = APP_URLS.promptgallery)}
              >
                Explore Prompts
              </button>
            </DashboardCard>
            <DashboardCard
              title="Prompt Engineering Tools"
              icon={<Brain size={20} className={theme === "dark" ? "text-green-400" : "text-green-600"} />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50 text-white"
                      : "bg-white/30 border-gray-200/30 hover:bg-white/50 text-gray-900"
                  }`}
                  onClick={() => alert("Custom prompt generation feature coming soon!")}
                >
                  <h4 className="font-semibold mb-2">Generate Custom Prompt</h4>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    AI-powered prompt creation tailored to your specific needs
                  </p>
                </button>
                <button
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50 text-white"
                      : "bg-white/30 border-gray-200/30 hover:bg-white/50 text-gray-900"
                  }`}
                  onClick={() => alert("Prompt optimization tool coming soon!")}
                >
                  <h4 className="font-semibold mb-2">Prompt Optimizer</h4>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    Improve your prompts for better AI responses
                  </p>
                </button>
              </div>
            </DashboardCard>
          </div>
        );
      case "comparison":
        return (
          <div className="space-y-6">
            <DashboardCard
              title="AI Comparison Hub"
              icon={<GitCompare size={20} className={theme === "dark" ? "text-blue-400" : "text-blue-600"} />}
            >
              <p className={`mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Compare different AI models side-by-side. Analyze performance,
                cost, and capabilities to find the perfect model for your needs.
              </p>
                <button
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
                onClick={() => (window.location.href = `${APP_URLS.aicomparison}compare/`)}
              >
                Compare Models
              </button>
            </DashboardCard>
            <DashboardCard
              title="Performance Matrix"
              icon={<BarChart3 size={20} className={theme === "dark" ? "text-green-400" : "text-green-600"} />}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border ${
                  theme === "dark" ? "bg-gray-700/30 border-gray-600/30" : "bg-white/30 border-gray-200/30"
                }`}>
                  <h4 className="font-semibold mb-2">Speed Analysis</h4>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    Compare response times across models
                  </p>
                </div>
                <div className={`p-4 rounded-lg border ${
                  theme === "dark" ? "bg-gray-700/30 border-gray-600/30" : "bg-white/30 border-gray-200/30"
                }`}>
                  <h4 className="font-semibold mb-2">Cost Efficiency</h4>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    Analyze pricing per token and performance
                  </p>
                </div>
                <div className={`p-4 rounded-lg border ${
                  theme === "dark" ? "bg-gray-700/30 border-gray-600/30" : "bg-white/30 border-gray-200/30"
                }`}>
                  <h4 className="font-semibold mb-2">Quality Metrics</h4>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    Compare output quality and accuracy
                  </p>
                </div>
              </div>
            </DashboardCard>
          </div>
        );
     default:
        // Render the AIAssistant component as the default welcome page
        return <AIAssistant selectedModel={selectedModel} />;
    }
  };

  const sectionIcons = {
    chat: <Bot size={20} />,
    charts: <BarChart3 size={20} />,
    llms: <Brain size={20} />,
    history: <HistoryIcon size={20} />,
    prompts: <Brain size={20} />,
    comparison: <GitCompare size={20} />,
  };

  const sectionNames = {
    chat: "AI Chat",
    charts: "Analytics",
    llms: "Models",
    history: "History",
    prompts: "Prompt Gallery",
    comparison: "AI Comparison",
  };

  return (
    <div className={`min-h-screen flex dashboard-bg ${theme}`}>
      <aside className={`w-64 p-6 flex flex-col gap-4 backdrop-blur-lg transition-colors duration-300 ${
        theme === "dark"
          ? "bg-black/20 border-r border-gray-700/30"
          : "bg-white/20 border-r border-gray-300/30"
      }`}>
        <div className="mb-8 flex items-center gap-3">
          <div className={`p-2 rounded-lg transition-colors duration-300 ${
            theme === "dark" ? "bg-purple-500/20" : "bg-purple-500/10"
          }`}>
            <Brain size={28} className={theme === "dark" ? "text-purple-400" : "text-purple-600"} />
          </div>
          <span
            className="text-2xl font-bold text-transparent bg-clip-text"
            style={{
              backgroundImage:
                theme === "dark"
                  ? "linear-gradient(to right, #22d3ee, #a855f7)"
                  : "linear-gradient(to right, #9333ea, #db2777)",
            }}
          >
            NeuroVault
          </span>
        </div>
        <nav className="flex flex-col gap-2">
          {(["chat","charts","llms","history","prompts","comparison"] as Section[]).map((section) => (
            <button
              key={section}
              onClick={() => {
                // Redirect to external apps for certain entries to open full-featured apps
                if (section === 'chat') {
                  window.location.href = APP_URLS.aicomparison;
                  return;
                }
                if (section === 'prompts') {
                  // Open the Prompt Gallery in the same window
                  window.location.href = APP_URLS.promptgallery;
                  return;
                }
                if (section === 'comparison') {
                  // Open NeuroAIComparison comparison page in the same window (compare route)
                  window.location.href = `${APP_URLS.aicomparison}compare/`;
                  return;
                }
                navigateToSection(section);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 text-left ${
                activeSection === section
                  ? theme === "dark"
                    ? "bg-gradient-to-r from-purple-400/20 to-pink-500/20 text-purple-200 shadow-lg border border-purple-500/30"
                    : "bg-gradient-to-r from-purple-500/15 to-pink-500/15 text-purple-800 shadow-lg border border-purple-400/30"
                  : theme === "dark"
                  ? "text-purple-300 hover:bg-gray-700/40 hover:text-purple-200"
                  : "text-purple-700 hover:bg-white/40 hover:text-purple-800"
              }`}
            >
              {sectionIcons[section]}
              <span>{sectionNames[section]}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-4">
          <div className={`p-4 rounded-xl transition-colors duration-300 ${
            theme === "dark"
              ? "bg-gray-800/30 border border-gray-600/30"
              : "bg-white/30 border border-gray-200/30"
          }`}>
            <p className={`text-sm font-medium ${theme === "dark" ? "text-purple-300" : "text-purple-700"}`}>
              Signed in as:
            </p>
            <p className={`text-sm truncate ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {session.email}
            </p>
            <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Model: {selectedModel}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className={`w-full px-4 py-3 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              theme === "dark"
                ? "bg-gradient-to-r from-red-500 to-red-700 focus:ring-red-500"
                : "bg-gradient-to-r from-red-600 to-red-800 focus:ring-red-600"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <LogOut size={18} />
              Logout
            </div>
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className={`flex justify-between items-center p-6 border-b backdrop-blur-sm transition-colors duration-300 ${
          theme === "dark"
            ? "border-gray-700/30 bg-gray-900/20"
            : "border-gray-300/30 bg-white/20"
        }`}>
          <div>
            <h1
              className="text-2xl font-bold text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  theme === "dark"
                    ? "linear-gradient(to right, #22d3ee, #a855f7)"
                    : "linear-gradient(to right, #9333ea, #db2777)",
              }}
            >
              Welcome back!
            </h1>
            <p className={`text-sm mt-1 ${theme === "dark" ? "text-purple-300" : "text-purple-700"}`}>
              {session.email} • Using {selectedModel}
            </p>
          </div>
        </header>
        <div className="flex-1 p-8 overflow-auto">{renderActiveSection()}</div>
      </main>
    </div>
  );
}
