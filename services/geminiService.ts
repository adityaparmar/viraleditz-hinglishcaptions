import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const createPrompt = (wordsPerLine: number): string => {
  const wordOrWords = wordsPerLine === 1 ? 'word' : 'words';

  // Dynamically generate a relevant example based on the selected word count
  const generateExample = () => {
    const sampleWords = "Hello aap kaise hain? This is a sample sentence for the example.".split(' ');
    const lines = [];
    let currentLine = [];

    for (const word of sampleWords) {
      currentLine.push(word);
      if (currentLine.length >= wordsPerLine) {
        lines.push(currentLine.join(' '));
        currentLine = [];
      }
    }
    if (currentLine.length > 0) {
      lines.push(currentLine.join(' '));
    }

    return lines.map((line, index) => {
      const startSec = (index * 2) + 1;
      const endSec = startSec + 1;
      return `${index + 1}\n00:00:${String(startSec).padStart(2, '0')},234 --> 00:00:${String(endSec).padStart(2, '0')},500\n${line}`;
    }).join('\n\n');
  };

  const exampleText = generateExample();

  return `
You are an expert audio transcriber specializing in Hinglish. Your task is to transcribe the provided audio file and format the output as a SubRip Text (.srt) file.

Instructions:
1.  Listen to the audio carefully.
2.  Transcribe the speech into Hinglish (Hindi written using the Roman alphabet).
3.  Format the transcription into caption entries. Each caption line must have a **STRICT MAXIMUM of ${wordsPerLine} ${wordOrWords}**.
4.  You MUST adhere to this word count limit for every single caption line. Prioritize the word count rule above all else. Break lines at natural pauses only if it does not violate the word count limit.
5.  Create accurate timestamps for each caption entry.
6.  Format the entire output strictly as an SRT file. Each entry must contain the sequential number, timestamp, and the transcribed text.
7.  Do not include any other text, explanations, or notes in your response. The output must be only the raw SRT content.

Example of expected output format (this is a guide for the SRT structure; you MUST follow the word count rule from instruction #3):
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