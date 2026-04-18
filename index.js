// Aguarda o DOM carregar completamente
document.addEventListener('DOMContentLoaded', () => {
    
    // ===== MODO ESCURO/CLARO =====
    const darkModeBtn = document.getElementById('darkModeBtn');
    const darkModeIcon = darkModeBtn.querySelector('i');
    
    // Verificar preferência salva
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeIcon.classList.remove('fa-moon');
        darkModeIcon.classList.add('fa-sun');
    }
    
    darkModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            darkModeIcon.classList.remove('fa-moon');
            darkModeIcon.classList.add('fa-sun');
        } else {
            localStorage.setItem('darkMode', 'disabled');
            darkModeIcon.classList.remove('fa-sun');
            darkModeIcon.classList.add('fa-moon');
        }
    });
    
    // ===== CARROSSEL DE FERRAMENTAS COM ANIMAÇÃO + BOTÕES =====
    const track = document.getElementById('toolsTrack');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const indicatorsContainer = document.getElementById('sliderIndicators');
    
    if (track && prevBtn && nextBtn) {
        // Criar botão de pause/play se não existir
        let playPauseBtn = document.querySelector('.play-pause-btn');
        if (!playPauseBtn) {
            const controlsDiv = document.querySelector('.slider-controls');
            playPauseBtn = document.createElement('button');
            playPauseBtn.className = 'play-pause-btn';
            playPauseBtn.setAttribute('aria-label', 'Pausar/Iniciar animação');
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            controlsDiv.appendChild(playPauseBtn);
        }
        
        // Criar status da animação
        let statusDiv = document.querySelector('.animation-status');
        if (!statusDiv) {
            const toolsContainer = document.querySelector('.tools-section .container');
            statusDiv = document.createElement('div');
            statusDiv.className = 'animation-status';
            statusDiv.innerHTML = '<i class="fas fa-play-circle"></i> <span>Animação automática ativada</span>';
            toolsContainer.appendChild(statusDiv);
        }
        
        const toolItems = document.querySelectorAll('.tool-item');
        const originalItemsCount = 12; // Número original de ferramentas
        const totalItems = toolItems.length;
        
        // Configurações
        let currentPosition = 0;
        let isAutoScrolling = true;
        let animationFrameId;
        let itemWidth = 0;
        let gap = 32;
        
        // Calcular largura dos itens
        function calculateDimensions() {
            const firstItem = document.querySelector('.tool-item');
            if (firstItem) {
                const style = getComputedStyle(firstItem);
                itemWidth = firstItem.offsetWidth;
                const trackStyle = getComputedStyle(track);
                gap = parseInt(trackStyle.gap) || 32;
            }
        }
        
        // Obter largura total de um conjunto completo
        function getFullSetWidth() {
            const originalSet = originalItemsCount;
            return originalSet * (itemWidth + gap);
        }
        
        // Atualizar posição da animação manual
        function updatePosition(instant = false) {
            if (instant) {
                track.style.transition = 'none';
                track.style.transform = `translateX(${currentPosition}px)`;
                // Force reflow
                track.offsetHeight;
                track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            } else {
                track.style.transform = `translateX(${currentPosition}px)`;
            }
        }
        
        // Mover para a direita (avançar)
        function moveRight() {
            const fullWidth = getFullSetWidth();
            
            currentPosition -= (itemWidth + gap) * 2;
            
            // Se passar do limite, voltar ao início suavemente
            if (Math.abs(currentPosition) >= fullWidth) {
                currentPosition = 0;
            }
            
            updatePosition();
            updateIndicatorsFromPosition();
        }
        
        // Mover para a esquerda (voltar)
        function moveLeft() {
            const fullWidth = getFullSetWidth();
            
            currentPosition += (itemWidth + gap) * 2;
            
            // Se passar do início, ir para o final
            if (currentPosition > 0) {
                currentPosition = -fullWidth + (itemWidth + gap) * 2;
            }
            
            updatePosition();
            updateIndicatorsFromPosition();
        }
        
        // Calcular slide atual baseado na posição
        function getCurrentSlideFromPosition() {
            const fullWidth = getFullSetWidth();
            const containerWidth = track.parentElement.offsetWidth;
            const itemsPerView = Math.floor(containerWidth / (itemWidth + gap));
            const totalSlides = Math.ceil(originalItemsCount / itemsPerView);
            const progress = Math.abs(currentPosition) / fullWidth;
            let slide = Math.floor(progress * totalSlides);
            slide = Math.min(Math.max(0, slide), totalSlides - 1);
            return { slide, totalSlides, itemsPerView };
        }
        
        // Atualizar indicadores baseado na posição
        function updateIndicatorsFromPosition() {
            const { slide, totalSlides } = getCurrentSlideFromPosition();
            const indicators = document.querySelectorAll('.indicator');
            indicators.forEach((ind, idx) => {
                if (idx === slide) {
                    ind.classList.add('active');
                } else {
                    ind.classList.remove('active');
                }
            });
        }
        
        // Ir para slide específico (controle manual)
        function goToSlide(slideIndex) {
            if (!isAutoScrolling) {
                const { totalSlides, itemsPerView } = getCurrentSlideFromPosition();
                const fullWidth = getFullSetWidth();
                const slideProgress = slideIndex / totalSlides;
                const targetPosition = -(fullWidth * slideProgress);
                
                currentPosition = targetPosition;
                updatePosition();
                updateIndicatorsFromPosition();
            }
        }
        
        // Animação automática (scroll infinito suave)
        function startAutoScrollAnimation() {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            
            isAutoScrolling = true;
            
            // Atualizar UI
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            statusDiv.innerHTML = '<i class="fas fa-play-circle"></i> <span>Animação automática ativada - passe o mouse para pausar</span>';
            
            // Remover qualquer transição para o scroll contínuo
            track.style.transition = 'none';
            
            let startTime = null;
            const scrollDistance = getFullSetWidth();
            const duration = 30000; // 30 segundos para percorrer tudo
            
            function animate(timestamp) {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = (elapsed % duration) / duration;
                
                // Posição baseada no progresso (scroll infinito)
                const newPosition = -(scrollDistance * progress);
                currentPosition = newPosition;
                track.style.transform = `translateX(${currentPosition}px)`;
                
                // Atualizar indicadores baseado na posição
                updateIndicatorsFromPosition();
                
                animationFrameId = requestAnimationFrame(animate);
            }
            
            animationFrameId = requestAnimationFrame(animate);
        }
        
        // Parar animação automática
        function stopAutoScrollAnimation() {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            
            isAutoScrolling = false;
            
            // Restaurar transição suave
            track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            
            // Atualizar UI
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            statusDiv.innerHTML = '<i class="fas fa-pause-circle"></i> <span>Animação pausada - use os botões para navegar</span>';
        }
        
        // Toggle pause/play
        function toggleAutoScroll() {
            if (isAutoScrolling) {
                stopAutoScrollAnimation();
            } else {
                startAutoScrollAnimation();
            }
        }
        
        // Criar indicadores
        function createIndicators() {
            const { totalSlides } = getCurrentSlideFromPosition();
            indicatorsContainer.innerHTML = '';
            for (let i = 0; i < totalSlides; i++) {
                const indicator = document.createElement('div');
                indicator.classList.add('indicator');
                if (i === 0) indicator.classList.add('active');
                indicator.addEventListener('click', () => {
                    const wasAutoScrolling = isAutoScrolling;
                    if (wasAutoScrolling) {
                        stopAutoScrollAnimation();
                    }
                    goToSlide(i);
                    // Se estava em auto-scroll, reinicia após 5 segundos
                    if (wasAutoScrolling) {
                        setTimeout(() => {
                            if (!isAutoScrolling) {
                                startAutoScrollAnimation();
                            }
                        }, 5000);
                    }
                });
                indicatorsContainer.appendChild(indicator);
            }
        }
        
        // Recalcular ao redimensionar
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const wasAutoScrolling = isAutoScrolling;
                calculateDimensions();
                if (wasAutoScrolling) {
                    stopAutoScrollAnimation();
                    startAutoScrollAnimation();
                }
                createIndicators();
            }, 250);
        });
        
        // Configurar eventos dos botões
        nextBtn.addEventListener('click', () => {
            const wasAutoScrolling = isAutoScrolling;
            if (wasAutoScrolling) {
                stopAutoScrollAnimation();
                moveRight();
                setTimeout(() => {
                    if (!isAutoScrolling) {
                        startAutoScrollAnimation();
                    }
                }, 3000);
            } else {
                moveRight();
            }
        });
        
        prevBtn.addEventListener('click', () => {
            const wasAutoScrolling = isAutoScrolling;
            if (wasAutoScrolling) {
                stopAutoScrollAnimation();
                moveLeft();
                setTimeout(() => {
                    if (!isAutoScrolling) {
                        startAutoScrollAnimation();
                    }
                }, 3000);
            } else {
                moveLeft();
            }
        });
        
        playPauseBtn.addEventListener('click', toggleAutoScroll);
        
        // Adicionar hover pause (pausa ao passar o mouse)
        const sliderContainer = document.querySelector('.tools-slider-container');
        let hoverTimeout;
        
        sliderContainer.addEventListener('mouseenter', () => {
            if (isAutoScrolling) {
                // Pausar visualmente mas manter a lógica
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
            }
        });
        
        sliderContainer.addEventListener('mouseleave', () => {
            if (isAutoScrolling && !animationFrameId) {
                startAutoScrollAnimation();
            }
        });
        
        // Inicializar
        calculateDimensions();
        createIndicators();
        startAutoScrollAnimation();
    }
    
    // ===== ANIMAÇÃO DE SCROLL REVEAL =====
    const elementsToReveal = [
        '.about-image',
        '.about-text', 
        '.section-title',
        '.project-card',
        '.uiux-card',
        '.post-card',
        '.uiux-subtitle'
    ];
    
    elementsToReveal.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.add('reveal');
        });
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px'
    });
    
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
    
    // ===== MODAL PARA IMAGENS =====
    function setupModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <span class="modal-close">&times;</span>
            <img class="modal-content" alt="Visualização ampliada">
        `;
        document.body.appendChild(modal);
        
        const modalImg = modal.querySelector('.modal-content');
        const closeBtn = modal.querySelector('.modal-close');
        
        function openModal(imgSrc) {
            modalImg.src = imgSrc;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                modalImg.src = '';
            }, 300);
        }
        
        closeBtn.onclick = closeModal;
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
        
        return openModal;
    }
    
    const openModal = setupModal();
    
    // Configurar imagens UI/UX
    const uiuxGallery = document.querySelector('.uiux-gallery');
    if (uiuxGallery) {
        const images = uiuxGallery.querySelectorAll('img');
        images.forEach(img => {
            const wrapper = document.createElement('div');
            wrapper.className = 'uiux-card';
            img.parentNode.insertBefore(wrapper, img);
            wrapper.appendChild(img);
            
            wrapper.addEventListener('click', () => {
                openModal(img.src);
            });
        });
    }
    
    // Configurar posts para abrir modal
    const postCards = document.querySelectorAll('.post-card');
    postCards.forEach(card => {
        const img = card.querySelector('img');
        if (img) {
            card.addEventListener('click', () => {
                openModal(img.src);
            });
        }
    });
    
    // Configurar também para jellyfish (que tem estrutura diferente)
    const jellyfishContainer = document.querySelector('.jellyfish-container');
    if (jellyfishContainer) {
        const jellyfishImg = jellyfishContainer.querySelector('.jellyfish-img');
        if (jellyfishImg) {
            jellyfishContainer.closest('.post-card').addEventListener('click', () => {
                openModal(jellyfishImg.src);
            });
        }
    }
    
    // ===== MENU MOBILE =====
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        const navItems = navLinks.querySelectorAll('a');
        navItems.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = mobileBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
    
    // ===== HEADER SCROLL EFFECT =====
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.05)';
        } else {
            header.style.boxShadow = 'none';
        }
    });
    
    // ===== TRATAMENTO DE ERRO DE IMAGENS =====
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            console.warn(`Imagem não encontrada: ${this.src}`);
            this.style.backgroundColor = '#f5f5f5';
            this.style.objectFit = 'contain';
            this.style.padding = '8px';
        });
    });
    
    console.log('✨ Portfólio Maryana Cunha carregado com sucesso!');
});