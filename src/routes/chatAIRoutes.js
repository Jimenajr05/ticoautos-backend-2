const express = require("express");
const { validarMensajeChat } = require("../controllers/chatAIController");

const router = express.Router();

router.post("/validar-mensaje", validarMensajeChat);

module.exports = router;


