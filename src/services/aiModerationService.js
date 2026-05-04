const axios = require("axios");

const validarMensajeConAI = async (mensaje) => {
  try {
    const prompt = `
Eres un sistema de moderación para TicoAuto, una plataforma de compra y venta de vehículos.

Tu tarea es analizar el mensaje enviado por un usuario y determinar si debe permitirse o bloquearse.

Debes bloquear el mensaje si comparten información personal de contacto, como:
- Números de teléfono
- WhatsApp
- Correos electrónicos
- Redes sociales como Instagram, Facebook, TikTok, X entre otras
- Links de redes sociales
- Nombres de usuario de redes sociales
- Links externos
- Direcciones de google Maps
- Direcciones de barrios o calles para reunirse fuera de la plataforma
- Frases que intenten sacar la conversación de la plataforma:
  "escríbame por fuera"
  "hablemos por WhatsApp"
  "mi número es"
  "le paso mi contacto"
  "me escribe al correo"
  "búsqueme en Facebook"
  "sígame en Instagram"
  "nos vemos en "
  "¿Acepta Bitcoin?"
  "¿Acepta pago en efectivo?"

Debes PERMITIR mensajes normales relacionados con la negociación dentro de la plataforma, como:
- Preguntas sobre precio
- Preguntas sobre el marchamo
- Preguntas sobre si tiene el DEKRA 
- Preguntas sobre estado del vehículo
- Preguntas sobre año
- Preguntas sobre modelo
- Preguntas sobre kilometraje
- Preguntas sobre disponibilidad
- Ofertas de compra sin datos personales
- Consultas generales sobre el vehículo

Reglas importantes:
1. Si hay duda razonable de que el mensaje intenta compartir contacto personal, bloquéalo.
2. No expliques demasiado.
3. Responde únicamente en JSON válido.
4. No agregues texto antes ni después del JSON.

Formato obligatorio de respuesta:
{
  "permitido": true,
  "razon": "explicación corta"
}

Mensaje a evaluar:
"${mensaje}"
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.OPENROUTER_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "TicoAutos",
        },
      }
    );

    const contenido = response.data.choices[0].message.content;

    return JSON.parse(contenido);
  } catch (error) {
    console.error("Error validando mensaje con AI:", error.message);

    if (error.response) {
      console.error("Status OpenRouter:", error.response.status);
      console.error("Data OpenRouter:", error.response.data);
    }

    return {
      permitido: false,
      razon: "No se pudo validar el mensaje. Intente nuevamente.",
    };
  }
};

module.exports = {
  validarMensajeConAI,
};