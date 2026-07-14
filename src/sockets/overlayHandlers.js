import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export default function registrarOverlaySockets(io) {
    io.on("connection", (socket) => {
        console.log("Cliente conectado:", socket.id);

        // 1. Unirse a un room
        socket.on("unirse:room", (roomId) => {
            socket.join(roomId);
            console.log(`${socket.id} se unió al room: ${roomId}`);
        });

        // 2. Admin manda actualización → guardar + reenviar al room
        socket.on("overlay:actualizar", (payload) => {
            const { roomId, config } = payload;

            // Guardar en disco como respaldo
            // __dirname = src/sockets/ → ../../data/ = data/ en la raíz
            const configPath = path.join(__dirname, "../../data/config.json");
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

            // Reenviar SOLO al room correspondiente
            io.to(roomId).emit("overlay:actualizar", config);
        });

        // 3. Limpieza al desconectar
        socket.on("disconnect", () => {
            console.log("Cliente desconectado:", socket.id);
        });
    });
}