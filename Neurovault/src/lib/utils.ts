import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'absolute';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((res, rej) => {
      document.execCommand('copy') ? res() : rej();
      textArea.remove();
    });
  }
}

// Sanitize certain provider-specific XML-ish wrappers (e.g., <answer>, <think>)
export function sanitizeContent(s: string): string {
  try {
    let t = String(s ?? '');
    t = t.replace(/<\/?answer[^>]*>/gi, '');
    t = t.replace(/<\/?think[^>]*>/gi, '');
    return t.trim();
  } catch {
    return s;
  }
}
// Approximate token estimator (~4 chars/token), for display only
export function estimateTokens(text: string): number {
  try {
    const t = (text || '').replace(/\s+/g, ' ').trim();
    return t.length > 0 ? Math.ceil(t.length / 4) : 0;
  } catch {
    return 0;
  }
}
// Format bytes as human-readable text
export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}