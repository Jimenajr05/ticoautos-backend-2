const axios = require("axios");

const validarMensajeConAI = async (mensaje) => {
  try {
    const prompt = `
Eres un sistema de moderación para una plataforma de compra y venta de vehículos.

Debes analizar si el mensaje contiene información de contacto personal o intenta sacar la negociación fuera de la plataforma.

Bloquea mensajes que contengan:
- Números de teléfono
- WhatsApp
- Correos electrónicos
- Redes sociales como Instagram, Facebook, TikTok
- Links externos
- Direcciones exactas
- Frases como "escríbame por fuera", "hablemos por WhatsApp", "mi número es"

Permite mensajes normales sobre:
- Precio
- Estado del vehículo
- Año
- Modelo
- Kilometraje
- Negociación dentro de la plataforma

Responde únicamente en JSON válido con este formato:
{
  "permitido": true o false,
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

    return {
      permitido: false,
      razon: "No se pudo validar el mensaje. Intente nuevamente.",
    };
  }
};

module.exports = { validarMensajeConAI };