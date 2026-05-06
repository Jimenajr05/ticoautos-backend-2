const express = require('express');
const upload = require('../middlewares/uploadMiddleware');

const register = require('../controllers/registerController');
const login = require('../controllers/loginController');
const getPadronInfo = require('../controllers/getPadronInfoController');
const { googleLoginOrRegister } = require('../controllers/googleAuthController');
const { verificarCodigo2FA } = require('../controllers/verify2FA.controller');
const { reenviarCodigo2FA } = require('../controllers/resend2FA.controller');
const verifyEmail = require('../controllers/verifyEmailController');

const router = express.Router();

router.post('/register', upload.single('profileImage'), register);
router.post('/login', login);
router.post('/verificar-2fa', verificarCodigo2FA);
router.post('/reenviar-2fa', reenviarCodigo2FA);
router.get('/padron/:cedula', getPadronInfo);
router.post('/google', googleLoginOrRegister);
router.get('/verificar-correo', verifyEmail);

module.exports = router;