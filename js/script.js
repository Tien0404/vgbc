// Main script file that combines all modules

// Initialize all functionality
function initializeAll() {
  // Initialize UI components
  if (window.UIComponents) {
    window.UIComponents.initializeUIComponents();
  }
  
  // Initialize language manager
  if (!window.languageManager && window.LanguageManager) {
    window.languageManager = new LanguageManager();
    window.languageManager.init();
    
    // Register language change callback
    window.languageManager.onLanguageChange((lang, translations) => {
      // Reinitialize all components when language changes
      if (window.UIComponents) {
        window.UIComponents.initializeFormHandlers();
      }
    });
  } else if (window.languageManager) {
    // Reinitialize language elements
    window.languageManager.initializeElements();
  }
  
  // Initialize news manager
  if (!window.newsManager && window.NewsManager) {
    window.newsManager = new NewsManager();
    window.newsManager.init();
  }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', initializeAll);

// Reinitialize components after dynamic content loading
function reinitializeComponents() {
  // Reinitialize UI components
  if (window.UIComponents) {
    window.UIComponents.initializeMenuToggle();
    window.UIComponents.initializeSubmenuToggle();
    window.UIComponents.initializeSlider();
    window.UIComponents.initializeFormHandlers();
    window.UIComponents.initializeSmoothScrolling();
  }
  
  // Reinitialize language manager
  if (window.languageManager) {
    window.languageManager.initializeElements();
    window.languageManager.updateLanguage(window.languageManager.currentLang);
  } else if (window.LanguageManager) {
    // Initialize language manager if it hasn't been initialized yet
    window.languageManager = new LanguageManager();
    window.languageManager.init();
    
    // Register language change callback
    window.languageManager.onLanguageChange((lang, translations) => {
      // Reinitialize all components when language changes
      if (window.UIComponents) {
        window.UIComponents.initializeFormHandlers();
      }
    });
  }
  
  // Reinitialize news manager
  if (window.newsManager) {
    window.newsManager.init();
  }
}

// Export reinitialize function for use in index.html
window.reinitializeComponents = reinitializeComponents;
