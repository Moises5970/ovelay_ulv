import jwt from "jsonwebtoken";

import Room from "../models/room.model.js"
/**
 * Verifica el JWT del header Authorization.
 * Adjunta req.usuario = { userId, rol } si el token es válido.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export function authenticate (req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            ok: false,
            error: "Token no proporcionado"
        });
    } 

    const token = authHeader.split(" ")[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({
            ok: false,
            error: "Token invalido o expirado"
        })
    }
}

/**
 * Verifica que req.usuario.rol esté entre los roles permitidos.
 * Debe usarse DESPUÉS de autenticar().
 * @param {...string} rolesPermitidos
 */
export function authorize(...rolesPermitidos) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                ok: false,
                error: "No tienes permiso para esto"
            });
        }

        if (!rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({
                ok: false,
                error: "No tienes permiso para esto"
            });
        }
        next();
    };
}

/**
 * Verifica que req.user tenga uno de los roles permitidos DENTRO del room
 * indicado por :slug en la URL. Debe usarse DESPUÉS de authenticate().
 * Adjunta req.room con el documento ya cargado, para no volver a consultarlo
 * en el handler de la ruta.
 * @param {...("admin"|"operador")} rolesPermitidos
 */
export function verificarRolEnRoom(...rolesPermitidos) {
    return async (req, res, next) => {
        const room = await Room.findOne({ slug: req.params.slug, activo: true });
        if (!room) {
        return res.status(404).json({ ok: false, error: "Room no encontrado" });
        }

        const esAdmin = room.admins.some((id) => id.toString() === req.user.userId);
        const esOperador = room.operadores.some((id) => id.toString() === req.user.userId);
        const rolEnRoom = esAdmin ? "admin" : esOperador ? "operador" : null;

        if (!rolEnRoom || !rolesPermitidos.includes(rolEnRoom)) {
        return res.status(403).json({ ok: false, error: "No tienes permiso en este room" });
        }

        req.room = room;
        req.rolEnRoom = rolEnRoom;
        next();
        };
}