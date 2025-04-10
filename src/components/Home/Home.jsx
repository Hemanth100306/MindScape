import React from 'react';
import { Box, Container, Grid, Typography, Card, CardContent, CardMedia, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MoodIcon from '@mui/icons-material/Mood';
import ChatIcon from '@mui/icons-material/Chat';
import BookIcon from '@mui/icons-material/Book';

const features = [
  {
    title: 'Mental Health Assessment',
    description: 'Identify potential mental health concerns through our comprehensive assessment tool.',
    icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
    path: '/symptoms'
  },
  {
    title: 'Mood Tracking',
    description: 'Monitor your emotional well-being and track your mood patterns over time.',
    icon: <MoodIcon sx={{ fontSize: 40 }} />,
    path: '/mood'
  },
  {
    title: 'Journaling',
    description: 'Express your thoughts and feelings in a private, secure digital journal.',
    icon: <BookIcon sx={{ fontSize: 40 }} />,
    path: '/journal'
  },
  {
    title: 'AI Chat Support',
    description: 'Get immediate support and guidance from our AI-powered chat assistant.',
    icon: <ChatIcon sx={{ fontSize: 40 }} />,
    path: '/chat'
  }
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{
        mt: { xs: 4, md: 8 },
        mb: { xs: 6, md: 10 },
        textAlign: 'center',
        position: 'relative',
      }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            background: 'linear-gradient(45deg, #3f51b5 30%, #4caf50 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 3
          }}
        >
          Welcome to MindScape
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{ maxWidth: '800px', mx: 'auto', mb: 6, px: 2 }}
        >
          Your personal mental wellness companion. Explore our features designed to support your mental health journey.
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, md: 4 }} sx={{ px: { xs: 2, md: 0 } }}>
        {features.map((feature) => (
          <Grid item key={feature.title} xs={12} sm={6} md={6}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                    color: 'primary.main'
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  {feature.title}
                </Typography>
                <Typography align="center">
                  {feature.description}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(feature.path)}
                  >
                    Explore
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;