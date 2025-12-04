// /src/controller/Router.js
// Gerencia a navegação de página (SPA), o carregamento de views
// e a inicialização dos controllers específicos de cada página.

// Mapeamento de rotas (Vite + import ?raw)
const routes = {
  '#page-quem-somos': {
    view: () => import('../view/screens/QuemSomosScreen.html?raw'),
    controller: () => import('./QuemSomosController.js')
  },
  '#page-voluntariado': {
    view: () => import('../view/screens/VoluntariadoScreen.html?raw'),
    controller: () => import('./VoluntariadoController.js')
  },
  '#page-seja-socio': {
    view: () => import('../view/screens/SejaSocioScreen.html?raw'),
    controller: null // Sem controller específico
  }
};

const navLinks = document.querySelectorAll('.nav-link');
const appRoot = document.getElementById('app-root');

/**
 * Carrega o conteúdo da rota (View + Controller)
 */
async function loadRoute() {
  const hash = window.location.hash || '#page-quem-somos';
  const route = routes[hash];

  if (!route) {
    // Fallback para a página inicial se a rota não existir
    window.location.hash = '#page-quem-somos';
    return;
  }

  try {
    // 1. Carrega o HTML da View
    const viewModule = await route.view();
    const html = viewModule.default;
    
    // 2. Injeta o HTML no 'app-root'
    appRoot.innerHTML = html;
    
    // ★★★ CORREÇÃO APLICADA AQUI ★★★
    // 2.5. Ativa a view que acabou de ser injetada
    // Procura o elemento '.page-content' dentro do 'app-root'
    const newPageContent = appRoot.querySelector('.page-content');
    if (newPageContent) {
      // Adiciona a classe 'active' para que o CSS (display: block) funcione
      newPageContent.classList.add('active');
    }
    // ★★★ FIM DA CORREÇÃO ★★★

    // 3. Carrega e inicializa o Controller associado
    if (route.controller) {
      const controllerModule = await route.controller();
      controllerModule.init(); // Chama o init() do controller da página
    }

    // 4. Atualiza o estado 'active' dos links de navegação
    updateNavLinks(hash);

  } catch (error) {
    console.error(`Erro ao carregar a rota ${hash}:`, error);
    appRoot.innerHTML = '<p style="text-align: center; padding: 50px;">Erro ao carregar o conteúdo.</p>';
  }
}

/**
 * Atualiza a classe 'active' nos links da navegação principal
 */
function updateNavLinks(activeHash) {
  navLinks.forEach(navLink => {
    const linkHref = navLink.getAttribute('href');
    
    // Remove 'active' de todos, exceto do gatilho do modal
    if (navLink.id !== 'trigger-modal-socio-nav') {
      navLink.classList.remove('active');
    }
    
    // Adiciona 'active' ao link correspondente
    if (linkHref === activeHash) {
      navLink.classList.add('active');
    }
  });
}

/**
 * Adiciona ouvintes de clique nos links de navegação
 */
function initNavLinks() {
  navLinks.forEach(link => {
    // Ignora o link que abre o modal, pois ele é gerenciado pelo ModalController
    if (link.id === 'trigger-modal-socio-nav') {
      return;
    }
    
    link.addEventListener('click', function(e) {
      e.preventDefault(); 
      const newHash = this.getAttribute('href');
      if (window.location.hash !== newHash) {
        window.location.hash = newHash;
      }
    });
  });
}

export const Router = {
  init: () => {
    initNavLinks();
    window.addEventListener('hashchange', loadRoute);
    loadRoute(); // Carrega a rota inicial
  }
};