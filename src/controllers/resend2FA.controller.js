const User = require('../models/user');
const { enviarCodigoSMS } = require('../services/sendSmsService');

const generarCodigo2FA = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const reenviarCodigo2FA = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({
            message: 'Error 400'
        });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'Error 404'
            });
        }

        if (!user.phone) {
            return res.status(400).json({
                message: 'Error 400'
            });
        }

        if (user.authProvider === 'google') {
            return res.status(400).json({
                message: 'Error 400'
            });
        }

        const codigo = generarCodigo2FA();
        const expiracion = new Date(Date.now() + 5 * 60 * 1000);

        user.twoFactorCode = codigo;
        user.twoFactorExpires = expiracion;
        user.twoFactorVerified = false;

        await user.save();

        await enviarCodigoSMS(user.phone, codigo);

        return res.status(200).json({
            message: 'Estado 200',
            expiraEn: expiracion
        });

    } catch (error) {
        console.error('Error al reenviar código 2FA:', error);
        return res.status(500).json({
            message: 'Error 500'
        });
    }
};

module.exports = { reenviarCodigo2FA };