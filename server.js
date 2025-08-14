import express from "express";
import cors from "cors";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const dbPath = path.join(process.cwd(), "db.json");

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ properties: [] }, null, 2));
}

function readDB() {
  return JSON.parse(fs.readFileSync(dbPath));
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// ثبت ملک جدید
app.post("/api/properties", (req, res) => {
  const db = readDB();
  const newProperty = { id: Date.now(), ...req.body };
  db.properties.push(newProperty);
  writeDB(db);
  res.status(201).json(newProperty);
});

// دریافت همه املاک
app.get("/api/properties", (req, res) => {
  const db = readDB();
  res.json(db.properties);
});

// حذف ملک
app.delete("/api/properties/:id", (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  db.properties = db.properties.filter((p) => p.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// آپلود اکسل
const upload = multer({ dest: "uploads/" });
app.post("/api/properties/upload", upload.single("file"), (req, res) => {
  const filePath = req.file.path;
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const db = readDB();
  data.forEach((row) => {
    db.properties.push({
      id: Date.now() + Math.floor(Math.random() * 1000),
      ...row,
    });
  });
  writeDB(db);

  fs.unlinkSync(filePath);
  res.json({ success: true, added: data.length });
});

app.listen(PORT, () => {
  console.log(`✅ Backend is running on http://localhost:${PORT}`);
});
