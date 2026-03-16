'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white dark:text-zinc-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h16v2H4v-2zm0 4h16v2H4v-2z"/>
              </svg>
            </div>
            <span className="text-xl font-semibold text-zinc-900 dark:text-white">StreamGrid</span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search movies..."
                className="w-64 px-4 py-2 pl-10 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Link
              href="/add-movie"
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-white rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Add Movie
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-zinc-600 dark:text-zinc-400"
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
          <div className="md:hidden py-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search movies..."
                className="w-full px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500"
              />
            </div>
            <Link
              href="/add-movie"
              className="block w-full px-4 py-2 text-sm font-medium text-center text-white bg-zinc-900 dark:bg-white rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Add Movie
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
