import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Container,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const MAX_MESSAGES = 50; // Maximum number of messages to store

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      const newMessage = {
        text: input,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };

      // Add new message and maintain message limit
      setMessages(prev => {
        const updatedMessages = [...prev, newMessage];
        return updatedMessages.slice(-MAX_MESSAGES);
      });

      // Clear input
      setInput('');

      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          text: 'This is a placeholder response. AI integration pending.',
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => {
          const updatedMessages = [...prev, aiResponse];
          return updatedMessages.slice(-MAX_MESSAGES);
        });
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Container maxWidth="md" sx={{ height: '100vh', py: 2 }}>
      <Paper
        elevation={3}
        sx={{
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'primary.main',
            color: 'white',
          }}
        >
          MindScape Chat Assistant
        </Typography>

        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: 2,
            bgcolor: 'background.default',
          }}
        >
          <List>
            {messages.map((message, index) => (
              <ListItem
                key={index}
                sx={{
                  flexDirection: 'column',
                  alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
                    color: 'white',
                    maxWidth: '70%',
                  }}
                >
                  <ListItemText primary={message.text} />
                </Paper>
                <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary' }}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Box>

        <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              variant="outlined"
              sx={{ mr: 1 }}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!input.trim()}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&:disabled': {
                  bgcolor: 'action.disabledBackground',
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ChatInterface;