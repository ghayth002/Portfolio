document.addEventListener('DOMContentLoaded', () => {
    initWelcome();
    initTheme();
    initLang();
    initNav();
    initThreeJS();
    initCustomCursor();
    initScrollReveal();
    initVisitorCounter();
    initTilt();
    initFunStuff();
    initScrollProgress();
    initCursorTrail();
    initMagneticButtons();
});

function initWelcome() {
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
        setTimeout(() => {
            welcomeScreen.classList.add('hide');
        }, 2000);
        
        setTimeout(() => {
            welcomeScreen.style.display = 'none';
        }, 2800);
    }
}

function initFunStuff() {
    const funBtn = document.getElementById('fun-btn');
    if (!funBtn) return;
    
    const emojis = ['🦆', '🐱', '✨', '💻', '🚀', '🍕', '🎉', '👾', '🔥', '☕'];
    
    funBtn.addEventListener('click', () => {
        funBtn.style.transform = 'scale(0.8)';
        setTimeout(() => funBtn.style.transform = '', 150);
        
        for (let i = 0; i < 25; i++) {
            setTimeout(() => {
                const item = document.createElement('div');
                item.className = 'falling-item';
                item.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                
                item.style.left = Math.random() * 95 + 'vw';
                const duration = Math.random() * 2 + 2; 
                item.style.animationDuration = duration + 's';
                
                document.body.appendChild(item);
                
                setTimeout(() => {
                    item.remove();
                }, duration * 1000);
            }, i * 80);
        }
    });
}

function initTilt() {
    if (typeof VanillaTilt !== 'undefined' && !window.matchMedia('(max-width: 768px)').matches) {
        VanillaTilt.init(document.querySelectorAll(".glass-card, .skill-block, .project-card, .tl-card, .c-link, .cert-pill"), {
            max: 10,
            speed: 400,
            glare: true,
            "max-glare": 0.15,
            perspective: 1500,
            scale: 1.02
        });
    }
}

// --- Theme ---
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    let theme = localStorage.getItem('theme') || 'dark';
    
    const applyTheme = (t) => {
        document.documentElement.setAttribute('data-theme', t);
        themeIcon.className = t === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    };
    
    applyTheme(theme);
    
    themeToggle.addEventListener('click', () => {
        theme = theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', theme);
        applyTheme(theme);
        window.dispatchEvent(new Event('themeChanged'));
    });
}

// --- Language ---
function initLang() {
    const langToggle = document.getElementById('lang-toggle');
    const langText = document.getElementById('lang-text');
    let lang = localStorage.getItem('lang') || 'en';
    
    const applyLang = (l) => {
        langText.textContent = l.toUpperCase();
        document.documentElement.setAttribute('lang', l);
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[l] && translations[l][key]) {
                el.innerHTML = translations[l][key];
            }
        });
    };
    
    applyLang(lang);
    
    langToggle.addEventListener('click', () => {
        lang = lang === 'en' ? 'fr' : 'en';
        localStorage.setItem('lang', lang);
        applyLang(lang);
    });
}

// --- Navigation ---
function initNav() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');
    const links = document.querySelectorAll('.nav-link');
    
    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) navbar.classList.add('scrolled');
                else navbar.classList.remove('scrolled');
                
                let current = '';
                document.querySelectorAll('section').forEach(sec => {
                    const top = sec.offsetTop;
                    const height = sec.offsetHeight;
                    if (scrollY >= (top - height / 3)) {
                        current = sec.getAttribute('id');
                    }
                });
                
                links.forEach(l => {
                    l.classList.remove('active');
                    if (l.getAttribute('href') === `#${current}`) l.classList.add('active');
                });
                isScrolling = false;
            });
            isScrolling = true;
        }
    }, { passive: true });
    
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
    });
    
    links.forEach(l => {
        l.addEventListener('click', () => {
            toggle.classList.remove('active');
            menu.classList.remove('active');
        });
    });
}

// --- Custom Cursor ---
function initCustomCursor() {
    if (window.matchMedia('(max-width: 768px)').matches) return;
    
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    
    let posX = 0, posY = 0;
    let mouseX = 0, mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });
    
    const render = () => {
        posX += (mouseX - posX) * 0.15;
        posY += (mouseY - posY) * 0.15;
        
        follower.style.left = posX + 'px';
        follower.style.top = posY + 'px';
        
        requestAnimationFrame(render);
    };
    render();
}

