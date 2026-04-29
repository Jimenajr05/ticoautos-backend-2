// Importa express para crear la aplicación del servidor
const express = require("express");

// Importa cors para permitir peticiones desde otros dominios
const cors = require("cors");

// Importa path para manejar rutas de archivos
const path = require("path");

// Importa las rutas de autenticación
const authRoutes = require("./routes/authRoutes");

// Importa las rutas de vehículos
const vehicleRoutes = require("./routes/vehicle.routes");

// Importa las rutas de preguntas
const questionRoutes = require("./routes/question.routes");

// Importa las rutas de IA
const chatAIRoutes = require("./routes/chatAIRoutes");

// Crea la aplicación de Express
const app = express();

// Habilita CORS
app.use(cors());

// Permite recibir JSON
app.use(express.json());

// Permite acceder públicamente a la carpeta uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rutas REST
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/chat-ai", chatAIRoutes);

// Exporta la aplicación para usarla en server.js
module.exports = app;