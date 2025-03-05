import { useState, useEffect, useCallback } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { useInterval } from '../hooks/useInterval';
import { useAudio } from '../hooks/useAudio';

// Constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_DROP_TIME = 1000;

// Tetromino shapes
const TETROMINOES = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        color: '#00f0f0', // cyan
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        color: '#0000f0', // blue
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0],
        ],
        color: '#f0a000', // orange
    },
    O: {
        shape: [
            [1, 1],
            [1, 1],
        ],
        color: '#f0f000', // yellow
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
        ],
        color: '#00f000', // green
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        color: '#a000f0', // purple
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0],
        ],
        color: '#f00000', // red
    },
};

// Initial game state
const createEmptyBoard = () =>
    Array.from({ length: BOARD_HEIGHT }, () =>
        Array.from({ length: BOARD_WIDTH }, () => ({ filled: false, color: '' }))
    );

const getRandomTetromino = () => {
    const tetrominoes = Object.keys(TETROMINOES);
    const randTetromino = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
    return TETROMINOES[randTetromino as keyof typeof TETROMINOES];
};

export const TetrisGame = () => {
    const [board, setBoard] = useState(createEmptyBoard());
    const [currentPiece, setCurrentPiece] = useState(getRandomTetromino());
    const [currentPos, setCurrentPos] = useState({ x: 3, y: 0 });
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [dropTime, setDropTime] = useState<number | null>(null);
    const { play, pause, setMuted, setVolume } = useAudio('/learning-ai/assets/audio/tetris-theme.mp3');

    useEffect(() => {
        const handleFirstInteraction = () => {
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        };

        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('keydown', handleFirstInteraction);

        return () => {
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        };
    }, []);

    useEffect(() => {
        if (isPlaying && !isMuted) {
            play();
        } else {
            pause();
        }
    }, [isPlaying, isMuted, play, pause]);

    useEffect(() => {
        setMuted(isMuted);
        setVolume(isMuted ? 0 : 0.5);
    }, [isMuted, setMuted, setVolume]);

    const checkCollision = (piece: number[][], x: number, y: number): boolean => {
        for (let row = 0; row < piece.length; row++) {
            for (let col = 0; col < piece[row].length; col++) {
                if (piece[row][col]) {
                    const newX = x + col;
                    const newY = y + row;
                    if (
                        newX < 0 ||
                        newX >= BOARD_WIDTH ||
                        newY >= BOARD_HEIGHT ||
                        (newY >= 0 && board[newY][newX].filled)
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    const moveLeft = useCallback(() => {
        if (!checkCollision(currentPiece.shape, currentPos.x - 1, currentPos.y)) {
            setCurrentPos((prev) => ({ ...prev, x: prev.x - 1 }));
        }
    }, [currentPiece, currentPos]);

    const moveRight = useCallback(() => {
        if (!checkCollision(currentPiece.shape, currentPos.x + 1, currentPos.y)) {
            setCurrentPos((prev) => ({ ...prev, x: prev.x + 1 }));
        }
    }, [currentPiece, currentPos]);

    const rotatePiece = useCallback(() => {
        const rotated = currentPiece.shape.map((_, i) =>
            currentPiece.shape.map((col) => col[i]).reverse()
        );
        if (!checkCollision(rotated, currentPos.x, currentPos.y)) {
            setCurrentPiece((prev) => ({ ...prev, shape: rotated }));
        }
    }, [currentPiece, currentPos]);

    const mergePieceToBoard = () => {
        const newBoard = [...board];
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const boardY = currentPos.y + y;
                    const boardX = currentPos.x + x;
                    if (boardY >= 0) {
                        newBoard[boardY][boardX] = {
                            filled: true,
                            color: currentPiece.color,
                        };
                    }
                }
            });
        });
        return newBoard;
    };

    const clearLines = (boardToCheck: typeof board) => {
        let linesCleared = 0;
        const newBoard = boardToCheck.filter((row) => {
            const isLineFull = row.every((cell) => cell.filled);
            if (isLineFull) linesCleared++;
            return !isLineFull;
        });

        while (newBoard.length < BOARD_HEIGHT) {
            newBoard.unshift(Array.from({ length: BOARD_WIDTH }, () => ({ filled: false, color: '' })));
        }

        if (linesCleared > 0) {
            setScore((prev) => prev + linesCleared * 100);
        }

        return newBoard;
    };

    const moveDown = () => {
        if (!checkCollision(currentPiece.shape, currentPos.x, currentPos.y + 1)) {
            setCurrentPos((prev) => ({ ...prev, y: prev.y + 1 }));
        } else {
            if (currentPos.y <= 0) {
                setGameOver(true);
                setDropTime(null);
                setIsPlaying(false);
                return;
            }
            const newBoard = mergePieceToBoard();
            const clearedBoard = clearLines(newBoard);
            setBoard(clearedBoard);
            setCurrentPiece(getRandomTetromino());
            setCurrentPos({ x: 3, y: 0 });
        }
    };

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!isPlaying || gameOver) return;

            switch (event.key) {
                case 'ArrowLeft':
                    moveLeft();
                    break;
                case 'ArrowRight':
                    moveRight();
                    break;
                case 'ArrowDown':
                    moveDown();
                    break;
                case 'ArrowUp':
                    rotatePiece();
                    break;
                case ' ':
                    // Hard drop implementation can be added here
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [isPlaying, gameOver, moveLeft, moveRight, rotatePiece]);

    useInterval(() => {
        moveDown();
    }, isPlaying && !gameOver ? dropTime : null);

    const togglePlay = () => {
        if (gameOver) {
            // Reset game
            setBoard(createEmptyBoard());
            setScore(0);
            setGameOver(false);
            setCurrentPiece(getRandomTetromino());
            setCurrentPos({ x: 3, y: 0 });
            setIsPlaying(true);
            setDropTime(INITIAL_DROP_TIME);
        } else {
            setIsPlaying(!isPlaying);
            setDropTime(isPlaying ? null : INITIAL_DROP_TIME);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100vh',
                maxWidth: '100vw',
                margin: '0 auto',
                py: 3, // padding top and bottom
                px: 4, // padding left and right
            }}
        >
            {/* Game Container with Dark Background */}
            <Box
                sx={{
                    backgroundColor: '#1a1a1a',
                    padding: '24px',
                    borderRadius: '10px',
                    boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    height: 'calc(100vh - 48px)', // full height minus padding
                    maxHeight: '900px', // prevent too large size on very tall screens
                }}
            >
                {/* Game Title */}
                <Typography
                    variant="h3"
                    sx={{
                        color: '#ff0000',
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                        fontFamily: '"Press Start 2P", cursive',
                        fontSize: 'clamp(2rem, 5vh, 3rem)',
                        mb: 1,
                    }}
                >
                    TETRIS
                </Typography>

                {/* Game Window */}
                <Box
                    sx={{
                        width: 'min(300px, 90vw)',
                        height: 'min(700px, calc(100vh - 250px))',
                        backgroundColor: '#000',
                        border: '4px solid #333',
                        borderRadius: '4px',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Game Grid */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
                            gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
                            gap: '1px',
                            height: '100%',
                        }}
                    >
                        {board.map((row, y) =>
                            row.map((cell, x) => {
                                const isCurrent =
                                    currentPiece.shape[y - currentPos.y]?.[x - currentPos.x] === 1;
                                const color = isCurrent ? currentPiece.color : cell.color;

                                return (
                                    <Box
                                        key={`${y}-${x}`}
                                        sx={{
                                            backgroundColor: color || 'transparent',
                                            border: color ? '1px solid rgba(255,255,255,0.2)' : 'none',
                                            boxShadow: color
                                                ? 'inset 0 0 8px rgba(255,255,255,0.3)'
                                                : 'none',
                                        }}
                                    />
                                );
                            })
                        )}
                    </Box>

                    {/* Game Over Overlay */}
                    {gameOver && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                        >
                            <Typography
                                variant="h4"
                                sx={{
                                    color: '#ff0000',
                                    fontFamily: '"Press Start 2P", cursive',
                                    textAlign: 'center',
                                }}
                            >
                                GAME OVER
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Controls and Score Container */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1.5,
                        marginTop: 'auto',
                    }}
                >
                    {/* Controls */}
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                        }}
                    >
                        <IconButton
                            onClick={togglePlay}
                            size="medium"
                            sx={{
                                backgroundColor: '#333',
                                '&:hover': {
                                    backgroundColor: '#444',
                                },
                            }}
                        >
                            {isPlaying ? (
                                <PauseIcon sx={{ color: '#fff', fontSize: '1.5rem' }} />
                            ) : (
                                <PlayArrowIcon sx={{ color: '#fff', fontSize: '1.5rem' }} />
                            )}
                        </IconButton>
                        <IconButton
                            onClick={() => setIsMuted(!isMuted)}
                            size="medium"
                            sx={{
                                backgroundColor: '#333',
                                '&:hover': {
                                    backgroundColor: '#444',
                                },
                            }}
                        >
                            {isMuted ? (
                                <VolumeOffIcon sx={{ color: '#fff', fontSize: '1.5rem' }} />
                            ) : (
                                <VolumeUpIcon sx={{ color: '#fff', fontSize: '1.5rem' }} />
                            )}
                        </IconButton>
                    </Box>

                    {/* Score and Instructions Container */}
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                            alignItems: 'center',
                        }}
                    >
                        {/* Score Display */}
                        <Box
                            sx={{
                                backgroundColor: '#000',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                border: '2px solid #333',
                            }}
                        >
                            <Typography
                                sx={{
                                    color: '#fff',
                                    fontFamily: '"Press Start 2P", cursive',
                                    fontSize: '0.8rem'
                                }}
                            >
                                SCORE: {score.toString().padStart(4, '0')}
                            </Typography>
                        </Box>

                        {/* Instructions */}
                        <Box
                            sx={{
                                backgroundColor: '#000',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                border: '2px solid #333',
                            }}
                        >
                            <Typography
                                sx={{
                                    color: '#fff',
                                    fontFamily: 'monospace',
                                    fontSize: '0.8rem',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                ← → move • ↑ rotate • ↓ down
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}; 