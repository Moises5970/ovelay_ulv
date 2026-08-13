export function registerOverlayHandlers(io, socket) {
  // El cliente pide unirse a una room especifico
  socket.on("unirse:room", (roomSlug) => {
    // inscribe a este socket específico en el "room" interno de Socket.io con ese nombre.
    socket.join(roomSlug);
    // un cliente se unio a eta room
    console.log(`[socket] ${socket.id} se unio al room: ${roomSlug}`);
  });

  // El operador manda un cambio de overlay; solo el room correcto lo recibe
  socket.on(
    "overlay:actualizar",
    ({ roomSlug, layer, categoria, plantilla, data }) => {
      // manda el evento solo a los sockets unidos a ese room, no a todos los conectados al servidor.
      io.to(roomSlug).emit("overlay:actualizar", {
        layer,
        categoria,
        plantilla,
        data,
      });
      console.log(`[socket] overlay actualizado en room: ${roomSlug}`);
    },
  );

  // El operador apaga la capa
  socket.on("overlay:apagar", ({ roomSlug, layer }) => {
    io.to(roomSlug).emit("overlay:apagar", { layer });
  });
}
