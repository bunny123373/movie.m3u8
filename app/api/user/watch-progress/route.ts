import { auth } from '@/auth';
import { getWatchProgress, saveWatchProgress } from '@/lib/models';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.email;
  const progress = await getWatchProgress(userId);
  return NextResponse.json(progress);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.email;
  const body = await request.json();
  const progress = await saveWatchProgress({ ...body, userId });
  return NextResponse.json(progress);
}