const { validarMensajeConAI } = require("../services/aiModerationService");

const validarMensajeChat = async (req, res) => {
  try {
    const { mensaje } = req.body;

    if (!mensaje) {
      return res.status(400).json({
        permitido: false,
        razon: "Status 400",
      });
    }

    const resultado = await validarMensajeConAI(mensaje);

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