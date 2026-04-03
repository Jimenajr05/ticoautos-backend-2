const User = require('../models/user');
const bcrypt = require('bcrypt');
const { getPadronDataByCedula } = require('../services/padronService');

const register = async (req, res) => {
    const { cedula, phone, email, password } = req.body;

    if (!cedula || !phone || !email || !password) {
        return res.status(400).json({
            message: 'La cédula, el teléfono, el correo y la contraseña son obligatorios'
        });
    }

    const normalizedCedula = cedula.trim();
    let normalizedPhone = phone.trim();
    const normalizedEmail = email.toLowerCase().trim();

    if (!/^\d{9}$/.test(normalizedCedula)) {
        return res.status(400).json({
            message: 'La cédula debe tener exactamente 9 dígitos'
        });
    }

    // Si el usuario escribe solo 8 dígitos, se le agrega +506 automáticamente
    if (/^\d{8}$/.test(normalizedPhone)) {
        normalizedPhone = `+506${normalizedPhone}`;
    }

    if (!/^\+\d{8,15}$/.test(normalizedPhone)) {
        return res.status(400).json({
            message: 'El número de teléfono debe estar en formato internacional, por ejemplo: +506'
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: 'La contraseña debe tener al menos 6 caracteres'
        });
    }

    try {
        const existingUserByEmail = await User.findOne({ email: normalizedEmail });
        if (existingUserByEmail) {
            return res.status(409).json({
                message: 'Este correo ya está en uso'
            });
        }

        const existingUserByCedula = await User.findOne({ cedula: normalizedCedula });
        if (existingUserByCedula) {
            return res.status(409).json({
                message: 'La cédula ya está registrada'
            });
        }

        const padronData = await getPadronDataByCedula(normalizedCedula);

        if (!padronData || padronData.message === 'No encontrado') {
            return res.status(400).json({
                message: 'Error 400'
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
            isVerified: false,
            status: 'pending',
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
                    message: 'Este correo ya está en uso'
                });
            }

            if (error.keyPattern?.cedula) {
                return res.status(409).json({
                    message: 'La cédula ya está registrada'
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