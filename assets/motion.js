/* Motion layer. Progressive enhancement only: the page is complete without this file.
   Loaded with defer after GSAP + ScrollTrigger (+ Lenis). Does nothing under prefers-reduced-motion. */
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { window.__heroScrub = false; window.__hero && window.__hero.kick(); return; }

  const root = document.documentElement;
  const fine = matchMedia("(pointer: fine)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add("motion");

  /* ---------- Smooth scroll (mouse/trackpad only; touch keeps native scrolling) ---------- */
  let lenis = null;
  if (fine && window.Lenis) {
    lenis = new Lenis({ lerp: 0.11 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const barH = () => ($(".bar") ? $(".bar").offsetHeight : 0);
  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(t, { offset: -barH(), duration: 1.4 });
    else t.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", id);
  }));

  /* ---------- Scroll progress hairline under the top bar ---------- */
  gsap.to(".progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

  /* ---------- Hero: pin, draw the rest of the line, pull the name apart ---------- */
  const hero = $(".hero");
  const mm = gsap.matchMedia();
  mm.add({ wide: "(min-width: 701px)", narrow: "(max-width: 700px)" }, ctx => {
    if (ctx.conditions.narrow) {
      // Phones: no pinning; the line draws itself on load, the name drifts a little.
      window.__heroScrub = false; window.__hero.setScroll(0); window.__hero.kick();
      gsap.to(".name", { yPercent: -12, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
      return;
    }
    window.__heroScrub = true;
    // Pin once the whole chart is on screen (immediately if the hero fits).
    const pin = ScrollTrigger.create({
      trigger: hero,
      start: () => (hero.offsetHeight > innerHeight - barH() ? "bottom bottom" : `top ${barH()}px`),
      end: "+=80%",
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true
    });
    const draw = { p: 0 };
    gsap.to(draw, {
      p: 1, ease: "none",
      onUpdate: () => window.__hero.setScroll(draw.p),
      scrollTrigger: { start: 0, end: () => pin.end, scrub: 0.6, invalidateOnRefresh: true }
    });
    const tl = gsap.timeline({ scrollTrigger: { start: 0, end: () => pin.end, scrub: 0.8, invalidateOnRefresh: true } });
    tl.to(".name .row:first-child", { xPercent: -2.5, ease: "none" }, 0)
      .to(".name .row:last-child", { xPercent: 4, ease: "none" }, 0)
      .to(".hero-meta", { opacity: 0.35, ease: "none" }, 0);
    return () => { window.__hero.setScroll(0); };
  });

  /* ---------- Ticker: GSAP loop that speeds up with scroll velocity ---------- */
  const track = $("#ticker");
  if (track) {
    const loop = gsap.to(track, { xPercent: -50, duration: 48, ease: "none", repeat: -1 });
    let boost = gsap.to({}, {});
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: self => {
        const v = Math.min(6, 1 + Math.abs(self.getVelocity()) / 350);
        boost.kill();
        loop.timeScale(v);
        boost = gsap.to(loop, { timeScale: 1, duration: 1.2, ease: "power2.out" });
      }
    });
    track.parentElement.addEventListener("mouseenter", () => loop.pause());
    track.parentElement.addEventListener("mouseleave", () => loop.play());
  }

  /* ---------- Section headings: masked line reveal ---------- */
  $$(".sec-head h2").forEach(h2 => {
    h2.innerHTML = h2.innerHTML.split(/<br\s*\/?>/i).map(l => `<span class="ln"><span class="ln-i">${l}</span></span>`).join("");
    const label = $(".mono", h2.parentElement);
    const tl = gsap.timeline({ scrollTrigger: { trigger: h2, start: "top 88%" } });
    tl.from($$(".ln-i", h2), { yPercent: 105, rotate: 2, duration: 1.1, ease: "expo.out", stagger: 0.09 });
    if (label) tl.from(label, { opacity: 0, x: 16, duration: 0.7, ease: "power2.out" }, 0.25);
  });

  /* ---------- About statement: words light up as you read ---------- */
  const stmt = $(".statement p");
  if (stmt) {
    const wrapWords = node => {
      Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) wrapWords(n);
      });
    };
    wrapWords(stmt);
    gsap.fromTo($$(".w", stmt), { opacity: 0.14 }, {
      opacity: 1, ease: "none", stagger: 0.1,
      scrollTrigger: { trigger: stmt, start: "top 82%", end: "bottom 50%", scrub: true }
    });
  }

  /* ---------- Blotter rows, CapDeploy terminal, desk columns, contact ---------- */
  gsap.from(".blotter-head, .trade", {
    y: 28, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.08,
    scrollTrigger: { trigger: ".blotter", start: "top 85%" }
  });
  gsap.from(".case-copy > *", {
    y: 24, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.07,
    scrollTrigger: { trigger: ".case", start: "top 80%" }
  });
  gsap.from(".term", {
    clipPath: "inset(0 0 100% 0)", duration: 1.2, ease: "expo.inOut",
    scrollTrigger: { trigger: ".term", start: "top 85%" },
    onComplete: () => gsap.set(".term", { clearProps: "clipPath" })
  });
  $$(".desk > div").forEach((col, i) => {
    const big = $(".big", col);
    if (big) { big.innerHTML = `<span class="ln"><span class="ln-i">${big.innerHTML}</span></span>`; }
    gsap.timeline({ scrollTrigger: { trigger: ".desk", start: "top 82%" } })
      .from($(".ln-i", col), { yPercent: 105, duration: 1, ease: "expo.out" }, i * 0.12)
      .from($$(".mono, p", col), { opacity: 0, y: 12, duration: 0.7, ease: "power2.out", stagger: 0.06 }, i * 0.12 + 0.2);
  });
  // .talk spans have a CSS transform transition for hover; it is switched off (.motion) until the reveal ends.
  gsap.from(".talk > span", {
    yPercent: 60, opacity: 0, rotate: 3, duration: 1.1, ease: "expo.out", stagger: 0.1,
    scrollTrigger: { trigger: ".talk", start: "top 88%" },
    onComplete: () => { gsap.set(".talk > span", { clearProps: "transform,opacity" }); $(".talk").classList.add("revealed"); }
  });
  gsap.from(".links a", {
    y: 16, opacity: 0, duration: 0.6, ease: "power2.out", stagger: 0.06,
    scrollTrigger: { trigger: ".links", start: "top 92%" }
  });

  /* ---------- Cursor + magnetic buttons (mouse only) ---------- */
  if (fine) {
    const dot = document.createElement("div"), ring = document.createElement("div"), lab = document.createElement("span");
    dot.className = "cursor-dot"; ring.className = "cursor-ring"; ring.appendChild(lab);
    dot.setAttribute("aria-hidden", "true"); ring.setAttribute("aria-hidden", "true");
    document.body.append(ring, dot);
    root.classList.add("has-cursor");
    const dx = gsap.quickTo(dot, "x", { duration: 0.08 }), dy = gsap.quickTo(dot, "y", { duration: 0.08 });
    const rx = gsap.quickTo(ring, "x", { duration: 0.38, ease: "power3" }), ry = gsap.quickTo(ring, "y", { duration: 0.38, ease: "power3" });
    addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse") return;
      root.classList.add("cursor-on");
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    }, { passive: true });
    document.addEventListener("mouseleave", () => root.classList.remove("cursor-on"));
    addEventListener("pointerdown", () => gsap.to(ring, { scale: 0.82, duration: 0.15 }));
    addEventListener("pointerup", () => gsap.to(ring, { scale: 1, duration: 0.3, ease: "back.out(3)" }));
    const interactive = 'a, button, input[type="range"], [data-cursor]';
    document.addEventListener("pointerover", e => {
      const t = e.target.closest(interactive);
      if (!t) { ring.classList.remove("is-hover", "has-label"); dot.classList.remove("is-hidden"); return; }
      let text = t.dataset.cursor || (t.type === "range" ? "Drag" : "");
      if (t.classList.contains("trade-sum")) text = t.getAttribute("aria-expanded") === "true" ? "Close" : "Open";
      lab.textContent = text;
      ring.classList.toggle("has-label", !!text);
      ring.classList.toggle("is-hover", !text);
      dot.classList.toggle("is-hidden", !!text);
    });
    document.addEventListener("click", e => {
      const t = e.target.closest(".trade-sum");
      if (t) lab.textContent = t.getAttribute("aria-expanded") === "true" ? "Close" : "Open";
    });

    $$(".cta, .links a, .mode button").forEach(el => {
      const mx = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" }), my = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.25); my((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener("pointerleave", () => { mx(0); my(0); });
    });
  }

  /* Layout can shift when web fonts arrive; re-measure triggers then. */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener("load", () => ScrollTrigger.refresh());
})();
