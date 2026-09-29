import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const searchParams = request.nextUrl.searchParams;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || searchParams.get('access_token');

    if (!token) {
      return NextResponse.json({ error: 'Missing access token' }, { status: 401 });
    }

    // بناء الرابط مع access_token في معاملات الاستعلام وهي الطريقة التي تعمل بنجاح
    const targetUrl = new URL(`https://api.bufferapp.com/1/${path}`);
    targetUrl.searchParams.set('access_token', token);
    
    // انسخ باقي معاملات البحث ان وجدت
    searchParams.forEach((val, key) => {
      if (key !== 'access_token') targetUrl.searchParams.set(key, val);
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to reach Buffer', offline: true }, { status: 503 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const bodyText = await request.text();
    const bodyParams = new URLSearchParams(bodyText);

    if (!token) {
      return NextResponse.json({ error: 'Missing access token' }, { status: 401 });
    }

    // اضف access_token للبودي في طلبات POST
    bodyParams.set('access_token', token);
    const targetUrl = `https://api.bufferapp.com/1/${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(targetUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0',
      },
      body: bodyParams.toString(),
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to reach Buffer', offline: true }, { status: 503 });
  }
}


