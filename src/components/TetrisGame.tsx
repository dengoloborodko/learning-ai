import { useState, useEffect } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { useAudio } from '../hooks/useAudio';

export const TetrisGame = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const { play, pause, setMuted, setVolume } = useAudio('/learning-ai/assets/audio/tetris-theme.mp3');

    // Handle game state changes
    useEffect(() => {
        if (isPlaying && !isMuted) {
            play();
        } else {
            pause();
        }
    }, [isPlaying, isMuted, play, pause]);

    // Handle volume changes
    useEffect(() => {
        setMuted(isMuted);
        setVolume(isMuted ? 0 : 0.5);
    }, [isMuted, setMuted, setVolume]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                p: 3,
                backgroundColor: '#1a1a1a',
                borderRadius: 2,
                boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
                maxWidth: '600px',
                margin: '2rem auto',
            }}
        >
            {/* Game Title */}
            <Typography
                variant="h3"
                sx={{
                    color: '#ff0000',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                    fontFamily: '"Press Start 2P", cursive',
                    mb: 2,
                }}
            >
                TETRIS
            </Typography>

            {/* Game Window */}
            <Box
                sx={{
                    width: '300px',
                    height: '600px',
                    backgroundColor: '#000',
                    border: '4px solid #333',
                    borderRadius: '4px',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)',
                        backgroundSize: '20px 20px',
                        opacity: 0.1,
                        pointerEvents: 'none',
                    },
                }}
            />

            {/* Controls */}
            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    mt: 2,
                }}
            >
                <IconButton
                    onClick={() => setIsPlaying(!isPlaying)}
                    sx={{
                        backgroundColor: '#333',
                        '&:hover': {
                            backgroundColor: '#444',
                        },
                    }}
                >
                    {isPlaying ? (
                        <PauseIcon sx={{ color: '#fff' }} />
                    ) : (
                        <PlayArrowIcon sx={{ color: '#fff' }} />
                    )}
                </IconButton>
                <IconButton
                    onClick={() => setIsMuted(!isMuted)}
                    sx={{
                        backgroundColor: '#333',
                        '&:hover': {
                            backgroundColor: '#444',
                        },
                    }}
                >
                    {isMuted ? (
                        <VolumeOffIcon sx={{ color: '#fff' }} />
                    ) : (
                        <VolumeUpIcon sx={{ color: '#fff' }} />
                    )}
                </IconButton>
            </Box>

            {/* Score Display */}
            <Box
                sx={{
                    backgroundColor: '#000',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: '2px solid #333',
                }}
            >
                <Typography sx={{ color: '#fff', fontFamily: 'monospace' }}>
                    SCORE: 0000
                </Typography>
            </Box>
        </Box>
    );
}; 