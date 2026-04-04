const User = require('../models/user');
const bcrypt = require('bcrypt');
const { enviarCodigoSMS } = require('../services/sendSmsService');

const generarCodigo2FA = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Función que maneja el login del usuario
const login = async (req, res) => {
    const { email, password } = req.body;

    // Verifica que ambos campos existan
    if (!email || !password) {
        return res.status(400).json({
            message: 'Error 400'
        });
    }

    try {
        const normalizedEmail = email.toLowerCase().trim();

        // Busca el usuario por email e incluye la contraseña
        const user = await User.findOne({ email: normalizedEmail }).select('+password');

        if (!user) {
            return res.status(401).json({
                message: 'Error 401'
            });
        }

        // Verifica si la cuenta fue creada con Google
        if (user.authProvider === 'google') {
            return res.status(400).json({
                message: 'Error 400'
            });
        }

        // Verifica si la cuenta está activa y verificada
        if (user.status !== 'active' || !user.isVerified) {
            return res.status(403).json({
                message: 'Error 403'
            });
        }

        // Compara la contraseña enviada con la guardada
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({
                message: 'Correo o contraseña inválidos'
            });
        }

        // Verifica que tenga teléfono registrado
        if (!user.phone) {
            return res.status(400).json({
                message: 'Error 400'
            });
        }

        // Genera el código 2FA y su expiración
        const codigo = generarCodigo2FA();
        const expiracion = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

        // Guarda el código temporalmente en el usuario
        user.twoFactorCode = codigo;
        user.twoFactorExpires = expiracion;

        await user.save();

        // Envía el código por SMS
        await enviarCodigoSMS(user.phone, codigo);

        // Responde indicando que falta verificar el código
        return res.status(200).json({
            message: 'Estado 200',
            requires2FA: true,
            userId: user._id
        });

    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({
            message: 'Error 500'
        });
    }
};

module.exports = login;