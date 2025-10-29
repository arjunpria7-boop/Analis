import React from 'react';
import { LoadingSpinner } from './Icons';

interface ResultsDisplayProps {
  result: string;
  isLoading: boolean;
  error: string | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, isLoading, error }) => {
  
  /**
   * Renders the analysis result text with highlighting for "strong" and "weak" numbers.
   * It finds lines containing keywords and applies a colored background to numbers on those lines.
   * @param text The analysis text from the AI.
   * @returns A collection of React elements with appropriate styling.
   */
  const renderResultWithHighlights = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      const lowerLine = line.toLowerCase();
      // Check for keywords. Give "strong" precedence if both appear on one line.
      const hasStrongKeyword = /\b(angka kuat|kuat)\b/i.test(lowerLine);
      const hasWeakKeyword = /\b(angka lemah|lemah)\b/i.test(lowerLine) && !hasStrongKeyword;

      // If no keywords are found, return the line as a simple block.
      if (!hasStrongKeyword && !hasWeakKeyword) {
        return <span key={lineIndex} className="block">{line}</span>;
      }

      // Split the line by numbers, which keeps the numbers in the resulting array.
      const parts = line.split(/(\d+)/); 
      
      const highlightClass = hasStrongKeyword
        ? 'bg-yellow-400 text-black font-bold px-1 rounded-sm'
        : 'bg-red-500 text-white font-bold px-1 rounded-sm';

      return (
        <p key={lineIndex} className="block">
          {parts.map((part, partIndex) => 
            // In the 'parts' array, numbers will be at odd indices.
            partIndex % 2 === 1 ? (
              <span key={partIndex} className={highlightClass}>
                {part}
              </span>
            ) : (
              part
            )
          )}
        </p>
      );
    });
  };

  return (
    <div className="mt-6 p-4 bg-brand-secondary rounded-lg shadow-lg min-h-[200px] flex flex-col">
      <h2 className="text-xl font-semibold text-brand-highlight mb-2">Hasil Analisis</h2>
      <div className="flex-grow flex items-center justify-center">
        {isLoading && (
          <div className="flex flex-col items-center">
            <LoadingSpinner />
            <span className="text-brand-text mt-2">Menganalisis...</span>
          </div>
        )}
        {error && <div className="text-red-500 bg-red-100 p-3 rounded w-full text-center">{error}</div>}
        {!isLoading && !error && result && (
          <div className="text-brand-text whitespace-pre-wrap w-full self-start">
            {renderResultWithHighlights(result)}
          </div>
        )}
        {!isLoading && !error && !result && (
          <p className="text-brand-text-faded">
            Hasil analisis akan muncul di sini.
          </p>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;
