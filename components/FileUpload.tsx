
import React, { useRef, useState } from 'react';
import { UploadIcon, MusicIcon, CheckCircleIcon } from './Icons';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  currentFile: File | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, currentFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileSelect(file);
  };
  
  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    const file = e.dataTransfer.files?.[0] || null;
    if (file && file.type.startsWith('audio/')) {
        onFileSelect(file);
    } else {
        alert("Please drop an audio file.");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div
      onClick={handleContainerClick}
      onDragEnter={(e) => handleDragEvents(e, true)}
      onDragOver={(e) => handleDragEvents(e, true)}
      onDragLeave={(e) => handleDragEvents(e, false)}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300
        ${isDragging ? 'border-cyan-400 bg-gray-700/50' : 'border-gray-600 hover:border-cyan-500 hover:bg-gray-700/30'}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {currentFile ? (
        <div className="text-center">
            <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-lg font-semibold text-gray-200">{currentFile.name}</p>
            <p className="text-sm text-gray-400">{formatFileSize(currentFile.size)}</p>
        </div>
      ) : (
        <div className="text-center text-gray-400">
            <UploadIcon className="w-12 h-12 mx-auto mb-4" />
            <p className="font-semibold text-gray-300">Click to upload or drag & drop</p>
            <p className="text-sm">Supports MP3, WAV, M4A, etc.</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
