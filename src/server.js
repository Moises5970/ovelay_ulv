import express from "express";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";
import { Server } from "socket.io";

import bibleRoutes    from './routes/bible.routes.js';
import himnarioRoutes from './routes/himnario.routes.js';
import presetsRoutes  from './routes/presets.routes.js';
import registrarOverlaySockets from './sockets/overlayHandlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

console.log("Sirviendo static desde:", path.join(__dirname, '../public'));

dotenv.config();

const port   = process.env.PORT || 3000;
const app    = express();
const server = createServer(app);
const io     = new Server(server);

app.use(express.json());

// Archivos estáticos del panel (admin.html, output.html, css/, js/)
// __dirname apunta a src/, por eso subimos un nivel con ../
app.use(express.static(path.join(__dirname, '../public')));

// Plantillas de overlay — los iframes las cargan desde /templates/
app.use('/templates', express.static(path.join(__dirname, '../templates')));

// API: lee templates/ y devuelve la estructura de carpetas
// admin.js llama a esto al arrancar para construir los chips dinámicamente
app.get('/api/init', (req, res) => {
  const templatesPath = path.join(__dirname, '../templates');
  const ignorar = ['node_modules', '.git', 'assets'];

  try {
    const categorias = fs.readdirSync(templatesPath).filter(f =>
      fs.statSync(path.join(templatesPath, f)).isDirectory() &&
      !ignorar.includes(f)
    );

    const estructura = {};
    categorias.forEach(cat => {
      estructura[cat] = fs.readdirSync(path.join(templatesPath, cat))
        .filter(f => fs.statSync(path.join(templatesPath, cat, f)).isDirectory());
    });

    res.json(estructura);
  } catch (e) {
    res.status(500).json({ error: 'No se pudo leer templates/' });
  }
});

app.use('/api/bible',    bibleRoutes);
app.use('/api/himnario', himnarioRoutes);
app.use('/api/presets',  presetsRoutes);

registrarOverlaySockets(io);

server.listen(port, () => {
  console.log(`🚀 Servidor activo en http://localhost:${port}`);
});