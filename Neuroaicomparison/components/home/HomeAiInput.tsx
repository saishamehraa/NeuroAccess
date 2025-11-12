'use client'

import type React from 'react'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Paperclip, Send, Loader2, X, Mic, MicOff, Sparkles, FileText } from 'lucide-react'
import { cn, formatBytes } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import Image from 'next/image'

interface Props {
  onSubmit?: (text: string, fileDataUrl?: string) => void; // <-- include file
  isDark?: boolean
  modelSelectorLabel?: string
  onOpenModelSelector?: () => void
  initialValue?: string
  onClear?: () => void
}

const MIN_HEIGHT = 64
const MAX_HEIGHT = 200

function useAutoResizeTextarea(minHeight: number, maxHeight: number) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const adjustHeight = useCallback((reset?: boolean) => {
    const ta = ref.current
    if (!ta) return
    if (reset) {
      ta.style.height = `${minHeight}px`
      return
    }
    ta.style.height = `${minHeight}px`
    ta.style.height = `${Math.max(minHeight, Math.min(ta.scrollHeight, maxHeight))}px`
  }, [minHeight, maxHeight])
  useEffect(() => adjustHeight(true), [adjustHeight])
  return { ref, adjustHeight }
}

export default function HomeAiInput({
  onSubmit,
  isDark = true,
  modelSelectorLabel,
  onOpenModelSelector,
  initialValue,
  onClear
}: Props) {
  const [value, setValue] = useState(initialValue || '')
  const [showSearch, setShowSearch] = useState(true)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { ref: textareaRef, adjustHeight } = useAutoResizeTextarea(MIN_HEIGHT, MAX_HEIGHT)

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition()

  const [isClient, setIsClient] = useState(false)
  useEffect(() => setIsClient(true), [])

  useEffect(() => {
    if (transcript) {
      setValue(transcript)
      adjustHeight()
    }
  }, [transcript, adjustHeight])

  useEffect(() => {
    if (initialValue !== undefined) {
      setValue(initialValue)
      adjustHeight()
    }
  }, [initialValue, adjustHeight])

  const startListening = () => {
    if (!browserSupportsSpeechRecognition) return alert('Your browser does not support speech recognition.')
    if (!isMicrophoneAvailable) return alert('Microphone access is required.')
    resetTranscript()
    SpeechRecognition.startListening({ continuous: true, language: 'en-US' })
  }

  const stopListening = () => SpeechRecognition.stopListening()

  useEffect(() => () => { if (imagePreview) URL.revokeObjectURL(imagePreview) }, [imagePreview])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = [
      /^image\//,
      /^text\/plain$/,
      /^application\/pdf$/,
      /^application\/msword$/,
      /^application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document$/,
    ]
    if (!allowedTypes.some((re) => re.test(file.type))) {
      setErrorMsg('Unsupported file. Allowed: Images, TXT, PDF, DOC, DOCX.')
      setTimeout(() => setErrorMsg(null), 4000)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setAttachedFile(file)
    setImagePreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null)
  }

  const clearAttachment = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setAttachedFile(null)
    setImagePreview(null)
  }

  const handleSend = async () => {
  const text = value.trim();
  if (!text && !attachedFile) return;
  if (listening) setTimeout(stopListening, 100);

  let dataUrl: string | undefined;
  if (attachedFile) {
    dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(attachedFile);
    });
  }

  onSubmit?.(text, dataUrl);  // <--- Pass both text AND file data
  setValue('');
  clearAttachment();
  onClear?.();
  requestAnimationFrame(() => textareaRef.current?.focus());
};

  const enhancePrompt = async () => {
    const text = value.trim()
    if (!text || isEnhancing) return
    if (listening) setTimeout(stopListening, 100)
    setIsEnhancing(true)
    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.enhancedPrompt) {
        setValue(data.enhancedPrompt)
        adjustHeight()
        requestAnimationFrame(() => textareaRef.current?.focus())
      }
    } catch (e) {
      console.error('Enhance failed', e)
    } finally {
      setIsEnhancing(false)
    }
  }

 return (
    <motion.div className="w-full" initial={{ y: 0, opacity: 1 }}>
      <div className={cn(
        "relative border rounded-[22px] p-1 w-full mx-auto",
        isDark ? "border-white/10 bg-black/30 backdrop-blur-sm" : "border-gray-300 bg-white/50 backdrop-blur-sm"
      )}>
        <div className="relative rounded-2xl border overflow-hidden" style={{ minHeight: `${MIN_HEIGHT}px` }}>
          
          {/* Attachment Preview Section */}
          <AnimatePresence>
            {(imagePreview || (attachedFile && !imagePreview)) && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0, paddingBottom: '0.75rem' }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="px-3 pt-3"
              >
                {imagePreview && (
                  <div className="relative h-24 w-24 rounded-xl overflow-hidden border">
                    <Image src={imagePreview} layout="fill" objectFit="cover" alt="Preview" />
                    <button onClick={clearAttachment} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {attachedFile && !imagePreview && (
                  <div className={cn(
                    "flex justify-between items-center p-2 rounded-lg border",
                    isDark ? "border-white/15 bg-white/5 text-white/80" : "border-gray-300 bg-gray-50 text-gray-700"
                  )}>
                    <div className="flex items-center gap-2 truncate text-sm">
                      <FileText className="w-4 h-4 shrink-0" />
                      <span className="truncate">{attachedFile.name}</span>
                      <span className="opacity-60">{formatBytes(attachedFile.size)}MB</span>
                    </div>
                    <button onClick={clearAttachment} className="hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main input area */}
          <div className="pb-14">
            <div className={cn(
              "relative rounded-xl m-3",
               isDark ? "bg-black/50" : "bg-white/80"
            )}>
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  adjustHeight();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className={cn(
                  "w-full rounded-xl pl-4 pr-4 py-3 bg-transparent resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0",
                  isDark ? "text-white placeholder:text-white/50" : "text-black placeholder:text-black/50"
                )}
                style={{ height: `${MIN_HEIGHT}px` }}
                placeholder={showSearch ? 'Search the web or ask anything...' : 'Ask anything...'}
              />
            </div>
          </div>

          {errorMsg && <div className="px-4 py-2 text-sm text-rose-500">{errorMsg}</div>}

          {/* Toolbar */}
          <div className="absolute bottom-0 inset-x-0 h-14 flex justify-between px-3 items-center">
            <div className="flex items-center gap-1">
              {/* File Attachment */}
              <label className={cn(
                'cursor-pointer p-2 rounded-full transition-colors',
                 isDark ? 'text-gray-400 hover:bg-white/10 hover:text-white' : 'text-gray-500 hover:bg-black/10 hover:text-black',
                 attachedFile && (isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600')
              )}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                />
                <Paperclip className="w-4 h-4" />
              </label>
              
              {/* Web Search Toggle */}
              <button onClick={() => setShowSearch(!showSearch)} className={cn(
                'p-2 rounded-full transition-colors',
                isDark ? 'hover:bg-white/10' : 'hover:bg-black/10',
                showSearch ? (isDark ? 'text-white' : 'text-black') : 'text-gray-400'
              )}>
                <Globe className="w-4 h-4" />
              </button>
              
              {/* Model Selector Button */}
              {onOpenModelSelector && (
                <button
                  onClick={onOpenModelSelector}
                  className={cn(
                    "hidden sm:inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-colors",
                    isDark ? "border-white/15 bg-white/5 text-white/80 hover:bg-white/10" : "border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {modelSelectorLabel}
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Mic Button */}
              {isClient && browserSupportsSpeechRecognition && (
                <button
                  onClick={listening ? stopListening : startListening}
                  className={cn(
                    'p-2 rounded-full transition-colors',
                    listening ? 'bg-red-500 text-white animate-pulse' : (isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                  )}
                >
                  {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}

              {/* Enhance Prompt */}
              {value.trim() && (
                <button onClick={enhancePrompt} disabled={isEnhancing} className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                  {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                </button>
              )}
              
              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={!value.trim() && !attachedFile}
                className={cn(
                  'p-2 rounded-full transition-colors',
                  (value.trim() || attachedFile) ? 'bg-blue-600 text-white hover:bg-blue-700' : (isDark ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500 cursor-not-allowed')
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
