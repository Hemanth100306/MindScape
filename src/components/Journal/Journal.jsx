import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState('');
  const [title, setTitle] = useState('');
  const [editIndex, setEditIndex] = useState(-1);
  const [openDialog, setOpenDialog] = useState(false);
  const [editEntry, setEditEntry] = useState({ title: '', content: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && newEntry.trim()) {
      setEntries([...entries, { title, content: newEntry, date: new Date().toLocaleString() }]);
      setTitle('');
      setNewEntry('');
    }
  };

  const handleDelete = (index) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditEntry({
      title: entries[index].title,
      content: entries[index].content,
    });
    setOpenDialog(true);
  };

  const handleSaveEdit = () => {
    if (editEntry.title.trim() && editEntry.content.trim()) {
      const newEntries = [...entries];
      newEntries[editIndex] = {
        ...newEntries[editIndex],
        title: editEntry.title,
        content: editEntry.content,
      };
      setEntries(newEntries);
      setOpenDialog(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Journal
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Write your thoughts..."
              multiline
              rows={4}
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Save Entry
            </Button>
          </form>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {entries.map((entry, index) => (
          <Grid item xs={12} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {entry.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {entry.date}
                </Typography>
                <Typography variant="body1" paragraph>
                  {entry.content}
                </Typography>
                <IconButton
                  onClick={() => handleEdit(index)}
                  color="primary"
                  size="small"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDelete(index)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Edit Journal Entry</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={editEntry.title}
            onChange={(e) => setEditEntry({ ...editEntry, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Content"
            multiline
            rows={4}
            value={editEntry.content}
            onChange={(e) => setEditEntry({ ...editEntry, content: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Journal;