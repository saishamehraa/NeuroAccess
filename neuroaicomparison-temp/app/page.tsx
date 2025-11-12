"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useLocalStorage } from '@/lib/useLocalStorage';
import { mergeModels, useCustomModels, makeCustomModel } from '@/lib/customModels';
import { ChatMessage, ApiKeys, ChatThread, AiModel } from '@/lib/types';
import { useProjects } from '@/lib/useProjects';
import ModelsModal from '@/components/modals/ModelsModal';
import { ChatInterface, ChatInterfaceRef } from '@/components/chat-interface';
import { useAuth } from '@/lib/auth';
import AuthModal from '@/components/modals/AuthModal';
import { cn } from '@/lib/utils'
import ThreadSidebar from '@/components/chat/ThreadSidebar'
import HomeAiInput from '@/components/home/HomeAiInput'
import { fetchThreads, createThread as createThreadDb, addMessage as addMessageDb, deleteThread as deleteThreadDb } from '@/lib/db'
import { createChatActions } from '@/lib/chatActions'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Menu, Layers } from 'lucide-react'
import Link from 'next/link'
import GithubStar from '@/components/app/GithubStar'
import ThemeToggle from '@/components/ThemeToggle'
import CustomModels from '@/components/modals/CustomModels'
import Settings from '@/components/app/Settings'
import HeaderBar from '@/components/app/HeaderBar'
import FirstVisitNote from '@/components/app/FirstVisitNote'
import LaunchScreen from '@/components/ui/LaunchScreen'
import { useTheme } from '@/lib/themeContext'
import { BACKGROUND_STYLES } from '@/lib/themes'
import SupportDropdown from '@/components/support-dropdown'
import Image from 'next/image';
import brand from '@/public/brand.jpg';
import image from '@/public/image.jpg';
import type { StaticImageData } from 'next/image';
import { safeUUID } from "@/lib/uuid";
import { useSearchParams } from 'next/navigation';
import { MODEL_CATALOG } from "@/lib/models";
import { toast } from 'react-toastify';



