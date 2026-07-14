// Conexion
const socket = io();

// Room ID
const roomId = "default";

// Estado local del overlay
let estadoLocal = {}

// Unirse al room al conectar
socket.on("connect", () => {
    socket.emit("unirse:room", roomId)
})