import './style.css';
import loginScreenHtml from './view/LoginScreen.html?raw';
import dashboardScreenHtml from './view/DashboardScreen.html?raw';

const app = document.querySelector('#app');

// ============================================================
// 1. BANCO DE DADOS (Mantive seus dados + Novos campos Voluntários)
// ============================================================

const DB = {
  doacoes: [
    { id: 1, data: '11/11/2025 20:30', nome: 'Maria Silva', email: 'maria@gmail.com', valor: 100.00, tipo: 'Única', status: 'Aprovada', metodo: 'Boleto' },
    { id: 2, data: '11/11/2025 18:15', nome: 'João Souza', email: 'joao@outlook.com', valor: 50.00, tipo: 'Recorrente', status: 'Falha', metodo: 'Cartão' },
    { id: 3, data: '10/11/2025 09:12', nome: 'Pedro Costa', email: 'pedro@uol.com.br', valor: 200.00, tipo: 'Única', status: 'Pendente', metodo: 'PIX' },
    { id: 4, data: '09/11/2025 14:00', nome: 'Ana Clara', email: 'ana@test.com', valor: 1200.00, tipo: 'Única', status: 'Aprovada', metodo: 'PIX' },
  ],
  socios: [
    { id: 1, nome: 'Maria Silva', email: 'maria@gmail.com', valor: 100.00, status: 'Ativa', inicio: '11/11/2025' },
    { id: 2, nome: 'João Souza', email: 'joao@outlook.com', valor: 50.00, status: 'Inadimplente', inicio: '08/02/2025' },
    { id: 3, nome: 'Pedro Costa', email: 'pedro@uol.com.br', valor: 200.00, status: 'Cancelada', inicio: '25/03/2025' },
  ],
  // AQUI EU ADICIONEI OS DADOS NOVOS PARA O MODAL FUNCIONAR
  voluntarios: [
    { 
      id: 1, data: '10/11/2025', nome: 'Ana Beatriz Lima', email: 'ana.lima@email.com', telefone: '(77) 99999-8888',
      area: 'Saúde', especialidade: 'Nutricionista', status: 'Em análise',
      disponibilidade: 'Tenho disponibilidade total nas terças-feiras (manhã e tarde).'
    },
    { 
      id: 2, data: '11/11/2025', nome: 'Ricardo Mendes', email: 'ricardo@email.com', telefone: '(77) 98888-7777',
      area: 'Administrativo', especialidade: 'Gestão', status: 'Em análise',
      disponibilidade: 'Posso ajudar aos sábados pela manhã.'
    },
    { 
      id: 3, data: '10/11/2025', nome: 'Juliana Paes', email: 'ju.paes@email.com', telefone: '(11) 91234-5678',
      area: 'Eventos', especialidade: 'Decoração', status: 'Aprovado',
      disponibilidade: 'Disponível para eventos pontuais.'
    },
  ]
};

// ============================================================
// 2. SISTEMA DE LOGIN (Intacto)
// ============================================================

const MOCK_USER = { email: 'admin@casadoamor.com', password: '123' };

function renderLogin() {
  app.innerHTML = `<div class="login-mode">${loginScreenHtml}</div>`;
  const form = document.getElementById('login-form');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const pass = document.getElementById('password').value.trim();
      
      if (email === MOCK_USER.email && pass === MOCK_USER.password) {
        renderDashboard();
      } else {
        alert('Dados incorretos! (Use: admin@casadoamor.com / 123)');
      }
    });
  }
}

// ============================================================
// 3. SISTEMA DO DASHBOARD (Intacto)
// ============================================================

function renderDashboard() {
  app.innerHTML = dashboardScreenHtml;
  setupSidebar();
  loadContent('doacoes'); 
}

function setupSidebar() {
  const navButtons = document.querySelectorAll('.nav-item');
  const logoutBtn = document.getElementById('btn-logout');
  const btnChangeProfile = document.getElementById('btn-change-profile');
  const fileInput = document.getElementById('profile-upload');
  const profileImg = document.getElementById('profile-image');
  const defaultIcon = document.getElementById('default-profile-icon');

  if (btnChangeProfile && fileInput) {
    btnChangeProfile.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          defaultIcon.style.display = 'none';
          profileImg.src = e.target.result;
          profileImg.style.display = 'block';
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadContent(btn.dataset.target);
    });
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if(confirm('Sair do sistema?')) renderLogin();
    });
  }
}

