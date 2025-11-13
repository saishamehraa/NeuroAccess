//import React, { useState, useMemo, useEffect } from 'react';
import { useState, useMemo } from 'react';
import { Search, Clock, MessageSquare, Brain, Trash2, Download, Play, AlertCircle, LogIn, Loader2, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { APP_URLS } from '../../utils/urls';
//import { useChatHistory, type ChatSession, type ChatMessage } from '../../hooks/useChatHistory';
import { useChatHistory, type ChatSession } from '../../hooks/useChatHistory';
//import { supabase } from '../../supabaseClient';
import MessageDisplay from '../chat/MessageDisplay';

interface HistoryProps {
  //onLoadSession?: (messages: ChatMessage[]) => void;
  onSwitchToChat?: () => void;
}

interface SessionViewerProps {
  session: ChatSession;
  onBack: () => void;
  theme: 'dark' | 'light';
}

function SessionViewer({ session, onBack, theme }: SessionViewerProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header with Back Button and Title */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-600/30">
        <button
          onClick={onBack}
          className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-200 hover:bg-gray-500/20' : 'text-gray-700 hover:bg-gray-900/10'}`}
          title="Back to History"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {session.title}
        </h2>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {session.messages.map((msg) => (
          <MessageDisplay
            key={msg.id}
            message={msg}
            isDark={theme === 'dark'}
            // We pass undefined for props that don't apply in this read-only view
            AssistantAvatar={undefined}
            onEditMessage={undefined}
            onShareMessage={undefined}
          />
        ))}
        {session.messages.length === 0 && (
           <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
             This chat session has no messages.
           </p>
        )}
      </div>
    </div>
  );
}

