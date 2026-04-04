// Importa express para crear rutas
const express = require('express');

// Importa el middleware de multer para subir archivos
const upload = require('../middlewares/uploadMiddleware');

// Importa controladores existentes
const register = require('../controllers/registerController');
const login = require('../controllers/loginController');
const getPadronInfo = require('../controllers/getPadronInfoController');
const { googleLoginOrRegister } = require('../controllers/googleAuthController');

// Importa controladores de 2FA
const { verificarCodigo2FA } = require('../controllers/verify2FA.controller');
const { reenviarCodigo2FA } = require('../controllers/resend2FA.controller');

// Crea una instancia del router de Express
const router = express.Router();

// Registro de usuario
router.post('/register', upload.single('profileImage'), register);

// Login (ahora incluye 2FA)
router.post('/login', login);

// Verificación del código 2FA
router.post('/verificar-2fa', verificarCodigo2FA);

// Reenvío de código 2FA
router.post('/reenviar-2fa', reenviarCodigo2FA);

// Consulta al padrón
router.get('/padron/:cedula', getPadronInfo);

// Login/Registro con Google
router.post('/google', googleLoginOrRegister);

// Exporta las rutas
module.exports = router;