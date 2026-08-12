import { Router } from "express";
import Room from "../models/room.model.js";
import User from "../models/user.model.js";
import { validate } from "../middleware/validate.js";
import { authenticate, verificarRolEnRoom } from "../middleware/auth.js";
import {
  agregarMiembroSchema,
  createRoomSchema,
  updateRoomSchema,
} from "./rooms.schemas.js";
import { symbol } from "zod";

const router = Router();

// Todas las rutas de rooms requieren estar logueado
router.use(authenticate);

// CREATE — el creador queda como admin de SU propio room
router.post("/", validate(createRoomSchema), async (req, res) => {
  const { nombre, slug } = req.body;
  const roomNew = new Room({ nombre, slug, admins: [req.user.userId] });
  await roomNew.save();
  res.status(201).json({ ok: true, room: roomNew });
});

// READ — lista solo los rooms donde el usuario participa (admin u operador)
router.get("/", async (req, res) => {
  const rooms = await Room.find({
    activo: true,
    $or: [{ admins: req.user.userId }, { operadores: req.user.userId }],
  });

  res.json({ ok: true, rooms });
});

// READ — un room, requiere pertenecer a él (cualquier rol)
router.get("/:slug", verificarRolEnRoom("admin", "operador"), (req, res) => {
  res.json({ ok: true, room: req.room });
});

// UPDATE - solo admins del room
router.patch(
  "/:slug",
  verificarRolEnRoom("admin"),
  validate(updateRoomSchema),
  async (req, res) => {
    Object.assign(req.room, req.body);
    await req.room.save();
    res.json({ ok: true, room: req.room });
  },
);

// DELETE (soft) - solo admins
router.delete("/:slug", verificarRolEnRoom("admin"), async (req, res) => {
  req.room.activo = false;
  await req.room.save();
  res.json({ ok: true, message: "Room desactivada" });
});

// AGREGAR MIEMBRO - solo admins
router.post(
  "/:slug/miembros", verificarRolEnRoom("admin"),
  validate(agregarMiembroSchema),
  async (req, res) => {
    const { email, rol } = req.body;

    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res
        .status(404)
        .json({ ok: false, error: "Usuario no encontrado" });
    }

    const campo = rol === "admin" ? "admins" : "operadores";
    const ready = req.room[campo].some(
      (id) => id.toString() === usuario._id.toString(),
    );
    if (ready) {
      return res
        .status(409)
        .json({ ok: false, error: "El usuario ya tiene ese rol en este room" });
    }

    req.room[campo].push(usuario._id);
    await req.room.save();

    res.status(201).json({ ok: true, room: req.room });
  }
);

export default router;