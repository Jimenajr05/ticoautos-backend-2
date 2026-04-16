const User = require('../models/user');
const bcrypt = require('bcrypt');
const { getPadronDataByCedula } = require('../services/padronService');

const register = async (req, res) => {
    const { cedula, phone, email, password } = req.body;

    if (!cedula || !phone || !email || !password) {
        return res.status(400).json({
            message: 'Error 400'
        });
    }

    const normalizedCedula = cedula.trim();
    let normalizedPhone = phone.trim();
    const normalizedEmail = email.toLowerCase().trim();

    if (!/^\d{9}$/.test(normalizedCedula)) {
        return res.status(400).json({
            message: 'Error 400'
        });
    }

    if (/^\d{8}$/.test(normalizedPhone)) {
        normalizedPhone = `+506${normalizedPhone}`;
    }

    if (!/^\+\d{8,15}$/.test(normalizedPhone)) {
        return res.status(400).json({
            message: 'Error 400'
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: 'Error 400'
        });
    }

    try {
        const existingUserByEmail = await User.findOne({ email: normalizedEmail });
        if (existingUserByEmail) {
            return res.status(409).json({
                message: 'Estado 409'
            });
        }

        const existingUserByCedula = await User.findOne({ cedula: normalizedCedula });
        if (existingUserByCedula) {
            return res.status(409).json({
                message: 'Error 409'
            });
        }

        const padronData = await getPadronDataByCedula(normalizedCedula);

        if (!padronData || padronData.message === 'No encontrado') {
            return res.status(400).json({
                message: 'Debe ser mayor de edad para registrarse (cédula no encontrada en padrón)'
            });
        }

        const fullLastName = `${padronData.apellidoPaterno} ${padronData.apellidoMaterno}`.trim();
        const hashedPassword = await bcrypt.hash(password, 10);
        const profileImage = req.file ? `/${req.file.path.replace(/\\/g, '/')}` : null;

        const user = await User.create({
            cedula: normalizedCedula,
            name: padronData.nombre.trim(),
            lastName: fullLastName,
            phone: normalizedPhone,
            email: normalizedEmail,
            password: hashedPassword,
            profileImage,
            isVerified: true,
            status: 'active',
            authProvider: 'local'
        });

        return res.status(201).json({
            message: 'Estado 200',
            user: {
                id: user._id,
                cedula: user.cedula,
                name: user.name,
                lastName: user.lastName,
                phone: user.phone,
                email: user.email,
                profileImage: user.profileImage,
                isVerified: user.isVerified,
                status: user.status,
                authProvider: user.authProvider
            }
        });
    } catch (error) {
        if (error?.code === 11000) {
            if (error.keyPattern?.email) {
                return res.status(409).json({
                    message: 'Error 409'
                });
            }

            if (error.keyPattern?.cedula) {
                return res.status(409).json({
                    message: 'Error 409'
                });
            }
        }

        console.error('Error al registrar usuario:', error);
        return res.status(500).json({
            message: 'Error 500'
        });
    }
};

module.exports = register;