import { NextRequest, NextResponse } from 'next/server';
import { createSeries, getAllSeries, getSeriesById, getSeriesBySlug, updateSeries, deleteSeries } from '@/lib/models';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const slug = searchParams.get('slug');

  if (slug) {
    let series = await getSeriesBySlug(slug);
    if (!series && slug.includes('-')) {
      const idFromSlug = slug.split('-').pop();
      if (idFromSlug) {
        series = await getSeriesById(idFromSlug);
      }
    }
    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }
    return NextResponse.json(series);
  }

  if (id) {
    const series = await getSeriesById(id);
    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }
    return NextResponse.json(series);
  }

  const series = await getAllSeries();
  return NextResponse.json(series);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const series = await createSeries(body);
    return NextResponse.json(series, { status: 201 });
  } catch (error) {
    console.error('Error creating series:', error);
    return NextResponse.json({ error: 'Failed to create series' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Series ID required' }, { status: 400 });
    }

    const body = await request.json();
    const series = await updateSeries(id, body);
    
    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }
    
    return NextResponse.json(series);
  } catch (error) {
    console.error('Error updating series:', error);
    return NextResponse.json({ error: 'Failed to update series' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Series ID required' }, { status: 400 });
  }

  const deleted = await deleteSeries(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Series not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
