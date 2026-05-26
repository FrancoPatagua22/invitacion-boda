'use strict';

/* ══════════════════════════════════════════════════════
   DATOS POR DEFECTO
══════════════════════════════════════════════════════ */
var DEFAULTS = {
  names:        'Muñeca & Gamez',
  eventDate:    '2026-06-20T21:30',
  displayDate:  '20 de Junio de 2026',
  venue:        'Salón La Multitrocha',
  mapsUrl:      'https://maps.app.goo.gl/Ukrk7e4KT4DcuVfq9?g_st=aw',
  cbu:          '0000003100012345678901',
  alias:        'TU.ALIAS.ACA',
  heroImage:    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80&auto=format&fit=crop',
  rsvpDeadline: '10 de Junio',
  scriptUrl:    'https://script.google.com/macros/s/AKfycbykXSgwyHDhOUFRn4yru5fZWZJh6wNIui5wmdebT71ioFdwtYLuxSyLzCz3e2MmgtST/exec',
  rulesDressCodeText:    'Media Gala',
  rulesKidsText:         'La celebración será sin niños ni bebés.',
  rulesPetsText:         'Por favor dejá a tus mascotas en casa.',
  rulesDressCodeVisible: true,
  rulesKidsVisible:      false,
  rulesPetsVisible:      false
};

var currentData = Object.assign({}, DEFAULTS);

/* ══════════════════════════════════════════════════════
   INYECTAR DATOS EN EL DOM
══════════════════════════════════════════════════════ */
function applyData(data) {
  // Nombres
  var heroNames   = document.getElementById('hero-names');
  var footerNames = document.getElementById('footer-names');
  var bankNote    = document.getElementById('bank-info-note');
  if (heroNames)   heroNames.textContent   = data.names;
  if (footerNames) footerNames.textContent = data.names;
  if (bankNote)    bankNote.textContent    = 'Banco: Banco Nación · Titulares: ' + data.names;
  document.title = data.names + ' — Invitación de Casamiento';

  // Fecha preheading (hero)
  var heroPreheading = document.getElementById('hero-preheading');
  if (heroPreheading) {
    var dayName = getDayName(data.eventDate);
    heroPreheading.textContent = dayName + ' · ' + data.displayDate;
  }

  // Fecha corta (countdown)
  var cdDateText = document.getElementById('countdown-date-text');
  if (cdDateText) {
    // Muestra la fecha sin el año: "28 de Mayo de 2026" → "28 de Mayo"
    cdDateText.textContent = data.displayDate.replace(/\s*de\s+\d{4}\s*$/, '').trim() || data.displayDate;
  }

  // Footer date derivada del eventDate
  var footerDate = document.getElementById('footer-date');
  if (footerDate) {
    var d = new Date(data.eventDate);
    if (!isNaN(d)) {
      var dd = String(d.getDate()).padStart(2, '0');
      var mm = String(d.getMonth() + 1).padStart(2, '0');
      var yy = d.getFullYear();
      footerDate.textContent = dd + ' · ' + mm + ' · ' + yy;
    }
  }

  // Hero background is handled by the CSS slider (.hero__slide elements)

  // Venue
  var venueEl = document.getElementById('schedule-venue');
  if (venueEl) venueEl.textContent = data.venue;

  // Google Maps link
  var mapsLink = document.getElementById('maps-link');
  if (mapsLink) mapsLink.href = data.mapsUrl;

  // Datos bancarios
  var cbuEl   = document.getElementById('cbu-value');
  var aliasEl = document.getElementById('alias-value');
  if (cbuEl)   cbuEl.textContent   = data.cbu;
  if (aliasEl) aliasEl.textContent = data.alias;

  // Fecha límite RSVP
  var deadlineEl = document.getElementById('rsvp-deadline');
  if (deadlineEl) deadlineEl.textContent = data.rsvpDeadline;

  // Actualizar objetivo del countdown
  countdownTarget = new Date(data.eventDate);

  // Reglas del evento
  applyRules(data);
}

/* Devuelve el nombre del día en español a partir de una fecha ISO */
function getDayName(isoDate) {
  var days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var d = new Date(isoDate);
  return isNaN(d) ? 'Sábado' : days[d.getDay()];
}

