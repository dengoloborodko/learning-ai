import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Container, Box, Typography, Button, AppBar, Toolbar } from '@mui/material'

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function App() {
  const [count, setCount] = useState(0)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              React + TypeScript + Material UI
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Vite + React + TS
            </Typography>
            <Typography variant="body1" paragraph>
              Edit <code>src/App.tsx</code> and save to test HMR
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setCount((count) => count + 1)}
            >
              Count is {count}
            </Button>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
