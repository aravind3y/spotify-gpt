
import { NextResponse } from 'next/server';

const redirect_uri = 'http://localhost:3000/songs';
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const auth = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
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