/* Aplica textos y visibilidad de las reglas del evento */
function applyRules(data) {
  var dresscodeText = document.getElementById('rule-dresscode-text');
  if (dresscodeText) dresscodeText.textContent = data.rulesDressCodeText;

  var kidsText = document.getElementById('rule-kids-text');
  if (kidsText) kidsText.textContent = data.rulesKidsText;

  var petsText = document.getElementById('rule-pets-text');
  if (petsText) petsText.textContent = data.rulesPetsText;

  var ruleDresscode = document.getElementById('rule-dresscode');
  if (ruleDresscode) ruleDresscode.style.display = data.rulesDressCodeVisible ? '' : 'none';

  var ruleKids = document.getElementById('rule-kids');
  if (ruleKids) ruleKids.style.display = data.rulesKidsVisible ? '' : 'none';

  var rulePets = document.getElementById('rule-pets');
  if (rulePets) rulePets.style.display = data.rulesPetsVisible ? '' : 'none';

  // Ocultar la sección entera si todas las reglas están desactivadas
  var sectionReglas = document.getElementById('reglas');
  if (sectionReglas) {
    var allHidden = !data.rulesDressCodeVisible && !data.rulesKidsVisible && !data.rulesPetsVisible;
    sectionReglas.style.display = allHidden ? 'none' : '';
  }
}

/* ══════════════════════════════════════════════════════
   LOCALSTORAGE — CARGAR Y GUARDAR
══════════════════════════════════════════════════════ */
function loadFromStorage() {
  try {
    var saved = localStorage.getItem('boda-data');
    if (saved) {
      var parsed = JSON.parse(saved);
      currentData = Object.assign({}, DEFAULTS, parsed);
      applyData(currentData);
    }
  } catch (e) {
    // localStorage no disponible o dato corrupto — usar defaults
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem('boda-data', JSON.stringify(data));
  } catch (e) {
    // Silenciar si localStorage está bloqueado
  }
}

/* ══════════════════════════════════════════════════════
   COUNTDOWN TIMER
══════════════════════════════════════════════════════ */
var countdownTarget = new Date(DEFAULTS.eventDate);

(function initCountdown() {
  var elDays    = document.getElementById('days');
  var elHours   = document.getElementById('hours');
  var elMinutes = document.getElementById('minutes');
  var elSeconds = document.getElementById('seconds');
  if (!elDays) return;

  function pad(n) { return String(n).padStart(2, '0'); }

  function set(el, val) {
    if (el.textContent !== val) el.textContent = val;
  }

  function tick() {
    var now  = new Date();
    var diff = countdownTarget - now;

    if (diff <= 0) {
      set(elDays,    '00');
      set(elHours,   '00');
      set(elMinutes, '00');
      set(elSeconds, '00');
      return;
    }

    set(elDays,    pad(Math.floor(diff / 86400000)));
    set(elHours,   pad(Math.floor((diff % 86400000) / 3600000)));
    set(elMinutes, pad(Math.floor((diff % 3600000) / 60000)));
    set(elSeconds, pad(Math.floor((diff % 60000) / 1000)));
  }

  tick();
  setInterval(tick, 1000);
})();

/* ══════════════════════════════════════════════════════
   PANEL DE EDICIÓN — ABRIR / CERRAR
══════════════════════════════════════════════════════ */
function openEditPanel() {
  var panel   = document.getElementById('edit-panel');
  var overlay = document.getElementById('edit-overlay');
  if (!panel) return;

  // Rellenar los inputs con los datos actuales
  setInputVal('ep-names',        currentData.names);
  setInputVal('ep-event-date',   currentData.eventDate);
  setInputVal('ep-display-date', currentData.displayDate);
  setInputVal('ep-venue',        currentData.venue);
  setInputVal('ep-maps-url',     currentData.mapsUrl);
  setInputVal('ep-cbu',          currentData.cbu);
  setInputVal('ep-alias',        currentData.alias);
  setInputVal('ep-hero-image',   currentData.heroImage);
  setInputVal('ep-rsvp-deadline',currentData.rsvpDeadline);
  setInputVal('ep-script-url',   currentData.scriptUrl);

  // Reglas del evento
  setInputVal('ep-rule-dresscode-text', currentData.rulesDressCodeText);
  setInputVal('ep-rule-kids-text',      currentData.rulesKidsText);
  setInputVal('ep-rule-pets-text',      currentData.rulesPetsText);
  setCheckbox('ep-rule-dresscode-visible', currentData.rulesDressCodeVisible);
  setCheckbox('ep-rule-kids-visible',      currentData.rulesKidsVisible);
  setCheckbox('ep-rule-pets-visible',      currentData.rulesPetsVisible);

  panel.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Foco accesible
  var firstInput = panel.querySelector('.form-input');
  if (firstInput) setTimeout(function() { firstInput.focus(); }, 350);
}

function closeEditPanel() {
  var panel   = document.getElementById('edit-panel');
  var overlay = document.getElementById('edit-overlay');
  if (!panel) return;

  panel.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';

  // Devolver foco al botón de editar
  var editBtn = document.getElementById('edit-btn');
  if (editBtn) editBtn.focus();
}

