import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  listVersBible,
  getBooks,
  getChapter,
  getVers,
} from "../utils/bibleParser.js";

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
    res.status(404).json({ ok: false, error: err.message });
  }
});

/**
 * El capitulo completo
 * GET /api/bible/:version/:capitulo
 */
router.get("/:version/:libro/:capitulo", (req, res) => {
  // cosas requeridas en la url
  const { version, libro, capitulo } = req.params;
  const versiculos = getChapter(version, Number(libro), Number(capitulo));

  if (!versiculos) {
    return res.status(404).json({ ok: false, error: "Capitulo no encontrado" });
  }

  res.json({ ok: true, versiculos });
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
  res.json({ ok: true, texto });
});

export default router;