/* export function History({ onLoadSession, onSwitchToChat }: HistoryProps) { */
export function History({ onSwitchToChat }: HistoryProps) {
  const { theme } = useTheme();
  //const [user, setUser] = useState<any>(null);
  //const [loading, setLoading] = useState(true);
 // const { sessions, isLoading, loadSession, deleteSession, isAuthenticated } = useChatHistory();
  const { sessions, isLoading, deleteSession, isAuthenticated } = useChatHistory();

  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

  const showNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 3000);
  };

  const findPromptForSession = (session: ChatSession): string | null => {
    for (const m of session.messages) {
      // @ts-ignore
      if (m.metadata && m.metadata.prompt_id) return String(m.metadata.prompt_id);
      if (typeof m.content === 'string') {
        const match = m.content.match(/prompt:\s*#?(\w[-\w]*)/i);
        if (match) return match[1];
      }
    }
    return null;
  };

  const filteredSessions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(s => (s.title || '').toLowerCase().includes(q) || (s.preview || '').toLowerCase().includes(q));
  }, [sessions, searchTerm]);

  /* const handleLoad = async (session: ChatSession) => {
    try {
      const messages = await loadSession(session.id);
      if (onLoadSession) onLoadSession(messages || []);
      if (onSwitchToChat) onSwitchToChat();
    } catch (e) {
      console.error('Load failed', e);
      showNotification('Failed to load conversation');
    }
  }; */
  const handleLoad = (session: ChatSession) => {
    setSelectedSession(session);
  };

  const handleDelete = async (sessionId: string) => {
    setDeleteLoading(sessionId);
    try {
      await deleteSession(sessionId);
      showNotification('Conversation deleted successfully');
    } catch (e) {
      console.error('Delete failed', e);
      showNotification('Failed to delete conversation');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDownload = (session: ChatSession) => {
    try {
      const content = session.messages.map(msg => `[${new Date(msg.timestamp).toLocaleString()}] ${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification('Conversation downloaded successfully');
    } catch (e) {
      console.error('Download failed', e);
      showNotification('Failed to download conversation');
    }
  };

  /* if (loading || isLoading) { */
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 animate-spin text-purple-500" size={48} />
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading your chat history...</p>
        </div>
      </div>
    );
  }
/*
  // ensure we have the Supabase session / user
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setUser(data?.session?.user || null);
      } catch (e) {
        console.warn('Failed to get Supabase session', e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: { user?: any } | null) => {
      setUser((session as any)?.user || null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      try {
        // older/newer supabase client shapes differ; guard access
        // @ts-ignore
        listener?.subscription?.unsubscribe?.();
      } catch {}
    };
  }, []);
*/

 /* if (!user) { */
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Chat History</h2>
          <div className={`mx-auto max-w-md p-8 rounded-2xl shadow-xl backdrop-blur-sm border ${theme === 'dark' ? 'bg-gray-800/30 border-gray-600/30' : 'bg-white/30 border-gray-200/30'}`}>
            <LogIn className="mx-auto mb-4 text-purple-500" size={48} />
            <h3 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sign In Required</h3>
            <p className={`text-lg mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Please sign in to view your chat history.</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedSession) {
    return (
      <SessionViewer
        session={selectedSession}
        onBack={() => setSelectedSession(null)}
        theme={theme}
      />
    );
  }

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 ${theme === 'dark' ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-green-500/10 border-green-500/30 text-green-700'}`}>
          <AlertCircle size={20} />
          <span>{notification}</span>
        </div>
      )}

      {/*<div className="text-center">
        <h2 className="text-4xl font-bold mb-2 text-gradient inline-block">Chat History</h2>
        <p className={`text-lg ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>Review and manage your previous conversations</p>
      </div>
*/}
      <div className="text-center mb-8">
        <h2 className={`text-5xl font-extrabold mb-4 inline-block pb-2 tracking-tight drop-shadow-lg bg-clip-text text-transparent ${
         theme === 'dark' 
          ? 'bg-gradient-to-r from-white via-purple-200 to-blue-400' 
           : 'bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500'
          }`}>
          Chat History
        </h2>
        <p className={`text-lg font-medium ${theme === 'dark' ? 'text-purple-200/70' : 'text-purple-700'}`}>
          Review and manage your previous conversations
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
        {/*  <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search conversations..." className="w-full pl-10 pr-4 py-3 rounded-xl border-2" /> */}
        <input 
         value={searchTerm} 
         onChange={(e) => setSearchTerm(e.target.value)} 
         placeholder="Search conversations..." 
         className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 outline-none transition-all ${
         theme === 'dark' 
         ? 'bg-black/20 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
         : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-purple-500'
        }`} 
        />
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSearchTerm('')} className={`px-4 py-2 rounded-lg bg-white/20`}>Clear</button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredSessions.map((session) => {
          const promptId = findPromptForSession(session);
          return (
            <div key={session.id} className={`p-6 rounded-2xl shadow-xl border ${theme === 'dark' ? 'bg-gray-800/30 border-gray-600/30' : 'bg-white/30 border-gray-200/30'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{session.title}</h3>
                    {promptId && (
                      <a href={`${APP_URLS.promptgallery}?id=${encodeURIComponent(promptId)}`} className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Prompt: {promptId}</a>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
  theme === 'dark' 
    ? 'bg-purple-500/20 border-purple-500/30 text-purple-100' 
    : 'bg-purple-100 border-purple-200 text-purple-700'
}`}>
  {session.model}
</span>
                    {session.isActive && (<span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">Current</span>)}
                  </div>

                  <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{session.preview}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Clock size={16} />
                      {new Date(session.timestamp).toLocaleString()}
                    </div>
                    <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      <MessageSquare size={16} />
                      {session.messageCount} message{session.messageCount !== 1 ? 's' : ''}
                    </div>
                    <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Brain size={16} />
                      AI Assistant
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => handleLoad(session)} className="p-2 rounded-lg text-gradient"> <Play size={18} /> </button>
                  <button onClick={() => handleDownload(session)} className="p-2 rounded-lg text-gradient"> <Download size={18} /> </button>
                  <button onClick={() => handleDelete(session.id)} disabled={deleteLoading === session.id} className="p-2 rounded-lg text-gradient"> {deleteLoading === session.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />} </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className={`mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} size={48} />
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{sessions.length === 0 ? 'No conversations yet' : 'No conversations found'}</p>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{sessions.length === 0 ? 'Start a new conversation in the Chat section to see it saved here' : 'Try adjusting your search or filters'}</p>

          {sessions.length === 0 && onSwitchToChat && (
            <button onClick={onSwitchToChat} className={`mt-4 px-6 py-3 rounded-xl font-semibold ${theme === 'dark' ? 'bg-gradient-to-r from-purple-400 to-purple-700 text-white' : 'bg-gradient-to-r from-purple-600 to-purple-800 text-white'}`}>
              Start Your First Chat
            </button>
          )}
        </div>
      )}
    </div>
  );
}