// --- Scroll Reveal ---
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    
    document.querySelectorAll('.reveal-up, .reveal-right').forEach(el => {
        observer.observe(el);
    });
}

// --- Three.js Background (3D Data Sea) ---
function initThreeJS() {
    // Disable on mobile — saves significant GPU/battery
    if (window.matchMedia('(max-width: 768px)').matches) return;
    if (typeof THREE === 'undefined') return;
    
    const canvas = document.getElementById('three-canvas');
    const scene = new THREE.Scene();
    
    const getThemeColors = () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        return {
            bg: isLight ? 0xf0f4ff : 0x06080f,
            particle: isLight ? 0x7c3aed : 0x00e5ff,
            line: isLight ? 0x4b5978 : 0x00f0ff
        };
    };
    
    let colors = getThemeColors();
    // Keep background null so the gorgeous CSS Aurora shines through
    scene.background = null;
    scene.fog = new THREE.FogExp2(colors.bg, 0.0025);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 100;
    camera.position.y = 50;
    
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // ── Cloud / AI Neural Network (Plexus Effect) ──
    const particleCount = 70; // Reduced for perf
    const maxDistance = 40;
    const maxDistSq = maxDistance * maxDistance; // Use squared dist — avoids sqrt per pair
    
    // Positions & Velocities
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];
    
    for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3]     = (Math.random() - 0.5) * 300; // x
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 150 + 20; // y
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 200 - 50; // z
        
        particleVelocities.push({
            x: (Math.random() - 0.5) * 0.2,
            y: (Math.random() - 0.5) * 0.2,
            z: (Math.random() - 0.5) * 0.2
        });
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    // Texture for glowing nodes
    const canvasTex = document.createElement('canvas');
    canvasTex.width = 16; canvasTex.height = 16;
    const ctx = canvasTex.getContext('2d');
    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.7)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,16,16);
    const texture = new THREE.CanvasTexture(canvasTex);

    const pointsMat = new THREE.PointsMaterial({ 
        color: colors.particle, 
        size: 3, 
        transparent: true, 
        opacity: 0.9,
        map: texture,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    const particlesMesh = new THREE.Points(particlesGeo, pointsMat);
    scene.add(particlesMesh);

    // Network Lines
    const linesGeo = new THREE.BufferGeometry();
    // Max lines = (n * (n-1)) / 2
    const linesPositions = new Float32Array(particleCount * particleCount * 3);
    const linesColors = new Float32Array(particleCount * particleCount * 3);
    
    linesGeo.setAttribute('position', new THREE.BufferAttribute(linesPositions, 3));
    linesGeo.setAttribute('color', new THREE.BufferAttribute(linesColors, 3));
    
    const linesMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    const linesMesh = new THREE.LineSegments(linesGeo, linesMat);
    scene.add(linesMesh);
    
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - windowHalfX);
        mouseY = (e.clientY - windowHalfY);
    });
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // ── 3D Floating Data Cores ──
    const wireMats = [
        new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.2 }),
        new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.18 }),
        new THREE.MeshBasicMaterial({ color: 0xff003c, wireframe: true, transparent: true, opacity: 0.15 }),
    ];
    const shape1 = new THREE.Mesh(new THREE.IcosahedronGeometry(12, 1), wireMats[0]);
    shape1.position.set(-80, 40, -40);
    scene.add(shape1);

    const shape2 = new THREE.Mesh(new THREE.OctahedronGeometry(10, 0), wireMats[1]);
    shape2.position.set(85, 20, -50);
    scene.add(shape2);

    const shape3 = new THREE.Mesh(new THREE.TorusGeometry(14, 2, 8, 24), wireMats[2]);
    shape3.position.set(20, -10, -90);
    scene.add(shape3);

    const shape4 = new THREE.Mesh(new THREE.TetrahedronGeometry(8, 0), wireMats[0].clone());
    shape4.position.set(60, 60, -30);
    scene.add(shape4);

    window.addEventListener('themeChanged', () => {
        colors = getThemeColors();
        scene.fog.color.setHex(colors.bg);
        pointsMat.color.setHex(colors.particle);
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        wireMats.forEach(m => { m.opacity = isLight ? 0.08 : m.opacity; });
        linesMat.opacity = isLight ? 0.35 : 0.45;
    });

    // Helper for color mapping
    const baseColor = new THREE.Color();
    
    let animId = null;
    let isScrolling = false;
    let scrollTimer = null;

    // Pause Three.js during scroll — the #1 remaining jank source
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            isScrolling = true;
            if (animId) { cancelAnimationFrame(animId); animId = null; }
        }
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            isScrolling = false;
            if (!animId && !document.hidden) animId = requestAnimationFrame(animate);
        }, 150);
    }, { passive: true });

    // Pause when tab is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (animId) { cancelAnimationFrame(animId); animId = null; }
        } else if (!isScrolling) {
            animId = requestAnimationFrame(animate);
        }
    });

    const animate = () => {
        animId = requestAnimationFrame(animate);

        targetX = mouseX * 0.1;
        targetY = mouseY * 0.1;
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (-targetY + 40 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        // Move Nodes
        const positions = particlesMesh.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3]     += particleVelocities[i].x;
            positions[i * 3 + 1] += particleVelocities[i].y;
            positions[i * 3 + 2] += particleVelocities[i].z;

            // Bounce off boundaries
            if (Math.abs(positions[i * 3]) > 150) particleVelocities[i].x *= -1;
            if (Math.abs(positions[i * 3 + 1] - 20) > 75) particleVelocities[i].y *= -1;
            if (Math.abs(positions[i * 3 + 2] + 50) > 100) particleVelocities[i].z *= -1;
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        // Draw Network Lines (O(n²) — optimized with squared distance, no sqrt)
        let vertexpos = 0;
        let colorpos = 0;
        baseColor.setHex(colors.line);

        for (let i = 0; i < particleCount; i++) {
            for (let j = i + 1; j < particleCount; j++) {
                const dx = positions[i * 3]     - positions[j * 3];
                const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                const distSq = dx*dx + dy*dy + dz*dz;

                if (distSq < maxDistSq) {
                    const alpha = 1.0 - (Math.sqrt(distSq) / maxDistance);
                    
                    linesPositions[vertexpos++] = positions[i * 3];
                    linesPositions[vertexpos++] = positions[i * 3 + 1];
                    linesPositions[vertexpos++] = positions[i * 3 + 2];
                    
                    linesPositions[vertexpos++] = positions[j * 3];
                    linesPositions[vertexpos++] = positions[j * 3 + 1];
                    linesPositions[vertexpos++] = positions[j * 3 + 2];

                    linesColors[colorpos++] = baseColor.r * alpha;
                    linesColors[colorpos++] = baseColor.g * alpha;
                    linesColors[colorpos++] = baseColor.b * alpha;

                    linesColors[colorpos++] = baseColor.r * alpha;
                    linesColors[colorpos++] = baseColor.g * alpha;
                    linesColors[colorpos++] = baseColor.b * alpha;
                }
            }
        }
        linesMesh.geometry.setDrawRange(0, vertexpos / 3);
        linesMesh.geometry.attributes.position.needsUpdate = true;
        linesMesh.geometry.attributes.color.needsUpdate = true;

        // Rotate wireframe shapes
        shape1.rotation.x += 0.004; shape1.rotation.y += 0.006;
        shape2.rotation.x -= 0.005; shape2.rotation.z += 0.004;
        shape3.rotation.x += 0.003; shape3.rotation.y -= 0.004;
        shape4.rotation.y += 0.007; shape4.rotation.z += 0.003;

        renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);
}

