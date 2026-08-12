import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { resgiterSchema, loginSchema } from "../routes/auth.schemas.js"
import { validate } from '../middleware/validate.js'

const router = Router();

// generar token del usuario
function generateToken (user) {
    return jwt.sign(
        {userId: user._id},/* rol: user.rol*/
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN || "5d"}
    );
}

/**
 *  Registro
 * POST /api/auth/register
 */
router.post("/register", validate(resgiterSchema), async(req, res) => {

    const { nombre, email, password } = req.body;

    const exist = await User.findOne({ email });
    if (exist) {
        return res.status(409).json({
            ok: false, error: "Este email ya esta registrado"
        });
    }

    const userNew = new User ({
        nombre, email
    });
    userNew.password = password;
    await userNew.save();

    const token = generateToken(userNew);

    res.status(201).json({
        ok: true, 
        token,
        user: {
            id: userNew._id,
            nombre: userNew.nombre,
            email: userNew.email,
            rol: userNew.rol,
        },
    });
});

/**
 * login
 * POST /api/auth/login
 */
router.post("/login", validate(loginSchema), async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
        return res.status(401).json({
            ok: false,
            error: "Email o contraseña incorrectos"
        });
    }

    const isValid = await user.compararPassword(password);
    if (!isValid) {
        return res.status(401).json({ 
            ok: false, 
            error: "Email o contraseña incorrectos" 
        });
    }

    const token = generateToken(user);

    res.json({
        ok: true,
        token,
        usuario: {
            id: user._id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol,
        },
    });
});

export default router;