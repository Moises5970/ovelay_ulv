import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  listVersHymns,
  getHymns,
  getHimno,
  getEstrofa,
  getCoro,
} from "../utils/himnarioParser.js";
import { version } from "mongoose";

const router = Router();
router.use(authenticate);

/**
 * Lista de archivos de Himnario disponibles
 * GET /api/himnario/version
 */
router.get("/versiones", (req, res) => {
  res.json({ ok: true, versiones: listVersHymns() });
});

/**
 * Listar numero y titulo de himno
 * GET /api/himnario/:version/himnos
 */
router.get("/:version/himnos", (req, res) => {
  try {
    res.json({ ok: true, himnos: getHymns(req.params.version) });
  } catch (err) {
    res.status(404).json({ ok: false, error: err.message });
  }
});

router.get("/:version/:numero", (req, res) => {
  const himno = getHimno(req.params.version, Number(req.params.numero));

  if (!himno) {
    return res.status(404).json({ ok: false, error: "Himno no encontrado" });
  }
  res.json({ ok: true, himno });
});

router.get("/:version/:numero/coro", (req, res) => {
  const coro = getCoro(req.params.version, Number(req.params.numero));
  if (!coro) {
    return res
      .status(404)
      .json({ ok: false, error: "Este himno no tiene coro" });
  }
  res.json({ ok: true, coro });
});

/**
 * Himno completo consus estrofas
 * GET /api/himnario/:version/:numero/:estrofa
 */
router.get("/:version/:numero/:estrofa", (req, res) => {
  const { version, numero, estrofa } = req.params;
  const estrofaEncontrada = getEstrofa(
    version,
    Number(numero),
    Number(estrofa),
  );

  if (!estrofaEncontrada) {
    return res.status(404).json({ ok: false, error: "Estrofa no encontrada" });
  }
  res.json({ ok: true, estrofa: estrofaEncontrada });
});

export default router;
