import './style.css';
import loginScreenHtml from './view/LoginScreen.html?raw';
import dashboardScreenHtml from './view/DashboardScreen.html?raw';

const app = document.querySelector('#app');

// ============================================================
// 1. BANCO DE DADOS MOCK (APENAS SÓCIOS AINDA É MOCK)
// ============================================================

const DB = {
  socios: [
    { id: 1, nome: 'Maria Silva', email: 'maria@gmail.com', valor: 100.00, status: 'Ativa', inicio: '11/11/2025' },
    { id: 2, nome: 'João Souza', email: 'joao@outlook.com', valor: 50.00, status: 'Inadimplente', inicio: '08/02/2025' },
    { id: 3, nome: 'Pedro Costa', email: 'pedro@uol.com.br', valor: 200.00, status: 'Cancelada', inicio: '25/03/2025' },
  ]
};

// ============================================================
// 2. SISTEMA DE LOGIN (MOCK)
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
// 3. SISTEMA DO DASHBOARD
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
// 4. LÓGICA DE CONTEÚDO (INTEGRAÇÃO TOTAL)
// ============================================================

let voluntariosCache = [];

async function loadContent(screenName) {
  const contentArea = document.getElementById('content-area');
  
  let columns = [];
  let card1Label = '', card2Label = '';
  
  if (screenName === 'doacoes') {
    columns = ['Data/Hora', 'Doador (Nome/Email)', 'Valor', 'Status', 'ID Pagamento'];
    card1Label = 'doações registradas';
    card2Label = 'total arrecadado';
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
      <input type="text" id="global-search" class="search-input" placeholder="Buscar por nome ou email">
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
          <tr><td colspan="6" style="padding: 20px;">Carregando dados...</td></tr>
        </tbody>
      </table>
    </div>
    <div class="pagination">Próxima >></div>
  `;

  await updateScreenData(screenName);

  document.getElementById('global-search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    updateScreenData(screenName, term);
  });
}

async function updateScreenData(screenName, searchTerm = '') {
  const tableBody = document.getElementById('table-body');
  const metric1 = document.getElementById('metric-1');
  const metric2 = document.getElementById('metric-2');
  
  let data = [];

  try {
    // --- INTEGRAÇÃO VOLUNTÁRIOS ---
    if (screenName === 'voluntarios') {
        const response = await fetch('http://localhost:8080/voluntarios/admin/lista');
        const rawData = await response.json();
        
        voluntariosCache = rawData.map(v => {
            const areaObj = (v.areasDeAtuacao && v.areasDeAtuacao.length > 0) ? v.areasDeAtuacao[0] : null;
            return {
                id: v.idUsuario,
                data: formatarData(v.dataInscricao),
                nome: v.nome,
                email: v.email,
                telefone: v.telefone,
                area: areaObj ? areaObj.areaAtuacao.nome : '-',
                especialidade: areaObj ? areaObj.especialidade : '-',
                status: v.statusInscricao,
                disponibilidade: areaObj ? areaObj.disponibilidade : 'Não informada'
            };
        });
        data = voluntariosCache;
    } 
    // --- INTEGRAÇÃO DOAÇÕES ---
    else if (screenName === 'doacoes') {
        const response = await fetch('http://localhost:8080/doacoes');
        const rawData = await response.json();

        data = rawData.map(d => ({
            id: d.id,
            data: d.criadoEm ? new Date(d.criadoEm).toLocaleString('pt-BR') : '-',
            nome: d.nomeDoador,
            email: d.emailDoador,
            valor: d.valor,
            status: d.statusDoacao,
            pagamentoId: d.pagamentoId || '-',
            metodo: 'Pix/Cartão'
        }));
    }
    // --- MOCK SÓCIOS ---
    else if (screenName === 'socios') {
        data = DB[screenName] || [];
    }

  } catch (error) {
      console.error("Erro ao buscar dados:", error);
      tableBody.innerHTML = `<tr><td colspan="6" style="color: red; padding: 20px;">Erro de conexão com o servidor.</td></tr>`;
      return; 
  }
  
  // FILTRAGEM
  if (searchTerm) {
    data = data.filter(item => 
      item.nome.toLowerCase().includes(searchTerm) || 
      (item.email && item.email.toLowerCase().includes(searchTerm))
    );
  }

  // RENDERIZAÇÃO
  tableBody.innerHTML = '';
  
  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="padding: 30px; color: #999;">Nenhum registro encontrado.</td></tr>`;
  } else {
    data.forEach(item => {
      let rowHTML = '';
      const tr = document.createElement('tr');

      if (screenName === 'doacoes') {
        // Cores para status da doação
        const statusColor = item.status === 'PAID' ? 'green' : (item.status === 'PENDING' ? 'orange' : 'red');
        
        rowHTML = `
          <td>${item.data}</td>
          <td>${item.nome}<br><span style="font-size:12px; color:#888;">${item.email}</span></td>
          <td>${item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
          <td><span style="color:${statusColor}; font-weight:bold;">${item.status}</span></td>
          <td>${item.pagamentoId}</td>
        `;
        tr.innerHTML = rowHTML;

      } else if (screenName === 'socios') {
        const isCancelled = item.status === 'Cancelada';
        const btnDisabled = isCancelled ? 'disabled' : '';
        const btnText = isCancelled ? 'Cancelado' : 'Cancelar';

        rowHTML = `
          <td>${item.nome}<br><span style="font-size:12px; color:#888;">${item.email}</span></td>
          <td>${item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
          <td>${item.status}</td>
          <td>${item.inicio}</td>
          <td>
            <button class="btn-cancel-donation" id="btn-cancel-${item.id}" ${btnDisabled}>
              ${btnText}
            </button>
          </td>
        `;
        tr.innerHTML = rowHTML;

        // Só adiciona o clique se NÃO estiver cancelado
        if (!isCancelled) {
          setTimeout(() => {
            const btn = tr.querySelector(`#btn-cancel-${item.id}`);
            if (btn) btn.addEventListener('click', () => cancelSocio(item.id));
          }, 0);
        }

      } else if (screenName === 'voluntarios') {
        tr.style.cursor = "pointer"; 
        const statusConfig = getStatusConfig(item.status);
        const dataFormatada = formatarData(item.data); // Usa a data já formatada se vier do objeto

        rowHTML = `
          <td>${dataFormatada}</td>
          <td>${item.nome}</td>
          <td>${item.area}</td>
          <td>${item.especialidade}</td>
          <td>
            <span style="background-color: ${statusConfig.bg}; padding: 5px 10px; border-radius: 12px; color: black; font-weight: 600;">
              ${statusConfig.label}
            </span>
          </td>
        `;
        tr.innerHTML = rowHTML;
        tr.addEventListener('click', () => openVolunteerModal(item));
      }
      
      tableBody.appendChild(tr);
    });
  }

  // CÁLCULO DE MÉTRICAS
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
    const novos = data.filter(d => d.status === 'PENDENTE_ANALISE').length;
    metric2.innerText = novos + ' em análise';
  }
}

