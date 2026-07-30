/**
 * server.js - Punto de entrada del servidor.
 * Esta archivo hace:
 * 1.- Carga la variables de entorno.
 * 2.- Conecta a la base de datos.
 * 3.- Arranca el servidor HTTP.
 * 
 * Toda la lógica (rutas, sockets, middleware) se importa
  desde sus propios archivos.
 */

import 'dotenv/config';           // carga .env antes que todo
import express from 'express';
import {createServer} from 'node:http';
import { Server } from 'socket.io';
import { connectDB } from './config/mongodb.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js'

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' }});
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        db: 'connect',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use(errorHandler)

/**
 * Primero arranca la base de datos
 * Despues arranca el servidor HTTP
 */
async function start() {
    try {
        await connectDB();
        server.listen(PORT, () => {
            console.log(`🚀 Server active on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor o conectar la BD:', error);
        process.exit(1);
    }
}

// lanzar
start();