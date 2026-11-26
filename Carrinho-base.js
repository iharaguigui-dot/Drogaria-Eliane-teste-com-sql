/* Carrinho (núcleo compartilhado): salvo no navegador */
var mem=[];
function getCart(){try{return JSON.parse(localStorage.getItem('eliane_cart'))||[]}catch(e){return mem}}
function saveCart(c){mem=c;try{localStorage.setItem('eliane_cart',JSON.stringify(c))}catch(e){}render()}
function money(v){return 'R$ '+v.toFixed(2).replace('.',',')}
function render(){
  var q=0;getCart().forEach(function(i){q+=i.q});
  var n=document.getElementById('cn');if(n)n.textContent=q;
  if(typeof renderCart==='function')renderCart();
}
function adicionar(nome,preco,icone,qtd){
  var c=getCart(),f=c.filter(function(i){return i.n===nome&&i.p===preco})[0];
  if(f)f.q+=qtd;else c.push({n:nome,p:preco,ic:icone,q:qtd});
  saveCart(c);toast('Adicionado: '+(qtd>1?qtd+'x ':'')+nome);
}
render();
