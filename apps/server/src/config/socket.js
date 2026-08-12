import { Server } from "socket.io";
import { registerOverlayHandlers } from "../sockets/overlayHandlers.js";

/**
 * SOCKETS
 * socket.js solo se encarga de la configuración de conexión, y toda la lógica de negocio de overlays vive en overlayHandlers.js
 * Socket.io necesita un servidor HTTP crudo
 * por eso recibe httpServer como parámetro
 */
export function configureSocket(httpServer) {
  // socket
  const io = new Server(httpServer, {
    cors: { origin: "*" }, //
  });

  // cuando se conecta un usuario
  io.on("connection", (socket) => {
    // id del usuario
    console.log("[socket] cliente conectado: ", socket.id);
    registerOverlayHandlers(io, socket);

    // cuando se desconecta
    socket.on("disconnect", () => {
      console.log("[socket] cliente desconectado", socket.id);
    });
  });

  return io;
}
