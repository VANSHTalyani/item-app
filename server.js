require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, 'public')));

// Database
const DB_PATH = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    cover_image TEXT NOT NULL,
    additional_images TEXT
  )`);
});

// Routes
app.get('/api/items', (req, res) => {
  db.all('SELECT * FROM items', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const items = rows.map(r => ({
      ...r,
      additional_images: r.additional_images ? JSON.parse(r.additional_images) : [],
    }));
    res.json(items);
  });
});

// Send enquiry email
app.post('/api/enquire', express.json(), async (req, res) => {
  const { itemId, email } = req.body;
  if (!itemId || !email) return res.status(400).json({ error: 'Missing fields' });
  db.get('SELECT * FROM items WHERE id=?', [itemId], async (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Item not found' });
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE !== 'false',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    try {
      await transporter.sendMail({
        from: email,
        to: 'info@example.com',
        subject: `Enquiry about ${row.name}`,
        text: `User ${email} is interested in item ${row.name} (ID ${itemId}).`,
      });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Email failed' });
    }
  });
});

app.post('/api/items', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 10 },
]), (req, res) => {
  try {
    const { itemName, itemType, itemDescription } = req.body;
    if (!itemName || !itemType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const coverImage = req.files['coverImage'][0].filename;
    const additionalImages = (req.files['additionalImages'] || []).map(f => f.filename);

    db.run(
      `INSERT INTO items(name, type, description, cover_image, additional_images) VALUES(?,?,?,?,?)`,
      [itemName, itemType, itemDescription, coverImage, JSON.stringify(additionalImages)],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        const newItem = {
          id: this.lastID,
          name: itemName,
          type: itemType,
          description: itemDescription,
          cover_image: coverImage,
          additional_images: additionalImages,
        };
        res.json(newItem);
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