export default function NeuroAIComparisonChat() {
  const { user, loading } = useAuth()
  const { theme } = useTheme()
  const isDark = theme.mode === 'dark'
  const [isHydrated, setIsHydrated] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false)
  const [modelModalOpen, setModelModalOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [threads, setThreads] = useLocalStorage<ChatThread[]>('neuroaicomparison:threads', [])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [editingMessage, setEditingMessage] = useState<string>('')
  const [apiKeys] = useLocalStorage<ApiKeys>('neuroaicomparison:api-keys', {})
  const [customModels, setCustomModels] = useCustomModels()
  const [favoriteIds, setFavoriteIds] = useLocalStorage<string[]>('neuroaicomparison:favorite-models', [
  'unstable-gpt-5-chat', 'unstable-claude-sonnet-4', 'gemini-2.5-pro', 'unstable-grok-4', 'open-evil',
]);
const [recentModelIds, setRecentModelIds] = useLocalStorage<string[]>('neuroaicomparison:recent-models', []);
  const searchParams = useSearchParams();
  const modelIdFromUrl = searchParams.get('model');
  const [selectedHomeModelId, setSelectedHomeModelId] = useLocalStorage<string>('neuroaicomparison:selected-home-model', 'open-evil')
  // First-visit modal
  const [firstVisitSeen, setFirstVisitSeen] = useLocalStorage<boolean>('neuroaicomparison:first-visit-seen', false)
  const [showFirstVisit, setShowFirstVisit] = useState<boolean>(() => !firstVisitSeen)
  
  
  const {
    projects,
    activeProjectId,
    createProject,
    updateProject,
    deleteProject,
    selectProject,
  } = useProjects()
  
  // Get active thread (only home threads)
  const homeThreads = useMemo(() => 
    threads.filter(t => t.pageType === 'home'),
    [threads]
  )
  
  const visibleHomeThreads = useMemo(() => threads.filter(t => t.pageType === 'home' && (!activeProjectId || t.projectId === activeProjectId)), [threads, activeProjectId])

  const activeModelId = useMemo(() => {
    return modelIdFromUrl || selectedHomeModelId;
  }, [modelIdFromUrl, selectedHomeModelId]);

  const activeThread = useMemo(() => threads.find((t) => t.id === activeThreadId), [threads, activeThreadId])
  const allModels = useMemo(() => mergeModels(customModels), [customModels])
  const selectedHomeModel: AiModel | undefined = useMemo(
    () => allModels.find((m) => m.id === activeModelId) || allModels[0],
    [allModels, activeModelId]
  )

  useEffect(() => {
  if (!modelIdFromUrl) return; // No model in URL, do nothing

  const MAX_RECENTS = 5; // Set how many recent models to keep

  // Function to update recents
  const updateRecents = () => {
    setRecentModelIds(prev => 
      [modelIdFromUrl, ...prev.filter(id => id !== modelIdFromUrl)].slice(0, MAX_RECENTS)
    );
  };

  // Check if we already know this model
  const isKnown = allModels.some(m => m.id === modelIdFromUrl);

  if (isKnown) {
    // Model is known, just add it to recents
    updateRecents();
    return; // Done
  }

  // Model is NOT known. We must add it as a new custom model AND add to recents.

  // Create a simple label from the ID, e.g., "alibaba/tongyi..." -> "Alibaba"
  const newLabel = modelIdFromUrl
    .split('/')[0]
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  const newModel = makeCustomModel(newLabel || "New Model", modelIdFromUrl);

  // 1. Add it to custom models
  setCustomModels(prev => [...prev, newModel]);

  // 2. Add it to recents
  updateRecents();

  toast.success(`New model "${newLabel}" was added to Recents!`);

}, [modelIdFromUrl, allModels, setCustomModels, setRecentModelIds]);
  
  // Auto-select first model if none selected
  useEffect(() => {
    if (!selectedHomeModelId && allModels.length > 0) {
      setSelectedHomeModelId(allModels[0].id);
    }
  }, [selectedHomeModelId, allModels, setSelectedHomeModelId])

  // Splash timing like compare
  useEffect(() => {
    setIsHydrated(true)
    const t = setTimeout(() => setShowSplash(false), 350)
    return () => clearTimeout(t)
  }, [])

  // Keep showFirstVisit in sync with storage
  useEffect(() => {
    setShowFirstVisit(!firstVisitSeen)
  }, [firstVisitSeen])

  const chatRef = useRef<ChatInterfaceRef | null>(null)

  // State for chat actions - disabled to prevent duplicate loading animations
  const [loadingIds, setLoadingIds] = useState<string[]>([])
  const [loadingIdsInit, setLoadingIdsInit] = useState<string[]>([])

  // Create chat actions for handling AI responses
  const chatActions = useMemo(() => {
    if (!activeThread) {
      return null;
    }
    return createChatActions({
      threads,
      setThreads,
      activeThread,
      setActiveId: setActiveThreadId,
      setLoadingIds: () => {}, // Disabled - using ChatInterface loading instead
      setLoadingIdsInit: () => {}, // Disabled - using ChatInterface loading instead
      selectedModels: selectedHomeModel ? [selectedHomeModel] : [],
      keys: apiKeys,
      userId: user?.id || undefined,
    })
  }, [activeThread, selectedHomeModel, apiKeys, user?.id, threads])

  // Load threads from Supabase when user is authenticated
  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setThreads([])
        setActiveThreadId(null)
        return
      }
      try {
        const dbThreads = await fetchThreads(user.id)
        setThreads(dbThreads)
        // Keep current active if still present, else pick most recent home thread
        if (dbThreads.length > 0) {
          const homeThreads = dbThreads.filter(t => t.pageType === 'home')
          const preferredThread = activeProjectId 
            ? homeThreads.find(t => t.projectId === activeProjectId)
            : homeThreads[0]
          setActiveThreadId((prev) => {
            if (prev && dbThreads.some(t => t.id === prev && t.pageType === 'home')) {
              return prev
            }
            return preferredThread?.id || null
          })
        } else {
          setActiveThreadId(null)
        }
      } catch (e) {
        console.warn('Failed to load threads from Supabase:', e)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, activeProjectId])

  // Header shows no brand logo; the chat avatar displays model logo instead

  // Handle edit message functionality
  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessage(content)
  }

  // Handle share message functionality  
  const handleShareMessage = (message: ChatMessage) => {
    if (!activeThread) return;
    
    // Create a temporary thread with just this message for sharing
    const messageThread: ChatThread = {
      ...activeThread,
      messages: [message],
      title: `Shared Message: ${message.content.slice(0, 50)}...`
    };
    
    // Use the ShareButton logic directly
    import('@/lib/sharing/shareService').then(({ ShareService }) => {
      const shareService = new ShareService();
      shareService.generateShareableUrl(messageThread).then(result => {
        if (result.success && result.url) {
          shareService.copyToClipboard(result.url).then(copySuccess => {
            if (copySuccess) {
              const { toast } = require('react-toastify');
              toast.success("Message link copied to clipboard!");
            } else {
              const { toast } = require('react-toastify');
              toast.info("Clipboard access failed. Link: " + result.url);
            }
          });
        } else {
          const { toast } = require('react-toastify');
          toast.error(result.error || "Failed to create share link");
        }
      });
    });
  }

  // Replace the entire handleSubmit function in page.tsx with this one

