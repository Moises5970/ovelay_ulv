// Estado -> capas[id] = { plantilla, update }
const capas = {};

// Room ID -> Se lee del parámetro ?room en la URL de OBS/ViMix.
const params = new URLSearchParams(window.location.search);
const roomId = params.get("room") || "default";

// Indicardor de conexion -> Muestra un badge visible en OBS cuando el socket está caído.
const connEl = document.getElementById("conn-status");

function setConexion(estado) {
  /*
    "connected"    → ocultar el indicador (todo bien)
    "disconnected" → rojo: "SIN CONEXIÓN"
    "reconnecting" → naranja: "RECONECTANDO..."
  */

  connEl.className = "";
  if (estado === "connected") {
    connEl.classList.remove("visible");
    return;
  }
  connEl.classList.add("visible", estado);

  connEl.textContent =
    estado === "reconnecting" ? "⟳ RECONECTANDO..." : "✕ SIN CONEXIÓN";
}

// Conexion -> io() se conecta automáticamente al servidor que sirve este archivo.
const socket = io();

socket.on("connect", () => {
  setConexion("connected");

  socket.emit("unirse:room", roomId);
});

socket.on("disconnect", () => setConexion("disconnected"));

socket.on("reconnecting", () => setConexion("reconnecting"));

/* Recibir actualizaciones -> Cada vez que el admin emite "overlay:actualizar" en el mismo room,
   este evento se dispara con el config completo.*/
socket.on("overlay:actualizar", (config) => {
  sincronizar(config);
});

// Motor de capas -> Recibe el config completo y sincroniza el DOM con él.
function sincronizar(config) {
  const idsConfig = Object.keys(config);

  // 1.- Eliminar capas que ya no estan en el config
  document.querySelectorAll(".layer").forEach((iframe) => {
    const id = iframe.dataset.id;
    if (!idsConfig.includes(id)) {
      iframe.classList.remove("visible");
      setTimeout(() => {
        iframe.remove();
        delete capas[id];
      }, 550);
    }
  });

  // 2.- Crear o actualizar capas
  for (const id of idsConfig) {
    const info = config[id];
    if (!info?.plantilla) continue;

    const estado = capas[id];
    const iframe = document.getElementById(`capa-${id}`);

    // A: si es la misma capa, solo cmabiar datos
    if (estado && estado.plantilla === info.plantilla && iframe) {
      if (estado.update !== info.update) {
        estado.update = info.update;
        try {
          iframe.contentWindow?.recibirDatos?.(info.datos ?? {});
        } catch {}
      }
      continue;
    }

    // B: nueva capa o cmabio de plantilla
    capas[id] = { plantilla: info.plantilla, update: info.update };

    if (iframe) {
      iframe.classList.remove("visible");
      setTimeout(() => iframe.remove(), 550);
    }

    const el = document.createElement("iframe");

    el.id = `capa-${id}`;

    el.className = "layer";

    el.dataset.id = id;

    el.src = `/templates/${id}/${info.plantilla}/index.html`;

    el.onload = () => {
      /*
        300ms de espera tras el onload: el iframe terminó de cargar el HTML
        pero la plantilla puede estar ejecutando su propio JS de inicialización.
        El delay da tiempo para que recibirDatos() esté disponible.
      */
      setTimeout(() => {
        try {
          el.contentWindow?.recibirDatos?.(info.datos ?? {});
        } catch {}
        el.classList.add("visible"); // fade-in
      }, 300);
    };

    document.getElementById("capas").appendChild(el);
  }
}
