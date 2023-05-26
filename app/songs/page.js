'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button'
import Link from "next/link"
import { useSearchParams } from 'next/navigation'

export default function Home() {
  const [token, setToken] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  window.history.replaceState(null, '', '/songs')

  useEffect(() => {
    const url = '/api/token?code=' + code;
    fetch(url).then(res => res.json()).then(setToken);
  }, [code])

  const fetchSongs = async () => {
    const url = 'https://api.spotify.com/v1/me/playlists';
    const headers = {
      'Authorization': `Bearer ${token.access_token}` 
    };
    const response = await fetch(url, { headers });
    const data = await response.json();
    setPlaylists(data.items);
    console.log(data)
  }

  return (
    <>
    <p>Songs</p>
    <Button onClick={fetchSongs}>
      Fetch Songs
    </Button>
    {JSON.stringify(playlists)}
    </>
  )
}
