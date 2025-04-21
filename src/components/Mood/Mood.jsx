import React, { useState, useMemo } from 'react';
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
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
  const [noteText, setNoteText] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all');

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setOpenDialog(true);
  };

  const handleSaveMood = () => {
    const newMoodEntry = {
      mood: selectedMood,
      note: noteText,
      timestamp: new Date().toISOString(),
      value: moods.indexOf(selectedMood),
    };
    setMoodHistory([newMoodEntry, ...moodHistory]);
    setNoteText('');
    setOpenDialog(false);
  };

  const filteredMoodHistory = useMemo(() => {
    let filtered = [...moodHistory];
    const now = new Date();
    
    if (timeFilter === 'week') {
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      filtered = moodHistory.filter(entry =>
        isWithinInterval(parseISO(entry.timestamp), { start: weekStart, end: weekEnd })
      );
    }
    return filtered;
  }, [moodHistory, timeFilter]);

  const chartData = useMemo(() => {
    return filteredMoodHistory.map(entry => ({
      timestamp: format(parseISO(entry.timestamp), 'MM/dd HH:mm'),
      value: entry.value,
    })).reverse();
  }, [filteredMoodHistory]);

  const getMoodStats = () => {
    if (filteredMoodHistory.length === 0) return null;
    
    const moodCounts = filteredMoodHistory.reduce((acc, entry) => {
      const label = entry.mood.label;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    const totalEntries = filteredMoodHistory.length;
    const predominantMood = Object.entries(moodCounts)
      .reduce((a, b) => (a[1] > b[1] ? a : b))[0];

    return {
      totalEntries,
      predominantMood,
      moodPercentages: Object.entries(moodCounts).map(([mood, count]) => ({
        mood,
        percentage: ((count / totalEntries) * 100).toFixed(1)
      }))
    };
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

      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Mood Statistics</Typography>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeFilter}
              label="Time Range"
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {getMoodStats() && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Typography variant="body1">
                Total entries: {getMoodStats().totalEntries}
              </Typography>
              <Typography variant="body1">
                Predominant mood: {getMoodStats().predominantMood}
              </Typography>
              <Box sx={{ mt: 2 }}>
                {getMoodStats().moodPercentages.map(({ mood, percentage }) => (
                  <Typography key={mood} variant="body2">
                    {mood}: {percentage}%
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {chartData.length > 0 && (
          <Card sx={{ mb: 4, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Mood Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Mood Level"
                  stroke="#8884d8"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}
      </Box>

      <Typography variant="h5" gutterBottom>
        Mood History
      </Typography>
      <Grid container spacing={3}>
        {filteredMoodHistory.map((entry, index) => (
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
                      {format(parseISO(entry.timestamp), 'PPpp')}
                    </Typography>
                    {entry.note && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Note: {entry.note}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Mood Entry</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
            {selectedMood && (
              <>
                <selectedMood.icon
                  sx={{
                    fontSize: 40,
                    color: selectedMood.color,
                    mr: 2
                  }}
                />
                <Typography variant="h6">{selectedMood.label}</Typography>
              </>
            )}
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Add a note (optional)"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveMood} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Mood;