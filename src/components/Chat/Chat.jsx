import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SendIcon from '@mui/icons-material/Send';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // Add user message
      const userMessage = {
        text: newMessage,
        sender: 'user',
        timestamp: new Date().toLocaleString(),
      };
      
      // Simulate AI response
      const aiResponse = {
        text: "Thank you for sharing. I'm here to help and support you. Would you like to tell me more about what's on your mind?",
        sender: 'ai',
        timestamp: new Date().toLocaleString(),
      };

      setMessages([...messages, userMessage, aiResponse]);
      setNewMessage('');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Chat Support
      </Typography>

      <Paper
        elevation={3}
        sx={{
          height: '60vh',
          display: 'flex',
          flexDirection: 'column',
          mb: 2,
        }}
      >
        <List
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
          }}
        >
          {messages.map((message, index) => (
            <ListItem
              key={index}
              sx={{
                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                gap: 1,
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
                  }}
                >
                  {message.sender === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                </Avatar>
              </ListItemAvatar>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  bgcolor: message.sender === 'user' ? 'primary.light' : 'secondary.light',
                }}
              >
                <ListItemText
                  primary={message.text}
                  secondary={message.timestamp}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: message.sender === 'user' ? 'primary.contrastText' : 'secondary.contrastText',
                    },
                    '& .MuiListItemText-secondary': {
                      color: message.sender === 'user' ? 'primary.contrastText' : 'secondary.contrastText',
                    },
                  }}
                />
              </Paper>
            </ListItem>
          ))}
        </List>

        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            gap: 1,
          }}
        >
          <TextField
            fullWidth
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            variant="outlined"
            size="small"
          />
          <Button
            type="submit"
            variant="contained"
            endIcon={<SendIcon />}
            disabled={!newMessage.trim()}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Chat;