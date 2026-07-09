// === Galaxy Canvas ===
const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');
let galaxies = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Палитра галактик — более пастельная
const galaxyPalettes = [
    { core: '#f0e6ff', glow: 'rgba(184, 156, 239, 0.55)', arm: 'rgba(184, 156, 239, 0.18)' }, // лавандовая
    { core: '#fff0e0', glow: 'rgba(232, 170, 140, 0.55)', arm: 'rgba(232, 170, 140, 0.18)' }, // персиковая
    { core: '#e6f2ff', glow: 'rgba(140, 190, 230, 0.55)', arm: 'rgba(140, 190, 230, 0.18)' }, // голубая
    { core: '#ffe8f0', glow: 'rgba(220, 150, 180, 0.55)', arm: 'rgba(220, 150, 180, 0.18)' }, // розовая
    { core: '#f5f0ff', glow: 'rgba(200, 200, 230, 0.45)', arm: 'rgba(200, 200, 230, 0.15)' }  // серебристая
];

function createGalaxies() {
    galaxies = [];
    const area = canvas.width * canvas.height;
    const count = Math.max(10, Math.floor(area / 90000));

    for (let i = 0; i < count; i++) {
        const palette = galaxyPalettes[Math.floor(Math.random() * galaxyPalettes.length)];
        const size = Math.random() * 70 + 25; // 25–95 px

        galaxies.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: size,
            arms: Math.floor(Math.random() * 3) + 2,          // 2–4 рукава
            tilt: Math.random() * Math.PI * 2,                // наклон плоскости
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() * 0.002 + 0.0005) * (Math.random() > 0.5 ? 1 : -1),
            vx: (Math.random() - 0.5) * 0.15,                 // медленный дрейф
            vy: (Math.random() - 0.5) * 0.15,
            opacity: Math.random() * 0.4 + 0.55,
            palette: palette,
            spiralTightness: Math.random() * 0.4 + 0.8
        });
    }
}

// Рисуем одну галактику
function drawGalaxy(g) {
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.rotate(g.tilt);
    ctx.globalAlpha = g.opacity * 0.75;  // было g.opacity — теперь мягче

    // Внешнее свечение (ореол) — более прозрачное
    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, g.size * 1.6);
    halo.addColorStop(0, g.palette.glow);
    halo.addColorStop(0.5, g.palette.arm);
    halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, g.size * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Спиральные рукава — менее контрастные
    const pointsPerArm = 80;
    const maxAngle = Math.PI * 3;

    for (let a = 0; a < g.arms; a++) {
        const armOffset = (a / g.arms) * Math.PI * 2 + g.rotation;
        for (let i = 0; i < pointsPerArm; i++) {
            const t = i / pointsPerArm;
            const angle = armOffset + t * maxAngle * g.spiralTightness;
            const radius = t * g.size;

            const jitter = (Math.random() - 0.5) * g.size * 0.08;
            const px = Math.cos(angle) * radius + jitter;
            const py = Math.sin(angle) * radius * 0.55 + jitter;

            const alpha = (1 - t) * 0.55;   // было 0.9 — теперь рукава мягче
            const r = (1 - t) * 1.4 + 0.3;  // было 1.6 — точки чуть меньше

            ctx.beginPath();
            ctx.fillStyle = `rgba(240, 230, 255, ${alpha})`;  // было rgba(255,255,255,...) — более пастельный
            ctx.arc(px, py, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Ядро — мягкое, без резкого белого центра
    const coreSize = g.size * 0.3;          // было 0.35
    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize);
    core.addColorStop(0, g.palette.core);
    core.addColorStop(0.35, g.palette.glow);  // плавный переход
    core.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.globalAlpha = g.opacity * 0.6;      // ядро ещё прозрачнее
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawGalaxies() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    galaxies.forEach(g => {
        // Движение и вращение
        g.x += g.vx;
        g.y += g.vy;
        g.rotation += g.rotationSpeed;

        // Оборачивание по краям
        const margin = g.size * 2;
        if (g.x < -margin) g.x = canvas.width + margin;
        if (g.x > canvas.width + margin) g.x = -margin;
        if (g.y < -margin) g.y = canvas.height + margin;
        if (g.y > canvas.height + margin) g.y = -margin;

        drawGalaxy(g);
    });

    requestAnimationFrame(drawGalaxies);
}

resizeCanvas();
createGalaxies();
drawGalaxies();

window.addEventListener('resize', () => {
    resizeCanvas();
    createGalaxies();
});


// === Переключение вкладок ===
document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            pages.forEach(page => page.classList.remove('active'));

            const targetPage = this.getAttribute('data-page');
            const target = document.getElementById(targetPage);
            if (target) target.classList.add('active');

            window.scrollTo({ top: 0, behavior: 'smooth' });

            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
        });
    });


    // === Мобильное меню ===
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.getElementById('links');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }


    // === Navbar Scroll Effect ===
    const navbar = document.querySelector('header nav.wrap') || document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (!navbar) return;
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });


    // === Scroll Animations ===
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, observerOptions);

    document.querySelectorAll(
        '.research-card, .publication-item, .timeline-item, .project-card, .contact-item, .detail-item'
    ).forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });


    // === Smooth Scroll (только для обычных якорей, не вкладок) ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (anchor.hasAttribute('data-page')) return;

        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        });
    });
});


// === Параллакс для CSS-галактик ===
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const galaxies = document.querySelectorAll('.galaxy');

    galaxies.forEach((galaxy, index) => {
        const speed = (index + 1) * 0.05;
        galaxy.style.transform = `translateY(${scrolled * speed}px)`;
    });
});


// === Переключение темы ===
document.addEventListener('DOMContentLoaded', function() {
    const tgl = document.getElementById('tgl');
    
    function toggleMode() {
        document.body.classList.toggle('light');
        const isLight = document.body.classList.contains('light');
        
        if (tgl) {
            tgl.textContent = isLight ? '☀️' : '🌙';
        }
        
        console.log('Theme switched:', isLight ? 'light' : 'dark');
    }
    
    // Инициализация иконки при загрузке
    if (tgl) {
        const isLight = document.body.classList.contains('light');
        tgl.textContent = isLight ? '☀️' : '🌙';
        
        // Добавляем обработчик клика
        tgl.addEventListener('click', function(e) {
            e.preventDefault();
            toggleMode();
        });
    }
});

// === Console ===
// console.log('%c✨ Welcome to the cosmos! ✨', 'color: #ff7e5f; font-size: 20px; font-weight: bold;');
// console.log('%c"Смотрим на одно и то же небо — но видим ли мы одно и то же?"', 'color: #c084fc; font-style: italic;');