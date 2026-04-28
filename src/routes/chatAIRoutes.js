import express from "express";
import { validarMensajeChat } from "../controllers/chatAIController.js";

const router = express.Router();

router.post("/validar-mensaje", validarMensajeChat);

export default router;
