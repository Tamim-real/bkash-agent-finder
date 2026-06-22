import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gid = searchParams.get('gid');

  if (!gid) {
    return NextResponse.json({ error: 'Missing target Node ID param' }, { status: 400 });
  }

  try {
    // Reconstruct exact dynamic string required by bKash geofence indices
    const targetUrl = `https://api.bkash.com/bk-web-api/bkashmap/v1/route?starting_point=91.09493213129579,23.386471466181124&gid=bkash_agent:bkash_agent:${gid}`;

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://www.bkash.com',
        'Referer': 'https://www.bkash.com/',
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream data validation drop.' }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json(json);
    
  } catch (err: any) {
    return NextResponse.json({ error: 'Fatal Exception caught inside proxy middleware thread', details: err.message }, { status: 500 });
  }
}