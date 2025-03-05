import { useEffect, useRef } from 'react';

export const useAudio = (url: string) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio();
        audioRef.current = audio;

        // Set up audio properties
        audio.loop = true;
        audio.volume = 0.5;

        // Add event listeners for debugging
        audio.addEventListener('loadeddata', () => {
            console.log('Audio loaded successfully');
        });

        audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            console.error('Audio source:', audio.src);
        });

        // Set the source after adding event listeners
        audio.src = url;

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [url]);

    const play = () => {
        if (audioRef.current) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Error playing audio:', error);
                });
            }
        }
    };

    const pause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    const setMuted = (muted: boolean) => {
        if (audioRef.current) {
            audioRef.current.muted = muted;
        }
    };

    const setVolume = (volume: number) => {
        if (audioRef.current) {
            audioRef.current.volume = Math.max(0, Math.min(1, volume));
        }
    };

    return { play, pause, setMuted, setVolume };
}; 