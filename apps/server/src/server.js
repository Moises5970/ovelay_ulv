import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/mongo.js";
import authRoutes from "./routes/auth.routes.js";
import roomsRoutes from './routes/rooms.routes.js'
import { errorHandler } from "./middleware/errorHandler.js";
import { authenticate, authorize } from "./middleware/auth.js";

// Usamos las variable de entorno
dotenv.config();

const app = express();
app.use(express.json());

// ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// rutas
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomsRoutes);

app.get("/api/me", authenticate, (req, res) => {
  res.json({ ok: true, usuario: req.usuario });
});

/*app.get("/api/admin", authenticate, authorize("admin"), (req, res) => {
  res.json({ ok: true, mensaje: "Bienvenido, admin" });
});*/

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`[server] corriendo en puerto ${PORT}`));
});
