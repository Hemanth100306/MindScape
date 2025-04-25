import React from 'react';
import { Container, Typography, List, ListItem, ListItemText, Link } from '@mui/material';

const Resources = () => {
  const resources = [
    {
      title: 'National Suicide Prevention Lifeline',
      url: 'https://suicidepreventionlifeline.org',
      description: 'Free and confidential support for people in distress'
    },
    {
      title: 'NAMI (National Alliance on Mental Illness)',
      url: 'https://www.nami.org',
      description: 'Education, support groups, and advocacy for mental health'
    },
    {
      title: 'Crisis Text Line',
      url: 'https://www.crisistextline.org',
      description: 'Text HOME to 741741 for free, 24/7 crisis counseling'
    },
    {
      title: 'Psychology Today Therapist Finder',
      url: 'https://www.psychologytoday.com',
      description: 'Find licensed therapists in your area'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Mental Health Resources
      </Typography>
      <Typography variant="h6" color="textSecondary" paragraph align="center" sx={{ mb: 6 }}>
        Helpful resources for mental health support
      </Typography>

      <List>
        {resources.map((resource, index) => (
          <ListItem key={index} divider>
            <ListItemText
              primary={<Link href={resource.url} target="_blank" rel="noopener">{resource.title}</Link>}
              secondary={resource.description}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Resources;