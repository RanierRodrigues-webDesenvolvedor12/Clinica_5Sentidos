gsap.registerPlugin(ScrollTrigger, SplitText);

/* ================= 0.1 Lenis Smooth Scroll ================= */
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    touchMultiplier: 2,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

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
const menuClose = document.querySelector('#menuClose');
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

function toggleMenu(open) {
    siteNav.classList.toggle('is-open', open);
    menuToggle.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
}

menuToggle.addEventListener('click', () => {
    toggleMenu(!siteNav.classList.contains('is-open'));
});

if (menuClose) {
    menuClose.addEventListener('click', () => toggleMenu(false));
}

siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
});

/* ================= 0.6 Scroll suave nas âncoras ================= */
const headerOffset = () => (siteHeader ? siteHeader.offsetHeight : 0);

document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
        const hash = link.getAttribute('href');
        if (hash === '#') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - headerOffset();
        window.scrollTo({ top: Math.max(y, 0), behavior: 'smooth' });
    });
});

/* ================= 0.7 Conector dos passos: alinhamento dinâmico ================= */
function positionStepsConnector() {
    const wrap = document.querySelector('.leasing-steps-wrap');
    const connector = document.querySelector('.steps-connector');
    const fill = document.querySelector('.connector-fill');
    const icons = document.querySelectorAll('.leasing-step .step-icon');
    if (!wrap || !connector || icons.length < 2) return;

    /* Mede a posição real de cada ícone em relação ao wrap usando o layout
       (offsetLeft/offsetTop), ignorando transformações do GSAP (translateY
       da animação dos passos) e o scroll da página. Assim o conector sempre
       aponta para o centro final dos ícones, em qualquer tela. */
    const layoutPos = (el) => {
        let x = 0, y = 0, node = el;
        while (node && node !== wrap && node !== document.body) {
            x += node.offsetLeft;
            y += node.offsetTop;
            node = node.offsetParent;
        }
        if (node !== wrap) {
            const r = el.getBoundingClientRect();
            const w = wrap.getBoundingClientRect();
            return { x: r.left - w.left, y: r.top - w.top, w: el.offsetWidth, h: el.offsetHeight };
        }
        return { x, y, w: el.offsetWidth, h: el.offsetHeight };
    };

    const first = layoutPos(icons[0]);
    const last = layoutPos(icons[icons.length - 1]);
    const c1x = first.x + first.w / 2;
    const c1y = first.y + first.h / 2;
    const c2x = last.x + last.w / 2;
    const c2y = last.y + last.h / 2;

    if (window.innerWidth <= 768) {
        connector.style.left = Math.round(c1x - 2) + 'px';
        connector.style.right = 'auto';
        connector.style.width = '4px';
        connector.style.top = Math.round(c1y) + 'px';
        connector.style.bottom = 'auto';
        connector.style.height = Math.max(Math.round(c2y - c1y), 0) + 'px';
        if (fill) fill.style.transformOrigin = 'top center';
    } else {
        connector.style.left = Math.round(c1x) + 'px';
        connector.style.right = 'auto';
        connector.style.width = Math.max(Math.round(c2x - c1x), 0) + 'px';
        connector.style.top = Math.round(c1y - 2) + 'px';
        connector.style.bottom = 'auto';
        connector.style.height = '4px';
        if (fill) fill.style.transformOrigin = 'left center';
    }
}

