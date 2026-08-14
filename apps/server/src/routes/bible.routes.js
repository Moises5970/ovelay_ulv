import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  listVersBible,
  getBooks,
  getChapter,
  getVers,
} from "../utils/bibleParser.js";
import { version } from "mongoose";

const router = Router();
router.use(authenticate);

/**
 * Lista de los archivos de Biblia disponibles
 * GET /api/bible/versiones
 */
router.get("/versiones", (req, res) => {
  res.json({ ok: true, versiones: listVersBible() });
});

/**
 * Listar los 66 libros con nombres
 * GET /api/bible/:version/libros
 */
router.get("/:version/libros", (req, res) => {
  try {
    res.json({ ok: true, libros: getBooks(req.params.version) });
  } catch (err) {
    res.status(404).json({ ok: false, error: err.mesagge });
  }
});

/**
 * Versiculo en especifico
 * GET /api/bible/:version/:libro/:capitulo/:verso
 */
router.get("/:version/:libro/:capitulo/:verso", (req, res) => {
  const { version, libro, capitulo, verso } = req.params;
  const texto = getVers(
    version,
    Number(libro),
    Number(capitulo),
    Number(verso),
  );

  if (!texto) {
    return res
      .status(404)
      .json({ ok: false, error: "Versiculo no encontrado" });
  }
  res.json({ ok: false, texto });
});

export default router;