import './bootstrap';

document.addEventListener('DOMContentLoaded', () => {
    const menu = document.querySelector('[data-nav-menu]');
    const toggle = document.querySelector('[data-nav-toggle]');
    const links = document.querySelectorAll('[data-scroll]');
    const animated = document.querySelectorAll('[data-animate]');
    const progressBar = document.querySelector('[data-scroll-progress]');
    const loader = document.getElementById('loader');
    const counters = document.querySelectorAll('[data-count]');

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('nav__menu--open');
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 960) {
                menu.classList.remove('nav__menu--open');
            }
        });
    }

    links.forEach((link) => {
        link.addEventListener('click', (event) => {
            const target = document.querySelector(link.getAttribute('href') || '');
            if (target) {
                event.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            if (menu) {
                menu.classList.remove('nav__menu--open');
            }
        });
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const delay = entry.target.dataset.delay || '0s';
                        entry.target.style.transitionDelay = delay;
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
        );

        animated.forEach((el) => observer.observe(el));
    } else {
        animated.forEach((el) => el.classList.add('is-visible'));
    }

    if (progressBar) {
        const updateProgress = () => {
            const doc = document.documentElement;
            const total = doc.scrollHeight - doc.clientHeight;
            const scrolled = (doc.scrollTop / total) * 100;
            progressBar.style.width = `${scrolled}%`;
        };
        document.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }

    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('is-hidden');
                setTimeout(() => loader.remove(), 450);
            }, 800);
        });
    }

    // Simple count-up animation
    if (counters.length) {
        const animateCounters = () => {
            counters.forEach((el) => {
                const target = Number(el.dataset.count || 0);
                let current = 0;
                const step = Math.max(1, Math.floor(target / 60));
                const tick = () => {
                    current += step;
                    if (current >= target) {
                        el.textContent = target;
                    } else {
                        el.textContent = current;
                        requestAnimationFrame(tick);
                    }
                };
                requestAnimationFrame(tick);
            });
        };
        if (document.readyState === 'complete') {
            animateCounters();
        } else {
            window.addEventListener('load', animateCounters);
        }
    }
});
