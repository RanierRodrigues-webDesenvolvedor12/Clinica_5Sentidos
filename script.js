gsap.registerPlugin(ScrollTrigger, SplitText);

/* ================= 0. Estado Inicial (Evita o Flash/Delay) ================= */
/* 1. Preparamos o SplitText imediatamente ao carregar a página */
const heroSplit = new SplitText('.hero h1', { type: 'lines, words, chars' });

/* 2. Escondemos os elementos ANTES do preloader começar */
gsap.set(heroSplit.words, { opacity: 0, y: 40, mask: "lines" });
gsap.set('.pill', { opacity: 0, y: 40 });
gsap.set('.buttons-wrapper', { opacity: 0, y: 40 });

// Prepara as imagens para surgirem de baixo, transparentes e um pouco menores
gsap.set('.hero-img', { y: 150, opacity: 0, scale: 0.8 }); 

/* ================= Helpers ================= */
const isMobile = window.matchMedia("(max-width: 768px)").matches;
const isSmallMobile = window.matchMedia("(max-width: 480px)").matches;

/* ================= 0.5 Cabeçalho fixo + menu mobile ================= */
const siteHeader = document.querySelector('.site-header');
const menuToggle = document.querySelector('#menuToggle');
const siteNav = document.querySelector('#siteNav');

function onHeaderScroll() {
    siteHeader.classList.toggle('scrolled', window.scrollY > 40);
}
window.addEventListener('scroll', onHeaderScroll, { passive: true });
onHeaderScroll();

function closeMenu() {
    siteNav.classList.remove('is-open');
    menuToggle.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
}

menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    menuToggle.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
});

siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
});

/* ================= 1. Pré-loader ================= */
const tlPreloader = gsap.timeline();

tlPreloader.to(".preloader-title span", {
    y: 0, opacity: 1, stagger: 0.05, duration: 0.8, ease: "back.out(1.7)"
})
.to(".preloader-subtitle", {
    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: 1, ease: "power2.inOut"
})
.to(".preloader-logo", {
    y: 0, scale: 1, opacity: 1, duration: 1.2, ease: "power3.out"
})
.to("#preloader", {
    yPercent: -100, duration: 1, ease: "power4.inOut", delay: 0.5,
    onComplete: () => {
        /* Chama as animações apenas após o preloader sumir */
        setupScrollAnimations();
        animateHero(); // Executa a entrada suave dos elementos
    }
});

/* ================= 2. Hero: Animação de Entrada ================= */
function animateHero() {
    const tl = gsap.timeline();

    tl.to('.pill', {
        opacity: 1, y: 0,
        duration: 0.6, ease: 'power3.out'
    })
    .to(heroSplit.words, {
        opacity: 1, y: 0,
        duration: 0.8, stagger: 0.15, ease: "back.out(1.7)",
    }, '-=0.3')
    
    // PASSO 1: As imagens sobem empilhadas (uma logo atrás da outra)
    .to('.hero-img', {
        y: 0,
        opacity: 1,
        scale: 0.9, // Sobem um pouco menores para dar profundidade
        duration: 0.7,
        stagger: 0.1, // Delay sutil entre elas
        ease: "back.out(1.2)"
    }, '-=0.4')
    
    // PASSO 2: Elas se abrem (Spread) - Usamos uma "Label" para que aconteçam ao mesmo tempo
    .addLabel('spread') 
    .to('.img-1', {
        xPercent: -80, // Move para a esquerda (baseado no próprio tamanho)
        rotation: -6,  // Inclina levemente
        duration: 1.2,
        ease: "power4.inOut"
    }, 'spread')
    .to('.img-3', {
        xPercent: 80,  // Move para a direita
        rotation: 6,    // Inclina levemente
        duration: 1.2,
        ease: "power4.inOut"
    }, 'spread')
    .to('.img-2', {
        scale: 1.05,    // A do meio vem um pouco para frente (cresce)
        duration: 1.2,
        ease: "power4.inOut"
    }, 'spread')
    
    // PASSO 3: Os botões aparecem logo após as imagens começarem a se abrir
    .to('.buttons-wrapper', {
        opacity: 1, y: 0,
        duration: 0.6, ease: 'power3.out'
    }, '-=0.8');
}