// ============================================================
// 4. LÓGICA DE CONTEÚDO (Restaurei sua lógica antiga aqui)
// ============================================================

let currentScreen = ''; 

function loadContent(screenName) {
  currentScreen = screenName;
  const contentArea = document.getElementById('content-area');
  
  // -- RESTAUREI SEUS IFs DE COLUNAS E LABELS --
  let columns = [];
  let card1Label = '', card2Label = '';
  
  if (screenName === 'doacoes') {
    columns = ['Data/Hora', 'Doador (Nome/Email)', 'Valor', 'Tipo', 'Status', 'Método'];
    card1Label = 'doações recebidas';
    card2Label = 'arrecadado';
  } else if (screenName === 'socios') {
    columns = ['Doador (Nome/Email)', 'Valor Mensal', 'Status da Assinatura', 'Data de Início', 'Ações'];
    card1Label = 'sócios ativos';
    card2Label = 'receita recorrente';
  } else if (screenName === 'voluntarios') {
    columns = ['Data Inscrição', 'Nome do Voluntário', 'Área de Atuação', 'Especialidade', 'Status'];
    card1Label = 'total de inscritos';
    card2Label = 'novas inscrições';
  }

  contentArea.innerHTML = `
    <div class="top-bar">
      <input type="text" id="global-search" class="search-input" placeholder="Buscar por nome, email, telefone ou CPF">
    </div>

    <div class="dashboard-cards">
      <div class="card-metric">
        <span class="card-number" id="metric-1">0</span>
        <span class="card-label">${card1Label}</span>
      </div>
      <div class="card-metric">
        <span class="card-number" id="metric-2">0</span>
        <span class="card-label">${card2Label}</span>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            ${columns.map(col => `<th>${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody id="table-body">
          </tbody>
      </table>
    </div>
    <div class="pagination">Próxima >></div>
  `;

  updateScreenData(screenName);

  document.getElementById('global-search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    updateScreenData(screenName, term);
  });
}

function updateScreenData(screenName, searchTerm = '') {
  const tableBody = document.getElementById('table-body');
  const metric1 = document.getElementById('metric-1');
  const metric2 = document.getElementById('metric-2');
  
  let data = DB[screenName] || [];
  
  if (searchTerm) {
    data = data.filter(item => 
      item.nome.toLowerCase().includes(searchTerm) || 
      (item.email && item.email.toLowerCase().includes(searchTerm))
    );
  }

  tableBody.innerHTML = '';
  
  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="padding: 30px; color: #999;">Nenhum registro encontrado.</td></tr>`;
  } else {
    data.forEach(item => {
      let rowHTML = '';
      const tr = document.createElement('tr');

      // -- RESTAUREI A LÓGICA DE CRIAÇÃO DAS LINHAS --
      
      if (screenName === 'doacoes') {
        rowHTML = `
          <td>${item.data}</td>
          <td>${item.nome}<br><span style="font-size:12px; color:#888;">${item.email}</span></td>
          <td>R$ ${item.valor.toFixed(2).replace('.', ',')}</td>
          <td>${item.tipo}</td>
          <td>${item.status}</td>
          <td>${item.metodo}</td>
        `;
        tr.innerHTML = rowHTML;

      } else if (screenName === 'socios') {
        rowHTML = `
          <td>${item.nome}<br><span style="font-size:12px; color:#888;">${item.email}</span></td>
          <td>R$ ${item.valor.toFixed(2).replace('.', ',')}</td>
          <td>${item.status}</td>
          <td>${item.inicio}</td>
          <td>...</td>
        `;
        tr.innerHTML = rowHTML;

      } else if (screenName === 'voluntarios') {
        // --- AQUI ESTÁ A ÚNICA MUDANÇA: CLIQUE PARA ABRIR O MODAL ---
        tr.style.cursor = "pointer"; // Mãozinha ao passar o mouse
        
        // Classes CSS para colorir o status (igual na imagem)
        let badgeClass = '';
        if(item.status === 'Aprovado') badgeClass = 'status-aprovado'; // Você precisa ter esse CSS ou usar style direto
        else if(item.status === 'Rejeitado') badgeClass = 'status-rejeitado';
        else badgeClass = 'status-analise';

        // Estilo inline apenas para garantir cores caso falte no CSS
        const colors = {
          'Aprovado': '#B4D7A8',
          'Rejeitado': '#F6989D',
          'Em análise': '#FBCB78'
        };
        const bg = colors[item.status] || '#eee';

        rowHTML = `
          <td>${item.data}</td>
          <td>${item.nome}</td>
          <td>${item.area}</td>
          <td>${item.especialidade}</td>
          <td>
            <span style="background-color: ${bg}; padding: 5px 10px; border-radius: 12px; color: black; font-weight: 600;">
              ${item.status}
            </span>
          </td>
        `;
        tr.innerHTML = rowHTML;
        
        // EVENTO DE CLIQUE NO VOLUNTÁRIO
        tr.addEventListener('click', () => openVolunteerModal(item));
      }
      
      tableBody.appendChild(tr);
    });
  }

  // -- RESTAUREI SEUS CÁLCULOS (MÉTRICAS) --
  if (screenName === 'doacoes') {
    metric1.innerText = data.length; 
    const total = data.reduce((acc, cur) => acc + cur.valor, 0);
    metric2.innerText = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  } else if (screenName === 'socios') {
    const ativos = data.filter(d => d.status === 'Ativa').length;
    metric1.innerText = ativos;
    const receita = data.filter(d => d.status === 'Ativa').reduce((acc, cur) => acc + cur.valor, 0);
    metric2.innerText = receita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  } else if (screenName === 'voluntarios') {
    metric1.innerText = data.length;
    const novos = data.filter(d => d.status === 'Novo' || d.status === 'Em análise').length;
    metric2.innerText = novos + ' novas inscrições';
  }
}

