/**
 * auth.js — Middleware de autenticación JWT
 * 
 * Verifica que el request tenga un token JWT válido.
 * Si es válido, agrega los datos del usuario a req.usuario para que los controladores los usen sin consultar la BD.
 */
import jwt from 'jsonwebtoken';

