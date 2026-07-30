/**
 * errorHandler.js - Middleware de errores centralizado
 * Al final para mi es un controlador de errores, no creo que debe ser un nombre tan elegante, jejejeje, tu entenderas.
 * 
 * Como se usa Express, se toman en cuenta cuatro parametros: err, req, res, next.
 * 
 * Express llama a este middleware automáticamente cuando
  cualquier ruta llama a next(error) o lanza un error
  dentro de un bloque async/await con try/catch.

    Esta archivo se crea para evitar que cada ruta tenga un formato de respuesta diferente.
 */

export function errorHandler(err, req, res, next) {
    /**
     * Mongoose tiene codigos de errores especificos.
     * En este caso11000 = duplicate key (email duplicado, por ejemplo), al detectar, manda un mensaje claro.
     */
    if (err.code === 11000) {
        const campo = Object.keys(err.keyValue)[0];
        return res.status(409).json({
            ok: false,
            message: `The ${campo} is already registered`,
        });
    }
    
    if (err.name === 'ValidationError') {
        const mensajes = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            ok: false,
            message: mensajes.join('. '),
        });
    }

    /*
    Los errores de JWT tienen nombres específicos.
    JsonWebTokenError → token malformado o firma inválida
    TokenExpiredError → token expirado
    */
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ok: false, message: 'Invalid token'})
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ok: false, message: 'Expired token'})
    }

    const status = err.statusCode || err.status || 500;
    const mensaje = err.message || 'Internal server error';

    console.error(`[${status}] ${req.method} ${req.path} ->`, err.message);
    
    res.status(status).json({
    ok: false,
    mensaje,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};