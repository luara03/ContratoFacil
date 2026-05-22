const modules = [
  { id: 'clients', name: '1. Clientes', fields: ['nome','cpfCnpj','email','telefone','endereco','status','preferencias'] },
  { id: 'events', name: '2. Eventos', fields: ['nome','tipo','data','inicio','fim','local','convidadosEstimados','convidadosConfirmados','cliente','status','tema'] },
  { id: 'venues', name: '3. Espaços', fields: ['nome','endereco','capacidade','valorLocacao','contato','descricao'] },
  { id: 'suppliers', name: '4. Fornecedores', fields: ['nome','especialidade','contato','status','avaliacao','comentarios'] },
  { id: 'inventory', name: '5. Estoque', fields: ['nome','categoria','unidade','qtdTotal','qtdDisponivel','qtdMinima','localizacao','valorReposicao','validade'] },
  { id: 'checklists', name: '6. Checklists', fields: ['evento','tipoEvento','item','responsavel','status'] },
  { id: 'logistics', name: '7. Logística', fields: ['evento','veiculo','placa','motorista','rota','saida','retorno','statusEquipe'] },
  { id: 'timeline', name: '8. Cronograma', fields: ['evento','fase','titulo','descricao','responsavel','prazo','status'] },
  { id: 'team', name: '9. Equipe', fields: ['nome','funcao','tipo','contato','evento','presenca','horas','valorHora'] },
  { id: 'finance', name: '10. Financeiro', fields: ['evento','receitas','custos','desconto','statusPagamento','vencimento','recebidoEm'] },
  { id: 'contracts', name: '11. Contratos', fields: ['evento','cliente','versao','status','clausulas','enviadoEmail'] },
  { id: 'reports', name: '13. Relatórios', fields: ['tipo','periodo','metricas','exportado'] },
  { id: 'notifications', name: '14. Notificações', fields: ['categoria','destinatario','mensagem','data','status'] },
  { id: 'settings', name: '15. Configurações', fields: ['empresa','cnpj','email','telefone','tema','perfilAcesso'] }
];

const db = JSON.parse(localStorage.getItem('eventopro-db') || '{}');
modules.forEach(m => db[m.id] ??= []);

const menu = document.getElementById('menu');
const moduleView = document.getElementById('moduleView');
const dashboard = document.getElementById('dashboard');
const search = document.getElementById('globalSearch');

function save() { localStorage.setItem('eventopro-db', JSON.stringify(db)); renderDashboard(); }
function statusBadge(v){ return `<span class="badge">${v || '—'}</span>`; }

function renderDashboard() {
  const totalEvents = db.events.length;
  const thisWeek = db.events.filter(e => e.data).length;
  const lowStock = db.inventory.filter(i => Number(i.qtdDisponivel||0) <= Number(i.qtdMinima||0)).length;
  const lateTasks = db.timeline.filter(t => t.status === 'Atrasado').length;
  const revenue = db.finance.reduce((a,f)=> a + Number(f.receitas || 0), 0);
  dashboard.className = 'view active';
  moduleView.className = 'view';
  dashboard.innerHTML = `
    <div class="grid">
      <article class="card"><h3>Eventos esta semana</h3><p>${thisWeek}</p></article>
      <article class="card"><h3>Faturamento estimado</h3><p>R$ ${revenue.toFixed(2)}</p></article>
      <article class="card"><h3>Tarefas atrasadas</h3><p>${lateTasks}</p></article>
      <article class="card"><h3>Itens em alerta</h3><p>${lowStock}</p></article>
    </div>
    <div class="module" style="margin-top:12px">
      <h3>Calendário/Próximos eventos</h3>
      <div class="table-wrap"><table><tr><th>Evento</th><th>Data</th><th>Status</th><th>Cliente</th></tr>
      ${db.events.slice(0,8).map(e=>`<tr><td>${e.nome||''}</td><td>${e.data||''}</td><td>${statusBadge(e.status)}</td><td>${e.cliente||''}</td></tr>`).join('') || '<tr><td colspan="4">Sem eventos</td></tr>'}
      </table></div>
      <p><small>Total de eventos cadastrados: ${totalEvents}</small></p>
    </div>`;
}

function openModule(moduleId) {
  const m = modules.find(x => x.id === moduleId);
  if (!m) return;
  dashboard.className = 'view';
  moduleView.className = 'view active';
  moduleView.innerHTML = `
    <div class="module">
      <h2>${m.name}</h2>
      <div class="form-grid">
        ${m.fields.map(f => `<label>${f}<input data-field="${f}" placeholder="${f}" /></label>`).join('')}
      </div>
      <div class="actions">
        <button class="primary" id="saveRow">Salvar</button>
        <button id="exportRows">Exportar JSON</button>
      </div>
      <div class="table-wrap"><table id="moduleTable"></table></div>
    </div>`;

  document.getElementById('saveRow').onclick = () => {
    const row = {};
    moduleView.querySelectorAll('[data-field]').forEach(i => row[i.dataset.field] = i.value.trim());
    row.audit = `Atualizado por Admin em ${new Date().toLocaleString('pt-BR')}`;
    db[m.id].push(row);
    save();
    renderTable(m);
  };

  document.getElementById('exportRows').onclick = () => {
    const blob = new Blob([JSON.stringify(db[m.id], null, 2)], { type:'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${m.id}.json`; a.click();
  };

  renderTable(m);
}

function renderTable(m) {
  const table = document.getElementById('moduleTable');
  const rows = db[m.id];
  table.innerHTML = `<tr>${m.fields.map(f=>`<th>${f}</th>`).join('')}<th>auditoria</th></tr>` +
    rows.map(r => `<tr>${m.fields.map(f=>`<td>${r[f] || ''}</td>`).join('')}<td>${r.audit || ''}</td></tr>`).join('');
}

modules.forEach((m,i) => {
  const btn = document.createElement('button');
  btn.textContent = m.name;
  btn.onclick = () => {
    [...menu.children].forEach(c=>c.classList.remove('active'));
    btn.classList.add('active');
    openModule(m.id);
  };
  if (i===0) btn.classList.add('active');
  menu.appendChild(btn);
});

search.addEventListener('input', () => {
  const q = search.value.toLowerCase();
  [...menu.children].forEach(btn => btn.style.display = btn.textContent.toLowerCase().includes(q) ? 'block' : 'none');
});

document.getElementById('themeToggle').onclick = () => document.body.classList.toggle('dark');

renderDashboard();
openModule('clients');
