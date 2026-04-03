const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    cedula: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function () {
            return this.authProvider === 'local';
        },
        select: false
    },
    profileImage: {
        type: String,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'active'],
        default: 'pending'
    },
    googleI: {
        type: String,
        default: null
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },

    //twoFactorCode guerda el codigo SMS 
    twoFactorCode: {
        type: String,
        default: null
    },

    //Guarda hasta cuándo sirve ese código.
    twoFactorExpires: {
        type: Date,
        default: null
    },

    //Verifica si a pasó la verificación 2FA en ese intento.
    twoFactorVerified: {
        type: Boolean,
        default: false
    },

    //Contar intentos fallidos
    twoFactorAttempts: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);