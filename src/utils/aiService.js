import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

const formatResponse = (text) => {
  // Format bullet points
  text = text.replace(/^\*\s/gm, '• ');
  
  // Format headers with proper spacing
  text = text.replace(/^(#{1,6})\s*(.+)$/gm, (match, hashes, content) => {
    const level = hashes.length;
    return `\n${content}\n${'-'.repeat(content.length)}\n`;
  });
  
  // Add line breaks between sections
  text = text.replace(/\n\n/g, '\n\n');
  
  return text;
};

export const getAIResponse = async (message, context) => {
  try {
    const prompt = `
Please format your response using the following guidelines:
- Use bullet points (•) for lists
- Use clear headings with underlines
- Add proper spacing between sections
- Provide a detailed and accurate response based on the context
- If not found in cone text, use the context provided and try genetating a response based on related data to it
Context: ${context}
Question: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return formatResponse(text);
  } catch (error) {
    console.error('Gemini AI Error:', error);
    throw new Error('Failed to process your request. Please try again.');
  }
};