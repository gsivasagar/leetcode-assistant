# LeetCode AI Assistant

An intelligent browser extension designed to help developers solve LeetCode problems more effectively. It leverages Google's Gemini API to provide hints, algorithm explanations, and code solutions in multiple languages.

## Features

- **Gemini-Powered Chat**: Interact with an AI assistant specifically tuned for coding problems.
- **Problem Analysis**: Get structured feedback including hints, algorithm breakdown, and code generation.
- **Multi-Language Support**: Ask for solutions in Python, Java, C++, JavaScript, and more.
- **Dark/Light Mode**: Seamlessly switches themes based on your preference or system settings.
- **Secure API Key Management**: Store your Gemini API key locally within your browser/extension storage.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd leetcode-assistant
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Usage

### Running Locally

To start the development server:

```bash
npm run dev
```

1.  Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).
2.  Enter your Gemini API Key when prompted.
3.  Start chatting or paste a problem statement to get assistance.

### Building for Production

To create a production build:

```bash
npm run build
```

The output will be generated in the `dist` directory.

## Configuration

- **API Key**: The app requires a valid Gemini API key to function.
- **Theme**: Toggles between light and dark modes. The setting is persisted in local storage.
