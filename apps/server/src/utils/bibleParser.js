import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { XMLParser } from "fast-xml-parser";

// rutas para la versiones de la Biblia
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARPETA_BIBLIAS = path.resolve(
  __dirname,
  "../../../../data/bible_versions",
);

/**
 * Nombre de los 66 libros en orden.
 * El xml que viene por predeterminado no trae los nombres
 * EL mapero se hace desde aqui
 */
const NOMBRES_LIBROS = [
  "Génesis",
  "Éxodo",
  "Levítico",
  "Números",
  "Deuteronomio",
  "Josué",
  "Jueces",
  "Rut",
  "1 Samuel",
  "2 Samuel",
  "1 Reyes",
  "2 Reyes",
  "1 Crónicas",
  "2 Crónicas",
  "Esdras",
  "Nehemías",
  "Ester",
  "Job",
  "Salmos",
  "Proverbios",
  "Eclesiastés",
  "Cantares",
  "Isaías",
  "Jeremías",
  "Lamentaciones",
  "Ezequiel",
  "Daniel",
  "Oseas",
  "Joel",
  "Amós",
  "Abdías",
  "Jonás",
  "Miqueas",
  "Nahúm",
  "Habacuc",
  "Sofonías",
  "Hageo",
  "Zacarías",
  "Malaquías",
  "Mateo",
  "Marcos",
  "Lucas",
  "Juan",
  "Hechos",
  "Romanos",
  "1 Corintios",
  "2 Corintios",
  "Gálatas",
  "Efesios",
  "Filipenses",
  "Colosenses",
  "1 Tesalonicenses",
  "2 Tesalonicenses",
  "1 Timoteo",
  "2 Timoteo",
  "Tito",
  "Filemón",
  "Hebreos",
  "Santiago",
  "1 Pedro",
  "2 Pedro",
  "1 Juan",
  "2 Juan",
  "3 Juan",
  "Judas",
  "Apocalipsis",
];

// cache en memoria: { "version": {estructura} }
const cacheBibles = {};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

/**
 * Lista los nombres de los archivos sin la extencion como versiones de la Biblia disponibles
 * @returns {string[]}
 */
export function listVersBible() {
  return (
    fs
      // buscar en las versiones de las biblias
      .readdirSync(CARPETA_BIBLIAS)
      // filtrar los .xml
      .filter((archivo) => archivo.endsWith(".xml"))
      // quitar al extencion del nombre
      .map((archivo) => archivo.replace(".xml", ""))
  );
}

/**
 * Carga y parsea una versión de Biblia a una estructura indexada por número
 * de libro/capítulo/versículo, para lecturas O(1) después del primer acceso.
 * Solo se ejecuta la primera vez que se pide esa versión (lazy loading);
 * las siguientes llamadas usan el resultado cacheado en memoria.
 * @param {string} version - nombre del archivo sin extensión
 * @returns {object} estructura indexada de la Biblia
 */
function loadBible(version) {
  if (cacheBibles[version]) return cacheBibles[version];

  // rutas de versiones
  const pathFile = path.join(CARPETA_BIBLIAS, `${version}.xml`);
  // si no se encuentra la version
  if (!fs.existsSync(pathFile)) {
    throw new Error(`Version de Biblia no encontrada: ${version}`);
  }

  const xmlCrudo = fs.readFileSync(pathFile, "utf-8");
  const datos = parser.parse(xmlCrudo);

  // TESTAMENTOS
  const testamentos = Array.isArray(datos.bible.testament)
    ? datos.bible.testament
    : [datos.bible.testament];

  const librosPorNumero = {};

  // Recorrer testamentos
  for (const testamento of testamentos) {
    // libros
    const libros = Array.isArray(testamento.book)
      ? testamento.book
      : [testamento.book];

    // Recorrer libros
    for (const libro of libros) {
      const numeroLibro = Number(libro["@_number"]);
      const capitulosPorNumero = {};

      // Capitulos
      const capitulos = Array.isArray(libro.chapter)
        ? libro.chapter
        : [libro.chapter];
      // Recorrer caitulos
      for (const capitulo of capitulos) {
        const numeroCapitulo = Number(capitulo["@_number"]);
        const versiculosPorNumero = {};

        // Versiculos
        const versiculos = Array.isArray(capitulo.verse)
          ? capitulo.verse
          : [capitulo.verse];
        for (const versiculo of versiculos) {
          versiculosPorNumero[Number(versiculo["@_number"])] =
            versiculo["#text"];
        }
        capitulosPorNumero[numeroCapitulo] = versiculosPorNumero;
      }
      librosPorNumero[numeroLibro] = {
        numero: numeroLibro,
        nombre: NOMBRES_LIBROS[numeroLibro - 1] || `Libro ${numeroLibro}`,
        capitulos: capitulosPorNumero,
      };
    }
  }
  cacheBibles[version] = librosPorNumero;
  return librosPorNumero;
}

/**
 * Devuelve la lista de libros (numero + nombre) de una version.
 * @param {string} version
 * @returns {{numero: number, nombre:string}[]}
 */
export function getBooks(version) {
  const biblia = loadBible(version);
  return Object.values(biblia)
    .map(({ numero, nombre }) => ({ numero, nombre }))
    .sort((a, b) => a.numero - b.numero);
}

/**
 * Devuelve todos los versiculos de un capitulo especifico
 * @param {string} version
 * @param {number} numeroLibro
 * @param {number} numeroCapitulo
 * @returns {Record<number,string>|null}
 */
export function getChapter(version, numeroLibro, numeroCapitulo) {
  const biblia = loadBible(version);
  return biblia[numeroLibro]?.capitulos[numeroCapitulo] || null;
}

/**
 * Devuelve el texto de un versiculo especifico
 * para el overlay, donde el operador manda una sola referencia a la vez.
 * @param {string} versiculo
 * @param {number} numeroLibro
 * @param {number} numeroCapitulo
 * @param {number} numeroVersiculo
 * @returns
 */
export function getVers(version, numeroLibro, numeroCapitulo, numeroVersiculo) {
  const capitulo = getChapter(version, numeroLibro, numeroCapitulo);
  return capitulo?.[numeroVersiculo] || null;
}
