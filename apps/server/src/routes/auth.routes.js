/**
 * auth.routes.js — Rutas de autenticación.
 *
 * Dos rutas:
 *   POST /api/auth/register → crear cuenta nueva
import User from '../models/user.model.js'
 *   POST /api/auth/login    → iniciar sesión, recibir JWT
 */
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { validate } from '../middleware/validate.js'
import { registerSchema, loginSchema } from './auth.schemas.js';

const router = express.Router();

/**
 * generateToken - funcion de generacion de tokens.
 *
 * jwt.sign(payload, secret, opciones) crea el token.
 *
 * la clave para decodificar las claves este en el archivo .env, no disponible en el repositorio por obvias razones.
 */
function generateToken(userId, rol) {
    return jwt.sign(
        { userId, rol },             // payload
        process.env.JWT_SECRET,      // secret
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }  // opciones
    );
}

/**
 * REGISTRO
 * POST /api/auth/register
 * Body: { nombre, email, password }
 * validate(registerSchema) corre ANTES del handler
 * Si el body no cumple el schema, devuelve 400 y el handler nunca corre
 */
router.post('/register',  validate(registerSchema), async (req, res, next) => {
    try {
        const { nombre, email, password } = req.body;

        /*
        Guardamos en passwordHash — el middleware pre('save')
        del modelo se encarga de hashearlo automáticamente.
        */
        const usuario = await User.create({
            nombre,
            email,
            passwordHash: password,
        });

        const token = generateToken(usuario._id, usuario.rol);

        res.status(201).json({
            ok: true,
            token,
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * LOGIN
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', validate(loginSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const usuario = await User.findOne({ email: email }).select('+passwordHash');

        /**
         * Verificación en dos pasos — pero con un solo mensaje de error.
         */
        if (!usuario) {
            return res.status(401).json({
                ok: false,
                message: 'Incorrect email or password',
            });
        }

        const passwordValida = await usuario.compararPassword(password);

        if (!passwordValida) {
            return res.status(401).json({
                ok: false,
                message: 'Incorrect email or password',
            });
        }

        if (!usuario.activo) {
            return res.status(403).json({
                ok: false,
                message: 'Your account is deactivated',
            });
        }

        const token = generateToken(usuario._id, usuario.rol);

        res.json({
            ok: true,
            token,
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;