// hooks/useChatHistory.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  model: string;
  messageCount: number;
  messages: ChatMessage[];
  isActive?: boolean;
  lastUpdated: Date;
  userId: string;
}

// Supabase tables: chats, messages, prompts
const CHATS_TABLE = 'chats'
const MSGS_TABLE = 'messages'

export function useChatHistory() {
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const authMountedRef = useRef<boolean>(true)
  const loadMountedRef = useRef<boolean>(true)

  // Subscribe to Supabase auth session
  useEffect(() => {
  authMountedRef.current = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (!authMountedRef.current) return
        setUser(data?.session?.user || null)
      } catch (e) {
        console.warn('Failed to get Supabase session', e)
        setUser(null)
      }
    })()

    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: { user?: any } | null) => {
      setUser((session as any)?.user || null)
    })

    return () => {
      authMountedRef.current = false;
      try { (listener as any)?.subscription?.unsubscribe?.() } catch {}
    }
  }, [])

  // Map DB rows to ChatSession
  const mapChatRowToSession = (row: any, messages: any[] | null = []): ChatSession => {
    return {
      id: row.id,
      title: row.title || 'New Chat',
      preview: row.title || 'New Chat',
      timestamp: new Date(row.created_at),
      model: row.page_type || 'home',
      messageCount: (messages || []).length,
      messages: (messages || []).map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        model: m.model || undefined,
        timestamp: new Date(m.created_at)
      })),
      lastUpdated: new Date(row.updated_at || row.created_at),
      userId: row.owner_id
    }
  }

  // Load user's chat sessions from Supabase
  useEffect(() => {
    loadMountedRef.current = true;
    const load = async () => {
      if (!user?.id) {
        setSessions([])
        setCurrentSession(null)
        setIsLoading(false)
        setSessionsLoaded(false)
        setIsInitialized(false)
        return
      }

      setIsLoading(true)
      try {
        const { data: chats, error } = await supabase
          .from(CHATS_TABLE)
          .select('*')
          .eq('owner_id', user.id)
          .order('updated_at', { ascending: false })

        if (error) throw error

        if (!chats || chats.length === 0) {
          if (!loadMountedRef.current) return
          setSessions([])
          setSessionsLoaded(true)
          setIsLoading(false)
          setIsInitialized(true)
          return
        }

        const chatIds = chats.map((c: any) => c.id)
        const { data: messages, error: msgErr } = await supabase
          .from(MSGS_TABLE)
          .select('*')
          .in('chat_id', chatIds)
          .order('created_at', { ascending: true })

        if (msgErr) throw msgErr

        const messageMap = new Map<string, any[]>()
        for (const m of messages || []) {
          const list = messageMap.get(m.chat_id) || []
          list.push(m)
          messageMap.set(m.chat_id, list)
        }

  const mapped = chats.map((c: any) => mapChatRowToSession(c, messageMap.get(c.id) || []))
  if (!loadMountedRef.current) return
        setSessions(mapped)
        setSessionsLoaded(true)
        setIsLoading(false)

        // restore stored session if any
        if (!isInitialized) {
          const storedSessionId = localStorage.getItem(`currentSessionId_${user.id}`)
          if (storedSessionId && mapped.length > 0) {
            const activeSession = mapped.find((s: ChatSession) => s.id === storedSessionId)
            if (activeSession) setCurrentSession({ ...activeSession, isActive: true })
          }
          setIsInitialized(true)
        }
      } catch (e) {
        console.error('Failed to load chats from Supabase:', e)
        if (!loadMountedRef.current) return
        setSessions([])
        setIsLoading(false)
        setSessionsLoaded(true)
        setIsInitialized(true)
      }
    }
    load()

  return () => { loadMountedRef.current = false }
  }, [user, isInitialized])

  // Store current session ID in localStorage when it changes
  useEffect(() => {
    if (user && currentSession?.id && !currentSession.id.startsWith('temp_')) {
      localStorage.setItem(`currentSessionId_${user.id}`, currentSession.id);
    } else if (user && !currentSession) {
      localStorage.removeItem(`currentSessionId_${user.id}`);
    }
  }, [user, currentSession]);

  // Auto-save current session to Firebase
  const scheduleAutoSave = useCallback(() => {
    if (!user || !currentSession || currentSession.messages.length === 0) return

    if (autoSaveTimeout) clearTimeout(autoSaveTimeout)

    const timeout = setTimeout(async () => {
      try {
        await saveSessionToSupabase(currentSession)
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, 2000)

    setAutoSaveTimeout(timeout)
  }, [currentSession, user, autoSaveTimeout])

  // Save session to Firebase
  // Save session and its messages to Supabase
  const saveSessionToSupabase = async (session: ChatSession): Promise<ChatSession> => {
    if (!user) throw new Error('User not authenticated')

    // If temp id, create chat row first
    let chatId = session.id
    try {
      if (session.id.startsWith('temp_')) {
        const { data: chat, error } = await supabase
          .from(CHATS_TABLE)
          .insert({ owner_id: user.id, title: session.title, page_type: 'home' })
          .select('*')
          .single()
        if (error) throw error
        chatId = chat.id
      } else {
        // update title/updated_at
        const { error } = await supabase
          .from(CHATS_TABLE)
          .update({ title: session.title, updated_at: new Date().toISOString() })
          .eq('id', session.id)
          .eq('owner_id', user.id)
        if (error) console.warn('Failed to touch chat updated_at', error)
      }

      // Upsert messages - naive approach: insert any messages with ids not in DB
      const existing = await supabase.from(MSGS_TABLE).select('id').in('chat_id', [chatId])
      const existingIds = (existing.data || []).map((r: any) => r.id)

      const toInsert = session.messages.filter(m => !existingIds.includes(m.id)).map(m => ({
        id: m.id,
        chat_id: chatId,
        owner_id: user.id,
        role: m.role,
        content: m.content,
        model: m.model || null,
        content_json: null,
        metadata: null,
        created_at: m.timestamp.toISOString()
      }))

      if (toInsert.length > 0) {
        const { error: insertErr } = await supabase.from(MSGS_TABLE).insert(toInsert)
        if (insertErr) console.warn('Failed to insert messages', insertErr)
      }

      // return saved session representation
      const { data: chatRow } = await supabase.from(CHATS_TABLE).select('*').eq('id', chatId).single()
      const { data: msgs } = await supabase.from(MSGS_TABLE).select('*').eq('chat_id', chatId).order('created_at', { ascending: true })

      const mapped = mapChatRowToSession(chatRow, msgs)
      setCurrentSession(mapped)
      return mapped
    } catch (e) {
      console.error('Failed to save session to Supabase', e)
      throw e
    }
  }

  // Create a new session
  const createSession = useCallback((model: string): ChatSession => {
    if (!user) {
      throw new Error('User must be logged in to create a session')
    }

      const newSession: ChatSession = {
      id: `temp_${crypto.randomUUID()}`,
      title: 'New Conversation',
      preview: 'Start a new conversation...',
      timestamp: new Date(),
      model,
      messageCount: 0,
      messages: [],
      isActive: true,
      lastUpdated: new Date(),
      userId: user.id
    }

    setCurrentSession(newSession)
    return newSession
  }, [user])

  // Add a message to the current session
  const addMessage = useCallback((message: ChatMessage) => {
    if (!user) {
      console.error('User not authenticated - cannot add message')
      return
    }

    setCurrentSession(prevSession => {
      if (!prevSession) {
        const newSession: ChatSession = {
          id: `temp_${crypto.randomUUID()}`,
          title: 'New Conversation',
          preview: 'Start a new conversation...',
          timestamp: new Date(),
          model: message.model || 'unknown',
          messageCount: 1,
          messages: [message],
          isActive: true,
          lastUpdated: new Date(),
          userId: user.id
        }
        return newSession
      }

      const updatedMessages = [...prevSession.messages, message]
      let title = prevSession.title
      if (title === 'New Conversation' && message.role === 'user') {
        title = message.content.length > 50 ? message.content.substring(0, 50) + '...' : message.content
      }
      const preview = message.content.length > 100 ? message.content.substring(0, 100) + '...' : message.content

      return {
        ...prevSession,
        title,
        preview,
        messageCount: updatedMessages.length,
        messages: updatedMessages,
        lastUpdated: new Date()
      }
    })
  }, [user])

  // Trigger auto-save when current session changes
  useEffect(() => {
    if (currentSession && currentSession.messages.length > 0 && user && sessionsLoaded) {
      scheduleAutoSave()
    }
  }, [currentSession, scheduleAutoSave, user, sessionsLoaded])

  // Save current session manually
  const saveCurrentSession = useCallback(async (): Promise<ChatSession | null> => {
    if (!currentSession || !user) return null
    try {
      const saved = await saveSessionToSupabase(currentSession)
      return saved
    } catch (e) {
      console.error('Failed to save session:', e)
      throw e
    }
  }, [currentSession, user])

  // Load a specific session
  const loadSession = useCallback(async (sessionId: string): Promise<ChatMessage[]> => {
    if (!user) throw new Error('User not authenticated')

    try {
      if (currentSession && currentSession.messages.length > 0 && currentSession.id.startsWith('temp_')) {
        await saveCurrentSession()
      }

      const existing = sessions.find(s => s.id === sessionId)
      if (existing) {
        setCurrentSession({ ...existing, isActive: true, lastUpdated: new Date() })
        // touch updated_at
        await supabase.from(CHATS_TABLE).update({ updated_at: new Date().toISOString() }).eq('id', sessionId)
        return existing.messages
      }

      // fetch chat and its messages
      const { data: chatRow, error: chatErr } = await supabase.from(CHATS_TABLE).select('*').eq('id', sessionId).single()
      if (chatErr || !chatRow) throw new Error('Session not found')

  if (chatRow.owner_id !== user.id) throw new Error('Unauthorized')

      const { data: msgs, error: msgErr } = await supabase.from(MSGS_TABLE).select('*').eq('chat_id', sessionId).order('created_at', { ascending: true })
      if (msgErr) throw msgErr

      const mapped = mapChatRowToSession(chatRow, msgs || [])
      // touch updated_at
      await supabase.from(CHATS_TABLE).update({ updated_at: new Date().toISOString() }).eq('id', sessionId)

      setCurrentSession({ ...mapped, isActive: true, lastUpdated: new Date() })
      return mapped.messages
    } catch (e) {
      console.error('Failed to load session from Supabase:', e)
      throw e
    }
  }, [user, sessions, currentSession, saveCurrentSession])

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { data: chatRow, error: chatErr } = await supabase.from(CHATS_TABLE).select('*').eq('id', sessionId).single()
      if (chatErr || !chatRow) throw new Error('Not found')
  if (chatRow.owner_id !== user.id) throw new Error('Unauthorized')

  const { error } = await supabase.from(CHATS_TABLE).delete().eq('id', sessionId).eq('owner_id', user.id)
      if (error) throw error

      if (currentSession?.id === sessionId) {
        setCurrentSession(null)
        localStorage.removeItem(`currentSessionId_${user.id}`)
      }
    } catch (e) {
      console.error('Failed to delete session from Supabase:', e)
      throw e
    }
  }, [currentSession, user])

  // Clear current session (start fresh)
  const clearCurrentSession = useCallback(async () => {
    if (!user) return
    if (currentSession && currentSession.messages.length > 0) {
      try { await saveCurrentSession() } catch (e) { console.error('Failed to save before clear', e) }
    }
    setCurrentSession(null)
    localStorage.removeItem(`currentSessionId_${user.id}`)
  }, [currentSession, saveCurrentSession, user])

  // Update current session messages (for external updates like loading from history)
  const updateCurrentSessionMessages = useCallback((messages: ChatMessage[]) => {
    if (!user) return
    if (messages.length > 0) {
      const messageIds = messages.map(m => m.id)
      const matching = sessions.find(s => s.messages.some(msg => messageIds.includes(msg.id)))
      if (matching) {
        setCurrentSession({ ...matching, messages, messageCount: messages.length, lastUpdated: new Date(), isActive: true })
        return
      }
    }
    setCurrentSession(prev => {
      if (!prev) return null
      return { ...prev, messages, messageCount: messages.length, lastUpdated: new Date() }
    })
  }, [user, sessions])

  // Get or create current session for a specific model
  const getCurrentSession = useCallback((model: string): ChatSession | null => {
    if (!user) throw new Error('User must be logged in to use chat')
    if (currentSession) {
      if (currentSession.messages.length === 0 && currentSession.model !== model) {
        const updated = { ...currentSession, model }
        setCurrentSession(updated)
        return updated
      }
      return currentSession
    }
    return null
  }, [currentSession, user])

  // Sign out handler - clear all local state
  const handleSignOut = useCallback(() => {
    setSessions([]);
    setCurrentSession(null);
    setSessionsLoaded(false);
    setIsInitialized(false);
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }
    // Clear localStorage
    if (user) {
      localStorage.removeItem(`currentSessionId_${user.id}`);
    }
  }, [autoSaveTimeout, user]);

  // Listen for auth state changes to clear data on signout
  useEffect(() => {
    if (!user) {
      handleSignOut();
    }
  }, [user, handleSignOut]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  return {
    sessions,
    currentSession,
    isLoading,
    isAuthenticated: !!user,
    createSession,
    addMessage,
    saveCurrentSession,
    loadSession,
    deleteSession,
    clearCurrentSession,
    updateCurrentSessionMessages,
    getCurrentSession,
    handleSignOut
  };
}