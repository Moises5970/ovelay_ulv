/**
 * auth.schemas.js — Schemas de validación para auth
 *  Separar los schemas de las rutas tiene la ventaja: el mismo schema puede reutilizarse en tests o en otras rutas
 */
import { z } from 'zod';

export const registerSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre es obligatorio' })
    .trim()
    .min(1, 'El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede superar 50 caracteres'),

  email: z
    .string({ required_error: 'El email es obligatorio' })
    .min(1, 'El email es obligatorio')
    .email('El formato del email no es válido')
    .toLowerCase(),

  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(1, 'La contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'El email es obligatorio' })
    .min(1, 'El email es obligatorio')
    .email('El formato del email no es válido')
    .toLowerCase(),

  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(1, 'La contraseña es obligatoria'),
});