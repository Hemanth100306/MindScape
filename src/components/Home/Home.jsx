import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BookIcon from '@mui/icons-material/Book';
import MoodIcon from '@mui/icons-material/Mood';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ChatIcon from '@mui/icons-material/Chat';
import { keyframes } from '@emotion/react';

const features = [
  {
    title: 'Journal',
    description: 'Write down your thoughts and feelings',
    icon: <BookIcon sx={{ fontSize: 40 }} />,
    path: '/journal'
  },
  {
    title: 'Mood Tracker',
    description: 'Track your daily mood and emotions',
    icon: <MoodIcon sx={{ fontSize: 40 }} />,
    path: '/mood'
  },
  {
    title: 'Mental Health Assessment',
    description: 'Assess your mental health status',
    icon: <HealthAndSafetyIcon sx={{ fontSize: 40 }} />,
    path: '/symptoms'
  },
  {
    title: 'Mental Health Resources',
    description: 'Browse helpful mental health resources',
    icon: <ChatIcon sx={{ fontSize: 40 }} />,
    path: '/resources'
  },
  {
    title: 'Remedies',
    description: 'Find mental health remedies and suggestions',
    icon: <HealthAndSafetyIcon sx={{ fontSize: 40 }} />,
    path: '/remedies'
  }
];

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ 
      mt: 4,
      background: theme => theme.palette.mode === 'light'
        ? 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,249,250,0.9) 100%)'
        : 'linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(18,18,18,0.9) 100%)',
      borderRadius: 4,
      p: 4,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
    }}>
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom 
        align="center"
        sx={{
          fontWeight: 'bold',
          background: theme => theme.palette.mode === 'light'
            ? 'linear-gradient(90deg, #ff6b6b, #48dbfb)'
            : 'linear-gradient(90deg, #ff9e9e, #7ae1f9)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        Welcome to MindScape
      </Typography>
      <Typography 
        variant="h6" 
        paragraph 
        align="center" 
        sx={{ 
          mb: 6,
          color: 'text.primary',
          fontStyle: 'italic'
        }}
      >
        Your personal mental health companion
      </Typography>

      <Grid container spacing={4}>
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={3} key={feature.title}>
            <Card 
              sx={{ 
                height: '100%',
                background: theme => theme.palette.mode === 'light'
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(18,18,18,0.95) 100%)',
                borderRadius: 4,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                }
              }}
            >
              <CardActionArea
                onClick={() => navigate(feature.path)}
                sx={{ height: '100%' }}
              >
                <CardContent sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                  animation: `${pulse} 3s infinite ease-in-out`
                }}>
                  {feature.icon}
                  <Typography variant="h6" component="h2" sx={{ mt: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;