function setInputVal(id, value) {
  var el = document.getElementById(id);
  if (el) el.value = value || '';
}

function setCheckbox(id, value) {
  var el = document.getElementById(id);
  if (el) el.checked = (value !== false);
}

/* ══════════════════════════════════════════════════════
   GUARDAR CAMBIOS
══════════════════════════════════════════════════════ */
function saveChanges() {
  function getVal(id, fallback) {
    var el = document.getElementById(id);
    return (el && el.value.trim()) ? el.value.trim() : fallback;
  }

  function getCheckbox(id) {
    var el = document.getElementById(id);
    return el ? el.checked : true;
  }

  var newData = {
    names:        getVal('ep-names',         DEFAULTS.names),
    eventDate:    getVal('ep-event-date',    DEFAULTS.eventDate),
    displayDate:  getVal('ep-display-date',  DEFAULTS.displayDate),
    venue:        getVal('ep-venue',         DEFAULTS.venue),
    mapsUrl:      getVal('ep-maps-url',      DEFAULTS.mapsUrl),
    cbu:          getVal('ep-cbu',           DEFAULTS.cbu),
    alias:        getVal('ep-alias',         DEFAULTS.alias),
    heroImage:    getVal('ep-hero-image',    DEFAULTS.heroImage),
    rsvpDeadline: getVal('ep-rsvp-deadline', DEFAULTS.rsvpDeadline),
    scriptUrl:    getVal('ep-script-url',    DEFAULTS.scriptUrl),
    rulesDressCodeText:    getVal('ep-rule-dresscode-text', DEFAULTS.rulesDressCodeText),
    rulesKidsText:         getVal('ep-rule-kids-text',      DEFAULTS.rulesKidsText),
    rulesPetsText:         getVal('ep-rule-pets-text',      DEFAULTS.rulesPetsText),
    rulesDressCodeVisible: getCheckbox('ep-rule-dresscode-visible'),
    rulesKidsVisible:      getCheckbox('ep-rule-kids-visible'),
    rulesPetsVisible:      getCheckbox('ep-rule-pets-visible')
  };

  currentData = newData;
  applyData(newData);
  saveToStorage(newData);
  closeEditPanel();
  showSaveToast();
}

/* ══════════════════════════════════════════════════════
   RESTABLECER VALORES POR DEFECTO
══════════════════════════════════════════════════════ */
function resetToDefaults() {
  if (!window.confirm('¿Restablecer todos los datos a los valores por defecto?')) return;
  currentData = Object.assign({}, DEFAULTS);
  applyData(DEFAULTS);
  try { localStorage.removeItem('boda-data'); } catch(e) {}
  closeEditPanel();
  showSaveToast('Valores restablecidos');
}

/* ══════════════════════════════════════════════════════
   TOAST DE CONFIRMACIÓN
══════════════════════════════════════════════════════ */
function showSaveToast(msg) {
  var toast = document.getElementById('save-toast');
  if (!toast) return;
  toast.textContent = msg || '✓ Cambios guardados';
  toast.classList.add('visible');
  setTimeout(function() { toast.classList.remove('visible'); }, 2600);
}

