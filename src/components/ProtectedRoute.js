import React, { useEffect, useState } from 'react';

function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // localStorage kontrolü
    const checkAuth = () => {
      const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
      setIsLoading(false);
    };

    // İlk kontrol
    checkAuth();

    // Storage event listener
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1a365d]"></div>
      </div>
    );
  }

  // AdminPanel bileşeni zaten kendi içinde giriş kontrolü yapıyor
  // Bu yüzden burada yönlendirme yapmıyoruz
  return children;
}

export default ProtectedRoute; 