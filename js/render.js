/* Builds the page content from window.PORTFOLIO (see data.js). */
(function () {
  'use strict';

  const SAFE_URL = /^(https?:|mailto:|#|\.{0,2}\/|assets\/)/i;

  /** Only allow http(s), mailto, anchors and relative paths — never javascript: URLs. */
  function safeUrl(url) {
    return typeof url === 'string' && SAFE_URL.test(url.trim()) ? url.trim() : '#';
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function icon(classes) {
    const i = el('i', classes);
    i.setAttribute('aria-hidden', 'true');
    return i;
  }

  function externalLink(url, label) {
    const a = el('a');
    a.href = safeUrl(url);
    if (/^https?:/i.test(a.getAttribute('href'))) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    if (label) a.setAttribute('aria-label', label);
    return a;
  }

  function setText(id, text) {
    const node = document.getElementById(id);
    if (node) node.textContent = text;
  }

  function renderIdentity(data) {
    const fullName = data.fullName || toTitleCase(`${data.firstName} ${data.lastName}`);
    document.title = `${fullName} — Portfolio`;
    setText('nav-logo', data.logo);
    setText('hero-first', data.firstName);
    setText('hero-last', data.lastName);
    setText('hero-kicker', data.heroKicker);
    setText('rotating-word', data.heroWords[0] || '');
    setText('hero-title', data.heroTitle);
    setText('credit-name', fullName);
    setText('year', String(new Date().getFullYear()));
    setText('contact-education', data.education);
    setText('contact-location', data.location);

    ['nav-email', 'contact-email'].forEach((id) => {
      const link = document.getElementById(id);
      link.href = `mailto:${data.email}`;
      link.textContent = data.email;
    });
    document.getElementById('resume-link').href = safeUrl(data.resumeUrl);
  }

  function toTitleCase(text) {
    return text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function renderAbout(text) {
    const container = document.getElementById('about-text');
    text.split(/(\s+)/).forEach((part) => {
      container.appendChild(/\s+/.test(part) ? document.createTextNode(part) : el('span', 'w', part));
    });
  }

  function renderSocials(socials) {
    const side = document.getElementById('socials');
    const list = document.getElementById('contact-socials');
    socials.forEach((s) => {
      const sideLink = externalLink(s.url, s.label);
      sideLink.appendChild(icon(s.icon));
      side.appendChild(sideLink);

      const item = el('li');
      const link = externalLink(s.url);
      link.append(s.label, icon('fa-solid fa-arrow-up-right'));
      item.appendChild(link);
      list.appendChild(item);
    });
  }

  function renderWhatIDo(cards) {
    const container = document.getElementById('whatido-cards');
    cards.forEach((card) => {
      const article = el('article', 'do-card');
      article.dataset.reveal = '';
      const chips = el('ul', 'chips');
      card.skills.forEach((skill) => chips.appendChild(el('li', 'chip', skill)));
      article.append(
        el('h3', null, card.title),
        el('p', 'do-sub', card.subtitle),
        el('p', 'do-text', card.text),
        el('p', 'do-label', 'Skillset & tools'),
        chips
      );
      container.appendChild(article);
    });
  }

  function renderCareer(entries) {
    const timeline = document.getElementById('timeline');
    timeline.style.setProperty('--rows', String(entries.length + 1));
    entries.forEach((entry, index) => {
      const item = el('div', 'timeline-item');
      item.style.setProperty('--row', String(index + 1));
      const info = el('div', 't-info');
      info.append(el('h3', null, entry.role), el('p', null, entry.org));
      item.append(info, el('p', 't-year', entry.year), el('p', 't-desc', entry.desc));
      timeline.appendChild(item);
    });
  }

  function projectVisual(project) {
    if (project.image) {
      const img = el('img');
      img.src = safeUrl(project.image);
      img.alt = `${project.title} preview`;
      img.loading = 'lazy';
      img.width = 800;
      img.height = 550;
      return img;
    }
    const [from, to] = project.colors || ['#7c3aed', '#1e1b4b'];
    const placeholder = el('div', 'placeholder', project.title);
    placeholder.style.background = `radial-gradient(circle at 30% 20%, ${from}, ${to} 75%)`;
    return placeholder;
  }

  /** Project image; it only becomes a clickable link when the project has a real URL. */
  function projectMedia(project) {
    const hasLink = project.link && project.link !== '#';
    if (!hasLink) {
      const media = el('div', 'work-image');
      media.appendChild(projectVisual(project));
      return media;
    }
    const link = externalLink(project.link, `Open ${project.title}`);
    link.classList.add('work-image');
    const view = el('span', 'view');
    view.appendChild(icon('fa-solid fa-arrow-up-right'));
    link.append(projectVisual(project), view);
    return link;
  }

  function renderProjects(projects) {
    const track = document.getElementById('work-track');
    projects.forEach((project, index) => {
      const card = el('article', 'work-card');
      const head = el('div', 'work-head');
      const meta = el('div', 'work-meta');
      meta.append(el('h3', null, project.title), el('p', null, project.category));
      head.append(el('span', 'work-num', String(index + 1).padStart(2, '0')), meta);

      const tools = el('p', 'work-tools');
      tools.append(el('strong', null, 'Tools & features'), project.tools);

      card.append(head, tools, projectMedia(project));
      track.appendChild(card);
    });
  }

  function render(data) {
    if (!data) throw new Error('window.PORTFOLIO is missing — check that js/data.js loaded.');
    renderIdentity(data);
    renderAbout(data.about);
    renderSocials(data.socials);
    renderWhatIDo(data.whatIDo);
    renderCareer(data.career);
    renderProjects(data.projects);
  }

  window.Portfolio = Object.assign(window.Portfolio || {}, { render });
})();
