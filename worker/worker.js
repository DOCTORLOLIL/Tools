/* BULU מחוללים – שרת קטן שמעביר את הפרומפט ל-Gemini ומחזיר תשובה.
   רץ ב-Cloudflare Workers. לא שומר שום מידע.

   הגדרות ב-Cloudflare (Settings → Variables and Secrets):
   - GEMINI_API_KEY  (Secret, חובה)  – המפתח מ-aistudio.google.com
   - MODEL           (Text, לא חובה) – ברירת מחדל: gemini-flash-latest
*/

const ALLOWED_ORIGINS = [
  'https://tools.bulu.ltd',
  'http://localhost:8765'
];

// רק פרומפטים שהאתר שלנו יוצר – כדי שאף אחד לא ישתמש בשרת כ-AI חינמי לכל דבר
const ALLOWED_PREFIXES = [
  'אתה כותב קורות חיים מקצועי',
  'אתה יועץ עסקי'
];

const MAX_PROMPT = 20000;

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function reply(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors(origin) }
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(origin) });
    if (request.method !== 'POST') return reply({ error: 'method' }, 405, origin);
    if (!ALLOWED_ORIGINS.includes(origin)) return reply({ error: 'origin' }, 403, origin);
    if (!env.GEMINI_API_KEY) return reply({ error: 'config' }, 500, origin);

    let prompt;
    try { ({ prompt } = await request.json()); } catch (e) { return reply({ error: 'bad' }, 400, origin); }
    if (typeof prompt !== 'string' || prompt.length > MAX_PROMPT ||
        !ALLOWED_PREFIXES.some(p => prompt.startsWith(p))) {
      return reply({ error: 'bad' }, 400, origin);
    }

    const model = env.MODEL || 'gemini-flash-latest';
    let res;
    try {
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7 }
        })
      });
    } catch (e) {
      return reply({ error: 'upstream' }, 502, origin);
    }

    if (res.status === 429) return reply({ error: 'quota' }, 429, origin);
    if (!res.ok) return reply({ error: 'upstream', status: res.status }, 502, origin);

    const data = await res.json();
    const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
    if (!text) return reply({ error: 'empty' }, 502, origin);
    return reply({ text }, 200, origin);
  }
};
