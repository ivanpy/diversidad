/* =========================================================
   DIRECCIÓN DE DIVERSIDAD — Interactividad 2026
   ========================================================= */

(() => {
  // ---------- Nav scroll state ----------
  const nav = document.querySelector('.nav-glass');
  const onScroll = () => {
    if (window.scrollY > 20) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Smooth scroll w/ offset for sticky nav ----------
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
      const collapse = document.getElementById('navMain');
      if (collapse && collapse.classList.contains('show')) {
        bootstrap.Collapse.getInstance(collapse)?.hide();
      }
    });
  });

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = e.target.dataset.revealDelay || 0;
        setTimeout(() => e.target.classList.add('is-in'), delay);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

  // ---------- Bento mouse glow ----------
  document.querySelectorAll('.bento').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  // ---------- Counter animation ----------
  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    const target = +el.dataset.count;
    const dur = 1600;
    const start = performance.now();
    const step = (t) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counterIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCount(e.target); counterIO.unobserve(e.target); }
    });
  }, { threshold: .5 });
  counters.forEach(c => counterIO.observe(c));

  // ---------- News filters (home only — scoped to #newsGrid) ----------
  const homeGrid = document.getElementById('newsGrid');
  if (homeGrid) {
    const chips = homeGrid.closest('section').querySelectorAll('.chip[data-filter]');
    const cols = homeGrid.querySelectorAll('.news-col');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.dataset.filter;
        cols.forEach(col => {
          if (filter === 'all' || col.dataset.cat === filter) col.classList.remove('is-hidden');
          else col.classList.add('is-hidden');
        });
      });
    });
  }

  // ---------- Leyes sidebar active state ----------
  const leyLinks = document.querySelectorAll('.leyes-index a');
  const leyCards = document.querySelectorAll('.ley-card');
  if (leyCards.length) {
    const leyIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.id;
          leyLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    leyCards.forEach(c => leyIO.observe(c));
  }

  // ---------- File drop UI ----------
  document.querySelectorAll('.file-drop').forEach(drop => {
    const input = drop.querySelector('input[type=file]');
    if (!input) return;
    input.addEventListener('change', () => {
      if (input.files[0]) {
        drop.querySelector('span').innerHTML = '<strong>' + input.files[0].name + '</strong> seleccionado';
      }
    });
    ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => {
      e.preventDefault();
      drop.style.borderColor = 'var(--azul)';
      drop.style.background = 'rgba(80,89,188,.08)';
    }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => {
      e.preventDefault();
      drop.style.borderColor = '';
      drop.style.background = '';
    }));
  });

  // =========================================================
  // FORMULARIO ÚNICO
  // =========================================================

  // ---------- Terms → habilita/deshabilita todos los botones Guardar ----------
  const termsCheckbox = document.getElementById('termsCheckbox');
  const saveButtons = document.querySelectorAll('.btn-guardar-form');

  if (termsCheckbox) {
    termsCheckbox.addEventListener('change', () => {
      const checked = termsCheckbox.checked;
      saveButtons.forEach(btn => { btn.disabled = !checked; });
    });
  }

  // ---------- Educación: Estado → campos condicionales ----------
  const eduEstado = document.getElementById('eduEstadoSelect');
  if (eduEstado) {
    const condInc = document.getElementById('condGradoIncompleto');
    const condCur = document.getElementById('condGradoEnCurso');
    eduEstado.addEventListener('change', () => {
      const v = eduEstado.value;
      condInc.style.display = v === 'incompleto' ? '' : 'none';
      condCur.style.display = v === 'en-curso'   ? '' : 'none';
      if (v !== 'incompleto') { const i = condInc.querySelector('input'); if (i) i.value = ''; }
      if (v !== 'en-curso')   { const i = condCur.querySelector('input'); if (i) i.value = ''; }
    });
  }

  // ---------- Si/No groups → revelar campo condicional ----------
  document.querySelectorAll('.si-no-group[data-reveals]').forEach(group => {
    const target = document.getElementById(group.dataset.reveals);
    if (!target) return;
    group.querySelectorAll('input[type=radio]').forEach(radio => {
      radio.addEventListener('change', () => {
        target.style.display = radio.value === 'si' ? '' : 'none';
        if (radio.value === 'no') {
          target.querySelectorAll('textarea, input').forEach(el => { el.value = ''; });
        }
      });
    });
  });

  // ---------- Multi-select con tags ----------

  function createTag(text, value, select, pool, onRemoveCb) {
    const tag = document.createElement('span');
    tag.className = 'feature-tag-item';
    tag.dataset.value = value;

    const lbl = document.createElement('span');
    lbl.textContent = text;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tag-remove';
    btn.setAttribute('aria-label', 'Quitar ' + text);
    btn.innerHTML = '&times;';

    btn.addEventListener('click', () => {
      // Re-habilitar la opción correspondiente en el select
      Array.from(select.options).forEach(opt => {
        if (opt.value === value) opt.disabled = false;
      });
      tag.remove();
      if (typeof onRemoveCb === 'function') onRemoveCb(value, select);
    });

    tag.appendChild(lbl);
    tag.appendChild(btn);
    pool.appendChild(tag);
  }

  function initMultiSelect(wrap) {
    const select = wrap.querySelector('.multiselect-trigger');
    const pool   = wrap.querySelector('.tag-pool');
    if (!select || !pool) return;

    // Elementos especiales para "Otra Experiencia Laboral"
    const otraInput = wrap.querySelector('#otraExpInput');
    const otraText  = wrap.querySelector('#otraExpText');
    const otraBtn   = wrap.querySelector('#btnAddOtraExp');

    select.addEventListener('change', () => {
      const selOpt = select.options[select.selectedIndex];
      const val    = selOpt ? selOpt.value : '';
      const text   = selOpt ? selOpt.text  : '';
      if (!val) return;

      // Opción exclusiva (ej: "Sin Experiencia Laboral", "No poseo conocimientos")
      if (selOpt.dataset.exclusive === 'true') {
        // Quitar todos los tags existentes y re-habilitar sus opciones
        Array.from(pool.querySelectorAll('.feature-tag-item')).forEach(t => {
          const v = t.dataset.value;
          Array.from(select.options).forEach(o => { if (o.value === v) o.disabled = false; });
          t.remove();
        });
        // Deshabilitar todas las demás opciones
        Array.from(select.options).forEach(opt => {
          if (opt.value && opt.value !== val) opt.disabled = true;
        });
        // Crear tag; al quitarlo, re-habilitar todo
        createTag(text, val, select, pool, (v, sel) => {
          Array.from(sel.options).forEach(opt => { opt.disabled = false; });
        });
        selOpt.disabled = true;
        select.value = '';
        return;
      }

      // Opción con texto libre (ej: "Otra Experiencia Laboral")
      if (selOpt.dataset.openText === 'true') {
        if (otraInput) {
          otraInput.style.display = '';
          if (otraText) otraText.focus();
        }
        select.value = '';
        return;
      }

      // Opción normal: agregar tag y deshabilitar
      selOpt.disabled = true;
      createTag(text, val, select, pool);
      select.value = '';
    });

    // Agregar tag de texto libre
    if (otraBtn && otraText && otraInput) {
      const addOtraTag = () => {
        const customText = otraText.value.trim();
        if (!customText) return;
        createTag('Otra: ' + customText, 'otra-' + Date.now(), select, pool);
        otraText.value = '';
        otraInput.style.display = 'none';
        // La opción "Otra Experiencia Laboral" queda habilitada para poder agregar más
        Array.from(select.options).forEach(opt => {
          if (opt.dataset.openText === 'true') opt.disabled = false;
        });
      };
      otraBtn.addEventListener('click', addOtraTag);
      otraText.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); addOtraTag(); }
      });
    }
  }

  document.querySelectorAll('.multiselect-wrap').forEach(initMultiSelect);

  // ---------- Botón ir arriba ----------
  // DOMContentLoaded porque el botón está después del <script> en el HTML
  document.addEventListener('DOMContentLoaded', () => {
    const btnTop = document.getElementById('btnTop');
    if (!btnTop) return;
    const toggleTop = () => btnTop.classList.toggle('visible', window.scrollY > 80);
    window.addEventListener('scroll', toggleTop, { passive: true });
    toggleTop();
    btnTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  });

  // ---------- Botón Limpiar por pestaña ----------
  document.querySelectorAll('.btn-clear-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const pane = btn.closest('.tab-pane');
      if (!pane) return;

      // Inputs de texto y textarea
      pane.querySelectorAll('input:not([type=radio]):not([type=checkbox]), textarea').forEach(el => {
        el.value = '';
      });
      // Selects normales
      pane.querySelectorAll('select:not(.multiselect-trigger)').forEach(el => {
        el.selectedIndex = 0;
      });
      // Radios
      pane.querySelectorAll('input[type=radio]').forEach(el => { el.checked = false; });
      // Checkboxes (incluye terms)
      pane.querySelectorAll('input[type=checkbox]').forEach(el => { el.checked = false; });

      // Si se limpió el términos, re-deshabilitar todos los guardar
      if (pane.querySelector('#termsCheckbox')) {
        saveButtons.forEach(b => { b.disabled = true; });
      }

      // Multi-selects: vaciar tags y re-habilitar opciones
      pane.querySelectorAll('.multiselect-wrap').forEach(wrap => {
        const sel  = wrap.querySelector('.multiselect-trigger');
        const pool = wrap.querySelector('.tag-pool');
        if (pool) pool.innerHTML = '';
        if (sel) {
          Array.from(sel.options).forEach(opt => { opt.disabled = false; });
          sel.selectedIndex = 0;
        }
        // Ocultar input "Otra experiencia"
        const otraInp = wrap.querySelector('#otraExpInput');
        if (otraInp) otraInp.style.display = 'none';
      });

      // Ocultar campos condicionales
      pane.querySelectorAll('.cond-field').forEach(el => { el.style.display = 'none'; });

      // Ocultar targets de si-no-group
      pane.querySelectorAll('.si-no-group[data-reveals]').forEach(group => {
        const target = document.getElementById(group.dataset.reveals);
        if (target) target.style.display = 'none';
      });

      // Resetear estado condicional de educación
      const eduSel = pane.querySelector('#eduEstadoSelect');
      if (eduSel) eduSel.value = '';
    });
  });

})();
