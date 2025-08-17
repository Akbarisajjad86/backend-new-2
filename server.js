import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { nanoid } from "nanoid";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: FRONTEND_ORIGIN === "*" ? true : FRONTEND_ORIGIN }));
app.use(morgan("dev"));

const db = { items: [] };

app.get("/api/health", (req, res) => { res.json({ status: "ok" }); });
app.get("/api/items", (req, res) => { res.json(db.items); });
app.post("/api/items", (req, res) => {
  const { title, description } = req.body;
  const item = { id: nanoid(6), title, description };
  db.items.push(item);
  res.json(item);
});
app.delete("/api/items/:id", (req, res) => {
  db.items = db.items.filter(i => i.id !== req.params.id);
  res.json({ ok: true });
});
app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;
  console.log("Contact:", { name, email, message });
  res.json({ ok: true });
});

app.listen(PORT, () => console.log("Server running on", PORT));