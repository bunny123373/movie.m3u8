'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export default function AuthButton() {
  const { data: session } = useSession();

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || 'User'}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-medium">
            {session.user.name?.charAt(0) || 'U'}
          </div>
        )}
        <button
          onClick={() => signOut()}
          className="text-sm text-gray-300 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="text-sm text-gray-300 hover:text-white transition-colors"
    >
      Sign In
    </button>
  );
}