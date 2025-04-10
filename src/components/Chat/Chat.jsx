import { useState, useRef, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Paper,
  Avatar,
  Divider,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

const Chat = () => {
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
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        text: getAIResponse(input),
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);

    setInput('');
  };

  const getAIResponse = (userInput) => {
    // Simple response logic - in a real app, this would connect to an AI service
    const responses = [
      'I understand how you\'re feeling. Would you like to talk more about it?',
      'That sounds challenging. How long have you been feeling this way?',
      "I'm here to listen. What do you think triggered these feelings?",
      'Your feelings are valid. Have you considered talking to a mental health professional about this?',
      'Let\'s explore some coping strategies together. What has helped you in the past?',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        AI Support Chat
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="body1" paragraph align="center">
            Chat with our AI assistant for support and guidance. While helpful,
            remember this is not a replacement for professional mental health care.
          </Typography>
        </CardContent>
      </Card>

      <Paper
        sx={{
          height: '60vh',
          mb: 2,
          p: 2,
          overflow: 'auto',
          backgroundColor: '#f5f5f5',
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
              mb: 2,
            }}
          >
            <Avatar
              sx={{
                bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
                mr: message.sender === 'user' ? 0 : 1,
                ml: message.sender === 'user' ? 1 : 0,
              }}
            >
              {message.sender === 'user' ? <PersonIcon /> : <SmartToyIcon />}
            </Avatar>
            <Paper
              sx={{
                maxWidth: '70%',
                p: 2,
                backgroundColor: message.sender === 'user' ? 'primary.light' : 'white',
                color: message.sender === 'user' ? 'white' : 'text.primary',
              }}
            >
              <Typography variant="body1">{message.text}</Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                {message.timestamp}
              </Typography>
            </Paper>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Paper>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          variant="outlined"
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!input.trim()}
        >
          Send
        </Button>
      </Box>
    </Container>
  );
};

export default Chat;