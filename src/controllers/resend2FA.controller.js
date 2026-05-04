const User = require('../models/user');
const { enviarCodigoSMS } = require('../services/sendSmsService');

//Genera un código aleatorio de 6 dígitos (2FA).

const generarCodigo2FA = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

//Reenviar el código de autenticación (2FA) por SMS.
//Valida el usuario, genera un nuevo código, actualiza la base de datos y envía el SMS.
const reenviarCodigo2FA = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({});
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({});
        }

        if (!user.phone) {
            return res.status(400).json({});
        }

        if (user.authProvider === 'google') {
            return res.status(400).json({});
        }

        const codigo = generarCodigo2FA();
        const expiracion = new Date(Date.now() + 5 * 60 * 1000);

        user.twoFactorCode = codigo;
        user.twoFactorExpires = expiracion;
        user.twoFactorVerified = false;
        user.twoFactorAttempts = 0;

        await user.save();

        await enviarCodigoSMS(user.phone, codigo);

        return res.status(200).json({

            requires2FA: true,
            userId: user._id,
            expiresAt: expiracion
        });

    } catch (error) {
        console.error('Error 500', error);
        return res.status(500).json({});
    }
};

module.exports = { reenviarCodigo2FA };