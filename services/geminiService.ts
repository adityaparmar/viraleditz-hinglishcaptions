
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const PROMPT = `
You are an expert audio transcriber specializing in Hinglish. Your task is to transcribe the provided audio file and format the output as a SubRip Text (.srt) file.

Instructions:
1.  Listen to the audio carefully.
2.  Transcribe the speech into Hinglish (Hindi written using the Roman alphabet).
3.  Create accurate timestamps for each caption segment.
4.  Format the entire output strictly as an SRT file, including sequential numbering, timestamps (HH:MM:SS,ms --> HH:MM:SS,ms), and the transcribed text.
5.  Do not include any other text, explanations, or notes in your response. The output must be only the raw SRT content.

Example of expected output format:
1
00:00:01,234 --> 00:00:03,456
Hello, aap kaise hain?

2
00:00:04,000 --> 00:00:06,789
Main theek hoon, shukriya.
`;

export const generateSrtCaptions = async (audioBase64: string, mimeType: string): Promise<string> => {
  try {
    const audioPart = {
      inlineData: {
        data: audioBase64,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: PROMPT,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [audioPart, textPart] },
    });

    const srtContent = response.text.trim();
    
    // Basic validation to check if the output looks like SRT
    if (!srtContent.includes('-->')) {
        throw new Error('The AI did not return a valid SRT format. Please try again.');
    }

    return srtContent;

  } catch (error) {
    console.error('Error generating captions with Gemini API:', error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while calling the Gemini API.');
  }
};
