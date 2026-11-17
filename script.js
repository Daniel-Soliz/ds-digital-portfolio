/* DS Digital | Renderização da página inicial a partir de content.json */
(() => {
  "use strict";
  const $ = selector => document.querySelector(selector);
  const root = document.documentElement;
  let content = null;

  function text(selector, value) {
    const element = $(selector);
    if (element && value !== undefined && value !== null) element.textContent = String(value);
    return element;
  }
  function node(tag, className, value) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined && value !== null) el.textContent = String(value);
    return el;
  }
  function removeChildren(el) {
    if (el) el.replaceChildren();
    return el;
  }
  function safeURL(raw, image = false) {
    if (typeof raw !== "string" || !raw.trim()) return "";
    const value = raw.trim();
    if (!image && /^#[\w-]+$/.test(value)) return value;
    try {
      const url = new URL(value, window.location.href);
      if (url.protocol !== "https:" && !(url.protocol === "http:" && url.hostname === "localhost")) return "";
      return url.href;
    } catch { return ""; }
  }
  function setHref(el, raw) {
    if (!el) return;
    const url = safeURL(raw);
    if (!url) { el.removeAttribute("href"); el.removeAttribute("target"); return; }
    el.href = url;
    if (!url.startsWith("#") && new URL(url).origin !== location.origin) {
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    } else {
      el.removeAttribute("target");
      el.removeAttribute("rel");
    }
  }
  function whatsapp(number, message) {
    const digits = String(number || "").replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) return "#contato";
    return "https://wa.me/" + digits + "?text=" + encodeURIComponent(String(message || "Olá!"));
  }
  function action(el, label, href, symbol = "↗") {
    if (!el) return;
    el.replaceChildren(document.createTextNode(String(label || "Saiba mais") + " "), node("span", "", symbol));
    el.lastElementChild.setAttribute("aria-hidden", "true");
    setHref(el, href);
  }
  function decoratedText(el, raw) {
    if (!el) return;
    const v = String(raw || "");
    el.replaceChildren(document.createTextNode(v.endsWith(".") ? v.slice(0, -1) : v));
    if (v.endsWith(".")) el.append(node("span", "", "."));
  }
  function headline(selector, normal, accent) {
    const el = $(selector);
    if (!el) return;
    el.replaceChildren(document.createTextNode(String(normal || "") + " "), node("span", "", accent || ""));
  }
  function brandLogo(el, value, image) {
    if (!el) return;
    const imageSrc = safeURL(image, true);
    if (imageSrc) {
      const img = node("img", "site-logo-img");
      img.src = imageSrc;
      img.alt = String(value || "Logo DS Digital");
      el.replaceChildren(img);
    } else decoratedText(el, value);
  }
  function applyTheme(s) {
    if (!s) return;
    const validColor = value => /^#[0-9a-fA-F]{6}$/.test(value || "");
    for (const [key, variable] of [["accentColor", "--accent"], ["backgroundColor", "--bg"], ["textColor", "--text"]]) {
      if (validColor(s[key])) root.style.setProperty(variable, s[key]);
    }
    if (validColor(s.themeColor)) {
      const meta = $('meta[name="theme-color"]');
      if (meta) meta.content = s.themeColor;
    }
    const hero = $(".hero");
    const bg = safeURL(s.heroBackgroundImage, true);
    if (hero) {
      hero.style.backgroundImage = bg ? 'linear-gradient(100deg,rgba(13,18,25,.94),rgba(13,18,25,.56)),url("' + bg + '")' : "";
      hero.classList.toggle("has-bg-photo", Boolean(bg));
    }
  }
  function renderHeader(data) {
    const s = data.site;
    brandLogo($(".brand-symbol"), s.logoText, s.logoImage);
    text(".brand-copy strong", s.brandName);
    text(".brand-copy small", s.brandSubtitle);
    const nav = removeChildren($(".nav"));
    for (const item of data.navigation || []) {
      const link = node("a", "", item.label);
      setHref(link, item.href);
      nav?.append(link);
    }
    action($(".header-cta"), data.headerCta.label, whatsapp(data.contact.phone, data.headerCta.message));
  }
  function renderHero(data) {
    const h = data.hero;
    text(".hero .eyebrow", h.eyebrow);
    const eyebrow = $(".hero .eyebrow");
    if (eyebrow) eyebrow.prepend(node("span", "status-dot"));
    const title = $(".hero h1");
    if (title) title.replaceChildren(document.createTextNode(String(h.title || "") + " "), node("em", "", h.highlight || ""));
    text(".hero-description", h.description);
    action($(".hero-actions .btn-primary"), h.ctaLabel, whatsapp(data.contact.phone, h.ctaMessage));
    action($(".hero-actions .btn-secondary"), h.secondaryLabel, h.secondaryHref, "↓");
    const perks = removeChildren($(".hero-perks"));
    for (const perk of h.perks || []) perks?.append(node("li", "", perk.text));
    const preview = h.preview || {};
    text(".preview-bar > span:not(.preview-arrow)", preview.urlText);
    const navBrand = $(".preview-navigation strong");
    if (navBrand) navBrand.replaceChildren(document.createTextNode(preview.brand || ""), node("span", "", preview.brandAccent || ""));
    text(".preview-navigation > span", preview.menu);
    text(".preview-kicker", preview.kicker);
    text(".preview-text h2", preview.title);
    text(".preview-text p", preview.description);
    text(".preview-pill", (preview.button || "") + " ↗");
    text(".graphic-center", preview.number);
    text(".preview-bottom span:first-child", preview.bottomLeft);
    text(".preview-bottom span:last-child", preview.bottomRight);
    text(".floating-icon", preview.badgeIcon);
    text(".floating-label strong", preview.badgeTitle);
    text(".floating-label small", preview.badgeDescription);
    text(".preview-note", preview.note);
    const body = $(".preview-body");
    const src = safeURL(preview.image, true);
    body?.querySelector(".preview-uploaded-image")?.remove();
    body?.classList.toggle("has-custom-image", Boolean(src));
    if (src && body) {
      const img = node("img", "preview-uploaded-image");
      img.src = src;
      img.alt = preview.title || "Imagem principal do projeto";
      body.prepend(img);
    }
    const trust = removeChildren($(".trust-inner"));
    trust?.append(node("span", "", data.trust?.label));
    (data.trust?.items || []).forEach((item, i) => {
      if (i) trust?.append(node("i"));
      trust?.append(node("strong", "", item.text));
    });
  }
  function renderServices(data) {
    const section = data.services;
    text("#servicos .section-eyebrow", section.eyebrow);
    headline("#servicos .section-heading h2", section.title, section.highlight);
    text("#servicos .section-heading > p", section.description);
    const grid = removeChildren($("#servicos .service-grid"));
    (section.items || []).forEach((item, index) => {
      const article = node("article", "service-card");
      const top = node("div", "service-top");
      top.append(node("span", "service-icon", item.icon || "✦"), node("span", "service-number", String(index + 1).padStart(2, "0")));
      article.append(top);
      const src = safeURL(item.image, true);
      if (src) {
        const img = node("img", "service-image");
        img.src = src; img.alt = item.title || "Imagem do serviço"; img.loading = "lazy";
        article.append(img);
      }
      article.append(node("h3", "", item.title), node("p", "", item.text));
      const link = node("a");
      action(link, item.ctaLabel || "Pedir orçamento", whatsapp(data.contact.phone, item.ctaMessage));
      article.append(link);
      grid?.append(article);
    });
  }
  function renderProjects(data) {
    const section = data.projects;
    text("#projetos .section-eyebrow", section.eyebrow);
    headline("#projetos .section-heading h2", section.title, section.highlight);
    text("#projetos .section-heading > p", section.description);
    const grid = removeChildren($("#projetos .project-grid"));
    (section.items || []).forEach((item, index) => {
      const article = node("article", "project-card");
      const presets = ["visual-studio", "visual-shop", "visual-triunexa"];
      const visual = node("div", "project-visual " + (presets.includes(item.visualPreset) ? item.visualPreset : "visual-studio"));
      const visualHeader = node("div", "visual-header");
      visualHeader.append(node("span", "", item.visualHeader), node("span", "", "↗"));
      visual.append(visualHeader);
      const src = safeURL(item.image, true);
      if (src) {
        visual.classList.add("has-project-image");
        const img = node("img", "project-cover");
        img.src = src; img.alt = ""; img.loading = "lazy";
        visual.append(img);
      } else {
        const inner = node("div", "visual-content");
        inner.append(node("span", "visual-mini", item.visualKicker));
        const name = node("strong");
        name.append(document.createTextNode(item.visualName || ""), node("span", "", item.visualAccent || ""));
        inner.append(name);
        if (item.visualPreset === "visual-studio") inner.append(node("div", "visual-rule"));
        if (item.visualPreset === "visual-shop") {
          const mock = node("div", "shop-items");
          mock.append(node("i"), node("i"), node("i")); inner.append(mock);
        }
        inner.append(node("span", "", item.visualSubtitle));
        visual.append(inner);
      }
      const meta = node("div", "project-meta");
      meta.append(node("span", "", item.category), node("span", "", String(index + 1).padStart(2, "0") + " / " + String(section.items.length).padStart(2, "0")));
      const description = node("div", "project-description");
      description.append(node("h3", "", item.title), node("p", "", item.description));
      const link = node("a", "project-link");
      action(link, item.ctaLabel || "Visitar projeto", item.url);
      article.append(visual, meta, description, link);
      grid?.append(article);
    });
    text(".projects-footer p", section.footerText);
    action($(".projects-footer a"), section.footerCtaLabel, section.footerCtaHref);
  }
  function renderAbout(data) {
    const a = data.about;
    text("#sobre .section-eyebrow", a.eyebrow);
    headline("#sobre h2", a.title, a.highlight);
    const body = $("#sobre .about-layout > div:first-child");
    if (body) {
      const paragraphs = body.querySelectorAll("p:not(.section-eyebrow)");
      if (paragraphs[0]) paragraphs[0].textContent = a.paragraph1 || "";
      if (paragraphs[1]) paragraphs[1].textContent = a.paragraph2 || "";
    }
    text(".about-card > span", a.cardHeading);
    const card = $(".about-card");
    if (card) {
      card.querySelector(".about-uploaded-image")?.remove();
      const imgURL = safeURL(a.image, true);
      if (imgURL) {
        const img = node("img", "about-uploaded-image");
        img.src = imgURL; img.alt = "Imagem de apresentação da DS Digital"; img.loading = "lazy";
        card.prepend(img);
      }
      card.querySelectorAll(":scope > div").forEach(el => el.remove());
      const footer = card.querySelector(":scope > p");
      (a.steps || []).forEach((step, i) => {
        const row = node("div");
        row.append(node("span", "", String(i + 1).padStart(2, "0")), node("strong", "", step.text));
        if (footer) card.insertBefore(row, footer); else card.append(row);
      });
      if (footer) footer.textContent = a.cardFooter || "";
    }
  }
  function renderContact(data) {
    const c = data.contact;
    text("#contato .section-eyebrow", c.eyebrow);
    headline("#contato h2", c.title, c.highlight);
    text("#contato .contact-panel p:not(.section-eyebrow)", c.description);
    action($("#contato .btn-primary"), c.ctaLabel, whatsapp(c.phone, c.ctaMessage));
    decoratedText($(".contact-decor > div"), c.decorText);
    text(".contact-decor small", c.decorCaption);
    const panel = $(".contact-panel");
    const image = safeURL(c.backgroundImage, true);
    if (panel) {
      panel.style.backgroundImage = image ? 'linear-gradient(110deg,rgba(14,30,27,.97),rgba(14,30,27,.65)),url("' + image + '")' : "";
      panel.classList.toggle("has-contact-photo", Boolean(image));
    }
  }
  function renderFooter(data) {
    const s = data.site;
    const f = data.footer;
    const brand = $(".footer-brand");
    if (brand) {
      brandLogo(brand, s.footerLogoText || s.logoText, s.logoImage);
      brand.append(document.createTextNode(" "), node("small", "", s.footerBrandSuffix));
    }
    const year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
    const copyright = $(".footer p");
    if (copyright && year) {
      copyright.replaceChildren(document.createTextNode("© "), year, document.createTextNode(" " + String(s.footerCopyright || "")));
    }
    const links = removeChildren($(".footer-links"));
    for (const item of f.links || []) {
      const link = node("a", "", item.label);
      setHref(link, item.url);
      links?.append(link);
    }
  }
  function render(data) {
    if (!data || typeof data !== "object" || data.version !== 1 || !data.site || !data.hero || !data.services || !data.projects || !data.contact || !data.about) return;
    content = data;
    document.title = data.site.title || document.title;
    const desc = $('meta[name="description"]');
    if (desc) desc.content = data.site.description || "";
    const ogTitle = $('meta[property="og:title"]');
    const ogDescription = $('meta[property="og:description"]');
    if (ogTitle) ogTitle.content = data.site.socialTitle || data.site.title || "";
    if (ogDescription) ogDescription.content = data.site.socialDescription || data.site.description || "";
    applyTheme(data.site);
    renderHeader(data);
    renderHero(data);
    renderServices(data);
    renderProjects(data);
    renderAbout(data);
    renderContact(data);
    renderFooter(data);
  }
  document.addEventListener("click", event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const selector = anchor.getAttribute("href");
    if (!selector || selector === "#") return;
    const target = document.getElementById(selector.slice(1));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", selector);
  });
  let previewActive = false;
  window.addEventListener("message", event => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === "DS_DIGITAL_PREVIEW") { previewActive = true; render(event.data.content); }
  });
  fetch(new URL("./content.json", document.baseURI), {cache:"no-store"})
    .then(response => { if (!response.ok) throw Error("Conteúdo indisponível (" + response.status + ")"); return response.json(); })
    .then(data => { if (!previewActive) render(data); })
    .catch(error => console.warn("DS Digital: mantendo conteúdo HTML original.", error));
})();
