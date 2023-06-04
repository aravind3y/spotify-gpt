import { redirect } from 'next/navigation';

var redirect_uri = `${process.env.REDIRECT_URI}/songs`;

export async function GET(request) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    redirect_uri: redirect_uri,
    scope: 'playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private',
  })
  let url = 'https://accounts.spotify.com/authorize?' + params.toString();
  redirect(url);
}
