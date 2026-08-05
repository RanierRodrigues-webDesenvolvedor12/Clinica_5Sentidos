gsap.registerPlugin(ScrollTrigger, SplitText);

/* ================= 0. Estado Inicial (Evita o Flash/Delay) ================= */
/* 1. Preparamos o SplitText imediatamente ao carregar a página */
const heroSplit = new SplitText('.hero h1', { type: 'lines, words, chars' });

/* 2. Escondemos os elementos ANTES do preloader começar */
gsap.set(heroSplit.words, { opacity: 0, y: 40, mask: "lines" });
gsap.set('.pill', { opacity: 0, y: 40 });
gsap.set('.buttons-wrapper', { opacity: 0, y: 40 });

// NOVO: Prepara as imagens para surgirem de baixo, transparentes e um pouco menores
gsap.set('.hero-img', { y: 150, opacity: 0, scale: 0.8 }); 

/* ================= Helpers ================= */
const isMobile = window.matchMedia("(max-width: 768px)").matches;
const isSmallMobile = window.matchMedia("(max-width: 480px)").matches;

/* ================= 1. Pré-loader ================= */
const tlPreloader = gsap.timeline();

tlPreloader.to(".preloader-title span", {
    y: 0, opacity: 1, stagger: 0.05, duration: 0.8, ease: "back.out(1.7)"
})
.to(".preloader-subtitle", {
    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: 1, ease: "power2.inOut"
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

        /* Com 2 cópias idênticas, mover de 0 até -textWidth cria loop perfeito:
           quando o 1º texto sai pela esquerda, o 2º já está no lugar dele */
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
/* Tilt 3D que acompanha o mouse + efeito de profundidade de campo (foco).
   Os valores originais são capturados no primeiro hover (depois da animação
   de entrada terminar), evitando qualquer conflito com as tweens do GSAP. */
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