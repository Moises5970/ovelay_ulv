import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { XMLParser } from "fast-xml-parser";

// rutas para la versiones de la Biblia
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARPETA_HIMNARIOS = path.resolve(
  __dirname,
  "../../../../data/himnario_versions",
);

// cache en memoria: { "version": {estructura} }
const cacheHymns = {};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

/**
 * Lista los nombres de los archivos sin la extencion como versiones del himnario disponibles
 * @returns {string[]}
 */
export function listVersHymns() {
  return (
    fs
      // buscar en las versiones de los himnarios
      .readdirSync(CARPETA_HIMNARIOS)
      // filtrar los .xml
      .filter((archivo) => archivo.endsWith(".xml"))
      // quitar al extencion del nombre
      .map((archivo) => archivo.replace(".xml", ""))
  );
}

function loadHymns(version) {
  if (cacheHymns[version]) return cacheHymns[version];

  // rutas de versiones
  const pathFile = path.join(CARPETA_HIMNARIOS, `${version}.xml`);
  // si no se encuentra
  if (!fs.existsSync(pathFile)) {
    throw new Error(`Version de Himnario no encontrada: ${version}`);
  }

  const xmlCrudo = fs.readFileSync(pathFile, "utf-8");
  const datos = parser.parse(xmlCrudo);

  // himnos
  const himnos = Array.isArray(datos.himnario.himno)
    ? datos.himnario.himno
    : [datos.himnario.himno];
  const himnosPorNumero = {};

  // recorrer himnos
  for (const himno of himnos) {
    const numero = Number(himno["@_numero"]);
    const estrofasCrudas = Array.isArray(himno.estrofas.estrofa)
      ? himno.estrofas.estrofa
      : [himno.estrofas.estrofa];

    const estrofas = estrofasCrudas.map((estrofa) => ({
      numero: Number(estrofa["@_numero"]),
      lineas: Array.isArray(estrofa.linea) ? estrofa.linea : [estrofa.linea],
    }));

    // En caso de tener coro
    let coro = null;
    if (himno.coro) {
      const lineasCoro = Array.isArray(himno.coro.linea)
        ? himno.coro.linea
        : [himno.coro.linea];
      coro = { lineas: lineasCoro };
    }

    himnosPorNumero[numero] = {
      numero,
      titulo: himno["@_titulo"],
      estrofas,
      coro, // null si el himno no tiene coro
    };
  }

  const resultado = { nombre: datos.himnario["@_nombre"], himnosPorNumero };
  cacheHymns[version] = resultado;
  return resultado;
}

/**
 *Devuelve la lista de himnos (número + título) de un himnario.
 * @param {string} version
 * @returns {{numero:number, titulo:string}[]}
 */
export function getHymns(version) {
  const { himnosPorNumero } = loadHymns(version);
  return Object.values(himnosPorNumero)
    .map(({ numero, titulo }) => ({ numero, titulo }))
    .sort((a, b) => a.numero - b.numero);
}

/**
 * Devuelve un himno completo, con todas sus estrofas y líneas.
 * @param {string} version
 * @param {number} numeroHimno
 * @returns {objet|null}
 */
export function getHimno(version, numeroHimno) {
  const { himnosPorNumero } = loadHymns(version);
  return himnosPorNumero[numeroHimno] || null;
}

/**
 * Devuelve una estrofa de un himno especifico
 * @param {string} version
 * @param {number} numeroHimno
 * @param {number} numeroEstrofa
 * @returns {{numero:number, lineas:string[]}|null}
 */
export function getEstrofa(version, numeroHimno, numeroEstrofa) {
  const himno = getHimno(version, numeroHimno);
  return himno?.estrofas.find((e) => e.numero === numeroEstrofa) || null;
}

/**
 * Devuelve el coro de un himno, o null si no tiene.
 * @param {string} version
 * @param {number} numeroHimno
 * @returns {{lineas:string[]}|null}
 */
export function getCoro(version, numeroHimno) {
  const himno = getHimno(version, numeroHimno);
  return himno?.coro || null;
}
