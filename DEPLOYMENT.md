# Yayına Alma (Deployment) Rehberi

Bu rehber, ayakkabı katalog projesini (React frontend + Node.js backend) bir web sunucusunda yayına almak için adım adım talimatlar içerir.

## 1. Proje Yapısı

```
/your-project-root
  /backend         # Node.js/Express sunucusu
    server.js
    uploads/
  /frontend        # React uygulaması
    src/
    public/
    ...
```

## 2. Gerekli Kurulumlar

- Node.js (v16+ önerilir)
- npm veya yarn

## 3. Backend (Sunucu) Kurulumu

1. `backend` klasörüne girin:
   ```bash
   cd backend
   npm install
   ```
2. `uploads` klasörünün var olduğundan emin olun:
   ```bash
   mkdir uploads
   ```
3. Sunucuyu başlatın:
   ```bash
   node server.js
   ```
   (Geliştirme için: `nodemon server.js` de kullanabilirsiniz.)

> **Not:** Sunucu varsayılan olarak `http://localhost:4000` adresinde çalışır. Gerçek sunucuda portu ve hostu değiştirmek için `server.js` dosyasını düzenleyebilirsiniz.

## 4. Frontend (React) Kurulumu ve Build

1. `frontend` klasörüne girin:
   ```bash
   cd ../frontend
   npm install
   ```
2. Üretim (production) için derleme yapın:
   ```bash
   npm run build
   ```
   Bu işlem sonunda `frontend/build` klasörü oluşur.

## 5. Statik Dosya Sunumu

- React build çıktısını Express sunucusundan sunmak için, `server.js` dosyanıza şunu ekleyin:

```js
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
```

- Artık hem API hem de React uygulaması aynı porttan sunulabilir.

## 6. Ortam Değişkenleri (Environment Variables)

- Gerekirse `.env` dosyası ile port, upload klasörü gibi ayarları özelleştirebilirsiniz.
- Örnek `.env`:
  ```env
  PORT=4000
  UPLOAD_DIR=uploads
  ```

## 7. Güvenlik ve Ekstra İpuçları

- `uploads/` klasörüne sadece resim dosyası yüklenmesine izin verin (multer ayarları ile).
- Sunucuyu bir reverse proxy (örn. Nginx) arkasında çalıştırmak daha güvenlidir.
- HTTPS kullanın.
- Admin şifresini güçlü tutun ve paylaşmayın.
- Yedeklemeleri unutmayın!

## 8. Sunucuya Yükleme

- Dosyaları sunucuya (örn. DigitalOcean, AWS, VDS, CPanel) FTP/SFTP ile yükleyin.
- Sunucuda yukarıdaki adımları uygulayın.
- Gerekirse process manager (örn. pm2) ile Node.js sunucusunu arka planda çalıştırın:
  ```bash
  npm install -g pm2
  pm2 start server.js
  ```

---

Herhangi bir hata veya sorunda bana danışabilirsiniz! 

# Deployment Kılavuzu

Bu kılavuz, Ayakkabı Kataloğu uygulamasını production ortamına deploy etme adımlarını içerir.

## 🚀 Hızlı Başlangıç

### 1. Gereksinimler

- Node.js (v16 veya üzeri)
- npm veya yarn
- Git
- Bir web sunucusu (örn. Nginx, Apache)
- SSL sertifikası (önerilen)

### 2. Production Build

```bash
# Bağımlılıkları yükleyin
npm install

# Production build oluşturun
npm run build
```

Build işlemi tamamlandığında, `dist` klasöründe production-ready dosyalar oluşturulacaktır.

## 🏗️ Deployment Seçenekleri

### A. Statik Hosting (Netlify, Vercel, GitHub Pages)

1. **Netlify ile Deployment**
   ```bash
   # Netlify CLI'ı yükleyin
   npm install -g netlify-cli

   # Netlify'a giriş yapın
   netlify login

   # Projeyi deploy edin
   netlify deploy --prod
   ```

