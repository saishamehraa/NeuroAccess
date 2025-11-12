export type ChatMessage = {
  id: string;
  createdAt?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  modelId?: string; // which model produced this assistant message
  ts?: number;
  file?: string | null; // optional file URL (for user messages)
  fileName?: string | null; // optional file name (for user messages)
  fileSize?: string | null; // optional file size (for user messages)
  images?: string[]; // optional image URLs (for assistant messages)
  response?: string; // Full text response from provider
  details?: any; // Full raw response from provider (if needed for debugging)
  // Optional metadata for provider responses
  code?: number; // HTTP-like status from backend (e.g., 503)
  provider?: string; // e.g., 'openrouter', 'gemini'
  usedKeyType?: 'user' | 'shared' | 'none';
  // Optional token usage metadata (when provided by backend)
  tokens?: {
    by?: 'prompt' | 'messages';
    total: number;
    model?: string;
    perMessage?: Array<{
      index: number;
      role: string;
      chars: number;
      tokens: number;
    }>;
  };
};

export type AiModel = {
  id: string; // unique key in UI
  label: string; // display name
  provider: 'gemini' | 'openrouter' | 'open-provider' | 'unstable' | 'mistral' | 'ollama';
  model: string; // provider-specific model id
  free?: boolean;
  good?: boolean; // highlight as recommended
  category?: 'text' | 'image' | 'audio'; // model capability category
};

export type ApiKeys = {
  gemini?: string;
  openrouter?: string;
  'open-provider'?: string; // Optional API key for open-provider (currently free)
  'unstable'?: string; // API key for unstable provider (inference.quran.lat)
  'mistral'?: string; // API key for Mistral AI (api.mistral.ai)
  'ollama'?: string; // Base URL for Ollama API
  'ollamaModel'?: string; // Model name for Ollama
};

export type ChatThread = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  // When set, this chat belongs to a specific project. If undefined, it's a general chat.
  projectId?: string;
  // Track which page type this thread was created on
  pageType?: 'home' | 'compare';
};
