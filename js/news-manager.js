// News Management System Module
class NewsManager {
  constructor() {
    this.news = [];
    this.modal = null;
    this.form = null;
    this.newsGrid = null;
    this.addNewsBtn = null;
    this.saveNewsBtn = null;
    this.cancelNewsBtn = null;
    this.closeModalBtn = null;
    this.translations = {};
  }

  init() {
    // Initialize elements after DOM is ready
    setTimeout(() => {
      this.modal = document.getElementById('newsModal');
      this.form = document.getElementById('newsForm');
      this.newsGrid = document.getElementById('newsGrid');
      this.addNewsBtn = document.getElementById('addNewsBtn');
      this.saveNewsBtn = document.getElementById('saveNewsBtn');
      this.cancelNewsBtn = document.getElementById('cancelNewsBtn');
      this.closeModalBtn = document.querySelector('.modal__close');
      
      // Load initial news
      this.loadNewsFromJSON();
      
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
        if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
          this.closeModal();
        }
      });
    }, 100);
  }

  async loadNewsFromJSON() {
    try {
      const response = await fetch('data/news-data.json');
      const data = await response.json();
      this.news = data.news || [];
      this.renderNews();
    } catch (error) {
      console.error('Error loading news data:', error);
      // Fallback to default news if JSON file fails to load
      const errorTitle = this.translations.errorTitle || 'Không thể tải tin tức';
      const errorMessage = this.translations.errorMessage || 'Đã xảy ra lỗi khi tải dữ liệu tin tức. Vui lòng thử lại sau.';
      
      this.news = [
        {
          id: 1,
          title: errorTitle,
          category: 'khac',
          categoryDisplay: this.getCategoryLabel('khac'),
          content: errorMessage,
          image: 'https://picsum.photos/seed/error/400/250.jpg',
          author: 'System',
          date: new Date().toISOString().split('T')[0],
          display: true
        }
      ];
      this.renderNews();
    }
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

  renderNews() {
    if (!this.newsGrid) return;
    
    this.newsGrid.innerHTML = '';
    
    // Filter news to only show items with display: true
    const visibleNews = this.news.filter(article => article.display !== false);
    
    // Sort news by date (newest first)
    const sortedNews = [...visibleNews].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedNews.length === 0) {
      const noNewsMessage = this.translations.noNews || 'Không có tin tức nào để hiển thị.';
      this.newsGrid.innerHTML = `<p>${noNewsMessage}</p>`;
      return;
    }
    
    sortedNews.forEach(article => {
      const newsCard = this.createNewsCard(article);
      this.newsGrid.appendChild(newsCard);
    });
  }

  createNewsCard(article) {
    const card = document.createElement('article');
    card.className = 'news-card';
    
    // Use background image style for the image container
    const imageStyle = article.image ? `background-image: url('${article.image}')` : '';
    
    card.innerHTML = `
      <div class="news-card__image" style="${imageStyle}">
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
        </div>
      </div>
    `;
    return card;
  }

  getCategoryLabel(category) {
    // First check if we have a categoryDisplay in the article itself
    if (this.news.length > 0) {
      const articleWithCategory = this.news.find(article => article.category === category && article.categoryDisplay);
      if (articleWithCategory) {
        return articleWithCategory.categoryDisplay;
      }
    }
    
    // Fall back to translations
    if (this.translations.categories) {
      const categoryMap = {
        'ngon-ngu': this.translations.categories.language,
        'su-kien': this.translations.categories.events,
        'dao-tao': this.translations.categories.training,
        'khac': this.translations.categories.other
      };
      return categoryMap[category] || this.translations.categories.other;
    }
    
    // Final fallback to Vietnamese
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
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (this.form) this.form.reset();
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
      if (this.form) this.form.reset();
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
      const requiredFieldsMessage = this.translations.requiredFields || 'Vui lòng điền đầy đủ các trường bắt buộc!';
      this.showNotification(requiredFieldsMessage, 'error');
      return;
    }
    
    const formData = new FormData(this.form);
    const category = formData.get('category');
    
    // Get category display name
    let categoryDisplay = '';
    if (this.translations.categories) {
      const categoryMap = {
        'ngon-ngu': this.translations.categories.language,
        'su-kien': this.translations.categories.events,
        'dao-tao': this.translations.categories.training,
        'khac': this.translations.categories.other
      };
      categoryDisplay = categoryMap[category] || this.translations.categories.other;
    } else {
      const categories = {
        'ngon-ngu': 'Ngôn ngữ',
        'su-kien': 'Sự kiện',
        'dao-tao': 'Đào tạo',
        'khac': 'Khác'
      };
      categoryDisplay = categories[category] || 'Khác';
    }
    
    const newArticle = {
      id: Date.now(),
      title: formData.get('title'),
      category: category,
      categoryDisplay: categoryDisplay,
      content: formData.get('content'),
      image: formData.get('image') || `https://picsum.photos/seed/news${Date.now()}/400/250.jpg`,
      author: formData.get('author'),
      date: new Date().toISOString().split('T')[0],
      display: true
    };
    
    this.news.push(newArticle);
    this.renderNews();
    this.closeModal();
    
    // Show success message
    const successMessage = this.translations.messages?.added || 'Tin tức đã được thêm thành công!';
    this.showNotification(successMessage, 'success');
    
    // Log the updated news data (in a real application, this would be saved to the server)
    console.log('Updated news data:', JSON.stringify({ news: this.news }, null, 2));
  }

  viewNews(id) {
    const article = this.news.find(a => a.id === id);
    if (article) {
      // Create a simple modal to view the full article
      const viewModal = document.createElement('div');
      viewModal.className = 'modal active';
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
              <div class="news-article__image" style="background-image: url('${article.image}')">
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

// Export for use in other modules
window.NewsManager = NewsManager;