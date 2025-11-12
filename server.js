console.log('--- RUNNING LATEST SERVER.JS FILE ---');
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch'; // if not installed: npm i node-fetch
import { Buffer } from 'node:buffer';
import pdfParse from 'pdf-parse';    // npm i pdf-parse
import mammoth from 'mammoth';       // npm i mammoth
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
//app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// --- SUPABASE CLIENT ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// --- Serve static apps ---
app.use('/', express.static(path.join(__dirname, 'build')));
app.use('/neurovault', express.static(path.join(__dirname, 'build/neurovault')));
app.use('/neuropromptgallery', express.static(path.join(__dirname, 'build/neuropromptgallery')));
app.use('/neuroaicomparison', express.static(path.join(__dirname, 'build/neuroaicomparison')));

// --- API: GitHub stars ---
app.get('/api/github/stars', async (req, res) => {
  try {
    const owner = req.query.owner || 'saishamehraa';
    const repo = req.query.repo || 'NeuroAccess';

    const token = process.env.GITHUB_TOKEN;
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    const data = await ghRes.json();

    const stars = typeof data?.stargazers_count === 'number' ? data.stargazers_count : null;
    res.json({ ok: true, stars });
  } catch (err) {
    console.error('GitHub API error:', err);
    res.json({ ok: false });
  }
});

// --- API: Supabase Auth callback ---
app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('Supabase auth error:', error.message);
        return res.redirect('/neuroaicomparison?auth=failed');
      }
    } catch (err) {
      console.error('Unexpected auth error:', err);
      return res.redirect('/neuroaicomparison?auth=failed');
    }
  }
  // Always redirect back to NeuroAIComparison after auth
  res.redirect('/neuroaicomparison');
});

// --- API: Metrics logging ---
app.post('/api/metrics', express.json(), async (req, res) => {
  try {
    console.log('Metrics event:', req.body);
    // Optionally store to Supabase table if you want
    res.json({ ok: true });
  } catch (err) {
    console.error('Metrics API error:', err);
    res.json({ ok: false });
  }
});

// --- Prompt enhancement ---
app.post('/api/enhance-prompt', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid prompt' });
    }

    const apiKey = process.env.OPEN_PROVIDER_API_KEY || 'EKfz9oU-FsP-Kz4w';
    const messages = [
      { role: 'system', content: 'Enhance this prompt' },
      { role: 'user', content: `Please enhance this prompt: "${prompt}"` }
    ];

    const baseUrl = 'https://text.pollinations.ai/openai';
    const textUrl = `${baseUrl}?token=${encodeURIComponent(apiKey)}`;

    const requestBody = { messages, model: 'openai', stream: false, max_tokens: 1000 };

    let response = await fetch(textUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'NeuroAIComparison/1.0' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      // fallback model
      console.log('Falling back to Llama4 Scout model');
      requestBody.model = 'llamascout';
      response = await fetch(textUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'NeuroAIComparison/1.0' },
        body: JSON.stringify(requestBody)
      });
    }

    const responseText = await response.text();
    let data;
    try { data = JSON.parse(responseText); } catch { data = { text: responseText }; }

    let enhancedPrompt = '';
    if (typeof data === 'string') enhancedPrompt = data;
    else if (typeof data.text === 'string') enhancedPrompt = data.text;
    else if (typeof data.content === 'string') enhancedPrompt = data.content;
    else if (Array.isArray(data.choices)) {
      enhancedPrompt = data.choices
        .map(c => c?.message?.content || '')
        .filter(Boolean)
        .join('\n\n');
    }

    if (!enhancedPrompt.trim()) throw new Error('No enhanced prompt received');
    res.json({ enhancedPrompt: enhancedPrompt.trim() });
  } catch (err) {
    console.error('Prompt enhancement error:', err);
    res.status(500).json({ error: 'Failed to enhance prompt' });
  }
});

// --- Open Provider ---

// Approximate token estimator
function estimateTokens(text) {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  return t.length > 0 ? Math.ceil(t.length / 4) : 0;
}

function getTTSPrefix(text) {
  const lowerText = text.toLowerCase().trim();

  if (
    lowerText.includes('?') ||
    lowerText.startsWith('what') ||
    lowerText.startsWith('how') ||
    lowerText.startsWith('why') ||
    lowerText.startsWith('when') ||
    lowerText.startsWith('where') ||
    lowerText.startsWith('who') ||
    lowerText.startsWith('which') ||
    lowerText.startsWith('can you')
  ) {
    return "Here's what you asked:";
  }
  if (
    lowerText.includes('hello') ||
    lowerText.includes('hi ') ||
    lowerText.includes('hey') ||
    lowerText.startsWith('good morning') ||
    lowerText.startsWith('good afternoon') ||
    lowerText.startsWith('good evening')
  ) {
    return 'You said:';
  }
  if (
    lowerText.startsWith('please') ||
    lowerText.startsWith('can you') ||
    lowerText.startsWith('could you') ||
    lowerText.startsWith('tell me') ||
    lowerText.startsWith('explain') ||
    lowerText.startsWith('describe')
  ) {
    return 'Your request was:';
  }
  if (lowerText.length > 50) return "Here's your text:";
  return 'Repeating:';
}

