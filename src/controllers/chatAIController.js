const { validarMensajeConAI } = require("../services/aiModerationService");

//Controlador para validar mensajes de chat utilizando IA.

const validarMensajeChat = async (req, res) => {
  try {
    const { mensaje } = req.body;

    //Si no hay mensaje, retorna un error 400
    if (!mensaje) {
      return res.status(400).json({
        permitido: false,
        razon: "Status 400",
      });
    }

    // Consulta al servicio de moderación de IA
    const resultado = await validarMensajeConAI(mensaje);

    // Retorna la respuesta de la IA al cliente
    return res.json({
      permitido: resultado.permitido,
      razon: resultado.razon || resultado.mensaje || "Status 400",
    });
  } catch (error) {
    console.error("Error en chatAIController:", error.message);

    return res.status(500).json({
      permitido: false,
      razon: "Error 500",
    });
  }
};

module.exports = { validarMensajeChat };