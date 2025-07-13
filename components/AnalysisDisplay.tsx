
import React, { useState } from 'react';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import type { Message, StructuredAnalysis } from '../App';

const isStructuredAnalysis = (content: any): content is StructuredAnalysis => {
    return typeof content === 'object' && content !== null && Array.isArray(content.hints) && 'algorithm' in content && 'code' in content;
}

const LANGUAGES = ['Python', 'JavaScript', 'Java', 'C++', 'Go'];

const extractCode = (markdownCode: string): { lang: string, code: string } => {
    if (!markdownCode) return { lang: 'plaintext', code: '' };
    const match = markdownCode.match(/```(\w+)?\n([\s\S]*?)\n```/);
    if (match) {
        return {
            lang: (match[1] || 'plaintext').toLowerCase(),
            code: match[2]?.trim() || ''
        };
    }
    return { lang: 'plaintext', code: markdownCode.trim() };
};

const renderMarkdown = (text: string) => {
    if (!text) return null;
    const escapeHtml = (unsafe: string) => 
        unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");

    let html = text.split('\n').map(line => {
        if (line.trim() === '') return '<br/>';
        if (line.startsWith('### ')) return `<h3>${escapeHtml(line.substring(4))}</h3>`;
        if (line.startsWith('## ')) return `<h2>${escapeHtml(line.substring(3))}</h2>`;
        if (line.startsWith('# ')) return `<h1>${escapeHtml(line.substring(2))}</h1>`;
        if (/^\s*(\*|-)\s/.test(line)) return `<li>${escapeHtml(line.replace(/^\s*(\*|-)\s/, ''))}</li>`;
        
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/__(.*?)__/g, '<strong>$1</strong>');
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/_(.*?)_/g, '<em>$1</em>');
        line = line.replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-gray-900 px-1.5 py-0.5 rounded-md text-yellow-600 dark:text-yellow-400">$1</code>');
        return `<p>${line}</p>`;
    }).join('');

    html = html.replace(/<\/li><br\/><li>/g, '</li><li>').replace(/<\/li><li>/g, '</li><li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    html = html.replace(/<p><br\/><\/p>/g, '<br/>').replace(/<p><\/p>/g, '');
    
    return <div className="prose prose-sm prose-p:my-1 prose-headings:my-2 dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
};

const AccordionSection: React.FC<{ title: string; children: React.ReactNode; isOpen: boolean; onClick: () => void; }> = ({ title, children, isOpen, onClick }) => (
    <div className="border-b border-black/10 dark:border-white/10 last:border-b-0">
        <button
            onClick={onClick}
            className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-white/5 transition-colors"
            aria-expanded={isOpen}
        >
            <span>{title}</span>
            <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && <div className="p-4 pt-0">{children}</div>}
    </div>
);

interface ChatMessageProps {
  message: Message;
  index: number;
  onLanguageChange: (messageIndex: number, language: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, index, onLanguageChange }) => {
  const [copied, setCopied] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('hints');
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
  
  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isModel = message.role === 'model';

  if (isModel && isStructuredAnalysis(message.content)) {
    const analysis = message.content;
    const { lang: detectedLang, code: codeText } = extractCode(analysis.code);

    return (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-cyan-500 dark:text-cyan-400">
                <BotIcon className="w-6 h-6" />
            </div>
            <div className="relative w-full rounded-lg bg-white dark:bg-gray-700/50 ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
                <AccordionSection
                    title="Hints"
                    isOpen={openSection === 'hints'}
                    onClick={() => setOpenSection(openSection === 'hints' ? null : 'hints')}
                >
                    <div className="space-y-3 pt-2">
                        {analysis.hints.map((hint, idx) => (
                            <div key={idx}>
                                {!revealedHints.has(idx) ? (
                                    <button
                                        onClick={() => setRevealedHints(prev => new Set(prev).add(idx))}
                                        className="px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-900/50 rounded-md hover:bg-cyan-100 dark:hover:bg-cyan-900"
                                    >
                                        Reveal Hint {idx + 1}
                                    </button>
                                ) : (
                                    <div className="text-gray-700 dark:text-gray-300">
                                        {renderMarkdown(`**Hint ${idx + 1}:** ${hint}`)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </AccordionSection>
                <AccordionSection
                    title="Algorithm"
                    isOpen={openSection === 'algorithm'}
                    onClick={() => setOpenSection(openSection === 'algorithm' ? null : 'algorithm')}
                >
                     <div className="text-gray-700 dark:text-gray-300">{renderMarkdown(analysis.algorithm)}</div>
                </AccordionSection>
                 <AccordionSection
                    title="Code"
                    isOpen={openSection === 'code'}
                    onClick={() => setOpenSection(openSection === 'code' ? null : 'code')}
                >
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 -mt-2 mb-2">
                             <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Language:</span>
                                {LANGUAGES.map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => onLanguageChange(index, lang)}
                                        disabled={lang.toLowerCase() === detectedLang || message.isUpdating}
                                        className="px-2 py-1 text-xs font-medium rounded-md transition-colors disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 bg-gray-200/70 dark:bg-gray-800/70 disabled:bg-cyan-100 disabled:text-cyan-800 dark:disabled:bg-cyan-900/50 dark:disabled:text-cyan-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={() => handleCopy(codeText)}
                                disabled={message.isUpdating}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-900/50 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {copied ? <CheckIcon className="w-3.5 h-3.5 text-green-500" /> : <CopyIcon className="w-3.5 h-3.5" />}
                                {copied ? 'Copied!' : 'Copy Code'}
                            </button>
                        </div>
                        {message.isUpdating ? (
                            <div className="bg-gray-100 dark:bg-gray-900/70 p-3 rounded-lg overflow-x-auto min-h-[100px] flex items-center justify-center">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-cyan-400 border-t-transparent"></div>
                                    <span>Generating {message.updatingToLanguage || 'new'} code...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-100 dark:bg-gray-900/70 p-3 rounded-lg overflow-x-auto">
                                <pre><code className={`language-${detectedLang} text-sm`}>{codeText}</code></pre>
                            </div>
                        )}
                    </div>
                </AccordionSection>
            </div>
        </div>
    );
  }

  return (
    <div className={`flex items-start gap-4 ${!isModel ? 'flex-row-reverse' : ''}`}>
        {isModel && (
            <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-cyan-500 dark:text-cyan-400">
                <BotIcon className="w-6 h-6" />
            </div>
        )}
      <div className={`relative max-w-2xl rounded-lg px-4 py-3 shadow ${isModel ? 'bg-white dark:bg-gray-700/50' : 'bg-cyan-600 text-white'}`}>
        <div>
            {isModel ? renderMarkdown(message.content as string) : <p className="text-white">{message.content as string}</p>}
        </div>
        {isModel && message.content && typeof message.content === 'string' && (
            <button 
                onClick={() => handleCopy(message.content as string)}
                className="absolute top-2 right-2 p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                aria-label="Copy message"
            >
                {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
            </button>
        )}
      </div>
      {!isModel && (
            <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-cyan-600 text-white">
               <UserIcon className="w-6 h-6" />
            </div>
        )}
    </div>
  );
};

export default ChatMessage;
