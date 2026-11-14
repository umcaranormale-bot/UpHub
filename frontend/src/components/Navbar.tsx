import React, { useState } from 'react';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <span className="font-bold text-xl tracking-wide text-blue-400">
              UpHub
            </span>
          </div>

          {/* LINKS DE NAVEGAÇÃO - DESKTOP */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="hover:text-blue-400 transition-colors duration-200">
              Início
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors duration-200">
              Sobre
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors duration-200">
              Serviços
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors duration-200">
              Contato
            </a>
          </nav>

          {/* BOTÃO MOBILE (Hambúrguer) */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="text-gray-300 hover:text-white focus:outline-none"
              aria-label="Abrir Menu"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.364 18.364a1 1 0 000-1.414L13.414 12l4.95-4.95a1 1 0 00-1.414-1.414L12 10.586l-4.95-4.95a1 1 0 00-1.414 1.414L10.586 12l-4.95 4.95a1 1 0 001.414 1.414L12 13.414l4.95 4.95a1 1 0 001.414 0z"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M4 5h16a1 1 0 010 2H4a1 1 0 110-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2z"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MENU MOBILE EXPANSÍVEL */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-800 px-2 pt-2 pb-4 space-y-1 sm:px-3">
          <a href="#" className="block px-3 py-2 rounded-md hover:bg-slate-700">
            Início
          </a>
          <a href="#" className="block px-3 py-2 rounded-md hover:bg-slate-700">
            Sobre
          </a>
          <a href="#" className="block px-3 py-2 rounded-md hover:bg-slate-700">
            Serviços
          </a>
          <a href="#" className="block px-3 py-2 rounded-md hover:bg-slate-700">
            Contato
          </a>
        </div>
      )}
    </header>
  );
};