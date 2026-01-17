const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const imgDir = path.join(__dirname, "images");
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir);
}

const db = new Database(path.join(__dirname, "clipboard.db"));

db.prepare(
  `
    CREATE TABLE IF NOT EXISTS clips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT,
        imagePath TEXT,
        content TEXT,
        hash TEXT UNIQUE,
        createdAt INTEGER
    )
    `,
).run();

const getHash = (data) => {
  return crypto.createHash("md5").update(data).digest("hex");
};

const saveText = (text) => {
  const hash = getHash(text);
  const existing = db.prepare("SELECT id FROM clips WHERE hash = ?").get(hash);

  if (existing) {
    db.prepare("UPDATE clips SET createdAt = ? WHERE id = ?").run(
      Date.now(),
      existing.id,
    );
  } else {
    db.prepare(
      `
      INSERT INTO clips (type, content, hash, createdAt)
      VALUES (?, ?, ?, ?)
    `,
    ).run("text", text, hash, Date.now());
  }
};

const saveImage = (buffer) => {
  const hash = getHash(buffer);
  const existing = db
    .prepare(" SELECT id from clips WHERE hash = ? ")
    .get(hash);

  if (existing) {
    db.prepare(" UPDATE clips SET createdAt = ? WHERE id = ? ").run(
      Date.now(),
      existing.id,
    );
  } else {
    const filename = `img_${Date.now()}.png`;
    const filePath = path.join(imgDir, filename);
    fs.writeFileSync(filePath, buffer);

    db.prepare(
      `
      INSERT INTO clips (type, imagePath, hash, createdAt)
      VALUES (?, ?, ?, ?)
    `,
    ).run("image", filePath, hash, Date.now());
  }
};

const getHistory = () => {
  return db
    .prepare("SELECT * FROM clips ORDER BY createdAt DESC LIMIT 50")
    .all();
};

const clearAll = () => {
  db.prepare("DELETE FROM clips").run();

  if (fs.existsSync(imgDir)) {
    const files = fs.readdirSync(imgDir);
    files.forEach((file) => {
      fs.unlinkSync(path.join(imgDir, file));
    });
  }

  console.log("Clipboard history cleared on startup");
};

const enforceLimit = () => {
  const count = db.prepare("SELECT COUNT(*) as count FROM clips").get().count;

  if (count > 50) {
    const toDelete = db
      .prepare(
        `
      SELECT id, imagePath FROM clips 
      ORDER BY createdAt DESC 
      LIMIT -1 OFFSET 50
    `,
      )
      .all();

    toDelete.forEach((item) => {
      if (item.imagePath && fs.existsSync(item.imagePath)) {
        fs.unlinkSync(item.imagePath);
      }
    });

    db.prepare(
      `
      DELETE FROM clips 
      WHERE id IN (
        SELECT id FROM clips 
        ORDER BY createdAt DESC 
        LIMIT -1 OFFSET 50
      )
    `,
    ).run();

    console.log(`Cleaned up ${toDelete.length} old entries`);
  }
};

module.exports = { saveText, saveImage, getHistory, clearAll, enforceLimit };
