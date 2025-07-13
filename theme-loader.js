// theme-loader.js
const applyTheme = (theme) => {
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (theme === 'dark' || (!theme && systemPrefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

try {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.get('theme', (data) => {
      applyTheme(data.theme);
    });
  } else {
    // Fallback for non-extension environments
    applyTheme(null);
  }
} catch (e) {
  console.error("Error loading theme:", e);
  // Fallback on any error
  applyTheme(null);
}
