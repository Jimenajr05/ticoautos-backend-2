const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { getPadronDataByCedula } = require('../services/padronService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Manejar el inicio de sesión o registro utilizando Google OAuth2
 * Verifica el token de Google, comprueba si el usuario ya existede
 * Si un nuevo usuario solicita cédula y teléfono para validarlo en el padrón antes de registrarlo.
*/
const googleLoginOrRegister = async (req, res) => {
    const { credential, cedula, phone } = req.body;

    if (!credential) {
        return res.status(400).json({ message: 'Estado 400' });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'Estado 500' });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(500).json({ message: 'Estado 500' });
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
            return res.status(400).json({ message: 'Estado 400' });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            //Si ya existe pero no es cuenta Google, bloquear
            if (existingUser.authProvider !== 'google') {
                return res.status(409).json({
                    message: 'Estado 409'
                });
            }

            const token = jwt.sign(
                { id: existingUser._id, email: existingUser.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            return res.status(200).json({
                message: 'Estado 200',
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

        //Usuario nuevo de Google, todavía falta cédula y teléfono
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
            return res.status(400).json({ message: "Estado 400" });
        }

        const existingUserByCedula = await User.findOne({ cedula: normalizedCedula });
        if (existingUserByCedula) {
            return res.status(409).json({ message: "Estado 409" });
        }

        let normalizedPhone = phone.trim();

        if (/^\d{8}$/.test(normalizedPhone)) {
            normalizedPhone = `+506${normalizedPhone}`;
        }

        if (!/^\+\d{8,15}$/.test(normalizedPhone)) {
            return res.status(400).json({ message: "Error 400" });
        }

        const existingUserByPhone = await User.findOne({ phone: normalizedPhone });
        if (existingUserByPhone) {
            return res.status(409).json({ message: "Estado 409" });
        }

        const padronData = await getPadronDataByCedula(normalizedCedula);

        if (!padronData || padronData.message === 'No encontrado') {
            return res.status(400).json({
                message: 'Estado 400'
            });
        }

        const fullLastName = `${padronData.apellidoPaterno} ${padronData.apellidoMaterno}`.trim();

        const user = await User.create({
            googleId,
            authProvider: 'google',
            cedula: normalizedCedula,
            name: padronData.nombre.trim(),
            lastName: fullLastName,
            phone: normalizedPhone,
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
            message: 'Estado 201',
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
        return res.status(500).json({});
    }
};

module.exports = {
    googleLoginOrRegister
};