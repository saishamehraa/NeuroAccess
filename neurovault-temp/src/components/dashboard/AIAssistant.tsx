import React from 'react';

/**
 * Renders the AIAssistant section.
 * * Updates:
 * 1. Responsive Layout: Uses 'left-0' for mobile and 'md:left-64' for desktop.
 * 2. Responsive Images: Uses the <picture> tag to switch between the mobile 
 * portrait image and desktop landscape image automatically.
 */
export const AIAssistant: React.FC<{ selectedModel?: string }> = () => {
  return (
    // Container Positioning:
    // fixed, top-0, bottom-0, right-0: Anchors to screen edges
    // left-0: Full width on mobile
    // md:left-64: Starts after the sidebar on desktop (medium screens and up)
    // z-50: Overlays everything including header
    <div className="fixed top-0 left-0 md:left-64 right-0 bottom-0 z-50 bg-black">
      
      {/* The <picture> element allows for "Art Direction" switching images based on width */}
      <picture>
        {/* Desktop: Show landscape image on screens wider than 768px */}
        <source media="(min-width: 768px)" srcSet="/prototype.jpg" />
        
        {/* Mobile: Default to portrait image on smaller screens */}
        <img
          src="/prototype-mobile.jpg"
          alt="Welcome to NeuroAccess"
          className="w-full h-full object-cover"
        />
      </picture>
      
    </div>
  );
};

export default AIAssistant;
































































