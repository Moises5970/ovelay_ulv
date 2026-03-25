fetch("config.json")
  .then(res => res.json())
  .then(config => {
    cargarOverlay(config.lower_third, config.texto);
  });

function cargarOverlay(nombre, texto) {
  const contenedor = document.getElementById("overlay");

  fetch(`overlays/${nombre}/index.html`)
    .then(res => res.text())
    .then(html => {
      contenedor.innerHTML = html;

      // Esperar a que cargue y luego inyectar texto
      setTimeout(() => {
        aplicarTexto(texto);
      }, 100);
    });
}

function aplicarTexto(texto) {
  // Esto depende de tus IDs actuales
  if (document.getElementById("nombre"))
    document.getElementById("nombre").innerText = texto.nombre;

  if (document.getElementById("cargo"))
    document.getElementById("cargo").innerText = texto.cargo;
}