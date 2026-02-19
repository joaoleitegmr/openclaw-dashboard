import { NextRequest, NextResponse } from 'next/server';

const OPENCLAW_API =
  process.env.OPENCLAW_API_URL || 'http://localhost:3001/api';

async function proxyRequest(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join('/');
  const url = new URL(req.url);
  const queryString = url.searchParams.toString();
  const target = `${OPENCLAW_API}/${pathStr}${queryString ? `?${queryString}` : ''}`;

  const headers: Record<string, string> = {};
  const contentType = req.headers.get('content-type');
  if (contentType) headers['content-type'] = contentType;

  const fetchOptions: RequestInit = {
    method: req.method,
    headers
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      fetchOptions.body = await req.text();
    } catch {
      // no body
    }
  }

  try {
    const response = await fetch(target, fetchOptions);
    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'content-type':
          response.headers.get('content-type') || 'application/json'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to proxy request', details: String(error) },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
