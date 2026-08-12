import { Router } from "express";
import Room from "../models/room.model.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { createRoomSchema, updateRoomSchema } from "./rooms.schemas.js";
import { symbol } from "zod";

const router = Router();

// Todas las rutas de rooms requieren estar logueado
router.use(authenticate);

/**
 * CREATE
 * POST /api/rooms/*
 */
router.post("/", validate(createRoomSchema), async (req, res) => {
  const { nombre, slug } = req.body;

  const roomNew = new Room({
    nombre,
    slug,
    operadores: [req.user.userId],
  });

  await roomNew.save();

  res.status(201).json({
    ok: true,
    room: roomNew,
  });
});

/**
 * READ
 * listar todos los rooms activos
 * GET /api/
 */
router.get("/", async (req, res) => {
  const rooms = await Room.find({ activo: true });
  res.json({
    ok: true,
    rooms,
  });
});

/**
 * READ
 * un room por slug
 * GET /api/:slug
 */
router.get("/:slug", async (req, res) => {
  const room = await Room.findOne({ slug: req.params.slug, activo: true });

  if (!room) {
    return res.status(404).json({
      ok: false,
      error: "Room no encontrado",
    });
  }

  res.json({
    ok: true,
    room,
  });
});

/**
 * UPDATE
 * Actualizar room
 * PATCH /api/:slug
 */
router.patch("/:slug", validate(updateRoomSchema), async (req, res) => {
  const room = await Room.findOneAndUpdate(
    { slug: req.params.slug, activo: true },
    { $set: req.body },
    { new: true, runValidators: true },
  );

  if (!room) {
    return res.status(404).json({ ok: false, error: "Room no encontrado" });
  }

  res.json({ ok: true, room });
});

/**
 * DELETE
 * Soft dekete
 * DELETE /api/:slug
 */
router.delete("/:slug", async (req, res) => {
  const room = await Room.findByIdAndUpdate(
    { slug: req.params.slug, activo: true },
    { $set: { activo: false } },
    { new: true },
  );

  if (!room) {
    return res.status(404).json({ ok: false, error: " Room no encontrado" });
  }

  res.json({ ok: true, message: "Room desactivada" });
});

export default router;