/* ================= 3. Todas as animações scroll-driven ================= */
function setupScrollAnimations() {

    /* --- Giant Text: marquee automático infinito --- */
    const giantTrack = document.querySelector(".giant-text-track");
    const giantTexts = document.querySelectorAll(".giant-text");
    if (giantTrack && giantTexts.length === 2) {
        const textWidth = giantTexts[0].offsetWidth;

        /* Com 2 cópias idênticas, mover de 0 até -textWidth cria loop perfeito */
        const marquee = gsap.to(giantTrack, {
            x: -textWidth,
            duration: textWidth / (isMobile ? 40 : 55),
            ease: "none",
            repeat: -1
        });

        /* Pausa quando a seção não está visível para economizar recursos */
        ScrollTrigger.create({
            trigger: ".giant-text-section",
            start: "top bottom",
            end: "bottom top",
            onEnter: () => marquee.play(),
            onLeave: () => marquee.pause(),
            onEnterBack: () => marquee.play(),
            onLeaveBack: () => marquee.pause()
        });
    }

    /* ================= Estrutura da Clínica ================= */
    if (isMobile) {
        setupMobileStructure();
    } else {
        setupDesktopStructure();
    }

    /* --- Vegetais flutuantes (aparecem no scroll) --- */
    gsap.utils.toArray(".decor").forEach((el) => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 90%",
                toggleActions: "play none none none"
            },
            scale: 0, opacity: 0, duration: 0.6, ease: "back.out(1.7)"
        });
    });

    gsap.to(".decor", {
        y: isMobile ? 6 : 15,
        rotation: isMobile ? 3 : 5,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: 0.5
    });

    /* --- Chamada da nova animação do vídeo --- */
    setupVideoScaleAnimation();
    
    /* --- CORREÇÃO DO BUG: Força o recalculo de todas as posições da página --- */
    ScrollTrigger.refresh();
}

/* ================= Desktop: scroll horizontal + SVG ================= */
function setupDesktopStructure() {
    const track = document.querySelector(".horizontal-track");
    const svgPath = document.querySelector("#h-line");

    if (!track || !svgPath) return;

    const pathLength = svgPath.getTotalLength();
    gsap.set(svgPath, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength
    });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".horizontal-scroll-wrapper",
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => "+=" + track.scrollWidth
        }
    });

    tl.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: "none"
    }, 0);

    tl.to(svgPath, {
        strokeDashoffset: 0,
        ease: "none"
    }, 0);
}

/* ================= Mobile: SVG vertical + cards scroll-driven ================= */
function setupMobileStructure() {
    const wrapper = document.querySelector(".horizontal-scroll-wrapper");
    const vLine = document.querySelector("#v-line");
    const slides = gsap.utils.toArray(".h-slide");

    if (!wrapper) return;

    /* --- SVG vertical: desenha conforme o usuario rola --- */
    if (vLine) {
        const vPathLength = vLine.getTotalLength();
        gsap.set(vLine, {
            strokeDasharray: vPathLength,
            strokeDashoffset: vPathLength
        });

        gsap.to(vLine, {
            scrollTrigger: {
                trigger: wrapper,
                start: "top 80%",
                end: "bottom 20%",
                scrub: 1
            },
            strokeDashoffset: 0,
            ease: "none"
        });
    }

    /* --- Cada card surge com scroll --- */
    slides.forEach((slide, i) => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: slide,
                start: "top 85%",
                end: "top 50%",
                scrub: 1
            }
        });

        /* Texto e imagem surgem juntos */
        const textEl = slide.querySelector(".slide-text");
        const imgEl = slide.querySelector(".slide-image-wrapper");

        if (textEl) {
            tl.from(textEl, {
                y: 60, opacity: 0, duration: 1
            }, 0);
        }
        if (imgEl) {
            tl.from(imgEl, {
                y: 80, opacity: 0, scale: 0.9, duration: 1
            }, 0.15);
        }
    });
}

