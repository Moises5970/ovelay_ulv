import express from "express";
import fs from "fs";
import path from "path";
import xml2js from "xml2js";
import { fileURLToPath } from "url";

// directorio
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

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

// obtener los nombres de la versiones
router.get("/list", (req, res) => {
    const dir = path.join(__dirname, '../../data/bible_versions');
    res.json(
        fs.existsSync(dir)
            // leer carpeta => lista de archivos | filtrar => solo archivo .xml | limpiar nombre => nombre sin extencion
            ? fs.readdirSync(dir).filter((f) => f.endsWith(".xml")).map((f) => f.replace(".xml", ""))
            : []
    );
})

router.get("/:version/metadata", async (req, res) => {
    try {
        const xml = fs.readFileSync(
            path.join(__dirname, "../../data/bible_versions", `${req.params.version}.xml`),
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

router.get("/:version/:book/:chapter", async (req, res) => {
    try {
        const xml = fs.readFileSync(
            path.join(__dirname, "../../data/bible_versions", `${req.params.version}.xml`),
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

export default router;