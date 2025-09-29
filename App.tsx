import React, { useState, useCallback } from 'react';
import { generateSrtCaptions } from './services/geminiService';
import { AppStatus } from './types';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';
import Spinner from './components/Spinner';
import { fileToBase64 } from './utils/fileUtils';
import { FilmIcon, SparklesIcon } from './components/Icons';


const App: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [srtCaptions, setSrtCaptions] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [wordsPerLine, setWordsPerLine] = useState<number>(1);

  const handleFileSelect = (file: File | null) => {
    setAudioFile(file);
    setStatus(AppStatus.IDLE);
    setSrtCaptions('');
    setError('');
  };
  
  const handleGenerate = useCallback(async () => {
    if (!audioFile) {
      setError('Please select an audio or video file first.');
      return;
    }

    setStatus(AppStatus.PROCESSING);
    setError('');
    setSrtCaptions('');

    try {
      const { base64, mimeType } = await fileToBase64(audioFile);
      if (!mimeType.startsWith('audio/') && !mimeType.startsWith('video/')) {
        throw new Error('Invalid file type. Please upload an audio or video file.');
      }
      
      const captions = await generateSrtCaptions(base64, mimeType, wordsPerLine);
      setSrtCaptions(captions);
      setStatus(AppStatus.SUCCESS);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error('Caption generation failed:', errorMessage);
      setError(`Failed to generate captions. ${errorMessage}`);
      setStatus(AppStatus.IDLE);
    }
  }, [audioFile, wordsPerLine]);

  const handleDownload = () => {
    const blob = new Blob([srtCaptions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${audioFile?.name.split('.')[0] || 'captions'}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetState = () => {
    setAudioFile(null);
    setStatus(AppStatus.IDLE);
    setSrtCaptions('');
    setError('');
  };

  const renderMainContent = () => {
    switch (status) {
      case AppStatus.IDLE:
        return (
          <div className="space-y-6">
            {error && (
              <div className="text-center p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            <FileUpload onFileSelect={handleFileSelect} currentFile={audioFile} />
            <div className="space-y-3 pt-2">
              <label htmlFor="words-slider" className="flex justify-between text-sm font-medium text-gray-300 px-1">
                  <span>Words per caption line</span>
                  <span className="font-bold text-cyan-400 text-base tabular-nums">{wordsPerLine}</span>
              </label>
              <input
                  id="words-slider"
                  type="range"
                  min="1"
                  max="10"
                  value={wordsPerLine}
                  onChange={(e) => setWordsPerLine(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  aria-label="Words per caption line"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={!audioFile}
              className="w-full flex items-center justify-center gap-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300/50"
            >
              <SparklesIcon className="w-6 h-6" />
              <span>Generate Captions</span>
            </button>
          </div>
        );
      case AppStatus.PROCESSING:
        return (
          <div className="flex flex-col items-center justify-center p-8">
            <Spinner />
            <p className="mt-4 text-lg text-gray-300 animate-pulse">AI is thinking... Generating your captions now.</p>
          </div>
        );
      case AppStatus.SUCCESS:
        return (
          <ResultsDisplay 
            captions={srtCaptions} 
            onDownload={handleDownload}
            onReset={resetState}
            fileName={audioFile?.name || 'your_file'}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <FilmIcon className="w-12 h-12 text-cyan-400" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Hinglish AI Captions
            </h1>
          </div>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Upload your audio or video, and let AI generate perfectly timed Hinglish captions in <span className="font-semibold text-cyan-300">.srt</span> format for you.
          </p>
        </header>

        <main className="bg-gray-800/50 rounded-2xl shadow-2xl p-6 sm:p-8 ring-1 ring-white/10 backdrop-blur-sm">
          {renderMainContent()}
        </main>
        
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Hinglish AI Captions by <a href="https://www.viraleditz.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">ViralEditz.com</a></p>
        </footer>
      </div>
    </div>
  );
};

export default App;
