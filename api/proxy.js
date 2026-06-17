// api/proxy.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY no configurada' });
  }

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await groqResponse.json();
    return res.status(groqResponse.status).json(data);

  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};
