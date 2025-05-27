import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const sampleShoes = [
  {
    id: 1,
    name: "Nike Air Max 270",
    category: "Spor",
    description: "Günlük kullanım için rahat spor ayakkabı.",
    thumbnail: "https://images.unsplash.com/photo-1517260911205-8a3b66e07b64?auto=format&fit=crop&w=400&q=80",
    colors: [
      {
        name: "Siyah",
        colorCode: "#222",
        images: [
          "https://images.unsplash.com/photo-1517260911205-8a3b66e07b64?auto=format&fit=crop&w=600&q=80"
        ]
      },
      {
        name: "Beyaz",
        colorCode: "#fff",
        images: [
          "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=600&q=80"
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Adidas Stan Smith",
    category: "Klasik",
    description: "Zamansız klasik beyaz sneaker.",
    thumbnail: "https://images.unsplash.com/photo-1528701800484-905dffad3d04?auto=format&fit=crop&w=400&q=80",
    colors: [
      {
        name: "Beyaz/Yeşil",
        colorCode: "#eaeaea",
        images: [
          "https://images.unsplash.com/photo-1528701800484-905dffad3d04?auto=format&fit=crop&w=600&q=80"
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Timberland Bot",
    category: "Bot",
    description: "Dayanıklı ve su geçirmez bot.",
    thumbnail: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    colors: [
      {
        name: "Kahverengi",
        colorCode: "#a0522d",
        images: [
          "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80"
        ]
      }
    ]
  },
  {
    id: 4,
    name: "Birkenstock Sandalet",
    category: "Sandalet",
    description: "Yaz ayları için konforlu sandalet.",
    thumbnail: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80",
    colors: [
      {
        name: "Bej",
        colorCode: "#e5c29f",
        images: [
          "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80"
        ]
      }
    ]
  }
];

function getShoesData() {
  const stored = localStorage.getItem('shoesData');
  if (stored) return JSON.parse(stored);
  return sampleShoes;
}

function getCategories(shoes) {
  return [
    "Tümü",
    ...Array.from(new Set(shoes.map((shoe) => shoe.category)))
  ];
}

function getAllColors(shoes) {
  // Benzersiz renk isimleri ve kodları
  const colorMap = {};
  shoes.forEach((shoe) => {
    shoe.colors.forEach((color) => {
      colorMap[color.name] = color.colorCode;
    });
  });
  return ["Tümü", ...Object.entries(colorMap).map(([name, code]) => ({ name, code }))];
}

const SHOES_PER_PAGE = 9;

function ProductCard({ shoe, openGallery }) {
  const [colorIndex, setColorIndex] = useState(0);
  const colors = shoe.colors;
  const currentColor = colors[colorIndex] || colors[0];
  const hasMultipleColors = colors.length > 1;

  return (
    <div
      className="card-modern bg-white border border-[#e6f0f6] rounded-2xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl flex flex-col min-h-[420px] md:min-h-[480px] relative"
      onClick={() => openGallery(shoe, currentColor)}
      style={{ cursor: 'pointer' }}
    >
      <div className="relative group">
        <img
          src={currentColor.images && currentColor.images[0] ? currentColor.images[0] : shoe.thumbnail}
          alt={shoe.name}
          className="w-full h-56 sm:h-64 md:h-64 object-cover object-center transition-transform duration-300 group-hover:scale-110"
          style={{ background: '#fafdff' }}
        />
        <span className="absolute top-3 left-3 bg-[#7a944a] text-white text-xs px-3 py-1 rounded-full shadow font-semibold tracking-wide border border-[#e6f0f6]">{shoe.category}</span>
        {hasMultipleColors && (
          <>
            <button
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 hover:bg-[#7a944a] text-[#3b576b] hover:text-white rounded-full p-1 shadow z-10 border border-[#e6f0f6]"
              onClick={e => { e.stopPropagation(); setColorIndex((colorIndex - 1 + colors.length) % colors.length); }}
              title="Önceki renk"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 hover:bg-[#7a944a] text-[#3b576b] hover:text-white rounded-full p-1 shadow z-10 border border-[#e6f0f6]"
              onClick={e => { e.stopPropagation(); setColorIndex((colorIndex + 1) % colors.length); }}
              title="Sonraki renk"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: '#3b576b' }}>{shoe.name}</h3>
        <p className="text-gray-600 mb-4 flex-1 text-sm md:text-base">{shoe.description}</p>
        <div>
          <div className="text-sm font-medium text-gray-700 mb-1">Renkler:</div>
          <div className="flex gap-2 flex-wrap">
            {colors.map((color, idx) => (
              <button
                key={color.name}
                onClick={e => { e.stopPropagation(); setColorIndex(idx); }}
                className={`w-8 h-8 rounded-full border-2 border-[#e6f0f6] flex items-center justify-center transition-transform hover:scale-125 focus:outline-none ${idx === colorIndex ? 'ring-2 ring-[#7a944a] scale-110' : 'hover:border-[#7a944a]'}`}
                style={{ background: color.colorCode }}
                title={color.name}
              >
                <span className="sr-only">{color.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Model öneklerini çıkaran fonksiyon
function getModelPrefixes(shoes) {
  const prefixes = new Set();
  shoes.forEach((shoe) => {
    const match = shoe.name.match(/^(\d+)-/);
    if (match) prefixes.add(match[1]);
  });
  return ["Tümü", ...Array.from(prefixes).sort()];
}

function Catalog() {
  const [selectedShoe, setSelectedShoe] = useState(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [shoes, setShoes] = useState(getShoesData());
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [search, setSearch] = useState("");
  const [selectedPrefix, setSelectedPrefix] = useState("Tümü");
  const [page, setPage] = useState(1);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const topRef = useRef(null);

  useEffect(() => {
    const onStorage = () => setShoes(getShoesData());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const categories = getCategories(shoes);
  const modelPrefixes = getModelPrefixes(shoes);

  let filteredShoes = shoes;
  if (selectedCategory !== "Tümü") {
    filteredShoes = filteredShoes.filter((shoe) => shoe.category === selectedCategory);
  }
  if (selectedPrefix !== "Tümü") {
    filteredShoes = filteredShoes.filter((shoe) => shoe.name.startsWith(selectedPrefix + "-"));
  }
  if (search.trim() !== "") {
    filteredShoes = filteredShoes.filter((shoe) =>
      shoe.name.toLowerCase().includes(search.trim().toLowerCase())
    );
  }
  filteredShoes = filteredShoes.slice().sort((a, b) => {
    const numA = parseInt(a.name);
    const numB = parseInt(b.name);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    } else if (!isNaN(numA)) {
      return -1;
    } else if (!isNaN(numB)) {
      return 1;
    } else {
      return a.name.localeCompare(b.name, 'tr');
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredShoes.length / SHOES_PER_PAGE) || 1;
  const pagedShoes = filteredShoes.slice((page - 1) * SHOES_PER_PAGE, page * SHOES_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedPrefix, search, shoes]);

  // Gelişmiş galeri açıcı
  const openGallery = (shoe, color) => {
    setSelectedShoe(shoe);
    const colorIdx = shoe.colors.findIndex(c => c.name === color.name);
    setSelectedColorIndex(colorIdx === -1 ? 0 : colorIdx);
    setGalleryIndex(0);
    setIsGalleryOpen(true);
  };

  // Galeri ileri/geri (görsel ve renkler arası geçiş)
  const nextImage = () => {
    if (!selectedShoe || selectedColorIndex === null) return;
    const colors = selectedShoe.colors;
    const images = colors[selectedColorIndex].images;
    if (galleryIndex < images.length - 1) {
      setGalleryIndex(galleryIndex + 1);
    } else {
      // Son görseldeyiz, bir sonraki renge geç
      const nextColor = (selectedColorIndex + 1) % colors.length;
      setSelectedColorIndex(nextColor);
      setGalleryIndex(0);
    }
  };
  const prevImage = () => {
    if (!selectedShoe || selectedColorIndex === null) return;
    const colors = selectedShoe.colors;
    const images = colors[selectedColorIndex].images;
    if (galleryIndex > 0) {
      setGalleryIndex(galleryIndex - 1);
    } else {
      // İlk görseldeyiz, bir önceki renge geç
      const prevColor = (selectedColorIndex - 1 + colors.length) % colors.length;
      setSelectedColorIndex(prevColor);
      setGalleryIndex(colors[prevColor].images.length - 1);
    }
  };

  // Renk değiştir
  const selectColor = (idx) => {
    setSelectedColorIndex(idx);
    setGalleryIndex(0);
  };

  // Klavye ile kontrol
  useEffect(() => {
    if (!isGalleryOpen) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setIsGalleryOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isGalleryOpen, selectedShoe, selectedColorIndex]);

  const scrollToTop = () => {
    if (topRef.current) topRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={topRef}>
      {/* Hero Section */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a365d] mb-2 tracking-tight">Ayakkabı Kataloğu</h1>
        <p className="text-lg text-gray-600 mb-4">En yeni ve popüler modelleri keşfedin. Renk ve kategoriye göre filtreleyin, favori ayakkabınızı bulun!</p>
      </div>
      {/* Arama ve Filtreler */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Model adı ile ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg border border-[#e6f0f6] w-full md:w-64 min-w-[180px] focus:ring-2 focus:ring-[#7a944a] focus:border-transparent"
        />
        <div className="relative">
          <div className="flex gap-2 flex-nowrap overflow-x-auto pb-4 px-1 -mx-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full border whitespace-nowrap transition-colors duration-200 ${
                  selectedCategory === cat 
                    ? 'btn-main ring-2 ring-[#7a944a] scale-105' 
                    : 'bg-white text-[#3b576b] border-[#e6f0f6] hover:bg-[#fafdff]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
        </div>
        {/* Model önek filtresi */}
        <div className="relative">
          <div className="flex gap-2 flex-nowrap overflow-x-auto pb-4 px-1 -mx-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {modelPrefixes.map((prefix) => (
              <button
                key={prefix}
                onClick={() => setSelectedPrefix(prefix)}
                className={`px-4 py-2 rounded-full border whitespace-nowrap transition-colors duration-200 ${
                  selectedPrefix === prefix 
                    ? 'btn-accent ring-2 ring-[#3b576b] scale-105' 
                    : 'bg-white text-[#3b576b] border-[#e6f0f6] hover:bg-[#fafdff]'
                }`}
              >
                {prefix}
              </button>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {pagedShoes.map((shoe) => (
          <ProductCard
            key={shoe.id}
            shoe={shoe}
            openGallery={openGallery}
          />
        ))}
        {/* Gelişmiş Galeri Modal */}
        <Dialog
          open={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-2 md:p-8">
            <Dialog.Panel className="mx-auto w-full max-w-[1100px] min-h-[70vh] rounded-3xl bg-white p-2 md:p-12 shadow-2xl flex flex-col items-center justify-center border border-gray-200">
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full p-2"
                title="Kapat"
              >
                <XMarkIcon className="h-7 w-7" />
              </button>
              {/* Başlık ve renklerin olduğu geniş panel */}
              <div className="w-full flex justify-center mb-6">
                <div className="bg-white rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center max-w-4xl w-full border border-gray-100">
                  <Dialog.Title className="text-2xl font-bold mb-3 text-center w-full">
                    {selectedShoe?.name} <span className="text-base text-gray-400">({selectedShoe?.colors[selectedColorIndex]?.name})</span>
                  </Dialog.Title>
                  <div className="flex flex-wrap justify-center gap-4 w-full">
                    {selectedShoe?.colors.map((color, idx) => (
                      <button
                        key={color.name}
                        onClick={() => selectColor(idx)}
                        className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-transform hover:scale-110 focus:outline-none ${idx === selectedColorIndex ? 'ring-4 ring-[#7a944a] scale-110 border-[#7a944a]' : 'border-[#e6f0f6]'}`}
                        style={{ background: color.colorCode }}
                        title={color.name}
                      >
                        <span className="sr-only">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Galeri görseli ve oklar */}
              <div className="relative w-full flex items-center justify-center" style={{ minHeight: 400 }}>
                {/* Sol ok her zaman görünür */}
                <button
                  onClick={prevImage}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-indigo-100 text-indigo-600 rounded-full p-2 shadow-lg z-20 border border-gray-200"
                  style={{ left: 0 }}
                  title="Önceki görsel"
                >
                  <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {selectedShoe && selectedColorIndex !== null && (
                  <img
                    src={selectedShoe.colors[selectedColorIndex].images[galleryIndex]}
                    alt={`${selectedShoe.name} - ${selectedShoe.colors[selectedColorIndex].name} - ${galleryIndex + 1}`}
                    className="max-h-[85vh] w-auto max-w-[90vw] md:max-w-[1200px] rounded-2xl shadow-xl object-contain border-2 border-gray-200 z-10"
                    style={{ background: '#fafdff' }}
                  />
                )}
                {/* Sağ ok her zaman görünür */}
                <button
                  onClick={nextImage}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-indigo-100 text-indigo-600 rounded-full p-2 shadow-lg z-20 border border-gray-200"
                  style={{ right: 0 }}
                  title="Sonraki görsel"
                >
                  <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
              {/* Küçük görsel noktaları */}
              {selectedShoe?.colors[selectedColorIndex]?.images.length > 1 && (
                <div className="flex gap-2 mt-4">
                  {selectedShoe.colors[selectedColorIndex].images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setGalleryIndex(idx)}
                      className={`w-4 h-4 rounded-full border-2 ${galleryIndex === idx ? 'bg-indigo-600 border-indigo-600' : 'bg-gray-200 border-gray-300'}`}
                      title={`Görsel ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                page === num 
                  ? 'bg-[#1a365d] text-white border-[#1a365d]' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      )}
      {/* Yukarı Çık Butonu */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-50 bg-[#1a365d] text-white rounded-full shadow-lg p-3 md:hidden hover:bg-[#2a4a7d] transition"
        title="Yukarı Çık"
        style={{ boxShadow: '0 4px 16px rgba(26,54,93,0.18)' }}
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  );
}

export default Catalog; 