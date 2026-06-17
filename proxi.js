// /api/proxy.js — Proxy seguro para Groq API en Vercel
export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  // Validar que haya body
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Body inválido' });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    console.error('[Proxy] GROQ_API_KEY no configurada');
    return res.status(500).json({ 
      error: 'Error de configuración del servidor',
      message: 'La API key de Groq no está configurada en las variables de entorno.'
    });
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

    // Si Groq respondió error
    if (!groqResponse.ok) {
      console.error('[Proxy] Error de Groq:', data);
      return res.status(groqResponse.status).json({
        error: 'Error de la API de Groq',
        details: data.error?.message || 'Error desconocido',
        code: data.error?.code || null
      });
    }

    // Respuesta exitosa
    return res.status(200).json(data);

  } catch (error) {
    console.error('[Proxy] Error de red:', error);
    return res.status(502).json({
      error: 'Error de conexión con Groq',
      message: error.message
    });
  }
}

// Configuración de CORS si accedes desde otro dominio (opcional)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
