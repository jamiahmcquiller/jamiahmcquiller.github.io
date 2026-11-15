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
  var filterCount = document.getElementById('filter-count');
  var filterReset = document.getElementById('filter-reset');
  function applyFilter(btn) {
    var f = btn.getAttribute('data-filter');
    var shown = 0;
    filterBtns.forEach(function (b) {
      var active = b === btn;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    projects.forEach(function (p) {
      var match = f === 'all' || p.getAttribute('data-category') === f;
      p.classList.toggle('is-hidden', !match);
      if (match) shown++;
    });
    if (filterCount) {
      filterCount.textContent = 'Showing ' + shown + ' of ' + projects.length + ' projects'
        + (f === 'all' ? '' : ' — ' + btn.textContent.trim());
    }
    if (filterReset) filterReset.hidden = (f === 'all');
  }
  if (filterBtns.length && projects.length) {
    filterBtns.forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');
      btn.addEventListener('click', function () { applyFilter(btn); });
    });
    if (filterReset) {
      filterReset.addEventListener('click', function () {
        var allBtn = document.querySelector('.filter-btn[data-filter="all"]');
        if (allBtn) { applyFilter(allBtn); allBtn.focus(); }
      });
    }
    if (filterCount) filterCount.textContent = 'Showing ' + projects.length + ' of ' + projects.length + ' projects';
  }

  /* ---------- Bottom terminal bar ---------- */
  var input = document.getElementById('term-input');
  var panel = document.getElementById('term-output');
  var body = document.getElementById('term-output-body');
  var closeBtn = document.getElementById('term-close');
  var collapseBtn = document.getElementById('term-collapse');
  var outHead = document.querySelector('.term-output-inner .out-head');
  if (!input || !panel || !body) return;

  var isCaseStudy = location.pathname.indexOf('/projects/') !== -1;
  var homePrefix = isCaseStudy ? '../index.html' : '';

  /* Keep the footer reachable while the fixed panel is open: the extra
     bottom room scales with the panel (full height, or header-only when collapsed). */
  function syncBodyRoom() {
    var open = panel.classList.contains('is-open');
    var collapsed = panel.classList.contains('is-collapsed');
    document.body.classList.toggle('has-term-output', open && !collapsed);
    document.body.classList.toggle('has-term-output-collapsed', open && collapsed);
  }
  function setCollapsed(collapsed) {
    panel.classList.toggle('is-collapsed', collapsed);
    if (collapseBtn) {
      collapseBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      collapseBtn.textContent = collapsed ? 'expand' : 'collapse';
    }
    syncBodyRoom();
  }
  function show(text) {
    body.textContent = text;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    panel.inert = false;
    setCollapsed(false);
  }
  function hide() {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    panel.inert = true;
    body.textContent = '';
    setCollapsed(false);
    syncBodyRoom();
  }
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return true; }
    location.href = homePrefix + 'index.html#' + id;
    return false;
  }

  /* Command history: ArrowUp / ArrowDown, kept in memory + localStorage. */
  var history = [];
  try {
    var saved = JSON.parse(window.localStorage.getItem('term-history') || '[]');
    if (Array.isArray(saved)) history = saved.filter(function (c) { return typeof c === 'string'; }).slice(-50);
  } catch (e) { history = []; }
  var histIndex = -1; /* -1 = current (unsent) input */
  var draft = '';
  function saveHistory() {
    try { window.localStorage.setItem('term-history', JSON.stringify(history.slice(-50))); } catch (e) { /* private mode: memory only */ }
  }
  function remember(cmd) {
    if (!cmd) return;
    if (history[history.length - 1] !== cmd) history.push(cmd);
    if (history.length > 50) history = history.slice(-50);
    histIndex = -1;
    saveHistory();
  }

  var COMMANDS = ['help', 'whoami', 'about', 'projects', 'work', 'ls', 'experience', 'certifications', 'certs', 'writing', 'contact', 'resume', 'clear'];
  function levenshtein(a, b) {
    var m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur[0] = i;
      for (j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur; cur = [];
    }
    return prev[n];
  }
  function didYouMean(cmd) {
    var best = null, bestDist = Infinity;
    COMMANDS.forEach(function (c) {
      var d = levenshtein(cmd, c);
      if (d < bestDist) { bestDist = d; best = c; }
    });
    if (bestDist <= 2) return best;
    var prefix = COMMANDS.filter(function (c) { return c.indexOf(cmd) === 0 || cmd.indexOf(c) === 0; })[0];
    return prefix || null;
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
    '  resume         open the résumé (PDF)',
    '  clear          clear this output',
    '',
    'Tip: use ↑ / ↓ to recall previous commands.'
  ].join('\n');

  function run(raw) {
    var trimmed = (raw || '').trim();
    if (!trimmed) return;
    var cmd = trimmed.toLowerCase().replace(/^\.\//, '').split(/\s+/)[0];
    remember(cmd);
    var promptLine = 'jamiah@portfolio:~$ ' + cmd + '\n';
    switch (cmd) {
      case 'help':
        show(promptLine + HELP);
        break;
      case 'whoami':
        show(promptLine + 'Jamiah McQuiller\nCybersecurity Analyst | Vulnerability & Security Operations\nIT End User Computing Technician, Genesee County');
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
      case 'resume':
        hide();
        window.open((isCaseStudy ? '../' : '') + 'assets/files/Jamiah-McQuiller-Resume.pdf', '_blank', 'noopener');
        break;
      case 'clear':
        hide();
        break;
      default: {
        var suggestion = didYouMean(cmd);
        var msg = promptLine + 'command not found: ' + cmd;
        if (suggestion) msg += '\nDid you mean "' + suggestion + '"?';
        msg += '\nType "help" to list commands.';
        show(msg);
        break;
      }
    }
  }

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var value = input.value;
      input.value = '';
      run(value);
    } else if (e.key === 'ArrowUp') {
      if (!history.length) return;
      e.preventDefault();
      if (histIndex === -1) { draft = input.value; histIndex = history.length - 1; }
      else if (histIndex > 0) { histIndex--; }
      input.value = history[histIndex];
    } else if (e.key === 'ArrowDown') {
      if (histIndex === -1) return;
      e.preventDefault();
      if (histIndex < history.length - 1) { histIndex++; input.value = history[histIndex]; }
      else { histIndex = -1; input.value = draft; }
    } else if (e.key === 'Escape' && panel.classList.contains('is-open')) {
      hide();
      input.blur();
    }
  });
  document.querySelectorAll('.term-cmds [data-cmd]').forEach(function (btn) {
    btn.addEventListener('click', function () { run(btn.getAttribute('data-cmd')); });
  });
  if (closeBtn) closeBtn.addEventListener('click', hide);
  if (collapseBtn) {
    collapseBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setCollapsed(!panel.classList.contains('is-collapsed'));
    });
  }
  if (outHead) {
    outHead.addEventListener('click', function (e) {
      if (e.target.closest('button')) return;
      setCollapsed(!panel.classList.contains('is-collapsed'));
    });
  }
  /* Start closed and inert so keyboard users never tab into a hidden panel. */
  hide();
})();
