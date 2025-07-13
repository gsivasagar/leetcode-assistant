import React, { useState } from 'react';
import { KeyIcon } from './icons/KeyIcon';

interface ApiKeyInputProps {
  onApiKeySubmit: (key: string) => Promise<void>;
  isSaving: boolean;
  error: string | null;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySubmit, isSaving, error }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-6 text-center bg-gray-100 dark:bg-gray-800 rounded-2xl">
      <div className="w-full max-w-md">
        <KeyIcon className="w-12 h-12 mx-auto text-cyan-500 dark:text-cyan-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Welcome to the AI Assistant</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Please enter your Gemini API key to get started. Your key will be stored securely in local browser storage.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API Key"
            className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow text-gray-800 dark:text-gray-300 placeholder-gray-500"
            disabled={isSaving}
          />
          <button
            type="submit"
            disabled={isSaving || !apiKey.trim()}
            className="w-full px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save & Continue'
            )}
          </button>
          {error && <p className="text-sm text-red-500 dark:text-red-400 mt-2">{error}</p>}
        </form>
         <p className="text-xs text-gray-500 mt-4">
            You can get a free API key from{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                Google AI Studio
            </a>.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyInput;
