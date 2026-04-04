'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import GlobalSearch from './GlobalSearch';
import { useAuth } from './AuthProvider';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, signIn, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/genres', label: 'Genres' },
    { href: '/favorites', label: 'My List' },
  ];

  const mobileNavLinks = [
    { href: '/#movies', label: 'Movies' },
    { href: '/#series', label: 'Series' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/80 to-transparent'
    }`}>
      <div className="max-w-[1920px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded overflow-hidden">
                <Image 
                  src="/icon.png" 
                  alt="TeluguDub" 
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl md:text-2xl font-bold tracking-wide">
                <span className="text-[#e50914]">T</span><span className="text-white">elugu</span><span className="text-[#e50914]">D</span><span className="text-white">ub</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-4 md:gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="text-sm md:text-sm text-gray-300 hover:text-white transition-colors whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            <div className="flex md:hidden items-center gap-3">
              {mobileNavLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="text-xs text-gray-300 hover:text-white transition-colors whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-5">
            <Link href="/search" className="md:hidden text-gray-300 hover:text-white transition-colors p-1">
              <svg className="w-6 h-6 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <div className="hidden md:block">
              <GlobalSearch />
            </div>
            
            {user ? (
              <div className="flex items-center gap-2">
                {user.picture ? (
                  <Image
                    src={user.picture}
                    alt={user.name || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full cursor-pointer"
                    onClick={() => signOut()}
                  />
                ) : (
                  <button
                    onClick={() => signOut()}
                    className="w-8 h-8 md:w-8 md:h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm md:text-sm font-medium"
                  >
                    {user.name?.charAt(0) || 'U'}
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}