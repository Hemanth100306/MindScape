import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Alert,
  Button,
  Box,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const Resources = () => {
  const [expanded, setExpanded] = useState({});

  const mentalHealthIssues = {
    'Anxiety Disorders': {
      description: 'Excessive fear and worry that interferes with daily activities',
      professionalHelp: [
        'Cognitive Behavioral Therapy (CBT)',
        'Exposure Therapy',
        'Medications (SSRIs, SNRIs)'
      ],
      selfCare: [
        'Practice deep breathing exercises',
        'Limit caffeine and alcohol intake',
        'Try progressive muscle relaxation',
        'Maintain a regular sleep schedule'
      ],
      crisisResources: [
        'National Suicide Prevention Lifeline: 988',
        'Crisis Text Line: Text HOME to 741741'
      ]
    },
    'Depression': {
      description: 'Persistent sadness and loss of interest affecting daily life',
      professionalHelp: [
        'Psychotherapy (CBT, Interpersonal Therapy)',
        'Antidepressant medications',
        'Electroconvulsive therapy (ECT) for severe cases'
      ],
      selfCare: [
        'Maintain a regular sleep schedule',
        'Engage in physical activity',
        'Connect with supportive people',
        'Practice mindfulness meditation'
      ],
      crisisResources: [
        'National Suicide Prevention Lifeline: 988',
        'SAMHSA Treatment Referral Helpline: 1-800-662-HELP (4357)'
      ]
    },
    'Bipolar Disorder': {
      description: 'Extreme mood swings from mania to depression',
      professionalHelp: [
        'Mood stabilizers (Lithium, Valproate)',
        'Antipsychotic medications',
        'Psychotherapy and psychoeducation'
      ],
      selfCare: [
        'Maintain a mood diary',
        'Stick to a daily routine',
        'Avoid alcohol and drugs',
        'Monitor sleep patterns'
      ],
      crisisResources: [
        'National Alliance on Mental Illness (NAMI) Helpline: 1-800-950-NAMI (6264)',
        'Crisis Text Line: Text HOME to 741741'
      ]
    },
    'PTSD': {
      description: 'Persistent symptoms following a traumatic event',
      professionalHelp: [
        'Trauma-focused psychotherapy (EMDR, CPT)',
        'SSRI medications',
        'Group therapy'
      ],
      selfCare: [
        'Practice grounding techniques',
        'Maintain a regular routine',
        'Limit exposure to trauma reminders',
        'Practice self-compassion'
      ],
      crisisResources: [
        'Veterans Crisis Line: 1-800-273-8255 (Press 1)',
        'National Domestic Violence Hotline: 1-800-799-SAFE (7233)'
      ]
    },
    'OCD': {
      description: 'Unwanted recurring thoughts and compulsive behaviors',
      professionalHelp: [
        'Exposure and Response Prevention (ERP) therapy',
        'SSRI medications',
        'Cognitive therapy'
      ],
      selfCare: [
        'Practice exposure and response prevention',
        'Challenge obsessive thoughts',
        'Establish a structured routine',
        'Limit reassurance-seeking behaviors'
      ],
      crisisResources: [
        'International OCD Foundation: 1-617-973-5801',
        'Crisis Text Line: Text HOME to 741741'
      ]
    },
    'Eating Disorders': {
      description: 'Extreme eating behaviors and preoccupation with weight',
      professionalHelp: [
        'Nutritional counseling',
        'Cognitive Behavioral Therapy',
        'Medical monitoring'
      ],
      selfCare: [
        'Establish regular eating patterns',
        'Challenge negative body thoughts',
        'Avoid dieting behaviors',
        'Practice self-acceptance'
      ],
      crisisResources: [
        'National Eating Disorders Association Helpline: 1-800-931-2237',
        'Crisis Text Line: Text HOME to 741741'
      ]
    },
    'Schizophrenia': {
      description: 'Distorted thinking, perceptions, and behaviors',
      professionalHelp: [
        'Antipsychotic medications',
        'Psychosocial treatments',
        'Cognitive remediation therapy'
      ],
      selfCare: [
        'Maintain medication regimen',
        'Establish a daily routine',
        'Avoid substance use',
        'Join a support group'
      ],
      crisisResources: [
        'SAMHSA Treatment Referral Helpline: 1-800-662-HELP (4357)',
        'National Suicide Prevention Lifeline: 988'
      ]
    }
  };

  const handleToggle = (issue) => {
    setExpanded(prev => ({
      ...prev,
      [issue]: !prev[issue]
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mental Health Resources
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Browse through our collection of mental health resources. These suggestions are not a substitute for
        professional help. If you're in crisis, please contact emergency services.
      </Alert>

      <Paper elevation={3} sx={{ p: 3 }}>
        {Object.entries(mentalHealthIssues).map(([issue, data]) => (
          <Box key={issue} sx={{ mb: 2 }}>
            <Button
              fullWidth
              onClick={() => handleToggle(issue)}
              endIcon={expanded[issue] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ justifyContent: 'space-between' }}
            >
              {issue}
            </Button>
            <Collapse in={expanded[issue]}>
              <Box sx={{ pl: 2, pr: 2 }}>
                <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                  {data.description}
                </Typography>
                
                <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>
                  Professional Treatment Options:
                </Typography>
                <List component="div" disablePadding>
                  {data.professionalHelp.map((item, index) => (
                    <ListItem key={`prof-${index}`} sx={{ pl: 4 }}>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
                
                <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>
                  Self-Care Strategies:
                </Typography>
                <List component="div" disablePadding>
                  {data.selfCare.map((item, index) => (
                    <ListItem key={`self-${index}`} sx={{ pl: 4 }}>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
                
                <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold', color: 'error.main' }}>
                  Crisis Resources:
                </Typography>
                <List component="div" disablePadding>
                  {data.crisisResources.map((item, index) => (
                    <ListItem key={`crisis-${index}`} sx={{ pl: 4 }}>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Collapse>
          </Box>
        ))}
      </Paper>
    </Container>
  );
};

export default Resources;