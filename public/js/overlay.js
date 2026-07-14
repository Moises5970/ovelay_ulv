/*
  overlay.js — Control del overlay en vivo
  ==========================================
  Todo lo que tiene que ver con mandar contenido a la pantalla.
  Es el puente entre el formulario del admin y Socket.io.

  Funciones:
    - lanzarLive()        → lee el formulario y manda al overlay
    - enviarAConfig()     → empaqueta y emite via socket
    - apagarCapa()        → elimina la capa activa del overlay
    - actualizarVersiculoEnPantalla()
    - navegarVersiculo()
    - actualizarHimnarioEnPantalla()
    - navegarHimnario()

  Dependencias (deben cargarse antes):
    socket.client.js → socket, roomId, estadoLocal
    ui.js            → toast, badge
    bible.js         → versiculosActuales, indiceVersiculo
    himnario.js      → himnoPasajesActuales, indiceHimnoPasaje
*/

/* ── LANZAR A PANTALLA ──
   Función principal del admin. Lee el formulario según la categoría activa,
   construye el objeto de datos, y llama a enviarAConfig().

   El flujo varía según la categoría:
   · versiculos  → fetch a la API de Biblia, maneja rangos (1-5) o único (3)
   · himnarios   → fetch a la API de himnario, navega entre estrofas
   · creditos    → lee las filas dinámicas del formulario
   · lower_thirds y otros → lee los campos v1, v2, v3, v4 */
async function lanzarLive() {
  const cat = catActual;
  let datos = {}, label = "";

  if (cat === "versiculos") {
    const ver = document.getElementById("bib-ver").value;
    const lib = document.getElementById("bib-lib").value;
    const cap = document.getElementById("bib-cap").value;
    const ran = document.getElementById("bib-range").value.trim();
    if (!ver || !lib || !cap)
      return toast("Selecciona versión, libro y capítulo.", "err");

    const lista = await fetch(`/api/bible/${ver}/${lib}/${cap}`)
      .then(r => r.json()).catch(() => []);

    if (ran.includes("-")) {
      /* Rango: carga todos los versículos del rango en memoria
         y navega con los botones Anterior/Siguiente */
      const [ini, fin] = ran.split("-").map(Number);
      versiculosActuales = lista.filter(
        v => Number(v.numero) >= ini && Number(v.numero) <= fin
      );
      indiceVersiculo = 0;
      if (!versiculosActuales.length)
        return toast("Sin versículos en ese rango.", "err");
      await actualizarVersiculoEnPantalla();
      return;
    } else {
      const vU = lista.find(v => v.numero === ran);
      datos = { v1: vU ? `${vU.numero}. ${vU.texto}` : "", v2: `${lib} ${cap}` };
      label = `${lib} ${cap}:${ran}`;
    }

  } else if (cat === "himnarios") {
    const ver = document.getElementById("him-ver").value;
    const num = document.getElementById("him-num").value;
    if (!ver || !num) return toast("Selecciona versión e himno.", "err");

    himnoPasajesActuales = await fetch(`/api/himnario/${ver}/${num}`)
      .then(r => r.json()).catch(() => []);
    indiceHimnoPasaje = 0;
    if (!himnoPasajesActuales.length)
      return toast("El himno no tiene estrofas.", "err");
    await actualizarHimnarioEnPantalla();
    return;

  } else if (cat === "creditos") {
    const filas = document.querySelectorAll("#area-list .area-row");
    datos = {
      lista: Array.from(filas).map(d => ({
        area: d.querySelector(".in-a").value,
        nombres: d.querySelector(".in-n").value
          .split(",").map(n => n.trim()).filter(Boolean)
      }))
    };
    label = "Créditos";

  } else {
    datos = {
      v1: document.getElementById("v1")?.value?.trim() || "",
      v2: document.getElementById("v2")?.value?.trim() || "",
      v3: document.getElementById("v3")?.value?.trim() || "",
      v4: document.getElementById("v4")?.value?.trim() || "",
    };
    label = datos.v1 || cat;
  }

  enviarAConfig(cat, datos);
  badge(label);
  toast(`🚀 EN PANTALLA: ${label}`, "ok");
}

/* ── ENVIAR AL OVERLAY VÍA SOCKET ──
   Este es el único punto donde el admin habla con el overlay.
   No hay fetch, no hay HTTP — solo un evento de socket.

   estadoLocal[cat] = ... actualiza la categoría en el estado en memoria.
   Las demás categorías activas se mantienen intactas.
   socket.emit() manda el estado completo al servidor, que lo reenvía al room. */
function enviarAConfig(cat, datos) {
  estadoLocal[cat] = {
    plantilla: document.getElementById("pla").value,
    datos,
    update: Date.now(),
  };
  socket.emit("overlay:actualizar", { roomId, config: estadoLocal });
}

/* ── APAGAR CAPA ──
   Elimina la categoría activa del estado y avisa al overlay.
   index.html detectará que esa categoría desapareció del config
   y ejecutará el fade-out del iframe correspondiente. */
function apagarCapa() {
  delete estadoLocal[catActual];
  socket.emit("overlay:actualizar", { roomId, config: estadoLocal });
  badge(null);
  document.querySelectorAll(".preset-card").forEach(c => c.classList.remove("active"));
  toast(`⏹ Capa "${catActual.toUpperCase()}" removida`, "inf");
}

/* ── NAVEGACIÓN VERSÍCULOS ── */
async function actualizarVersiculoEnPantalla() {
  const v   = versiculosActuales[indiceVersiculo];
  const lib = document.getElementById("bib-lib").value;
  const cap = document.getElementById("bib-cap").value;
  enviarAConfig("versiculos", { v1: `${v.numero}. ${v.texto}`, v2: `${lib} ${cap}` });
  badge(`${lib} ${cap}:${v.numero}`);
  toast(`📖 Lanzado: ${lib} ${cap}:${v.numero}`, "ok");
}

function navegarVersiculo(dir) {
  if (!versiculosActuales.length) return toast("Primero lanza un rango.", "inf");
  const n = indiceVersiculo + dir;
  if (n < 0 || n >= versiculosActuales.length) return;
  indiceVersiculo = n;
  actualizarVersiculoEnPantalla();
}

/* ── NAVEGACIÓN HIMNARIO ── */
async function actualizarHimnarioEnPantalla() {
  if (!himnoPasajesActuales?.length) return;
  const p = himnoPasajesActuales[indiceHimnoPasaje];
  enviarAConfig("himnarios", { v1: p.v1, v2: p.v2, tipo: p.tipo });
  badge(p.identificador);
  toast(`🎵 ${p.identificador.replace("Himno ", "")}`, "ok");
}

function navegarHimnario(dir) {
  if (!himnoPasajesActuales?.length) return toast("Primero selecciona un himno.", "inf");
  const n = indiceHimnoPasaje + dir;
  if (n < 0 || n >= himnoPasajesActuales.length) return;
  indiceHimnoPasaje = n;
  actualizarHimnarioEnPantalla();
}