/* // components/dashboard/AIAssistant.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Settings, AlertCircle, Loader2, Key, Shield, LogIn, Plus } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { useChatHistory, type ChatMessage } from "../../hooks/useChatHistory";
import { supabase } from '../../supabaseClient';

interface AIAssistantProps {
  selectedModel: string;
}

interface ApiKeySettings {
  key: string;
  isVerified: boolean;
  lastVerified?: Date;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ selectedModel }) => {
  const { theme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const authErrorRef = useRef<any>(null);
  const mountedRef = useRef<boolean>(true);
  const { 
    getCurrentSession,
    createSession,
    addMessage, 
    clearCurrentSession,
    isLoading: historyLoading,
    isAuthenticated
  } = useChatHistory();
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeySettings, setApiKeySettings] = useState<ApiKeySettings | null>(null);
  const [tempApiKey, setTempApiKey] = useState("");
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastRequestTime = useRef<number>(0);

  // Rate limiting: 1 request per 2 seconds
  const RATE_LIMIT_MS = 2000;

  // Get current session or create one (only if authenticated)
  const session = isAuthenticated ? getCurrentSession(selectedModel) : null;
  const messages = session?.messages || [];

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Only show welcome message for truly new sessions
  useEffect(() => {
    if (!isAuthenticated || historyLoading || hasShownWelcome) return;

    // Check if we have a session but it's empty and newly created
    if (session && messages.length === 0 && session.id.startsWith('temp_')) {
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Welcome to NeuroVault AI Assistant!

I'm here to help you with:
• General questions and conversations
• Code analysis and debugging  
• Creative writing and brainstorming
• Research and explanations

**Available Commands:**
• \`/help\` - Show this help guide
• \`/settings\` - Configure API settings
• \`/clear\` - Clear conversation history

Currently using: **${selectedModel}**
Your conversations are automatically saved to your account.

How can I assist you today?`,
        timestamp: new Date(),
        model: selectedModel
      };
      
      addMessage(welcomeMessage);
      setHasShownWelcome(true);
    }
  }, [session, messages.length, selectedModel, addMessage, isAuthenticated, historyLoading, hasShownWelcome]);

  // Reset welcome flag when user changes or when starting a truly new session
  useEffect(() => {
    setHasShownWelcome(false);
  }, [user]);

  // Subscribe to Supabase auth session
  useEffect(() => {
    mountedRef.current = true
    (async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (!mountedRef.current) return;
        setUser(data?.session?.user || null)
      } catch (e) {
        console.warn('Failed to get Supabase session', e)
        authErrorRef.current = e
        setUser(null)
      } finally {
        setLoading(false)
      }
    })()

    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: { user?: any } | null) => {
      setUser((session as any)?.user || null)
      setLoading(false)
    })

    return () => {
      mountedRef.current = false
      try { (listener as any)?.subscription?.unsubscribe?.() } catch {}
    }
  }, [])

  // Create new chat session
  const handleNewChat = useCallback(() => {
    if (!isAuthenticated) return;
    
    // Clear current session and create a new one
    clearCurrentSession().then(() => { 
      createSession(selectedModel);
      setHasShownWelcome(false); // Allow welcome message for new chat
    });
  }, [isAuthenticated, clearCurrentSession, createSession, selectedModel]);

  // Enhanced command handler
  const handleCommand = useCallback(async (text: string): Promise<boolean> => {
    const command = text.toLowerCase().trim();

    if (command === "/help") {
      const helpMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `**NeuroVault Commands & Features**

**Commands:**
• \`/help\` - Show this comprehensive help guide
• \`/settings\` - Open API key configuration
• \`/clear\` - Clear conversation history
• \`/models\` - Show available AI models

**Features:**
• **Multi-model support** - Switch between different AI models
• **Conversation history** - Your chats are saved automatically to your account
• **Analytics** - View model usage statistics
• **Secure API handling** - Your keys are encrypted and verified
• **Cross-device sync** - Access your chats from any device

**Tips:**
• Be specific in your questions for better responses
• Use context from previous messages in our conversation
• Try different models for different types of tasks
• Your conversations are private and tied to your account

Current model: **${selectedModel}**
Logged in as: **${user?.email}**
Need to switch models? Use the Models section in the sidebar!`,
        timestamp: new Date(),
        model: selectedModel
      };
      
      addMessage(helpMessage);
      return true;
    }

    if (command === "/settings") {
      setShowSettings(true);
      const settingsMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Opening settings panel. You can configure your API key for enhanced functionality.",
        timestamp: new Date(),
        model: selectedModel
      };
      
      addMessage(settingsMessage);
      return true;
    }

    if (command === "/clear" || command === "/new") {
      handleNewChat();
      return true;
    }

    if (command === "/models") {
      const modelsMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `**Available AI Models**

**Currently Selected:** ${selectedModel}

**Popular Models:**
• **X.AI Grok Beta** - Fast and creative responses (Free tier available)
• **GPT-3.5 Turbo** - Fast and efficient for most conversations
• **GPT-4** - Best for complex reasoning and creative tasks
• **Claude 3** - Excellent for analysis and safety-focused responses
• **Gemini Pro** - Great for multimodal tasks and reasoning

To switch models, visit the **Models** section in the sidebar.
Each model has different strengths - experiment to find what works best for your use case!

All your conversations are automatically saved to your account regardless of which model you use.`,
        timestamp: new Date(),
        model: selectedModel
      };
      
      addMessage(modelsMessage);
      return true;
    }

    return false;
  }, [selectedModel, addMessage, user, handleNewChat]);

  // Enhanced API key verification
  const verifyApiKey = async (key: string): Promise<boolean> => {
    if (!key || key.length < 10) return false;
    
    try {
      setIsVerifyingKey(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch("https://openrouter.ai/api/v1/models", {
        headers: {
          Authorization: `Bearer ${key}`,
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return res.ok;
    } catch (error) {
      console.error("API key verification failed:", error);
      return false;
    } finally {
      setIsVerifyingKey(false);
    }
  };

  // Rate limiting check
  const checkRateLimit = (): boolean => {
    const now = Date.now();
    if (now - lastRequestTime.current < RATE_LIMIT_MS) {
      setChatError(`Please wait ${Math.ceil((RATE_LIMIT_MS - (now - lastRequestTime.current)) / 1000)} seconds before sending another message.`);
      return false;
    }
    lastRequestTime.current = now;
    return true;
  };

  // Enhanced message sending with better error handling
  const sendMessage = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      setChatError('Please log in to start chatting.');
      return;
    }

    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Check rate limiting
    if (!checkRateLimit()) return;

    // Clear any previous errors
    setChatError(null);

    // Create session if none exists
    let currentChatSession = session;
    if (!currentChatSession) {
      currentChatSession = createSession(selectedModel);
    }

    const userMessage: ChatMessage = { 
      id: crypto.randomUUID(),
      role: "user", 
      content: trimmedInput,
      timestamp: new Date(),
      model: selectedModel
    };
    
    try {
      addMessage(userMessage);
      setInput("");
      setIsLoading(true);

      // Handle commands first
      const isCommand = await handleCommand(trimmedInput);
      if (isCommand) {
        setIsLoading(false);
        return;
      }

      // Validate API key
      const currentApiKey = apiKeySettings?.key || import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!currentApiKey) {
        throw new Error("No API key configured. Please add your API key in settings.");
      }

      // Prepare conversation context (last 10 messages for context)
      const contextMessages = messages.slice(-10).concat(userMessage);
      
      const model = selectedModel || "google/gemma-3n-e4b-it:free"; // Changed default to free tier model
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "NeuroVault AI Assistant"
        },
        body: JSON.stringify({
          model,
          messages: contextMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          max_tokens: 1000,
          temperature: 0.7,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error("Invalid response format from API");
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.choices[0].message.content,
        timestamp: new Date(),
        model: selectedModel
      };

      addMessage(assistantMessage);

    } catch (error: any) {
      console.error("Message sending failed:", error);
      
      let errorMessage = "Failed to send message. ";
      
      if (error.name === 'AbortError') {
        errorMessage += "Request timed out.";
      } else if (error.message.includes("401")) {
        errorMessage += "Invalid API key. Please check your settings.";
      } else if (error.message.includes("429")) {
        errorMessage += "Rate limit exceeded. Please try again later.";
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        errorMessage += "Network error. Please check your connection.";
      } else {
        errorMessage += error.message;
      }

      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: errorMessage,
        timestamp: new Date(),
        model: selectedModel
      };
      
      addMessage(errorMsg);
      setChatError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // API Key Settings Handlers
  const handleSaveApiKey = async () => {
    if (!tempApiKey.trim()) {
      setChatError("Please enter a valid API key");
      return;
    }

    const isValid = await verifyApiKey(tempApiKey);
    
    if (isValid) {
      setApiKeySettings({
        key: tempApiKey,
        isVerified: true,
        lastVerified: new Date()
      });
      setShowSettings(false);
      setTempApiKey("");
      setChatError(null);
      
      const successMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "API key verified and saved successfully! You can now use your personal API key for all requests.",
        timestamp: new Date(),
        model: selectedModel
      };
      
      addMessage(successMessage);
    } else {
      setChatError("Invalid API key. Please check and try again.");
    }
  };

  const handleRemoveApiKey = () => {
    setApiKeySettings(null);
    setShowSettings(false);
    setChatError(null);
    
    const removeMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "API key removed. Using default key for requests.",
      timestamp: new Date(),
      model: selectedModel
    };
    
    addMessage(removeMessage);
  };

  // Loading state while checking authentication
  if (loading || historyLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 animate-spin text-purple-500" size={48} />
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading your chat...
          </p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className={`text-center p-8 rounded-2xl shadow-xl backdrop-blur-sm border transition-colors duration-300 max-w-md ${
          theme === 'dark'
            ? 'bg-gray-800/30 border-gray-600/30'
            : 'bg-white/30 border-gray-200/30'
        }`}>
          <LogIn className="mx-auto mb-4 text-purple-500" size={48} />
          <h3 className={`text-2xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Sign In Required
          </h3>
          <p className={`text-lg mb-6 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Please sign in to start chatting with the AI assistant. Your conversations will be securely saved to your account.
          </p>
          <div className="space-y-3">
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Benefits of signing in:
            </p>
            <ul className={`text-sm text-left space-y-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <li>• Chat history saved across devices</li>
              <li>• Private and secure conversations</li>
              <li>• Access to all AI models</li>
              <li>• Conversation analytics</li>
            </ul>
          </div>
        </div>
      </div>
    );
  } */
