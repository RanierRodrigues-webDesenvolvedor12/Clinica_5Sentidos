gsap.registerPlugin(ScrollTrigger);

        /* ================= 1. Animação do Pré-loader ================= */
        const tlPreloader = gsap.timeline();

        tlPreloader.to(".preloader-title span", {
            y: 0, opacity: 1, stagger: 0.05, duration: 0.8, ease: "back.out(1.7)"
        })
        .to(".preloader-subtitle", {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: 1, ease: "power2.inOut"
        })
        .to("#preloader", {
            yPercent: -100, duration: 1, ease: "power4.inOut", delay: 0.5
        });

        /* ================= 2. Animação de Entrada (Hero) ================= */
        const tlHero = gsap.timeline({ delay: 3 });

        tlHero.to(".pill", { y: 0, opacity: 1, duration: 0.5 })
        .to(".hero h1 .line", {
            y: 0, duration: 0.8, stagger: 0.2, ease: "power3.out"
        }, "-=0.3")
        .to(".hero-img", {
            y: -50, opacity: 1, duration: 0.8, stagger: 0.1, ease: "back.out(1.2)"
        }, "-=0.2")
        .to(".img-1", { x: -180, rotate: -12, duration: 0.8, ease: "power2.out" }, "+=0.2")
        .to(".img-3", { x: 180, rotate: 12, duration: 0.8, ease: "power2.out" }, "<")
        .to(".img-2", { zIndex: 3, scale: 1.05, duration: 0.8 }, "<");


        /* ================= 3. Efeito Parallax - Texto Gigante Azul ================= */
        gsap.to(".hero-gallery", {
            scrollTrigger: {
                trigger: ".hero", start: "center top", end: "bottom top", scrub: true
            },
            y: -150, opacity: 0, scale: 0.9
        });

        gsap.to(".giant-text", {
            scrollTrigger: {
                trigger: ".giant-text-section", start: "top bottom", end: "bottom top", scrub: true
            },
            y: -100, scale: 1.1
        });


        /* ================= 4. Scroll Horizontal & Animação da Linha SVG ================= */
        const track = document.querySelector(".horizontal-track");
        const svgPath = document.querySelector("#h-line");
        const pathLength = svgPath.getTotalLength();
        
        // Esconde a linha incialmente
        gsap.set(svgPath, {
            strokeDasharray: pathLength,
            strokeDashoffset: pathLength
        });

        // Timeline dedicada ao scroll horizontal
        let horizontalTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".horizontal-scroll-wrapper",
                pin: true, // Trava a tela
                scrub: 1,  // Suavidade no movimento
                start: "top top", // Começa quando a seção bate no topo da tela
                end: () => "+=" + track.scrollWidth // A duração do scroll é baseada no tamanho real da faixa
            }
        });

        // 1. Move o conteúdo todo para a esquerda
        horizontalTl.to(track, {
            x: () => -(track.scrollWidth - window.innerWidth),
            ease: "none"
        }, 0);

        // 2. Preenche a linha SVG conforme o scroll acontece, sincronizado com o movimento
        horizontalTl.to(svgPath, {
            strokeDashoffset: 0,
            ease: "none"
        }, 0);

        /* ================= 5. Animação Flutuante dos Vegetais ================= */
        gsap.to(".decor", {
            y: 15, rotation: "+=5", duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: 0.5
        });