// ============================================================
// 5. NOVA FUNCIONALIDADE: MODAL DE VOLUNTÁRIOS
// ============================================================

function openVolunteerModal(volunteer) {
  const oldModal = document.getElementById('volunteer-modal');
  if (oldModal) oldModal.remove();

  const modalHtml = `
    <div class="modal-overlay" id="volunteer-modal">
      <div class="modal-card">
        <span class="close-modal" id="close-btn">&times;</span>
        <h2 class="modal-title">Detalhes do Voluntário</h2>
        <div class="modal-info">
          <p><strong>Nome:</strong> ${volunteer.nome}</p>
          <p><strong>Contato:</strong> ${volunteer.email} | ${volunteer.telefone || 'Sem telefone'}</p>
          <p><strong>Área:</strong> ${volunteer.area}</p>
          <p><strong>Especialidade:</strong> ${volunteer.especialidade}</p>
          <p><strong>Data da Inscrição:</strong> ${volunteer.data}</p>
          <p><strong>Disponibilidade:</strong> ${volunteer.disponibilidade || 'Não informada'}</p>
        </div>
        <div class="modal-actions">
          <button class="btn-action btn-analise" id="btn-status-analise">Em análise</button>
          <button class="btn-action btn-aprovado" id="btn-status-aprovado">Aprovado</button>
          <button class="btn-action btn-rejeitado" id="btn-status-rejeitado">Rejeitado</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modal = document.getElementById('volunteer-modal');
  document.getElementById('close-btn').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  document.getElementById('btn-status-analise').addEventListener('click', () => updateStatus(volunteer.id, 'Em análise'));
  document.getElementById('btn-status-aprovado').addEventListener('click', () => updateStatus(volunteer.id, 'Aprovado'));
  document.getElementById('btn-status-rejeitado').addEventListener('click', () => updateStatus(volunteer.id, 'Rejeitado'));
}

function updateStatus(id, newStatus) {
  const vol = DB.voluntarios.find(v => v.id === id);
  if (vol) {
    vol.status = newStatus;
    const modal = document.getElementById('volunteer-modal');
    if (modal) modal.remove();
    updateScreenData('voluntarios', document.getElementById('global-search').value);
  }
}

renderLogin();