/* Conta do cliente: login, cadastro, sessão e acesso protegido ao Supabase */
var BASE = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
var SESSAO_KEY = 'eliane_sessao';

function getSessao() { try { return JSON.parse(localStorage.getItem(SESSAO_KEY)); } catch (e) { return null; } }
function setSessao(s) { try { if (s) localStorage.setItem(SESSAO_KEY, JSON.stringify(s)); else localStorage.removeItem(SESSAO_KEY); } catch (e) {} }
function escapar(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
}
function traduzir(m) {
  m = String(m || '');
  if (/invalid login/i.test(m)) return 'E-mail ou senha incorretos.';
  if (/already (been )?registered/i.test(m)) return 'Este e-mail já está cadastrado.';
  if (/at least/i.test(m)) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (/not confirmed/i.test(m)) return 'Confirme seu e-mail antes de entrar (veja sua caixa de entrada).';
  if (/rate limit|too many/i.test(m)) return 'Muitas tentativas. Aguarde um pouco e tente de novo.';
  if (/failed to fetch|networkerror/i.test(m)) return 'Sem conexão com o servidor.';
  return m;
}
function guardar(d) {
  var u = d.user || {};
  var s = { access_token: d.access_token, refresh_token: d.refresh_token, expira: Date.now() + (d.expires_in || 3600) * 1000,
            user: { id: u.id, email: u.email, nome: (u.user_metadata || {}).nome || '' } };
  setSessao(s); return s;
}
function authReq(path, body) {
  return fetch(BASE + path, { method: 'POST', headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then(function (r) { return r.json().then(function (j) {
      if (!r.ok) throw new Error(traduzir(j.msg || j.error_description || j.message || ('Erro ' + r.status)));
      return j; }); });
}
function tokenValido() {
  var s = getSessao();
  if (!s) return Promise.resolve(null);
  if (Date.now() < s.expira - 60000) return Promise.resolve(s.access_token);
  return authReq('/auth/v1/token?grant_type=refresh_token', { refresh_token: s.refresh_token })
    .then(function (d) { d.user = d.user || { id: s.user.id, email: s.user.email, user_metadata: { nome: s.user.nome } }; return guardar(d).access_token; })
    .catch(function () { setSessao(null); return null; });
}
/* Chamada autenticada ao banco: api('enderecos', {params:'select=*', method:'GET', body:{...}, prefer:'...'}) */
function api(rota, o) {
  o = o || {};
  return tokenValido().then(function (t) {
    if (!t) throw new Error('Faça login para continuar.');
    var h = { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' };
    if (o.prefer) h.Prefer = o.prefer;
    return fetch(BASE + '/rest/v1/' + rota + (o.params ? '?' + o.params : ''), { method: o.method || 'GET', headers: h, body: o.body ? JSON.stringify(o.body) : undefined });
  }).then(function (r) {
    return r.text().then(function (t) {
      var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) {}
      if (!r.ok) throw new Error((j && (j.message || j.hint)) || ('Erro ' + r.status));
      return j; });
  });
}
function garantirCliente(s) {
  return api('clientes', { params: 'select=id&id=eq.' + s.user.id }).then(function (l) {
    if (l && l.length) return s;
    return api('clientes', { method: 'POST', body: { id: s.user.id, nome: s.user.nome || s.user.email.split('@')[0] }, prefer: 'return=minimal' }).then(function () { return s; });
  });
}
function entrar(email, senha) {
  return authReq('/auth/v1/token?grant_type=password', { email: email, password: senha }).then(guardar).then(garantirCliente);
}
function cadastrar(nome, email, senha) {
  return authReq('/auth/v1/signup', { email: email, password: senha, data: { nome: nome } }).then(function (d) {
    if (d.access_token) return garantirCliente(guardar(d)).then(function () { return { logado: true }; });
    return { logado: false };
  });
}
function sair() { setSessao(null); location.href = 'index.html'; }

/* Cabeçalho: mostra "Olá, Nome" quando o cliente está logado */
function cabecalho() {
  var s = getSessao(); if (!s) return;
  var nome = (s.user.nome || s.user.email.split('@')[0]).split(' ')[0];
  document.querySelectorAll('.acts a[href="minha-conta.html"]').forEach(function (a) { a.textContent = '👤 Olá, ' + nome; });
}
cabecalho();
