declare const chrome: {
  runtime?: {
    id: string;
  };
  storage: {
    local: {
      get(keys: string[], callback: (result: { [key: string]: any }) => void): void;
      set(items: { [key: string]: any }): Promise<void>;
    };
  };
};

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Chat } from '@google/genai';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import ProblemInput from './components/ProblemInput';
import ChatMessage from './components/AnalysisDisplay';
import ApiKeyInput from './components/ApiKeyInput';
import { initializeAiService, createNewChat, sendMessage, getInitialAnalysis, getCodeInNewLanguage } from './services/geminiService';
import { SendIcon } from './components/icons/SendIcon';

export type StructuredAnalysis = {
  hints: string[];
  algorithm: string;
  code: string;
};

const isStructuredAnalysis = (content: any): content is StructuredAnalysis => {
  return typeof content === 'object' && content !== null && Array.isArray(content.hints) && 'algorithm' in content && 'code' in content;
}

export type Message = {
  role: 'user' | 'model';
  content: string | StructuredAnalysis;
  isUpdating?: boolean;
  updatingToLanguage?: string;
};

const LayoutWrapper: React.FC<{ children: React.ReactNode; isExtension: boolean; isAuthMode?: boolean }> = ({ children, isExtension, isAuthMode }) => {
  if (isExtension) {
    return (
      <div className={`w-[500px] h-[600px] ${isAuthMode ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-950'} text-gray-800 dark:text-gray-200 font-sans flex flex-col relative overflow-hidden`}>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-black flex items-center justify-center p-4 sm:p-8 font-sans transition-colors duration-300">
      <div className={`w-full ${isAuthMode ? 'max-w-xl h-auto p-6 md:p-10' : 'max-w-6xl h-[90vh]'} bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 flex flex-col relative overflow-hidden rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 transition-colors duration-300`}>
        {children}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const isExtension = typeof chrome !== 'undefined' && !!chrome?.runtime?.id;
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeyChecked, setIsApiKeyChecked] = useState(false);
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('Python');
  const [problemStatement, setProblemStatement] = useState('');
  const [lockedProblemStatement, setLockedProblemStatement] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'problem'>('chat');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['apiKey', 'theme'], async (result) => {
        if (result.apiKey) {
          try {
            await initializeAiService(result.apiKey);
            setApiKey(result.apiKey);
          } catch (e) {
            console.error("Failed to initialize with stored API key:", e);
            setApiKeyError("Your saved API key is invalid. Please enter it again.");
          }
        }
        const savedTheme = result.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        setTheme(savedTheme);
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        }
        setIsApiKeyChecked(true);
      });
    } else {
      console.warn("Not running in a Chrome extension. Persistence is disabled.");
      const savedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
      setIsApiKeyChecked(true);
    }
  }, []);

  const handleApiKeySubmit = async (key: string) => {
    setIsSavingApiKey(true);
    setApiKeyError(null);
    try {
      await initializeAiService(key); // Now awaits validation
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        await chrome.storage.local.set({ apiKey: key });
      }
      setApiKey(key);
    } catch (e: any) {
      setApiKeyError(e.message || "Failed to initialize with the provided key. It might be invalid.");
      console.error(e);
    } finally {
      setIsSavingApiKey(false);
    }
  };


  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ theme: newTheme });
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current && activeTab === 'chat') {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading, activeTab]);

  const handleNewChat = () => {
    setMessages([]);
    setChat(null);
    setProblemStatement('');
    setLockedProblemStatement('');
    setCurrentInput('');
    setError(null);
    setActiveTab('chat');
  };

  const processFollowUpStream = async (stream: AsyncGenerator<any>) => {
    let fullResponse = '';
    setMessages(prev => [...prev, { role: 'model', content: '' }]);

    for await (const chunk of stream) {
      const chunkText = chunk.text;
      fullResponse += chunkText;
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.role === 'model') {
          const updatedMessages = [...prev];
          updatedMessages[prev.length - 1] = { ...lastMessage, content: fullResponse };
          return updatedMessages;
        }
        return prev;
      });
    }
  }

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !chat) return;

    setIsLoading(true);
    setError(null);

    const userMessage: Message = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');

    try {
      const stream = await sendMessage(chat, message, language);
      await processFollowUpStream(stream);

    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`API Error: ${errorMessage}`);
      setMessages(prev => prev.filter(m => m !== userMessage));
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [chat, language]);

  const handleInitialAnalysis = async () => {
    if (!problemStatement.trim()) return;

    setIsLoading(true);
    setError(null);
    setLockedProblemStatement(problemStatement);

    try {
      const newChat = createNewChat();
      setChat(newChat);

      const userMessage: Message = { role: 'user', content: problemStatement };
      setMessages([userMessage]);

      const stream = await getInitialAnalysis(newChat, problemStatement, language);

      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk.text;
      }

      // Sanitize the response to remove any markdown code block formatting
      let sanitizedResponse = fullResponse.trim();
      if (sanitizedResponse.startsWith('```json')) {
        sanitizedResponse = sanitizedResponse.substring(7);
      } else if (sanitizedResponse.startsWith('```')) {
        sanitizedResponse = sanitizedResponse.substring(3);
      }
      if (sanitizedResponse.endsWith('```')) {
        sanitizedResponse = sanitizedResponse.substring(0, sanitizedResponse.length - 3);
      }
      sanitizedResponse = sanitizedResponse.trim();

      const parsedAnalysis: StructuredAnalysis = JSON.parse(sanitizedResponse);
      const modelMessage: Message = { role: 'model', content: parsedAnalysis };

      setMessages(prev => [...prev, modelMessage]);

    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`API Error: ${errorMessage}. The model may have returned an invalid format.`);
      setMessages(prev => prev.slice(0, 1));
      console.error(e);
    } finally {
      setIsLoading(false);
      setProblemStatement('');
    }
  };

  const handleCodeLanguageChange = useCallback(async (messageIndex: number, targetLanguage: string) => {
    const messageToUpdate = messages[messageIndex];
    if (!chat || !isStructuredAnalysis(messageToUpdate.content)) return;

    setMessages(prev => prev.map((msg, idx) =>
      idx === messageIndex ? { ...msg, isUpdating: true, updatingToLanguage: targetLanguage } : msg
    ));
    setError(null);

    try {
      const analysis = messageToUpdate.content;
      const response = await getCodeInNewLanguage(chat, lockedProblemStatement, analysis.algorithm, targetLanguage);
      const newCode = response.code;

      setMessages(prev => prev.map((msg, idx) => {
        if (idx === messageIndex && isStructuredAnalysis(msg.content)) {
          const newContent: StructuredAnalysis = { ...msg.content, code: newCode };
          return { ...msg, content: newContent, isUpdating: false, updatingToLanguage: undefined };
        }
        return msg;
      }));

    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get code in ${targetLanguage}: ${errorMessage}`);
      setMessages(prev => prev.map((msg, idx) =>
        idx === messageIndex ? { ...msg, isUpdating: false, updatingToLanguage: undefined } : msg
      ));
      console.error(e);
    }
  }, [chat, messages, lockedProblemStatement]);


  const handleFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(currentInput);
  };

  if (!isApiKeyChecked) {
    return (
      <div className={`${isExtension ? 'w-[500px] h-[600px]' : 'min-h-screen w-full'} bg-white dark:bg-gray-900 flex items-center justify-center`}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <LayoutWrapper isExtension={isExtension} isAuthMode={true}>
        <main className="flex-grow w-full flex flex-col justify-center h-full">
          <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} isSaving={isSavingApiKey} error={apiKeyError} />
        </main>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper isExtension={isExtension}>
      <Header
        onNewChat={handleNewChat}
        hasStarted={messages.length > 0}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={handleThemeChange}
      />
      <main className="flex-grow w-full p-4 sm:p-6 lg:p-8 flex flex-col h-[calc(100%-60px)] z-10 max-w-7xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 flex-grow flex flex-col border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300">
          {messages.length === 0 ? (
            <div className="p-6 overflow-y-auto">
              <WelcomeScreen onExampleClick={setProblemStatement} />
              <ProblemInput
                problemStatement={problemStatement}
                setProblemStatement={setProblemStatement}
                onAnalyze={handleInitialAnalysis}
                isLoading={isLoading}
              />
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800 px-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
                <nav className="-mb-px flex gap-6">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`py-3 px-1 text-sm font-semibold transition-all duration-300 relative ${activeTab === 'chat'
                      ? 'text-cyan-600 dark:text-cyan-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                  >
                    Chat
                    {activeTab === 'chat' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 rounded-t-md animate-fade-in"></span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('problem')}
                    className={`py-3 px-1 text-sm font-semibold transition-all duration-300 relative ${activeTab === 'problem'
                      ? 'text-cyan-600 dark:text-cyan-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                  >
                    Problem
                    {activeTab === 'problem' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 rounded-t-md animate-fade-in"></span>
                    )}
                  </button>
                </nav>
              </div>

              <div ref={scrollContainerRef} className="flex-grow overflow-y-auto">
                {activeTab === 'chat' && (
                  <div className="p-6 space-y-6">
                    {messages.map((msg, index) => (
                      <ChatMessage
                        key={index}
                        index={index}
                        message={msg}
                        onLanguageChange={handleCodeLanguageChange}
                      />
                    ))}
                    {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-gray-700 text-cyan-400">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-solid border-cyan-400 border-t-transparent"></div>
                        </div>
                        <div className="relative w-full rounded-lg px-4 py-3 bg-white dark:bg-gray-700/50">
                          <div className="animate-pulse h-5 w-20 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'problem' && (
                  <div className="p-6">
                    <div className="prose prose-sm dark:prose-invert max-w-none bg-white dark:bg-gray-900/50 p-4 rounded-lg ring-1 ring-black/5 dark:ring-white/10">
                      <h3 className="!mt-0 !mb-3 text-base font-semibold">Original Problem Statement</h3>
                      <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300 bg-transparent p-0">
                        {lockedProblemStatement}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-10">
                {error && (
                  <div className="mb-2 bg-red-100/80 dark:bg-red-900/50 backdrop-blur-sm border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3 rounded-xl text-center text-sm animate-fade-in">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                  </div>
                )}
                <form onSubmit={handleFollowUp} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Ask a follow-up question or paste your code..."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none transition-all duration-300 text-gray-800 dark:text-gray-200 placeholder-gray-400 shadow-inner"
                    disabled={isLoading || messages.some(m => m.isUpdating)}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !currentInput.trim() || messages.some(m => m.isUpdating)}
                    className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl shadow-md shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center shrink-0"
                    aria-label="Send message"
                  >
                    <SendIcon className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </LayoutWrapper>
  );
};

export default App;
