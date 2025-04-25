import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import BookIcon from '@mui/icons-material/Book';
import MoodIcon from '@mui/icons-material/Mood';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ChatIcon from '@mui/icons-material/Chat';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const drawerWidth = 240;

const menuItems = [
  { text: 'Home', path: '/', icon: <HomeIcon sx={{ color: 'primary.main' }} /> },
  { text: 'Journal', path: '/journal', icon: <BookIcon sx={{ color: 'primary.main' }} /> },
  { text: 'Mood Tracker', path: '/mood', icon: <MoodIcon sx={{ color: 'primary.main' }} /> },
  { text: 'Mental Health Assessment', path: '/symptoms', icon: <HealthAndSafetyIcon sx={{ color: 'primary.main' }} /> },
  { text: 'Mental Health Resources', path: '/resources', icon: <ChatIcon sx={{ color: 'primary.main' }} /> },
  { text: 'Remedies', path: '/remedies', icon: <HealthAndSafetyIcon sx={{ color: 'primary.main' }} /> },
];

const Layout = ({ children, toggleColorMode }) => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={handleDrawerToggle}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar 
        position="fixed"
        sx={{
          background: theme => theme.palette.mode === 'light' 
            ? 'linear-gradient(90deg, rgba(255,107,107,1) 0%, rgba(72,219,251,1) 100%)' 
            : 'linear-gradient(90deg, rgba(255,158,158,1) 0%, rgba(122,225,249,1) 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            MindScape
          </Typography>
          <IconButton color="inherit" onClick={toggleColorMode}>
            {useTheme().palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          variant="temporary"
          anchor="left"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: theme => theme.palette.mode === 'light'
                ? 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,249,250,1) 100%)'
                : 'linear-gradient(180deg, rgba(30,30,30,1) 0%, rgba(18,18,18,1) 100%)',
              borderRight: 'none',
              boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          mt: '64px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;