app.post('/api/open-provider', async (req, res) => {
  try {
    const { messages, model, apiKey: apiKeyFromBody, imageDataUrl, voice } = req.body;

    const apiKey =
      apiKeyFromBody ||
      process.env.OPEN_PROVIDER_API_KEY ||
      process.env.OPEN_PROVIDER_API_KEY_BACKUP ||
      'EKfz9oU-FsP-Kz4w';
    const usedKeyType = apiKeyFromBody
      ? 'user'
      : process.env.OPEN_PROVIDER_API_KEY
      ? 'shared-primary'
      : process.env.OPEN_PROVIDER_API_KEY_BACKUP
      ? 'shared-backup'
      : 'default';

    if (!model) return res.status(400).json({ error: 'Missing model id' });

    // Sanitize messages
    const isRole = (r) => r === 'user' || r === 'assistant' || r === 'system';
    const sanitize = (msgs) =>
      (Array.isArray(msgs) ? msgs : [])
        .map((m) => ({
          role: isRole(m?.role) ? m.role : 'user',
          content: typeof m?.content === 'string' ? m.content : String(m?.content ?? ''),
        }))
        .filter((m) => isRole(m.role));

    const sanitizedMessages = sanitize(messages || []);
    const trimmedMessages =
      sanitizedMessages.length > 8 ? sanitizedMessages.slice(-8) : sanitizedMessages;

    const lastUserMessage = trimmedMessages.filter((m) => m.role === 'user').pop();
    let prompt = lastUserMessage ? lastUserMessage.content : 'A beautiful image';

    const isImageModel = ['flux', 'kontext', 'turbo'].includes(model);
    const isAudioModel = model === 'openai-audio';
    const isReasoningModel = ['deepseek-reasoning'].includes(model);

    if (isAudioModel && prompt) {
      prompt = `${getTTSPrefix(prompt)} ${prompt}`;
    }

    // Image models: return URL only
    if (isImageModel) {
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        prompt
      )}?width=1024&height=1024&model=${encodeURIComponent(
        model
      )}&nologo=true&enhance=true&token=${encodeURIComponent(apiKey)}`;
      return res.json({
        text: `![Generated Image](${imageUrl})`,
        imageUrl,
        provider: 'open-provider',
        usedKeyType,
        isImageGeneration: true,
        tokens: { by: 'prompt', total: estimateTokens(prompt), model },
      });
    }

    // Audio vs Text models
    let textUrl;
    let requestBody = null;
    if (isAudioModel) {
      const tooLong = prompt.length > 800;
      const finalPrompt = tooLong
        ? prompt.substring(0, 750) + '... [Audio truncated due to length limit]'
        : prompt;
      const encoded = encodeURIComponent(finalPrompt);
      const selectedVoice = voice || 'alloy';
      textUrl = `https://text.pollinations.ai/${encoded}?model=openai-audio&voice=${selectedVoice}&token=${encodeURIComponent(apiKey)}`;
    } else {
      textUrl = `https://text.pollinations.ai/openai?token=${encodeURIComponent(apiKey)}`;
      requestBody = {
        messages: trimmedMessages,
        model,
        stream: false,
        ...(isReasoningModel ? { max_tokens: 4000 } : { max_tokens: 2048 }),
      };
    }

    const totalTokensEstimate = trimmedMessages.reduce(
      (sum, m) => sum + estimateTokens(m.content),
      0
    );

    const aborter = new AbortController();
    const timeoutMs = isReasoningModel ? 180000 : 120000;
    const timeoutId = setTimeout(() => aborter.abort(), timeoutMs);

    const headers = isAudioModel
      ? {
          'User-Agent': 'NeuroAIComparison/1.0',
          Authorization: `Bearer ${apiKey}`,
        }
      : {
          'Content-Type': 'application/json',
          'User-Agent': 'NeuroAIComparison/1.0',
          Authorization: `Bearer ${apiKey}`,
          ...(isReasoningModel ? { 'X-API-Key': apiKey, 'X-Model-Type': 'reasoning' } : {}),
        };

    const resp = await fetch(textUrl, {
      method: isAudioModel ? 'GET' : 'POST',
      headers,
      ...(isAudioModel ? {} : { body: JSON.stringify(requestBody) }),
      signal: aborter.signal,
    });
    clearTimeout(timeoutId);

    if (!resp.ok) {
      const errorText = await resp.text().catch(() => 'Unknown error');
      const friendlyError =
        resp.status === 401
          ? 'Authentication failed. The model may require higher tier access.'
          : resp.status === 403
          ? 'Access denied. This model may require special permissions.'
          : resp.status === 429
          ? 'Rate limit exceeded. Please try again in a moment.'
          : resp.status === 503
          ? 'Service temporarily unavailable. Please try again later.'
          : resp.status >= 500
          ? 'Server error occurred. Please try again later.'
          : `Provider returned error [status ${resp.status}]: ${errorText}`;
      return res.status(resp.status).json({
        text: friendlyError,
        error: errorText,
        code: resp.status,
        provider: 'open-provider',
        usedKeyType,
      });
    }

    // Parse response
    let data;
    let audioUrl = null;
    const contentType = resp.headers.get('content-type');
    if (isAudioModel) {
      if (contentType?.includes('audio/') || contentType?.includes('application/octet-stream')) {
        const audioBuffer = await resp.arrayBuffer();
        const audioBase64 = Buffer.from(audioBuffer).toString('base64');
        const mimeType = contentType || 'audio/mpeg';
        audioUrl = `data:${mimeType};base64,${audioBase64}`;
        data = { audio_url: audioUrl };
      } else {
        const responseText = await resp.text();
        try {
          data = JSON.parse(responseText);
          audioUrl = data.audio_url || data.url || null;
        } catch {
          audioUrl =
            responseText.startsWith('http') && responseText.match(/\.(mp3|wav|m4a)/)
              ? responseText.trim()
              : null;
          data = { audio_url: audioUrl || null };
        }
      }
    } else {
      const responseText = await resp.text();
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { text: responseText };
      }
    }

    let text = '';
    if (isAudioModel) {
      text = audioUrl ? `[AUDIO:${audioUrl}]` : data.text || 'Audio generation failed.';
    } else {
      if (typeof data === 'string') text = data;
      else if (typeof data?.text === 'string') text = data.text;
      else if (Array.isArray(data?.choices))
        text = data.choices.map((c) => c.message?.content || '').join('\n\n');
      else text = data?.content || 'No response generated.';
    }

    if (!text || text.trim() === '') text = 'No response generated.';

    return res.json({
      text: text.trim(),
      audioUrl,
      raw: data,
      provider: 'open-provider',
      usedKeyType,
      tokens: isAudioModel
        ? { by: 'prompt', total: estimateTokens(prompt), model }
        : { by: 'messages', total: totalTokensEstimate, model },
    });
  } catch (e) {
    return res.status(500).json({
      error: e.message || 'Unknown error',
      provider: 'open-provider',
    });
  }
});


