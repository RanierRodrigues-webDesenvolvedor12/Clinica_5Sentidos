gsap.registerPlugin(ScrollTrigger);

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
        /* After preloader, set up all scroll-driven animations */
        setupScrollAnimations();
    }
});

/* ================= 2. Todas as animações scroll-driven ================= */
function setupScrollAnimations() {

    /* --- Hero: pill, titulo, imagens, botoes --- */
    const heroTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".hero",
            start: "top 80%",
            end: "center center",
            scrub: 1
        }
    });

    heroTl.to(".pill", { y: 0, opacity: 1, duration: 1 })
    .to(".hero h1 .line", {
        y: 0, duration: 1.5, stagger: 0.3
    }, 0)
    .to(".hero-img", {
        y: isMobile ? -40 : -50, opacity: 1, duration: 1.5, stagger: 0.15
    }, 0.3)
    .to(".buttons-wrapper", { y: 0, opacity: 1, duration: 1 }, 0.8);

    /* Imagens se espalham apos surgirem */
    const spreadTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".hero-gallery",
            start: "top 70%",
            end: "bottom 40%",
            scrub: 1
        }
    });

    if (isSmallMobile) {
        spreadTl.to(".img-1", { x: -30, rotate: -6, duration: 1 }, 0)
        .to(".img-3", { x: 30, rotate: 6, duration: 1 }, 0)
        .to(".img-2", { zIndex: 3, scale: 1.05, duration: 1 }, 0);
    } else if (isMobile) {
        spreadTl.to(".img-1", { x: -45, rotate: -8, duration: 1 }, 0)
        .to(".img-3", { x: 45, rotate: 8, duration: 1 }, 0)
        .to(".img-2", { zIndex: 3, scale: 1.05, duration: 1 }, 0);
    } else {
        spreadTl.to(".img-1", { x: -180, rotate: -12, duration: 1 }, 0)
        .to(".img-3", { x: 180, rotate: 12, duration: 1 }, 0)
        .to(".img-2", { zIndex: 3, scale: 1.05, duration: 1 }, 0);
    }

    /* --- Parallax: hero gallery desaparece ao rolar --- */
    gsap.to(".hero-gallery", {
        scrollTrigger: {
            trigger: ".hero", start: "center top", end: "bottom top", scrub: true
        },
        y: isMobile ? -60 : -150, opacity: 0, scale: 0.9
    });

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
