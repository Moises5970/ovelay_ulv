/**
 * user.model.js - Modelo de usuario
 * 
 * Define la estructura de un documento de usuario en MongoDB con ayuda de mongoose.
 * 
 * De esta manera puese ser importado por las rutas.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';         // hasheo de contraseñas.
import { Timestamp } from 'mongodb';

/**
 * Modelo del documento de usuario.
 *  Cada campo tiene:
    - tipo (String, Number, Boolean, Date, ObjectId...)
    - opciones (required, unique, min, max, default...)
 */
const userSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'The name is required'],
            trim: true,
            minlength: [2, 'The name must be at least 2 characters long'],
            maxlength: [50, 'The name cannot exceed 50 characters']
        },
        email: {
            type: String,
            required: [true, 'An email address is required'],
            unique: true,
            lowercase: true,   // se guerda en minusculas
            trim:true,
            match: [/^\S+@\S+\.\S+$/, 'El formato del email no es válido',],
        },
        /*
        passwordHash guarda el hash, NUNCA la contraseña original.
        select: false -> significa que este campo NO se incluye en las
        consultas por defecto — se tiene que pedir explícitamente
        con .select('+passwordHash') cuando lo necesites.
        */
        passwordHash: {
            type: String,
            required: true,
            select: false,
        },
        rol: {
            type: String,
            enum: {       // restringe los valones que no se encuentre en la lista
                values: ['admin', 'operador', 'viewer'],
                message: 'The role must be admin, operator, or viewer',
            },
            default: 'operador'
        },
        /*
        ObjectId es el tipo de referencia en MongoDB.
        ref: 'Organization' le dice a Mongoose que este campo
        apunta a un documento de la colección Organization.
        */
        orgId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            default: null,
        },
        activo: {
            type: Boolean,
            default: true,
        },
    },
    {/*
    timestamps: true agrega automáticamente dos campos:
    - createdAt: cuándo se creó el documento
    - updatedAt: cuándo se modificó por última vez
    */
    timestamps: true,
    }
);

/**
 * Mongoose tiene un sistema de hooks.
 * El pre('save'), se ejecuta antes de guardar el documento en la BD para validacion de datos.
 * Se ejecuta al llamar user.save o User.create().
 */
userSchema.pre('save', async function (next) {
    /*
    'this' es el documento que se está guardando.
    isModified('passwordHash') devuelve true solo si ese campo
    cambió desde la última vez que se guardó.
    */
    if (!this.isModified('passwordHash')) return next();
    /*
    bcrypt.hash(texto, saltRounds)
    saltRounds: 12 es el factor de costo.
    Cada incremento duplica el tiempo de cómputo:
        10 → ~65ms   (mínimo aceptable)
        12 → ~250ms  (buena práctica actual)
        14 → ~1000ms (para datos muy sensibles)
    */
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

/*
MÉTODO DE INSTANCIA — compararPassword
========================================
Los métodos de instancia se llaman sobre un documento específico.
Ejemplo: const esValida = await usuario.compararPassword("texto");

¿Por qué un método en el modelo y no en la ruta?
Mismo principio: la lógica de comparación está encapsulada.
La ruta solo llama al método y recibe true o false.
*/
userSchema.methods.compararPassword = async function (passwordTextoPlano) {
/*
bcrypt.compare compara el texto plano con el hash guardado.
Para esto SÍ necesitamos passwordHash, por eso usamos
.select('+passwordHash') cuando consultamos el usuario para login.
*/
return bcrypt.compare(passwordTextoPlano, this.passwordHash);
};

/*
mongoose.model('User', userSchema) crea el modelo.
El primer argumento es el nombre — Mongoose lo convierte
a minúsculas y plural para el nombre de la colección:
'User' → colección 'users' en MongoDB.
*/
const User = mongoose.model('User', userSchema);

export default User;