const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verificarCodigo2FA = async (req, res) => {
    const { usuarioId, codigo } = req.body;

    try {
        const usuario = await User.findById(usuarioId);

        if (!usuario) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        if (!usuario.codigo2FA || !usuario.codigo2FAExpira) {
            return res.status(400).json({
                message: 'No hay código pendiente de verificación'
            });
        }

        if (new Date() > usuario.codigo2FAExpira) {
            usuario.codigo2FA = null;
            usuario.codigo2FAExpira = null;
            await usuario.save();

            return res.status(400).json({
                message: 'El código ha expirado'
            });
        }

        if (usuario.codigo2FA !== codigo) {
            return res.status(400).json({
                message: 'Código incorrecto'
            });
        }

        usuario.codigo2FA = null;
        usuario.codigo2FAExpira = null;
        await usuario.save();

        const token = jwt.sign(
            {
                id: usuario._id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                proveedor: usuario.proveedor
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES || '1d' }
        );

        return res.status(200).json({
            token,
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                proveedor: usuario.proveedor
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error al verificar código 2FA',
            error: error.message
        });
    }
};

module.exports = { verificarCodigo2FA };