/* ================= 4. Hero: Hover profissional nas imagens ================= */
function setupHeroHover() {
    const gallery = document.querySelector(".hero-gallery");
    const imgs = gsap.utils.toArray(".hero-img");
    if (!gallery || imgs.length === 0) return;

    const origin = new Map();
    const rotX = new Map();
    const rotY = new Map();
    let active = null;
    let resetTimer = null;

    const capture = (img) => {
        if (origin.has(img)) return;
        origin.set(img, {
            zIndex: parseInt(getComputedStyle(img).zIndex) || 1,
            scale: gsap.getProperty(img, "scale"),
            rotation: gsap.getProperty(img, "rotation"),
            y: gsap.getProperty(img, "y"),
            opacity: gsap.getProperty(img, "opacity"),
            filter: "none",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
        });
    };

    const restore = (img) => {
        if (!origin.has(img)) return;
        const o = origin.get(img);
        gsap.to(img, {
            scale: o.scale,
            rotation: o.rotation,
            y: o.y,
            rotationX: 0,
            rotationY: 0,
            zIndex: o.zIndex,
            opacity: o.opacity,
            filter: "none",
            transformOrigin: "bottom center",
            boxShadow: o.boxShadow,
            duration: 0.5,
            ease: "power3.out",
            overwrite: true
        });
    };

    const resetAll = () => {
        active = null;
        imgs.forEach(restore);
    };

    imgs.forEach((img) => {
        img.style.cursor = "pointer";
        rotX.set(img, gsap.quickTo(img, "rotationX", { duration: 0.7, ease: "power3.out" }));
        rotY.set(img, gsap.quickTo(img, "rotationY", { duration: 0.7, ease: "power3.out" }));

        img.addEventListener("mouseenter", () => {
            if (resetTimer) clearTimeout(resetTimer);
            if (active && active !== img) restore(active);
            active = img;
            imgs.forEach(capture);

            const o = origin.get(img);
            const others = imgs.filter((im) => im !== img);

            gsap.to(img, {
                scale: o.scale * 1.12,
                y: o.y - 25,
                rotation: 0,
                opacity: o.opacity,
                zIndex: 10,
                filter: "brightness(1.04) saturate(1.05)",
                transformOrigin: "center center",
                boxShadow: "0 35px 60px rgba(10,98,138,0.4)",
                duration: 0.55,
                ease: "power3.out",
                overwrite: true
            });

            gsap.to(others, {
                scale: (i) => origin.get(others[i]).scale * 0.9,
                y: (i) => origin.get(others[i]).y + 30,
                opacity: 0.55,
                filter: "blur(3px)",
                duration: 0.5,
                ease: "power2.out",
                overwrite: true
            });
        });

        img.addEventListener("mouseleave", () => {
            if (active !== img) return;
            resetTimer = setTimeout(() => {
                if (active === null) resetAll();
            }, 120);
        });
    });

    gallery.addEventListener("mousemove", (e) => {
        if (!active) return;
        const rect = active.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        rotY.get(active)(px * 16);
        rotX.get(active)(py * -12);
    });

    gallery.addEventListener("mouseleave", resetAll);
}

setupHeroHover();

/* ================= 5. Animação de Expansão do Vídeo ================= */
function setupVideoScaleAnimation() {
    const videoSection = document.querySelector('.video-scale-section');
    const videoWrapper = document.querySelector('.video-wrapper');
    const videoHeader = document.querySelector('.video-header');

    if (!videoSection || !videoWrapper) return;

    // Criamos a timeline atrelada ao scroll
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: videoSection,
            start: "center center", // Animação começa quando o centro da seção chega no centro da tela
            end: "+=100%",          // O usuário precisará rolar 100% da altura da tela para completar
            scrub: true,            // A animação vai e volta acompanhando a barra de rolagem
            pin: true,              // Prende a seção na tela até a animação acabar
            anticipatePin: 1
        }
    });

    // Animação 1: O título some lentamente subindo
    if (videoHeader) {
        tl.to(videoHeader, {
            opacity: 0,
            y: -50,
            duration: 0.3,
            ease: "power1.inOut"
        }, 0);
    }

    // Animação 2: O vídeo cresce até preencher a tela e perde o arredondamento
    tl.to(videoWrapper, {
        width: "100vw",
        height: "100vh",
        maxWidth: "none",
        borderRadius: 0,
        duration: 1,
        ease: "none"
    }, 0); 
}

