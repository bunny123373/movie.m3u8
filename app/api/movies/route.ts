import { NextRequest, NextResponse } from 'next/server';
import { createMovie, getAllMovies, getMovieById, getMovieBySlug, deleteMovie, updateMovie } from '@/lib/models';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const slug = searchParams.get('slug');

  if (slug) {
    const movie = await getMovieBySlug(slug);
    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }
    return NextResponse.json(movie);
  }

  if (id) {
    const movie = await getMovieById(id);
    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }
    return NextResponse.json(movie);
  }

  const movies = await getAllMovies();
  return NextResponse.json(movies);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const movie = await createMovie(body);
    return NextResponse.json(movie, { status: 201 });
  } catch (error) {
    console.error('Error creating movie:', error);
    return NextResponse.json({ error: 'Failed to create movie' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Movie ID required' }, { status: 400 });
    }

    const body = await request.json();
    const movie = await updateMovie(id, body);
    
    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }
    
    return NextResponse.json(movie);
  } catch (error) {
    console.error('Error updating movie:', error);
    return NextResponse.json({ error: 'Failed to update movie' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Movie ID required' }, { status: 400 });
  }

  const deleted = await deleteMovie(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
