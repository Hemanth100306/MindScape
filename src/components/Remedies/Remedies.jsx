import React, { useState } from 'react';
import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  Container,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const mentalHealthConditions = [
  {
    name: 'Anxiety Disorders',
    remedies: [
      'Cognitive Behavioral Therapy (CBT) - Helps identify and change negative thought patterns',
      'Mindfulness meditation - Practice daily for 10-20 minutes to reduce stress',
      'Regular exercise - 30 minutes of aerobic activity 3-5 times per week',
      'Limit caffeine to 200mg/day and avoid alcohol which can worsen anxiety',
      '4-7-8 breathing technique: Inhale 4 sec, hold 7 sec, exhale 8 sec'
    ]
  },
  {
    name: 'Depression',
    remedies: [
      'Cognitive Behavioral Therapy (CBT) or Interpersonal Therapy (IPT)',
      'SSRIs (e.g., Prozac, Zoloft) or SNRIs (e.g., Effexor) as prescribed',
      '30 minutes of sunlight exposure daily to boost serotonin',
      'Maintain consistent sleep/wake times even on weekends',
      'Schedule weekly social activities with supportive friends/family'
    ]
  },
  {
    name: 'Bipolar Disorder',
    remedies: [
      'Mood stabilizers like lithium or valproate as prescribed',
      'Family-focused therapy to improve communication and support',
      'Sleep hygiene: Dark, cool room; no screens 1 hour before bed',
      'Daily mood tracking to identify early warning signs',
      'Avoid alcohol which can trigger episodes'
    ]
  },
  {
    name: 'PTSD',
    remedies: [
      'Prolonged Exposure Therapy or Cognitive Processing Therapy',
      'EMDR sessions with a trained therapist',
      'Join a support group (e.g., NAMI Connection)',
      '5-4-3-2-1 grounding: Name 5 things you see, 4 you feel, etc.',
      'Create a safety plan with emergency contacts'
    ]
  },
  {
    name: 'OCD',
    remedies: [
      'ERP therapy: Gradually face fears without compulsions',
      'SSRIs (e.g., Luvox, Anafranil) may help reduce symptoms',
      'Mindfulness to observe thoughts without judgment',
      'Use timers to delay compulsions (start with 5 minutes)',
      'Keep a thought record to identify triggers'
    ]
  },
  {
    name: 'ADHD',
    remedies: [
      'Stimulant medications (e.g., Adderall, Ritalin) as prescribed',
      'Behavioral therapy to improve organization and time management',
      'Use planners/reminders and break tasks into small steps',
      'Regular exercise to boost dopamine and focus',
      'Limit distractions with noise-cancelling headphones'
    ]
  },
  {
    name: 'Eating Disorders',
    remedies: [
      'Family-Based Treatment (FBT) for adolescents with anorexia',
      'Cognitive Behavioral Therapy for bulimia/binge eating',
      'Work with a dietitian to establish regular eating patterns',
      'Address underlying emotional issues in therapy',
      'Avoid diet culture and weight-focused conversations'
    ]
  },
  {
    name: 'Seasonal Affective Disorder',
    remedies: [
      'Light therapy: 10,000 lux light box for 30 mins each morning',
      'Vitamin D supplements if levels are low',
      'Plan a winter vacation to sunny location if possible',
      'Dawn simulator alarm to ease morning wake-up',
      'Regular social activities to combat isolation'
    ]
  }
];

const Remedies = () => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mental Health Remedies
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph sx={{ mb: 4 }}>
        Professional treatments and self-care strategies for common mental health conditions
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        {mentalHealthConditions.map((condition, index) => (
          <Accordion 
            key={condition.name} 
            expanded={expanded === index} 
            onChange={handleChange(index)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Typography variant="h6">{condition.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense={false}>
                {condition.remedies.map((remedy, remedyIndex) => (
                  <ListItem key={remedyIndex}>
                    <ListItemText primary={remedy} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      
      <Typography variant="body2" color="textSecondary">
        Note: These remedies are for informational purposes only. Please consult with a qualified mental health professional for proper diagnosis and treatment.
      </Typography>
    </Container>
  );
};

export default Remedies;