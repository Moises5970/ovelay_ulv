// Componentes de la interfaz de usuario

// Toast -> notificaciones
function toast(msg, tipo = "ok") {
  const icons = { ok: "✓", err: "✕", inf: "ℹ" };

  const el = document.createElement("div");

  el.className = `toast ${tipo}`;
  el.innerHTML = `<span class="ti">${icons[tipo]}</span><span>${msg}</span>`;

  document.getElementById("toast").appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));

  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 350);
  }, 2800);
}

// Modal -> Conformacion abtes de acciones destructivas
function confirmar(texto, cb) {
  document.getElementById("modal-desc").textContent = texto;
  document.getElementById("modal").classList.add("on");
  document.getElementById("modal-ok").onclick = () => {
    cerrarModal();
    cb();
  };
}

function cerrarModal() {
  document.getElementById("modal").classList.remove("on");
}

document.getElementById("modal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) cerrarModal();
});

// Badge en vivo -> Muestra qué está actualmente en pantalla.
function badge(label) {
  const html = label
    ? `<div class="live-badge"><div class="dot"></div>EN VIVO · ${label}</div>`
    : `<div style="font-size:11px;color:var(--muted)">Sin capa activa</div>`;

  const desktop = document.getElementById("badge-cont");
  const mobile = document.getElementById("badge-cont-mobile");
  if (desktop) desktop.innerHTML = html;
  if (mobile) mobile.innerHTML = html;
}

// Indicador de conexion -> Actualiza el punto de color que muestra el estado del socket.
function setConnSratus(estado) {
  ["conn-dot", "conn-dot-desktop"].forEach((id) => {
    const el = document.getElementById(id);

    if (!el) return;
    el.className = "conn-dot";
    if (estado === "connected") el.classList.add("connected");
    if (estado === "reconnecting") el.classList.add("reconnecting");
  });
}

// Escuchar eventos del socket para actualizar el indicador.
socket.on("connect", () => setConnStatus("connected"));
socket.on("disconnect", () => setConnStatus("disconnected"));
socket.on("reconnecting", () => setConnStatus("reconnecting"));

// Tab movil -> Alterna entre el sidebar (lista de presets) y el main (formulario).
function activarTab(tab) {
  const sidebar = document.getElementById("sidebar");
  const main = document.getElementById("main");
  const tPresets = document.getElementById("tab-presets");
  const tControl = document.getElementById("tab-control");

  if (tab === "presets") {
    sidebar.classList.add("tab-active");
    main.classList.remove("tab-active");
    tPresets.classList.add("active");
    tControl.classList.remove("active");
  } else {
    main.classList.add("tab-active");
    sidebar.classList.remove("tab-active");
    tControl.classList.add("active");
    tPresets.classList.remove("active");
  }
}

/* En móvil, mostrar el panel de control por defecto al cargar */
if (window.innerWidth <= 680) activarTab("control");
