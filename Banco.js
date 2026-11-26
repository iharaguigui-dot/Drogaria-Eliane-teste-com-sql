/* Ligação com o Supabase: lê os produtos do banco.
   Se o banco não responder, a página continua mostrando os dados que já estão no HTML. */
var API = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '') + '/rest/v1/';

function consultar(tabela, params) {
  return fetch(API + tabela + '?' + params, { headers: { apikey: SUPABASE_KEY } })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .catch(function (e) { console.warn('Supabase indisponível; usando os dados da página.', e); return null; });
}
function brl(v) { return 'R$ ' + Number(v).toFixed(2).replace('.', ','); }
function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function cardProduto(p) {
  var antigo = p.preco_promocional != null ? '<s>' + brl(p.preco) + '</s> ' : '';
  var ic = esc(p.icone || '');
  return '<article class="prod"><a class="plink" href="' + esc(p.slug) + '.html"><div class="pic">' + ic + '</div><h3>' + esc(p.nome) + '</h3></a>' +
    '<div class="price">' + antigo + '<b>' + brl(p.preco_final) + '</b></div>' +
    '<button class="add" data-icon="' + ic + '" data-name="' + esc(p.nome) + '" data-price="' + p.preco_final + '">Adicionar ao carrinho</button></article>';
}

/* Páginas de categoria e de ofertas */
function carregarLista(filtro) {
  consultar('produtos_vitrine', 'select=*&' + filtro + '&order=codigo').then(function (lista) {
    var g = document.querySelector('.pgrid');
    if (!lista || !lista.length || !g) return;
    g.innerHTML = lista.map(cardProduto).join('');
    if (window.ativarCards) window.ativarCards(g);
  });
}

/* Página de um produto */
function carregarProduto(slug) {
  consultar('produtos_vitrine', 'select=*&slug=eq.' + encodeURIComponent(slug)).then(function (l) {
    if (!l || !l.length) return;
    var p = l[0], promo = p.preco_promocional != null;
    var pr = document.querySelector('.pprice');
    if (pr) pr.innerHTML = (promo ? '<s>' + brl(p.preco) + '</s>' : '') + '<b>' + brl(p.preco_final) + '</b>' +
      (promo ? '<span class="off">-' + Math.round((1 - p.preco_final / p.preco) * 100) + '%</span>' : '');
    var d = document.querySelector('.pdesc'); if (d && p.descricao) d.textContent = p.descricao;
    if (typeof PRODUTO !== 'undefined') PRODUTO.preco = Number(p.preco_final);
    var disp = document.querySelector('.pdetails tr:nth-child(3) td');
    if (disp) disp.textContent = p.estoque > 0 ? 'Em estoque' : 'Indisponível';
    var btn = document.getElementById('addQty');
    if (btn && p.estoque <= 0) { btn.disabled = true; btn.textContent = 'Indisponível'; }
  });
}
