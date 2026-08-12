/**
 * aqui voy a comentar a lo loco
 * estoy a penas agarrandole a esto de los test
 * debi saberlo desde el semestre 2026a
 * pero ni el ingeniero lo mostro, ni yo lo investigue
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import dotenv from "dotenv";
import request from "supertest";
import express from "express";
import authRoutes from "../src/routes/auth.routes.js";
import { errorHandler } from "../src/middleware/errorHandler.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(errorHandler);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.dropCollection("users").catch(() => {});
  await mongoose.disconnect();
});

// esto es para el resgitro
describe("POST /api/auth/register", () => {
  // cuando esta correcto
  it("201 con token cuando los datos son correctos", async () => {
    // ruta de resgitro y datos
    const res = await request(app).post("/api/auth/register").send({
      nombre: "Test User",
      email: "vitest@test.com",
      password: "segura123",
    });

    // me imagino que esto es lo que se espera
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("vitest@test.com");
  });

  // email incorrecto
  it("400 cuando el email es invalido", async () => {
    // ruta de registro
    const res = await request(app).post("/api/auth/register").send({
      // lo que se manda
      nombre: "Test",
      email: "noesEmail",
      password: "segura123",
    });

    expect(res.status).toBe(400); // codigo esperado
    expect(res.body.ok).toBe(false); // ok: false
  });

  // email ya registrado
  it("409 cuando el email ya esta registrado", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        nombre: "Otro",
        email: "vitest@test.com",
        password: "otraClave123",
      });

    expect(res.status).toBe(409);
  });
});
