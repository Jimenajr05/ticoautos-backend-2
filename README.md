# TicoAutos Backend

Backend del software **TicoAutos** es una plataforma para la publicación y gestión de vehículos en venta donde los usuarios pueden registrarse, publicar vehículos y comunicarse con otros usuarios mediante preguntas y respuestas.

Este backend está desarrollado con **Node.js, Express y MongoDB**, e implementa autenticación mediante **JWT** y subida de imágenes con **Multer**.

---

## Tecnologías utilizadas

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT (Json Web Token)
* Multer
* CORS
* Dotenv

## Dependencias instaladas

Durante el desarrollo del backend se instalaron las siguientes dependencias:

* `express`
* `mongoose`
* `dotenv`
* `jsonwebtoken`
* `cors`
* `multer`

---

## Estructura del proyecto

```
ticoautos-backend
│
├── src
│   ├── config
│   │   └── db.js
│   │
│   ├── controllers
│   │   ├── loginController.js
│   │   ├── registerController.js
│   │   ├── question.controller.js
│   │   └── vehicle.controller.js
│   │
│   ├── middlewares
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   │
│   ├── models
│   │   ├── user.js
│   │   ├── vehicle.model.js
│   │   ├── question.model.js
│   │   └── answer.model.js
│   │
│   ├── routes
│   │   ├── authRoutes.js
│   │   ├── vehicle.routes.js
│   │   └── question.routes.js
│   │
│   └── app.js
│
├── uploads
│   ├── users
│   └── vehicles
│
├── .env
├── server.js
├── package.json
└── README.md
```

---

## Instalación

1. Clonar el repositorio
```bash
git clone https://github.com/Jimenajr05/ticoautos-backend.git
```

2. Entrar a la carpeta del proyecto
```bash
cd ticoautos-backend
```

3. Instalar dependencias
```bash
npm install
```

4. Crear archivo `.env`
```env
PORT=3000
DATABASE_URL=mongodb+srv://usuario:password@cluster.mongodb.net/ticoautos_bd?retryWrites=true&w=majority
JWT_SECRET=ticoautos-secret-key
JWT_EXPIRES_IN=1h
FRONTEND_URL=http://localhost:5173
```

5. Ejecutar el servidor
```bash
npm start
```

---

## Autenticación

El sistema utiliza **JWT (JSON Web Token)** para autenticar usuarios.
Para acceder a rutas protegidas se debe enviar el token en el header:
```http
Authorization: Bearer TOKEN
```

### Rutas de Autenticación

* **POST** `/api/auth/register`: Permite registrar un nuevos usuarios
* **POST** `/api/auth/login`: Permite iniciar sesión y obtener un token JWT.

---

## Vehículos

* **GET** `/api/vehicles`: Obtiene vehículos con filtros (brand, model, minYear, maxYear, minPrice, maxPrice, status, page, limit).
* **GET** `/api/vehicles/:id`: Devuelve la información completa de un vehículo.
* **POST** `/api/vehicles`: Crea un vehículo (requiere autenticación y permite hasta 5 imágenes).
* **PUT** `/api/vehicles/:id`: Actualiza un vehículo (solo propietario).
* **DELETE** `/api/vehicles/:id`: Elimina un vehículo (solo propietario).
* **PATCH** `/api/vehicles/:id/sold`: Cambia el estado del vehículo a "sold".
* **GET** `/api/vehicles/my-vehicles`: Lista vehículos publicados por el usuario autenticado.
* **GET** `/api/vehicles/:id/share`: Genera enlace para compartir.

---

## Sistema de preguntas

El sistema permite a los usuarios hacer preguntas sobre vehículos publicados. Un usuario **no puede preguntarse a sí mismo**.

* **POST** `/api/questions`: Crea una pregunta.
* **GET** `/api/questions/my-questions`: Obtiene preguntas hechas por el usuario.
* **GET** `/api/questions/my-vehicle-questions`: Preguntas de otros en mis vehículos.
* **GET** `/api/questions/vehicle/:vehicleId`: Preguntas de un vehículo específico.
* **PUT** `/api/questions/:id/answer`: Responder a una pregunta (solo propietario).
* **DELETE** `/api/questions/conversation/:vehicleId/:askedById`: Eliminar conversación (propietario o cliente).

---

## Manejo de imágenes

Las imágenes se almacenan en `uploads/users` y `uploads/vehicles`.
El middleware **Multer** permite subir imágenes JPG, PNG y WEBP con un tamaño máximo de **5MB**.

---

## Autoras
- María Paz Ugalde Araya
- María Jimena Jara Rojas

# TicoAuto

![Logo TicoAuto](./images/logo.png)