
import React from 'react';
import { DownloadIcon, ArrowPathIcon, DocumentTextIcon } from './Icons';

interface ResultsDisplayProps {
  captions: string;
  onDownload: () => void;
  onReset: () => void;
  fileName: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ captions, onDownload, onReset, fileName }) => {
  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 bg-green-900/50 p-3 rounded-lg border border-green-500/50">
            <DocumentTextIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
            <div>
                <p className="font-semibold text-green-300">Captions generated for:</p>
                <p className="text-sm text-gray-300 truncate">{fileName}</p>
            </div>
        </div>
      <div className="bg-gray-900/70 rounded-lg p-4 max-h-80 overflow-y-auto ring-1 ring-white/10">
        <pre className="text-sm text-gray-300 whitespace-pre-wrap">
          <code>{captions}</code>
        </pre>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onDownload}
          className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-green-400/50"
        >
          <DownloadIcon className="w-5 h-5" />
          <span>Download .srt File</span>
        </button>
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-3 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-gray-400/50"
        >
          <ArrowPathIcon className="w-5 h-5" />
          <span>Generate New</span>
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
