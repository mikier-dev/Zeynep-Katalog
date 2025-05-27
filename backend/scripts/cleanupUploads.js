const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const TEMP_DIR = path.join(__dirname, '../uploads/temp');
const MAX_AGE_HOURS = 24; // 24 saatten eski dosyaları temp'e taşı
const TEMP_MAX_AGE_DAYS = 7; // 7 günden eski temp dosyalarını sil

// Temp klasörünü oluştur (eğer yoksa)
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Katalogda kullanılan görselleri kontrol et
function getUsedImages() {
    try {
        const catalogPath = path.join(__dirname, '../../src/pages/Catalog.js');
        const catalogContent = fs.readFileSync(catalogPath, 'utf8');
        
        // Görsel URL'lerini bul
        const imageUrls = new Set();
        
        // Thumbnail ve renk görsellerini bul
        const thumbnailRegex = /thumbnail:\s*["']([^"']+)["']/g;
        const imagesRegex = /images:\s*\[([^\]]+)\]/g;
        
        let match;
        while ((match = thumbnailRegex.exec(catalogContent)) !== null) {
            imageUrls.add(match[1]);
        }
        
        while ((match = imagesRegex.exec(catalogContent)) !== null) {
            const urls = match[1].split(',').map(url => url.trim().replace(/["']/g, ''));
            urls.forEach(url => imageUrls.add(url));
        }
        
        return imageUrls;
    } catch (error) {
        console.error('Katalog dosyası okunamadı:', error);
        return new Set();
    }
}

function moveToTemp(filePath) {
    const fileName = path.basename(filePath);
    const tempPath = path.join(TEMP_DIR, fileName);
    
    try {
        fs.renameSync(filePath, tempPath);
        console.log(`Taşındı: ${fileName} -> temp klasörüne`);
    } catch (error) {
        console.error(`Dosya taşıma hatası (${fileName}):`, error);
    }
}

function cleanupUploads() {
    console.log('Uploads klasörü temizleniyor...');
    
    try {
        // Katalogda kullanılan görselleri al
        const usedImages = getUsedImages();
        
        // Ana uploads klasöründeki dosyaları kontrol et
        const files = fs.readdirSync(UPLOADS_DIR);
        const now = Date.now();
        
        files.forEach(file => {
            // temp klasörünü atla
            if (file === 'temp') return;
            
            const filePath = path.join(UPLOADS_DIR, file);
            const stats = fs.statSync(filePath);
            const fileAge = (now - stats.mtime.getTime()) / (1000 * 60 * 60); // Saat cinsinden yaş
            
            // Dosya katalogda kullanılıyor mu kontrol et
            const fileUrl = `http://localhost:4000/uploads/${file}`;
            const isUsed = Array.from(usedImages).some(url => url.includes(file));
            
            if (fileAge > MAX_AGE_HOURS && !isUsed) {
                moveToTemp(filePath);
            } else if (isUsed) {
                console.log(`Korundu: ${file} (katalogda kullanılıyor)`);
            }
        });
        
        // Temp klasöründeki eski dosyaları temizle
        const tempFiles = fs.readdirSync(TEMP_DIR);
        tempFiles.forEach(file => {
            const filePath = path.join(TEMP_DIR, file);
            const stats = fs.statSync(filePath);
            const fileAge = (now - stats.mtime.getTime()) / (1000 * 60 * 60 * 24); // Gün cinsinden yaş
            
            if (fileAge > TEMP_MAX_AGE_DAYS) {
                fs.unlinkSync(filePath);
                console.log(`Silindi (temp): ${file} (${Math.round(fileAge)} gün eski)`);
            }
        });
        
        console.log('Temizleme işlemi tamamlandı.');
    } catch (error) {
        console.error('Temizleme sırasında hata oluştu:', error);
    }
}

// Script doğrudan çalıştırıldığında temizleme işlemini başlat
if (require.main === module) {
    cleanupUploads();
}

module.exports = cleanupUploads; 