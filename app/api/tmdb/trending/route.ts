import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const timeWindow = searchParams.get('time_window') || 'week';
  const type = searchParams.get('type') || 'all';

  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 });
  }

  try {
    let endpoint: string;
    
    if (type === 'movie') {
      endpoint = `https://api.themoviedb.org/3/trending/movie/${timeWindow}?api_key=${apiKey}`;
    } else if (type === 'tv') {
      endpoint = `https://api.themoviedb.org/3/trending/tv/${timeWindow}?api_key=${apiKey}`;
    } else {
      endpoint = `https://api.themoviedb.org/3/trending/all/${timeWindow}?api_key=${apiKey}`;
    }

    const res = await fetch(endpoint);

    if (!res.ok) {
      return NextResponse.json({ error: `API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    
    const results = (data.results || []).slice(0, 20).map((item: any) => ({
      id: item.id.toString(),
      tmdbId: item.id,
      title: item.title || item.name || '',
      poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
      backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : '',
      rating: item.vote_average || 0,
      releaseDate: item.release_date || item.first_air_date || '',
      overview: item.overview || '',
      genres: [],
      mediaType: item.media_type === 'tv' ? 'series' : 'movie',
      sources: [],
      quality: '1080p',
      audioLanguages: [],
      subtitleLanguages: [],
      slug: (item.title || item.name || '').toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') + '-' + item.id,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('TMDB trending API error:', error);
    return NextResponse.json({ error: 'Failed to fetch from TMDB' }, { status: 500 });
  }
}
