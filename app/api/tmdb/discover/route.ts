import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const genreId = searchParams.get('genre');
  const type = searchParams.get('type') || 'movie';
  const page = searchParams.get('page') || '1';

  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 });
  }

  if (!genreId) {
    return NextResponse.json({ error: 'Genre ID required' }, { status: 400 });
  }

  try {
    const endpoint = type === 'tv'
      ? `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_genres=${genreId}&page=${page}&sort_by=popularity.desc`
      : `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&page=${page}&sort_by=popularity.desc`;

    const res = await fetch(endpoint);

    if (!res.ok) {
      return NextResponse.json({ error: `API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    
    const results = (data.results || []).map((item: any) => ({
      id: item.id.toString(),
      tmdbId: item.id,
      title: item.title || item.name || '',
      poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
      backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : '',
      rating: item.vote_average || 0,
      releaseDate: item.release_date || item.first_air_date || '',
      overview: item.overview || '',
      genres: item.genre_ids || [],
      mediaType: type,
    }));

    return NextResponse.json({ 
      results,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      page: data.page
    });
  } catch (error) {
    console.error('TMDB discover API error:', error);
    return NextResponse.json({ error: 'Failed to fetch from TMDB' }, { status: 500 });
  }
}