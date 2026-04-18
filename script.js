/**
 * Portfólio Maryana Cunha - Script Principal
 * Versão Otimizada v2.0
 */

class PortfolioApp {
    constructor() {
        this.init();
    }

    init() {
        // Cache DOM elements
        this.elements = this.cacheElements();
        
        // Bind methods
        this.boundMethods = {
            handleResize: this.debounce(this.handleResize.bind(this), 250),
            handleScroll: this.throttle(this.handleScroll.bind(this), 16),
            handleIntersection: this.handleIntersection.bind(this)
        };

        // Initialize all modules
        this.initLoading();
        this.initDarkMode();
        this.initNavigation();
        this.initCarousel();
        this.initModal();
        this.initRevealAnimations();
        this.initImageErrorHandling();

        // Event listeners
        window.addEventListener('resize', this.boundMethods.handleResize);
        window.addEventListener('scroll', this.boundMethods.handleScroll);
        document.addEventListener('keydown', this.handleKeydown.bind(this));

        console.log('✨ Portfolio inicializado com sucesso!');
    }

    cacheElements() {
        return {
            loadingScreen: document.getElementById('loadingScreen'),
            darkModeBtn: document.getElementById('darkModeBtn'),
            header: document.getElementById('header'),
            mobileMenuBtn: document.getElementById('mobileMenuBtn'),
            navLinks: document.querySelector('.nav-links'),
            carouselTrack: document.getElementById('carouselTrack'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            carouselIndicators: document.getElementById('carouselIndicators'),
            carouselStatus: document.getElementById('carouselStatus'),
            modal: document.getElementById('imageModal'),
            modalImage: document.getElementById('modal-image'),
            modalClose: document.querySelector('.modal-close')
        };
    }

    // ===== LOADING SCREEN =====
    initLoading() {
        // Simular carregamento de recursos
        const resourcesLoaded = () => {
            return new Promise(resolve => {
                setTimeout(() => resolve(), 1200);
            });
        };

        resourcesLoaded().then(() => {
            this.elements.loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                this.elements.loadingScreen.style.display = 'none';
            }, 500);
        });
    }

    // ===== MODO ESCURO/CLARO =====
    initDarkMode() {
        const icon = this.elements.darkModeBtn.querySelector('i');
        const savedMode = localStorage.getItem('darkMode');

        if (savedMode === 'enabled' || (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.body.classList.add('dark-mode');
            icon.className = 'fas fa-sun';
        }

        this.elements.darkModeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
        });
    }

    // ===== NAVEGAÇÃO MOBILE =====
    initNavigation() {
        if (!this.elements.mobileMenuBtn) return;

        this.elements.mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = this.elements.navLinks.classList.toggle('active');
            this.elements.mobileMenuBtn.setAttribute('aria-expanded', isActive);
            
            const icon = this.elements.mobileMenuBtn.querySelector('i');
            icon.className = isActive ? 'fas fa-times' : 'fas fa-bars';
        });

        // Fechar menu ao clicar em link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                this.elements.navLinks.classList.remove('active');
                this.elements.mobileMenuBtn.setAttribute('aria-expanded', 'false');
                this.elements.mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
            });
        });

        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.header-container')) {
                this.elements.navLinks.classList.remove('active');
                this.elements.mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ===== CARROSSEL DE FERRAMENTAS (SUPER OTIMIZADO) =====
    initCarousel() {
        if (!this.elements.carouselTrack) return;

        this.carousel = new Carousel(this.elements);
        this.carousel.init();
    }

    // ===== MODAL DE IMAGENS =====
    initModal() {
        const modalImages = document.querySelectorAll('.uiux-item img, .post-card img, .project-image img');
        let currentImageIndex = 0;
        const imageArray = Array.from(modalImages);

        // Abrir modal
        modalImages.forEach((img, index) => {
            img.addEventListener('click', () => {
                currentImageIndex = index;
                this.openModal(imageArray[currentImageIndex].src, imageArray[currentImageIndex].alt);
            });

            // Keyboard support
            img.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openModal(imageArray[index].src, imageArray[index].alt);
                }
            });
        });

        // Navegação no modal
        const modalPrev = document.querySelector('.nav-btn.prev');
        const modalNext = document.querySelector('.nav-btn.next');

        modalPrev?.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex - 1 + imageArray.length) % imageArray.length;
            this.elements.modalImage.src = imageArray[currentImageIndex].src;
            this.elements.modalImage.alt = imageArray[currentImageIndex].alt;
        });

        modalNext?.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex + 1) % imageArray.length;
            this.elements.modalImage.src = imageArray[currentImageIndex].src;
            this.elements.modalImage.alt = imageArray[currentImageIndex].alt;
        });

        // Fechar modal
        this.elements.modalClose.addEventListener('click', () => this.closeModal());
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) this.closeModal();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.elements.modal.classList.contains('active')) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeModal();
                    break;
                case 'ArrowLeft':
                    modalPrev?.click();
                    break;
                case 'ArrowRight':
                    modalNext?.click();
                    break;
            }
        });
    }

    openModal(src, alt) {
        this.elements.modalImage.src = src;
        this.elements.modalImage.alt = alt;
        this.elements.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    }

    closeModal() {
        this.elements.modal.classList.remove('active');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
    }

    // ===== ANIMAÇÕES DE SCROLL REVEAL =====
    initRevealAnimations() {
        const revealElements = document.querySelectorAll('.reveal');
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => this.observer.observe(el));
    }

    // ===== HEADER SCROLL EFFECT =====
    handleScroll() {
        const scrollY = window.scrollY;
        this.elements.header.classList.toggle('scrolled', scrollY > 50);
    }

    // ===== RESPONSIVE & RESIZE HANDLER =====
    handleResize() {
        // Recalcular carrossel
        if (this.carousel) {
            this.carousel.updateDimensions();
        }

        // Fechar menu mobile em desktop
        if (window.innerWidth >= 768) {
            this.elements.navLinks.classList.remove('active');
            this.elements.mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
    }

    // ===== KEYBOARD NAVIGATION =====
    handleKeydown(e) {
        // Skip link focus management
        if (e.key === 'Tab' && document.activeElement.classList.contains('skip-link')) {
            e.preventDefault();
            document.querySelector('#main-content')?.focus();
        }
    }

    // ===== TRATAMENTO DE ERROS DE IMAGENS =====
    initImageErrorHandling() {
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('error', function() {
                console.warn(`Imagem não carregou: ${this.src}`);
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5hbyBjYXJnYWRhPC90ZXh0Pjwvc3ZnPg==';
                this.alt = 'Imagem não disponível';
            });
        });
    }

    // ===== UTILS =====
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// ===== CARROSSEL CLASS (MODULAR) =====
class Carousel {
    constructor(elements) {
        this.elements = elements;
        this.toolsData = [
            { name: 'HTML', icon: 'html.png' },
            { name: 'CSS', icon: 'css-3.png' },
            { name: 'JavaScript', icon: 'Javas script.png' },
            { name: 'Figma', icon: 'figma.png' },
            { name: 'Photopea', icon: 'Photopea.webp' },
            { name: 'GIMP', icon: 'gimp.png' },
            { name: 'Krita', icon: 'krita.webp' },
            { name: 'Canva', icon: 'canva.png' },
            { name: 'WordPress', icon: 'world press.png' },
            { name: 'Wix', icon: 'Wix.png' },
            { name: 'Alight Motion', icon: 'alight motion.png' },
            { name: 'CapCut', icon: 'cap cut.webp' }
        ];
        
        this.state = {
            currentIndex: 0,
            isAutoPlaying: true,
            isDragging: false,
            animationId: null,
            itemWidth: 0,
            containerWidth: 0,
            itemsPerView: 0
        };
    }

