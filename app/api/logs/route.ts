import { NextRequest, NextResponse } from 'next/server';

const logs: any[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level');
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '100');

  let filtered = [...logs];

  if (level && level !== 'all') {
    filtered = filtered.filter(log => log.level === level);
  }
  if (category && category !== 'all') {
    filtered = filtered.filter(log => log.category === category);
  }

  filtered = filtered
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

  if (filtered.length === 0) {
    return NextResponse.json(generateMockLogs());
  }

  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level, category, message, details, user, ip } = body;

    const log = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level: level || 'info',
      category: category || 'system',
      message: message || '',
      details,
      user,
      ip,
    };

    logs.unshift(log);

    if (logs.length > 10000) {
      logs.splice(10000);
    }

    return NextResponse.json({ success: true, log });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE() {
  logs.length = 0;
  return NextResponse.json({ success: true, message: 'All logs cleared' });
}

function generateMockLogs() {
  const categories = ['auth', 'content', 'api', 'system', 'user'];
  const levels = ['info', 'warning', 'error', 'success'];
  const messages: Record<string, string[]> = {
    auth: ['User logged in', 'Failed login attempt', 'Password reset requested', 'Session expired'],
    content: ['Movie added', 'Series updated', 'Source added', 'Content deleted'],
    api: ['API request received', 'External API call failed', 'Rate limit reached', 'Cache updated'],
    system: ['Server started', 'Backup completed', 'Memory usage high', 'Database connection restored'],
    user: ['Profile updated', 'Settings changed', 'Favorite added', 'Watch history cleared'],
  };

  return Array.from({ length: 50 }, (_, i) => {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const level = levels[Math.floor(Math.random() * levels.length)] as any;
    const messageList = messages[category];
    
    return {
      id: `log-${i}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      level,
      category,
      message: messageList[Math.floor(Math.random() * messageList.length)],
      details: level === 'error' ? 'Error details here...' : undefined,
      user: Math.random() > 0.3 ? `user${Math.floor(Math.random() * 100)}` : undefined,
      ip: Math.random() > 0.5 ? `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : undefined,
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
