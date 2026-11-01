const config = window.WATER_SITE || {};
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.documentElement.classList.add('js');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.07 });
  document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
} else {
  document.querySelectorAll('[data-reveal]').forEach(element => element.classList.add('is-visible'));
}

const menu = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open navigation');
  mobileNav.hidden = true;
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  mobileNav.hidden = !open;
});
mobileNav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menu.focus(); } });
window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab, keyboard = false) {
  for (const item of tabs) {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  }
  const panel = document.getElementById(tab.getAttribute('aria-controls'));
  if (!keyboard && !reducedMotion.matches) panel.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 250, easing: 'cubic-bezier(0.23,1,0.32,1)' });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', event => selectTab(tab, event.detail === 0));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectTab(tabs[next], true); tabs[next].focus(); }
  });
});

let demoMl = 1500;
document.querySelector('#sip-button').addEventListener('click', () => {
  demoMl = demoMl >= 2000 ? 0 : demoMl + 250;
  const percent = demoMl / 20;
  document.querySelector('#demo-percent').innerHTML = `${percent}<span>%</span>`;
  document.querySelector('#demo-ring-progress').style.strokeDashoffset = String(408.41 * (1 - percent / 100));
  document.querySelector('#demo-result').textContent = demoMl === 2000 ? 'Goal complete! Tap again to reset the demo.' : `Illustrative demo · ${demoMl.toLocaleString('en-US')} / 2,000 ml`;
});

let seconds = 1799;
setInterval(() => {
  if (document.hidden || reducedMotion.matches) return;
  seconds = seconds > 0 ? seconds - 1 : 1799;
  document.querySelector('#demo-minutes').textContent = String(Math.floor(seconds / 60)).padStart(2, '0');
  document.querySelector('#demo-seconds').textContent = String(seconds % 60).padStart(2, '0');
}, 1000);

function httpsUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; }
}
const downloadUrl = httpsUrl(config.downloadUrl);
const downloadButton = document.querySelector('#download-button');
if (downloadUrl) {
  downloadButton.href = downloadUrl;
  downloadButton.setAttribute('download', 'Water-Reminder-Windows.zip');
  document.querySelector('#download-status').textContent = 'Download the ZIP, extract the whole folder, and open Water Reminder.exe. Served directly from Cloudflare R2.';
} else {
  downloadButton.addEventListener('click', () => {
    document.querySelector('#download-status').textContent = 'The release download has not been published yet. Please check back soon.';
  });
}
const repositoryUrl = httpsUrl(config.repositoryUrl);
if (repositoryUrl) { const link = document.querySelector('#source-link'); link.href = repositoryUrl; link.hidden = false; }
document.querySelectorAll('[data-version]').forEach(node => { node.textContent = `v${config.version || '2.0.0'}`; });
document.querySelector('#year').textContent = new Date().getFullYear();
