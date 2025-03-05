import React, { useState, useEffect, useCallback } from 'react';
import { useInterval } from '../hooks/useInterval';
import { useAudio } from '../hooks/useAudio';
import { Box, IconButton, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

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
        color: 'cyan',
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        color: 'blue',
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0],
        ],
        color: 'orange',
    },
    O: {
        shape: [
            [1, 1],
            [1, 1],
        ],
        color: 'yellow',
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
        ],
        color: 'green',
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        color: 'purple',
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0],
        ],
        color: 'red',
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

export const Tetris: React.FC = () => {
    const [board, setBoard] = useState(createEmptyBoard());
    const [currentPiece, setCurrentPiece] = useState(getRandomTetromino());
    const [currentPos, setCurrentPos] = useState({ x: 3, y: 0 });
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [dropTime, setDropTime] = useState<number | null>(null); // Start paused
    const [isPaused, setIsPaused] = useState(true);
    const { isMuted, toggleMute, playSound, initAudio } = useAudio();

    useEffect(() => {
        // Initialize audio context on first user interaction
        const handleFirstInteraction = () => {
            initAudio();
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        };

        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('keydown', handleFirstInteraction);

        return () => {
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        };
    }, [initAudio]);

    const moveLeft = useCallback(() => {
        if (!checkCollision(currentPiece.shape, currentPos.x - 1, currentPos.y)) {
            setCurrentPos((prev) => ({ ...prev, x: prev.x - 1 }));
            playSound('move');
        }
    }, [currentPiece, currentPos, playSound]);

    const moveRight = useCallback(() => {
        if (!checkCollision(currentPiece.shape, currentPos.x + 1, currentPos.y)) {
            setCurrentPos((prev) => ({ ...prev, x: prev.x + 1 }));
            playSound('move');
        }
    }, [currentPiece, currentPos, playSound]);

    const rotatePiece = useCallback(() => {
        const rotated = currentPiece.shape.map((_, i) =>
            currentPiece.shape.map((col) => col[i]).reverse()
        );
        if (!checkCollision(rotated, currentPos.x, currentPos.y)) {
            setCurrentPiece((prev) => ({ ...prev, shape: rotated }));
            playSound('rotate');
        }
    }, [currentPiece, currentPos, playSound]);

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
            playSound('clear');
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
                playSound('gameOver');
                return;
            }
            const newBoard = mergePieceToBoard();
            const clearedBoard = clearLines(newBoard);
            setBoard(clearedBoard);
            setCurrentPiece(getRandomTetromino());
            setCurrentPos({ x: 3, y: 0 });
            playSound('drop');
        }
    };

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (gameOver) return;

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
    }, [moveLeft, moveRight, rotatePiece, gameOver]);

    useInterval(() => {
        moveDown();
    }, dropTime);

    const togglePause = () => {
        if (gameOver) {
            // Reset game
            setBoard(createEmptyBoard());
            setScore(0);
            setGameOver(false);
            setCurrentPiece(getRandomTetromino());
            setCurrentPos({ x: 3, y: 0 });
            setIsPaused(false);
            setDropTime(INITIAL_DROP_TIME);
        } else {
            setIsPaused(!isPaused);
            setDropTime(isPaused ? INITIAL_DROP_TIME : null);
        }
    };

    return (
        <Box sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#1a1a1a',
            gap: 2
        }}>
            <Typography
                variant="h1"
                sx={{
                    fontFamily: 'monospace',
                    fontSize: '4rem',
                    color: '#ff0000',
                    mb: 4,
                    letterSpacing: '0.5rem',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}
            >
                TETRIS
            </Typography>

            <Box sx={{
                position: 'relative',
                border: '2px solid #333',
                borderRadius: '4px',
                bgcolor: '#000',
                p: 1,
                boxShadow: '0 0 10px rgba(0,0,0,0.5)'
            }}>
                {gameOver && (
                    <Box sx={{
                        position: 'absolute',
                        inset: 0,
                        bgcolor: 'rgba(0, 0, 0, 0.75)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1
                    }}>
                        <Typography variant="h3" sx={{ color: '#ff0000', fontFamily: 'monospace' }}>
                            GAME OVER
                        </Typography>
                    </Box>
                )}

                <Box sx={{
                    display: 'grid',
                    gap: '1px',
                    bgcolor: '#000',
                    gridTemplateColumns: `repeat(${BOARD_WIDTH}, 30px)`,
                }}>
                    {board.map((row, y) =>
                        row.map((cell, x) => {
                            const isCurrent =
                                currentPiece.shape[y - currentPos.y]?.[x - currentPos.x] === 1;
                            const color = isCurrent ? currentPiece.color : cell.color;

                            return (
                                <Box
                                    key={`${y}-${x}`}
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        border: '1px solid #111',
                                        bgcolor: color || '#000',
                                        boxShadow: color ? 'inset 0 0 5px rgba(255,255,255,0.5)' : 'none'
                                    }}
                                />
                            );
                        })
                    )}
                </Box>
            </Box>

            <Box sx={{
                display: 'flex',
                gap: 2,
                mt: 2,
                bgcolor: '#000',
                p: 2,
                borderRadius: '50px'
            }}>
                <IconButton
                    onClick={togglePause}
                    sx={{
                        color: '#fff',
                        '&:hover': { color: '#ff0000' }
                    }}
                >
                    {isPaused || gameOver ? <PlayArrowIcon /> : <PauseIcon />}
                </IconButton>
                <IconButton
                    onClick={toggleMute}
                    sx={{
                        color: '#fff',
                        '&:hover': { color: '#ff0000' }
                    }}
                >
                    {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </IconButton>
            </Box>

            <Box sx={{
                mt: 2,
                bgcolor: '#000',
                p: 1,
                borderRadius: '4px',
                border: '1px solid #333'
            }}>
                <Typography sx={{
                    fontFamily: 'monospace',
                    color: '#fff',
                    letterSpacing: '0.2rem'
                }}>
                    SCORE: {score.toString().padStart(4, '0')}
                </Typography>
            </Box>
        </Box>
    );
}; 