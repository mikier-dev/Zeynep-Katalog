import React, { useState, useEffect, useRef } from 'react';

const ADMIN_USER = 'admin';
const DEFAULT_PASS = 'katalog123';
const UPLOAD_URL = 'http://localhost:4000/upload';

function getShoesData() {
  const stored = localStorage.getItem('shoesData');
  if (stored) return JSON.parse(stored);
  return [];
}

function getCategoriesData() {
  const stored = localStorage.getItem('categoriesData');
  if (stored) return JSON.parse(stored);
  return ['Spor', 'Klasik', 'Bot', 'Sandalet'];
}

// Basit SHA-256 hash fonksiyonu
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [shoes, setShoes] = useState(getShoesData());
  const [categories, setCategories] = useState(getCategoriesData());
  const [newCategory, setNewCategory] = useState('');
  const [editCategoryIndex, setEditCategoryIndex] = useState(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');

  const [newShoe, setNewShoe] = useState({
    name: '',
    description: '',
    thumbnail: '',
    category: '',
    colors: [{ name: '', colorCode: '#000000', images: [''] }]
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success'|'error'|'info', message: string }

  // Şifre değiştirme için
  const [showChangePass, setShowChangePass] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newPass2, setNewPass2] = useState('');

  // Her görsel için ref'leri tut
  const imageRefs = useRef({});

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('isAdminLoggedIn') === 'true');
    setShoes(getShoesData());
    setCategories(getCategoriesData());
    const onStorage = () => {
      setShoes(getShoesData());
      setCategories(getCategoriesData());
    };
    window.addEventListener('storage', onStorage);
    // Şifre hash yoksa default olarak ayarla
    if (!localStorage.getItem('adminPassHash')) {
      hashPassword(DEFAULT_PASS).then(hash => localStorage.setItem('adminPassHash', hash));
    }
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    localStorage.setItem('shoesData', JSON.stringify(shoes));
  }, [shoes]);

  useEffect(() => {
    localStorage.setItem('categoriesData', JSON.stringify(categories));
  }, [categories]);

  // Toast otomatik kapanma
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

  // Giriş
  const handleLogin = async (e) => {
    e.preventDefault();
    if (loginData.username !== ADMIN_USER) {
      setLoginError('Kullanıcı adı hatalı!');
      showToast('error', 'Kullanıcı adı hatalı!');
      return;
    }
    const hash = await hashPassword(loginData.password);
    const storedHash = localStorage.getItem('adminPassHash');
    if (hash === storedHash) {
      setIsLoggedIn(true);
      setLoginError('');
      localStorage.setItem('isAdminLoggedIn', 'true');
      // Storage event'ini tetikle
      window.dispatchEvent(new Event('storage'));
      showToast('success', 'Başarıyla giriş yapıldı!');
    } else {
      setLoginError('Şifre hatalı!');
      showToast('error', 'Şifre hatalı!');
    }
  };

  // Şifre değiştir
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPass || !newPass || !newPass2) {
      showToast('error', 'Tüm alanları doldurun!');
      return;
    }
    if (newPass !== newPass2) {
      showToast('error', 'Yeni şifreler eşleşmiyor!');
      return;
    }
    const oldHash = await hashPassword(oldPass);
    const storedHash = localStorage.getItem('adminPassHash');
    if (oldHash !== storedHash) {
      showToast('error', 'Eski şifre yanlış!');
      return;
    }
    const newHash = await hashPassword(newPass);
    localStorage.setItem('adminPassHash', newHash);
    setShowChangePass(false);
    setOldPass(''); setNewPass(''); setNewPass2('');
    showToast('success', 'Şifre başarıyla değiştirildi!');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isAdminLoggedIn');
    // Storage event'ini tetikle
    window.dispatchEvent(new Event('storage'));
    showToast('info', 'Çıkış yapıldı.');
  };

  // File upload helper
  const uploadFile = async (file) => {
    setUploading(true);
    setUploadError('');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setUploading(false);
      if (data.url) return data.url;
      setUploadError('Yükleme başarısız.');
      showToast('error', 'Görsel yüklenemedi!');
      return '';
    } catch (err) {
      setUploading(false);
      setUploadError('Yükleme başarısız.');
      showToast('error', 'Görsel yüklenemedi!');
      return '';
    }
  };

  // Thumbnail upload
  const handleThumbnailFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) setNewShoe((prev) => ({ ...prev, thumbnail: url }));
  };

  // Tıklanan pikselin rengini almak için (sadece tıklama event'i ile)
  const handleImageClick = (colorIndex, imageIndex, event) => {
    const img = imageRefs.current[`${colorIndex}-${imageIndex}`];
    if (!img || !img.complete || img.naturalWidth === 0) {
      showToast('error', 'Görsel tam yüklenmeden renk seçilemez!');
      return;
    }
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const rect = img.getBoundingClientRect();
      const x = Math.round((event.clientX - rect.left) * (img.naturalWidth / rect.width));
      const y = Math.round((event.clientY - rect.top) * (img.naturalHeight / rect.height));
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hexColor = rgbToHex(pixel[0], pixel[1], pixel[2]);
      handleColorChange(colorIndex, 'colorCode', hexColor);
    } catch (err) {
      showToast('error', 'Renk seçilemedi. (CORS veya görsel formatı hatası)');
    }
  };

  // Otomatik renk çıkarma (baskın renk)
  const handleAutoColorFromImage = (colorIndex, imageIndex) => {
    const img = imageRefs.current[`${colorIndex}-${imageIndex}`];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      // Görselin ortasından bir piksel al (veya ColorThief ile baskın renk de alınabilir)
      const pixel = ctx.getImageData(Math.floor(img.naturalWidth/2), Math.floor(img.naturalHeight/2), 1, 1).data;
      const hexColor = rgbToHex(pixel[0], pixel[1], pixel[2]);
      handleColorChange(colorIndex, 'colorCode', hexColor);
    } catch (err) {}
  };

  // RGB'den HEX'e dönüştürme
  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  // Görsel URL'si değiştiğinde otomatik renk çıkar
  const handleImageChange = (colorIndex, imageIndex, e) => {
    const value = e.target.value;
    setNewShoe((prev) => ({
      ...prev,
      colors: prev.colors.map((color, i) =>
        i === colorIndex
          ? {
              ...color,
              images: color.images.map((img, j) =>
                j === imageIndex ? value : img
              ),
            }
          : color
      ),
    }));
    // URL değiştiğinde otomatik renk çıkar (event yok)
    setTimeout(() => handleAutoColorFromImage(colorIndex, imageIndex), 200);
  };

  // Görsel yüklenince otomatik renk çıkar
  const handleColorImageFile = async (colorIndex, imageIndex, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) {
      setNewShoe((prev) => ({
        ...prev,
        colors: prev.colors.map((color, i) =>
          i === colorIndex
            ? {
                ...color,
                images: color.images.map((img, j) =>
                  j === imageIndex ? url : img
                ),
              }
            : color
        ),
      }));
      // Görsel yüklendikten sonra otomatik renk çıkar (event yok)
      setTimeout(() => handleAutoColorFromImage(colorIndex, imageIndex), 200);
      showToast('success', 'Görsel başarıyla yüklendi!');
    }
  };

  const addColor = () => {
    setNewShoe((prev) => ({
      ...prev,
      colors: [...prev.colors, { name: '', colorCode: '#000000', images: [''] }],
    }));
  };

  const addImage = (colorIndex) => {
    setNewShoe((prev) => ({
      ...prev,
      colors: prev.colors.map((color, index) =>
        index === colorIndex
          ? { ...color, images: [...color.images, ''] }
          : color
      ),
    }));
  };

  const handleColorChange = (index, field, value) => {
    setNewShoe((prev) => ({
      ...prev,
      colors: prev.colors.map((color, i) =>
        i === index ? { ...color, [field]: value } : color
      ),
    }));
  };

  // Silme
  const handleDelete = (id) => {
    if (window.confirm('Bu ayakkabıyı silmek istediğinize emin misiniz?')) {
      const updatedShoes = getShoesData().filter((shoe) => shoe.id !== id);
      localStorage.setItem('shoesData', JSON.stringify(updatedShoes));
      setShoes(updatedShoes);
      if (editId === id) {
        setEditId(null);
        setNewShoe({
          name: '',
          description: '',
          thumbnail: '',
          category: '',
          colors: [{ name: '', colorCode: '#000000', images: [''] }],
        });
      }
      showToast('success', 'Ayakkabı başarıyla silindi!');
    }
  };

  // Düzenleme
  const handleEdit = (shoe) => {
    setEditId(shoe.id);
    setNewShoe({
      name: shoe.name,
      description: shoe.description,
      thumbnail: shoe.thumbnail,
      category: shoe.category,
      colors: JSON.parse(JSON.stringify(shoe.colors)), // deep copy
    });
    showToast('info', 'Düzenleme moduna geçildi.');
  };

  // Ekle/Güncelle
  const handleSubmit = (e) => {
    e.preventDefault();
    // Boş görsel alanlarını temizle
    let cleanedShoe = {
      ...newShoe,
      colors: newShoe.colors.map(color => ({
        ...color,
        images: color.images.filter(img => img.trim() !== '')
      }))
    };
    // Küçük resim boşsa, ilk eklenen görseli otomatik ata
    if (!cleanedShoe.thumbnail) {
      const firstImage = cleanedShoe.colors.find(c => c.images.length > 0 && c.images[0])?.images[0] || '';
      cleanedShoe.thumbnail = firstImage;
    }
    if (editId) {
      // Güncelle
      const updatedShoes = getShoesData().map((shoe) =>
        shoe.id === editId ? { ...cleanedShoe, id: editId } : shoe
      );
      localStorage.setItem('shoesData', JSON.stringify(updatedShoes));
      setShoes(updatedShoes);
      setEditId(null);
      showToast('success', 'Ayakkabı başarıyla güncellendi!');
    } else {
      // Ekle
      const updatedShoes = [...getShoesData(), { ...cleanedShoe, id: Date.now() }];
      localStorage.setItem('shoesData', JSON.stringify(updatedShoes));
      setShoes(updatedShoes);
      showToast('success', 'Ayakkabı başarıyla eklendi!');
    }
    setNewShoe({
      name: '',
      description: '',
      thumbnail: '',
      category: '',
      colors: [{ name: '', colorCode: '#000000', images: [''] }],
    });
  };

  // Kategori ekle
  const handleAddCategory = (e) => {
    e.preventDefault();
    const val = newCategory.trim();
    if (!val) return;
    if (categories.includes(val)) {
      showToast('error', 'Bu kategori zaten var!');
      return;
    }
    setCategories([...categories, val]);
    setNewCategory('');
    showToast('success', 'Kategori eklendi!');
  };

  // Kategori sil
  const handleDeleteCategory = (idx) => {
    if (window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) {
      const updated = categories.filter((_, i) => i !== idx);
      setCategories(updated);
      showToast('success', 'Kategori silindi!');
      // Eğer silinen kategori seçiliyse, ayakkabı formunu sıfırla
      if (newShoe.category === categories[idx]) {
        setNewShoe((prev) => ({ ...prev, category: '' }));
      }
    }
  };

  // Kategori düzenle
  const handleEditCategory = (idx) => {
    setEditCategoryIndex(idx);
    setEditCategoryValue(categories[idx]);
  };

  const handleSaveEditCategory = () => {
    if (!editCategoryValue.trim()) return;
    if (categories.includes(editCategoryValue.trim())) {
      showToast('error', 'Bu kategori zaten var!');
      return;
    }
    const updated = categories.map((cat, i) =>
      i === editCategoryIndex ? editCategoryValue.trim() : cat
    );
    setCategories(updated);
    // Ayakkabı formunda eski kategori seçiliyse, yenisiyle değiştir
    if (newShoe.category === categories[editCategoryIndex]) {
      setNewShoe((prev) => ({ ...prev, category: editCategoryValue.trim() }));
    }
    setEditCategoryIndex(null);
    setEditCategoryValue('');
    showToast('success', 'Kategori güncellendi!');
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Girişi</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
            <input
              type="text"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Şifre</label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          {loginError && <div className="text-red-600 text-sm">{loginError}</div>}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white text-center transition-all
          ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}
        >
          {toast.message}
        </div>
      )}
      {/* Şifre Değiştir */}
      <div className="mb-8 flex justify-end">
        <button onClick={() => setShowChangePass(v => !v)} className="text-indigo-600 underline">Şifre Değiştir</button>
      </div>
      {showChangePass && (
        <form onSubmit={handleChangePassword} className="mb-8 bg-gray-50 p-4 rounded shadow flex flex-col gap-3 max-w-md mx-auto">
          <h3 className="font-bold mb-2">Şifre Değiştir</h3>
          <input type="password" placeholder="Eski şifre" value={oldPass} onChange={e => setOldPass(e.target.value)} className="border rounded px-2 py-1" />
          <input type="password" placeholder="Yeni şifre" value={newPass} onChange={e => setNewPass(e.target.value)} className="border rounded px-2 py-1" />
          <input type="password" placeholder="Yeni şifre (tekrar)" value={newPass2} onChange={e => setNewPass2(e.target.value)} className="border rounded px-2 py-1" />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-1 rounded">Kaydet</button>
        </form>
      )}
      {/* Kategori Yönetimi */}
      <div className="mb-8 bg-gray-50 p-4 rounded shadow">
        <h3 className="text-lg font-bold mb-2">Kategori Yönetimi</h3>
        <form onSubmit={handleAddCategory} className="flex gap-2 mb-2">
          <input
            type="text"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            className="border rounded px-2 py-1 flex-1"
            placeholder="Yeni kategori adı"
          />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-1 rounded">Ekle</button>
        </form>
        <ul className="flex flex-wrap gap-2">
          {categories.map((cat, idx) => (
            <li key={cat} className="flex items-center gap-1 bg-white px-3 py-1 rounded shadow text-sm">
              {editCategoryIndex === idx ? (
                <>
                  <input
                    type="text"
                    value={editCategoryValue}
                    onChange={e => setEditCategoryValue(e.target.value)}
                    className="border rounded px-1 py-0.5 text-sm"
                  />
                  <button onClick={handleSaveEditCategory} className="text-green-600 font-bold">Kaydet</button>
                  <button onClick={() => { setEditCategoryIndex(null); setEditCategoryValue(''); }} className="text-gray-500">İptal</button>
                </>
              ) : (
                <>
                  <span>{cat}</span>
                  <button onClick={() => handleEditCategory(idx)} className="text-yellow-600">Düzenle</button>
                  <button onClick={() => handleDeleteCategory(idx)} className="text-red-600">Sil</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{editId ? 'Ayakkabıyı Düzenle' : 'Yeni Ayakkabı Ekle'}</h2>
        <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Çıkış Yap</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Model Adı
          </label>
          <input
            type="text"
            value={newShoe.name}
            onChange={(e) => setNewShoe((prev) => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Açıklama
          </label>
          <textarea
            value={newShoe.description}
            onChange={(e) => setNewShoe((prev) => ({ ...prev, description: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows="3"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Küçük Resim URL veya Yükle
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={newShoe.thumbnail}
              onChange={(e) => setNewShoe((prev) => ({ ...prev, thumbnail: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="URL veya yükleme sonrası otomatik dolar"
              required
            />
            <input type="file" accept="image/*" onChange={handleThumbnailFile} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Kategori
          </label>
          <select
            value={newShoe.category}
            onChange={e => setNewShoe((prev) => ({ ...prev, category: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="" disabled>Kategori seçin</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Renkler</h3>
            <button
              type="button"
              onClick={addColor}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Renk Ekle
            </button>
          </div>

          {newShoe.colors.map((color, colorIndex) => (
            <div key={colorIndex} className="mb-6 p-4 border rounded-md">
              <div className="mb-4 flex gap-4 items-center">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Renk Adı
                  </label>
                  <input
                    type="text"
                    value={color.name}
                    onChange={(e) => handleColorChange(colorIndex, 'name', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Renk Seç</label>
                  <input
                    type="color"
                    value={color.colorCode}
                    onChange={(e) => handleColorChange(colorIndex, 'colorCode', e.target.value)}
                    className="w-10 h-10 p-0 border-0 bg-transparent"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Görseller (URL veya Yükle)
                  </label>
                  <button
                    type="button"
                    onClick={() => addImage(colorIndex)}
                    className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Görsel Ekle
                  </button>
                </div>

                {color.images.map((image, imageIndex) => (
                  <div key={imageIndex} className="flex gap-2 items-center mb-2">
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => handleImageChange(colorIndex, imageIndex, e)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Görsel URL veya yükleme sonrası otomatik dolar"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleColorImageFile(colorIndex, imageIndex, e)}
                    />
                    {image && (
                      <div className="relative" style={{ maxWidth: 80, maxHeight: 80 }}>
                        <img
                          ref={el => imageRefs.current[`${colorIndex}-${imageIndex}`] = el}
                          src={image}
                          alt={`Renk ${colorIndex + 1} - Görsel ${imageIndex + 1}`}
                          className="max-w-[80px] max-h-[80px] object-contain rounded cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={e => handleImageClick(colorIndex, imageIndex, e)}
                          title="Renk seçmek için tıklayın"
                          crossOrigin="anonymous"
                        />
                        <div
                          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-50 text-white text-xs"
                          style={{ pointerEvents: 'none' }}
                        >
                          Renk seç
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {uploading && <div className="text-blue-600">Yükleniyor...</div>}
        {uploadError && <div className="text-red-600">{uploadError}</div>}

        <button
          type="submit"
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {editId ? 'Güncelle' : 'Ayakkabı Ekle'}
        </button>
      </form>
      {/* Mevcut Ayakkabılar Listesi */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Mevcut Ayakkabılar</h2>
        <div className="grid grid-cols-1 gap-4">
          {shoes.map((shoe) => (
            <div key={shoe.id} className="bg-white p-4 rounded-md shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{shoe.name}</h3>
                <p className="text-gray-600">{shoe.description}</p>
                <div className="mt-2">
                  <span className="text-sm font-medium">Renkler: </span>
                  {shoe.colors.map((color, index) => (
                    <span key={index} className="text-sm text-gray-500">
                      <span style={{ display: 'inline-block', width: 16, height: 16, background: color.colorCode, borderRadius: '50%', marginRight: 4, border: '1px solid #ccc' }}></span>
                      {color.name}{index < shoe.colors.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
                <div className="mt-1 text-xs text-gray-400">Kategori: {shoe.category}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(shoe)} className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500">Düzenle</button>
                <button onClick={() => handleDelete(shoe.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Sil</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel; 