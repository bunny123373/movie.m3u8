import { auth } from '@/auth';
import { getUserSettings, saveUserSettings } from '@/lib/models';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.email;
  const settings = await getUserSettings(userId);
  return NextResponse.json(settings || {});
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.email;
  const body = await request.json();
  const settings = await saveUserSettings(userId, body);
  return NextResponse.json(settings);
}