/*
  return (
    <div className="h-full flex flex-col">
      {/* Header }*/
/*
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h2
            className="text-3xl font-bold text-transparent bg-clip-text leading-relaxed transition-all duration-300"
            style={{
              backgroundImage: theme === "dark" 
                ? "linear-gradient(to right, #22d3ee, #a855f7, #ec4899)"
                : "linear-gradient(to right, #9333ea, #db2777, #dc2626)"
            }}
          >
            AI Assistant
          </h2>
          
          <button
            onClick={handleNewChat}
            className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-400 hover:to-green-600'
                : 'bg-gradient-to-r from-green-600 to-green-800 text-white hover:from-green-500 hover:to-green-700'
            }`}
            title="Start New Chat"
          >
            <Plus size={20} />
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <p className={`text-lg ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
            Powered by {selectedModel}
          </p>
          <button
            onClick={() => setShowSettings(true)}
            className={`p-2 rounded-lg transition-all duration-300 ${
              theme === 'dark'
                ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/20'
                : 'text-purple-600 hover:text-purple-700 hover:bg-purple-500/20'
            }`}
            title="API Settings"
          >
            <Settings size={20} />
          </button>
        </div>
        
        {/* Status indicators }*/
/*
        <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
            apiKeySettings?.isVerified
              ? 'bg-green-500/20 text-green-400'
              : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            <Shield size={12} />
            {apiKeySettings?.isVerified ? 'Using Personal API Key' : 'Using Default API Key'}
          </div>
          
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
            theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500/20 text-blue-600'
          }`}>
        Logged in as {user?.email}
          </div>
          
          {session && session.messages.length > 0 && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
              theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-500/20 text-purple-600'
            }`}>
              Auto-saving to your account
            </div>
          )}
        </div>
      </div>

      {/* Error Display }*/