// --- Gemini ---
app.post('/api/gemini', async (req, res) => {
  try {
    const { messages, model, apiKey: apiKeyFromBody, imageDataUrl } = req.body;
    const apiKey = apiKeyFromBody || process.env.GEMINI_API_KEY;
    const usedKeyType = apiKeyFromBody ? 'user' : process.env.GEMINI_API_KEY ? 'shared' : 'none';

    if (!apiKey) {
      return res.status(400).json({ error: 'Missing Gemini API key' });
    }

    const allowed = new Set(['gemini-2.5-flash', 'gemini-2.5-pro']);
    const requested = typeof model === 'string' ? model : 'gemini-2.5-flash';
    const geminiModel = allowed.has(requested) ? requested : 'gemini-2.5-flash';

    // Convert OpenAI-style messages to Gemini format
    const toRole = (r) => {
      if (r === 'assistant') return 'model';
      if (r === 'user' || r === 'system') return r;
      return 'user';
    };
    let contents = (Array.isArray(messages) ? messages : []).map(m => ({
      role: toRole(m.role),
      parts: [{ text: typeof m?.content === 'string' ? m.content : String(m?.content ?? '') }]
    }));

    // Extract system messages into systemInstruction
    const systemParts = [];
    contents = contents.filter(c => {
      if (c.role === 'system') {
        c.parts.forEach(p => { if (typeof p?.text === 'string' && p.text.trim()) systemParts.push({ text: p.text }); });
        return false;
      }
      return true;
    });

    // Attach image if provided
    if (imageDataUrl && contents.length > 0) {
      for (let i = contents.length - 1; i >= 0; i--) {
        if (contents[i].role === 'user') {
          try {
            const [meta, base64] = String(imageDataUrl).split(',');
            const mt = /data:(.*?);base64/.exec(meta || '')?.[1] || '';
            if (/^image\//i.test(mt)) {
              contents[i].parts.push({ inline_data: { mime_type: mt || 'image/png', data: base64 } });
            } else {
              contents[i].parts.push({ text: `(Attachment omitted: ${mt || 'unknown'} unsupported by Gemini)` });
            }
          } catch {}
          break;
        }
      }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: contents.length > 0 ? contents : [{ role: 'user', parts: [{ text: 'Please respond to the instruction.' }] }],
        ...(systemParts.length > 0 ? { systemInstruction: { parts: systemParts } } : {}),
        generationConfig: { response_mime_type: 'text/plain', maxOutputTokens: 2048, temperature: 0.7 }
      })
    });

    const data = await resp.json();
    if (!resp.ok) {
      const errMsg = JSON.stringify(data?.error?.message || data);
      if (resp.status === 429) {
        const text = usedKeyType === 'user'
          ? 'Your Gemini API key hit a rate limit. Please retry or upgrade.'
          : 'This model hit a shared rate limit. Add your own Gemini API key in Settings.';
        return res.json({ text, error: errMsg, code: 429, provider: 'gemini', usedKeyType });
      }
      return res.status(resp.status).json({ error: errMsg, raw: data });
    }

    // Extract response text
    const extractText = (d) => {
      const candidates = d?.candidates;
      if (!Array.isArray(candidates) || candidates.length === 0) return '';
      const parts = candidates[0]?.content?.parts || [];
      return parts.map(p => (typeof p?.text === 'string' ? p.text : '')).filter(Boolean).join('\n');
    };
    let text = extractText(data);

    if (!text) {
      text = 'Gemini returned an empty message. Try again or add your own Gemini API key.';
    }

    // Token estimation
    const estimateTokens = s => Math.ceil((s || '').replace(/\s+/g, ' ').trim().length / 4);
    const perMessage = (Array.isArray(messages) ? messages : []).map((m, i) => ({
      index: i,
      role: typeof m?.role === 'string' ? m.role : 'user',
      chars: String(m?.content ?? '').length,
      tokens: estimateTokens(String(m?.content ?? ''))
    }));
    const total = perMessage.reduce((sum, x) => sum + x.tokens, 0);

    res.json({
      text,
      raw: data,
      provider: 'gemini',
      usedKeyType,
      tokens: { by: 'messages', total, perMessage, model: geminiModel }
    });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
});

