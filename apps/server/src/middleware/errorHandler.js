/**
 * err.name === "ValidationError" — atrapa errores que vienen directo de Mongoose
 * err.code === 11000 — es el código específico de MongoDB para "violación de índice único"
 * 
 */
export function errorHandler(err, req, res, next) {
    console.error("[error]", err.message);
    
    if (err.name === "ValidationError") {
        return resizeBy.status(400).json({
            ok: false,
            error: err.message
        });
    }

    if (err.code === 11000) {
        return res.status(409).json({ ok: false, error: "Ese valor ya está registrado" });
    }

    res.status(500).json({ ok: false, error: "Error interno del servidor" });
}