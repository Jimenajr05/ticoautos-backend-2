const twilio = require('twilio');

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

/**
 * Envia un mensaje SMS al usuario con el código de verificación (2FA).
 * Utiliza la API de Twilio para enviar el mensaje de texto.
*/
const enviarCodigoSMS = async (telefono, codigo) => {
    return await client.messages.create({
        body: `Tu código de verificación de TicoAutos es: ${codigo}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: telefono
    });
};

module.exports = { enviarCodigoSMS };

