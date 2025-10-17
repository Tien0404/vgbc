// Basic interactions for menu, submenus, slider, and year
const navToggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.menu');
const yearEl = document.querySelector('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

if (navToggle && menu) {
  navToggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('show');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// Language Switcher
class LanguageManager {
  constructor() {
    this.translations = {};
    this.currentLang = localStorage.getItem('language') || 'vi';
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
      this.langElements.options.forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-lang') === lang) {
          option.classList.add('active');
        }
      });
      
      // Update form alert message
      if (translations.form && translations.form.alert) {
        this.formAlertMessage = translations.form.alert;
      }
      
      // Update news translations if news manager exists
      if (window.newsManager) {
        window.newsManager.updateTranslations(translations);
      }
      
    } catch (error) {
      console.error('Error updating language:', error);
    }
  }

  init() {
    // Language toggle dropdown functionality
    if (this.langElements.toggle && this.langElements.menu) {
      this.langElements.toggle.addEventListener('click', () => {
        const isExpanded = this.langElements.toggle.getAttribute('aria-expanded') === 'true';
        this.langElements.toggle.setAttribute('aria-expanded', String(!isExpanded));
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.lang-dropdown')) {
          this.langElements.toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Language option click handlers
    this.langElements.options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = option.getAttribute('data-lang');
        this.updateLanguage(lang);
        this.langElements.toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Initialize with saved language or default
    this.updateLanguage(this.currentLang);
  }
}

// Initialize language manager
const languageManager = new LanguageManager();
languageManager.init();

document.querySelectorAll('.submenu-toggle').forEach(btn => {
  btn.addEventListener('click', e => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    const submenu = btn.nextElementSibling;
    if (submenu) submenu.style.display = expanded ? 'none' : 'block';
  });
});

// Slider
const slider = document.querySelector('[data-slider]');
if (slider) {
  const slides = slider.querySelector('.slides');
  const slideItems = Array.from(slides.children);
  const prev = slider.querySelector('[data-prev]');
  const next = slider.querySelector('[data-next]');
  const dotsWrap = slider.querySelector('[data-dots]');
  let index = 0;
  let auto;

  const go = (i) => {
    index = (i + slideItems.length) % slideItems.length;
    slides.style.transform = `translateX(${-index * 100}%)`;
    dotsWrap.querySelectorAll('button').forEach((d, di) => {
      d.setAttribute('aria-current', di === index ? 'true' : 'false');
    });
  };

  // build dots
  slideItems.forEach((_, i) => {
    const b = document.createElement('button');
    b.addEventListener('click', () => go(i));
    dotsWrap.appendChild(b);
  });

  if (prev) prev.addEventListener('click', () => go(index - 1));
  if (next) next.addEventListener('click', () => go(index + 1));

  const start = () => {
    auto = setInterval(() => go(index + 1), 5000);
  };
  const stop = () => clearInterval(auto);

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);

  go(0);
  start();
}

