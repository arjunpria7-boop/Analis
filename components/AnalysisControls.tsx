import React from 'react';
import { SendIcon } from './Icons';

interface AnalysisControlsProps {
  question: string;
  onQuestionChange: (question: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  onFindMissing2D: () => void;
  onFindMissing3D: () => void;
  onFindFrequent2D: () => void;
  onFindFrequent3D: () => void;
}

const AnalysisControls: React.FC<AnalysisControlsProps> = ({
  question,
  onQuestionChange,
  onAnalyze,
  isLoading,
  onFindMissing2D,
  onFindMissing3D,
  onFindFrequent2D,
  onFindFrequent3D,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        onAnalyze();
      }
    }
  };

  return (
    <div className="lg:mt-0 space-y-4">
      <div>
        <label htmlFor="question-input" className="block text-lg font-semibold text-brand-highlight mb-2">
          Pertanyaan Analisis
        </label>
        <div className="relative">
          <textarea
            id="question-input"
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-3 pr-32 bg-brand-secondary text-brand-text rounded-lg border-2 border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-highlight focus:border-transparent resize-none"
            placeholder="contoh: 'Apa pola di kolom pertama?'"
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={onAnalyze}
            disabled={isLoading || !question.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-brand-highlight text-brand-primary font-bold rounded-md hover:bg-opacity-90 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            aria-label="Analisis"
          >
            {isLoading ? 'Menganalisis...' : 'Analisis'}
            {!isLoading && <SendIcon />}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap justify-start items-center gap-x-6 gap-y-4 border-t border-brand-accent pt-4">
        <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-brand-text-faded">Angka Belum Muncul:</span>
            <button 
                onClick={onFindMissing2D} 
                className="px-2 py-1 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition-colors text-sm disabled:bg-gray-500 disabled:cursor-not-allowed" 
                aria-label="Cari 2D yang Belum Muncul"
                disabled={isLoading}
            >
                2D
            </button>
            <button 
                onClick={onFindMissing3D} 
                className="px-2 py-1 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition-colors text-sm disabled:bg-gray-500 disabled:cursor-not-allowed" 
                aria-label="Cari 3D yang Belum Muncul"
                disabled={isLoading}
            >
                3D
            </button>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-brand-text-faded">Angka Sering Muncul:</span>
            <button 
                onClick={onFindFrequent2D} 
                className="px-2 py-1 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition-colors text-sm disabled:bg-gray-500 disabled:cursor-not-allowed" 
                aria-label="Cari 2D yang Sering Muncul"
                disabled={isLoading}
            >
                2D
            </button>
            <button 
                onClick={onFindFrequent3D} 
                className="px-2 py-1 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition-colors text-sm disabled:bg-gray-500 disabled:cursor-not-allowed" 
                aria-label="Cari 3D yang Sering Muncul"
                disabled={isLoading}
            >
                3D
            </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisControls;