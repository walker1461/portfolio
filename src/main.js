import "./style.css";

// ---- MENU ----
const menuButton = document.getElementById("menu-button");
const mobileMenu = document.getElementById("mobile-menu-main");

function openMenu() {
    mobileMenu.classList.remove("hidden");
    menuButton.textContent = "";
}

function closeMenu() {
    mobileMenu.classList.add("hidden");
    menuButton.textContent = "☰";
}

function toggleMenu() {
    if (mobileMenu.classList.contains("hidden")) {
        openMenu();
    } else {
        closeMenu();
    }
}

menuButton?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
});

mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
});

document.addEventListener("click", (e) => {
    const isClickInsideMenu = mobileMenu.contains(e.target);
    const isClickButton = menuButton.contains(e.target);

    if (!isClickInsideMenu && !isClickButton) {
        closeMenu();
    }
});

// ---- WAVE ANIMATION ----
const canvas = document.getElementById("wave-canvas");
const ctx = canvas.getContext("2d");
const gridCanvas = document.getElementById("grid-canvas");
const gridCtx = gridCanvas.getContext("2d");
const disableBtn = document.getElementById("disable-waves-btn");

// respect reduced motion
const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
).matches;

disableBtn.addEventListener("click", () => {
    canvas.classList.toggle("hidden");
    if (canvas.classList.contains("hidden")) {
        disableBtn.textContent = "enable motion graphics";
    } else {
        disableBtn.textContent = "disable motion graphics";
    }
});

// detect low-performance devices
function isLowPerfDevice() {
    const cores = navigator.hardwareConcurrency || 4;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isMobile && cores <= 4;
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

const isMobile = window.innerWidth < 768;
const isLowPerf = isLowPerfDevice();

let waveCount, steps, useGlow, useBezier;

if (isLowPerf) {
    waveCount = 3;
    steps = 8;
    useGlow = false;
    useBezier = false;
} else if (isMobile) {
    waveCount = 4;
    steps = 6;
    useGlow = false;
    useBezier = true;
} else {
    waveCount = 5;
    steps = 4;
    useGlow = true;
    useBezier = true;
}

function capDpr(raw) {
    return Math.min(raw, 2);
}

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let mouseTick = false;

const waves = [];
if (!prefersReduced) {
    for (let i = 0; i < waveCount; i++) {
        waves.push({
            baseAmp: random(isMobile ? 15 : 20, isMobile ? 55 : 82),
            freq: random(isMobile ? 0.02 : 0.008, isMobile ? 0.04 : 0.022),
            speed: random(isMobile ? 0.2 : 0.25, 0.38),
            drift: random(0.001, 0.01),
            offset: random(isMobile ? -30 : -50, isMobile ? 30 : 50),
            opacity: random(isMobile ? 0.2 : 0.18, isMobile ? 0.35 : 0.5),
            ripplePhase: random(0, Math.PI * 2),
            rippleStrength: random(30, 90),
            rippleDecay: random(120, 180),
            rippleSpeed: random(0.05, 0.16),
            ampModSpeed: random(0.002, 0.01),
            freqModSpeed: random(0.002, 0.008),
            warmth: random(-5, 10),
        });
    }
}

let gridDirty = true;

function buildGrid() {
    gridCanvas.width = canvas.width;
    gridCanvas.height = canvas.height;

    const gridSize = 80;

    const centerX = gridCanvas.width / 2;
    const centerY = gridCanvas.height / 2;

    //const maxDist = Math.sqrt(centerX * centerX + centerY * centerY)
    const maxDx = Math.max(centerX, gridCanvas.width - centerX);
    const maxDy = Math.max(centerY, gridCanvas.height - centerY);
    const maxDist = Math.sqrt(maxDx * maxDx + maxDy * maxDy);

    gridCtx.lineWidth = 1;

    for (let y = 0; y < gridCanvas.height; y += gridSize) {
        for (let x = 0; x < gridCanvas.width; x += gridSize) {
            const dx = x - centerX;
            const dy = y - centerY;

            const dist = Math.sqrt(dx * dx + dy * dy);
            const fade = Math.pow(Math.max(0, 1 - dist / maxDist), 2.5);
            //const verticalFade = 1 - (y / gridCanvas.height) * 0.6
            //const fade = Math.max(0, (1 - dist / maxDist) * verticalFade)

            gridCtx.strokeStyle = `rgba(255,255,255,${fade * 0.1})`;

            gridCtx.strokeRect(x, y, gridSize, gridSize);
        }
    }
    gridDirty = false;
}

function resize() {
    const dpr = isMobile ? 1 : capDpr(window.devicePixelRatio || 1);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
    ctx.scale(dpr, dpr);

    if (!isMobile) {
        gridDirty = true;
    } else {
        gridCanvas.style.display = "none";
    }
}
resize();

if (!isMobile) {
    window.addEventListener(
        "mousemove",
        (e) => {
            if (!mouseTick) {
                mouseTick = true;
                requestAnimationFrame(() => {
                    mouseX = e.clientX;
                    mouseY = e.clientY;
                    mouseTick = false;
                });
            }
        },
        { passive: true },
    );
}

let resizeTimeout;
function debouncedResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 150);
}

window.addEventListener("resize", debouncedResize, { passive: true });
window.addEventListener("orientationchange", resize);

