import mongoose from "mongoose";
import bcrypt from "bcrypt"

/**
 * Esquema de usuario
 * nombre - string, es rquerido y se limpia
 * email - string, requerido, unico y limpio
 * passwordHash - string y unica
 * rol
 * orgId - organizacion para que trabaja
 * activo - true/false
 */
const userSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required : true,
            unique: true,
            lowercase: true,
            trim: true
        },
        passwordHash: {
            type: String,
            required: true,
            select: false, // no se envia
        },
        /*
        El rol lo asigna la room, no es propiedad del usuario
        rol: {
            type: String,
            enum: ["admin", "operador"],
            default: "operador",
        },*/
        orgId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
        },
        activo: {
            type: Boolean,
            default: true
        },
    },
    {timestamps: true}
);

/**
 * Virtual
 * campo que no existe en la base de datos, solo vive en el objeto de JavaScript mientras lo tienes en memoria.
 */
userSchema.virtual("password").set(function(plano) {
    this._passwordPlano = plano;
});

/**
 *  Hook: se ejecuta automáticamente antes de cada .save()
 * datos aleatorios que se mezclan con la contraseña antes de hashear, para que dos usuarios con la misma contraseña ("123456") terminen con hashes completamente distintos en la base de datos.
 */ 
userSchema.pre("validate", async function () {
    if (!this._passwordPlano) return;

    const salt = await bcrypt.genSalt(12); // es el "cost factor": entre más alto, más lento (y más seguro) es el hasheo (unos ~200-300ms).
    this.passwordHash = await bcrypt.hash(this._passwordPlano, salt);
    //next(); validate no recibe next
});

// Método de instancia: usado en login para verificar contraseña
userSchema.methods.compararPassword = function (plano) {
    return bcrypt.compare(plano, this.passwordHash);
}

export default mongoose.model("User", userSchema);