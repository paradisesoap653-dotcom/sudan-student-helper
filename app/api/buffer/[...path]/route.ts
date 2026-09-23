import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Token تم حفظه مسبقا ويعمل بشكل صحيح
const DEFAULT_BUFFER_TOKEN = 'Yv7rEnhHlZo3r6JzxMpRc9zumuibkK2oIqkBNb9o9wT';

async function bufferRequest(method: 'GET' | 'POST', path: string, token: string, searchParams?: URLSearchParams, bodyParams?: URLSearchParams) {
  const finalToken = token || DEFAULT_BUFFER_TOKEN;
  const targetUrl = new URL(`https://api.bufferapp.com/1/${path}.json`);
  
  if (method === 'GET') {
    targetUrl.searchParams.set('access_token', finalToken);
    if (searchParams) {
      searchParams.forEach((val, key) => {
        if (key !== 'access_token') targetUrl.searchParams.set(key, val);
      });
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  
  const fetchOptions: any = {
    method,
    signal: controller.signal,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
    },
  };

  if (method === 'POST') {
    const postBody = bodyParams || new URLSearchParams();
    postBody.set('access_token', finalToken);
    fetchOptions.headers!['Content-Type'] = 'application/x-www-form-urlencoded';
    fetchOptions.body = postBody.toString();
  }

  try {
    const response = await fetch(targetUrl.toString(), fetchOptions);
    clearTimeout(timeoutId);
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    clearTimeout(timeoutId);
    return NextResponse.json({ error: 'Failed to connect to Buffer', offline: true, details: String(err) }, { status: 503 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/').replace(/\.json$/, '');
    const searchParams = request.nextUrl.searchParams;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || searchParams.get('access_token') || '';
    return await bufferRequest('GET', path, token, searchParams);
  } catch (err) {
    return NextResponse.json({ error: 'Request failed', offline: true }, { status: 503 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/').replace(/\.json$/, '');
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';
    const bodyText = await request.text();
    let bodyParams: URLSearchParams;
    try {
      const jsonBody = JSON.parse(bodyText);
      bodyParams = new URLSearchParams(jsonBody);
    } catch {
      bodyParams = new URLSearchParams(bodyText);
    }
    return await bufferRequest('POST', path, token, undefined, bodyParams);
  } catch (err) {
    return NextResponse.json({ error: 'Request failed', offline: true }, { status: 503 });
  }
}



