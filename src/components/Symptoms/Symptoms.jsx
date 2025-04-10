import React from 'react';
import { useState } from 'react';
import {
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Button,
  Box,
  Alert,
} from '@mui/material';

const questions = [
  // Depression symptoms
  {
    question: 'Over the past 2 weeks, how often have you felt down, depressed, or hopeless?',
    options: [
      { value: '0', label: 'Not at all' },
      { value: '1', label: 'Several days' },
      { value: '2', label: 'More than half the days' },
      { value: '3', label: 'Nearly every day' },
    ],
  },
  {
    question: 'How often have you had little interest or pleasure in doing things?',
    options: [
      { value: '0', label: 'Not at all' },
      { value: '1', label: 'Several days' },
      { value: '2', label: 'More than half the days' },
      { value: '3', label: 'Nearly every day' },
    ],
  },
  // Anxiety symptoms
  {
    question: 'How often have you felt nervous, anxious, or on edge?',
    options: [
      { value: '0', label: 'Not at all' },
      { value: '1', label: 'Several days' },
      { value: '2', label: 'More than half the days' },
      { value: '3', label: 'Nearly every day' },
    ],
  },
  {
    question: 'How often have you been unable to stop or control worrying?',
    options: [
      { value: '0', label: 'Not at all' },
      { value: '1', label: 'Several days' },
      { value: '2', label: 'More than half the days' },
      { value: '3', label: 'Nearly every day' },
    ],
  },
  // Sleep patterns
  {
    question: 'How often have you had trouble falling or staying asleep, or sleeping too much?',
    options: [
      { value: '0', label: 'Not at all' },
      { value: '1', label: 'Several days' },
      { value: '2', label: 'More than half the days' },
      { value: '3', label: 'Nearly every day' },
    ],
  },
  {
    question: 'How often have you felt tired or had little energy?',
    options: [
      { value: '0', label: 'Not at all' },
      { value: '1', label: 'Several days' },
      { value: '2', label: 'More than half the days' },
      { value: '3', label: 'Nearly every day' },
    ],
  },
  // Concentration and cognitive function
  {
    question: 'How often have you had trouble concentrating on things?',
    options: [
      { value: '0', label: 'Not at all' },
      { value: '1', label: 'Several days' },
      { value: '2', label: 'More than half the days' },
      { value: '3', label: 'Nearly every day' },
    ],
  },
  // Social interactions
  {
    question: 'How often have you avoided social situations or felt uncomfortable in them?',
    options: [
      { value: '0', label: 'Not at all' },
      { value: '1', label: 'Several days' },
      { value: '2', label: 'More than half the days' },
      { value: '3', label: 'Nearly every day' },
    ],
  },
  // Self-image and worth
  {
    question: 'How often have you felt bad about yourself or felt that you are a failure?',
    options: [
      { value: '0', label: 'Not at all' },
      { value: '1', label: 'Several days' },
      { value: '2', label: 'More than half the days' },
      { value: '3', label: 'Nearly every day' },
    ],
  },
  // Physical symptoms
  {
    question: 'How often have you experienced physical symptoms like headaches, stomach problems, or muscle tension?',
    options: [
      { value: '0', label: 'Not at all' },
      { value: '1', label: 'Several days' },
      { value: '2', label: 'More than half the days' },
      { value: '3', label: 'Nearly every day' },
    ],
  },
];


