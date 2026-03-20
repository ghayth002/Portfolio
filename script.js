// ─── DOM Elements ─────────────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const langToggle = document.getElementById('lang-toggle');
const langText = document.getElementById('lang-text');

// ─── State ────────────────────────────────────────────────────────────────────
let currentLang = localStorage.getItem('lang') || 'en';
let currentTheme = localStorage.getItem('theme') || 'dark';

// ─── Initialize ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setTheme(currentTheme);
    setLanguage(currentLang);
    initParticleNetwork();
    init3DScrollAnimations();
    initTiltEffects();
});

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CANVAS 3D PARTICLE NETWORK BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════════
function initParticleNetwork() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height, particles, mouse, animId;
    const PARTICLE_COUNT = 70;
    const CONNECTION_DIST = 150;
    const MOUSE_RADIUS = 180;

    mouse = { x: -9999, y: -9999 };

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function getColors() {
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        return {
            particle: isDark ? 'rgba(99, 102, 241, 0.7)' : 'rgba(99, 102, 241, 0.5)',
            line: isDark ? 'rgba(139, 92, 246, ALPHA)' : 'rgba(99, 102, 241, ALPHA)',
            mouseLine: isDark ? 'rgba(236, 72, 153, ALPHA)' : 'rgba(139, 92, 246, ALPHA)',
        };
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.z = Math.random() * 200; // depth
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.vz = (Math.random() - 0.5) * 0.3;
            this.baseRadius = Math.random() * 1.5 + 0.8;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.z += this.vz;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
            if (this.z < 0 || this.z > 200) this.vz *= -1;

            // Mouse interaction — gentle attraction
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_RADIUS) {
                const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.02;
                this.vx += dx * force;
                this.vy += dy * force;
            }
            // Damping
            this.vx *= 0.99;
            this.vy *= 0.99;
        }
        get scale() { return 1 - this.z / 400; }
        get radius() { return this.baseRadius * this.scale; }
        draw(ctx, color) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(0.3, this.radius), 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections(colors) {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DIST) {
                    const alpha = (1 - dist / CONNECTION_DIST) * 0.35 * particles[i].scale * particles[j].scale;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = colors.line.replace('ALPHA', alpha.toFixed(3));
                    ctx.lineWidth = alpha * 1.5;
                    ctx.stroke();
                }
            }
            // Mouse connections
            const mdx = mouse.x - particles[i].x;
            const mdy = mouse.y - particles[i].y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < MOUSE_RADIUS) {
                const alpha = (1 - mdist / MOUSE_RADIUS) * 0.5 * particles[i].scale;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = colors.mouseLine.replace('ALPHA', alpha.toFixed(3));
                ctx.lineWidth = alpha * 2;
                ctx.stroke();
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        const colors = getColors();
        particles.forEach(p => { p.update(); p.draw(ctx, colors.particle); });
        drawConnections(colors);
        animId = requestAnimationFrame(animate);
    }

    // Event listeners
    window.addEventListener('resize', () => {
        resize();
        // don't recreate, just adjust boundaries
    });
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    document.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    resize();
    createParticles();
    animate();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. VANILLA TILT 3D CARD EFFECTS
// ═══════════════════════════════════════════════════════════════════════════════
function initTiltEffects() {
    if (typeof VanillaTilt === 'undefined') return;
    // Don't apply on mobile/touch devices
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const tiltElements = document.querySelectorAll(
        '.project-card, .skill-category, .cert-card, .info-card, .contact-card, .timeline-content'
    );

    VanillaTilt.init(Array.from(tiltElements), {
        max: 8,
        speed: 400,
        glare: true,
        'max-glare': 0.12,
        perspective: 1000,
        scale: 1.02,
        gyroscope: false,
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. 3D PERSPECTIVE SCROLL ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════════
function init3DScrollAnimations() {
    const observerOptions = {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(
        '.info-card, .cert-card, .skill-category, .project-card, .timeline-item, .contact-card, .section-header'
    );

    animatedElements.forEach((el, index) => {
        el.classList.add('scroll-3d-init');
        // Stagger the transition duration for a cinematic sequential feel
        const delay = (index % 8) * 0.08; // reset stagger per "group"
        const duration = 0.7;
        el.style.transitionDuration = `${duration}s`;
        el.style.transitionDelay = `${delay}s`;
        observer.observe(el);
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXISTING FUNCTIONALITY (preserved)
// ═══════════════════════════════════════════════════════════════════════════════

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    updateActiveLink();
});

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu on link click
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Theme toggle
themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(currentTheme);
    localStorage.setItem('theme', currentTheme);
});

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-moon';
    } else {
        themeIcon.className = 'fas fa-sun';
    }
}

// Language toggle
langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'fr' : 'en';
    setLanguage(currentLang);
    localStorage.setItem('lang', currentLang);
});

function setLanguage(lang) {
    langText.textContent = lang.toUpperCase();
    document.documentElement.setAttribute('lang', lang);
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}

// Update active navigation link based on scroll position
function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) navLink.classList.add('active');
        }
    });
}

// Form handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        const mailtoLink = `mailto:ghaythweslaty10@gmail.com?subject=Portfolio Contact from ${name}&body=${encodeURIComponent(message)}%0A%0AFrom: ${name}%0AEmail: ${email}`;
        window.location.href = mailtoLink;
        
        contactForm.reset();
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Typing effect for hero (optional enhancement)
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

console.log('Portfolio loaded successfully! 🚀 (3D Mode)');

// ─── Visitor Counter ─────────────────────────────────────────────────────────
(function loadVisitorCounter() {
    const countEl = document.getElementById('visitor-count');
    if (!countEl) return;

    const namespace = 'ghayth002';
    const key = 'portfolio-visits';

    fetch(`https://api.countapi.xyz/hit/${namespace}/${key}`)
        .then(res => res.json())
        .then(data => {
            if (data && typeof data.value === 'number') {
                animateCount(countEl, data.value);
            } else {
                countEl.textContent = '–';
            }
        })
        .catch(() => {
            const stored = parseInt(localStorage.getItem('pf_visits') || '0') + 1;
            localStorage.setItem('pf_visits', stored);
            animateCount(countEl, stored);
        });

    function animateCount(el, target) {
        const duration = 1200;
        const steps = 40;
        const increment = target / steps;
        let current = 0;
        el.classList.add('loaded');

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = Math.floor(current).toLocaleString();
        }, duration / steps);
    }
})();
