import { useRef, useState, useEffect } from 'react';

export default function GalleryModal({ isOpen, onClose, images, initialIndex }) {
  const [index, setIndex] = useState(initialIndex || 0);
  const imgRef = useRef(null);
  const touchStart = useRef(null);

  useEffect(() => {
    setIndex(initialIndex || 0);
  }, [initialIndex, isOpen]);

  // Touch swipe handlers for mobile
  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (diff > 60) prev();
    else if (diff < -60) next();
    touchStart.current = null;
  };

  const prev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-900 rounded-full p-3 shadow-lg text-2xl md:text-3xl"
        aria-label="Kapat"
      >
        ×
      </button>
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-3 shadow-lg text-2xl md:text-3xl"
        aria-label="Önceki"
      >
        ‹
      </button>
      <img
        ref={imgRef}
        src={images[index]}
        alt="Galeri görseli"
        className="max-h-[60vh] md:max-h-[80vh] w-auto max-w-[90vw] rounded-xl shadow-xl object-contain"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        draggable={false}
      />
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-3 shadow-lg text-2xl md:text-3xl"
        aria-label="Sonraki"
      >
        ›
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${i === index ? 'bg-indigo-500' : 'bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  );
} 