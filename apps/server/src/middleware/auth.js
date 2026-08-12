import jwt from "jsonwebtoken";
/**
 * Verifica el JWT del header Authorization.
 * Adjunta req.usuario = { userId, rol } si el token es válido.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export function authenticate (req, res, next) {
    const authHeader = req.header.authorization;

    if (!authHeader || !authHeader.startWith("Bearer ")) {
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