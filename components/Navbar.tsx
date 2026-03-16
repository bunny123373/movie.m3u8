'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import GlobalSearch from './GlobalSearch';
import FavoritesButton from './FavoritesButton';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden bg-red-600 flex items-center justify-center">
              <Image 
                src="/favicon.png" 
                alt="StreamGrid" 
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-lg sm:text-xl font-semibold text-white">StreamGrid</span>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <GlobalSearch />
            <FavoritesButton />
          </div>

          <button
            className="md:hidden p-2 text-zinc-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-800 space-y-4">
            <GlobalSearch />
            <FavoritesButton />
          </div>
        )}
      </div>
    </nav>
  );
}
