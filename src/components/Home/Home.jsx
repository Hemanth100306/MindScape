import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BookIcon from '@mui/icons-material/Book';
import MoodIcon from '@mui/icons-material/Mood';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ChatIcon from '@mui/icons-material/Chat';

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
    title: 'Symptoms Checker',
    description: 'Monitor your mental health symptoms',
    icon: <HealthAndSafetyIcon sx={{ fontSize: 40 }} />,
    path: '/symptoms'
  },
  {
    title: 'Chat Support',
    description: 'Get help and support through chat',
    icon: <ChatIcon sx={{ fontSize: 40 }} />,
    path: '/chat'
  }
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Welcome to MindScape
      </Typography>
      <Typography variant="h6" color="textSecondary" paragraph align="center" sx={{ mb: 6 }}>
        Your personal mental health companion
      </Typography>

      <Grid container spacing={4}>
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={3} key={feature.title}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea
                onClick={() => navigate(feature.path)}
                sx={{ height: '100%' }}
              >
                <CardContent sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3
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