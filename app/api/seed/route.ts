import { NextResponse } from 'next/server';
import { seedMovies } from '@/lib/models';

export async function GET() {
  try {
    await seedMovies();
    return NextResponse.json({ success: true, message: 'Database seeded' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
