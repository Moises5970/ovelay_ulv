const CAPAS_VALIDAS = ["versiculos", "lower_thirds", "himnarios", "creditos"];

const roomSlug = new URLSearchParams(location.search).get("room") || "default";
const socket = io("http://localhost:4000");

//rastrea que plantilla tiene  cargada cada capa, para no recargar el iframe
// si el operador solo cambia el texto, no la plantilla
const plantillaCurrentLayer = {};

// conectarse a la room
socket.on("connect", () => {
  console.log("[motor] conectado, uniendose a room: ", roomSlug);
  socket.emit("unirse:room", roomSlug);
});

// actualizacion de capas
socket.on("overlay:actualizar", (config) => {
  updateLayer(config);
});

// apagar capas
socket.on("overlay:apagar", ({ layer }) => {
  oofLayer(layer);
});

/**
 * Actualiza una capa específica con su categoría, plantilla y datos.
 *
 * @param {Object} param0 - Objeto de configuración para la actualización.
 * @param {string} param0.capa - La capa específica.
 * @param {string} param0.categoria - Tipo de categoría.
 * @param {string} param0.platilla - Plantilla a utilizar.
 * @param {Object} param0.datos - Datos para actualizar la capa.
 * @returns {void} No retorna ningún valor, solo realiza validaciones y acciones.
 */
function updateLayer({ layer, categoria, platilla, data }) {
  if (!CAPAS_VALIDAS.includes(layer)) {
    console.error("[motor] capa desconocida", layer);
    return;
  }

  const iframe = document.getElementById(`capa-${layer}`);
  const rutPlantilla = `../../templates/${categoria}/${platilla}/index.html`;

  if (plantillaCurrentLayer[layer] !== rutPlantilla) {
    plantillaCurrentLayer[layer] = rutPlantilla;
    iframe.src = rutPlantilla;
    iframe.onload = () => sendData(iframe, data, layer);
  } else {
    sendData(iframe, data, layer);
  }
}

function oofLayer(layer) {
  const iframe = document.getElementById(`capa-${layer}`);
  sendData(iframe, {}, layer);
}

function sendData(iframe, data, layer) {
  try {
    iframe.contentWindow?.receiveData?.(data);
  } catch (e) {
    console.error("[motor] recibir datos fallo en capa: ", layer, e.message);
  }
}