// --- Funções Auxiliares ---

function getStatusConfig(statusJava) {
    switch (statusJava) {
        case 'APROVADA': return { label: 'Aprovado', bg: '#B4D7A8' };
        case 'REJEITADA': return { label: 'Rejeitado', bg: '#F6989D' };
        case 'PENDENTE_ANALISE': return { label: 'Em análise', bg: '#FBCB78' };
        default: return { label: statusJava, bg: '#EEE' };
    }
}

function formatarData(dataString) {
    if (!dataString) return '-';
    // Se vier YYYY-MM-DD
    if (dataString.includes('-')) {
        const partes = dataString.split('-');
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
    }
    return dataString;
}

// ============================================================
// 5. MODAL DE VOLUNTÁRIOS
// ============================================================

function openVolunteerModal(volunteer) {
  const oldModal = document.getElementById('volunteer-modal');
  if (oldModal) oldModal.remove();

  const statusConfig = getStatusConfig(volunteer.status);

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
          <p><strong>Status Atual:</strong> ${statusConfig.label}</p>
          <p><strong>Disponibilidade:</strong> ${volunteer.disponibilidade}</p>
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

  document.getElementById('btn-status-analise').addEventListener('click', () => updateStatus(volunteer.id, 'PENDENTE_ANALISE'));
  document.getElementById('btn-status-aprovado').addEventListener('click', () => updateStatus(volunteer.id, 'APROVADA'));
  document.getElementById('btn-status-rejeitado').addEventListener('click', () => updateStatus(volunteer.id, 'REJEITADA'));
}

function updateStatus(id, newStatus) {
  const vol = voluntariosCache.find(v => v.id === id);
  if (vol) {
    vol.status = newStatus;
    const modal = document.getElementById('volunteer-modal');
    if (modal) modal.remove();
    updateScreenData('voluntarios', document.getElementById('global-search').value);
  }
}

function cancelSocio(id) {
  if(confirm('Tem certeza que deseja cancelar a recorrência deste sócio?')) {
    const socio = DB.socios.find(s => s.id === id);
    if(socio) {
      socio.status = 'Cancelada'; 
      updateScreenData('socios', document.getElementById('global-search').value);
    }
  }
}

renderLogin();