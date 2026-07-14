let himnoPasajesActuales = [];
let indiceHimnoPasaje = 0;

// Versiones
async function cargarVersionesHimnario() {
  try {
    const versiones = await fetch("/api/himnario/list").then((r) => r.json());
    const sel = document.getElementById("him-ver");
    sel.innerHTML = '<option value="">-- Seleccionar Versión --</option>';

    versiones.forEach(
      (v) =>
        (sel.innerHTML += `<option value="${v}">${v.replace(".xml", "")}</option>`),
    );
  } catch (e) {
    console.log("Error cargando versiones de himnario: ", e);
  }
}

// Lista de himnos -> preSelectedHimno: número del himno a preseleccionar (al cargar un preset).
async function cambiarVersionHimnario(preSelectedHimno = null) {
  const version = document.getElementById("him-ver").value;
  const selHimno = document.getElementById("him-num");
  const input = document.getElementById("him-num");

  datalist.innerHTML = "";
  input.value = "";

  if (!version) return;

  try {
    const lista = await fetch(`/api/himanrio/${version}/metadata`).then((r) =>
      r.json(),
    );
    lista.forEach(
      (h) =>
        (selHimno.innerHTML += `<option value="${h.numero}">${h.numero} - ${h.titulo}</option>`),
    );
    if (preSelectedHimno) {
      selHimno.value = preSelectedHimno;
      await cargarPasajesHimno();
    }
  } catch (e) {
    console.error("Error cargando himnos:", e);
  }
}

// Cargar pasajes -> El servidor devuelve un array de bloques ya procesados.
async function cargarPasajesHimno(params) {
  const version = document.getElementById("him-ver").value;
  const texto = document.getElementById("him-num").value;

  const numero = texto.split(" - ")[0]?.trim();

  if (!version || !numero) return;

  try {
    himnoPasajesActuales = await fetch(`/api/himnario/${numero}`).then((r) =>
      r.json(),
    );

    indiceHimnoPasaje = 0;

    await actualizarHumanrioEnPantalla();
  } catch (e) {
    console.error("Error cargando pasajes del himno:", e);
  }
}
