import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Box,
  Paper,
  Tooltip,
} from '@mui/material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';

const moods = [
  { icon: SentimentVeryDissatisfiedIcon, label: 'Very Sad', color: '#d32f2f' },
  { icon: SentimentDissatisfiedIcon, label: 'Sad', color: '#f57c00' },
  { icon: SentimentNeutralIcon, label: 'Neutral', color: '#ffd700' },
  { icon: SentimentSatisfiedIcon, label: 'Happy', color: '#4caf50' },
  { icon: SentimentVerySatisfiedIcon, label: 'Very Happy', color: '#2196f3' },
];

const Mood = () => {
  const [moodHistory, setMoodHistory] = useState([]);

  const handleMoodSelect = (mood) => {
    const newMoodEntry = {
      mood: mood,
      timestamp: new Date().toLocaleString(),
    };
    setMoodHistory([newMoodEntry, ...moodHistory]);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mood Tracker
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          How are you feeling today?
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          {moods.map((mood) => (
            <Tooltip title={mood.label} key={mood.label}>
              <IconButton
                onClick={() => handleMoodSelect(mood)}
                sx={{
                  '&:hover': {
                    backgroundColor: `${mood.color}22`,
                  },
                }}
              >
                <mood.icon
                  sx={{
                    fontSize: 40,
                    color: mood.color,
                  }}
                />
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Mood History
      </Typography>
      <Grid container spacing={3}>
        {moodHistory.map((entry, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <entry.mood.icon
                    sx={{
                      fontSize: 30,
                      color: entry.mood.color,
                    }}
                  />
                  <Box>
                    <Typography variant="h6">{entry.mood.label}</Typography>
                    <Typography color="textSecondary" variant="body2">
                      {entry.timestamp}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Mood;