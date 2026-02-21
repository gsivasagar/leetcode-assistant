import React from 'react';
import { CodeIcon } from './icons/CodeIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SunIcon } from './icons/SunIcon';

interface HeaderProps {
  onNewChat: () => void;
  hasStarted: boolean;
  language: string;
  setLanguage: (lang: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
}

const LANGUAGES = ['Python', 'JavaScript', 'Java', 'C++', 'Go'];

const Header: React.FC<HeaderProps> = ({ onNewChat, hasStarted, language, setLanguage, theme, setTheme }) => {
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="py-3 px-4 md:px-6 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 transition-colors duration-300">
      <div className="container mx-auto flex items-center justify-between gap-3 max-w-4xl">
        <div className="flex items-center gap-3">
          <CodeIcon className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
            LeetCode AI <span className="text-cyan-600 dark:text-cyan-400">Assistant</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {hasStarted && (
            <button
              onClick={onNewChat}
              className="px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-cyan-400 dark:hover:border-cyan-600 hover:text-cyan-600 dark:hover:text-cyan-400 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 shadow-sm"
            >
              New Chat
            </button>
          )}

          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500/50 hover:border-cyan-400 dark:hover:border-cyan-600 focus:border-cyan-500 outline-none transition-all duration-300 shadow-sm"
            aria-label="Select programming language"
          >
            {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
          </select>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-gray-800 transition-colors duration-300 hover:scale-110 active:scale-90"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
