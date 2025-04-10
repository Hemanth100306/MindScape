import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const Journal = () => {
  const [entries, setEntries] = useState(() => {
    const savedEntries = localStorage.getItem('journalEntries');
    return savedEntries ? JSON.parse(savedEntries) : [];
  });
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    localStorage.setItem('journalEntries', JSON.stringify(entries));
  }, [entries]);

  const showNotification = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;

    const newEntry = {
      id: Date.now(),
      title,
      content,
      date: new Date().toLocaleString(),
    };

    setEntries([newEntry, ...entries]);
    setTitle('');
    setContent('');
    showNotification('Journal entry saved successfully!');
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setOpenDialog(true);
  };

  const handleSaveEdit = () => {
    if (!title.trim() || !content.trim()) return;

    setEntries(entries.map((entry) =>
      entry.id === editingEntry.id
        ? { ...entry, title, content }
        : entry
    ));

    setOpenDialog(false);
    setTitle('');
    setContent('');
    setEditingEntry(null);
    showNotification('Journal entry updated successfully!');
  };

  const handleDelete = (id) => {
    setEntries(entries.filter((entry) => entry.id !== id));
    showNotification('Journal entry deleted successfully!', 'info');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Journal
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            id="journal-title"
            name="journal-title"
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            id="journal-content"
            name="journal-content"
            fullWidth
            multiline
            rows={6}
            label="Write your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            fullWidth
            disabled={!title.trim() || !content.trim()}
          >
            Save Entry
          </Button>
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom>
        Previous Entries
      </Typography>

      <Grid container spacing={3}>
        {entries.map((entry) => (
          <Grid item xs={12} key={entry.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{entry.title}</Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(entry)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(entry.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography color="textSecondary" sx={{ mb: 2 }}>
                  {entry.date}
                </Typography>
                <Typography
                  sx={{
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word',
                  }}
                >
                  {entry.content}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Journal Entry</DialogTitle>
        <DialogContent>
          <TextField
            id="edit-journal-title"
            name="edit-journal-title"
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            id="edit-journal-content"
            name="edit-journal-content"
            fullWidth
            multiline
            rows={6}
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Journal;