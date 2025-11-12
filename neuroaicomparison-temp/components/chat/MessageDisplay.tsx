'use client'

import React from 'react'
import { Edit3, FileText } from 'lucide-react'
import type { ChatMessage } from '@/lib/types'
import MarkdownLite from './MarkdownLite'

interface MessageDisplayProps {
  message: ChatMessage & {
    file?: string | null
    fileName?: string | null
    fileSize?: string | null
  }
  isDark: boolean
  AssistantAvatar?: React.ComponentType<any>
  onEditMessage?: (messageId: string, newContent: string) => void
  onShareMessage?: (message: ChatMessage) => void
}

export default function MessageDisplay({ 
  message, 
  isDark, 
  AssistantAvatar,
  onEditMessage,
}: MessageDisplayProps) {
  // ---------- Assistant messages ----------
  if (message.role === "assistant") {
    return (
      <div className="flex gap-4 justify-start">
        {AssistantAvatar && (
          <AssistantAvatar 
            url={(message as any).avatarUrl} 
            alt={(message as any).avatarAlt} 
          />
        )}
        <div className={`assistant-message ${isDark ? 'dark' : 'light'}`}>
          <div className="message-content">
            <MarkdownLite text={String(message.content || '')} />
          </div>
        </div>
      </div>
    )
  }

  // ---------- User messages ----------
  return (
    <div className="flex items-start gap-2 justify-end">
      <div className={`user-message ${isDark ? 'dark' : 'light'}`}>
        {/* Render main text */}
        {message.content && (
          <div className="message-content">{String(message.content)}</div>
        )}

        {/* Render file if exists */}
        {message.file && (
          <div className="mt-2">
            {message.file.startsWith('data:image') ? (
              <img
                src={message.file}
                alt="User attachment"
                className="max-w-xs rounded-lg border"
              />
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-300 border rounded p-2">
                <FileText size={16} />
                <span className="truncate">
                  {message.fileName || 'Attachment'}
                </span>
                {message.fileSize && (
                  <span className="ml-1 opacity-70">
                    ({message.fileSize})
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit icon now uses correct message.id */}
      <button
        onClick={() => onEditMessage?.(message.id, String(message.content || ''))}
        className="mt-1 h-6 w-6 shrink-0 inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-orange-500/20 hover:border-orange-300/30 text-zinc-300 hover:text-orange-100 transition-colors"
        title="Edit message"
        aria-label="Edit message"
      >
        <Edit3 size={12} />
      </button>
    </div>
  )
}
