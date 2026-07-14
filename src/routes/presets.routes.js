import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// directorio
const DB_PATH = path.join(__dirname, "../../data/presets_db")

const router = express.Router();

if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH, { recursive: true });

router.get("/:cat", (req, res) => {
    const file = path.join(DB_PATH, `${req.params.cat}.json`);
    res.json(fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : []);
});

router.post("/:cat", (req, res) => {
    fs.writeFileSync(
        path.join(DB_PATH, `${req.params.cat}.json`),
        JSON.stringify(req.body, null, 4),
    );
    res.json({ status: "ok" });
});

export default router;