/* Portfolio v2.0 — menu toggle, project filters, bottom terminal bar.
   No dependencies. No external requests. */
(function () {
  document.documentElement.classList.add('js');

  /* ---------- Mobile menu toggle ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  function closeMenu() {
    if (!links || !toggle) return;
    links.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('is-open')) { closeMenu(); toggle.focus(); }
    });
  }

  /* ---------- Reveal on scroll (older pages use .reveal / .reveal-x) ---------- */
  var items = document.querySelectorAll('.reveal, .reveal-x');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Project filters ---------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var projects = document.querySelectorAll('.project-list .project');
  if (filterBtns.length && projects.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var f = btn.getAttribute('data-filter');
        projects.forEach(function (p) {
          p.classList.toggle('is-hidden', f !== 'all' && p.getAttribute('data-category') !== f);
        });
      });
    });
  }

  /* ---------- Bottom terminal bar ---------- */
  var input = document.getElementById('term-input');
  var panel = document.getElementById('term-output');
  var body = document.getElementById('term-output-body');
  var closeBtn = document.getElementById('term-close');
  if (!input || !panel || !body) return;

  var isCaseStudy = location.pathname.indexOf('/projects/') !== -1;
  var homePrefix = isCaseStudy ? '../index.html' : '';

  function show(text) {
    body.textContent = text;
    panel.classList.add('is-open');
  }
  function hide() {
    panel.classList.remove('is-open');
    body.textContent = '';
  }
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return true; }
    location.href = homePrefix + 'index.html#' + id;
    return false;
  }

  var HELP = [
    'Available commands:',
    '  help           list commands',
    '  whoami         who is Jamiah McQuiller',
    '  about          open the about / experience section',
    '  projects       selected work',
    '  experience     professional background',
    '  certifications credentials',
    '  writing        Offline Theory publication',
    '  contact        contact information',
    '  clear          clear this output'
  ].join('\n');

  function run(raw) {
    var cmd = (raw || '').trim().toLowerCase().replace(/^\.\//, '');
    if (!cmd) return;
    var promptLine = 'jamiah@portfolio:~$ ' + cmd + '\n';
    switch (cmd) {
      case 'help':
        show(promptLine + HELP);
        break;
      case 'whoami':
        show(promptLine + 'Jamiah McQuiller\nCybersecurity & Vulnerability Management\nIT End User Computing Technician, Genesee County');
        break;
      case 'about':
        hide();
        scrollToId('experience');
        break;
      case 'projects':
      case 'work':
      case 'ls':
        hide();
        scrollToId('projects');
        break;
      case 'experience':
        hide();
        scrollToId('experience');
        break;
      case 'certifications':
      case 'certs':
        hide();
        scrollToId('certs');
        break;
      case 'writing':
        hide();
        scrollToId('writing');
        break;
      case 'contact':
        hide();
        scrollToId('contact');
        break;
      case 'clear':
        hide();
        break;
      default:
        show(promptLine + 'command not found: ' + cmd + ' — type help');
        break;
    }
  }

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var value = input.value;
      input.value = '';
      run(value);
    }
  });
  document.querySelectorAll('.term-cmds [data-cmd]').forEach(function (btn) {
    btn.addEventListener('click', function () { run(btn.getAttribute('data-cmd')); });
  });
  if (closeBtn) closeBtn.addEventListener('click', hide);
})();