/* ================= 6. Seção Locação de Consultório ================= */
function setupLeasingAnimations() {
    const section = document.querySelector('.leasing-section');
    if (!section) return;

    /* --- Título: linha 1 animada com SplitText --- */
    const lineOne = document.querySelector('#leasing-title-line');
    if (lineOne && SplitText) {
        const split = new SplitText(lineOne, { type: 'words' });
        gsap.set(split.words, { opacity: 0, yPercent: 130, rotate: 4 });
        gsap.to(split.words, {
            scrollTrigger: {
                trigger: '.leasing-header',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 1, yPercent: 0, rotate: 0,
            duration: 0.85, stagger: 0.06, ease: 'power4.out'
        });
    }

    /* --- Linha de destaque (Playfair) revelada via classe --- */
    const titleEl = document.querySelector('.leasing-title');
    if (titleEl) {
        ScrollTrigger.create({
            trigger: '.leasing-header',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
            onEnter: () => titleEl.classList.add('is-inview'),
            onLeaveBack: () => titleEl.classList.remove('is-inview')
        });
    }

    /* --- Eyebrow + subtítulo --- */
    gsap.from('.leasing-eyebrow, .leasing-subtitle', {
        scrollTrigger: {
            trigger: '.leasing-header',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        opacity: 0, y: 34, duration: 0.7, stagger: 0.12, ease: 'power3.out'
    });

    /* --- Card com imagem do cabeçalho --- */
    gsap.from('.leasing-header-card', {
        scrollTrigger: {
            trigger: '.leasing-header',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        opacity: 0, y: 70, rotate: 4, scale: 0.92, duration: 0.9, ease: 'back.out(1.4)'
    });

    gsap.from('.header-card-img', {
        scrollTrigger: {
            trigger: '.leasing-header',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        scale: 1.15, rotate: 2, duration: 1.7, ease: 'power2.out'
    });

    gsap.from('.header-card-tag', {
        scrollTrigger: {
            trigger: '.leasing-header',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        opacity: 0, y: 26, scale: 0.7, duration: 0.6, delay: 0.4, ease: 'back.out(2.2)'
    });

    gsap.from('.header-card-decor', {
        scrollTrigger: {
            trigger: '.leasing-header',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        scale: 0, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'back.out(1.8)'
    });

    /* --- Texto gigante de fundo: parallax leve --- */
    gsap.to('.leasing-bg-text', {
        scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
        },
        yPercent: 22,
        ease: 'none'
    });

    /* --- Conector dos passos (preenche ao rolar) --- */
    const fill = document.querySelector('.connector-fill');
    if (fill) {
        gsap.fromTo(fill, { scaleX: 0, scaleY: 0 }, {
            scrollTrigger: {
                trigger: '.leasing-steps',
                start: 'top 75%',
                toggleActions: 'play none none reverse'
            },
            scaleX: 1, scaleY: 1, duration: 1.3, ease: 'power2.inOut'
        });
    }

    /* --- Passos --- */
    gsap.from('.leasing-step', {
        scrollTrigger: {
            trigger: '.leasing-steps',
            start: 'top 75%',
            toggleActions: 'play none none none'
        },
        opacity: 0, y: 54, scale: 0.92, duration: 0.8, stagger: 0.16, ease: 'back.out(1.4)'
    });

    /* --- Exemplo (ticket) --- */
    gsap.from('.leasing-example', {
        scrollTrigger: {
            trigger: '.leasing-example',
            start: 'top 88%',
            toggleActions: 'play none none none'
        },
        opacity: 0, y: 30, scale: 0.98, duration: 0.7, ease: 'power3.out'
    });

    /* --- Turnos --- */
    gsap.from('.shift-card', {
        scrollTrigger: {
            trigger: '.leasing-shifts',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        opacity: 0, y: 70, rotateX: -10, duration: 0.9, stagger: 0.14, ease: 'back.out(1.4)'
    });

    /* --- Preço: cartão + badge + contador --- */
    gsap.from('.leasing-price', {
        scrollTrigger: {
            trigger: '.leasing-price',
            start: 'top 82%',
            toggleActions: 'play none none none'
        },
        opacity: 0, y: 70, scale: 0.95, duration: 1, ease: 'power3.out'
    });

    gsap.from('.price-badge', {
        scrollTrigger: {
            trigger: '.leasing-price',
            start: 'top 82%',
            toggleActions: 'play none none none'
        },
        opacity: 0, y: -22, scale: 0.7, duration: 0.6, delay: 0.35, ease: 'back.out(2.2)'
    });

    const priceNum = document.querySelector('.price-number');
    if (priceNum) {
        const target = parseInt(priceNum.dataset.count, 10) || 300;
        const obj = { val: 0 };
        gsap.to(obj, {
            val: target,
            duration: 1.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.leasing-price',
                start: 'top 82%',
                toggleActions: 'play none none none'
            },
            onUpdate: () => {
                priceNum.textContent = Math.round(obj.val);
            }
        });
    }

    /* --- Cabeçalho dos benefícios --- */
    gsap.from('.benefits-kicker, .benefits-title, .benefits-sub', {
        scrollTrigger: {
            trigger: '.benefits-head',
            start: 'top 85%',
            toggleActions: 'play none none none'
        },
        opacity: 0, y: 36, duration: 0.7, stagger: 0.1, ease: 'power3.out'
    });

    /* --- Cards de benefícios --- */
    gsap.from('.benefit-card', {
        scrollTrigger: {
            trigger: '.benefits-grid',
            start: 'top 82%',
            toggleActions: 'play none none none'
        },
        opacity: 0, y: 54, scale: 0.95, duration: 0.7, stagger: 0.09, ease: 'back.out(1.4)'
    });

    /* --- Extras --- */
    gsap.from('.extra-card', {
        scrollTrigger: {
            trigger: '.leasing-extras',
            start: 'top 85%',
            toggleActions: 'play none none none'
        },
        opacity: 0, y: 46, duration: 0.7, stagger: 0.14, ease: 'power3.out'
    });
}

/* ================= 7. Efeito 3D Tilt (hover) ================= */
function setupLeasingTilt() {
    gsap.utils.toArray('[data-tilt]').forEach((card) => {
        const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
        const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            rotY(px * 10);
            rotX(py * -10);
        });
        card.addEventListener('mouseleave', () => {
            rotX(0);
            rotY(0);
        });
    });
}

setupLeasingAnimations();
setupLeasingTilt();

/* --- Garantia extra contra bugs de altura de tela --- */
window.addEventListener("load", () => {
    // Quando todas as imagens carregarem totalmente, atualizamos os marcadores do ScrollTrigger
    ScrollTrigger.refresh();
});