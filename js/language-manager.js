// Language Switcher Module
class LanguageManager {
  constructor() {
    this.translations = {};
    this.currentLang = localStorage.getItem('language') || this.detectBrowserLanguage();
    this.langElements = {};
    this.formAlertMessage = 'Đây là mẫu giao diện. Hãy kết nối backend/email theo nhu cầu của bạn.';
    this.callbacks = [];
  }

  initializeElements() {
    this.langElements = {
      toggle: document.querySelector('.lang-toggle'),
      menu: document.querySelector('.lang-menu'),
      options: document.querySelectorAll('.lang-option'),
      current: document.querySelector('.lang-current')
    };
  }

  async loadTranslations(lang) {
    if (this.translations[lang]) {
      return Promise.resolve(this.translations[lang]);
    }
    
    try {
      const response = await fetch(`translations/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${lang}`);
      }
      const translations = await response.json();
      this.translations[lang] = translations;
      return translations;
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to Vietnamese if translation file fails to load
      if (lang !== 'vi') {
        return this.loadTranslations('vi');
      }
      throw error;
    }
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  async updateLanguage(lang) {
    try {
      const translations = await this.loadTranslations(lang);
      this.currentLang = lang;
      localStorage.setItem('language', lang);
      
      // Initialize elements if not already done
      this.initializeElements();
      
      // Set direction for RTL languages (if needed in the future)
      document.documentElement.dir = this.getLanguageDirection(lang);
      
      // Update current language display
      const langDisplay = lang === 'vi' ? 'VI' : lang === 'en' ? 'EN' : '中文';
      if (this.langElements.current) this.langElements.current.textContent = langDisplay;
      
      // Update HTML lang attribute
      document.documentElement.lang = lang;
      
      // Update page title and meta description
      if (translations.meta) {
        if (translations.meta.title) {
          document.title = translations.meta.title;
        }
        if (translations.meta.description) {
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) metaDesc.setAttribute('content', translations.meta.description);
        }
      }
      
      // Update all elements with data-i18n attribute
      document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const value = this.getNestedValue(translations, key);
        if (value !== null) {
          element.innerHTML = value;
        }
      });
      
      // Update placeholder attributes
      document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const value = this.getNestedValue(translations, key);
        if (value !== null) {
          element.placeholder = value;
        }
      });
      
      // Update title attributes
      document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        const value = this.getNestedValue(translations, key);
        if (value !== null) {
          element.title = value;
        }
      });
      
      // Update aria-label attributes
      document.querySelectorAll('[data-i18n-aria]').forEach(element => {
        const key = element.getAttribute('data-i18n-aria');
        const value = this.getNestedValue(translations, key);
        if (value !== null) {
          element.setAttribute('aria-label', value);
        }
      });
      
      // Update active language option
      if (this.langElements.options) {
        this.langElements.options.forEach(option => {
          option.classList.remove('active');
          if (option.getAttribute('data-lang') === lang) {
            option.classList.add('active');
          }
        });
      }
      
      // Update form alert message
      if (translations.form && translations.form.alert) {
        this.formAlertMessage = translations.form.alert;
      }
      
      // Update news translations if news manager exists
      if (window.newsManager) {
        window.newsManager.updateTranslations(translations);
      }
      
      // Trigger language change callbacks
      this.triggerLanguageChange(lang, translations);
      
    } catch (error) {
      console.error('Error updating language:', error);
    }
  }

  getLanguageDirection(lang) {
    // Add RTL languages here if needed in the future
    const rtlLanguages = ['ar', 'he', 'fa'];
    return rtlLanguages.includes(lang) ? 'rtl' : 'ltr';
  }

  // Method to get current language
  getCurrentLanguage() {
    return this.currentLang;
  }

  // Method to get available languages
  getAvailableLanguages() {
    return [
      { code: 'vi', name: 'Tiếng Việt', flag: 'VI' },
      { code: 'en', name: 'English', flag: 'EN' },
      { code: 'zh', name: '中文', flag: '中文' }
    ];
  }

  // Method to detect browser language
  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0];
    
    // Check if browser language is supported
    const supportedLanguages = ['vi', 'en', 'zh'];
    return supportedLanguages.includes(langCode) ? langCode : 'vi';
  }

  // Add callback for language change events
  onLanguageChange(callback) {
    this.callbacks.push(callback);
  }

  // Remove callback for language change events
  offLanguageChange(callback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  // Trigger all language change callbacks
  triggerLanguageChange(lang, translations) {
    this.callbacks.forEach(callback => {
      try {
        callback(lang, translations);
      } catch (error) {
        console.error('Error in language change callback:', error);
      }
    });
  }

  init() {
    // Initialize elements
    this.initializeElements();
    
    // Language toggle dropdown functionality
    if (this.langElements.toggle && this.langElements.menu) {
      this.langElements.toggle.addEventListener('click', () => {
        const isExpanded = this.langElements.toggle.getAttribute('aria-expanded') === 'true';
        this.langElements.toggle.setAttribute('aria-expanded', String(!isExpanded));
        this.langElements.menu.style.display = isExpanded ? 'none' : 'block';
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.lang-dropdown')) {
          this.langElements.toggle.setAttribute('aria-expanded', 'false');
          if (this.langElements.menu) {
            this.langElements.menu.style.display = 'none';
          }
        }
      });
    }

    // Language option click handlers
    if (this.langElements.options) {
      this.langElements.options.forEach(option => {
        option.addEventListener('click', (e) => {
          e.preventDefault();
          const lang = option.getAttribute('data-lang');
          this.updateLanguage(lang);
          if (this.langElements.toggle) {
            this.langElements.toggle.setAttribute('aria-expanded', 'false');
            if (this.langElements.menu) {
              this.langElements.menu.style.display = 'none';
            }
          }
        });
      });
    }

    // Initialize with saved language or detected language
    this.updateLanguage(this.currentLang);
  }
}

// Export for use in other modules
window.LanguageManager = LanguageManager;