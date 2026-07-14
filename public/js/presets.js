let presetsMemoria = [];
let presetActivo = null;
let modoEdicion = false;

// cargarPresetsLateral(cat) → Fetch al servidor, luego construye el HTML de las cards dinámicamente.
async function cargarPresetsLateral(cat) {
  presetsMemoria = await fetch(`/api/presets/${cat}`).then((r) => r.json());
  const lista = document.getElementById("lista-presets");
  lista.innerHTML = "";

  if (!presetsMemoria.length) {
    lista.innerHTML = `<p class="preset-empty">Sin presets guardados</p>`;
    return;
  }

  presetsMemoria.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "preset-card";
    div.innerHTML = `
      <div class="preset-info">
        <div class="preset-label">${p.label}</div>
        <div class="preset-sub">${p.plantilla}</div>
      </div>
      <div style="display:flex;gap:4px;">
        <button class="btn-icon" title="Editar"   onclick="editarPreset(${i}, event)">✎</button>
        <button class="btn-icon" title="Eliminar" onclick="borrarPreset(${i}, event)">✕</button>
      </div>`;
    div.addEventListener("click", () => cargarPreset(p, div));
    lista.appendChild(div);
  });
}

// cargarPreset(p, div) → Rellena todos los campos del formulario con los datos del preset.
async function cargarPreset(p, div) {
  document
    .querySelectorAll(".preset-card")
    .forEach((c) => c.classList.remove("active"));
  div.classList.add("active");
  document
    .querySelectorAll("#pla-chips .chip")
    .forEach((c) =>
      c.classList.toggle("active", c.dataset.pla === p.plantilla),
    );
  document.getElementById("pla").value = p.plantilla;

  if (p.datos.isBible) {
    document.getElementById("bib-ver").value = p.datos.params.ver;
    await cargarLibros(p.datos.params.lib);
    document.getElementById("bib-cap").value = p.datos.params.cap;
    document.getElementById("bib-range").value = p.datos.params.ran;
  } else if (p.datos.isHimno) {
    document.getElementById("him-ver").value = p.datos.params.ver;
    await cambiarVersionHimnario(p.datos.params.num);
  } else if (p.datos.lista) {
    document.getElementById("area-list").innerHTML = "";
    p.datos.lista.forEach((item) =>
      addArea(item.area, item.nombres.join(", ")),
    );
  } else {
    if (document.getElementById("v1"))
      document.getElementById("v1").value = p.datos.v1 || "";
    if (document.getElementById("v2"))
      document.getElementById("v2").value = p.datos.v2 || "";
    if (document.getElementById("v3"))
      document.getElementById("v3").value = p.datos.v3 || "";
    if (document.getElementById("v4"))
      document.getElementById("v4").value = p.datos.v4 || "";
  }
}

// guardarPreset() → Construye el objeto preset según la categoría activa.
async function guardarPreset() {
  let datos = {},
    label = "";
  const cat = catActual;

  if (cat === "versiculos") {
    const lib = document.getElementById("bib-lib").value;
    const cap = document.getElementById("bib-cap").value;
    const ran = document.getElementById("bib-range").value;
    label = `${lib} ${cap}:${ran}`;
    datos = {
      isBible: true,
      params: { ver: document.getElementById("bib-ver").value, lib, cap, ran },
    };
  } else if (cat === "himnarios") {
    const ver = document.getElementById("him-ver").value;
    const num = document.getElementById("him-num").value;
    const sel = document.getElementById("him-num");
    label = sel.options[sel.selectedIndex]?.text || "Himno";
    datos = { isHimno: true, params: { ver, num } };
  } else if (cat === "creditos") {
    const filas = document.querySelectorAll("#area-list .area-row");
    datos = {
      lista: Array.from(filas).map((f) => ({
        area: f.querySelector(".in-a").value,
        nombres: f
          .querySelector(".in-n")
          .value.split(",")
          .map((n) => n.trim())
          .filter(Boolean),
      })),
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

  const preset = {
    label,
    plantilla: document.getElementById("pla").value,
    datos,
  };

  if (modoEdicion && presetActivo !== null)
    presetsMemoria[presetActivo] = preset;
  else presetsMemoria.push(preset);

  await fetch(`/api/presets/${cat}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(presetsMemoria),
  });

  modoEdicion = false;
  presetActivo = null;
  cargarPresetsLateral(cat);
  toast("Preset guardado.");
}

// editarPreset(i, e) →
function editarPreset(i, e) {
  e.stopPropagation();
  presetActivo = i;
  modoEdicion = true;
  const cards = document.querySelectorAll(".preset-card");
  cards.forEach((c) => c.classList.remove("active"));
  if (cards[i]) cards[i].classList.add("active");
  cargarPreset(presetsMemoria[i], cards[i]);
  toast("Modo edición activado.", "inf");
}

// borrarPreset(i, e) →
async function borrarPreset(i, e) {
  e.stopPropagation();
  presetsMemoria.splice(i, 1);
  await fetch(`/api/presets/${catActual}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(presetsMemoria),
  });
  cargarPresetsLateral(catActual);
  toast("Preset eliminado.", "inf");
}

// limpiarPresets() →
async function limpiarPresets() {
  await fetch(`/api/presets/${catActual}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([]),
  });
  cargarPresetsLateral(catActual);
  toast("Todos los presets eliminados.", "inf");
}