// --- Gemini-pro ---
app.post('/api/gemini-pro', async (req, res) => {
  try {
    const { messages, apiKey: apiKeyFromBody, imageDataUrl } = req.body;
    const apiKey = apiKeyFromBody || process.env.GEMINI_API_KEY;
    const usedKeyType = apiKeyFromBody ? 'user' : process.env.GEMINI_API_KEY ? 'shared' : 'none';
    if (!apiKey) {
      return res.status(400).json({ error: 'Missing Gemini API key' });
    }
    const geminiModel = 'gemini-2.5-pro';

    const toRole = (r) => {
      if (r === 'assistant') return 'model';
      if (r === 'user' || r === 'system') return r;
      return 'user';
    };
    let contents = (Array.isArray(messages) ? messages : []).map(m => ({
      role: toRole(m.role),
      parts: [{ text: typeof m?.content === 'string' ? m.content : String(m?.content ?? '') }]
    }));

    const systemParts = [];
    contents = contents.filter(c => {
      if (c.role === 'system') {
        c.parts.forEach(p => { if (typeof p?.text === 'string' && p.text.trim()) systemParts.push({ text: p.text }); });
        return false;
      }
      return true;
    });

    if (imageDataUrl && contents.length > 0) {
      for (let i = contents.length - 1; i >= 0; i--) {
        if (contents[i].role === 'user') {
          try {
            const [meta, base64] = String(imageDataUrl).split(',');
            const mt = /data:(.*?);base64/.exec(meta || '')?.[1] || '';
            if (/^image\//i.test(mt)) {
              contents[i].parts.push({ inline_data: { mime_type: mt || 'image/png', data: base64 } });
            } else {
              contents[i].parts.push({ text: `(Attachment omitted: ${mt || 'unknown'} unsupported by Gemini)` });
            }
          } catch {}
          break;
        }
      }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: contents.length > 0 ? contents : [{ role: 'user', parts: [{ text: 'Please respond to the instruction.' }] }],
        ...(systemParts.length > 0 ? { systemInstruction: { parts: systemParts } } : {}),
        generationConfig: { response_mime_type: 'text/plain', maxOutputTokens: 2048, temperature: 0.7 }
      })
    });

    const data = await resp.json();
    if (!resp.ok) {
      const errMsg = JSON.stringify(data?.error?.message || data);
      if (resp.status === 429) {
        const text = 'This model hit a shared rate limit. Add your own Gemini API key for FREE in Settings for higher limits and reliability.';
        return res.json({ text, error: errMsg, code: 429, provider: 'gemini' });
      }
      return res.status(resp.status).json({ error: errMsg, raw: data });
    }

    const cand = data?.candidates?.[0];
    const parts = cand?.content?.parts || [];
    let text = '';
    if (Array.isArray(parts)) {
      text = parts.map(p => (typeof p?.text === 'string' ? p.text : '')).filter(Boolean).join('\n');
    }
    if (!text && Array.isArray(parts) && parts.length) {
      text = parts.map(p => {
        const pp = p || {};
        if (typeof pp?.text === 'string') return pp.text;
        if (pp?.inline_data) return '[inline data]';
        try { return JSON.stringify(p); } catch { return ''; }
      }).filter(Boolean).join('\n');
    }
    if (!text) {
      const finish = cand?.finishReason || data?.finishReason;
      const blockReason = data?.promptFeedback?.blockReason || cand?.safetyRatings?.[0]?.category;
      const blocked = finish && String(finish).toLowerCase().includes('safety');
      if (blocked || blockReason) {
        text = `Gemini Pro blocked the content due to safety settings${blockReason ? ` (reason: ${blockReason})` : ''}. Try rephrasing your prompt.`;
      }
    }
    if (!text) {
      text = 'Gemini Pro returned an empty message. Try again or add your own Gemini API key.';
    }

    const estimateTokens = s => Math.ceil((s || '').replace(/\s+/g, ' ').trim().length / 4);
    const perMessage = (Array.isArray(messages) ? messages : []).map((m, i) => ({
      index: i,
      role: typeof m?.role === 'string' ? m.role : 'user',
      chars: String(m?.content ?? '').length,
      tokens: estimateTokens(String(m?.content ?? ''))
    }));
    const total = perMessage.reduce((sum, x) => sum + x.tokens, 0);

    res.json({
      text,
      raw: data,
      provider: 'gemini',
      usedKeyType,
      tokens: { by: 'messages', total, perMessage, model: geminiModel }
    });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
});

