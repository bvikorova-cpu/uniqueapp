import { useRef, useCallback, useEffect } from 'react';

// Sound URLs - using free sound effects
const SOUNDS = {
  ambient: {
    mystery: 'https://cdn.pixabay.com/audio/2022/10/25/audio_6c0ef17d00.mp3',
    horror: 'https://cdn.pixabay.com/audio/2022/03/10/audio_fe1fae1dc8.mp3',
    scifi: 'https://cdn.pixabay.com/audio/2022/05/16/audio_db6d1e3fb1.mp3',
    adventure: 'https://cdn.pixabay.com/audio/2021/09/06/audio_1c4df99b10.mp3',
    fantasy: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0ef89f39c.mp3',
  },
  effects: {
    pickup: 'https://cdn.pixabay.com/audio/2022/03/15/audio_fd62e8f1d6.mp3',
    success: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1e68f.mp3',
    error: 'https://cdn.pixabay.com/audio/2022/03/15/audio_942694d06a.mp3',
    unlock: 'https://cdn.pixabay.com/audio/2022/03/10/audio_35bb2bef86.mp3',
    door: 'https://cdn.pixabay.com/audio/2022/03/15/audio_371b07a08d.mp3',
    click: 'https://cdn.pixabay.com/audio/2022/11/21/audio_e0908ec0a5.mp3',
    hint: 'https://cdn.pixabay.com/audio/2022/03/24/audio_0c1c8c4b90.mp3',
    complete: 'https://cdn.pixabay.com/audio/2021/08/04/audio_dc39844db9.mp3',
  }
};

export type SoundEffect = keyof typeof SOUNDS.effects;
export type AmbientTheme = keyof typeof SOUNDS.ambient;

export function useEscapeRoomSounds(theme: string = 'mystery') {
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const effectsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const isMutedRef = useRef(false);

  // Initialize ambient sound
  useEffect(() => {
    const themeKey = theme as AmbientTheme;
    const ambientUrl = SOUNDS.ambient[themeKey] || SOUNDS.ambient.mystery;
    
    ambientRef.current = new Audio(ambientUrl);
    ambientRef.current.loop = true;
    ambientRef.current.volume = 0.3;
    
    return () => {
      if (ambientRef.current) {
        ambientRef.current.pause();
        ambientRef.current = null;
      }
    };
  }, [theme]);

  // Preload effects
  useEffect(() => {
    Object.entries(SOUNDS.effects).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = 0.5;
      effectsRef.current.set(key, audio);
    });

    return () => {
      effectsRef.current.forEach(audio => {
        audio.pause();
      });
      effectsRef.current.clear();
    };
  }, []);

  const playAmbient = useCallback(() => {
    if (ambientRef.current && !isMutedRef.current) {
      ambientRef.current.play().catch(() => {
        // Autoplay blocked, will play on user interaction
      });
    }
  }, []);

  const stopAmbient = useCallback(() => {
    if (ambientRef.current) {
      ambientRef.current.pause();
    }
  }, []);

  const playEffect = useCallback((effect: SoundEffect) => {
    if (isMutedRef.current) return;
    
    const audio = effectsRef.current.get(effect);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Effect failed to play
      });
    }
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    isMutedRef.current = muted;
    if (muted) {
      stopAmbient();
    } else {
      playAmbient();
    }
  }, [playAmbient, stopAmbient]);

  const setAmbientVolume = useCallback((volume: number) => {
    if (ambientRef.current) {
      ambientRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  return {
    playAmbient,
    stopAmbient,
    playEffect,
    setMuted,
    setAmbientVolume,
  };
}