2. **Vercel ile Deployment**
   ```bash
   # Vercel CLI'ı yükleyin
   npm install -g vercel

   # Projeyi deploy edin
   vercel --prod
   ```

3. **GitHub Pages ile Deployment**
   ```bash
   # gh-pages paketini yükleyin
   npm install --save-dev gh-pages

   # package.json'a deploy script'i ekleyin
   "scripts": {
     "deploy": "gh-pages -d dist"
   }

   # Deploy edin
   npm run deploy
   ```

### B. Kendi Sunucunuzda Hosting

1. **Nginx Kurulumu**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/ayakkabi-katalogu;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Gzip sıkıştırma
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   }
   ```

2. **Apache Kurulumu**
   ```apache
   <VirtualHost *:80>
       ServerName your-domain.com
       DocumentRoot /var/www/ayakkabi-katalogu

       <Directory /var/www/ayakkabi-katalogu>
           Options -Indexes +FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>

       ErrorLog ${APACHE_LOG_DIR}/error.log
       CustomLog ${APACHE_LOG_DIR}/access.log combined
   </VirtualHost>
   ```

## 🔒 SSL Kurulumu

### Let's Encrypt ile SSL

```bash
# Certbot kurulumu
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# SSL sertifikası alın
sudo certbot --nginx -d your-domain.com
```

## 📦 Dosya Yapısı

```
/var/www/ayakkabi-katalogu/
├── index.html
├── assets/
│   ├── js/
│   ├── css/
│   └── images/
└── .htaccess (Apache için)
```

## 🔄 Otomatik Deployment

### GitHub Actions ile CI/CD

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install Dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Deploy
        run: |
          # Deployment komutlarınız
```

## 🛠️ Performans Optimizasyonu

1. **Nginx Optimizasyonu**
   ```nginx
   # Gzip sıkıştırma
   gzip on;
   gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   gzip_min_length 1000;
   gzip_comp_level 6;

   # Browser caching
   location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
       expires 1y;
       add_header Cache-Control "public, no-transform";
   }
   ```

2. **Apache Optimizasyonu**
   ```apache
   # Enable compression
   <IfModule mod_deflate.c>
       AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css text/javascript application/xml application/xhtml+xml application/rss+xml application/javascript application/x-javascript
   </IfModule>

   # Browser caching
   <IfModule mod_expires.c>
       ExpiresActive On
       ExpiresByType image/jpg "access plus 1 year"
       ExpiresByType image/jpeg "access plus 1 year"
       ExpiresByType image/gif "access plus 1 year"
       ExpiresByType image/png "access plus 1 year"
       ExpiresByType text/css "access plus 1 month"
       ExpiresByType application/javascript "access plus 1 month"
   </IfModule>
   ```

## 🔍 Monitoring ve Logging

1. **Nginx Logging**
   ```nginx
   access_log /var/log/nginx/ayakkabi-katalogu.access.log;
   error_log /var/log/nginx/ayakkabi-katalogu.error.log;
   ```

2. **Apache Logging**
   ```apache
   ErrorLog ${APACHE_LOG_DIR}/ayakkabi-katalogu-error.log
   CustomLog ${APACHE_LOG_DIR}/ayakkabi-katalogu-access.log combined
   ```

## 🚨 Troubleshooting

1. **404 Hataları**
   - `.htaccess` dosyasının doğru yapılandırıldığından emin olun
   - Nginx için `try_files` direktifini kontrol edin

2. **SSL Hataları**
   - Sertifika yollarını kontrol edin
   - Sertifika süresinin dolmadığından emin olun

3. **Performans Sorunları**
   - Gzip sıkıştırmanın aktif olduğunu kontrol edin
   - Browser caching ayarlarını kontrol edin
   - Sunucu kaynaklarını (CPU, RAM) kontrol edin

## 📞 Destek

Deployment ile ilgili sorunlar için:
1. GitHub Issues üzerinden bildirim yapın
2. E-posta ile iletişime geçin
3. Dokümantasyonu kontrol edin 