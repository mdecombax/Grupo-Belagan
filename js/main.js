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
    // La intro solo suena si el index es la primera página de la sesión
    try { sessionStorage.setItem("belegan-visited", "1"); } catch (e) {}
    // Listener vacío: habilita los estados :active al tacto (iOS sobre todo)
    document.addEventListener("touchstart", () => {}, { passive: true });
    setupHeaderScroll();
    setupMobileNav();
    setupIntro();
    setupHeroParallax();
    setupReveals();
    setupFeatured();
    setupCarousel();
    setupFavorites();
    setupCatalog();
    setupPropertyDetail();
    setupContactForm();
    setupMagneticButtons(); // después: incluye botones generados por JS
    setupViewTransitions();
    log("init OK");
  }

  /* ---------- Intro cinematográfica + coreografía del hero ---------- */
  function setupIntro() {
    const html = document.documentElement;
    const heroReady = () =>
      requestAnimationFrame(() => requestAnimationFrame(() => html.classList.add("hero-ready")));

    if (!html.classList.contains("has-intro")) {
      // Sin intro (sesión ya vista, reduced-motion o página interior):
      // la coreografía del hero arranca de inmediato.
      if (html.classList.contains("anim")) heroReady();
      return;
    }

    const intro = $("#intro");
    if (!intro) { heroReady(); return; }

    let opened = false;
    const open = () => {
      if (opened) return;
      opened = true;
      html.classList.add("intro-open");
      setTimeout(heroReady, 200); // el hero entra mientras el telón sube
      const done = () => {
        if (intro.isConnected) intro.remove();
        html.classList.add("intro-done");
      };
      intro.addEventListener("transitionend", done, { once: true });
      setTimeout(done, 1400); // red de seguridad si transitionend no llega
      log("intro: telón abierto");
    };

    setTimeout(open, 2000);          // fin natural de la animación del logo
    intro.addEventListener("click", open); // tocar = saltar la intro
  }

  /* ---------- Parallax sutil del hero (solo desktop) ---------- */
  function setupHeroParallax() {
    const bg = $(".hero-bg");
    if (!bg) return; // No estamos en index.html
    if (!document.documentElement.classList.contains("anim")) return;
    if (window.matchMedia("(max-width: 760px)").matches) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        bg.style.transform = `translate3d(0, ${(y * 0.16).toFixed(1)}px, 0) scale(1.08)`;
      }
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
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
      // Los títulos se revelan con máscara (clip) en vez de simple fundido
      if (el.matches(".section-title, .credits-title")) el.classList.add("reveal-mask");
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

  /* ---------- Propiedades destacadas (index.html) ---------- */
  function setupFeatured() {
    const track = $("#featured-track");
    if (!track) return; // No estamos en index.html
    const DATA = getProperties();
    if (!DATA.length) {
      const section = track.closest("section");
      if (section) section.hidden = true;
      return log("⚠ destacadas: sin datos, sección oculta");
    }
    track.innerHTML = DATA.slice(0, 4).map(propCardHTML).join("");
    revealCards(track);
    log("destacadas:", Math.min(DATA.length, 4), "tarjetas");
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
  // El importe va en <b data-price> para poder animarlo al entrar en pantalla
  const priceHTML = (p) => p.op === "renta"
    ? `<p class="prop-price"><b class="price-num" data-price="${p.price}">${money(p.price)}</b> <span>MXN/mes</span></p>`
    : `<p class="prop-price"><b class="price-num" data-price="${p.price}">${money(p.price)}</b> MXN</p>`;

  // Acepta URL completa (https://...), ruta local (assets/...) o un ID de foto de Unsplash.
  // Para rutas locales con w <= 800 se usa la variante ligera "-thumb.jpeg"
  // (generada a 640px: tarjetas y miniaturas cargan ~10x menos peso).
  const photoURL = (ref, w) => {
    if (!ref) return "";
    if (/^https?:/.test(ref)) return ref;
    if (ref.includes("/")) {
      return w && w <= 800 ? ref.replace(/\.(jpe?g|png|webp)$/i, "-thumb.jpeg") : ref;
    }
    return `https://images.unsplash.com/photo-${ref}?auto=format&fit=crop&w=${w}&q=70`;
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
        <div class="prop-media">
          <span class="prop-media-img" data-bg="${cover(p, 800)}"></span>
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
    observePrices(container);
    lazyBackgrounds(container);
  };

  /* ---------- Fondos perezosos: la imagen se carga al acercarse ---------- */
  let bgObserver = null;
  function lazyBackgrounds(ctx) {
    const els = $$("[data-bg]", ctx || document);
    if (!els.length) return;
    const load = (el) => {
      el.style.backgroundImage = `url('${el.dataset.bg}')`;
      el.removeAttribute("data-bg");
    };
    if (!("IntersectionObserver" in window)) return els.forEach(load);
    if (!bgObserver) {
      bgObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          load(entry.target);
          bgObserver.unobserve(entry.target);
        });
      }, { rootMargin: "400px 400px" }); // margen: cargadas antes de ser visibles
    }
    els.forEach((el) => bgObserver.observe(el));
  }

  /* ---------- Precios que cuentan al entrar en pantalla ---------- */
  let priceObserver = null;
  function observePrices(ctx) {
    const nums = $$(".price-num[data-price]", ctx || document);
    if (!nums.length) return;
    // Sin animaciones (reduced-motion o sin IO): el precio ya está completo
    if (!document.documentElement.classList.contains("anim")) return;
    if (!("IntersectionObserver" in window)) return;

    const run = (el) => {
      const target = parseInt(el.dataset.price, 10) || 0;
      const dur = 900;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = money(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!priceObserver) {
      priceObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          run(entry.target);
          priceObserver.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
    }
    nums.forEach((n) => priceObserver.observe(n));
  }

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
             data-bg="${photoURL(ph, 400)}"
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
          <div class="gal-main" id="gal-main">
            <span class="gal-main-img" id="gal-main-img" style="background-image:url('${cover(p, 1600)}')"></span>
            ${tag}
          </div>
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
    const mainImg = $("#gal-main-img", root);
    $$(".gal-thumb", root).forEach((t) => {
      t.addEventListener("click", () => {
        if (mainImg) mainImg.style.backgroundImage = `url('${t.dataset.full}')`;
        $$(".gal-thumb", root).forEach((x) => x.classList.toggle("is-active", x === t));
      });
    });

    if (similar.length) revealCards($("#similar-grid", root));
    observePrices($(".detail-aside", root));
    lazyBackgrounds(root);
    log("detalle:", p.id);
  }

  /* =========================================================
     TRANSICIONES DE PÁGINA (View Transitions cross-document)
     La foto de la tarjeta se expande hasta ser el hero de la
     ficha (y se repliega al volver). El nombre "prop-hero" se
     asigna dinámicamente en pageswap/pagereveal; en la ficha
     lo lleva #gal-main vía CSS. Navegadores sin soporte:
     navegación normal.
     ========================================================= */
  function setupViewTransitions() {
    if (!("onpageswap" in window)) return log("view transitions: sin soporte");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // ?id= de una URL de ficha (o null si no es propiedad.html)
    const idFromURL = (url) => {
      try {
        const u = new URL(url, window.location.href);
        return /propiedad\.html$/.test(u.pathname) ? u.searchParams.get("id") : null;
      } catch { return null; }
    };

    // Foto de la tarjeta que enlaza a la propiedad `id` en la página actual
    const mediaForId = (id) => {
      if (!id) return null;
      const link = $$(".prop-card .stretched-link").find((a) => idFromURL(a.href) === id);
      return link ? $(".prop-media", link.closest(".prop-card")) : null;
    };

    const nameTemp = (el) => {
      el.style.viewTransitionName = "prop-hero";
      el.dataset.vtTemp = "1";
    };
    // Limpia nombres temporales; #gal-main recupera su nombre de CSS
    const clearTemp = () => $$("[data-vt-temp]").forEach((el) => {
      el.style.viewTransitionName = "";
      delete el.dataset.vtTemp;
    });

    // Página saliente: nombrar la foto de la tarjeta hacia la que navegamos
    window.addEventListener("pageswap", (e) => {
      if (!e.viewTransition) return;
      if (reduceMotion.matches) return e.viewTransition.skipTransition();
      clearTemp();
      const toId = idFromURL((e.activation && e.activation.entry && e.activation.entry.url) || "");
      const media = mediaForId(toId);
      if (media) {
        // Ficha -> ficha similar: el hero cede el nombre a la tarjeta
        const hero = $("#gal-main");
        if (hero) { hero.style.viewTransitionName = "none"; hero.dataset.vtTemp = "1"; }
        nameTemp(media);
        log("pageswap: morph hacia", toId);
      }
    });

    // Página entrante: nombrar la tarjeta de la propiedad de la que venimos
    window.addEventListener("pagereveal", (e) => {
      if (!e.viewTransition) return;
      if (reduceMotion.matches) return e.viewTransition.skipTransition();
      document.body.classList.add("vt-nav"); // p. ej. sin re-pop del botón WhatsApp
      clearTemp();
      const fromId = idFromURL((e.activation && e.activation.from && e.activation.from.url) || "");
      if (fromId && !$("#detail-root")) {
        const media = mediaForId(fromId);
        if (media) { nameTemp(media); log("pagereveal: morph desde", fromId); }
      }
      e.viewTransition.finished.then(clearTemp).catch(() => {});
    });
  }

  /* ---------- Botones magnéticos (solo puntero fino) ---------- */
  function setupMagneticButtons() {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (!document.documentElement.classList.contains("anim")) return;
    const STRENGTH = 7;
    $$(".btn").forEach((btn) => {
      // .is-magnet acorta la transición de transform durante el seguimiento;
      // al salir se retira -> retorno suave con la transición normal (--t)
      btn.addEventListener("mouseenter", () => btn.classList.add("is-magnet"));
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        btn.style.transform = `translate(${(x * STRENGTH).toFixed(1)}px, ${(y * STRENGTH).toFixed(1)}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.classList.remove("is-magnet");
        btn.style.transform = "";
      });
    });
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