let time = 0;
let lastTime = 0;
let frameSkip = 0;

function draw(now) {
    if (isLowPerf) {
        frameSkip++;
        if (frameSkip % 2 !== 0) {
            requestAnimationFrame(draw);
            return;
        }
    }

    const delta = Math.min((now - lastTime) / 16.67, 3);
    lastTime = now;

    if (gridDirty && !isMobile) {
        buildGrid();
    }

    //ctx.globalCompositeOperation = "source-over"
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = window.innerWidth;
    const height = window.innerHeight;
    const edgeFadeWidth = width * 0.15;

    waves.forEach((wave) => {
        const points = [];
        //ctx.beginPath();
        //const pixelRatio = window.devicePixelRatio || 1
        //for (let x = 0; x < canvas.width / pixelRatio; x += steps) {
        for (let x = 0; x < width; x += steps) {
            const dx = x - mouseX;
            const dy = mouseY - height / 2;
            const verticalFactor = Math.max(0, 1 - Math.abs(dy) / 150);

            const ripple =
                verticalFactor *
                Math.exp(-Math.abs(dx) / wave.rippleDecay) *
                wave.rippleStrength *
                Math.sin(
                    time * wave.rippleSpeed - dx * 0.05 + wave.ripplePhase,
                );

            const noise =
                Math.cos(x * 0.002 + time * 0.2) * 8 +
                Math.cos(x * 0.01 + time * 0.6) * 4;

            const dynamicAmp =
                wave.baseAmp + Math.sin(time * wave.ampModSpeed) * 30;

            const dynamicFreq =
                wave.freq + Math.sin(time * wave.freqModSpeed) * 0.002;

            const y =
                //canvas.height / 2 +
                height / 2 +
                wave.offset +
                ripple +
                Math.sin(x * dynamicFreq + time * wave.speed) * dynamicAmp +
                Math.sin(time * wave.drift) * 20 +
                noise;
            //ctx.lineTo(x * pixelRatio, y * pixelRatio) // scale properly
            //ctx.lineTo(x, y);
            points.push({ x, y });
        }

        if (points.length === 0) return;

        ctx.beginPath();

        if (useBezier && points.length > 2) {
            // Smooth quadratic bezier curves through midpoints
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 0; i < points.length - 1; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
            const last = points[points.length - 1];
            ctx.lineTo(last.x, last.y);
        } else {
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
        }

        // Subtle warm/cool white — barely tinted, not colored
        const r = 230 + wave.warmth;
        const g = 228 + wave.warmth * 0.3;
        const b = 225 - wave.warmth * 0.5;

        // Horizontal gradient that fades out at both edges
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, `rgba(${r},${g},${b},0)`);
        gradient.addColorStop(
            edgeFadeWidth / width,
            `rgba(${r},${g},${b},${wave.opacity})`,
        );
        gradient.addColorStop(
            0.5,
            `rgba(${r},${g},${b},${wave.opacity * 1.15})`,
        );
        gradient.addColorStop(
            1 - edgeFadeWidth / width,
            `rgba(${r},${g},${b},${wave.opacity})`,
        );
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = useBezier ? 1.8 : 1.5;

        // Subtle glow — only on capable devices, very restrained
        if (useGlow) {
            ctx.shadowBlur = 12;
            ctx.shadowColor = `rgba(${r},${g},${b},${wave.opacity * 0.35})`;
        }

        //ctx.strokeStyle = `rgba(255,255,255,${wave.opacity})`;
        ctx.lineWidth = useBezier ? 1.8 : 1.5;

        if (useGlow) {
            ctx.shadowBlur = 12;
            ctx.shadowColor = `rgba(${r},${g},${b},${wave.opacity * 0.35})`;
        }

        ctx.stroke();

        if (useGlow) {
            ctx.shadowBlur = 0;
        }
    });
    time += 0.6 * delta;
    requestAnimationFrame(draw);
}

if (!prefersReduced) {
    requestAnimationFrame(draw);
} else {
    buildGrid();
}

// if (!isMobile) {
//     window.addEventListener("mousemove", (e) => {
//         mouseX = e.clientX;
//         mouseY = e.clientY;
//     });
// }

// const waves = [];
// for (let i = 0; i < waveCount; i++) {
//     waves.push({
//         baseAmp: random(isMobile ? 15 : 20, isMobile ? 55 : 82),
//         freq: random(isMobile ? 0.02 : 0.008, isMobile ? 0.04 : 0.022),
//         speed: random(isMobile ? 0.2 : 0.25, 0.38),
//         drift: random(0.001, 0.01),
//         offset: random(isMobile ? -30 : -50, isMobile ? 30 : 50),
//         opacity: random(isMobile ? 0.2 : 0.18, isMobile ? 0.35 : 0.5),
//         ripplePhase: random(0, Math.PI * 2),
//         rippleStrength: random(30, 90),
//         rippleDecay: random(120, 180),
//         rippleSpeed: random(0.05, 0.16),
//         ampModSpeed: random(0.002, 0.01),
//         freqModSpeed: random(0.002, 0.008),
//     });
// }

// if (!isMobile) {
//   ctx.shadowBlur = 80
//   ctx.shadowColor = "rgba(255,255,255,0.8)"
// }

//requestAnimationFrame(draw);
