/* Busca do cabeçalho */
var sf=document.querySelector('.search');
if(sf)sf.addEventListener('submit',function(e){e.preventDefault();toast('Buscando: '+sf.q.value)});