/* ══════════════════════════════════════════════════════
   BANCO — TOGGLE
══════════════════════════════════════════════════════ */
function toggleBankInfo() {
  var panel = document.getElementById('bank-info');
  if (!panel) return;
  var isOpen = panel.classList.toggle('is-open');
  panel.setAttribute('aria-hidden', String(!isOpen));
  if (isOpen) {
    setTimeout(function() {
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
  }
}

/* ══════════════════════════════════════════════════════
   COPIAR AL PORTAPAPELES
══════════════════════════════════════════════════════ */
function copyText(elementId, btn) {
  var el = document.getElementById(elementId);
  if (!el) return;
  var text = el.textContent.trim();
  var svgCopy = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
  var svgCheck = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';

  function onSuccess() {
    btn.classList.add('copied');
    btn.innerHTML = svgCheck;
    setTimeout(function() {
      btn.classList.remove('copied');
      btn.innerHTML = svgCopy;
    }, 1800);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onSuccess).catch(function() {
      fallbackCopy(el, onSuccess);
    });
  } else {
    fallbackCopy(el, onSuccess);
  }
}

function fallbackCopy(el, onSuccess) {
  try {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('copy');
    sel.removeAllRanges();
    onSuccess();
  } catch(e) {}
}

/* ══════════════════════════════════════════════════════
   RSVP — TOGGLE SELECCIÓN DE ASISTENCIA
══════════════════════════════════════════════════════ */
function setAttendance(val) {
  var hidden = document.getElementById('asistencia-val');
  if (hidden) hidden.value = val;
  var btnYes = document.getElementById('btn-yes');
  var btnNo  = document.getElementById('btn-no');
  if (btnYes) btnYes.classList.toggle('is-selected', val === 'Si');
  if (btnNo)  btnNo.classList.toggle('is-selected',  val === 'No');
}

/* ══════════════════════════════════════════════════════
   RSVP — FORMULARIO + ENVÍO A GOOGLE SHEETS
══════════════════════════════════════════════════════ */
(function initRsvpForm() {
  var form = document.getElementById('rsvp-form');
  if (!form) return;

  // Limpiar errores de validación al escribir
  ['first-name', 'last-name'].forEach(function(id) {
    var input = document.getElementById(id);
    if (input) input.addEventListener('input', function() { input.classList.remove('error'); });
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Validar que nombre y apellido estén completos
    var nombre   = document.getElementById('first-name');
    var apellido = document.getElementById('last-name');
    var valid    = true;

    [nombre, apellido].forEach(function(input) {
      input.classList.remove('error');
      if (!input.value.trim()) { input.classList.add('error'); valid = false; }
    });
    if (!valid) { nombre.focus(); return; }

    // URL del Google Apps Script (hardcodeada como fallback)
    var scriptUrl = currentData.scriptUrl ||
      'https://script.google.com/macros/s/AKfycbykXSgwyHDhOUFRn4yru5fZWZJh6wNIui5wmdebT71ioFdwtYLuxSyLzCz3e2MmgtST/exec';

    // Bloquear botón de envío y mostrar estado de carga
    var submitBtn = document.getElementById('rsvp-submit-btn');
    var formMsg   = document.getElementById('form-msg');
    var origHTML  = submitBtn.innerHTML;
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Enviando...';

    var asistenciaEl = document.getElementById('asistencia-val');
    var asistencia   = asistenciaEl ? asistenciaEl.value : 'Si';
    var asiste       = asistencia === 'Si';

    // Recolectar cada invitado como objeto individual
    var guests = [];
    var guestRows = document.querySelectorAll('#guests-container .guest-row');
    guestRows.forEach(function(row, idx) {
      var n, a;
      if (idx === 0) {
        n = nombre.value.trim();
        a = apellido.value.trim();
      } else {
        var ni = row.querySelector('.guest-nombre');
        var ai = row.querySelector('.guest-apellido');
        n = ni ? ni.value.trim() : '';
        a = ai ? ai.value.trim() : '';
      }
      if (n || a) guests.push({ nombre: n, apellido: a });
    });

    // Un fetch por invitado → una fila separada en Google Sheets
    var promises = guests.map(function(guest) {
      var fd = new FormData();
      fd.append('nombre',     guest.nombre);
      fd.append('apellido',   guest.apellido);
      fd.append('asistencia', asistencia);
      return fetch(scriptUrl, { method: 'POST', mode: 'no-cors', body: fd });
    });

    Promise.all(promises)
    .then(function() {
      var primerNombre  = guests.length ? guests[0].nombre : nombre.value.trim();
      var cantidadTexto = guests.length > 1 ? ' de ' + guests.length + ' personas' : '';

      // Limpiar el formulario y eliminar filas adicionales para evitar reenvíos
      form.reset();
      var container = document.getElementById('guests-container');
      if (container) {
        container.querySelectorAll('.guest-row:not(.guest-row--first)').forEach(function(r) {
          container.removeChild(r);
        });
      }
      setAttendance('Si');

      form.style.display        = 'none';
      formMsg.style.display     = 'block';
      formMsg.style.color       = 'var(--color-accent)';
      formMsg.style.fontFamily  = "'Playfair Display', serif";
      formMsg.style.fontSize    = '1.3rem';
      formMsg.style.textAlign   = 'center';
      formMsg.style.lineHeight  = '1.6';
      formMsg.style.marginTop   = '32px';
      formMsg.textContent       = asiste
        ? '¡Gracias, ' + primerNombre + '! Confirmación' + cantidadTexto + ' enviada. ¡Nos vemos en la fiesta!'
        : '¡Gracias por avisarnos, ' + primerNombre + '! Lo entendemos. Te vamos a extrañar.';

      formMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    })
    .catch(function() {
      submitBtn.disabled  = false;
      submitBtn.innerHTML = origHTML;
      formMsg.style.display    = 'block';
      formMsg.style.color      = '#c0392b';
      formMsg.style.fontFamily = "'Montserrat', sans-serif";
      formMsg.style.fontSize   = '0.9rem';
      formMsg.style.textAlign  = 'center';
      formMsg.style.marginTop  = '16px';
      formMsg.textContent = '⚠ Hubo un error al enviar. Revisá tu conexión e intentá de nuevo.';
    });
  });
})();

/* ══════════════════════════════════════════════════════
   HERO — SLIDER DE FONDO (JS-driven, CSS transition)
══════════════════════════════════════════════════════ */
(function initHeroSlider() {
  var slides = document.querySelectorAll('.hero__slide');
  if (!slides.length) return;

  var current = 0;
  slides[current].classList.add('active');

  setInterval(function() {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 6000);
})();

/* ══════════════════════════════════════════════════════
   RSVP — FILAS DINÁMICAS DE INVITADOS
══════════════════════════════════════════════════════ */
(function initGuestRows() {
  var addBtn    = document.getElementById('add-guest-btn');
  var container = document.getElementById('guests-container');
  if (!addBtn || !container) return;

  var trashIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">' +
      '<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>' +
    '</svg>';

  addBtn.addEventListener('click', function() {
    var row = document.createElement('div');
    row.className = 'guest-row';
    row.innerHTML =
      '<div class="rsvp__fields">' +
        '<div class="form-group">' +
          '<label class="form-label">Nombre</label>' +
          '<input class="form-input guest-nombre" type="text" placeholder="Ej: Juan" />' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">Apellido</label>' +
          '<input class="form-input guest-apellido" type="text" placeholder="Ej: González" />' +
        '</div>' +
      '</div>' +
      '<button type="button" class="guest-row__remove" aria-label="Eliminar integrante">' +
        trashIcon +
      '</button>';

    row.querySelector('.guest-row__remove').addEventListener('click', function() {
      container.removeChild(row);
    });

    container.appendChild(row);
    row.querySelector('.guest-nombre').focus();
  });
})();

/* ══════════════════════════════════════════════════════
   FAB — SCROLL AL RSVP
══════════════════════════════════════════════════════ */
function scrollToRsvp() {
  var rsvp = document.getElementById('rsvp');
  if (rsvp) rsvp.scrollIntoView({ behavior: 'smooth' });
}

/* FAB — ocultar cuando el RSVP está visible */
(function initFabVisibility() {
  var fab  = document.getElementById('fab-confirm');
  var rsvp = document.getElementById('rsvp');
  if (!fab || !rsvp || !window.IntersectionObserver) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      fab.classList.toggle('is-hidden', entry.isIntersecting);
    });
  }, { threshold: 0.3 });

  observer.observe(rsvp);
})();

