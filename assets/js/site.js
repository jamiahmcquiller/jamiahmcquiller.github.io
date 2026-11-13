/* Menu toggle + reveal-on-scroll. No dependencies. */
(function () {
  document.documentElement.classList.add('js');
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  function close() { links.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && links.classList.contains('is-open')) { close(); toggle.focus(); } });
  }
  var items = document.querySelectorAll('.reveal, .reveal-x');
  if (!('IntersectionObserver' in window)) { items.forEach(function (el) { el.classList.add('is-visible'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });
  items.forEach(function (el) { io.observe(el); });
})();
