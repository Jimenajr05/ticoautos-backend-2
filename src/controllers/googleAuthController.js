const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { getPadronDataByCedula } = require('../services/padronService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLoginOrRegister = async (req, res) => {
    const { credential, cedula, phone } = req.body;

    if (!credential) {
        return res.status(400).json({ message: 'Google credential is required' });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'JWT_SECRET is not configured' });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(500).json({ message: 'GOOGLE_CLIENT_ID is not configured' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const googleId = payload.sub;
        const email = payload.email?.toLowerCase().trim();
        const googleName = payload.given_name || '';
        const googleLastName = payload.family_name || '';
        const picture = payload.picture || null;

        if (!email) {
            return res.status(400).json({ message: 'No se pudo obtener el correo de Google' });
        }

        // Caso 1: ya existe usuario con ese correo
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // Si ya existe pero no es cuenta Google, bloquear
            if (existingUser.authProvider !== 'google') {
                return res.status(409).json({
                    message: 'Este correo ya está registrado con correo y contraseña'
                });
            }

            const token = jwt.sign(
                { id: existingUser._id, email: existingUser.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            return res.status(200).json({
                message: 'Login con Google exitoso',
                token,
                user: {
                    id: existingUser._id,
                    cedula: existingUser.cedula,
                    name: existingUser.name,
                    lastName: existingUser.lastName,
                    phone: existingUser.phone,
                    email: existingUser.email,
                    profileImage: existingUser.profileImage
                }
            });
        }

        // Caso 2: usuario nuevo de Google, todavía falta cédula y teléfono
        if (!cedula || !phone) {
            return res.status(200).json({
                requiresCedula: true,
                googleUser: {
                    email,
                    name: googleName,
                    lastName: googleLastName,
                    profileImage: picture
                }
            });
        }

        const normalizedCedula = cedula.trim();

        if (!/^\d{9}$/.test(normalizedCedula)) {
            return res.status(400).json({
                message: 'Error 400'
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
                message: 'Debe ser mayor de edad para continuar (cédula no encontrada en padrón)'
            });
        }

        const fullLastName = `${padronData.apellidoPaterno} ${padronData.apellidoMaterno}`.trim();

        const user = await User.create({
            googleId,
            authProvider: 'google',
            cedula: normalizedCedula,
            name: padronData.nombre.trim(),
            lastName: fullLastName,
            phone: phone.trim(),
            email,
            password: 'GOOGLE_AUTH_NO_PASSWORD',
            profileImage: picture,
            isVerified: true,
            status: 'active'
        });

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(201).json({
            message: 'Usuario registrado con Google correctamente',
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
        return res.status(500).json({
            message: 'Error 500'
        });
    }
};

module.exports = {
    googleLoginOrRegister
};