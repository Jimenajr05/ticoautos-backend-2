
import { validarMensajeConAI } from "../services/aiModerationService.js";

export const validarMensajeChat = async (req, res) => {
  try {
    const { mensaje } = req.body;

    if (!mensaje || mensaje.trim() === "") {
      return res.status(400).json({
        permitido: false,
        mensaje: "Error 400",
      });
    }

    const resultado = await validarMensajeConAI(mensaje);

    if (!resultado.permitido) {
      return res.status(403).json({
        permitido: false,
        mensaje: resultado.razon,
      });
    }

    return res.json({
      permitido: true,
      mensaje: "Mensaje permitido.",
    });
  } catch (error) {
    console.error("Error en validación de chat:", error);

    return res.status(500).json({
      permitido: false,
      mensaje: "Error 500.",
    });
  }
};
