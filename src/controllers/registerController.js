const User = require('../models/user');
const bcrypt = require('bcrypt');
const { getPadronDataByCedula } = require('../services/padronService');

const register = async (req, res) => {
    const { cedula, phone, email, password } = req.body;

    if (!cedula || !phone || !email || !password) {
        return res.status(400).json({ message: 'Cedula, phone, email and password are required' });
    }

    if (!/^\d{9}$/.test(cedula.trim())) {
        return res.status(400).json({ message: 'Cedula must contain exactly 9 digits' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedCedula = cedula.trim();

        const existingUserByEmail = await User.findOne({ email: normalizedEmail });
        if (existingUserByEmail) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        const existingUserByCedula = await User.findOne({ cedula: normalizedCedula });
        if (existingUserByCedula) {
            return res.status(409).json({ message: 'Cedula already registered' });
        }

        const padronData = await getPadronDataByCedula(normalizedCedula);

        if (!padronData || padronData.message === 'No encontrado') {
            return res.status(400).json({ message: 'La cédula no existe en el padrón' });
        }

        const fullLastName = `${padronData.apellidoPaterno} ${padronData.apellidoMaterno}`.trim();

        const hashedPassword = await bcrypt.hash(password, 10);
        const profileImage = req.file ? `/${req.file.path.replace(/\\/g, '/')}` : null;

        const user = await User.create({
            cedula: normalizedCedula,
            name: padronData.nombre.trim(),
            lastName: fullLastName,
            phone: phone.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            profileImage,
            isVerified: false,
            status: 'pending'
        });

        return res.status(201).json({
            message: 'Usuario registrado correctamente',
            user: {
                id: user._id,
                cedula: user.cedula,
                name: user.name,
                lastName: user.lastName,
                phone: user.phone,
                email: user.email,
                profileImage: user.profileImage,
                isVerified: user.isVerified,
                status: user.status
            }
        });
    } catch (error) {
        if (error?.code === 11000) {
            if (error.keyPattern?.email) {
                return res.status(409).json({ message: 'Email already in use' });
            }

            if (error.keyPattern?.cedula) {
                return res.status(409).json({ message: 'Cedula already registered' });
            }
        }

        console.error(error);
        return res.status(500).json({ message: 'Error registering user' });
    }
};

module.exports = register;