/* ══════════════════════════════════════════════════════
   TECLADO — ESC CIERRA EL PANEL
══════════════════════════════════════════════════════ */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    var panel = document.getElementById('edit-panel');
    if (panel && panel.classList.contains('active')) {
      closeEditPanel();
    }
  }
});

/* ══════════════════════════════════════════════════════
   MÚSICA DE FONDO — AUTOPLAY CON FALLBACK
══════════════════════════════════════════════════════ */
(function initMusic() {
  var audio    = document.getElementById('bg-music');
  var btn      = document.getElementById('music-btn');
  var iconPlay = document.getElementById('music-icon-play');
  var iconPause= document.getElementById('music-icon-pause');
  if (!audio || !btn) return;

  function showPlay()  { iconPlay.style.display = ''; iconPause.style.display = 'none'; }
  function showPause() { iconPlay.style.display = 'none'; iconPause.style.display = ''; }

  function startMusic() {
    audio.play().then(function() {
      showPause();
    }).catch(function() {
      showPlay();
    });
  }

  // Pantalla de bienvenida: el click en "ABRIR INVITACIÓN" garantiza
  // una interacción real, destrabando el autoplay en todos los navegadores
  var openBtn = document.getElementById('open-invitation');
  var overlay = document.getElementById('welcome-overlay');
  if (openBtn && overlay) {
    document.body.style.overflow = 'hidden';
    openBtn.addEventListener('click', function() {
      document.body.style.overflow = '';
      audio.play().then(showPause).catch(showPlay);
      overlay.classList.add('hidden');
    });
  }

  // Control manual: pausar / reanudar
  btn.addEventListener('click', function(e) {
    e.stopPropagation(); // no dispara el fallback de body
    if (audio.paused) {
      audio.play().then(showPause).catch(showPlay);
    } else {
      audio.pause();
      showPlay();
    }
  });
})();

/* ══════════════════════════════════════════════════════
   INICIALIZACIÓN — CARGAR DATOS AL ARRANCAR
══════════════════════════════════════════════════════ */
loadFromStorage();
