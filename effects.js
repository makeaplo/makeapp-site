/* 首页动效 v7（Apple 质感）：滚动渐入 + 乱码解码入场 + Hero 3D 视差 + 数据条数字弹射 + 卡片追光 + 终端光标
 * 全部尊重 prefers-reduced-motion
 */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var doc = document;

  /* ---------- ⓪ 滚动渐入（Apple 式 section 淡入上移） ---------- */
  (function scrollReveal() {
    var els = doc.querySelectorAll('section, .statbar, .bento, .cl-now, .cl-item, .contact-row');
    if (!els.length) return;
    els.forEach(function (el) {
      el.classList.add('reveal');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- ⓪·5 卡片追光 + 3D 倾斜（鼠标跟随） ---------- */
  (function cardSpotlight() {
    var cards = doc.querySelectorAll('.card');
    if (!cards.length) return;
    if (window.matchMedia('(pointer: coarse)').matches) return; // 触摸屏不做
    cards.forEach(function (card) {
      var raf = null;
      card.addEventListener('mousemove', function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var mx = ((e.clientX - r.left) / r.width) * 100;
          var my = ((e.clientY - r.top) / r.height) * 100;
          card.style.setProperty('--mx', mx.toFixed(2) + '%');
          card.style.setProperty('--my', my.toFixed(2) + '%');
          var dx = (e.clientX - r.left) / r.width - 0.5;
          var dy = (e.clientY - r.top) / r.height - 0.5;
          card.style.setProperty('--rx', (dy * -4).toFixed(2) + 'deg');
          card.style.setProperty('--ry', (dx * 6).toFixed(2) + 'deg');
          raf = null;
        });
      });
      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  })();

  /* ---------- ⓪·6 Hero 滚动淡出 + 滚动进度条 ---------- */
  (function scrollFx() {
    var hero = doc.querySelector('.hero');
    var bar = doc.createElement('div');
    bar.className = 'scroll-progress';
    doc.body.appendChild(bar);
    var ticking = false;
    function update() {
      var y = window.scrollY;
      var h = doc.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, y / h) : 0;
      bar.style.width = (p * 100).toFixed(2) + '%';
      if (hero) {
        var fade = Math.min(1, y / (window.innerHeight * 0.9));
        // 直接写 inline（CSS calc 里 var*数 兼容性不稳）
        hero.style.opacity = (1 - fade * 0.55).toFixed(3);
        hero.style.transform = 'translateY(' + (-fade * 30).toFixed(1) + 'px)';
      }
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* ---------- ① Hero 3D 鼠标视差 ---------- */
  (function heroTilt() {
    var hero = doc.querySelector('.hero');
    var h1 = doc.querySelector('.hero h1');
    if (!hero || !h1) return;
    if (window.matchMedia('(pointer: coarse)').matches) return; // 触摸屏不做
    var raf = null;
    hero.addEventListener('mousemove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var r = hero.getBoundingClientRect();
        var dx = (e.clientX - r.left) / r.width - 0.5;
        var dy = (e.clientY - r.top) / r.height - 0.5;
        h1.style.setProperty('--rx', (dy * -10).toFixed(2) + 'deg');
        h1.style.setProperty('--ry', (dx * 12).toFixed(2) + 'deg');
        raf = null;
      });
    });
    hero.addEventListener('mouseleave', function () {
      h1.style.setProperty('--rx', '0deg');
      h1.style.setProperty('--ry', '0deg');
    });
  })();

  /* ---------- ③ 数据条数字弹射（滚入视口触发一次） ---------- */
  (function statCount() {
    var bar = doc.querySelector('.statbar');
    if (!bar) return;
    var targets = [];
    bar.querySelectorAll('.stat b').forEach(function (el) {
      var raw = el.textContent.trim();
      targets.push({ el: el, raw: raw, val: parseFloat(raw.replace(/[^0-9.]/g, '')), suffix: raw.replace(/[0-9.]/g, ''), prefix: raw.replace(/[^$,]/g, '') });
    });
    if (!targets.some(function (t) { return !isNaN(t.val); })) return;
    var fired = false;
    var io = new IntersectionObserver(function (entries) {
      if (fired) return;
      if (entries[0].isIntersecting) {
        fired = true;
        var start = performance.now();
        var dur = 900;
        function ease(t) { return 1 - Math.pow(2, -10 * t); } // easeOutExpo
        function tick(now) {
          var p = Math.min(1, (now - start) / dur);
          var k = ease(p);
          targets.forEach(function (t) {
            if (isNaN(t.val)) return;
            t.el.textContent = t.prefix + Math.round(t.val * k).toLocaleString() + t.suffix;
          });
          if (p < 1) requestAnimationFrame(tick);
          else targets.forEach(function (t) { if (!isNaN(t.val)) t.el.textContent = t.raw; });
        }
        requestAnimationFrame(tick);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(bar);
  })();

  /* ---------- ④ 关于区终端光标 ---------- */
  (function terminalCursor() {
    var about = doc.querySelector('#about');
    if (!about) return;
    var p = doc.createElement('p');
    p.className = 'terminal-line';
    p.innerHTML = '<span style="color:var(--accent)">&gt;</span> Thanks for visiting — <span style="color:var(--light)">makeapp</span><span class="cursor-blink" aria-hidden="true"></span>';
    about.appendChild(p);
  })();
})();
