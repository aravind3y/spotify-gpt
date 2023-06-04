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

const getArtists = (artists) => {
  const truncatedArtists = artists.slice(0, 3);
  return truncatedArtists.map(artist => artist.name).join(', ');
}

const SongsTable = ({playlistSongs, checkedSongs, setCheckedSongs}) => (
  <Table>
    <TableCaption>A list of your playlist songs</TableCaption>
    <TableHeader>
      <TableRow>
        {/* <TableHead></TableHead> */}
        <TableHead className="w-[100px]"></TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Album</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {playlistSongs.map((track) => (
        <TableRow key={ track.id }>
          {/* <TableCell>
            <Checkbox
              checked={checkedSongs[track.id]}
              onCheckedChange={(value) => setCheckedSongs({...checkedSongs, [track.id]: !!value})}
              aria-label="Select row"
            />
          </TableCell> */}
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
);

export default function Home() {
  const [token, setToken] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [chatgptSongs, setChatgptSongs] = useState([]);
  const [searchedSongs, setSearchedSongs] = useState([]);
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

  const refreshToken = async () => {
    if (!token.refresh_token) {
      throw new Error('No refresh token');
    }
    const url = '/api/token?refresh_token=' + token.refresh_token;
    const tokenRes = await fetch(url);
    const data = await tokenRes.json();
    setToken(data);
  }
  
  const fetchSpotifyData = async (url) => {
    const headers = {
      'Authorization': `Bearer ${token.access_token}` 
    };
    console.log(url, headers);
    let response = await fetch(url, { headers });
    if (!response.ok) {
      refreshToken();
      response = await fetch(url, { headers });
    }
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    return data;
  }

  const addSongToPlaylist = async (song_id, playlist_id) => {
    const headers = {
      'Authorization': `Bearer ${token.access_token}`,
      'Content-Type': 'application/json', 
    };
    const url = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;
    const data = {
      'uris': [`spotify:track:${song_id}`]
    }
    let response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(data) });
    if (!response.ok) {
      refreshToken();
      response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(data) });
    }
    if (!response.ok) {
      throw new Error('Failed to add song to playlist');
    }
  }

  const fetchPlaylists = async () => {
    const url = 'https://api.spotify.com/v1/me/playlists';
    const data = await fetchSpotifyData(url);
    setPlaylists(data.items)
  }

  const fetchSongs = async ({ href: url }) => {
    const data = await fetchSpotifyData(url);
    setPlaylistSongs(data.items.map(item => item.track));
  }

  const searchSongs = async (name, artist) => {
    const qry = `${name} ${artist}`;
    const url = `https://api.spotify.com/v1/search?type=track&limit=1&q=${encodeURIComponent(qry)}`;
    const data = await fetchSpotifyData(url);
    console.log(data);
    const track = data?.tracks?.items?.[0];
    return track;
  }

  const getChatGptRecommendations = async () => {
    let prompt = 'These are music from my playlist. Recommend me songs that match my taste in same format with no extra text. '
    prompt += playlistSongs.filter(song => song.name).map(song => song.name + ' by ' + getArtists(song.artists)).join(' | ');
    const url = `/api/chat_gpt?prompt=${encodeURIComponent(prompt)}`;
    const res = await fetch(url);
    const data = await res.json();
    const content = data.content.choices[0].message.content;
    const songs = content.split(' | ').map(song => {
      const [name, artist] = song.split(' by ');
      return { name, artist };
    })
    setChatgptSongs(songs);
    for (const song of songs) {
      const searchedSong = await searchSongs(song.name, song.artist);
      if (!searchedSong) {
        continue;
      }
      setSearchedSongs(prev => [...prev, searchedSong]);
    }
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
    <SongsTable key='searched' playlistSongs={searchedSongs}/>
    <SongsTable key='all' playlistSongs={playlistSongs}/>
    </>
  )
}