// --- Mistral ---
app.post('/api/mistral', express.json(), async (req, res) => {
  try {
    const { messages, model, apiKey: apiKeyFromBody, imageDataUrl } = req.body;

    const apiKey = apiKeyFromBody || process.env.MISTRAL_API_KEY;
    const usedKeyType = apiKeyFromBody ? 'user' : process.env.MISTRAL_API_KEY ? 'shared' : 'none';

    if (!apiKey) {
      return res.status(400).json({ error: 'Missing Mistral API key' });
    }
    if (!model) {
      return res.status(400).json({ error: 'Missing model id' });
    }

    // --- Helpers ---
    const estimateTokens = (text) => Math.ceil((text || '').length / 4);
    const sanitize = (msgs) =>
      (Array.isArray(msgs) ? msgs : [])
        .filter((m) => m && typeof m === 'object')
        .map((m) => {
          const role =
            typeof m.role === 'string' && ['user', 'assistant', 'system'].includes(m.role)
              ? m.role
              : 'user';
          const content = typeof m.content === 'string' ? m.content : '';
          return content ? { role, content } : null;
        })
        .filter(Boolean);

    const sanitizedMessages = sanitize(messages);
    const trimmedMessages =
      sanitizedMessages.length > 10 ? sanitizedMessages.slice(-10) : sanitizedMessages;

    if (trimmedMessages.length === 0) {
      trimmedMessages.push({ role: 'user', content: 'Hello' });
    }

    // Handle image attachment (Pixtral models)
    const processedMessages = trimmedMessages;
    if (imageDataUrl && processedMessages.length > 0) {
      const lastMessage = processedMessages[processedMessages.length - 1];
      if (lastMessage.role === 'user') {
        if (model.includes('pixtral')) {
          lastMessage.content += '\n\n[Image attached - supported by Pixtral models]';
        } else {
          lastMessage.content +=
            '\n\n[Image attached - processing capabilities depend on the selected model]';
        }
      }
    }

    const totalTokensEstimate = processedMessages.reduce(
      (sum, msg) => sum + estimateTokens(msg.content),
      0
    );

    const requestBody = {
      model,
      messages: processedMessages,
      max_tokens: 2048,
      temperature: 0.7,
      stream: false,
    };

    console.log(`Calling Mistral API for model: ${model}`, {
      endpoint: 'https://api.mistral.ai/v1/chat/completions',
      messageCount: processedMessages.length,
      tokensEstimate: totalTokensEstimate,
    });

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'User-Agent': 'NeuroAIComparison/1.0',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Mistral API error (${response.status}):`, errorText);
      return res.status(response.status).json({
        error: `Mistral API error: ${response.status} ${response.statusText}`,
        details: errorText,
        code: response.status,
      });
    }

    const data = await response.json();

    // Extract response text
    let text = '';
    if (data.choices?.[0]?.message?.content) {
      text = data.choices[0].message.content;
    } else if (data.message) {
      text = data.message;
    } else if (data.text) {
      text = data.text;
    } else if (typeof data === 'string') {
      text = data;
    }

    if (!text || text.trim() === '') {
      text = 'No response generated. Please try again with a different prompt.';
    }

    const tokensPayload = {
      by: 'messages',
      total: totalTokensEstimate,
      model,
    };

    res.json({
      text: text.trim(),
      raw: data,
      provider: 'mistral',
      usedKeyType,
      tokens: tokensPayload,
    });
  } catch (error) {
    console.error('Mistral provider error:', error);
    res.status(500).json({
      error: `Mistral provider error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      provider: 'mistral',
    });
  }
});

