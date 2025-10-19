import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = process.env.ANTHROPIC_API_URL || 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

router.post('/generate', async (req, res) => {
  const { prompt, max_tokens = 512 } = req.body as { prompt?: string; max_tokens?: number };
  if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'prompt (string) is required' });

  if (!ANTHROPIC_API_KEY) {
    return res.json({ success: true, model: 'mock', text: `MOCK: Received prompt length ${prompt.length}` });
  }

  try {
    const body = {
      model: ANTHROPIC_MODEL,
      max_tokens,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    const r = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ success: false, error: `Anthropic API error: ${r.status} ${text}` });
    }

    const json: any = await r.json();
    const aiText = json.content?.[0]?.text || JSON.stringify(json);

    return res.json({ success: true, model: ANTHROPIC_MODEL, id: json.id, text: aiText, usage: json.usage });
  } catch (err: any) {
    console.error('AI generate error', err);
    return res.status(500).json({ success: false, error: err?.message || String(err) });
  }
});

export default router;
