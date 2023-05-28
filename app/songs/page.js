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

  useEffect(() => {
    const url = '/api/token?code=' + code;
    fetch(url).then(res => res.json()).then(setToken);
    window.history.replaceState(null, '', '/songs')
  }, [code])

  const fetchPlaylists = async () => {
    const url = 'https://api.spotify.com/v1/me/playlists';
    const headers = {
      'Authorization': `Bearer ${token.access_token}` 
    };
    const response = await fetch(url, { headers });
    const data = await response.json();
    setPlaylists(data.items);
  }

  const fetchSongs = async () => {}


  return (
    <>
    <p>Songs</p>
    <Button onClick={fetchPlaylists}>
      Fetch playlists
    </Button>
    <div className="flex flex-col">
      {playlists?.map(playlist => (
        <Button onClick={fetchSongs} key={playlist.id} variant="ghost" size="sm" className="justify-start">
          {playlist.name}
        </Button>
      ))}
    </div>
    
    </>
  )
}
