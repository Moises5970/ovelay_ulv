import { z } from "zod";

/**
 * resgiterSchema
 * Dicta como se ve un registro correcto
 * nombre - string, limpio y debe tener minimo dos carecteres
 * email - string y limpio
 * password - string y minimo 8 caracteres
 */
export const resgiterSchema = z.object({
    nombre: z.string().trim().min(2, "El nombre es muy corto"),
    email: z.string().trim().email("Email invalido"), // verfica que la estructura sea correcta
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
})

/**
 * loginSchema
 * Dicta como se ve un inicio de secion correcto
 */
export const loginSchema = z.object({
    email: z.string().trim().email("Email invalido"),
    password: z.string().min(1, "La contraseña es requerida")
})