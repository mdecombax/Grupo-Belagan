/* =========================================================
   GRUPO BELEGAN — main.js
   Header scroll · menú móvil · reveals · carrusel ·
   contadores · favoritos · formulario de contacto
   Codificado de forma defensiva (if element por todos lados).
   ========================================================= */
(function () {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* Estado interno inspeccionable desde la consola */
  const state = {
    headerScrolled: false,
    navOpen: false,
    revealed: 0,
    countersDone: false,
  };
  window.debug = window.debug || {};
  window.debug.belegan = { state };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    setupHeaderScroll();
    setupMobileNav();
    setupReveals();
    setupCarousel();
    setupFavorites();
    setupCatalog();
    setupPropertyDetail();
    setupContactForm();
    log("init OK");
  }

  /* ---------- Header: transparente -> sólido ---------- */
  function setupHeaderScroll() {
    const header = $("#site-header");
    if (!header) return log("⚠ #site-header ausente");
    const onScroll = () => {
      const scrolled = window.scrollY > 40;
      if (scrolled !== state.headerScrolled) {
        state.headerScrolled = scrolled;
        header.classList.toggle("scrolled", scrolled);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Menú móvil ---------- */
  function setupMobileNav() {
    const toggle = $("#nav-toggle");
    const nav = $("#main-nav");
    if (!toggle || !nav) return log("⚠ nav móvil incompleto");

    const setOpen = (open) => {
      state.navOpen = open;
      nav.classList.toggle("open", open);
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    };

    toggle.addEventListener("click", () => setOpen(!state.navOpen));
    $$(".nav-link", nav).forEach((a) =>
      a.addEventListener("click", () => setOpen(false))
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && state.navOpen) setOpen(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function setupReveals() {
    const items = $$("[data-reveal]");
    if (!items.length) return;

    // Escalonar elementos dentro del mismo grupo
    items.forEach((el) => {
      const parent = el.parentElement;
      if (!parent) return;
      const siblings = $$("[data-reveal]", parent);
      const idx = siblings.indexOf(el);
      if (idx > 0) el.style.setProperty("--reveal-delay", (idx * 0.08).toFixed(2) + "s");
    });

    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          state.revealed++;
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => io.observe(el));

    setupCounters(io);
  }

  /* ---------- Contadores animados ---------- */
  function setupCounters(io) {
    const nums = $$(".stat-num[data-count]");
    if (!nums.length) return;

    const run = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      const dur = 1300;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased).toLocaleString("es-MX") + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          run(entry.target);
          co.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    nums.forEach((n) => co.observe(n));
    state.countersDone = true;
  }

  /* ---------- Carrusel propiedades ---------- */
  function setupCarousel() {
    const track = $("#featured-track");
    const prev = $("#feat-prev");
    const next = $("#feat-next");
    if (!track || !prev || !next) return log("⚠ carrusel incompleto");

    const amount = () => {
      const card = $(".prop-card", track);
      const gap = parseFloat(getComputedStyle(track).columnGap || "24") || 24;
      return card ? card.getBoundingClientRect().width + gap : 320;
    };

    const update = () => {
      const max = track.scrollWidth - track.clientWidth - 4;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= max;
    };

    prev.addEventListener("click", () => track.scrollBy({ left: -amount(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: amount(), behavior: "smooth" }));
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- Favoritos (visual) — delegación global ---------- */
  function setupFavorites() {
    // Un solo listener cubre tarjetas estáticas y las generadas por JS.
    document.addEventListener("click", (e) => {
      const fav = e.target.closest(".prop-fav");
      if (!fav) return;
      e.preventDefault();
      fav.classList.toggle("is-active");
    });
  }

  /* =========================================================
     DATOS + HELPERS COMPARTIDOS (catálogo · ficha · similares)
     Los datos viven en js/data.js -> window.BELEGAN_PROPERTIES
     ========================================================= */
  const getProperties = () => (Array.isArray(window.BELEGAN_PROPERTIES) ? window.BELEGAN_PROPERTIES : []);

  const money = (n) => "$" + Number(n || 0).toLocaleString("es-MX");
  const priceHTML = (p) => p.op === "renta"
    ? `<p class="prop-price">${money(p.price)} <span>MXN/mes</span></p>`
    : `<p class="prop-price">${money(p.price)} MXN</p>`;

  // Acepta URL completa (https://...), ruta local (assets/...) o un ID de foto de Unsplash.
  const photoURL = (ref, w) => {
    if (!ref) return "";
    return /^https?:/.test(ref) || ref.includes("/")
      ? ref
      : `https://images.unsplash.com/photo-${ref}?auto=format&fit=crop&w=${w}&q=70`;
  };
  const cover = (p, w) => photoURL((p.photos && p.photos[0]) || "", w);

  const ICON_BED  = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 12V7a2 2 0 012-2h14a2 2 0 012 2v5M3 12h18M3 12v6M21 12v6M6 12V9h5v3"/></svg>';
  const ICON_BATH = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h16v3a4 4 0 01-4 4H8a4 4 0 01-4-4v-3zM7 12V6a2 2 0 012-2 2 2 0 012 2"/></svg>';
  const ICON_AREA = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h4M3 15h4M9 3v4M15 3v4"/></svg>';
  const ICON_CAR  = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 13l1.5-4.5A2 2 0 018.4 7h7.2a2 2 0 011.9 1.5L19 13M5 13h14v4H5zM7 17v2M17 17v2"/><circle cx="8" cy="15" r="0"/></svg>';
  const ICON_HEART = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-4.35-9.5-8.5C.5 9 2.5 5.5 6 5.5c2 0 3.2 1.2 4 2.5.8-1.3 2-2.5 4-2.5 3.5 0 5.5 3.5 3.5 7C19 16.65 12 21 12 21z"/></svg>';
  const ICON_ARROW = '<svg class="ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const ICON_CHECK = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';

  const specsHTML = (p) => {
    if (p.tipo === "Terreno") {
      return `<ul class="prop-specs prop-specs--land"><li>${ICON_AREA} ${p.m2} m²</li></ul>`;
    }
    const items = [];
    if (p.beds)  items.push(`<li>${ICON_BED} ${p.beds}</li>`);
    if (p.baths) items.push(`<li>${ICON_BATH} ${p.baths}</li>`);
    items.push(`<li>${ICON_AREA} ${p.m2} m²</li>`);
    return `<ul class="prop-specs">${items.join("")}</ul>`;
  };

  // Tarjeta usada por el catálogo y por "propiedades similares".
  const propCardHTML = (p) => {
    const tag = p.op === "renta"
      ? '<span class="prop-tag prop-tag--rent">Renta</span>'
      : '<span class="prop-tag">Venta</span>';
    return `
      <article class="prop-card">
        <div class="prop-media" style="background-image:url('${cover(p, 800)}')">
          ${tag}
          <button class="prop-fav" type="button" aria-label="Guardar propiedad">${ICON_HEART}</button>
        </div>
        <div class="prop-body">
          <p class="prop-loc">${p.zona}, ${p.ciudad || "Querétaro"}</p>
          <h3 class="prop-name">${p.name}</h3>
          ${specsHTML(p)}
          ${priceHTML(p)}
          <span class="prop-more">Ver detalles ${ICON_ARROW}</span>
        </div>
        <a class="stretched-link" href="propiedad.html?id=${encodeURIComponent(p.id)}" aria-label="Ver ${p.name}"></a>
      </article>`;
  };

  // Anima la entrada de tarjetas recién insertadas (el observer global no las ve).
  const revealCards = (container) => {
    const cards = $$(".prop-card", container);
    requestAnimationFrame(() => {
      cards.forEach((c, i) => {
        c.style.transitionDelay = (Math.min(i, 8) * 0.05).toFixed(2) + "s";
        c.classList.add("is-in");
      });
    });
  };

  /* ---------- Catálogo de propiedades ---------- */
  function setupCatalog() {
    const grid = $("#catalog-grid");
    if (!grid) return; // No estamos en propiedades.html

    const seg     = $("#op-seg");
    const selTipo = $("#filter-tipo");
    const selZona = $("#filter-zona");
    const selOrden= $("#filter-orden");
    const count   = $("#catalog-count");
    const empty   = $("#catalog-empty");
    const DATA    = getProperties();

    const filters = { op: "all", tipo: "all", zona: "all", orden: "destacados" };

    // Operación inicial desde la URL (?op=venta|renta)
    const params = new URLSearchParams(window.location.search);
    const opParam = (params.get("op") || "").toLowerCase();
    if (opParam === "venta" || opParam === "renta") filters.op = opParam;

    // Poblar el selector de zonas a partir de los datos
    if (selZona) {
      [...new Set(DATA.map((p) => p.zona))].sort((a, b) => a.localeCompare(b, "es"))
        .forEach((z) => {
          const o = document.createElement("option");
          o.value = z; o.textContent = z;
          selZona.appendChild(o);
        });
    }

    // Reflejar el estado inicial en los controles
    if (seg) $$(".seg-btn", seg).forEach((b) =>
      b.classList.toggle("is-active", b.dataset.op === filters.op));

    const apply = () => {
      let list = DATA.filter((p) =>
        (filters.op === "all" || p.op === filters.op) &&
        (filters.tipo === "all" || p.tipo === filters.tipo) &&
        (filters.zona === "all" || p.zona === filters.zona));

      if (filters.orden === "price-asc")  list = list.slice().sort((a, b) => a.price - b.price);
      if (filters.orden === "price-desc") list = list.slice().sort((a, b) => b.price - a.price);

      grid.innerHTML = list.map(propCardHTML).join("");

      if (count) {
        count.textContent = list.length === 0 ? "Sin resultados"
          : list.length === 1 ? "1 propiedad disponible"
          : `${list.length} propiedades disponibles`;
      }
      if (empty) empty.hidden = list.length !== 0;

      revealCards(grid);
      log("catálogo:", list.length, "resultados", filters);
    };

    // Interacciones
    if (seg) seg.addEventListener("click", (e) => {
      const btn = e.target.closest(".seg-btn");
      if (!btn) return;
      filters.op = btn.dataset.op;
      $$(".seg-btn", seg).forEach((b) => b.classList.toggle("is-active", b === btn));
      apply();
    });
    if (selTipo)  selTipo.addEventListener("change",  () => { filters.tipo = selTipo.value; apply(); });
    if (selZona)  selZona.addEventListener("change",  () => { filters.zona = selZona.value; apply(); });
    if (selOrden) selOrden.addEventListener("change", () => { filters.orden = selOrden.value; apply(); });

    apply();
  }

  /* ---------- Ficha de detalle (propiedad.html) ---------- */
  function setupPropertyDetail() {
    const root = $("#detail-root");
    if (!root) return; // No estamos en propiedad.html

    const id = new URLSearchParams(window.location.search).get("id");
    const DATA = getProperties();
    const p = DATA.find((x) => x.id === id);

    if (!p) {
      root.innerHTML = `
        <section class="section container detail-notfound">
          <h1>Propiedad no encontrada</h1>
          <p>Es posible que la propiedad ya no esté disponible o que el enlace sea incorrecto.</p>
          <a class="btn btn-primary" href="propiedades.html">Ver todo el catálogo ${ICON_ARROW}</a>
        </section>`;
      log("⚠ detalle: id no encontrado", id);
      return;
    }
    document.title = `${p.name} — Grupo Belegan`;

    const ciudad = p.ciudad || "Querétaro";
    const photos = Array.isArray(p.photos) ? p.photos : [];

    const thumbs = photos.length > 1
      ? `<div class="gal-thumbs">${photos.map((ph, i) =>
          `<button class="gal-thumb${i === 0 ? " is-active" : ""}" type="button"
             data-full="${photoURL(ph, 1600)}"
             style="background-image:url('${photoURL(ph, 400)}')"
             aria-label="Foto ${i + 1}"></button>`).join("")}</div>`
      : "";

    const spec = (ico, val, label) =>
      `<div class="dspec"><span class="dspec-ico">${ico}</span><b>${val}</b><span>${label}</span></div>`;
    const specs = [];
    if (p.beds)    specs.push(spec(ICON_BED,  p.beds,  p.beds > 1 ? "Recámaras" : "Recámara"));
    if (p.baths)   specs.push(spec(ICON_BATH, p.baths, "Baños"));
    if (p.parking) specs.push(spec(ICON_CAR,  p.parking, p.parking > 1 ? "Estacionamientos" : "Estacionamiento"));
    if (p.m2)      specs.push(spec(ICON_AREA, `${p.m2} m²`, "Superficie"));

    const features = (p.features || []).length
      ? `<h2 class="detail-h">Características</h2>
         <ul class="detail-features">${p.features.map((f) => `<li>${ICON_CHECK} ${f}</li>`).join("")}</ul>`
      : "";

    const tag = p.op === "renta"
      ? '<span class="prop-tag prop-tag--rent">Renta</span>'
      : '<span class="prop-tag">Venta</span>';

    // Similares: mismo tipo o zona, excluyendo la actual (máx. 3)
    const similar = DATA.filter((x) => x.id !== p.id && (x.tipo === p.tipo || x.zona === p.zona)).slice(0, 3);
    const similarBlock = similar.length
      ? `<section class="detail-similar section">
           <div class="container">
             <p class="eyebrow">También te puede interesar</p>
             <h2 class="section-title">Propiedades similares</h2>
             <div class="catalog-grid" id="similar-grid">${similar.map(propCardHTML).join("")}</div>
           </div>
         </section>`
      : "";

    root.innerHTML = `
      <nav class="detail-crumbs" aria-label="Ruta de navegación">
        <div class="container">
          <a href="index.html">Inicio</a> <span>/</span>
          <a href="propiedades.html">Propiedades</a> <span>/</span>
          <span class="current">${p.name}</span>
        </div>
      </nav>

      <section class="detail-gallery">
        <div class="container">
          <div class="gal-main" id="gal-main" style="background-image:url('${cover(p, 1600)}')">${tag}</div>
          ${thumbs}
        </div>
      </section>

      <section class="detail-body section">
        <div class="container detail-grid">
          <div class="detail-main">
            <p class="prop-loc">${p.zona}, ${ciudad}</p>
            <h1 class="detail-title">${p.name}</h1>
            <div class="detail-specs">${specs.join("")}</div>
            <h2 class="detail-h">Descripción</h2>
            <p class="detail-desc">${p.description || ""}</p>
            ${features}
          </div>

          <aside class="detail-aside">
            <div class="detail-price-card">
              <span class="dp-op">En ${p.op}</span>
              ${priceHTML(p)}
              <a class="btn btn-primary dp-cta" href="contacto.html">
                Agendar visita ${ICON_ARROW}
              </a>
              <p class="dp-note">Asesoría sin costo · Te respondemos el mismo día.</p>
            </div>
          </aside>
        </div>
      </section>

      ${similarBlock}`;

    // Galería: cambiar imagen principal al hacer clic en una miniatura
    const main = $("#gal-main", root);
    $$(".gal-thumb", root).forEach((t) => {
      t.addEventListener("click", () => {
        if (main) main.style.backgroundImage = `url('${t.dataset.full}')`;
        $$(".gal-thumb", root).forEach((x) => x.classList.toggle("is-active", x === t));
      });
    });

    if (similar.length) revealCards($("#similar-grid", root));
    log("detalle:", p.id);
  }

  /* ---------- Formulario de contacto ---------- */
  function setupContactForm() {
    const form = $("#contact-form");
    const status = $("#form-status");
    if (!form) return log("⚠ #contact-form ausente");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (status) { status.textContent = ""; status.className = "form-status"; }

      const required = $$("[required]", form);
      let firstInvalid = null;
      required.forEach((el) => {
        const field = el.closest(".field");
        const ok = el.value && el.value.trim() !== "" &&
          (el.type !== "email" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value));
        if (field) field.classList.toggle("invalid", !ok);
        if (!ok && !firstInvalid) firstInvalid = el;
      });

      if (firstInvalid) {
        if (status) { status.textContent = "Por favor completa los campos requeridos."; status.classList.add("err"); }
        firstInvalid.focus();
        return;
      }

      // Sin backend todavía: confirmamos y registramos.
      const data = Object.fromEntries(new FormData(form).entries());
      log("Formulario enviado", data);
      if (status) { status.textContent = "¡Gracias! Te contactaremos en menos de 24 horas."; status.classList.add("ok"); }
      form.reset();
    });

    // Quitar estado inválido al escribir
    $$("input, select, textarea", form).forEach((el) =>
      el.addEventListener("input", () => {
        const field = el.closest(".field");
        if (field) field.classList.remove("invalid");
      })
    );
  }

  function log(...args) {
    if (window.BELEGAN_DEBUG) console.log("[belegan]", ...args);
  }
})();
