/* Página do Carrinho: lista, quantidades e finalizar compra (Supabase) */
var $ = function (i) { return document.getElementById(i); };
function msgC(t, ok) { var m = $('msgCart'); m.textContent = t || ''; m.className = 'msg' + (ok ? ' ok' : ''); }

function renderCart() {
  var c = getCart(), tot = 0; c.forEach(function (i) { tot += i.q * i.p; });
  $('cartTotal').textContent = money(tot);
  $('cartList').innerHTML = c.length ? c.map(function (i, k) {
    return '<div class="crow"><span class="ic">' + i.ic + '</span><b>' + i.n + '</b><span class="q"><button data-a="dec" data-k="' + k + '">−</button>' + i.q + '<button data-a="inc" data-k="' + k + '">+</button></span><span class="tot">' + money(i.q * i.p) + '</span><button class="del" data-a="del" data-k="' + k + '">Remover</button></div>';
  }).join('') : '<div class="empty">Seu carrinho está vazio.</div>';
}
document.addEventListener('click', function (e) {
  var b = e.target.closest('[data-a]'); if (!b) return;
  var c = getCart(), k = +b.dataset.k, a = b.dataset.a;
  if (a === 'inc') { if (c[k].q < 20) c[k].q++; }
  else if (a === 'dec') { c[k].q--; if (c[k].q < 1) c.splice(k, 1); }
  else c.splice(k, 1);
  saveCart(c);
});

function finalizar() {
  var cart = getCart(), s = getSessao();
  if (!cart.length) { toast('Carrinho vazio'); return; }
  if (!s) {
    try { sessionStorage.setItem('eliane_voltar', 'carrinho.html'); } catch (e) {}
    toast('Entre na sua conta para finalizar'); setTimeout(function () { location.href = 'minha-conta.html'; }, 900); return;
  }
  var end = $('selEnd').value;
  if (!end) { msgC('Cadastre um endereço em Minha Conta para finalizar.'); return; }
  var btn = $('checkout'); btn.disabled = true; msgC('Enviando pedido...');
  api('produtos', { params: 'select=id,nome' }).then(function (prods) {
    var ids = {}; prods.forEach(function (p) { ids[p.nome] = p.id; });
    var soma = {};
    cart.forEach(function (i) {
      var id = ids[i.n]; if (!id) throw new Error('Produto não encontrado no banco: ' + i.n);
      soma[id] = Math.min(20, (soma[id] || 0) + i.q);
    });
    var linhas = Object.keys(soma).map(function (id) { return { cliente_id: s.user.id, produto_id: +id, quantidade: soma[id] }; });
    return api('carrinho_itens', { method: 'DELETE', params: 'cliente_id=eq.' + s.user.id })
      .then(function () { return api('carrinho_itens', { method: 'POST', body: linhas, prefer: 'return=minimal' }); });
  }).then(function () {
    return api('rpc/finalizar_pedido', { method: 'POST', body: { p_endereco_id: +end, p_forma_pagamento: $('selPag').value } });
  }).then(function (id) {
    saveCart([]); msgC('Pedido #' + id + ' realizado com sucesso! Veja os detalhes em Minha Conta.', true);
  }).catch(function (e) {
    var m = e.message; if (/estoque|check constraint|violates/i.test(m)) m = 'Estoque insuficiente para algum item.';
    msgC(m);
  }).then(function () { btn.disabled = false; });
}
$('checkout').onclick = finalizar;

if (getSessao()) {
  $('checkoutBox').hidden = false;
  api('enderecos', { params: 'select=*&order=principal.desc,id' }).then(function (l) {
    $('selEnd').innerHTML = l.length ? l.map(function (e) { return '<option value="' + e.id + '">' + escapar(e.rua + ', ' + e.numero + ' - ' + e.bairro + ', ' + e.cidade + '/' + e.estado) + '</option>'; }).join('') : '<option value="">Nenhum endereço cadastrado</option>';
    if (!l.length) $('msgCart').innerHTML = 'Cadastre um endereço em <a href="minha-conta.html">Minha Conta</a> para finalizar.';
  }).catch(function (e) { msgC(e.message); });
} else {
  $('msgCart').innerHTML = 'Para finalizar, <a href="minha-conta.html">entre na sua conta</a>.';
}
render();
