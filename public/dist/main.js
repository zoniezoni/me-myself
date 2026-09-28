"use strict";
const routes = [
    { hash: '#/', id: 'start', nav: 0 },
    { hash: '#/ueber-mich', id: 'ueber-mich', nav: 1 },
    { hash: '#/kontakt', id: 'kontakt', nav: 2 },
    { hash: '#/impressum', id: 'impressum', nav: 2 }, // Impressum bleibt bei «Kontakt» aktiv
    { hash: '#/datenschutz', id: 'datenschutz', nav: 2 }, // ebenso Datenschutzerklärung
];
const DURATION = 900;
const EASE = 'cubic-bezier(.77,0,.18,1)';
const main = document.querySelector('main');
const handle = document.querySelector('.handle');
const navLinks = Array.from(document.querySelectorAll('header nav a'));
const footerLinks = Array.from(document.querySelectorAll('footer a'));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let current = -1;
let busy = false;
const viewOf = (i) => document.getElementById(routes[i].id);
function indexFromHash() {
    const i = routes.findIndex((r) => r.hash === (location.hash || '#/'));
    return i < 0 ? 0 : i;
}
/** Setzt den Ring auf den aktiven Menüpunkt. */
function placeHandle(i, animate = true) {
    const bar = handle.parentElement;
    const b = bar.getBoundingClientRect();
    const l = navLinks[routes[i].nav].getBoundingClientRect();
    const x = l.left + l.width / 2 - b.left - handle.offsetWidth / 2;
    if (!animate)
        handle.style.transition = 'none';
    handle.style.transform = `translateX(${x}px)`;
    if (!animate) {
        void handle.offsetWidth;
        handle.style.transition = '';
    }
}
/**
 * Ruhiger Seitenwechsel ohne sichtbaren Schieber: Die neue Seite
 * kommt leicht von unten, während die alte Seite dezent nach oben ausblendet.
 * Der eigentliche Text steigt zusätzlich weiterhin zeilenweise von unten auf.
 */
function transition(view, old, first, forward) {
    const opts = { duration: DURATION, easing: EASE, fill: 'both' };
    if (first || !old) {
        return [
            view.animate({ opacity: [0, 1], transform: ['translateY(32px)', 'translateY(0)'] }, { ...opts, duration: 1000 }),
        ];
    }
    const direction = forward ? -1 : 1;
    return [
        view.animate({ opacity: [0, 1], transform: ['translateY(28px)', 'translateY(0)'] }, opts),
        old.animate({ opacity: [1, 0], transform: ['translateY(0)', `translateY(${direction * 20}px)`] }, opts),
    ];
}
async function go(next, first = false) {
    busy = true;
    const view = viewOf(next);
    const old = current >= 0 ? viewOf(current) : null;
    navLinks.forEach((a, i) => i === routes[next].nav && routes[next].id !== 'impressum'
        ? a.setAttribute('aria-current', 'page')
        : a.removeAttribute('aria-current'));
    footerLinks.forEach((a) => a.getAttribute('href') === routes[next].hash
        ? a.setAttribute('aria-current', 'page')
        : a.removeAttribute('aria-current'));
    main.dataset.view = routes[next].id; // Textur wandert mit
    placeHandle(next, !first);
    window.scrollTo(0, 0);
    view.classList.remove('in');
    view.hidden = false;
    if (reduceMotion.matches) {
        if (old)
            old.hidden = true;
        view.classList.add('in');
    }
    else {
        const anims = transition(view, old, first, next > current);
        requestAnimationFrame(() => requestAnimationFrame(() => view.classList.add('in')));
        await Promise.all(anims.map((a) => a.finished));
        if (old)
            old.hidden = true;
        anims.forEach((a) => a.cancel());
    }
    current = next;
    busy = false;
    if (!first)
        view.querySelector('h1')?.focus({ preventScroll: true });
    sync(); // falls währenddessen schon weiternavigiert wurde
}
function sync() {
    if (busy)
        return;
    const i = indexFromHash();
    if (i !== current)
        void go(i, current < 0);
}
// Die Textur folgt dem Mauszeiger leicht versetzt
if (!reduceMotion.matches) {
    window.addEventListener('pointermove', (e) => {
        main.style.setProperty('--mx', String(e.clientX / window.innerWidth - 0.5));
        main.style.setProperty('--my', String(e.clientY / window.innerHeight - 0.5));
    });
}
window.addEventListener('hashchange', sync);
window.addEventListener('resize', () => { if (current >= 0)
    placeHandle(current, false); });
void document.fonts.ready.then(sync);
