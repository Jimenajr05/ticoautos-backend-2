const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Verificar el código de autenticación (2FA).
 * Valida que el código sea correcto y no haya expirado. Si es válido, genera un token JWT para el usuario.
 * Permite un máximo de 3 intentos antes de invalidar el código actual.
**/
const verificarCodigo2FA = async (req, res) => {
    const { usuarioId, codigo } = req.body;

    if (!usuarioId || !codigo) {
        return res.status(400).json({
            message: 'Error 400'
        });
    }

    if (!/^\d{6}$/.test(codigo)) {
        return res.status(400).json({
            message: 'Error 400'
        });
    }

    try {
        const usuario = await User.findById(usuarioId);

        if (!usuario) {
            return res.status(404).json({
                message: 'Error 404'
            });
        }

        if (!usuario.twoFactorCode || !usuario.twoFactorExpires) {
            return res.status(400).json({
                message: 'Estado 400'
            });
        }

        if (new Date() > usuario.twoFactorExpires) {
            usuario.twoFactorCode = null;
            usuario.twoFactorExpires = null;
            usuario.twoFactorAttempts = 0;
            await usuario.save();

            return res.status(400).json({
                message: 'Estado 400'
            });
        }

        if (usuario.twoFactorCode !== codigo) {
            usuario.twoFactorAttempts += 1;

            if (usuario.twoFactorAttempts >= 3) {
                usuario.twoFactorCode = null;
                usuario.twoFactorExpires = null;
                usuario.twoFactorAttempts = 0;
                await usuario.save();

                return res.status(400).json({
                    message: 'Estado 400'
                });
            }

            await usuario.save();

            return res.status(400).json({
                message: `Código incorrecto. Intentos restantes: ${3 - usuario.twoFactorAttempts}`
            });
        }

        usuario.twoFactorCode = null;
        usuario.twoFactorExpires = null;
        usuario.twoFactorVerified = true;
        usuario.twoFactorAttempts = 0;
        await usuario.save();

        const token = jwt.sign(
            {
                id: usuario._id,
                name: usuario.name,
                email: usuario.email,
                authProvider: usuario.authProvider
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES || '1d' }
        );

        return res.status(200).json({
            token,
            usuario: {
                id: usuario._id,
                name: usuario.name,
                email: usuario.email,
                authProvider: usuario.authProvider
            }
        });

    } catch (error) {
        console.error('Error al verificar código 2FA:', error);
        return res.status(500).json({
            message: 'Error 500'
        });
    }
};

module.exports = { verificarCodigo2FA };