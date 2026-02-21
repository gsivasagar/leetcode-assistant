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
        className="w-full h-48 p-4 bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl resize-y focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none transition-all duration-300 text-gray-800 dark:text-gray-300 placeholder-gray-400 shadow-inner"
        disabled={isLoading}
      />
      <button
        onClick={onAnalyze}
        disabled={isLoading || !problemStatement.trim()}
        className="self-end px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
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
