'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe, Paperclip, Send, Loader2, X, FileText, Mic, MicOff, Sparkles } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { formatBytes } from '@/lib/utils';

// --------- Auto-resizing textarea hook ---------
function useAutoResizeTextarea(minHeight: number, maxHeight?: number) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = useCallback((reset?: boolean) => {
    const el = ref.current;
    if (!el) return;
    el.style.height = `${minHeight}px`;
    if (!reset) {
      const newH = Math.max(minHeight, Math.min(el.scrollHeight, maxHeight ?? Infinity));
      el.style.height = `${newH}px`;
    }
  }, [minHeight, maxHeight]);
  useEffect(() => adjustHeight(true), [adjustHeight]);
  return { ref, adjustHeight };
}

const MIN_HEIGHT = 58;
const MAX_HEIGHT = 197;

// --------- Main Component ---------
export function AiInput({
  onSubmit,
  loading = false,
}: {
  onSubmit: (text: string, imageDataUrl?: string, webSearch?: boolean) => void;
  loading?: boolean;
}) {
  const [value, setValue] = useState('');
  const { ref: textareaRef, adjustHeight } = useAutoResizeTextarea(MIN_HEIGHT, MAX_HEIGHT);

  // Voice input
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition, isMicrophoneAvailable } = useSpeechRecognition();
  useEffect(() => { if (transcript) { setValue(transcript); adjustHeight(); }}, [transcript, adjustHeight]);
  const startListening = () => {
    if (!browserSupportsSpeechRecognition) return alert('Browser does not support speech recognition.');
    if (!isMicrophoneAvailable) return alert('Microphone access is required.');
    resetTranscript(); SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
  };
  const stopListening = () => SpeechRecognition.stopListening();

  // Attachments
  const [attachedFile, setAttachedFile] = useState<File|null>(null);
  const [imagePreview, setImagePreview] = useState<string|null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState<string|null>(null);
  const clearAttachment = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setAttachedFile(null); setImagePreview(null);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const allowed = [/^image\//,/^text\/plain$/,/^application\/pdf$/,/^application\/msword$/,/^application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document$/];
    if (!allowed.some(re => re.test(file.type))) {
      setErrorMsg('Unsupported file. Allowed: Images, TXT, PDF, DOC, DOCX.'); setTimeout(()=>setErrorMsg(null),4000);
      if (fileInputRef.current) fileInputRef.current.value=''; return;
    }
    setAttachedFile(file); setImagePreview(file.type.startsWith('image/')?URL.createObjectURL(file):null);
  };

  // Enhance prompt
  const [isEnhancing, setIsEnhancing] = useState(false);
  const enhancePrompt = async () => {
    if (!value.trim()||isEnhancing) return;
    if (listening) setTimeout(stopListening,100);
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/enhance-prompt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:value.trim()})});
      if(!res.ok) throw new Error((await res.json().catch(()=>({}))).error||`HTTP ${res.status}`);
      const data=await res.json(); if(!data.enhancedPrompt) throw new Error('No prompt received');
      setValue(data.enhancedPrompt); adjustHeight();
    } catch(e:any){ alert(`Failed to enhance prompt: ${e.message||'Unknown error'}`); }
    finally{ setIsEnhancing(false); }
  };

  // Submit
  const [showSearch,setShowSearch]=useState(true);
  const handleSubmit=async()=>{
    if(listening)setTimeout(stopListening,100);
    let dataUrl: string|undefined;
    if(attachedFile) dataUrl=await new Promise<string>(r=>{const fr=new FileReader();fr.onload=()=>r(String(fr.result));fr.readAsDataURL(attachedFile);});
    onSubmit(value.trim(),dataUrl,showSearch);
    setValue(''); clearAttachment(); adjustHeight(true);
  };

  // Scroll-hide toolbar
  //const [barVisible,setBarVisible]=useState(true);
  //const lastScroll=useRef(0);
  //useEffect(()=>{const onScroll=()=>{const y=window.scrollY||0, d=y-lastScroll.current;setBarVisible(y<8||d<-6?true:d>6?false:barVisible);lastScroll.current=y;};window.addEventListener('scroll',onScroll,{passive:true});return()=>window.removeEventListener('scroll',onScroll);},[barVisible]);

  return (
    //<motion.div className="w-full py-4" initial={{y:0,opacity:1}} animate={{y:barVisible?0:72,opacity:barVisible?1:0.9}} transition={{type:'spring',stiffness:300,damping:30}}>
    <motion.div className="w-full py-4" initial={{y:0,opacity:1}} animate={{y:0,opacity:1}} transition={{type:'spring',stiffness:300,damping:30}}>
      <div className="relative max-w-xl border rounded-[22px] border-black/5 dark:border-white/5 p-1 w-full mx-auto">
        <div className="relative rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden">
          <div className="pb-10">
            {/* Textarea + attachment */}
            <div className={imagePreview?"grid grid-cols-[96px_1fr] gap-3 p-3 pr-4":"relative"}>
              {imagePreview && (
                <div className="relative h-[96px] w-[96px] rounded-xl overflow-hidden border">
                  <Image src={imagePreview} width={240} height={240} alt="preview" className="object-cover h-full w-full"/>
                  <button onClick={clearAttachment} className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/70 text-white"><X className="w-3.5 h-3.5"/></button>
                </div>
              )}
              <div className="relative rounded-xl bg-black/80 dark:bg-white/15 border">
                <Textarea ref={textareaRef} value={value} onChange={e=>{setValue(e.target.value);adjustHeight();}} 
                  onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSubmit();}}}
                  className="w-full rounded-xl px-4 py-3 bg-transparent text-white resize-none border-none"
                />
                {!value&&<p className="absolute left-4 top-3 text-white/50 text-sm">{showSearch?'Search the web...':'Ask Anything...'}</p>}
              </div>
            </div>
            {errorMsg&&<div className="px-4 py-2 text-sm text-rose-600">{errorMsg}</div>}
            {attachedFile&&!imagePreview&&(
              <div className="px-4 py-2 flex justify-between border-t">
                <div className="flex items-center gap-2 truncate"><FileText className="w-4 h-4"/><span>{attachedFile.name}</span><span>{formatBytes(attachedFile.size)}</span></div>
                <button onClick={clearAttachment}><X className="w-3.5 h-3.5"/></button>
              </div>
            )}
          </div>
          {/* Toolbar */}
          <div className="absolute inset-x-0 bottom-0 h-10 flex justify-between px-3 items-center">
            <div className="flex gap-2">
              <label className={cn('cursor-pointer p-1.5 rounded-full',attachedFile?'border text-blue-500':'text-gray-400')}>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden"/>
                <Paperclip className="w-4 h-4"/>
              </label>
              <button onClick={()=>setShowSearch(!showSearch)}><Globe className={cn('w-4 h-4',showSearch?'text-black':'text-gray-400')}/></button>
            </div>
            <div className="flex gap-2">
              {browserSupportsSpeechRecognition&&(
                <button onClick={listening?stopListening:startListening} className={cn('p-2 rounded-full',listening?'bg-red-500 text-white animate-pulse':'bg-gray-700 text-white')}>
                  {listening?<MicOff className="w-4 h-4"/>:<Mic className="w-4 h-4"/>}
                </button>
              )}
              {value.trim()&&(
                <button onClick={enhancePrompt} disabled={isEnhancing} className="p-2 rounded-full bg-blue-500 text-white">
                  {isEnhancing?<Loader2 className="w-4 h-4 animate-spin"/>:<Sparkles className="w-4 h-4"/>}
                </button>
              )}
              <button onClick={handleSubmit} disabled={loading || (!value.trim() && !attachedFile)} className={cn('p-2 rounded-full',value?'bg-blue-600 text-white':'bg-gray-600 text-gray-400')}>
                {loading?<Loader2 className="w-4 h-4 animate-spin"/>:<Send className="w-4 h-4"/>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
