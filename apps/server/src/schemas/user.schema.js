import { z } from 'zod';

export const registerSchema = z.object({
    nombre: z.string({
        required_error: 'El nombre es requerido'
    }).trim()
    .min(2, 'El nombre debe tener minimo 2 caracteres'
    )
    .max(50, 'El nombre solo puede terner 50 caracteres como maximo'
    ),

    email: z.string({
        required_error: 'El email es requerido'
    }).email('Email invalido'
    ),

    password: z.string ({
        required_error: 'La contraseña es requerida'
    }).trim()
    .min(8, 'La contraseña debe tener minimo 8 caracteres'
    )
});

export const loginSchema = z.object({
    email: z.string({
        required_error: 'El Email es requerido'
    }).email('Email Invalido'
    ),

    password: z.string({
        required_error: 'La contraseña es requerida'
    }).min(8, 'La contraseña debe tener minimo 8 caracteres'
    )
});