/*
      {(chatError || authErrorRef.current) && (
        <div className={`mb-4 p-4 rounded-xl border flex items-start gap-3 ${
          theme === 'dark'
            ? 'bg-red-500/10 border-red-500/30 text-red-300'
            : 'bg-red-500/10 border-red-500/30 text-red-700'
        }`}>
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{chatError || (authErrorRef.current?.message)}</p>
          </div>
          <button
            onClick={() => setChatError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            ×
          </button>
        </div>
      )}

      {/* Settings Modal }*/
      /*
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl shadow-2xl border ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-600'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                API Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className={`text-gray-400 hover:text-gray-600 transition-colors`}
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  OpenRouter API Key
                </label>
                <div className="relative">
                  <Key className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  <input
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="sk-or-v1-..."
                    className={`
                      w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all duration-300
                      ${theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 focus:border-purple-500 focus:ring-purple-500/20 text-white'
                        : 'bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 text-gray-900'
                      }
                    `}
                  />
                </div>
                <p className={`text-xs mt-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Get your API key from <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">OpenRouter.ai</a>
                </p>
              </div>

              {apiKeySettings && (
                <div className={`p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-500/10 border border-green-500/30'
                }`}>
                  <p className="text-green-400 text-sm">
                    Current API key verified on {apiKeySettings.lastVerified?.toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSaveApiKey}
                  disabled={isVerifyingKey || !tempApiKey.trim()}
                  className={`
                    flex-1 px-4 py-3 text-white font-semibold rounded-xl
                    transition-all duration-300 focus:outline-none focus:ring-2
                    ${isVerifyingKey || !tempApiKey.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : theme === 'dark'
                        ? 'bg-gradient-to-r from-purple-500 to-purple-700 focus:ring-purple-500'
                        : 'bg-gradient-to-r from-purple-600 to-purple-800 focus:ring-purple-600'
                    }
                  `}
                >
                  {isVerifyingKey ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    'Save & Verify'
                  )}
                </button>

                {apiKeySettings && (
                  <button
                    onClick={handleRemoveApiKey}
                    className={`px-4 py-3 font-semibold rounded-xl transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                        : 'bg-red-500/20 text-red-700 hover:bg-red-500/30'
                    }`}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages }*/
      /*
      <div className={`flex-1 overflow-y-auto space-y-4 p-6 rounded-2xl shadow-xl backdrop-blur-sm border transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-gray-800/30 border-gray-600/30'
          : 'bg-white/30 border-gray-200/30'
      }`}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl shadow-lg transition-all duration-300 ${
                msg.role === "user"
                  ? theme === "dark"
                    ? "bg-gradient-to-r from-purple-400 to-purple-700 text-white"
                    : "bg-gradient-to-r from-purple-700 to-purple-900 text-white"
                  : theme === "dark"
                    ? "bg-gray-700/50 text-gray-100 border border-gray-600/30"
                    : "bg-gray-100/80 text-gray-900 border border-gray-200/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <strong className={`text-sm font-medium ${
                  msg.role === "user" 
                    ? "text-white/90" 
                    : theme === "dark" 
                      ? "text-purple-300" 
                      : "text-purple-700"
                }`}>
                  {msg.role === "user" ? "You" : "Assistant"}
                </strong>
                <span className={`text-xs ${
                  msg.role === "user" 
                    ? "text-white/70" 
                    : theme === "dark" 
                      ? "text-gray-400" 
                      : "text-gray-500"
                }`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>
              {msg.model && msg.role === 'assistant' && (
                <div className={`text-xs mt-2 pt-2 border-t ${
                  theme === 'dark' ? 'border-gray-600/30 text-gray-400' : 'border-gray-200/50 text-gray-500'
                }`}>
                  Model: {msg.model}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading indicator }*/
        /*
        {isLoading && (
          <div className="flex justify-start">
            <div className={`p-4 rounded-2xl shadow-lg ${
              theme === "dark"
                ? "bg-gray-700/50 text-gray-100 border border-gray-600/30"
                : "bg-gray-100/80 text-gray-900 border border-gray-200/50"
            }`}>
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-purple-500" />
                <span className="text-sm">Assistant is typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {Input} */
      /*
      <div className="mt-6 flex gap-3">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isAuthenticated ? "Type a message or /help for commands..." : "Please sign in to start chatting..."}
            disabled={isLoading || !isAuthenticated}
            maxLength={4000}
            className={`
              w-full text-lg py-4 px-4 pr-12 rounded-xl border-2 
              bg-transparent focus:outline-none focus:ring-2 transition-all duration-300
              border-purple-300 focus:border-pink-500 focus:ring-pink-400 
              dark:border-purple-700 dark:focus:border-pink-400 dark:focus:ring-pink-500
              text-gray-900 placeholder-gray-600 
              dark:text-white dark:placeholder-purple-300
              ${(isLoading || !isAuthenticated) ? 'cursor-not-allowed opacity-50' : ''}
            `}
          />
          <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {input.length}/4000
          </span>
        </div>
        
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim() || !isAuthenticated}
          className={`
            px-6 py-4 text-white font-semibold rounded-xl
            transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2
            ${(isLoading || !input.trim() || !isAuthenticated)
              ? 'bg-gray-400 cursor-not-allowed'
              : `hover:scale-105 ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-purple-400 to-purple-700 focus:ring-purple-500"
                    : "bg-gradient-to-r from-purple-700 to-purple-900 focus:ring-purple-600"
                }`
            }
          `}
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
      
      {/* Tips}*/
      /*
      <div className={`mt-4 text-center text-sm ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        Tip: Use Shift+Enter for new lines, or try commands like /help, /clear, /models
        <br />
        Your conversations are automatically saved to your account
      </div>
    </div> 
  );
}; 
*/
