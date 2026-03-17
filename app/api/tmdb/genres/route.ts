import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'movie';

  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 });
  }

  try {
    const endpoint = type === 'tv' 
      ? `https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}`
      : `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`;

    const res = await fetch(endpoint);

    if (!res.ok) {
      return NextResponse.json({ error: `API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ genres: data.genres || [] });
  } catch (error) {
    console.error('TMDB genres API error:', error);
    return NextResponse.json({ error: 'Failed to fetch from TMDB' }, { status: 500 });
  }
}