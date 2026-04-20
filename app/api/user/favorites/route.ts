import { auth } from '@/auth';
import { getFavorites, addFavorite, removeFavorite } from '@/lib/models';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.email;
  const favorites = await getFavorites(userId);
  return NextResponse.json(favorites);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.email;
  const body = await request.json();
  const favorite = await addFavorite({ ...body, userId });
  return NextResponse.json(favorite);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.email;
  const { searchParams } = new URL(request.url);
  const mediaId = searchParams.get('mediaId');
  if (!mediaId) {
    return NextResponse.json({ error: 'mediaId required' }, { status: 400 });
  }
  await removeFavorite(userId, mediaId);
  return NextResponse.json({ success: true });
}