const handleSubmit = async (text: string, fileDataUrl?: string) => {
  const content = text.trim();
  if (!content && !fileDataUrl) {
    chatRef.current?.setLoading(false);
    return;
  }

  if (!user) {
    setAuthModalOpen(true);
    chatRef.current?.setLoading(false);
    return;
  }

  setEditingMessage('');

  let threadToUpdate: ChatThread | undefined = activeThread;

  // If there's no active thread, create one and use it for this submission.
  if (!threadToUpdate) {
    try {
      const newTitle = content.length > 60 ? content.slice(0, 57) + '…' : content;
      const createdThread = await createThreadDb({
        userId: user.id,
        title: newTitle,
        projectId: activeProjectId || null,
        pageType: 'home',
        initialMessage: null,
      });
      setThreads((prev) => [createdThread, ...prev]);
      setActiveThreadId(createdThread.id);
      threadToUpdate = createdThread; // Use the newly created thread object directly
    } catch (e) {
      console.error('❌ Failed to create thread:', e);
      chatRef.current?.setLoading(false);
      return;
    }
  }

  const modelType = selectedHomeModel?.category || 'text';
  chatRef.current?.setLoading(true, { 
    modelLabel: selectedHomeModel?.label,
    modelType: modelType as 'text' | 'image' | 'audio'
  });

  if (threadToUpdate && selectedHomeModel) {
    const currentChatActions = createChatActions({
      threads,
      setThreads,
      activeThread: threadToUpdate, // Use the definite thread object
      setActiveId: setActiveThreadId,
      setLoadingIds: () => {},
      setLoadingIdsInit: () => {},
      selectedModels: [selectedHomeModel],
      keys: apiKeys,
      userId: user?.id || undefined,
    });
    
    try {
      // The `send` action will now correctly add the user message to the new thread
      await currentChatActions.send(content, fileDataUrl); 
      
      // The logic to save the assistant's response should be inside chatActions,
      // but we still need to save the initial user message.
      if (user?.id && threadToUpdate?.id) {
        const userMsg: ChatMessage = {
          id: safeUUID(),
          role: 'user', 
          content: content, 
          ts: Date.now(),
          file: fileDataUrl, // Also save the file with the user message
          response: '', // Satisfy the ChatMessage type
        };
        try {
          await addMessageDb({
            userId: user.id,
            chatId: threadToUpdate.id,
            message: userMsg,
          });
        } catch (e) {
          console.error('Failed to save user message to DB:', e);
        }
      }
      
    } catch (e) {
      console.error('❌ Failed to send message via chat actions:', e);
    } finally {
      // Ensure loading is always turned off
      chatRef.current?.setLoading(false);
    }
  } else {
    console.warn('⚠️ Cannot send message - no thread or model:', { 
      hasThreadToUpdate: !!threadToUpdate, 
      hasSelectedModel: !!selectedHomeModel 
    });
    chatRef.current?.setLoading(false);
  }
}; 

  /* // When user submits text, also record it into a thread shown in the sidebar
  const handleSubmit = async (text: string, fileDataUrl?: string) => {
    const content = text.trim()
    if (!content && !fileDataUrl) {
      // Ensure loader is off for empty submissions
      chatRef.current?.setLoading(false)
      return;
    }
    
    // Check if user is authenticated
    if (!user) {
      setAuthModalOpen(true)
      // Ensure loader is off if auth required
      chatRef.current?.setLoading(false)
      return
    }
    
    // Clear editing state when submitting
    setEditingMessage('')
    
    // Create thread if none exists
    if (!activeThreadId) {
      try {
        const newTitle = content.length > 60 ? content.slice(0, 57) + '…' : content
        const created = await createThreadDb({
          userId: user.id,
          title: newTitle,
          projectId: activeProjectId || null,
          pageType: 'home',
          initialMessage: null,
        })
        setThreads((prev) => [created, ...prev])
        setActiveThreadId(created.id)
      } catch (e) {
        console.error('❌ Failed to create thread:', e)
        return;
      }
    }
    
    // Show loading dots immediately with model type detection
    const modelType = selectedHomeModel?.category || 'text'
    chatRef.current?.setLoading(true, { 
      modelLabel: selectedHomeModel?.label,
      modelType: modelType as 'text' | 'image' | 'audio'
    })

    // Get current thread immediately - no timeout needed
    const currentThread = threads.find(t => t.id === activeThreadId) || threads.find(t => t.id === threads[0]?.id);
    if (currentThread && selectedHomeModel) {
      const currentChatActions = createChatActions({
        threads,
        setThreads,
        activeThread: currentThread,
        setActiveId: setActiveThreadId,
        setLoadingIds: () => {}, // Disabled - using ChatInterface loading instead
        setLoadingIdsInit: () => {}, // Disabled - using ChatInterface loading instead
        selectedModels: [selectedHomeModel],
        keys: apiKeys,
        userId: user?.id || undefined,
      });
      
      try {
        await currentChatActions.send(content)
        
        // Save user message to database
        if (user?.id && currentThread?.id) {
          const userMsg: ChatMessage = {
            id: safeUUID(),
            role: 'user', 
            content: content, 
            ts: Date.now() 
          };
          try {
            await addMessageDb({
              userId: user.id,
              chatId: currentThread.id,
              message: userMsg,
            });
          } catch (e) {
            console.error('Failed to save user message to DB:', e);
          }
        }
        
        // Clear loading immediately after send completes
        chatRef.current?.setLoading(false)
      } catch (e) {
        console.error('❌ Failed to send message via chat actions:', e)
        chatRef.current?.setLoading(false)
      }
    } else {
      console.warn('⚠️ Cannot send message - no thread or model:', { 
        hasCurrentThread: !!currentThread, 
        hasSelectedModel: !!selectedHomeModel 
      });
      chatRef.current?.setLoading(false)
    }
  } */

  // Expose handlers to window for ChatInterface to access
 /* useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).handleEditMessage = handleEditMessage;
      (window as any).handleShareMessage = handleShareMessage;
      (window as any).handleSubmit = handleSubmit;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).handleEditMessage;
        delete (window as any).handleShareMessage;
        delete (window as any).handleSubmit;
      }
    }
  }, [handleSubmit]); */



  // Load messages into ChatInterface when active thread changes
  useEffect(() => {
    if (chatRef.current && activeThread) {
      // Always load messages, even if empty array
      const convertedMessages = (activeThread.messages || []).map((msg, index) => {
        const base = {
         // id: `${activeThread.id}-${msg.ts || Date.now()}-${index}`,
          id: msg.id,
          content: msg.content,
          role: msg.role as "user" | "assistant",
          timestamp: new Date(msg.ts || Date.now()),
          file: msg.file,
          fileName: msg.fileName,
          fileSize: msg.fileSize,
        } as any
        if (msg.role === 'assistant') {
          const id = (msg.modelId || '').toLowerCase()
          const prov = (msg.provider || '').toLowerCase()
          const txt = `${id} ${prov}`
         let avatarUrl: string = brand.src;

let avatarAlt = 'AI Assistant';

if (/openai|\bgpt\b|^gpt-|\bo3\b|\bo4\b/.test(txt)) {
  avatarUrl = 'https://cdn.simpleicons.org/openai/ffffff';
  avatarAlt = 'OpenAI / ChatGPT';
} else if (/anthropic|claude/.test(txt)) {
  avatarUrl = 'https://cdn.simpleicons.org/anthropic/ffffff';
  avatarAlt = 'Anthropic / Claude';
} else if (/grok|xai/.test(txt)) {
  avatarUrl = 'https://cdn.simpleicons.org/x/ffffff';
  avatarAlt = 'Grok / xAI';
}

          return { ...base, avatarUrl, avatarAlt }
        }
        return base
      });
      chatRef.current.loadMessages(convertedMessages);
    }
  }, [activeThread?.id, activeThread?.messages]);

  return (
    <div className={cn("min-h-screen w-full relative", isDark ? "dark" : "")}> 
      {/* Background (theme-driven) */}
      <div className={`${BACKGROUND_STYLES[theme.background].className} absolute inset-0 z-0`} />

      {/* Soft vignette for dark mode */}
      {isDark && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)",
            opacity: 0.95,
          }}
        />
      )}

      {/* LaunchScreen splash overlay (same as compare page) */}
      {showSplash && (
        <div className="fixed inset-0 z-[9999]">
          <LaunchScreen backgroundClass={BACKGROUND_STYLES[theme.background].className} dismissed={isHydrated} />
        </div>
      )}


      <div className="relative z-10 px-3 lg:px-4 py-4 lg:py-6">
        <div className="flex gap-3 lg:gap-4">
          {/* Sidebar */}
          <ThreadSidebar
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            threads={visibleHomeThreads}
            activeId={activeThreadId}
            onSelectThread={(id) => setActiveThreadId(id)}
            onNewChat={async () => {
              if (!user) {
                setAuthModalOpen(true)
                return
              }
              try {
                const created = await createThreadDb({
                  userId: user.id,
                  title: 'New Chat',
                  projectId: activeProjectId || null,
                  pageType: 'home',
                  initialMessage: null,
                })
                setThreads(prev => [created, ...prev])
                setActiveThreadId(created.id)
              } catch (e) {
                console.error('Failed to create new chat:', e)
              }
            }}
            mobileSidebarOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            onOpenMobile={() => setMobileSidebarOpen(true)}
            onDeleteThread={async (id) => {
              if (!user?.id) return;
              try {
                await deleteThreadDb(user.id, id);
              } catch (e) {
                console.warn('Failed to delete home thread in DB, removing locally:', e);
              }
              setThreads((prev) => {
                const next = prev.filter((t) => t.id !== id);
                if (activeThreadId === id) {
                  const inScope = next.filter((t) => t.pageType === 'home');
                  const nextInScope =
                    (activeProjectId ? inScope.find((t) => t.projectId === activeProjectId) : inScope[0])
                      ?.id ?? null;
                  setActiveThreadId(nextInScope);
                }
                return next;
              });
            }}
            selectedModels={selectedHomeModel ? [selectedHomeModel] : []}
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={selectProject}
            onCreateProject={createProject}
            onUpdateProject={updateProject}
            onDeleteProject={deleteProject}
          />

          {/* Main Content */}
          <div className="flex-1 min-w-0 flex flex-col h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] overflow-hidden relative">
            {/* Mobile Header with Hamburger */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-r from-white/12 to-white/8 border border-white/15 text-white hover:from-white/18 hover:to-white/12 hover:border-white/25 backdrop-blur-sm shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Open menu"
                title="Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {/* Right: Compare (small) + Actions trigger (mobile) */}
              <div className="relative flex items-center gap-2">
                <Link
                  href="/compare"
                  className="inline-block bg-red-950 text-red-400 border border-red-400 border-b-2 font-medium overflow-hidden relative px-2 py-1 rounded-md hover:brightness-150 hover:border-t-2 hover:border-b active:opacity-75 outline-none duration-300 group text-[10px]"
                >
                  <span className="bg-red-400 shadow-red-400 absolute -top-[150%] left-0 inline-flex w-40 h-[3px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                  Compare Models
                </Link>
                <button
                  onClick={() => setMobileActionsOpen((v) => !v)}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-white/15 bg-white/5 hover:bg-white/10 shadow"
                  aria-label="Open quick actions"
                  title="Actions"
                >
                  {/* simple 2x2 dots icon */}
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <circle cx="7" cy="7" r="2" />
                    <circle cx="17" cy="7" r="2" />
                    <circle cx="7" cy="17" r="2" />
                    <circle cx="17" cy="17" r="2" />
                  </svg>
                </button>

                {/* Inline Support button on mobile header */}
                <div className="sm:hidden">
                  <SupportDropdown theme={theme.mode === 'dark' ? 'dark' : 'light'} inline />
                </div>

                {mobileActionsOpen && (
                  <div className="absolute right-0 top-11 z-50 rounded-xl border border-white/15 bg-black/60 backdrop-blur-md shadow-xl p-2 flex items-center gap-2">
                    <button
                      onClick={() => { setModelModalOpen(true); setMobileActionsOpen(false); }}
                      className="inline-flex items-center gap-1.5 text-xs h-9 w-9 justify-center rounded-md border border-white/15 bg-white/5 hover:bg-white/10 shadow"
                      title="Change models"
                      aria-label="Change models"
                    >
                      <Layers size={14} />
                    </button>
                    <CustomModels compact />
                    <ThemeToggle compact />
                    <Settings compact />
                    <GithubStar owner="saishamehraa" repo="NeuroAccess" />
                  </div>
                )}
              </div>
            </div>
            {/* Top bar - Desktop only */}
            <div className="hidden lg:block">
              <HeaderBar
                onOpenMenu={() => setMobileSidebarOpen(true)}
                title="NeuroAIComparison"
                githubOwner="saishamehraa"
                githubRepo="NeuroAccess"
                onOpenModelsModal={() => setModelModalOpen(true)}
                showCompareButton
                className="-mr-3 sm:mr-0"
                hideHomeButton={true}
              />
            </div>
            {/* Use ChatInterface but hide its input; we provide HomeAiInput with model selector */}
            <ChatInterface
              className="flex-1 min-h-0"
              ref={chatRef}
              isDark={isDark}
              modelSelectorLabel={selectedHomeModel ? selectedHomeModel.label : "Choose model"}
              onOpenModelSelector={() => setModelModalOpen(true)}
              onSubmit={handleSubmit}
             initialValue={editingMessage}
             onClear={() => setEditingMessage('')}
             onEditMessage={handleEditMessage}
             onShareMessage={handleShareMessage}
            />
            <ModelsModal
              open={modelModalOpen}
              onClose={() => setModelModalOpen(false)}
              selectedIds={selectedHomeModel ? [selectedHomeModel.id] : []}
              selectedModels={selectedHomeModel ? [selectedHomeModel] : []}
              customModels={customModels}
              favoriteIds={favoriteIds}        
              setFavoriteIds={setFavoriteIds} 
              recentModelIds={recentModelIds}
              onToggle={(id) => {
                setSelectedHomeModelId((prev) => (prev === id ? "" : id))
                // Close after picking to mimic single-select UX
                setModelModalOpen(false)
              }}
            />
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />

      {/* First-visit note modal */}
      <FirstVisitNote
        open={showFirstVisit}
        onClose={() => {
          setFirstVisitSeen(true)
          setShowFirstVisit(false)
        }}
      />

      <ToastContainer
        position="bottom-right"
        autoClose={3003}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      {/* Support dropdown floating action at bottom-right - hidden on mobile */}
      <div className="hidden sm:block">
        <SupportDropdown theme={theme.mode === 'dark' ? 'dark' : 'light'} />
      </div>
    </div>
  )
}
