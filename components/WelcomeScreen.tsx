import React from 'react';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { BrainIcon } from './icons/BrainIcon';
import { SolutionIcon } from './icons/SolutionIcon';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; delayClass?: string }> = ({ icon, title, children, delayClass = '' }) => (
  <div className={`flex items-start gap-4 animate-slide-up opacity-0 group hover:-translate-y-1 transition-all duration-300 ${delayClass}`} style={{ animationFillMode: 'forwards' }}>
    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800/50 transition-all duration-300 shadow-sm border border-cyan-200/50 dark:border-cyan-700/50">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mt-1">{children}</p>
    </div>
  </div>
);

const exampleProblems = [
  { name: 'Two Sum', text: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.' },
  { name: 'Reverse Linked List', text: 'Given the head of a singly linked list, reverse the list, and return the reversed list.' },
  { name: 'Valid Parentheses', text: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.' },
];

const WelcomeScreen: React.FC<{ onExampleClick: (text: string) => void }> = ({ onExampleClick }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4 animate-fade-in">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
        Your Conversational LeetCode Coach
      </h2>
      <p className="max-w-2xl text-gray-600 dark:text-gray-400 mb-10 text-sm leading-relaxed">
        Paste a problem, or your existing code, and the AI will provide hints, explanations, and optimization suggestions. Start a conversation to dive deeper!
      </p>
      <div className="w-full max-w-4xl text-left mb-10">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard icon={<LightbulbIcon className="w-6 h-6" />} title="Get Hints" delayClass="[animation-delay:100ms]">
            Receive a nudge in the right direction without spoiling the solution.
          </FeatureCard>
          <FeatureCard icon={<BrainIcon className="w-6 h-6" />} title="Explain & Optimize" delayClass="[animation-delay:200ms]">
            Paste your code to get a detailed explanation or suggestions for improvement.
          </FeatureCard>
          <FeatureCard icon={<SolutionIcon className="w-6 h-6" />} title="Outline a Solution" delayClass="[animation-delay:300ms]">
            Get a high-level plan or pseudocode to structure your code effectively.
          </FeatureCard>
        </div>
      </div>
      <div className="w-full max-w-2xl text-left">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">Or, try an example:</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {exampleProblems.map(p => (
            <button
              key={p.name}
              onClick={() => onExampleClick(p.text)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-full shadow-sm hover:shadow-md hover:border-cyan-300 dark:hover:border-cyan-700 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
