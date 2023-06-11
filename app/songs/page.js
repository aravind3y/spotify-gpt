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
import { Skeleton } from "@/components/ui/skeleton"

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from 'next/navigation'
import { cn } from "@/lib/utils"

import { isEmpty } from 'lodash';
import { Loader } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"


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
        {/* <TableHead>Actions</TableHead> */}
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

const LoadingTable = () => (
  <Table>
    <TableHeader>
      <TableRow>
        {/* <TableHead></TableHead> */}
        <TableHead className="w-[100px]"></TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Album</TableHead>
        {/* <TableHead>Actions</TableHead> */}
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow key='loading'>
        {/* <TableCell>
          <Checkbox
            checked={checkedSongs[track.id]}
            onCheckedChange={(value) => setCheckedSongs({...checkedSongs, [track.id]: !!value})}
            aria-label="Select row"
          />
        </TableCell> */}
        <TableCell>
          <div className="overflow-hidden rounded-md w-[50px]">
            <Skeleton className="h-[50px] w-[50px]" />
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </TableCell>
        <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
      </TableRow>
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
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const searchParams = useSearchParams();
  
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [playlistSongsLoading, setPlaylistSongsLoading] = useState(false);
  const [chatgptSongsLoading, setChatgptSongsLoading] = useState(false);
  const [addSongsLoading, setAddSongsLoading] = useState(false);
  const { toast } = useToast();
  const code = searchParams.get('code');

  useEffect(() => {
    const url = '/api/token?code=' + code;
    fetch(url).then(res => res.json()).then(setToken);
    window.history.replaceState(null, '', '/songs')
  }, [code])

  const onClickPlaylist = (playlist) => {
    setSelectedPlaylist(playlist);
    fetchSongs(playlist.tracks);
  }

  const PlayListCard = ({ playlist }) => (
    <div className='w-[100px]' onClick={() => onClickPlaylist(playlist)}>
      <div className="overflow-hidden rounded-lg mb-2">
        <Image
          src={playlist.images[0].url}
          alt={playlist.name}
          width={100}
          height={100}
          className="w-[100px] h-[100px] object-cover transition-all hover:scale-105"
        />
      </div>
      <div className={cn("space-y-1 text-sm", { 'bg-slate-300 rounded-lg p-1': selectedPlaylist?.id === playlist.id })}>
        <h3 className="font-medium leading-none">{playlist.name}</h3>
        <p className="text-xs text-muted-foreground">{playlist.tracks.total} songs</p>
      </div>
    </div>
  )

  const refreshToken = async () => {
    if (!token.refresh_token) {
      toast({
        title: "Authorization expired",
        description: "Auth token expired. Please re-login",
      })
      return;
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
    let response = await fetch(url, { headers });
    if (!response.ok) {
      refreshToken();
      response = await fetch(url, { headers });
    }
    if (!response.ok) {
      toast({
        title: "Error",
        description: "Please login again",
      })
      return;
    }
    const data = await response.json();
    return data;
  }

  const addSongToPlaylist = async (song_ids) => {
    if (isEmpty(song_ids)) {
      toast({
        description: "Load recommendations first",
      })
      return;
    }
    setAddSongsLoading(true);
    const playlist_id = selectedPlaylist.id;
    const headers = {
      'Authorization': `Bearer ${token.access_token}`,
      'Content-Type': 'application/json', 
    };
    const url = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;
    const data = {
      'uris': song_ids.map(song_id => `spotify:track:${song_id}`)
    }
    let response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(data) });
    if (!response.ok) {
      refreshToken();
      response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(data) });
    }
    setAddSongsLoading(false);
    if (!response.ok) {
      toast({
        title: "Error",
        description: "Please login again",
      })
      return;
    }
  }

  const fetchPlaylists = async () => {
    const url = 'https://api.spotify.com/v1/me/playlists';
    setPlaylistsLoading(true);
    const data = await fetchSpotifyData(url);
    setPlaylistsLoading(false);
    setPlaylists(data?.items || [])
  }

  const fetchSongs = async ({ href: url }) => {
    setPlaylistSongsLoading(true);
    const data = await fetchSpotifyData(url);
    setPlaylistSongsLoading(false);
    setPlaylistSongs(data?.items.map(item => item.track).filter(song => song.name) || []);
  }

  const searchSongs = async (name, artist) => {
    const qry = `${name} ${artist}`;
    const url = `https://api.spotify.com/v1/search?type=track&limit=1&q=${encodeURIComponent(qry)}`;
    const data = await fetchSpotifyData(url);
    const track = data?.tracks?.items?.[0];
    return track;
  }

  const getChatGptRecommendations = async () => {
    if (isEmpty(playlistSongs)) {
      toast({
        description: "Load playlists and select a playlist first",
      })
      return;
    }
    let prompt = 'These are music from my playlist. Recommend me songs excluding those I already provided, that match my taste in same format with no extra text. '
    prompt += playlistSongs.filter(song => song.name).map(song => song.name + ' by ' + getArtists(song.artists)).join(' | ');
    const url = `/api/chat_gpt?prompt=${encodeURIComponent(prompt)}`;
    setChatgptSongsLoading(true);
    const res = await fetch(url);
    const data = await res.json();
    const content = data.content.choices[0].message.content;
    const songs = content.split(' | ').map(song => {
      const [name, artist] = song.split(' by ');
      return { name, artist };
    })
    setChatgptSongs(songs);
    const songPromises = songs.map(song => searchSongs(song.name, song.artist));
    Promise.all(songPromises).then(songs => {
      setSearchedSongs(songs.filter(song => song));
    });
    setChatgptSongsLoading(false);
  }
    
  return (
    <div>
    <div className="space-between flex items-center">
      <div className="flex items-center justify-between m-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            MusicGPT
          </h2>
          <p className="text-sm text-muted-foreground">
            Song recommendations powered by ChatGPT
          </p>
        </div>
        <Button onClick={fetchPlaylists} className='m-4' disabled={playlistsLoading}>
          Load playlists
        </Button>
      </div>
    </div>
    <div className="relative pl-4">
      <ScrollArea>
        <div className="flex space-x-4 pb-4">
          {playlists?.map(playlist => (
            <PlayListCard playlist={playlist} key={playlist.id} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <p className="text-sm text-muted-foreground">Select a playlist to display the songs</p>
    </div>
    <Button onClick={() => addSongToPlaylist(searchedSongs.map(s => s.id))} className='m-4 float-right'>
      Add to playlist
    </Button>
    <Button onClick={getChatGptRecommendations} className='m-4 float-right' disabled={chatgptSongsLoading}>
      Load recommendations
    </Button>
    {!isEmpty(searchedSongs) && (
      <>
        <h2 className="text-2xl font-semibold tracking-tight m-4">
          Recommended music
        </h2>
        <SongsTable key='searched' playlistSongs={searchedSongs}/>
      </>
    )}
    {chatgptSongsLoading && <LoadingTable />}
    <h2 className="text-2xl font-semibold tracking-tight m-4">
      Your Music
    </h2>
    <SongsTable key='all' playlistSongs={playlistSongs}/>
    </div>
  )
}
