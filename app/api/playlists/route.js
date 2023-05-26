
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const authOptions = {
    url: 'https://api.spotify.com/v1/me/playlists',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Bearer ' + token,
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
