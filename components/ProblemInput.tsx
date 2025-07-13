import React from 'react';

interface ProblemInputProps {
  problemStatement: string;
  setProblemStatement: (value: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const ProblemInput: React.FC<ProblemInputProps> = ({
  problemStatement,
  setProblemStatement,
  onAnalyze,
  isLoading,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onAnalyze();
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-8">
      <textarea
        value={problemStatement}
        onChange={(e) => setProblemStatement(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Paste your LeetCode problem description here... or your code for analysis. (Cmd/Ctrl + Enter to submit)"
        className="w-full h-48 p-4 bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-lg resize-y focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow text-gray-800 dark:text-gray-300 placeholder-gray-500"
        disabled={isLoading}
      />
      <button
        onClick={onAnalyze}
        disabled={isLoading || !problemStatement.trim()}
        className="self-end px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </>
        ) : (
          'Start Analysis'
        )}
      </button>
    </div>
  );
};

export default ProblemInput;
