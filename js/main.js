(function () {
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav__toggle');

  // Mobile menu
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.nav__links a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Nav border on scroll
  var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 10); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Project filter
  var filters = document.querySelectorAll('.filter');
  var projects = document.querySelectorAll('.project');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      var f = btn.dataset.filter;
      projects.forEach(function (p) { p.hidden = f !== 'all' && p.dataset.cat.split(' ').indexOf(f) === -1; });
    });
  });

  // Lightbox
  var box = document.getElementById('lightbox');
  var boxImg = box.querySelector('img');
  document.querySelectorAll('button.project__img').forEach(function (btn) {
    btn.addEventListener('click', function () {
      boxImg.src = btn.dataset.full;
      boxImg.alt = btn.querySelector('img').alt;
      box.showModal();
    });
  });
  box.addEventListener('click', function (e) {
    if (e.target === box || e.target.classList.contains('lightbox__close')) box.close();
  });

  // Reveal on scroll
  var items = document.querySelectorAll('.section h2, .card, .project, .about__photos, .timeline li, .contact__box');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
