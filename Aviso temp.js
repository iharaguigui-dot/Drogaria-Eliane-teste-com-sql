/* Aviso temporário (toast) */
var tm;
function toast(m){
  var t=document.getElementById('t');if(!t)return;
  t.textContent=m;t.classList.add('on');
  clearTimeout(tm);tm=setTimeout(function(){t.classList.remove('on')},1800);
}
