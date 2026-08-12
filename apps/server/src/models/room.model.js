import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      // slug es una cadena de texto única y legible por humanos utilizada para identificar un recurso específico
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    operadores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    configActual: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Generar el slug automaticamente a partir del nombre si no se define
roomSchema.pre("validate", function () {
  if (!this.slug && this.nombre) {
    this.slug = this.nombre.toLowerCase
      .trim()
      .normalize("NFD") // separa la letra de su acento
      .replace(/[\u0300-\u036f]/g, "") // quita acentos
      .replace(/[^a-z0-9\s-]/g, "") // quita caracteres especiales
      .replace(/\s+/g, "-"); // espacios → guiones
  }
  // next();
});

export default mongoose.model("Room", roomSchema);