const Symptoms = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);

  const handleNext = () => {
    if (activeStep === questions.length - 1) {
      setCompleted(true);
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAnswerChange = (event) => {
    setAnswers({
      ...answers,
      [activeStep]: event.target.value,
    });
  };

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, value) => sum + parseInt(value), 0);
  };

  const getAssessment = (score) => {
    const maxScore = questions.length * 3;
    const percentage = (score / maxScore) * 100;
    
    // Analyze answers by category
    const categoryScores = {
      depression: (parseInt(answers[0] || 0) + parseInt(answers[1] || 0)) / 6 * 100,
      anxiety: (parseInt(answers[2] || 0) + parseInt(answers[3] || 0)) / 6 * 100,
      sleep: (parseInt(answers[4] || 0) + parseInt(answers[5] || 0)) / 6 * 100,
      cognitive: parseInt(answers[6] || 0) / 3 * 100,
      social: parseInt(answers[7] || 0) / 3 * 100,
      selfImage: parseInt(answers[8] || 0) / 3 * 100,
      physical: parseInt(answers[9] || 0) / 3 * 100
    };

    // Generate personalized feedback
    let feedback = [];
    
    // Determine overall well-being status with more granular levels
    if (percentage <= 15) {
      feedback.push('✨ Your Well-being Assessment\n\nYour responses indicate minimal levels of distress. Your current mental well-being strategies are working effectively.');
    } else if (percentage <= 30) {
      feedback.push('✨ Your Well-being Assessment\n\nYour responses show low levels of distress. While you\'re managing well, consider exploring additional strategies to enhance your mental well-being.');
    } else if (percentage <= 45) {
      feedback.push('✨ Your Well-being Assessment\n\nYour responses indicate mild levels of distress. This is common, and we\'ve prepared specific strategies to help maintain and improve your mental health.');
    } else if (percentage <= 60) {
      feedback.push('✨ Your Well-being Assessment\n\nYour responses show moderate levels of distress. We\'ve identified key areas where support and specific coping strategies can help you feel better.');
    } else if (percentage <= 75) {
      feedback.push('✨ Your Well-being Assessment\n\nYour responses indicate elevated levels of distress. We\'ve prepared a focused action plan to help you address these challenges.');
    } else if (percentage <= 90) {
      feedback.push('✨ Your Well-being Assessment\n\nYour responses show significant levels of distress. We strongly recommend professional support, and we\'ve outlined immediate steps you can take.');
    } else {
      feedback.push('✨ Your Well-being Assessment\n\nYour responses indicate high levels of distress. We strongly encourage seeking professional support. Below are immediate steps and resources for support.');
    }

    // Add category-specific recommendations based on severity
    if (categoryScores.depression >= 75) {
      feedback.push('\n\n🔴 Priority: Mood Management\n• Schedule a consultation with a mental health professional\n• Start daily gratitude journaling (5 minutes morning/evening)\n• Re-engage with one enjoyable activity each day\n• Follow a structured daily routine\n• Get 30 minutes of natural light daily');
    } else if (categoryScores.depression > 50) {
      feedback.push('\n\n🟡 Focus Area: Mood Management\n• Start a simple gratitude practice (3 items daily)\n• Schedule one enjoyable activity each day\n• Maintain regular wake/sleep times\n• Spend 15-20 minutes outdoors daily');
    }
    
    if (categoryScores.anxiety >= 75) {
      feedback.push('\n\n🔴 Priority: Anxiety Management\n• Book a consultation with an anxiety specialist\n• Practice 5-5-5 breathing (3 times daily)\n• Use guided muscle relaxation apps\n• Break tasks into 30-minute segments\n• Limit caffeine after 2 PM\n• Join a local or online support group');
    } else if (categoryScores.anxiety > 50) {
      feedback.push('\n\n🟡 Focus Area: Anxiety Management\n• Try 4-4-4 breathing exercises twice daily\n• Use a simple relaxation technique\n• Break tasks into smaller steps\n• Monitor caffeine intake');
    }

    if (categoryScores.sleep >= 75) {
      feedback.push('\n\n🔴 Priority: Sleep Improvement\n• Consult a sleep specialist\n• Set fixed sleep/wake times (±30 minutes)\n• Create a 30-minute wind-down routine\n• No screens after 9 PM\n• Keep bedroom at 65-68°F/18-20°C\n• Use a sleep tracking app');
    } else if (categoryScores.sleep > 50) {
      feedback.push('\n\n🟡 Focus Area: Sleep Improvement\n• Set consistent sleep/wake times\n• Start a 15-minute bedtime routine\n• Reduce screen time 1 hour before bed\n• Optimize bedroom environment');
    }

    if (categoryScores.cognitive >= 75) {
      feedback.push('\n\n🔴 Priority: Focus & Concentration\n• Schedule a cognitive assessment\n• Use 25/5 Pomodoro cycles\n• Set up a dedicated quiet workspace\n• Practice 10-minute mindfulness sessions\n• Try brain training apps (15 mins daily)\n• Block distracting websites/apps');
    } else if (categoryScores.cognitive > 50) {
      feedback.push('\n\n🟡 Focus Area: Concentration\n• Try 20-minute focus blocks\n• Take 5-minute breaks hourly\n• Create a minimal workspace\n• Do 5-minute mindfulness exercises');
    }

    if (categoryScores.social >= 75) {
      feedback.push('\n\n🔴 Priority: Social Connection\n• Book a session with a counselor\n• Start with 10-minute social interactions\n• Join one structured group activity\n• Practice conversation skills daily\n• Schedule weekly check-ins with friends\n• Join an online support community');
    } else if (categoryScores.social > 50) {
      feedback.push('\n\n🟡 Focus Area: Social Connection\n• Have one brief social interaction daily\n• Join a weekly group activity\n• Practice active listening skills\n• Connect with one friend weekly');
    }

    if (categoryScores.selfImage >= 75) {
      feedback.push('\n\n🔴 Priority: Self-Image\n• Schedule therapy for self-esteem work\n• Write 3 daily affirmations\n• Set one achievable goal each day\n• Journal achievements for 5 mins daily\n• Practice thought reframing exercises\n• Join a self-development group');
    } else if (categoryScores.selfImage > 50) {
      feedback.push('\n\n🟡 Focus Area: Self-Image\n• Write one positive self-statement daily\n• Set a small goal each morning\n• Note one daily achievement\n• Challenge one negative thought daily');
    }

    if (categoryScores.physical >= 75) {
      feedback.push('\n\n🔴 Priority: Physical Well-being\n• Schedule a health check-up\n• Do 30 mins exercise 5 times weekly\n• Learn 2-3 stress-relief techniques\n• Plan balanced meals weekly\n• Try a yoga or tai chi class\n• Consider a wellness coach');
    } else if (categoryScores.physical > 50) {
      feedback.push('\n\n🟡 Focus Area: Physical Well-being\n• Walk 20 minutes daily\n• Learn one relaxation technique\n• Plan healthy meals 3 days ahead\n• Try a 10-minute yoga session');
    }

    feedback.push('\n\n⚠️ Important Note\nThis assessment is a screening tool, not a diagnosis. If you\'re experiencing persistent distress, please consult with a mental health professional for personalized evaluation and support.\n\n🌟 Next Steps\n1. Review your priority areas above\n2. Choose 2-3 actionable steps to start with\n3. Track your progress using the mood tracker\n4. Seek professional help if needed');

    return feedback.join('');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Mental Health Assessment
      </Typography>
      <Typography variant="body1" paragraph align="center" sx={{ mb: 4 }}>
        This questionnaire will help assess your mental well-being. Please answer honestly.
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {questions.map((_, index) => (
          <Step key={index}>
            <StepLabel></StepLabel>
          </Step>
        ))}
      </Stepper>

      {!completed ? (
        <Card>
          <CardContent>
            <FormControl component="fieldset" id="symptom-form" name="symptom-form">
              <FormLabel component="legend" sx={{ mb: 2 }}>
                {questions[activeStep].question}
              </FormLabel>
              <RadioGroup
                id="symptom-options"
                name="symptom-options"
                value={answers[activeStep] || ''}
                onChange={handleAnswerChange}
              >
                {questions[activeStep].options.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio />}
                    label={option.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!answers[activeStep]}
              >
                {activeStep === questions.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Assessment Complete
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              {getAssessment(calculateScore())}
            </Alert>
            <Typography variant="body1" paragraph>
              Remember that this is just a screening tool and not a professional diagnosis.
              If you're concerned about your mental health, please reach out to a qualified
              mental health professional.
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setActiveStep(0);
                setAnswers({});
                setCompleted(false);
              }}
            >
              Start Over
            </Button>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Symptoms;