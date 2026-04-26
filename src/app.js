// Importa express para crear la aplicación del servidor
const express = require('express');

// Importa cors para permitir peticiones desde otros dominios (frontend)
const cors = require('cors');

// Importa path para manejar rutas de archivos
const path = require('path');

// Importa las rutas de autenticación
const authRoutes = require('./routes/authRoutes');

// Importa las rutas de vehículos
const vehicleRoutes = require('./routes/vehicle.routes');

// Importa las rutas de preguntas
const questionRoutes = require('./routes/question.routes');

// Importa Apollo Server y gql para GraphQL
const { ApolloServer, gql } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const jwt = require('jsonwebtoken');
const Vehicle = require('./models/vehicle.model'); // Asegúrate de importar tu modelo de vehículo

// Crea la aplicación de Express
const app = express();

// Habilita CORS para permitir comunicación con el frontend
app.use(cors());

// Permite recibir datos en formato JSON en las peticiones
app.use(express.json());

// Permite acceder públicamente a la carpeta uploads (imágenes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Define las rutas para vehículos
app.use('/api/vehicles', vehicleRoutes);

// Define las rutas para autenticación
app.use('/api/auth', authRoutes);

// Define las rutas para preguntas
app.use('/api/questions', questionRoutes);

// Define el esquema GraphQL
const typeDefs = gql`
  type Query {
    getVehicle(id: ID!): Vehicle
    getAllVehicles: [Vehicle]
  }

  type Vehicle {
    id: ID!
    marca: String
    modelo: String
    precio: Float
    estado: String
    condicion: String
    color: String
    transmision: String
  }
`;

// Resolvers para las consultas GraphQL
const resolvers = {
  Query: {
    getVehicle: async (_, { id }) => {
      return await Vehicle.findById(id);  // Obtén un vehículo por ID desde la base de datos
    },
    getAllVehicles: async () => {
      return await Vehicle.find();  // Obtén todos los vehículos desde la base de datos
    },
  },
};

// Middleware para autenticar el token JWT
const authenticate = (req) => {
  const token = req.headers.authorization || '';
  try {
    return jwt.verify(token, process.env.JWT_SECRET);  // Verifica el token JWT
  } catch (err) {
    throw new Error('Unauthorized');
  }
};

// Configura Apollo Server para GraphQL
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const user = authenticate(req);  // Autenticación del usuario con el token
    return { user };
  },
});

// Inicia el servidor Apollo
server.start().then(() => {
  // Conecta Apollo Server con Express en la ruta /graphql
  app.use('/graphql', expressMiddleware(server));

  // Inicia el servidor de Express
  app.listen(5000, () => {
    console.log('Servidor Express corriendo en http://localhost:5000');
    console.log('Servidor GraphQL corriendo en http://localhost:5000/graphql');
  });
});

// Exporta la aplicación para usarla en server.js
module.exports = app;