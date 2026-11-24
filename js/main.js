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
  var items = document.querySelectorAll('.section h2, .card, .plan, .addon, .project, .why__item, .process li, .faq details, .case, .cta-band, .timeline li, .contact__box');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }

  // Inquiry form -> email (FormSubmit). m.me is blocked by some PH ISPs, so Messenger is only a fallback.
  var MESSENGER = 'https://www.messenger.com/t/168737504976524';
  var INBOX = 'eugeniourbano07' + '@' + 'gmail.com';
  var ENDPOINT = 'https://formsubmit.co/ajax/' + INBOX;
  var form = document.getElementById('inquiry');
  if (form) {
    var errBox = document.getElementById('inquiry-error');
    var done = document.getElementById('inquiry-done');
    var submitBtn = form.querySelector('.inquiry__submit');
    var submitLabel = submitBtn.querySelector('.inquiry__label');

    var showError = function (html) { errBox.innerHTML = html; errBox.hidden = false; };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      if ((d.get('_honey') || '').trim()) return; // bot
      var name = (d.get('name') || '').trim();
      var contact = (d.get('contact') || '').trim();
      var details = (d.get('details') || '').trim();
      var services = d.getAll('service');

      var missing = [];
      if (!name) missing.push('your name');
      if (!contact) missing.push('an email or phone so I can reply');
      if (!services.length) missing.push('at least one service');
      if (!details) missing.push('project details');
      if (missing.length) { showError('Please add ' + missing.join(', ') + '.'); return; }
      errBox.hidden = true;

      var payload = {
        _subject: 'New website inquiry from ' + name,
        _template: 'table',
        Name: name,
        'Email or phone': contact,
        Service: services.join(', '),
        Budget: d.get('budget') || 'Not sure yet',
        Timeline: d.get('timeline') || 'Flexible',
        Website: (d.get('site') || '').trim() || '—',
        Details: details
      };
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) payload._replyto = contact;

      submitBtn.disabled = true;
      submitLabel.textContent = 'Sending…';

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok || String(res.j.success) === 'false') throw new Error(res.j.message || 'Send failed');
          form.querySelectorAll('.inquiry__row, .field, .inquiry__submit, .inquiry__note').forEach(function (el) { el.hidden = true; });
          done.querySelector('[data-name]').textContent = name.split(' ')[0];
          done.hidden = false;
          done.scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .catch(function () {
          showError('Sorry, your message didn\u2019t go through. Please email me at <a href="mailto:' + INBOX + '">' + INBOX + '</a> or <a href="' + MESSENGER + '" target="_blank" rel="noopener">message me on Messenger</a>.');
        })
        .then(function () {
          submitBtn.disabled = false;
          submitLabel.textContent = 'Send my inquiry';
        });
    });

    // Service cards, pricing buttons and add-ons pre-fill the form
    document.querySelectorAll('[data-service]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var plan = btn.dataset.plan;
        form.querySelectorAll('input[name="service"]').forEach(function (b) {
          if (plan) b.checked = b.value === btn.dataset.service;
          else if (b.value === btn.dataset.service) b.checked = true;
        });
        if (btn.dataset.budget) form.elements.budget.value = btn.dataset.budget;
        if (plan) {
          var details = form.elements.details;
          var line = "I'm interested in the " + plan + ' package.';
          details.value = details.value.replace(/^I'm interested in the .* package\.\n*/, '');
          details.value = line + '\n\n' + details.value;
        }
        setTimeout(function () { form.elements.name.focus({ preventScroll: true }); }, 600);
      });
    });
  }

  // Show more projects
  var more = document.getElementById('show-more');
  var grid = document.querySelector('.grid');
  if (more && grid) {
    more.addEventListener('click', function () {
      grid.classList.add('is-expanded');
      more.parentNode.hidden = true;
    });
    // Filtering reveals everything in that category
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        grid.classList.add('is-expanded');
        more.parentNode.hidden = true;
      });
    });
  }

  // Sticky mobile CTA: show after hero, hide near the form
  var sticky = document.getElementById('sticky-cta');
  var contact = document.getElementById('contact');
  if (sticky && contact) {
    var updateSticky = function () {
      var past = window.scrollY > window.innerHeight * 0.6;
      var r = contact.getBoundingClientRect();
      var atForm = r.top < window.innerHeight && r.bottom > 0;
      sticky.classList.toggle('is-visible', past && !atForm);
    };
    window.addEventListener('scroll', updateSticky, { passive: true });
    updateSticky();
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
