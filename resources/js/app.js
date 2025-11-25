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

    // Count-up animation (run once on load)
    if (counters.length) {
        const animateCounters = () => {
            counters.forEach((el) => {
                const target = parseInt(el.dataset.count || '0', 10);
                if (!target || target <= 0) return;
                const duration = 1500;
                const start = performance.now();

                const tick = (now) => {
                    const progress = Math.min((now - start) / duration, 1);
                    const value = Math.floor(progress * target);
                    el.textContent = `+${value}`;
                    if (progress < 1) {
                        requestAnimationFrame(tick);
                    } else {
                        el.textContent = `+${target}`;
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
