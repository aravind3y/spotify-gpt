import { redirect } from 'next/navigation';

var redirect_uri = 'http://localhost:3000/songs';

export async function GET(request) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    redirect_uri: redirect_uri,
    scope: 'playlist-read-private playlist-read-collaborative',
  })
  let url = 'https://accounts.spotify.com/authorize?' + params.toString();
  redirect(url);
}
