/*
  admin.js — Punto de entrada e inicialización
  ==============================================
  Este es el último archivo en cargarse. Cuando llega aquí, todos los
  demás módulos ya están listos (socket, ui, overlay, presets, bible, himnario).

  Responsabilidades:
    - init()             → arranca el admin al cargar la página
    - seleccionarCat()   → cambia la categoría activa (chips del sidebar)
    - cambiarCategoria() → adapta el formulario principal según la categoría
    - seleccionarPla()   → cambia la plantilla activa
    - addArea()          → agrega una fila al formulario de créditos

  Variable global:
    - catActual → categoría seleccionada actualmente
    - estructura → { categoria: [plantillas] } leído del servidor al arrancar
*/

let catActual = "";
let estructura = {};

/* ── INIT ──
   GET /api/init devuelve la estructura de carpetas del servidor:
   { versiculos: ["elegante", "minimalista"], lower_thirds: ["official", ...], ... }
   Con eso construimos los chips de categoría dinámicamente. */
async function init() {
  const res = await fetch("/api/init");
  estructura = await res.json();

  const cont = document.getElementById("cat-chips");
  Object.keys(estructura).forEach((c, i) => {
    const btn = document.createElement("button");
    btn.className   = "chip" + (i === 0 ? " active" : "");
    btn.textContent = c.charAt(0).toUpperCase() + c.slice(1);
    btn.dataset.cat = c;
    btn.onclick     = () => seleccionarCat(c, btn);
    cont.appendChild(btn);
  });

  catActual = Object.keys(estructura)[0] || "";
  if (catActual) cambiarCategoria(catActual);

  /* Cargar datos de Biblia e Himnario en paralelo — más rápido que secuencial */
  await Promise.all([cargarVersionesReales(), cargarVersionesHimnario()]);

  badge(null);
}

/* ── SELECCIÓN DE CATEGORÍA ──
   Actualiza el chip activo y llama a cambiarCategoria(). */
function seleccionarCat(cat, btn) {
  document.querySelectorAll("#cat-chips .chip").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");
  catActual = cat;
  cambiarCategoria(cat);
}

/* ── CAMBIAR CATEGORÍA ──
   Muestra/oculta los bloques del formulario según la categoría.
   Construye los chips de plantilla disponibles.
   Regenera los campos dinámicos (v1-v4, créditos, etc.).

   ¿Por qué campos dinámicos en lugar de tenerlos todos y ocultarlos?
   Porque las categorías pueden tener campos muy distintos en el futuro,
   y tenerlos todos en el HTML haría el código difícil de extender. */
function cambiarCategoria(cat) {
  document.getElementById("box-bible").style.display =
    cat === "versiculos" ? "block" : "none";
  document.getElementById("box-himnario").style.display =
    cat === "himnarios" ? "block" : "none";
  document.getElementById("box-datos").style.display =
    (cat === "versiculos" || cat === "himnarios") ? "none" : "block";

  /* Chips de plantilla */
  const plantillas = estructura[cat] || [];
  const cont = document.getElementById("pla-chips");
  cont.innerHTML = "";
  plantillas.forEach((p, i) => {
    const btn = document.createElement("button");
    btn.className   = "chip" + (i === 0 ? " active" : "");
    btn.textContent = p;
    btn.dataset.pla = p;
    btn.onclick     = () => seleccionarPla(p, btn);
    cont.appendChild(btn);
  });
  document.getElementById("pla").value = plantillas[0] || "";

  /* Campos dinámicos */
  const dyn = document.getElementById("campos-dinamicos");
  if (cat === "creditos") {
    dyn.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <label style="margin:0;">Bloques</label>
        <button class="btn btn-secondary" onclick="addArea()" style="width:auto;padding:5px 11px;font-size:11px;">+ Añadir</button>
      </div>
      <div id="area-list"></div>`;
    addArea();
  } else if (cat === "versiculos" || cat === "himnarios") {
    dyn.innerHTML = "";
  } else {
    dyn.innerHTML = `
      <label>Línea principal (v1)</label>
      <input type="text" id="v1" placeholder="Nombre" />
      <label>Línea secundaria (v2)</label>
      <input type="text" id="v2" placeholder="Cargo" />
      <label>Línea adicional (v3)</label>
      <input type="text" id="v3" placeholder="Participación" />
      <label>Línea adicional (v4)</label>
      <input type="text" id="v4" placeholder="Ej: Universidad Linda Vista" />`;
  }

  cargarPresetsLateral(cat);
}

/* ── SELECCIÓN DE PLANTILLA ── */
function seleccionarPla(p, btn) {
  document.querySelectorAll("#pla-chips .chip").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("pla").value = p;
}

/* ── CRÉDITOS: AGREGAR FILA ── */
function addArea(a = "", n = "") {
  const div = document.createElement("div");
  div.className = "area-row";
  div.innerHTML = `
    <input type="text" class="in-a" placeholder="Área" value="${a}" />
    <input type="text" class="in-n" placeholder="Nombres, separados por coma" value="${n}" />
    <button class="btn-icon" onclick="this.parentElement.remove()">✕</button>`;
  document.getElementById("area-list").appendChild(div);
}

/* ── ARRANCAR ── */
init();