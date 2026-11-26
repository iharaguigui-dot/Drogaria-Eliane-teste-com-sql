/* Produto: protetor-solar-fps-50 (dados, quantidade e carrinho) */
var PRODUTO={slug:"protetor-solar-fps-50",nome:"Protetor solar FPS 50",icone:"🧴",preco:29.9,categoria:"Higiene e Beleza"};
(function(){
  var q=1,v=document.getElementById('qv');
  function show(){v.textContent=q}
  document.getElementById('qm').onclick=function(){if(q>1){q--;show()}};
  document.getElementById('qp').onclick=function(){if(q<20){q++;show()}};
  document.getElementById('addQty').onclick=function(){adicionar(PRODUTO.nome,PRODUTO.preco,PRODUTO.icone,q)};
})();
document.addEventListener('click',function(e){
  var b=e.target.closest('.add');if(!b)return;
  adicionar(b.dataset.name,parseFloat(b.dataset.price),b.dataset.icon,1);
});

/* Busca os dados no Supabase (se falhar, mantém os da página) */
carregarProduto(PRODUTO.slug);