positionStepsConnector();
window.addEventListener('load', positionStepsConnector);
window.addEventListener('resize', positionStepsConnector);
if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(positionStepsConnector);
}

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

        /* --- Vegetais: surgem conforme o scroll vertical (mobile) --- */
        gsap.utils.toArray(".decor").forEach((el) => {
            gsap.fromTo(el,
                { scale: 0, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: el,
                        start: "top 100%",
                        end: "top 60%",
                        scrub: 1
                    },
                    scale: 1, opacity: 1, ease: "power2.out"
                }
            );
        });
    } else {
        setupDesktopStructure();
    }

    /* --- Chamada da nova animação do vídeo --- */
    setupVideoScaleAnimation();
    
    /* --- CORREÇÃO DO BUG: Força o recalculo de todas as posições da página --- */
    ScrollTrigger.refresh();

    ScrollTrigger.saveStyles(videoWrapper);
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
            end: () => "+=" + (track.scrollWidth - window.innerWidth),
            invalidateOnRefresh: true
        }
    });

    tl.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        duration: 1,
        ease: "none"
    }, 0);

    tl.to(svgPath, {
        strokeDashoffset: 0,
        duration: 1,
        ease: "none"
    }, 0);

    /* --- Vegetais: surgem conforme o scroll horizontal (desktop) --- */
    const totalDistance = Math.max(track.scrollWidth - window.innerWidth, 1);
    const decorJobs = gsap.utils.toArray(".h-slide").map((slide) => ({
        decors: slide.querySelectorAll(".decor"),
        progress: slide.offsetLeft / totalDistance
    })).filter((job) => job.decors.length > 0);

    if (decorJobs.length) {
        /* Normaliza para que o último tween termine exatamente no fim do scroll,
           sem estender a duração da timeline (o que gerava zona morta e posições erradas) */
        const maxStart = Math.max(...decorJobs.map((job) => job.progress));
        const scale = maxStart > 0.8 ? 0.8 / maxStart : 1;

        decorJobs.forEach((job) => {
            const pos = Math.min(job.progress * scale, 0.8);
            job.decors.forEach((decor) => {
                tl.fromTo(decor,
                    { scale: 0, opacity: 0 },
                    {
                        scale: 1,
                        opacity: 1,
                        duration: 0.2,
                        ease: "power2.out",
                       
                    },
                    pos
                );
            });
        });
    }
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

    function getVideoVars() {
        const s = getComputedStyle(document.documentElement);
        return {
            width: s.getPropertyValue('--video-width').trim(),
            height: s.getPropertyValue('--video-height').trim(),
            maxWidth: s.getPropertyValue('--video-max-width').trim(),
            borderRadius: parseInt(s.getPropertyValue('--video-radius')) || 0
        };
    }

    const mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
        const v = getVideoVars();

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: videoSection,
                start: "center center",
                end: "+=100%",
                scrub: true,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true
            }
        });

        if (videoHeader) {
            tl.to(videoHeader, {
                opacity: 0,
                y: -50,
                duration: 0.3,
                ease: "power1.inOut",
                immediateRender: false
            }, 0);
        }

        tl.fromTo(videoWrapper, {
            width: v.width,
            height: v.height,
            maxWidth: v.maxWidth,
            borderRadius: v.borderRadius
        }, {
            width: "100vw",
            height: "100vh",
            maxWidth: "none",
            borderRadius: 0,
            duration: 1,
            ease: "none",
            immediateRender: false
        }, 0);
    });

    mm.add("(max-width: 768px)", () => {
        const v = getVideoVars();

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: videoSection,
                start: "top top",
                end: "+=100%",
                scrub: true,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true
            }
        });

        if (videoHeader) {
            tl.to(videoHeader, {
                opacity: 0,
                y: -50,
                duration: 0.3,
                ease: "power1.inOut",
                immediateRender: false
            }, 0);
        }

        tl.fromTo(videoWrapper, {
            width: v.width,
            height: v.height,
            maxWidth: v.maxWidth,
            borderRadius: v.borderRadius
        }, {
            width: "100vw",
            height: "100vh",
            maxWidth: "none",
            borderRadius: 0,
            duration: 1,
            ease: "none",
            immediateRender: false
        }, 0);
    });
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

    /* --- Conector dos passos (desenha progressivamente ao rolar) --- */
    const fill = document.querySelector('.connector-fill');
    if (fill) {
        gsap.fromTo(fill, { scaleX: 0, scaleY: 0 }, {
            scrollTrigger: {
                trigger: '.leasing-steps',
                start: 'top 85%',
                end: 'bottom 50%',
                scrub: 1
            },
            scaleX: 1, scaleY: 1, ease: 'none'
        });
    }

    /* --- Passos: aparecem e somem de acordo com o scroll --- */
    document.querySelectorAll('.leasing-step').forEach((step) => {
        gsap.from(step, {
            scrollTrigger: {
                trigger: step,
                start: 'top 88%',
                end: 'bottom 30%',
                scrub: 1
            },
            opacity: 0, y: 70, ease: 'power2.out'
        });
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
        opacity: 0, y: 70, rotateX: -10, duration: 0.9, stagger: 0.14, ease: 'back.out(1.4)',
        clearProps: 'all'
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

/* --- Corrige bugs de scroll: redimensionamento da tela --- */
let resizeRefreshTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeRefreshTimer);
    resizeRefreshTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
});

/* --- Corrige bugs de scroll quando a página volta da cache do navegador (bfcache) --- */
window.addEventListener("pageshow", (e) => {
    if (e.persisted) ScrollTrigger.refresh();
});

/* ================= 8. Modal de Vídeo (Play com Som) ================= */
(function setupVideoModal() {
    const playBtn = document.getElementById('videoPlayBtn');
    const modal = document.getElementById('videoModal');
    const backdrop = document.getElementById('videoModalBackdrop');
    const closeBtn = document.getElementById('videoModalClose');
    const player = document.getElementById('videoModalPlayer');

    if (!playBtn || !modal || !player) return;

    function openModal() {
        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        player.currentTime = 0;
        player.play();
    }

    function closeModal() {
        modal.classList.remove('is-open');
        document.body.style.overflow = '';
        player.pause();
        player.currentTime = 0;
    }

    playBtn.addEventListener('click', openModal);
    backdrop.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
})();