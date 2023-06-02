
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const refresh_token = searchParams.get('refresh_token');
  const auth = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    headers: {
      'Authorization': 'Basic ' + Buffer.from(auth).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  };
  const getAccessToken = async () => await
  fetch(authOptions.url, {
    method: "POST",
    body: new URLSearchParams(authOptions.form),
    headers: authOptions.headers,
  });

  const response = await getAccessToken();
  const data = await response.json();
  return NextResponse.json(data);
}
