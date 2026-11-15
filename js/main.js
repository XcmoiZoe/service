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
  var items = document.querySelectorAll('.section h2, .card, .plan, .addon, .project, .about__photos, .timeline li, .contact__box');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }

  // Inquiry form -> Messenger
  var MESSENGER = 'https://m.me/168737504976524';
  var form = document.getElementById('inquiry');
  if (form) {
    var errBox = document.getElementById('inquiry-error');
    var done = document.getElementById('inquiry-done');
    var openLink = document.getElementById('inquiry-open');
    var lastMsg = '';

    var copyText = function (text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).catch(function () { legacyCopy(text); });
      }
      legacyCopy(text);
      return Promise.resolve();
    };
    var legacyCopy = function (text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var name = (d.get('name') || '').trim();
      var details = (d.get('details') || '').trim();
      var services = d.getAll('service');

      var missing = [];
      if (!name) missing.push('your name');
      if (!services.length) missing.push('at least one service');
      if (!details) missing.push('project details');
      if (missing.length) {
        errBox.textContent = 'Please add ' + missing.join(', ') + '.';
        errBox.hidden = false;
        return;
      }
      errBox.hidden = true;

      var lines = [
        'Hi Zoe! New project inquiry from your website:',
        '',
        'Name: ' + name
      ];
      var contact = (d.get('contact') || '').trim();
      if (contact) lines.push('Contact: ' + contact);
      lines.push('Service: ' + services.join(', '));
      lines.push('Budget: ' + (d.get('budget') || 'Not sure yet'));
      lines.push('Timeline: ' + (d.get('timeline') || 'Flexible'));
      var site = (d.get('site') || '').trim();
      if (site) lines.push('Website: ' + site);
      lines.push('', 'Details:', details);
      lastMsg = lines.join('\n');

      var url = MESSENGER + '?text=' + encodeURIComponent(lastMsg);
      openLink.href = url;
      // Open synchronously so popup blockers allow it
      window.open(url, '_blank', 'noopener');
      copyText(lastMsg);
      done.hidden = false;
    });

    document.getElementById('inquiry-copy').addEventListener('click', function (e) {
      var btn = e.currentTarget;
      copyText(lastMsg).then(function () {
        btn.textContent = 'Copied!';
        setTimeout(function () { btn.textContent = 'Copy again'; }, 1500);
      });
    });

    // Clicking a service card pre-selects it in the form
    var map = ['Website (WordPress / custom)', 'UI/UX design', 'SEO', 'Social media / video'];
    document.querySelectorAll('.card').forEach(function (card, i) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', function () {
        var box = form.querySelector('input[name="service"][value="' + map[i] + '"]');
        if (box) box.checked = true;
        document.getElementById('contact').scrollIntoView();
      });
    });

    // Pricing buttons pre-fill the form with the chosen plan
    document.querySelectorAll('[data-plan]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        form.querySelectorAll('input[name="service"]').forEach(function (b) {
          b.checked = b.value === btn.dataset.service;
        });
        if (btn.dataset.budget) form.elements.budget.value = btn.dataset.budget;
        var details = form.elements.details;
        var line = "I'm interested in the " + btn.dataset.plan + ' package.';
        details.value = details.value.replace(/^I'm interested in the .* package\.\n*/, '');
        details.value = line + '\n\n' + details.value;
        setTimeout(function () { form.elements.name.focus({ preventScroll: true }); }, 600);
      });
    });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
