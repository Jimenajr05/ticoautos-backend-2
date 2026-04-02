const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Función que maneja el login del usuario
const login = async (req, res) => {
    // Obtiene email y password del body de la petición
    const { email, password } = req.body;

    // Verifica que ambos campos existan
    if (!email || !password) {
        return res.status(400).json({ message: 'El email y contraseña son requeridos' });
    }

    // Verifica que exista la clave secreta para generar el JWT
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'Error 500' });
    }

    try {
        // Busca el usuario por email e incluye la contraseña
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Contraseña o usuario invalido' });
        }

        if (user.authProvider === 'google') {
            return res.status(400).json({
                message: 'Esta cuenta fue registrada con Google. Debes iniciar sesión con Google.'
            });
        }

        if (user.status !== 'active' || !user.isVerified){
            return res.status(403).json({
                message: 'Debes verificar tu cuenta antes de iniciar sesión'
            });
        }

        // Compara la contraseña enviada con la guardada
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Contraseña o usuario invalido' });
        }

        // Genera el token JWT con id y email del usuario
        const token = jwt.sign(
          { id: user._id, email: user.email }, 
          process.env.JWT_SECRET, 
          { expiresIn: '1h' }
        );

        // Respuesta exitosa con token y datos del usuario
        return res.status(200).json({ 
          message: 'Login successful', 
          token,
          user: {
            id: user._id,
            cedula: user.cedula,
            name: user.name,
            lastName: user.lastName,
            phone: user.phone,
            email: user.email,
            profileImage: user.profileImage
          }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error 500' });
    }
};

module.exports = login;