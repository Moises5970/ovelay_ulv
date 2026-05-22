const express = require("express");
const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const DB_PATH = path.join(__dirname, "presets_db");
if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH);

const bookNames = [
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

app.get("/api/bible/list", (req, res) => {
  const dir = path.join(__dirname, "bible_versions");
  res.json(
    fs.existsSync(dir)
      ? fs
          .readdirSync(dir)
          .filter((f) => f.endsWith(".xml"))
          .map((f) => f.replace(".xml", ""))
      : [],
  );
});

app.get("/api/bible/:version/metadata", async (req, res) => {
  try {
    const xml = fs.readFileSync(
      path.join(__dirname, "bible_versions", `${req.params.version}.xml`),
    );
    const result = await new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
    }).parseStringPromise(xml);
    const bible = result.bible || result.BIBLE;
    let books = [];
    const testaments = Array.isArray(bible.testament)
      ? bible.testament
      : [bible.testament];
    testaments.forEach((t) => {
      if (t.book)
        books = books.concat(Array.isArray(t.book) ? t.book : [t.book]);
    });
    res.json(
      books.map((b, i) => ({
        nombre: bookNames[i] || b.name,
        capitulos: Array.isArray(b.chapter) ? b.chapter.length : 1,
      })),
    );
  } catch (e) {
    res.status(500).send("Error");
  }
});

app.get("/api/bible/:version/:book/:chapter", async (req, res) => {
  try {
    const xml = fs.readFileSync(
      path.join(__dirname, "bible_versions", `${req.params.version}.xml`),
    );
    const result = await new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
    }).parseStringPromise(xml);
    const bible = result.bible || result.BIBLE;
    let books = [];
    const testaments = Array.isArray(bible.testament)
      ? bible.testament
      : [bible.testament];
    testaments.forEach((t) => {
      if (t.book)
        books = books.concat(Array.isArray(t.book) ? t.book : [t.book]);
    });
    const bIdx = bookNames.findIndex(
      (n) => n.toLowerCase() === req.params.book.toLowerCase(),
    );
    const chapters = Array.isArray(books[bIdx].chapter)
      ? books[bIdx].chapter
      : [books[bIdx].chapter];
    const cap = chapters.find((c) => c.number === req.params.chapter);
    const verses = Array.isArray(cap.verse) ? cap.verse : [cap.verse];
    res.json(
      verses.map((v) => ({ numero: v.number, texto: v._ || v.toString() })),
    );
  } catch (e) {
    res.status(500).send("Error");
  }
});

app.get("/api/init", (req, res) => {
  const ignore = [
    "presets_db",
    "node_modules",
    ".git",
    "assets",
    "bible_versions",
    "estructuras",
    "himnario_versions"
  ];
  const categories = fs
    .readdirSync(__dirname)
    .filter(
      (f) =>
        fs.statSync(path.join(__dirname, f)).isDirectory() &&
        !ignore.includes(f),
    );
  let structure = {};
  categories.forEach((cat) => {
    structure[cat] = fs
      .readdirSync(path.join(__dirname, cat))
      .filter((f) => fs.statSync(path.join(__dirname, cat, f)).isDirectory());
  });
  res.json(structure);
});

app.get("/api/presets/:cat", (req, res) => {
  const file = path.join(DB_PATH, `${req.params.cat}.json`);
  res.json(fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : []);
});

app.post("/api/presets/:cat", (req, res) => {
  fs.writeFileSync(
    path.join(DB_PATH, `${req.params.cat}.json`),
    JSON.stringify(req.body, null, 4),
  );
  res.json({ status: "ok" });
});

app.post("/api/update", (req, res) => {
  fs.writeFileSync("config.json", JSON.stringify(req.body, null, 4));
  res.json({ status: "ok" });
});

