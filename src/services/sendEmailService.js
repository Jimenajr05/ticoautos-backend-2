const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Envia el correo electrónico de verificación de cuenta al usuario.
 * Utiliza SendGrid para enviar un correo con un enlace único de validación.
 */
const enviarCorreoVerificacion = async (email, nombre, token) => {
    const verificationLink = `${process.env.BACKEND_URL}/api/auth/verificar-correo?token=${token}`;

    const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'Verifica tu cuenta en TicoAutos',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Hola ${nombre},</h2>
                <p>Gracias por registrarte en <strong>TicoAutos</strong>.</p>
                <p>Para activar tu cuenta, haz clic en el siguiente enlace:</p>
                <p>
                    <a href="${verificationLink}" style="display: inline-block; padding: 12px 20px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px;">
                        Verificar cuenta
                    </a>
                </p>
                <p>Este enlace expirará en 1 hora.</p>
            </div>
        `
    };

    await sgMail.send(msg);
};

module.exports = {
    enviarCorreoVerificacion
};