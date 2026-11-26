/* Página Minha Conta: login, cadastro, endereços e pedidos (Supabase) */
var $ = function (i) { return document.getElementById(i); };
var STATUS = { pendente: 'Pendente', pago: 'Pago', enviado: 'Enviado', entregue: 'Entregue', cancelado: 'Cancelado' };
var qtdEnderecos = 0;
function msg(id, t, ok) { var m = $(id); m.textContent = t || ''; m.className = 'msg' + (ok ? ' ok' : ''); }

function voltarOuMostrar() {
  var v = null; try { v = sessionStorage.getItem('eliane_voltar'); sessionStorage.removeItem('eliane_voltar'); } catch (e) {}
  if (v) { location.href = v; return; }
  mostrar();
}
function mostrar() {
  var s = getSessao();
  cabecalho();
  $('viewLogin').hidden = !!s; $('viewConta').hidden = !s;
  if (!s) return;
  $('olaConta').textContent = 'Você está logado como ' + s.user.email;
  carregarEnderecos(); carregarPedidos();
}
function carregarEnderecos() {
  api('enderecos', { params: 'select=*&order=principal.desc,id' }).then(function (l) {
    qtdEnderecos = l.length;
    $('listaEnd').innerHTML = l.length ? l.map(function (e) {
      return '<div class="addr">' + (e.principal ? '<span class="badge">Principal</span> ' : '') + escapar(e.rua + ', ' + e.numero + (e.complemento ? ' - ' + e.complemento : '') + ' - ' + e.bairro + ', ' + e.cidade + '/' + e.estado + ' - CEP ' + e.cep) + '</div>';
    }).join('') : '<p class="psub">Nenhum endereço cadastrado ainda.</p>';
  }).catch(function (e) { $('listaEnd').innerHTML = '<p class="msg">' + escapar(e.message) + '</p>'; });
}
function carregarPedidos() {
  api('pedidos', { params: 'select=id,status,forma_pagamento,total,criado_em,itens_pedido(nome_produto,quantidade,preco_unitario)&order=criado_em.desc' }).then(function (l) {
    $('listaPed').innerHTML = l.length ? l.map(function (p) {
      return '<div class="pedido"><div><b>Pedido #' + p.id + '</b> · ' + new Date(p.criado_em).toLocaleDateString('pt-BR') + ' <span class="badge st-' + p.status + '">' + (STATUS[p.status] || p.status) + '</span></div><ul>' +
        p.itens_pedido.map(function (i) { return '<li>' + i.quantidade + 'x ' + escapar(i.nome_produto) + ' — ' + money(i.preco_unitario * i.quantidade) + '</li>'; }).join('') +
        '</ul><div>Total: <b>' + money(p.total) + '</b> (' + escapar(p.forma_pagamento) + ')</div></div>';
    }).join('') : '<p class="psub">Você ainda não fez pedidos.</p>';
  }).catch(function (e) { $('listaPed').innerHTML = '<p class="msg">' + escapar(e.message) + '</p>'; });
}

$('showSignup').onclick = function (e) { e.preventDefault(); $('loginForm').hidden = true; $('signupForm').hidden = false; msg('msg', ''); };
$('showLogin').onclick = function (e) { e.preventDefault(); $('signupForm').hidden = true; $('loginForm').hidden = false; msg('msg', ''); };
$('loginForm').onsubmit = function (e) {
  e.preventDefault(); msg('msg', 'Entrando...');
  entrar($('lEmail').value.trim(), $('lSenha').value).then(function () { toast('Login realizado'); voltarOuMostrar(); })
    .catch(function (er) { msg('msg', er.message); });
};
$('signupForm').onsubmit = function (e) {
  e.preventDefault(); msg('msg', 'Criando conta...');
  cadastrar($('sNome').value.trim(), $('sEmail').value.trim(), $('sSenha').value).then(function (r) {
    if (r.logado) { toast('Conta criada!'); voltarOuMostrar(); }
    else { msg('msg', 'Conta criada! Enviamos um e-mail para confirmar o cadastro. Depois de confirmar, é só entrar.', true); $('signupForm').hidden = true; $('loginForm').hidden = false; }
  }).catch(function (er) { msg('msg', er.message); });
};
$('sair').onclick = sair;

/* Preenche o endereço pelo CEP (ViaCEP); se falhar, é só digitar */
$('eCep').onblur = function () {
  var d = this.value.replace(/\D/g, ''); if (d.length !== 8) return;
  fetch('https://viacep.com.br/ws/' + d + '/json/').then(function (r) { return r.json(); }).then(function (c) {
    if (c.erro) return;
    $('eRua').value = c.logradouro || $('eRua').value; $('eBairro').value = c.bairro || $('eBairro').value;
    $('eCidade').value = c.localidade || $('eCidade').value; $('eUf').value = c.uf || $('eUf').value;
  }).catch(function () {});
};
$('endForm').onsubmit = function (e) {
  e.preventDefault(); var s = getSessao(); msg('msgEnd', 'Salvando...');
  api('enderecos', { method: 'POST', prefer: 'return=minimal', body: {
    cliente_id: s.user.id, cep: $('eCep').value.trim(), rua: $('eRua').value.trim(), numero: $('eNum').value.trim(),
    complemento: $('eComp').value.trim() || null, bairro: $('eBairro').value.trim(), cidade: $('eCidade').value.trim(),
    estado: $('eUf').value.trim().toUpperCase(), principal: qtdEnderecos === 0 } })
    .then(function () { msg('msgEnd', 'Endereço salvo!', true); $('endForm').reset(); carregarEnderecos(); })
    .catch(function (er) { msg('msgEnd', er.message); });
};
mostrar();
