/**
 * auth.js — Middleware de autenticación JWT
 * 
 * Verifica que el request tenga un token JWT válido.
 * Si es válido, agrega los datos del usuario a req.usuario para que los controladores los usen sin consultar la BD.
 */
import jwt from 'jsonwebtoken';

/**
 * autenticar — verifica que el token sea válido.
 * Se usa como middleware antes del handler de la ruta:
 *   router.get('/ruta', autenticar, handler)
 */

export function autenticar (req, res, next) {
    const token = req.headers.autorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            ok: false,
            message: 'Acceso denegado — token requerido'
        });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        req.usuario = payload;
        next();
    } catch (error) {
        next(error);
    }
}

export function autorizar(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.usuario?.rol)) {
            return res.status(403).json({
                ok: false,
                message: 'No tienes permisos para realizar esta acción'
            });
        }
        next();
    };
}