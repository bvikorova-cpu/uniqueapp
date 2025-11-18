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
// NOTE: Replace these URLs with actual royalty-free music URLs from services like:
// - YouTube Audio Library
// - Free Music Archive
// - Incompetech
// - Bensound
export const musicLibrary: MusicTrack[] = [
  {
    id: "1",
    title: "Energy Pop",
    artist: "Modern Beats",
    genre: "Pop",
    duration: 180,
    url: "https://example.com/track1.mp3", // Replace with actual URL
    thumbnail: "🎵"
  },
  {
    id: "2",
    title: "Dance Revolution",
    artist: "DJ Rhythm",
    genre: "Dance",
    duration: 200,
    url: "https://example.com/track2.mp3", // Replace with actual URL
    thumbnail: "💃"
  },
  {
    id: "3",
    title: "Electric Dreams",
    artist: "Synth Wave",
    genre: "Electronic",
    duration: 190,
    url: "https://example.com/track3.mp3", // Replace with actual URL
    thumbnail: "⚡"
  },
  {
    id: "4",
    title: "Urban Vibes",
    artist: "Street Sound",
    genre: "Hip Hop",
    duration: 170,
    url: "https://example.com/track4.mp3", // Replace with actual URL
    thumbnail: "🎤"
  },
  {
    id: "5",
    title: "Neon Lights",
    artist: "City Pop",
    genre: "Pop",
    duration: 195,
    url: "https://example.com/track5.mp3", // Replace with actual URL
    thumbnail: "🌃"
  },
  {
    id: "6",
    title: "Summer Party",
    artist: "Beach Beats",
    genre: "Dance",
    duration: 185,
    url: "https://example.com/track6.mp3", // Replace with actual URL
    thumbnail: "🏖️"
  },
  {
    id: "7",
    title: "Midnight Drive",
    artist: "Retro Wave",
    genre: "Electronic",
    duration: 210,
    url: "https://example.com/track7.mp3", // Replace with actual URL
    thumbnail: "🌙"
  },
  {
    id: "8",
    title: "Feel Good",
    artist: "Happy Tunes",
    genre: "Pop",
    duration: 165,
    url: "https://example.com/track8.mp3", // Replace with actual URL
    thumbnail: "😊"
  },
  {
    id: "9",
    title: "Club Anthem",
    artist: "Bass Drop",
    genre: "Dance",
    duration: 200,
    url: "https://example.com/track9.mp3", // Replace with actual URL
    thumbnail: "🎧"
  },
  {
    id: "10",
    title: "Future Bass",
    artist: "EDM Masters",
    genre: "Electronic",
    duration: 175,
    url: "https://example.com/track10.mp3", // Replace with actual URL
    thumbnail: "🔊"
  }
];

export const genres = [...new Set(musicLibrary.map(track => track.genre))];
