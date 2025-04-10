import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  Rating,
  TextField,
  Chip,
} from '@mui/material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';

const customIcons = {
  1: {
    icon: <SentimentVeryDissatisfiedIcon />,
    label: 'Very Sad',
  },
  2: {
    icon: <SentimentDissatisfiedIcon />,
    label: 'Sad',
  },
  3: {
    icon: <SentimentSatisfiedIcon />,
    label: 'Neutral',
  },
  4: {
    icon: <SentimentSatisfiedAltIcon />,
    label: 'Happy',
  },
  5: {
    icon: <SentimentVerySatisfiedIcon />,
    label: 'Very Happy',
  },
};

const moodTags = [
  'Anxious',
  'Calm',
  'Tired',
  'Energetic',
  'Stressed',
  'Relaxed',
  'Motivated',
  'Unmotivated',
  'Focused',
  'Distracted',
];

const Mood = () => {
  const [moodRating, setMoodRating] = useState(3);
  const [selectedTags, setSelectedTags] = useState([]);
  const [notes, setNotes] = useState('');
  const [entries, setEntries] = useState([]);

  const handleTagClick = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    const newEntry = {
      date: new Date().toLocaleString(),
      rating: moodRating,
      tags: [...selectedTags],
      notes,
    };

    setEntries([newEntry, ...entries]);
    setSelectedTags([]);
    setNotes('');
    setMoodRating(3);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Mood Tracker
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            How are you feeling today?
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Rating
              id="mood-rating-input"
              name="mood-rating"
              value={moodRating}
              onChange={(event, newValue) => {
                setMoodRating(newValue);
              }}
              max={5}
              icon={customIcons[5].icon}
              emptyIcon={customIcons[5].icon}
              sx={{ fontSize: '2rem' }}
            />
            <Typography sx={{ ml: 2 }}>
              {customIcons[moodRating]?.label}
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom>
            Select mood tags:
          </Typography>
          <Box sx={{ mb: 3 }}>
            {moodTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => handleTagClick(tag)}
                color={selectedTags.includes(tag) ? 'primary' : 'default'}
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>

          <TextField
            id="mood-notes"
            name="mood-notes"
            fullWidth
            multiline
            rows={4}
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            onClick={handleSubmit}
            fullWidth
          >
            Save Entry
          </Button>
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom>
        Recent Entries
      </Typography>

      <Grid container spacing={3}>
        {entries.map((entry, index) => (
          <Grid item xs={12} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography color="textSecondary">
                    {entry.date}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {customIcons[entry.rating].icon}
                    <Typography sx={{ ml: 1 }}>
                      {customIcons[entry.rating].label}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  {entry.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>

                {entry.notes && (
                  <Typography variant="body2">
                    {entry.notes}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Mood;