// --- Scroll Progress Bar ---
function initScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    bar.style.cssText = [
        'position:fixed', 'top:0', 'left:0', 'height:3px', 'width:0',
        'background:linear-gradient(90deg,#00f0ff,#8b5cf6,#ff003c)',
        'z-index:99999', 'transition:width 0.08s linear',
        'box-shadow:0 0 12px #00f0ff, 0 0 24px rgba(139,92,246,0.6)'
    ].join(';');
    document.body.appendChild(bar);
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
                bar.style.width = Math.min(pct, 100) + '%';
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// --- Rainbow Cursor Trail ---
function initCursorTrail() {
    if (window.matchMedia('(max-width: 768px)').matches) return;
    const cv = document.createElement('canvas');
    cv.id = 'cursor-canvas';
    cv.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9990;';
    document.body.appendChild(cv);
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    const ctx = cv.getContext('2d');
    const trail = [];
    let hue = 0;
    let rafId = null;
    let idleTimer = null;

    const updateBlendMode = () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        cv.style.mixBlendMode = isLight ? 'normal' : 'screen';
    };
    updateBlendMode();
    window.addEventListener('themeChanged', updateBlendMode);

    const loop = () => {
        ctx.clearRect(0, 0, cv.width, cv.height);
        let hasAlive = false;
        for (let i = trail.length - 1; i >= 0; i--) {
            const p = trail[i];
            p.life -= 0.045;
            if (p.life <= 0) { trail.splice(i, 1); continue; }
            hasAlive = true;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            ctx.fillStyle = `hsla(${p.hue}, 100%, ${isLight ? '50%' : '65%'}, ${p.life * 0.6})`;
            ctx.fill();
        }
        // Stop RAF when nothing left to draw — resumes on next mousemove
        if (hasAlive) { rafId = requestAnimationFrame(loop); }
        else { rafId = null; }
    };

    document.addEventListener('mousemove', e => {
        for (let k = 0; k < 2; k++) {
            trail.push({
                x: e.clientX + (Math.random() - 0.5) * 6,
                y: e.clientY + (Math.random() - 0.5) * 6,
                r: 2 + Math.random() * 3,
                life: 1,
                hue
            });
        }
        hue = (hue + 3) % 360;
        if (trail.length > 60) trail.splice(0, trail.length - 60);
        // Restart RAF only if not already running
        if (!rafId) { rafId = requestAnimationFrame(loop); }
    }, { passive: true });

    window.addEventListener('resize', () => { cv.width = window.innerWidth; cv.height = window.innerHeight; });
}

