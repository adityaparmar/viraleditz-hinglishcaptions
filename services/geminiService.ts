
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const createPrompt = (wordsPerLine: number): string => {
  const wordOrWords = wordsPerLine === 1 ? 'word' : 'words';

  const exampleText = wordsPerLine === 1
      ? `1
00:00:01,234 --> 00:00:01,567
Hello,

2
00:00:01,600 --> 00:00:01,950
aap

3
00:00:02,100 --> 00:00:02,500
kaise

4
00:00:02,600 --> 00:00:03,100
hain?`
      : `1
00:00:01,234 --> 00:00:02,500
Hello, aap kaise

2
00:00:02,600 --> 00:00:04,100
hain? This is an example.`;

  return `
You are an expert audio transcriber specializing in Hinglish. Your task is to transcribe the provided audio file and format the output as a SubRip Text (.srt) file.

Instructions:
1.  Listen to the audio carefully.
2.  Transcribe the speech into Hinglish (Hindi written using the Roman alphabet).
3.  Create caption entries where each entry contains **approximately ${wordsPerLine} ${wordOrWords}**. Try to break lines at natural pauses if possible, but prioritize keeping the word count close to the requested number.
4.  Create accurate timestamps for each caption entry.
5.  Format the entire output strictly as an SRT file. Each entry must contain the sequential number, timestamp, and the transcribed text.
6.  Do not include any other text, explanations, or notes in your response. The output must be only the raw SRT content.

Example of expected output format (this is just a guide, the number of words per line in your output should be around ${wordsPerLine}):
${exampleText}
`;
};


export const generateSrtCaptions = async (audioBase64: string, mimeType: string, wordsPerLine: number): Promise<string> => {
  try {
    const PROMPT = createPrompt(wordsPerLine);

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
