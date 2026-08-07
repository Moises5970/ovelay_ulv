/**
 * validate,js - Validacion con zod
 * Zod espera los datos de entrada.
 * Si los datos no coinciden, devuelve errores claros antes de que el request llegue al controlador de la ruta.
 * Porque la validación manual (if !nombre, if !email...) es repetitiva, inconsistente y fácil de olvidar.
 * Zod centraliza las reglas y las hace reutilizables.
 */

/**
 * Recibe el schema de Zod que define qué se espera en req.body.
 * Uso en una ruta:
 *  router.post('/register', validar(registerSchema), async (req, res) => {...})
 */
import { ZodError } from 'zod';

export function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        /*
          ZodError puede tener dos estructuras:
          1. error.errors → array de errores por campo (caso normal)
          2. error.errors vacío o undefined → el error está en error.issues

          Zod internamente siempre tiene .issues (es el array real).
          .errors es un getter que apunta a .issues — pero cuando el
          input completo es undefined, la estructura cambia.
          Usamos .issues directamente para cubrir ambos casos.
        */
        const issues = error.issues ?? [];

        return res.status(400).json({
          ok: false,
          mensaje: mensajes.join('. '),
        });
      }
      next(error);
    }
  };
}