// ═════════════════════════════════════════════════════════════════════
// 🎵 NUEVO MOTOR DE HIMNARIOS (INTEGRACIÓN NO DESTRUCTIVA)
// ═════════════════════════════════════════════════════════════════════
app.get("/api/himnario/list", (req, res) => {
  const dir = path.join(__dirname, "himnario_versions");
  res.json(
    fs.existsSync(dir)
      ? fs.readdirSync(dir).filter((f) => f.endsWith(".xml")).map((f) => f.replace(".xml", ""))
      : []
  );
});

app.get("/api/himnario/:version/metadata", async (req, res) => {
  try {
    const xml = fs.readFileSync(path.join(__dirname, "himnario_versions", `${req.params.version}.xml`));
    const result = await new xml2js.Parser({ explicitArray: false, mergeAttrs: true }).parseStringPromise(xml);
    const himnario = result.himnario || result.HIMNARIO;
    const himnos = Array.isArray(himnario.himno) ? himnario.himno : [himnario.himno];
    
    res.json(himnos.map((h) => ({ numero: h.numero, titulo: h.titulo })));
  } catch (e) {
    res.status(500).send("Error leyendo metadatos del himnario");
  }
});

app.get("/api/himnario/:version/:himnoNumero", async (req, res) => {
  try {
    const xml = fs.readFileSync(path.join(__dirname, "himnario_versions", `${req.params.version}.xml`)); // Ajusta si la carpeta real es himnario_versions
    const result = await new xml2js.Parser({ explicitArray: false, mergeAttrs: true }).parseStringPromise(xml);
    const himnario = result.himnario || result.HIMNARIO;
    const himnos = Array.isArray(himnario.himno) ? himnario.himno : [himnario.himno];
    
    const target = himnos.find((h) => String(h.numero) === String(req.params.himnoNumero));
    if (!target) return res.status(404).send("Himno no encontrado");

    let bloquesProcesados = [];

    // 1. Extraer y pre-segmentar el Coro primero para tenerlo listo en memoria
    let bloquesCoro = [];
    if (target.coro && target.coro.linea) {
      const lineasCoro = Array.isArray(target.coro.linea) ? target.coro.linea : [target.coro.linea];
      for (let i = 0; i < lineasCoro.length; i += 2) {
        bloquesCoro.push({
          tipo: "coro",
          v1: lineasCoro[i] || "",
          v2: lineasCoro[i + 1] || "",
          identificador: `Himno ${target.numero} — CORO`
        });
      }
    }

    // 2. Procesar las estrofas e intercalar el coro dinámicamente
    if (target.estrofas && target.estrofas.estrofa) {
      const estrofasLista = Array.isArray(target.estrofas.estrofa) ? target.estrofas.estrofa : [target.estrofas.estrofa];
      
      estrofasLista.forEach((est) => {
        const lineas = Array.isArray(est.linea) ? est.linea : [est.linea];
        
        // Fragmentamos la estrofa actual en parejas de 2 líneas
        for (let i = 0; i < lineas.length; i += 2) {
          bloquesProcesados.push({
            tipo: "estrofa",
            v1: lineas[i] || "",
            v2: lineas[i + 1] || "",
            identificador: `Himno ${target.numero} — Estrofa ${est.numero}`
          });
        }

        // ── EL TRUCO DE INGENIERÍA ──
        // Después de meter TODA la estrofa actual, si el himno tiene coro, lo inyectamos inmediatamente en la secuencia
        if (bloquesCoro.length > 0) {
          bloquesProcesados.push(...bloquesCoro);
        }
      });
    } else {
      // Si el himno por alguna razón no tuviera estrofas estructuradas y solo tiene el coro
      if (bloquesCoro.length > 0) bloquesProcesados.push(...bloquesCoro);
    }

    res.json(bloquesProcesados);
  } catch (e) {
    res.status(500).send("Error procesando pasajes del himno");
  }
});

app.listen(5000, () => console.log("🚀 Motor v6.8 Activo en puerto 5000"));