// --- Ollama ---
app.post('/api/ollama', express.json(), async (req, res) => {
  try {
    const { messages, model, baseUrl, models } = req.body;
    const ollamaUrl = baseUrl || process.env.OLLAMA_URL || 'http://localhost:11434';

    if (process.env.DEBUG_OLLAMA === '1')
      console.log(`Calling Ollama model: ${model} at ${ollamaUrl}`);

    const modelList = Array.isArray(models) ? models : model ? [model] : [];
    if (modelList.length === 0) modelList.push(model);

    const results = await Promise.allSettled(
      modelList.map(async (mdl) => {
        const requestBody = {
          model: mdl,
          messages: (messages || []).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          stream: false,
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          if (process.env.DEBUG_OLLAMA === '1')
            console.log(`Ollama request timeout triggered for model ${mdl}`);
          controller.abort();
        }, 180000); // 3 min timeout

        try {
          const response = await fetch(`${ollamaUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          });

          if (!response.ok) {
            const errorText = await response.text();
            return {
              model: mdl,
              error: `Ollama API error: ${response.status} ${response.statusText}`,
              details: errorText,
              provider: 'ollama',
              code: response.status,
            };
          }

          const data = await response.json();
          let text = '';
          if (data.message?.content) {
            text = data.message.content;
          } else if (data.response) {
            text = data.response;
          } else {
            text = 'No response from Ollama';
          }

          return { model: mdl, text, raw: data };
        } catch (e) {
          const err = e instanceof Error ? e : { message: 'Unknown error' };
          if (err.name === 'AbortError') {
            return { model: mdl, error: 'Ollama request timed out', provider: 'ollama', code: 504 };
          }
          return { model: mdl, error: err.message, provider: 'ollama' };
        } finally {
          clearTimeout(timeoutId);
        }
      })
    );

    const formatted =
      modelList.length === 1
        ? results[0].status === 'fulfilled'
          ? results[0].value
          : { error: 'Failed', ...results[0].reason }
        : results.map((r) =>
            r.status === 'fulfilled' ? r.value : { error: 'Failed', ...r.reason }
          );

    res.json(formatted);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    res.status(500).json({ error: message, provider: 'ollama' });
  }
});

// --- Ollama(Validate) ---
app.post('/api/ollama/validate', express.json(), async (req, res) => {
  try {
    const { slug, baseUrl } = req.body;
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ ok: false, error: 'Missing model name' });
    }

    const ollamaUrl = baseUrl || process.env.OLLAMA_URL || 'http://localhost:11434';

    // --- Step 1: Ping Ollama ---
    const pingController = new AbortController();
    const pingTimeout = setTimeout(() => pingController.abort(), 15000);
    try {
      const pingResponse = await fetch(`${ollamaUrl}/`, { signal: pingController.signal });
      if (!pingResponse.ok) {
        return res.status(502).json({
          ok: false,
          error: 'Cannot connect to Ollama instance',
          details: await pingResponse.text(),
          status: pingResponse.status,
        });
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        return res.status(504).json({
          ok: false,
          error: 'Cannot connect to Ollama instance',
          details: 'Connection timeout - Ollama instance not responding',
          status: 504,
        });
      }
      return res.status(502).json({
        ok: false,
        error: 'Cannot connect to Ollama instance',
        details: err.message || 'Unknown connection error',
        status: 502,
      });
    } finally {
      clearTimeout(pingTimeout);
    }

    // --- Step 2: Fetch model list ---
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    let textData = '';
    try {
      const resModels = await fetch(`${ollamaUrl}/api/tags`, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        signal: controller.signal,
      });

      if (!resModels.ok) {
        return res.status(502).json({
          ok: false,
          error: 'Ollama connection error',
          details: await resModels.text(),
          status: resModels.status,
        });
      }

      textData = await resModels.text();
    } catch (err) {
      if (err.name === 'AbortError') {
        return res.status(504).json({
          ok: false,
          error: 'Connection timeout - Ollama instance not responding',
          details: 'Request timed out after 15 seconds.',
          status: 504,
        });
      }
      return res.status(502).json({
        ok: false,
        error: 'Failed to connect to Ollama instance',
        details: err.message || 'Unknown error',
        status: 502,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    let data;
    try {
      data = JSON.parse(textData);
    } catch {
      return res.status(502).json({
        ok: false,
        error: 'Invalid JSON response from Ollama API',
        details: textData.substring(0, 200),
        status: 502,
      });
    }

    let modelList = [];
    if (Array.isArray(data)) {
      modelList = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.models)) {
        modelList = data.models;
      } else if (Array.isArray(data.data)) {
        modelList = data.data;
      }
    }

    const found = modelList.find((m) => m?.name === slug);
    const response = { ok: true, exists: !!found };
    if (!found && modelList.length > 0) {
      response.availableModels = modelList
        .map((m) => m.name)
        .filter((name) => typeof name === 'string')
        .slice(0, 10);
    }
    res.json(response);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    res.status(500).json({ ok: false, error: message, status: 500 });
  }
});

// --- OpenRouter ---
app.post('/api/openrouter', express.json(), async (req, res) => {
  try {
    const { messages, model, apiKey: apiKeyFromBody } = req.body;
    const apiKey = apiKeyFromBody || process.env.OPENROUTER_API_KEY;
    const usedKeyType = apiKeyFromBody ? 'user' : process.env.OPENROUTER_API_KEY ? 'shared' : 'none';

    if (!apiKey) return res.status(400).json({ error: 'Missing OpenRouter API key' });
    if (!model) return res.status(400).json({ error: 'Missing model id' });

    // Sanitize messages
    const isRole = r => ['user', 'assistant', 'system'].includes(r);
    const sanitizedMessages = (Array.isArray(messages) ? messages : [])
      .map(m => ({
        role: isRole(m?.role) ? m.role : 'user',
        content: typeof m?.content === 'string' ? m.content : String(m?.content ?? '')
      }))
      .filter(m => m.content.trim() !== '');

    const totalTokensEstimate = sanitizedMessages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);

    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': req.headers.origin || 'http://localhost',
        'X-Title': 'NeuroAIComparison'
      },
      body: JSON.stringify({
        model,
        messages: sanitizedMessages,
        max_tokens: 2048,
        temperature: 0.7,
        stream: false
      })
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      return res.status(resp.status).json({
        error: `OpenRouter API error: ${resp.status} ${resp.statusText}`,
        details: errorText,
        provider: 'openrouter',
        code: resp.status
      });
    }

    const data = await resp.json();
    let text = '';
    if (data.choices?.[0]?.message?.content) {
      text = data.choices[0].message.content;
    } else if (data.output_text) {
      text = data.output_text;
    } else {
      text = 'No response generated.';
    }

    res.json({
      text: text.trim(),
      raw: data,
      provider: 'openrouter',
      usedKeyType,
      tokens: { by: 'messages', total: totalTokensEstimate, model }
    });
  } catch (e) {
    console.error('OpenRouter provider error:', e);
    res.status(500).json({
      error: `OpenRouter provider error: ${e instanceof Error ? e.message : 'Unknown error'}`,
      provider: 'openrouter'
    });
  }
});

// --- OpenRouter(Validate) ---
app.post('/api/openrouter/validate', express.json(), async (req, res) => {
  try {
    const { apiKey: apiKeyFromBody, model } = req.body;
    const apiKey = apiKeyFromBody || process.env.OPENROUTER_API_KEY;

    if (!apiKey) return res.status(400).json({ ok: false, error: 'Missing OpenRouter API key' });

    // Step 1: Ping OpenRouter with a simple call to models list
    const resp = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    if (!resp.ok) {
      return res.status(resp.status).json({ ok: false, error: 'OpenRouter connection failed', status: resp.status });
    }

    const data = await resp.json();
    const models = Array.isArray(data.data) ? data.data.map(m => m.id) : [];
    const exists = model ? models.includes(model) : true;

    res.json({ ok: true, validKey: true, modelExists: exists, availableModels: models.slice(0, 10) });
  } catch (e) {
    res.status(500).json({ ok: false, error: e instanceof Error ? e.message : 'Unknown error' });
  }
});

// --- OpenRouter(Stream) ---
app.post('/api/openrouter/stream', express.json(), async (req, res) => {
  try {
    const { messages, model, apiKey: apiKeyFromBody } = req.body;
    const apiKey = apiKeyFromBody || process.env.OPENROUTER_API_KEY;
    if (!apiKey) return res.status(400).json({ error: 'Missing OpenRouter API key' });
    if (!model) return res.status(400).json({ error: 'Missing model id' });

    // Prepare response as an SSE stream
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });

    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': req.headers.origin || 'http://localhost',
        'X-Title': 'NeuroAIComparison'
      },
      body: JSON.stringify({ model, messages, stream: true, max_tokens: 2048 })
    });

    if (!resp.ok || !resp.body) {
      res.write(`data: ${JSON.stringify({ error: 'Stream failed', status: resp.status })}\n\n`);
      return res.end();
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();

    const readChunk = async () => {
      const { done, value } = await reader.read();
      if (done) {
        res.write(`data: [DONE]\n\n`);
        return res.end();
      }
      const chunk = decoder.decode(value, { stream: true });
      // OpenRouter sends OpenAI-style stream events
      chunk.split('\n').forEach(line => {
        if (line.startsWith('data:')) res.write(`${line}\n\n`);
      });
      await readChunk();
    };
    await readChunk();
  } catch (e) {
    res.write(`data: ${JSON.stringify({ error: e.message || 'Unknown error' })}\n\n`);
    res.end();
  }
});

// --- Unstable ---
// --- Unstable Provider API ---
app.post('/api/unstable', express.json(), async (req, res) => {
  try {
    const { messages, model, apiKey: apiKeyFromBody, imageDataUrl } = req.body;

    const apiKey = apiKeyFromBody || process.env.INFERENCE_API_KEY;
    const usedKeyType = apiKeyFromBody ? 'user' : process.env.INFERENCE_API_KEY ? 'shared' : 'none';

    if (!apiKey) {
      return res.status(400).json({
        error: 'Missing Unstable API key',
        provider: 'unstable',
        usedKeyType,
      });
    }

    if (!model) return res.status(400).json({ error: 'Missing model id' });

    // Sanitize and validate messages
    const isRole = r => ['user', 'assistant', 'system'].includes(r);
    const sanitizedMessages = (Array.isArray(messages) ? messages : [])
      .map(m => ({
        role: isRole(m?.role) ? m.role : 'user',
        content: typeof m?.content === 'string' ? m.content : ''
      }))
      .filter(m => m.content.trim() !== '');

    // Keep last 10 messages
    const trimmedMessages =
      sanitizedMessages.length > 10 ? sanitizedMessages.slice(-10) : sanitizedMessages;

    if (trimmedMessages.length === 0) {
      trimmedMessages.push({ role: 'user', content: 'Hello' });
    }

    // Handle image attachment note
    const processedMessages = trimmedMessages;
    if (imageDataUrl && processedMessages.length > 0) {
      const lastMessage = processedMessages[processedMessages.length - 1];
      if (lastMessage.role === 'user') {
        lastMessage.content +=
          '\n\n[Image attached - processing capabilities depend on the selected model]';
      }
    }

    // Token estimate
    const totalTokensEstimate = processedMessages.reduce(
      (sum, msg) => sum + Math.ceil(msg.content.length / 4),
      0
    );

    const requestBody = {
      model,
      messages: processedMessages,
      max_tokens: 2048,
      temperature: 0.7,
      stream: false,
    };

    const endpoint =
      process.env.INFERENCE_API_ENDPOINT ||
      'https://inference.quran.lat/v1/chat/completions';

    console.log(`Making request to Unstable API for model: ${model}`, {
      endpoint,
      messageCount: processedMessages.length,
      tokensEstimate: totalTokensEstimate,
    });

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'NeuroAIComparison/1.0',
      },
      body: JSON.stringify(requestBody),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error(`Unstable API error (${resp.status}):`, errorText);
      return res.status(resp.status).json({
        error: `Unstable API error: ${resp.status} ${resp.statusText}`,
        details: errorText,
        code: resp.status,
        provider: 'unstable',
        usedKeyType,
      });
    }

    const data = await resp.json();

    // Extract the text field
    let text = '';
    if (data.choices?.[0]?.message) {
      text = data.choices[0].message.content || '';
    } else if (data.message) {
      text = data.message;
    } else if (data.text) {
      text = data.text;
    } else if (typeof data === 'string') {
      text = data;
    }

    if (!text || text.trim() === '') {
      text = 'No response generated. Please try again with a different prompt.';
    }

    const tokensPayload = {
      by: 'messages',
      total: totalTokensEstimate,
      model,
    };

    res.json({
      text: text.trim(),
      raw: data,
      provider: 'unstable',
      usedKeyType,
      tokens: tokensPayload,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Unstable provider error:', err);
    res.status(500).json({
      error: `Unstable provider error: ${message}`,
      provider: 'unstable',
    });
  }
});

// --- SPA CATCH-ALLS ---
// This is crucial for BrowserRouter. It ensures that any non-API request
// to /neurovault/* (like /neurovault/dashboard) serves the React app.
app.get(/\/neurovault(\/.*)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build/neurovault', 'index.html'));
});

app.get(/\/neuropromptgallery(\/.*)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build/neuropromptgallery', 'index.html'));
});

app.get(/\/neuroaicomparison(\/.*)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build/neuroaicomparison', 'index.html'));
});

// --- PDF Parser ---
app.post('/api/pdf-to-text', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF uploaded' });
    }
    const data = await pdfParse(req.file.buffer);
    res.json({ text: data.text || '' });
  } catch (err) {
    console.error('PDF parse error:', err);
    res.status(500).json({ error: 'Failed to parse PDF' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
