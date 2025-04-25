import axios from 'axios';

const MENTAL_HEALTH_KEYWORDS = [
  'anxiety', 'depression', 'stress', 'mental health', 'therapy',
  'counseling', 'emotional', 'feeling', 'mood', 'panic',
  'worry', 'sad', 'lonely', 'fear', 'overwhelmed',
  'exhausted', 'tired', 'sleep', 'motivation', 'help'
];

const isMentalHealthRelated = (text) => {
  const lowercaseText = text.toLowerCase();
  return MENTAL_HEALTH_KEYWORDS.some(keyword => lowercaseText.includes(keyword));
};

const systemPrompt = `You are a mental health support chatbot. Your responses should be:
- Focused solely on mental health, emotional well-being, and self-care
- Empathetic and supportive
- Professional but warm
- Clear and concise
- Safety-conscious, always recommending professional help when needed

Avoid providing:
- Medical diagnoses
- Prescription advice
- Non-mental health related information
`;

const generateResponse = async (userMessage) => {
  try {
    if (!isMentalHealthRelated(userMessage)) {
      return {
        text: "I'm here to help with mental health related questions. Could you please rephrase your question to focus on your mental health, emotions, or well-being?",
        type: 'guidance'
      };
    }

    const response = await axios.post('https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta', {
      inputs: `${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`,
      parameters: {
        max_new_tokens: 250,
        temperature: 0.7,
        top_p: 0.95,
        repetition_penalty: 1.15
      }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = response.data[0].generated_text.split('Assistant:').pop().trim();
    
    return {
      text: aiResponse,
      type: 'answer'
    };
  } catch (error) {
    console.error('Error generating response:', error);
    return {
      text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
      type: 'error'
    };
  }
};

export { generateResponse, isMentalHealthRelated };