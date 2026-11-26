/* Página inicial: o coração do banner segue o mouse */
(function(){
  var fine=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!fine||reduce)return;
  // Banner: o coração se move suavemente seguindo o mouse
  var hero = document.querySelector('.hero');
  var heart = document.querySelector('.heart');
  if (hero && heart) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      heart.style.setProperty('--hx', (x * 28) + 'px');
      heart.style.setProperty('--hy', (y * 22) + 'px');
      heart.style.setProperty('--hr', (x * 6) + 'deg');
    });
    hero.addEventListener('pointerleave', function () {
      heart.style.setProperty('--hx', '0px');
      heart.style.setProperty('--hy', '0px');
      heart.style.setProperty('--hr', '0deg');
    });
  }
})();
