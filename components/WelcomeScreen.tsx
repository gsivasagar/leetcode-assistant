import React from 'react';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { BrainIcon } from './icons/BrainIcon';
import { SolutionIcon } from './icons/SolutionIcon';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-cyan-500 dark:text-cyan-400">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{children}</p>
    </div>
  </div>
);

const exampleProblems = [
    { name: 'Two Sum', text: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.' },
    { name: 'Reverse Linked List', text: 'Given the head of a singly linked list, reverse the list, and return the reversed list.' },
    { name: 'Valid Parentheses', text: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.' },
];

const WelcomeScreen: React.FC<{onExampleClick: (text: string) => void}> = ({ onExampleClick }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Your Conversational LeetCode Coach</h2>
      <p className="max-w-2xl text-gray-600 dark:text-gray-400 mb-10">
        Paste a problem, or your existing code, and the AI will provide hints, explanations, and optimization suggestions. Start a conversation to dive deeper!
      </p>
      <div className="w-full max-w-4xl text-left mb-10">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard icon={<LightbulbIcon className="w-6 h-6"/>} title="Get Hints">
                Receive a nudge in the right direction without spoiling the solution.
            </FeatureCard>
            <FeatureCard icon={<BrainIcon className="w-6 h-6"/>} title="Explain & Optimize">
                Paste your code to get a detailed explanation or suggestions for improvement.
            </FeatureCard>
            <FeatureCard icon={<SolutionIcon className="w-6 h-6"/>} title="Outline a Solution">
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
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
