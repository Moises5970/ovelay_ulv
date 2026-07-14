import express from "express";
import fs from "fs";
import path from "path";
import xml2js from "xml2js";
import { fileURLToPath } from "url";

// directorio
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get("/list", (req, res) => {
  const dir = path.join(__dirname, "../../data/himnario_versions");
  res.json(
    fs.existsSync(dir)
      ? fs.readdirSync(dir).filter((f) => f.endsWith(".xml")).map((f) => f.replace(".xml", ""))
      : []
  );
});

router.get("/:version/metadata", async (req, res) => {
  try {
    const xml = fs.readFileSync(path.join(__dirname, "../../data/himnario_versions", `${req.params.version}.xml`));
    const result = await new xml2js.Parser({ explicitArray: false, mergeAttrs: true }).parseStringPromise(xml);
    const himnario = result.himnario || result.HIMNARIO;
    const himnos = Array.isArray(himnario.himno) ? himnario.himno : [himnario.himno];

    res.json(himnos.map((h) => ({ numero: h.numero, titulo: h.titulo })));
  } catch (e) {
    res.status(500).send("Error leyendo metadatos del himnario");
  }
});

router.get("/:version/:himnoNumero", async (req, res) => {
  try {
    const xml = fs.readFileSync(path.join(__dirname, "../../data/himnario_versions", `${req.params.version}.xml`)); // Ajusta si la carpeta real es himnario_versions
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

export default router;