// --- Magnetic Buttons & Spotlight Cards ---
function initMagneticButtons() {
    // Disable magnetic + spotlight on mobile — not needed for touch
    if (window.matchMedia('(max-width: 768px)').matches) return;

    document.querySelectorAll('.btn-primary, .btn-ghost, .social-orb, .icon-btn').forEach(el => {
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top  + r.height / 2);
            el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px) scale(1.06)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });

    // Spotlight: only update cards that are near the viewport — skip offscreen ones
    const cards = [...document.querySelectorAll('.glass-card, .project-card, .skill-block, .tl-card')];
    let ticking = false;
    let spotlightX = 0, spotlightY = 0;

    document.addEventListener('mousemove', e => {
        spotlightX = e.clientX;
        spotlightY = e.clientY;
        if (!ticking) {
            requestAnimationFrame(() => {
                cards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    // Skip cards that are far outside the viewport
                    if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
                    card.style.setProperty('--mouse-x', `${spotlightX - rect.left}px`);
                    card.style.setProperty('--mouse-y', `${spotlightY - rect.top}px`);
                });
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// --- Visitor Counter ---
function initVisitorCounter() {
    const countEl = document.getElementById('visitor-count');
    if (!countEl) return;
    
    // Simulate counter for demo purposes, or use countapi
    setTimeout(() => {
        let count = parseInt(localStorage.getItem('pf_visits') || '1024');
        count += Math.floor(Math.random() * 5) + 1;
        localStorage.setItem('pf_visits', count);
        
        let current = 0;
        const inc = count / 40;
        const timer = setInterval(() => {
            current += inc;
            if (current >= count) {
                clearInterval(timer);
                countEl.textContent = count.toLocaleString();
            } else {
                countEl.textContent = Math.floor(current).toLocaleString();
            }
        }, 30);
    }, 1000);
}

// Form Submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        window.location.href = `mailto:ghaythweslaty10@gmail.com?subject=Portfolio Contact from ${name}&body=${encodeURIComponent(message)}%0A%0AFrom: ${name} (${email})`;
        contactForm.reset();
    });
}
