import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdminLoggedIn') === 'true');
    window.addEventListener('storage', () => {
      setIsAdmin(localStorage.getItem('isAdminLoggedIn') === 'true');
    });
  }, []);

  return (
    <nav className="navbar-shadow text-[#3b576b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between h-auto md:h-36 py-2">
          <div className="flex-shrink-0 flex flex-col items-center md:flex-row md:items-center">
            <Link to="/" className="flex flex-col items-center md:flex-row md:space-x-6">
              <img 
                src="/logo.jpg" 
                alt="Logo" 
                className="h-28 w-auto drop-shadow-lg mb-2 md:mb-0"
                style={{ background: 'white', borderRadius: '20px', padding: '8px', border: '2.5px solid #e6f0f6' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/112x112?text=LOGO';
                }}
              />
              <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-center md:text-left mt-2 md:mt-0" style={{ color: '#3b576b' }}>Bose Shoes</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link
              to="/"
              className={`btn-main px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                location.pathname === '/' 
                  ? 'ring-2 ring-[#7a944a] scale-105' 
                  : 'hover:scale-105'
              }`}
            >
              Katalog
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={`btn-accent px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                  location.pathname === '/admin' 
                    ? 'ring-2 ring-[#3b576b] scale-105' 
                    : 'hover:scale-105'
                }`}
              >
                Yönetim Paneli
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 