const twilio = require('twilio');

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const enviarCodigoSMS = async (telefono, codigo) => {
    return await client.messages.create({
        body: `Tu código de verificación de TicoAutos es: ${codigo}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: telefono
    });
};

module.exports = { enviarCodigoSMS };

