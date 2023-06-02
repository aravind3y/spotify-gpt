'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from 'next/navigation'



export default function Home() {
  const [token, setToken] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [checkedSongs, setCheckedSongs] = useState({});
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  useEffect(() => {
    const url = '/api/token?code=' + code;
    fetch(url).then(res => res.json()).then(setToken);
    window.history.replaceState(null, '', '/songs')
  }, [code])

  const PlayListCard = ({ playlist }) => (
    <div className='w-[100px]' onClick={() => fetchSongs(playlist.tracks)}>
      <div className="overflow-hidden rounded-lg mb-2">
        <Image
          src={playlist.images[0].url}
          alt={playlist.name}
          width={100}
          height={100}
          className="w-[100px] h-[100px] object-cover transition-all hover:scale-105"
        />
      </div>
      <div className="space-y-1 text-sm">
        <h3 className="font-medium leading-none">{playlist.name}</h3>
        <p className="text-xs text-muted-foreground">{playlist.tracks.total} songs</p>
      </div>
    </div>
  )

  const fetchSpotifyData = async (url) => {
    const headers = {
      'Authorization': `Bearer ${token.access_token}` 
    };
    console.log(url, headers);
    let response = await fetch(url, { headers });
    if (!response.ok) {
      if (!token.refresh_token) {
        throw new Error('No refresh token');
      }
      const url = '/api/token?refresh_token=' + token.refresh_token;
      const tokenRes = await fetch(url);
      const data = await tokenRes.json();
      setToken(data);
      response = await fetch(url, { headers });
    }
    if (!response.ok) {
      throw new Error(data.error.message);
    }
    const data = await response.json();
    return data;
  }

  const fetchPlaylists = async () => {
    const url = 'https://api.spotify.com/v1/me/playlists';
    const data = await fetchSpotifyData(url);
    setPlaylists(data.items)
  }

  const fetchSongs = async ({ href: url }) => {
    const data = await fetchSpotifyData(url);
    setSongs(data.items);
  }

  const searchSongs = async (name, artist) => {
    const qry = `${name} ${artist}`;
    const url = `https://api.spotify.com/v1/search?type=track&limit=1&q=${encodeURIComponent(qry)}`;
    const data = await fetchSpotifyData(url);
    console.log(data);
  }

  const getArtists = (artists) => {
    const truncatedArtists = artists.slice(0, 3);
    return truncatedArtists.map(artist => artist.name).join(', ');
  }

  const getChatGptRecommendations = async () => {
    let prompt = 'These are music from my playlist. Recommend me songs that match my taste in csv format with no extra text.'
    prompt += '\n\n' + songs.map(song => song.track.name + ' by ' + getArtists(song.track.artists)).join('\n');
    const url = `/api/chat_gpt?prompt=${encodeURIComponent(prompt)}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(data);
  }
    
  return (
    <>
    <p>Songs</p>
    <Button onClick={fetchPlaylists} className='m-4'>
      Fetch playlists
    </Button>
    <Button onClick={getChatGptRecommendations} className='m-4'>
      Search
    </Button>
    <div className="relative pl-4">
      <ScrollArea>
        <div className="flex space-x-4 pb-4">
          {playlists?.map(playlist => (
            <PlayListCard playlist={playlist} key={playlist.id} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
    <Table>
      <TableCaption>A list of your playlist songs</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead></TableHead>
          <TableHead className="w-[100px]"></TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Album</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {songs.map(({ track }) => (
          <TableRow key={ track.id }>
            <TableCell>
            <Checkbox
              checked={checkedSongs[track.id]}
              onCheckedChange={(value) => setCheckedSongs({...checkedSongs, [track.id]: !!value})}
              aria-label="Select row"
            />
            </TableCell>
            <TableCell>
              <div className="overflow-hidden rounded-md w-[50px]">
                <Image
                  src={track.album?.images[0]?.url}
                  alt={track.album.name}
                  width={100}
                  height={100}
                  className="w-[50px] h-[50px] object-cover transition-all hover:scale-105"
                />
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1 text-sm">
                <h3 className="font-medium leading-none">{track.name}</h3>
                <p className="text-xs text-muted-foreground">{getArtists(track.artists)}</p>
              </div>
            </TableCell>
            <TableCell>{track.album.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </>
  )
}
