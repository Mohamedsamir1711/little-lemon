import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App.jsx';
import './styles.css';

const theme = createTheme({
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    button: { textTransform: 'none', fontWeight: 700 },
  },
  palette: {
    primary: { main: '#495e35', dark: '#354729', contrastText: '#fff' },
    secondary: { main: '#f4ce14' },
  },
  shape: { borderRadius: 12 },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
