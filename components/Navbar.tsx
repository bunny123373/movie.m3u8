'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import GlobalSearch from './GlobalSearch';
import FavoritesButton from './FavoritesButton';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden">
              <Image 
                src="/favicon.png" 
                alt="TeluguDub" 
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-[0.02em] text-white">
              TeluguDub
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/" className="p-2 text-zinc-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>
            <Link
              href="/#movies"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Movies
            </Link>
            <Link
              href="/#series"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Series
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <GlobalSearch />
            <ThemeToggle />
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
            <div className="flex gap-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 rounded-full"
              >
                Home
              </Link>
              <Link
                href="/#movies"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 rounded-full"
              >
                Movies
              </Link>
              <Link
                href="/#series"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 rounded-full"
              >
                Series
              </Link>
            </div>
            <GlobalSearch />
            <FavoritesButton />
          </div>
        )}
      </div>
    </nav>
  );
}
