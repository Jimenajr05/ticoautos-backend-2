const User = require('../models/user');

const verifyEmail = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).send(`
            <h2>Enlace inválido</h2>
            <p>No se proporcionó un token de verificación.</p>
        `);
    }

    try {
        console.log('Token recibido:', token);

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() }
        });

        if (!user) {
            console.log('No se encontró usuario con token válido o el token expiró');

            return res.status(400).send(`
                <h2>Enlace inválido o expirado</h2>
                <p>El enlace de verificación no es válido o ya expiró.</p>
            `);
        }

        user.isVerified = true;
        user.status = 'active';
        user.verificationToken = null;
        user.verificationTokenExpires = null;

        await user.save();

        return res.status(200).send(`
            <h2>Cuenta verificada correctamente</h2>
            <p>Tu cuenta ya fue activada. Ahora puedes iniciar sesión.</p>
        `);
    } catch (error) {
        console.error('Error al verificar correo:', error);

        return res.status(500).send(`
            <h2>Error interno del servidor</h2>
            <p>No se pudo verificar la cuenta.</p>
        `);
    }
};

module.exports = verifyEmail;