/* ---------- Reatividade ao passar o mouse ---------- */
window.ativarCards = function () {};
(function () {
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return;

  // Cards: inclinam levemente e sobem ao passar o mouse
  window.ativarCards = function (root) {
  (root || document).querySelectorAll('.cats a, .promo, .bene div, .prod').forEach(function (el) {
    if (el.classList.contains('tilt')) return;
    el.classList.add('tilt');
    el.addEventListener('pointerenter', function () { el.classList.add('is-hover'); });
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      var y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ry', ((x - 0.5) * 8) + 'deg');
      el.style.setProperty('--rx', ((0.5 - y) * 8) + 'deg');
    });
    el.addEventListener('pointerleave', function () {
      el.classList.remove('is-hover');
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });
  };
  window.ativarCards();

  // Botões e links do menu
  document.querySelectorAll('.cta, .search button, nav .bar a').forEach(function (el) {
    el.addEventListener('pointerenter', function () { el.classList.add('is-hover'); });
    el.addEventListener('pointerleave', function () { el.classList.remove('is-hover'); });
  });

  // Barra de busca destaca quando o campo está ativo
  var search = document.querySelector('.search');
  var input = search && search.querySelector('input');
  if (input) {
    input.addEventListener('focus', function () { search.classList.add('is-focus'); });
    input.addEventListener('blur', function () { search.classList.remove('is-focus'); });
  }

})();
