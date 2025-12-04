// /src/main.js
// Ponto de entrada principal da aplicação (Vite)

// Importa o CSS global
import './style.css';

// Importa os controladores principais
import { Router } from './controller/Router.js';
import { ModalController } from './controller/ModalController.js';

/**
 * Função de inicialização do App
 */
function bootstrap() {
  // Inicializa o controlador global do modal
  // Ele vai anexar ouvintes aos gatilhos no Header, Footer, etc.
  ModalController.initGlobal();

  // Inicializa o roteador
  // Ele vai carregar a página inicial (com seu controller) e ouvir mudanças de hash.
  Router.init();
}

// Inicia a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', bootstrap);