    init() {
        this.renderTools();
        this.calculateDimensions();
        this.createIndicators();
        this.bindEvents();
        this.startAutoPlay();
    }

    renderTools() {
        const track = this.elements.carouselTrack;
        track.innerHTML = '';

        // Render 2x para efeito infinito
        this.toolsData.concat(this.toolsData).forEach(tool => {
            const toolItem = document.createElement('div');
            toolItem.className = 'tool-item';
            toolItem.setAttribute('role', 'img');
            toolItem.setAttribute('aria-label', `${tool.name}`);
            toolItem.innerHTML = `
                <img src="${tool.icon}" alt="${tool.name}" class="tool-icon" loading="lazy" width="48" height="48">
                <span class="tool-name">${tool.name}</span>
            `;
            track.appendChild(toolItem);
        });
    }

    calculateDimensions() {
        this.state.containerWidth = this.elements.carouselTrack.parentElement.offsetWidth;
        const firstItem = this.elements.carouselTrack.querySelector('.tool-item');
        if (firstItem) {
            this.state.itemWidth = firstItem.offsetWidth + 32; // + gap
            this.state.itemsPerView = Math.floor(this.state.containerWidth / this.state.itemWidth);
        }
        this.updateTransform();
    }

    createIndicators() {
        const indicatorsContainer = this.elements.carouselIndicators;
        indicatorsContainer.innerHTML = '';

        const totalSlides = Math.ceil(this.toolsData.length / this.state.itemsPerView);
        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('button');
            indicator.className = `indicator ${i === 0 ? 'active' : ''}`;
            indicator.setAttribute('aria-label', `Ir para slide ${i + 1}`);
            indicator.addEventListener('click', () => this.goToSlide(i));
            indicatorsContainer.appendChild(indicator);
        }
    }

    bindEvents() {
        this.elements.prevBtn.addEventListener('click', () => this.prev());
        this.elements.nextBtn.addEventListener('click', () => this.next());

        // Touch/Swipe support
        let startX = 0;
        let currentX = 0;

        this.elements.carouselTrack.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            this.pause();
        });

        this.elements.carouselTrack.addEventListener('touchmove', (e) => {
            currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            if (Math.abs(diff) > 50) {
                diff > 0 ? this.next() : this.prev();
            }
        });

        this.elements.carouselTrack.addEventListener('touchend', () => {
            setTimeout(() => this.startAutoPlay(), 2000);
        });

        // Mouse hover pause
        const wrapper = this.elements.carouselTrack.parentElement;
        wrapper.addEventListener('mouseenter', () => this.pause());
        wrapper.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    updateTransform() {
        const translateX = -(this.state.currentIndex * this.state.itemWidth);
        this.elements.carouselTrack.style.transform = `translateX(${translateX}px)`;
        this.updateIndicators();
        this.updateStatus();
    }

    next() {
        this.state.currentIndex = (this.state.currentIndex + 1) % this.toolsData.length;
        this.updateTransform();
        this.pause();
        setTimeout(() => this.startAutoPlay(), 3000);
    }

    prev() {
        this.state.currentIndex = (this.state.currentIndex - 1 + this.toolsData.length) % this.toolsData.length;
        this.updateTransform();
        this.pause();
        setTimeout(() => this.startAutoPlay(), 3000);
    }

    goToSlide(index) {
        this.state.currentIndex = index;
        this.updateTransform();
        this.pause();
        setTimeout(() => this.startAutoPlay(), 3000);
    }

    updateIndicators() {
        const indicators = this.elements.carouselIndicators.querySelectorAll('.indicator');
        const activeIndex = this.state.currentIndex % Math.ceil(this.toolsData.length / this.state.itemsPerView);
        indicators.forEach((ind, i) => {
            ind.classList.toggle('active', i === activeIndex);
        });
    }

    updateStatus() {
        const status = this.elements.carouselStatus.querySelector('span');
        status.textContent = this.state.isAutoPlaying 
            ? 'Animação automática ativa' 
            : 'Animação pausada';
    }

    startAutoPlay() {
        if (this.state.animationId) cancelAnimationFrame(this.state.animationId);
        
        this.state.isAutoPlaying = true;
        let startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = (currentTime - startTime) / 25000; // 25s cycle
            this.state.currentIndex = Math.floor(elapsed * this.toolsData.length) % this.toolsData.length;
            this.updateTransform();
            
            if (this.state.isAutoPlaying) {
                this.state.animationId = requestAnimationFrame(animate);
            }
        };

        this.state.animationId = requestAnimationFrame(animate);
    }

    pause() {
        this.state.isAutoPlaying = false;
        if (this.state.animationId) {
            cancelAnimationFrame(this.state.animationId);
            this.state.animationId = null;
        }
    }

    updateDimensions() {
        this.calculateDimensions();
        this.createIndicators();
    }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    // Inserir dados das ferramentas no HTML
    const toolsContainer = document.getElementById('carouselTrack');
    if (toolsContainer) {
        // Tools já são inseridas via JS na classe Carousel
    }

    new PortfolioApp();
});

// ===== SERVICE WORKER (PWA READY) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registrado'))
            .catch(err => console.log('SW falhou'));
    });
}

// Performance monitoring
if (performance.getEntriesByType('navigation')[0].loadEventEnd < 2000) {
    console.log('🐇 Carregamento ultra-rápido!');
} else {
    console.log('🐌 Otimizar assets');
}