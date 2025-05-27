# Kurulum

## React + Node.js Projesini Sunucuda Yayınlama (https/docs altında)

### 1. React (Frontend) – Production Build ve Yayınlama

#### a) Production Build Alın
```bash
cd frontend
npm install
npm run build
```
- Bu komutlar, `frontend/build` klasöründe statik dosyalarınızı (HTML, CSS, JS) oluşturur.

#### b) Build Klasörünü Sunucuya Kopyalayın
- Build klasörünün içeriğini sunucunuzdaki `https/docs` dizinine kopyalayın:
```bash
# Örnek: build içeriğini doğrudan sunucuya kopyalama
scp -r build/* sunucu_kullanici@sunucu_ip:/path/to/https/docs/
```
veya sunucuda:
```bash
cp -r frontend/build/* /var/www/https/docs/
```

#### c) Sunucu (Web Server) Ayarları
- Web sunucunuzun (Nginx/Apache) kök dizini `/https/docs` olmalı.
- SPA (Single Page Application) için 404 durumunda `index.html`'e yönlendirme yapılmalı.

**Nginx için örnek:**
```nginx
location / {
    root /var/www/https/docs;
    try_files $uri /index.html;
}
```

**Apache için örnek (.htaccess):**
```
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

### 2. Node.js (Backend) – API Sunucusu

#### a) Node.js ve Gerekli Paketler
Sunucuda Node.js ve npm kurulu olmalı:
```bash
cd backend
npm install
```

#### b) Backend'i Çalıştırma
```bash
node server.js
```
veya arka planda:
```bash
nohup node server.js &
```
veya pm2 ile:
```bash
npm install -g pm2
pm2 start server.js --name katalog-backend
```

#### c) API Reverse Proxy (Opsiyonel)
Frontend ve backend farklı portlarda ise, reverse proxy ile `/api` isteklerini backend'e yönlendirin.

**Nginx örneği:**
```nginx
location /api/ {
    proxy_pass http://localhost:4000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```
Backend endpointlerinizi `/api` ile başlatmak iyi bir pratiktir.

---

### 3. HTTPS ile Yayınlama

- Sunucunuzda SSL sertifikası (Let's Encrypt veya başka bir CA) kurulu olmalı.
- Nginx veya Apache ile HTTPS'yi aktif edin.

**Nginx örneği:**
```nginx
server {
    listen 443 ssl;
    server_name senindomain.com;

    ssl_certificate /etc/letsencrypt/live/senindomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/senindomain.com/privkey.pem;

    root /var/www/https/docs;
    # ... diğer ayarlar ...
}
```

---

### 4. Özet Akış

1. React build'i alın, `https/docs` dizinine kopyalayın.
2. Backend'i sunucuda çalıştırın.
3. Web sunucusu (Nginx/Apache) ayarlarını yapın:
   - Kök dizin: `/https/docs`
   - SPA fallback: `index.html`
   - API reverse proxy (gerekirse)
   - HTTPS aktif

---

### 5. Faydalı Notlar

- **CORS:** Frontend ve backend farklı portlarda ise, backend'de CORS ayarlarını açık tutun.
- **Ortak Sunucu:** Eğer hem frontend hem backend aynı sunucuda ise, reverse proxy ile `/api` isteklerini backend'e yönlendirmek en temiz yoldur.
- **Güncelleme:** Yeni bir build aldığınızda sadece `build` klasörünü tekrar kopyalamanız yeterli.
- **Güvenlik:** Sunucunuzun güvenlik duvarı ve SSL ayarlarını kontrol edin.

---

Daha fazla detay veya sunucuya özel (Linux/Windows, Nginx/Apache, domain, port, klasör yapısı vs.) örnek konfigürasyonlar için bana sunucu ortamınızı belirtmeniz yeterli! 