import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './components/Auth/AuthProvider';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Layout from './components/Layout/Layout';
import Home from './components/Home/Home';
import Journal from './components/Journal/Journal';
import Mood from './components/Mood/Mood';
import Symptoms from './components/Symptoms/Symptoms';
import Chat from './components/Chat/Chat';
import Resources from './components/Resources/Resources';
import Remedies from './components/Remedies/Remedies';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#ff6b6b' : '#ff9e9e',
    },
    secondary: {
      main: mode === 'light' ? '#48dbfb' : '#7ae1f9',
    },
    background: {
      default: mode === 'light' 
        ? 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' 
        : 'linear-gradient(135deg, #434343 0%, #000000 100%)',
      paper: mode === 'light' 
        ? 'linear-gradient(to right, #ffffff, #f8f9fa)' 
        : 'linear-gradient(to right, #1e1e1e, #121212)',
    },
    text: {
      primary: mode === 'light' ? '#2c3e50' : '#ecf0f1',
    },
  },
});

function App() {
  const [mode, setMode] = useState('light');
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Layout toggleColorMode={toggleColorMode}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/Journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
              <Route path="/mood" element={<ProtectedRoute><Mood /></ProtectedRoute>} />
              <Route path="/symptoms" element={<ProtectedRoute><Symptoms /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
              <Route path="/remedies" element={<ProtectedRoute><Remedies /></ProtectedRoute>} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
