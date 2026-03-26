const mongoose = require('mongoose');

// Define el esquema del usuario
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
        required: true,
        select: false, //Para no devolver consultas
    },
    profileImage: {
        type: String,
        default: null
    },
    isVerified:{
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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);