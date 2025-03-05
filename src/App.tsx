import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { TetrisGame } from './components/TetrisGame';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%)',
            pointerEvents: 'none',
          },
        }}
      >
        <TetrisGame />
      </Box>
    </ThemeProvider>
  );
};
