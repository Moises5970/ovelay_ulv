import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { connectDB } from "./config/mongo.js";
import { configureSocket } from "./config/socket.js";
import authRoutes from "./routes/auth.routes.js";
import roomsRoutes from "./routes/rooms.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authenticate, authorize } from "./middleware/auth.js";

// Usamos las variable de entorno
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raizMonorepo = path.resolve(__dirname, "../../..");

const app = express();
app.use(express.json());

// ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// rutas

// Sirve output/ y templates/ como archivos estáticos, con el mismo origen
app.use("/output", express.static(path.join(raizMonorepo, "output")));
app.use("/templates", express.static(path.join(raizMonorepo, "templates")));

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomsRoutes);

app.get("/api/me", authenticate, (req, res) => {
  res.json({ ok: true, usuario: req.usuario });
});

/*app.get("/api/admin", authenticate, authorize("admin"), (req, res) => {
  res.json({ ok: true, mensaje: "Bienvenido, admin" });
});*/

// envuelve Express en un servidor HTTP nativo de Node
const httpServer = createServer(app);
// inyecta Socket.io a ese mismo servidor
configureSocket(httpServer);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  httpServer.listen(PORT, () =>
    console.log(`[server] corriendo en puerto ${PORT}`),
  );
});
