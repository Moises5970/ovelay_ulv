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

// --- BIBLIA ---
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
    const result = await new xml2js.Parser().parseStringPromise(xml);
    const bible = result.bible;
    let books = [];
    bible.testament.forEach((t) => {
      if (t.book) books = books.concat(t.book);
    });
    res.json(
      books.map((b, i) => ({
        nombre: bookNames[i] || b.$.name,
        capitulos: b.chapter.length,
      })),
    );
  } catch (e) {
    res.status(500).send("Error en XML");
  }
});

app.get("/api/bible/:version/:book/:chapter", async (req, res) => {
  try {
    const xml = fs.readFileSync(
      path.join(__dirname, "bible_versions", `${req.params.version}.xml`),
    );
    const result = await new xml2js.Parser().parseStringPromise(xml);
    const bible = result.bible;
    let books = [];
    bible.testament.forEach((t) => {
      if (t.book) books = books.concat(t.book);
    });
    const bIdx = bookNames.findIndex(
      (n) => n.toLowerCase() === req.params.book.toLowerCase(),
    );
    const cap = books[bIdx].chapter.find(
      (c) => c.$.number === req.params.chapter,
    );
    res.json(cap.verse.map((v) => ({ numero: v.$.number, texto: v._ })));
  } catch (e) {
    res.status(500).send("Error");
  }
});

// --- CORE ---
app.get("/api/init", (req, res) => {
  const ignore = [
    "presets_db",
    "node_modules",
    ".git",
    "assets",
    "bible_versions",
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

app.listen(3000, () => console.log("🚀 Servidor en puerto 3000"));
