const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const cleanupUploads = require('./scripts/cleanupUploads');
const fs = require('fs');

const app = express();
const PORT = 4000;

// CORS ayarı (React frontend'den erişim için)
app.use(cors());

// Türkçe karakterleri Latin harflerine çeviren fonksiyon
function toSafeFileName(filename) {
  const trMap = {
    'ç':'c','Ç':'C','ğ':'g','Ğ':'G','ı':'i','İ':'I','ö':'o','Ö':'O','ş':'s','Ş':'S','ü':'u','Ü':'U'
  };
  // Türkçe karakterleri dönüştür
  let out = filename.replace(/[çÇğĞıİöÖşŞüÜ]/g, c => trMap[c] || c);
  // Güvenli karakterlere çevir
  out = out.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  return out;
}

// Yüklenen dosyaların saklanacağı klasör ve isim ayarı
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Dosya adını sadece orijinal haliyle kaydet, Türkçe karakterleri dönüştür
    const safeOriginalName = toSafeFileName(file.originalname);
    const filePath = path.join('uploads', safeOriginalName);
    // Eğer aynı isimde dosya varsa, sonuna sayı ekle
    if (fs.existsSync(filePath)) {
      const ext = path.extname(safeOriginalName);
      const baseName = path.basename(safeOriginalName, ext);
      let counter = 1;
      while (fs.existsSync(path.join('uploads', `${baseName}_${counter}${ext}`))) {
        counter++;
      }
      cb(null, `${baseName}_${counter}${ext}`);
    } else {
      cb(null, safeOriginalName);
    }
  }
});
const upload = multer({ storage });

// Yüklenen dosyaları statik olarak sunmak için ve CORS header ekle
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Dosya yükleme endpoint'i
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Dosya yüklenemedi.' });
  }
  // Yüklenen dosyanın erişim URL'si
  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Her 24 saatte bir uploads klasörünü temizle
setInterval(cleanupUploads, 24 * 60 * 60 * 1000);

// Server başlatıldığında ilk temizleme işlemini yap
cleanupUploads();

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});