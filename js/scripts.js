/* ══════════════════════════════════════════════════════════
   PROYECTO VOLCAN — COMPORTAMIENTOS DINÁMICOS (JS)
   ══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Gráfica de dona (Chart.js)
    initDoughnutChart();

    // 2. Animación de barras de costo al scroll (Intersection Observer)
    initCostBarAnimation();

    // 3. Barra de progreso de lectura y botón flotante de "Ir Arriba"
    initScrollInteractions();

    // 4. Fondo dinámico de partículas
    initParticleBackground();

    // 5. Reflector interactivo que sigue al mouse
    initMouseSpotlight();
});

/**
 * Inicializa el gráfico de dona de impacto social utilizando Chart.js
 */
function initDoughnutChart() {
    const chartCanvas = document.getElementById('donaChart');
    if (!chartCanvas) return;

    try {
        const ctx = chartCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [4.9, 95.1],
                    backgroundColor: ['#FF4C6A', '#1A237E'],
                    borderColor: ['#FF4C6A', '#1A237E'],
                    borderWidth: 2,
                    hoverOffset: 8
                }]
            },
            options: {
                cutout: '65%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                animation: {
                    duration: 1800,
                    easing: 'easeInOutQuart'
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    } catch (error) {
        console.error('Error al inicializar Chart.js:', error);
    }
}

/**
 * Controla la animación de las barras de costo
 */
function initCostBarAnimation() {
    const bars = [
        { id: 'bar1', width: 95.4 },
        { id: 'bar2', width: 4.6 },
        { id: 'bar3', width: 0 },
        { id: 'bar4', width: 95.4 },
        { id: 'bar5', width: 4.6 },
        { id: 'bar6', width: 0 },
    ];

    function animateBars() {
        bars.forEach(b => {
            const el = document.getElementById(b.id);
            if (el) {
                setTimeout(() => {
                    el.style.width = b.width + '%';
                }, 200);
            }
        });
    }

    const firstBar = document.getElementById('bar1');
    if (!firstBar) {
        // Ejecución inmediata si no existen los elementos esperados para observar
        animateBars();
        return;
    }

    // Usar IntersectionObserver para iniciar la animación cuando la tarjeta esté visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateBars();
                observer.disconnect(); // Desconectar una vez que se activa
            }
        });
    }, { threshold: 0.15 });

    // Observa la tarjeta o sección contenedora más cercana de la primera barra
    const triggerElement = firstBar.closest('.card') || firstBar;
    observer.observe(triggerElement);
}

/**
 * Controla la barra de progreso de lectura y el comportamiento del botón "Volver arriba"
 */
function initScrollInteractions() {
    const progressBar = document.getElementById('scrollProgress');
    const backToTopBtn = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        // Cálculo del porcentaje de lectura (scroll)
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

        if (progressBar) {
            progressBar.style.width = scrollPercent + '%';
        }

        // Mostrar / ocultar botón flotante de ir arriba
        if (backToTopBtn) {
            if (scrollTop > 400) {
                backToTopBtn.classList.add('show');
                backToTopBtn.setAttribute('aria-hidden', 'false');
            } else {
                backToTopBtn.classList.remove('show');
                backToTopBtn.setAttribute('aria-hidden', 'true');
            }
        }
    }, { passive: true });

    // Comportamiento de click en el botón de ir arriba
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            // Retornar foco accesible al skip link o body
            const skipLink = document.getElementById('skipLink');
            if (skipLink) {
                skipLink.focus();
            }
        });
    }
}

/**
 * Crea un fondo interactivo de partículas interconectadas en el canvas.
 */
function initParticleBackground() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    };

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            // Paleta de colores cyberpunk a juego con el sitio (cian, azul, violeta, dorado)
            const colors = ['#00FFD1', '#00B4FF', '#DA70D6', '#FFD700'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Rebotar al tocar los bordes
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const initParticles = () => {
        const particleCount = Math.min(60, Math.floor((canvas.width * canvas.height) / 25000));
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    };

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar las líneas de conexión
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Dibujar conexiones si están lo suficientemente cerca
                if (distance < 120) {
                    ctx.strokeStyle = `rgba(0, 180, 255, ${0.12 * (1 - distance / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
            particles[i].update();
            particles[i].draw();
        }
        animationFrameId = requestAnimationFrame(animate);
    };

    const startAnimation = () => {
        cancelAnimationFrame(animationFrameId);
        animate();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    startAnimation();

    // Detener la animación cuando la pestaña esté oculta para ahorrar CPU y batería
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationFrameId);
        } else {
            startAnimation();
        }
    });
}

/**
 * Escucha los movimientos del puntero del mouse para actualizar las variables
 * CSS que posicionan el reflector de luz interactivo.
 */
function initMouseSpotlight() {
    window.addEventListener('mousemove', (e) => {
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    }, { passive: true });
}

// ── SCRIPT del contador (agregar al final de <body> o en js/scripts.js) ──
 (function () {
    'use strict';

    // ── Clave de almacenamiento en localStorage ──────────────────────────────
    var STORAGE_KEY = 'volcan_visit_count';

    // ── Elemento del DOM ─────────────────────────────────────────────────────
    var el = document.getElementById('visitCount');
    if (!el) return;

    // ── Leer el contador actual ───────────────────────────────────────────────
    var count = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);

    // ── Incrementar en 1 por cada carga de página ────────────────────────────
    count += 1;
    localStorage.setItem(STORAGE_KEY, count);

    // ── Formatear con separadores de miles (ej. 1,234) ───────────────────────
    function formatNumber(n) {
      return n.toLocaleString('es-MX');
    }

    // ── Animación de conteo ascendente ───────────────────────────────────────
    function animateCount(target) {
      var start = Math.max(0, target - 30);   // arranca 30 unidades antes
      var current = start;
      var step = Math.ceil((target - start) / 20); // 20 pasos
      var interval = setInterval(function () {
        current = Math.min(current + step, target);
        el.textContent = formatNumber(current);
        if (current >= target) {
          clearInterval(interval);
          el.textContent = formatNumber(target);
        }
      }, 40); // ~40 ms por paso → animación de ~800 ms
    }

    // ── Mostrar con pequeño retraso para que la página cargue primero ─────────
    setTimeout(function () {
      el.classList.add('updating');
      setTimeout(function () {
        el.classList.remove('updating');
        animateCount(count);
      }, 300);
    }, 600);

  })();
