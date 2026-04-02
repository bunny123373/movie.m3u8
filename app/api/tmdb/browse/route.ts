import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'trending';
  const mediaType = searchParams.get('mediaType') || 'movie';
  const page = searchParams.get('page') || '1';

  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 });
  }

  try {
    let endpoint = '';
    const baseUrl = `https://api.themoviedb.org/3`;

    switch (type) {
      case 'trending':
        endpoint = `${baseUrl}/trending/${mediaType}/week?api_key=${apiKey}&page=${page}`;
        break;
      case 'popular':
        endpoint = mediaType === 'movie'
          ? `${baseUrl}/movie/popular?api_key=${apiKey}&page=${page}`
          : `${baseUrl}/tv/popular?api_key=${apiKey}&page=${page}`;
        break;
      case 'top_rated':
        endpoint = mediaType === 'movie'
          ? `${baseUrl}/movie/top_rated?api_key=${apiKey}&page=${page}`
          : `${baseUrl}/tv/top_rated?api_key=${apiKey}&page=${page}`;
        break;
      case 'now_playing':
        endpoint = mediaType === 'movie'
          ? `${baseUrl}/movie/now_playing?api_key=${apiKey}&page=${page}`
          : `${baseUrl}/tv/on_the_air?api_key=${apiKey}&page=${page}`;
        break;
      default:
        endpoint = `${baseUrl}/trending/${mediaType}/week?api_key=${apiKey}&page=${page}`;
    }

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
      mediaType: mediaType as 'movie' | 'tv',
    }));

    return NextResponse.json({ 
      results,
      totalPages: data.total_pages,
      totalResults: data.total_results,
      page: data.page
    });
  } catch (error) {
    console.error('TMDB browse API error:', error);
    return NextResponse.json({ error: 'Failed to fetch from TMDB' }, { status: 500 });
  }
}