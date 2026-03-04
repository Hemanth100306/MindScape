import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/Auth/AuthProvider';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import Layout from './components/Layout/Layout';
import Home from './components/Home/Home';
import Journal from './components/Journal/Journal';
import Mood from './components/Mood/Mood';
import Symptoms from './components/Symptoms/Symptoms';
import Chat from './components/Chat/Chat';
import Resources from './components/Resources/Resources';
import Remedies from './components/Remedies/Remedies';
import Breathe from './components/Breathe/Breathe';
import NotFound from './components/NotFound/NotFound';
import Profile from './components/Profile/Profile';
import Insights from './components/Insights/Insights';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            {/* Protected */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
            <Route path="/mood" element={<ProtectedRoute><Mood /></ProtectedRoute>} />
            <Route path="/breathe" element={<ProtectedRoute><Breathe /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/symptoms" element={<ProtectedRoute><Symptoms /></ProtectedRoute>} />
            <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
            <Route path="/remedies" element={<ProtectedRoute><Remedies /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
            {/* 404 catch-all */}
            <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
