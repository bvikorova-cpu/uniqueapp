export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number;
  url: string;
  thumbnail?: string;
}

// Royalty-free music library
// NOTE: To use this feature, you need to add actual music file URLs below
// You can use royalty-free music from services like:
// - YouTube Audio Library (https://www.youtube.com/audiolibrary)
// - Free Music Archive (https://freemusicarchive.org)
// - Incompetech (https://incompetech.com)
// - Bensound (https://www.bensound.com)
//
// Upload the audio files to Supabase Storage or host them externally,
// then replace the URLs below with the actual file URLs
export const musicLibrary: MusicTrack[] = [
  {
    id: "1",
    title: "Energy Pop",
    artist: "Modern Beats",
    genre: "Pop",
    duration: 180,
    url: "", // Add your music file URL here
    thumbnail: "🎵"
  },
  {
    id: "2",
    title: "Dance Revolution",
    artist: "DJ Rhythm",
    genre: "Dance",
    duration: 200,
    url: "", // Add your music file URL here
    thumbnail: "💃"
  },
  {
    id: "3",
    title: "Electric Dreams",
    artist: "Synth Wave",
    genre: "Electronic",
    duration: 190,
    url: "", // Add your music file URL here
    thumbnail: "⚡"
  },
  {
    id: "4",
    title: "Urban Vibes",
    artist: "Street Sound",
    genre: "Hip Hop",
    duration: 170,
    url: "", // Add your music file URL here
    thumbnail: "🎤"
  },
  {
    id: "5",
    title: "Neon Lights",
    artist: "City Pop",
    genre: "Pop",
    duration: 195,
    url: "", // Add your music file URL here
    thumbnail: "🌃"
  },
  {
    id: "6",
    title: "Summer Party",
    artist: "Beach Beats",
    genre: "Dance",
    duration: 185,
    url: "", // Add your music file URL here
    thumbnail: "🏖️"
  },
  {
    id: "7",
    title: "Midnight Drive",
    artist: "Retro Wave",
    genre: "Electronic",
    duration: 210,
    url: "", // Add your music file URL here
    thumbnail: "🌙"
  },
  {
    id: "8",
    title: "Feel Good",
    artist: "Happy Tunes",
    genre: "Pop",
    duration: 165,
    url: "", // Add your music file URL here
    thumbnail: "😊"
  },
  {
    id: "9",
    title: "Club Anthem",
    artist: "Bass Drop",
    genre: "Dance",
    duration: 200,
    url: "", // Add your music file URL here
    thumbnail: "🎧"
  },
  {
    id: "10",
    title: "Future Bass",
    artist: "EDM Masters",
    genre: "Electronic",
    duration: 175,
    url: "", // Add your music file URL here
    thumbnail: "🔊"
  }
];

export const genres = [...new Set(musicLibrary.map(track => track.genre))];
