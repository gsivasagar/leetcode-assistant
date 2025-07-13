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
    <header className="py-3 px-4 md:px-6 bg-gray-100/80 dark:bg-gray-800/50 backdrop-blur-sm border-b border-black/10 dark:border-white/10 sticky top-0 z-10">
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
                    className="px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                    New Chat
                </button>
            )}

            <select 
                value={language} 
                onChange={e => setLanguage(e.target.value)}
                className="px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 border-transparent rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
                aria-label="Select programming language"
            >
                {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
            
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
