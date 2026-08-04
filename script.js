// script.js - Lógica de UI e Animações Premium com GSAP

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar Ícones
    lucide.createIcons();

    // 2. Configurações GSAP
    gsap.registerPlugin(ScrollTrigger);

    // Checar preferência do usuário por movimento reduzido
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Se preferir movimento reduzido, revelar elementos hero imediatamente e pular animações complexas
    if (prefersReducedMotion) {
        gsap.set('.hero-elem', { opacity: 1, visibility: 'visible', y: 0 });
        gsap.set('.reveal-up', { opacity: 1, y: 0 });
        gsap.set('.stagger-grid > div, .stagger-testimonials > div', { opacity: 1, y: 0 });
    }

    // 3. Funções de Componentes UI (Não dependem exclusivamente de GSAP)
    initHeaderScroll();
    initMobileMenu();
    initFaqAccordion();

    // 4. Iniciar Animações (se movimento reduzido não estiver ativo)
    if (!prefersReducedMotion) {
        // Garantir que fontes carregaram antes de rodar animações baseadas em geometria
        document.fonts.ready.then(() => {
            initHeroAnimation();
            initScrollReveals();
            initParallax();
            ScrollTrigger.refresh();
        });
    }
});


/**
 * Comportamento do Header ao rolar a página
 */
function initHeaderScroll() {
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header-scrolled');
            header.classList.replace('py-6', 'py-4'); // Tailwind classes adjust
        } else {
            header.classList.remove('header-scrolled');
            header.classList.replace('py-4', 'py-6');
        }
    }, { passive: true });
}

/**
 * Menu Mobile - Abertura e Fechamento com Timeline GSAP
 */
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const menuIcon = menuBtn.querySelector('i');
    
    let isMenuOpen = false;
    
    // Configurar Timeline do menu (Pausada inicialmente)
    const menuTl = gsap.timeline({ paused: true, reversed: true });
    
    menuTl.to(mobileMenu, {
        display: 'flex',
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
    })
    .fromTo(mobileLinks, 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
        "-=0.1"
    );

    const toggleMenu = () => {
        isMenuOpen = !isMenuOpen;
        
        if (isMenuOpen) {
            menuTl.play();
            document.body.style.overflow = 'hidden'; // Previne scroll
            // Update Icon to X (Close) using dataset
            menuIcon.setAttribute('data-lucide', 'x');
        } else {
            menuTl.reverse();
            document.body.style.overflow = '';
            // Update Icon back to Menu
            menuIcon.setAttribute('data-lucide', 'menu');
        }
        lucide.createIcons(); // Refresh icon
    };

    menuBtn.addEventListener('click', toggleMenu);
    
    // Fechar ao clicar em um link
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) toggleMenu();
        });
    });
}

/**
 * Accordion de FAQ (Vanilla JS suave)
 */
function initFaqAccordion() {
    const faqButtons = document.querySelectorAll('.faq-btn');

    faqButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const content = this.nextElementSibling;
            
            // Fechar todos
            document.querySelectorAll('.faq-btn').forEach(otherBtn => {
                otherBtn.setAttribute('aria-expanded', 'false');
                const otherContent = otherBtn.nextElementSibling;
                otherContent.style.height = '0px';
                otherContent.style.opacity = '0';
            });

            // Se não estava aberto, abrir o atual
            if (!isExpanded) {
                this.setAttribute('aria-expanded', 'true');
                content.style.height = content.scrollHeight + 'px';
                content.style.opacity = '1';
                
                // Reset height to auto after transition to handle window resizes
                setTimeout(() => {
                    if (this.getAttribute('aria-expanded') === 'true') {
                        content.style.height = 'auto';
                    }
                }, 300);
            }
        });
    });
}


/**
 * GSAP: Animação de Entrada do Hero
 */
function initHeroAnimation() {
    // Reveal elementos (remove class de prevenção de FOUC)
    gsap.set('.hero-elem', { visibility: 'visible' });

    const tl = gsap.timeline();

    tl.fromTo('.hero-elem',
        { y: 40, opacity: 0 },
        { 
            y: 0, 
            opacity: 1, 
            duration: 0.8, 
            stagger: 0.15, 
            ease: 'power3.out',
            delay: 0.2
        }
    )
    .fromTo('.hero-image',
        { opacity: 0, scale: 0.95, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power2.out' },
        "-=0.6"
    );
}


/**
 * GSAP: Revelação de Elementos no Scroll
 */
function initScrollReveals() {
    // Elementos simples que surgem de baixo
    const revealElements = document.querySelectorAll('.reveal-up');
    
    revealElements.forEach(el => {
        gsap.fromTo(el,
            { y: 40, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%', // Dispara quando o topo do elemento atinge 85% da tela
                    toggleActions: 'play none none none' // Toca uma vez
                }
            }
        );
    });

    // Grids com Stagger (Serviços e Depoimentos)
    const staggerGrids = [
        { trigger: '.stagger-grid', items: '.service-card' },
        { trigger: '.stagger-testimonials', items: '.stagger-testimonials > div' }
    ];

    staggerGrids.forEach(grid => {
        const triggerEl = document.querySelector(grid.trigger);
        if (triggerEl) {
            gsap.fromTo(gsap.utils.toArray(grid.items),
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: triggerEl,
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        }
    });
}


/**
 * GSAP: Parallax Discreto em Imagens
 */
function initParallax() {
    // Parallax no Background do Hero
    const heroBg = document.querySelector('.parallax-bg');
    if (heroBg && window.innerWidth > 768) { // Apenas desktop para performance
        gsap.to(heroBg, {
            yPercent: 15, // Move 15% do próprio tamanho
            ease: 'none',
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    // Parallax suave na imagem "Sobre"
    const aboutImg = document.querySelector('.parallax-img');
    if (aboutImg && window.innerWidth > 768) {
        gsap.to(aboutImg, {
            yPercent: 10,
            scale: 1.05,
            ease: 'none',
            scrollTrigger: {
                trigger: '#sobre',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    }
}