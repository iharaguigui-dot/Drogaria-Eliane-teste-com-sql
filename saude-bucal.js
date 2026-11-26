/* Página Saúde Bucal: botões "Adicionar ao carrinho" */
document.addEventListener('click',function(e){
  var b=e.target.closest('.add');if(!b)return;
  adicionar(b.dataset.name,parseFloat(b.dataset.price),b.dataset.icon,1);
});

/* Busca os dados no Supabase (se falhar, mantém os da página) */
carregarLista('categoria_slug=eq.saude-bucal');
