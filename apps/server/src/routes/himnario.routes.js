import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  listVersHymns,
  getHymns,
  getHimno,
  getEstrofa,
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
    return res.status(404).json({ pk: false, error: "Estrofa no encontrada" });
  }
  res.json({ ok: true, estrofa: estrofaEncontrada });
});

export default router;