let bibliaData = [];
let versiculosActuales = [];
let indiceVersiculo = [];

// Versiculos -> Llena el select con los archivos XML disponibles en /data/bible_versions/. */
async function cargarVersionesReales() {
  const vers = await fetch("/api/bible/list").then((r) => r.json());
  const sel = document.getElementById("bib-ver");
  sel.innerHTML = '<option value="">-- Versión --</option>';
  vers.forEach((v) => (sel.innerHTML += `<option value="${v}">${v}</option>`));
}

// Libros -> pre: nombre del libro a preseleccionar (usado al cargar un preset). */
async function cargarLibros(pre = null) {
  const ver = document.getElementById("bib-ver").value;
  if (!ver) return;
  bibliaData = await fetch(`/api/bible/${ver}/metadata`).then((r) => r.json());
  const sel = document.getElementById("bib-lib");
  sel.innerHTML = '<option value="">-- Libro --</option>';
  bibliaData.forEach(
    (l) =>
      (sel.innerHTML += `<option value="${l.nombre}">${l.nombre}</option>`),
  );
  if (pre) {
    sel.value = pre;
    await cargarCapitulos();
  }
}

// Capitulos -> Lee bibliaData (ya en memoria) para saber cuántos capítulos tiene el libro elegido.
async function cargarCapitulos(pre = null) {
  const libro = bibliaData.find(
    (l) => l.nombre === document.getElementById("bib-lib").value,
  );
  const sel = document.getElementById("bib-cap");
  sel.innerHTML = "";
  if (libro)
    for (let i = 1; i <= libro.capitulos; i++)
      sel.innerHTML += `<option value="${i}">${i}</option>`;
  if (pre) sel.value = pre;
}
