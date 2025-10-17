// UI Components Module

// Menu toggle functionality
function initializeMenuToggle() {
    const navToggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.menu');

    if (navToggle && menu) {
        navToggle.addEventListener('click', () => {
            const isOpen = menu.classList.toggle('show');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }
}

// Submenu toggle functionality
function initializeSubmenuToggle() {
    document.querySelectorAll('.submenu-toggle').forEach(btn => {
        btn.addEventListener('click', e => {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!expanded));
            const submenu = btn.nextElementSibling;
            if (submenu) submenu.style.display = expanded ? 'none' : 'block';
        });
    });
}

// Slider functionality
function initializeSlider() {
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
}

// Form handlers
function initializeFormHandlers() {
    document.querySelectorAll('form').forEach(f => {
        if (f.id !== 'newsForm') {
            f.addEventListener('submit', e => {
                e.preventDefault();
                const alertMessage = window.languageManager ?
                    (window.languageManager.formAlertMessage || 'Đây là mẫu giao diện. Hãy kết nối backend/email theo nhu cầu của bạn.') :
                    'Đây là mẫu giao diện. Hãy kết nối backend/email theo nhu cầu của bạn.';
                alert(alertMessage);
            });
        }
    });
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
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
}

// Set current year in footer
function setCurrentYear() {
    const yearEl = document.querySelector('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// Initialize all UI components
function initializeUIComponents() {
    setCurrentYear();
    initializeMenuToggle();
    initializeSubmenuToggle();
    initializeSlider();
    initializeFormHandlers();
    initializeSmoothScrolling();
}

// Export functions for use in other modules
window.UIComponents = {
    initializeMenuToggle,
    initializeSubmenuToggle,
    initializeSlider,
    initializeFormHandlers,
    initializeSmoothScrolling,
    setCurrentYear,
    initializeUIComponents
};