// Prevent default for demo forms (excluding news form)
document.querySelectorAll('form').forEach(f => {
  if (f.id !== 'newsForm') {
    f.addEventListener('submit', e => {
      e.preventDefault();
      const alertMessage = languageManager.formAlertMessage || 'Đây là mẫu giao diện. Hãy kết nối backend/email theo nhu cầu của bạn.';
      alert(alertMessage);
    });
  }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// News Management System
class NewsManager {
  constructor() {
    this.news = this.loadNewsFromStorage();
    this.modal = document.getElementById('newsModal');
    this.form = document.getElementById('newsForm');
    this.newsGrid = document.getElementById('newsGrid');
    this.addNewsBtn = document.getElementById('addNewsBtn');
    this.saveNewsBtn = document.getElementById('saveNewsBtn');
    this.cancelNewsBtn = document.getElementById('cancelNewsBtn');
    this.closeModalBtn = document.querySelector('.modal__close');
    this.translations = {};
    
    this.init();
  }

  init() {
    // Load initial news
    this.renderNews();
    
    // Event listeners
    if (this.addNewsBtn) {
      this.addNewsBtn.addEventListener('click', () => this.openModal());
    }
    
    if (this.saveNewsBtn) {
      this.saveNewsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveNews();
      });
    }
    
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveNews();
      });
    }
    
    if (this.cancelNewsBtn) {
      this.cancelNewsBtn.addEventListener('click', () => this.closeModal());
    }
    
    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener('click', () => this.closeModal());
    }
    
    // Close modal when clicking outside
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal || e.target.classList.contains('modal__overlay')) {
          this.closeModal();
        }
      });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.style.display === 'block') {
        this.closeModal();
      }
    });
  }

  updateTranslations(translations) {
    this.translations = translations.news || {};
    this.renderNews();
    
    // Update button labels in existing news cards
    document.querySelectorAll('[data-i18n="news.viewMore"]').forEach(element => {
      if (this.translations.viewMore) {
        element.textContent = this.translations.viewMore;
      }
    });
    
    document.querySelectorAll('[data-i18n="news.delete"]').forEach(element => {
      if (this.translations.delete) {
        element.textContent = this.translations.delete;
      }
    });
  }

  loadNewsFromStorage() {
    const storedNews = localStorage.getItem('newsArticles');
    if (storedNews) {
      return JSON.parse(storedNews);
    }
    
    // Default news articles
    return [
      {
        id: 1,
        title: 'Khởi động khóa học phiên dịch mùa thu 2025',
        category: 'dao-tao',
        content: 'Chúng tôi vui mừng thông báo khai giảng khóa học phiên dịch chuyên nghiệp mới với nhiều cải tiến trong chương trình giảng dạy.',
        image: 'https://picsum.photos/seed/news1/400/250.jpg',
        author: 'Admin',
        date: new Date('2025-10-15').toISOString()
      },
      {
        id: 2,
        title: 'Thành công tại hội thảo quốc tế về biến đổi khí hậu',
        category: 'su-kien',
        content: 'Đội ngũ phiên dịch viên của chúng tôi đã hoàn thành xuất sắc nhiệm vụ tại hội thảo quốc tế về biến đổi khí hậu với sự tham gia của 30 quốc gia.',
        image: 'https://picsum.photos/seed/news2/400/250.jpg',
        author: 'Admin',
        date: new Date('2025-10-10').toISOString()
      },
      {
        id: 3,
        title: 'Công nghệ AI trong phiên dịch: Xu hướng tương lai',
        category: 'ngon-ngu',
        content: 'Bài viết phân tích xu hướng ứng dụng trí tuệ nhân tạo trong ngành phiên dịch và cơ hội cho các phiên dịch viên.',
        image: 'https://picsum.photos/seed/news3/400/250.jpg',
        author: 'Admin',
        date: new Date('2025-10-05').toISOString()
      }
    ];
  }

  saveNewsToStorage() {
    localStorage.setItem('newsArticles', JSON.stringify(this.news));
  }

  renderNews() {
    if (!this.newsGrid) return;
    
    this.newsGrid.innerHTML = '';
    
    // Sort news by date (newest first)
    const sortedNews = [...this.news].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedNews.forEach(article => {
      const newsCard = this.createNewsCard(article);
      this.newsGrid.appendChild(newsCard);
    });
  }

  createNewsCard(article) {
    const card = document.createElement('article');
    card.className = 'news-card';
    card.innerHTML = `
      <div class="news-card__image">
        <img src="${article.image}" alt="${article.title}" loading="lazy">
        <div class="news-card__category">${this.getCategoryLabel(article.category)}</div>
      </div>
      <div class="news-card__content">
        <h3 class="news-card__title">${article.title}</h3>
        <p class="news-card__excerpt">${this.truncateText(article.content, 120)}</p>
        <div class="news-card__meta">
          <span class="news-card__author">${article.author}</span>
          <span class="news-card__date">${this.formatDate(article.date)}</span>
        </div>
        <div class="news-card__actions">
          <button class="btn btn--ghost btn--small" onclick="newsManager.viewNews(${article.id})" data-i18n="news.viewMore">Xem thêm</button>
          <button class="btn btn--ghost btn--small btn--danger" onclick="newsManager.deleteNews(${article.id})" data-i18n="news.delete">Xóa</button>
        </div>
      </div>
    `;
    return card;
  }

  getCategoryLabel(category) {
    if (this.translations.categories) {
      const categoryMap = {
        'ngon-ngu': this.translations.categories.language,
        'su-kien': this.translations.categories.events,
        'dao-tao': this.translations.categories.training,
        'khac': this.translations.categories.other
      };
      return categoryMap[category] || this.translations.categories.other;
    }
    
    // Fallback to Vietnamese
    const categories = {
      'ngon-ngu': 'Ngôn ngữ',
      'su-kien': 'Sự kiện',
      'dao-tao': 'Đào tạo',
      'khac': 'Khác'
    };
    return categories[category] || 'Khác';
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const currentLang = document.documentElement.lang || 'vi';
    const locale = currentLang === 'en' ? 'en-US' : currentLang === 'zh' ? 'zh-CN' : 'vi-VN';
    
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  openModal() {
    if (this.modal) {
      this.modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
      this.form.reset();
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.style.display = 'none';
      document.body.style.overflow = '';
      this.form.reset();
    }
  }

  saveNews() {
    if (!this.form) return;
    
    // Prevent default form submission
    event.preventDefault();
    
    // Basic form validation
    const title = this.form.querySelector('#newsTitle').value.trim();
    const content = this.form.querySelector('#newsContent').value.trim();
    const author = this.form.querySelector('#newsAuthor').value.trim();
    
    if (!title || !content || !author) {
      this.showNotification('Vui lòng điền đầy đủ các trường bắt buộc!', 'error');
      return;
    }
    
    const formData = new FormData(this.form);
    const newArticle = {
      id: Date.now(),
      title: formData.get('title'),
      category: formData.get('category'),
      content: formData.get('content'),
      image: formData.get('image') || `https://picsum.photos/seed/news${Date.now()}/400/250.jpg`,
      author: formData.get('author'),
      date: new Date().toISOString()
    };
    
    this.news.push(newArticle);
    this.saveNewsToStorage();
    this.renderNews();
    this.closeModal();
    
    // Show success message
    const successMessage = this.translations.messages?.added || 'Tin tức đã được thêm thành công!';
    this.showNotification(successMessage, 'success');
  }

  deleteNews(id) {
    const confirmMessage = this.translations.messages?.confirmDelete || 'Bạn có chắc chắn muốn xóa tin tức này?';
    if (confirm(confirmMessage)) {
      this.news = this.news.filter(article => article.id !== id);
      this.saveNewsToStorage();
      this.renderNews();
      const deleteMessage = this.translations.messages?.deleted || 'Tin tức đã được xóa!';
      this.showNotification(deleteMessage, 'info');
    }
  }

  viewNews(id) {
    const article = this.news.find(a => a.id === id);
    if (article) {
      // Create a simple modal to view the full article
      const viewModal = document.createElement('div');
      viewModal.className = 'modal';
      viewModal.innerHTML = `
        <div class="modal__overlay"></div>
        <div class="modal__content modal__content--large">
          <div class="modal__header">
            <h3>${article.title}</h3>
            <button class="modal__close" aria-label="Đóng">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="modal__body">
            <div class="news-article">
              <div class="news-article__image">
                <img src="${article.image}" alt="${article.title}">
              </div>
              <div class="news-article__meta">
                <span class="news-article__category">${this.getCategoryLabel(article.category)}</span>
                <span class="news-article__author">${this.translations.authorPrefix || 'Tác giả:'} ${article.author}</span>
                <span class="news-article__date">${this.formatDate(article.date)}</span>
              </div>
              <div class="news-article__content">
                <p>${article.content}</p>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(viewModal);
      viewModal.style.display = 'block';
      
      // Close modal handlers
      const closeBtn = viewModal.querySelector('.modal__close');
      const overlay = viewModal.querySelector('.modal__overlay');
      
      const closeModal = () => {
        viewModal.remove();
      };
      
      closeBtn.addEventListener('click', closeModal);
      overlay.addEventListener('click', closeModal);
      
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeModal();
        }
      });
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // Hide and remove notification
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
}

// Initialize news manager
const newsManager = new NewsManager();
