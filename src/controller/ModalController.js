// Gerencia todo o fluxo do modal

// /src/controller/ModalController.js
// Gerencia todo o estado e lógica dos modais (Doação e Agradecimento).

import { DonationState } from '../model/DonationState.js';
import * as Validation from '../model/ValidationService.js';
import { ThankYouModalContent } from '../view/components/ThankYouModalContent.js';

// --- Seletores de DOM (Globais do Modal) ---
let overlay, modalContainer, flowCard, allSteps, backButton, closeModalButton;
let totalUnitariaDisplay, totalSocioDisplay;
let thankYouOverlay, thankYouContainer, thankYouTitle, thankYouText1, thankYouText2, thankYouText3, thankYouButton;

let stepHistory = [];

/**
 * Seleciona todos os elementos do DOM necessários para os modais
 */
function cacheSelectors() {
  // Modal de Doação
  overlay = document.getElementById('donation-modal-overlay');
  modalContainer = document.getElementById('modal-container');
  flowCard = document.getElementById('modal-donation-flow');
  allSteps = flowCard.querySelectorAll('.modal-step');
  backButton = document.getElementById('modal-back-button');
  closeModalButton = document.getElementById('modal-close-button');
  totalUnitariaDisplay = document.getElementById('total-unitaria-display');
  totalSocioDisplay = document.getElementById('total-socio-display');

  // Modal de Agradecimento
  thankYouOverlay = document.getElementById('thank-you-modal-overlay');
  thankYouContainer = document.getElementById('thank-you-modal-container');
  thankYouTitle = document.getElementById('thank-you-title');
  thankYouText1 = document.getElementById('thank-you-text1');
  thankYouText2 = document.getElementById('thank-you-text2');
  thankYouText3 = document.getElementById('thank-you-text3');
  thankYouButton = document.getElementById('thank-you-ok-button');
}

/**
 * Exibe o modal de doação
 */
function showModal() {
  overlay.style.display = 'block';
  modalContainer.style.display = 'flex'; 
  document.body.classList.add('modal-open');
}

/**
 * Esconde o modal de doação
 */
function hideModal() {
  if (overlay) overlay.style.display = 'none';
  if (modalContainer) modalContainer.style.display = 'none'; 
  document.body.classList.remove('modal-open');
  stepHistory = [];
  showStep(null); 
}

/**
 * Exibe o modal de agradecimento
 * @param {string} type - 'unitaria', 'socio', ou 'voluntario'
 */
function showThankYouModal(type) {
  const content = ThankYouModalContent[type];
  if (!content) return;

  thankYouTitle.innerText = content.title;
  thankYouText1.innerText = content.text1;
  thankYouText2.innerText = content.text2;
  thankYouText3.innerText = content.text3;
  thankYouButton.innerText = content.button;
  
  hideModal(); // Esconde o modal de doação (se estiver aberto)
  
  thankYouOverlay.style.display = 'block';
  thankYouContainer.style.display = 'flex';
  document.body.classList.add('modal-open');
}

/**
 * Esconde o modal de agradecimento
 */
function hideThankYouModal() {
  if (thankYouOverlay) thankYouOverlay.style.display = 'none';
  if (thankYouContainer) thankYouContainer.style.display = 'none';
  document.body.classList.remove('modal-open');
}

/**
 * Exibe um passo específico do fluxo de doação
 * @param {string | null} stepName - O valor de 'data-step' (ex: '1', '2', '3-unitaria')
 */
function showStep(stepName) {
  if (!flowCard) return; 
  allSteps.forEach(step => step.style.display = 'none');
  if (stepName) {
    const stepToShow = flowCard.querySelector(`.modal-step[data-step="${stepName}"]`);
    if (stepToShow) stepToShow.style.display = 'flex';
  }
  if (backButton) backButton.style.display = stepHistory.length > 0 ? 'block' : 'none';
}

/**
 * Navega para um novo passo, adicionando o atual ao histórico
 * @param {string} stepName - O 'data-step' do próximo passo
 */
function navigateToStep(stepName) {
  const currentStepEl = flowCard.querySelector('.modal-step[style*="display: flex"]');
  if (currentStepEl) {
    stepHistory.push(currentStepEl.dataset.step);
  }
  showStep(stepName);
}

/**
 * Atualiza os displays de total no modal (passo 3)
 */
function updateTotals() {
  const { amount } = DonationState.get();
  totalUnitariaDisplay.innerText = `R$ ${amount}`;
  totalSocioDisplay.innerText = `R$ ${amount}/mês`;
}

/**
 * Abre o modal de doação
 * @param {string} [type=null] - 'unitaria' ou 'socio' (se nulo, usa o valor do form)
 * @param {number} [startStep=1] - Passo inicial (1 ou 2)
 * @param {string} [formId=null] - ID do formulário para pegar os dados (ex: 'inline-donation-form')
 */
function openModal(type = null, startStep = 1, formId = null) {
  stepHistory = [];
  
  // Se os dados vêm de um formulário externo (ex: 'inline-donation-form')
  if (startStep === 2 && formId) {
    DonationState.updateFromForm(formId);
  }
  
  const modalForm = document.getElementById('modal-donation-form');
  const unitariaBtn = modalForm.querySelector('.option-button[data-value="unitaria"]');
  const socioBtn = modalForm.querySelector('.option-button[data-value="socio"]');
  
  // Se um tipo foi forçado (ex: clique no link "Seja Sócio")
  if (type) {
    DonationState.setType(type);
  }

  const { type: currentType, amount: currentAmount } = DonationState.get();

  // Sincroniza o formulário do modal (Passo 1) com o estado
  if (currentType === 'socio') {
    unitariaBtn.classList.remove('active');
    socioBtn.classList.add('active');
  } else {
    unitariaBtn.classList.add('active');
    socioBtn.classList.remove('active');
  }
  modalForm.querySelector('.amount-input').value = currentAmount;
  
  updateTotals();
  showModal();
  
  if (startStep === 2) {
    navigateToStep('2');
  } else {
    showStep('1');
  }

  // Re-valida os formulários do modal
  initModalFormValidation();
}

/**
 * Configura um formulário de doação (botões e input)
 * @param {string} formId - ID do elemento do formulário
 */
function setupDonationForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  
  const optionButtons = form.querySelectorAll('.option-button');
  const amountInput = form.querySelector('.amount-input');

  optionButtons.forEach(button => {
    button.addEventListener('click', () => {
      const group = button.dataset.group; 
      
      form.querySelectorAll(`.option-button[data-group="${group}"]`).forEach(btn => {
        btn.classList.remove('active');
      });
      button.classList.add('active');

      if (group === 'amount') {
        if (amountInput) {
          amountInput.value = button.dataset.value;
        }
      }
      
      // Atualiza o Model de Estado
      DonationState.updateFromForm(formId);
    });
  });

  if (amountInput) {
    amountInput.addEventListener('input', () => {
      form.querySelectorAll(`.option-button[data-group="amount"]`).forEach(btn => {
        btn.classList.remove('active');
      });
      // Atualiza o Model de Estado
      DonationState.updateFromForm(formId);
    });
  }
  // Sincroniza o estado no carregamento inicial
  DonationState.updateFromForm(formId);
}

/**
 * Inicializa a lógica de abas (Pix, Boleto, Cartão) do Passo 3 Unitária
 */
function initUnitaryPaymentTabs() {
  const step = document.querySelector('.modal-step[data-step="3-unitaria"]');
  if (!step) return;

  const paymentButtons = step.querySelectorAll('.payment-option-button');
  const paymentBlocks = step.querySelectorAll('.payment-content-block');

  paymentButtons.forEach(button => {
    button.addEventListener('click', () => {
      paymentButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      const targetId = button.dataset.target;
      paymentBlocks.forEach(block => {
        block.classList.toggle('active', block.id === `payment-content-${targetId}`);
      });
      
      // Re-valida o formulário de cartão se ele for ativado
      initUnitaryCardValidation();
    });
  });
}

/**
 * Função de copiar para clipboard
 */
function copyToClipboard(inputId, buttonId) {
  const input = document.getElementById(inputId);
  const button = document.getElementById(buttonId);
  if (!input || !button) return;

  input.select(); 
  input.setSelectionRange(0, 99999); 

  try {
    document.execCommand('copy');
    const originalText = button.innerText; 
    button.innerText = 'Copiado!'; 
    
    setTimeout(() => {
      button.innerText = originalText;
    }, 2000);
    
    return true; // Sucesso
  } catch (err) {
    console.error('Falha ao copiar: ', err);
    return false; // Falha
  }
}

// --- Funções de Validação Específicas do Modal ---

function initStep2Validation() {
  const step2Form = document.getElementById('step-2-form');
  if (!step2Form) return;

  const step2Inputs = step2Form.querySelectorAll('.form-input');
  const step2Button = step2Form.querySelector('.button-primary-gradient');
  
  function validate() { Validation.validateForm(step2Inputs, step2Button); }
  
  // Máscaras
  document.getElementById('modal-cpf')?.addEventListener('input', (e) => e.target.value = Validation.maskCPF(e.target.value));
  document.getElementById('modal-telefone')?.addEventListener('input', (e) => e.target.value = Validation.maskTelefone(e.target.value));
  
  step2Inputs.forEach(input => input.addEventListener('input', validate));
  validate(); // Estado inicial
}

function initSocioCardValidation() {
  const socioForm = document.getElementById('step-3-socio-form');
  if (!socioForm) return;

  const socioInputs = socioForm.querySelectorAll('#socio-card-numero, #socio-card-vencimento, #socio-card-cvv');
  const socioButton = socioForm.querySelector('.button-primary-gradient');
  
  function validate() { Validation.validateForm(socioInputs, socioButton); }

  // Máscaras
  document.getElementById('socio-card-numero')?.addEventListener('input', (e) => e.target.value = Validation.maskCardNumber(e.target.value));
  document.getElementById('socio-card-vencimento')?.addEventListener('input', (e) => e.target.value = Validation.maskExpiry(e.target.value));
  document.getElementById('socio-card-cvv')?.addEventListener('input', (e) => e.target.value = Validation.maskCVV(e.target.value));
  
  socioButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (socioButton.disabled) return;
    showThankYouModal('socio');
  });

  socioInputs.forEach(input => input.addEventListener('input', validate));
  validate(); // Estado inicial
}

function initUnitaryCardValidation() {
  const unitariaForm = document.getElementById('step-3-unitaria-form');
  if (!unitariaForm) return;

  const unitariaButton = unitariaForm.querySelector('#payment-content-cartao .button-primary-gradient');
  const cartaoInputs = unitariaForm.querySelectorAll('#unitaria-card-numero, #unitaria-card-vencimento, #unitaria-card-cvv');

  function validate() {
    const activeTab = unitariaForm.querySelector('.payment-option-button.active');
    if (!activeTab || activeTab.dataset.target !== 'cartao') {
      unitariaButton.disabled = true; // Desabilita se não for a aba de cartão
      return;
    }
    Validation.validateForm(cartaoInputs, unitariaButton);
  }
  
  // Máscaras
  document.getElementById('unitaria-card-numero')?.addEventListener('input', (e) => e.target.value = Validation.maskCardNumber(e.target.value));
  document.getElementById('unitaria-card-vencimento')?.addEventListener('input', (e) => e.target.value = Validation.maskExpiry(e.target.value));
  document.getElementById('unitaria-card-cvv')?.addEventListener('input', (e) => e.target.value = Validation.maskCVV(e.target.value));

  unitariaButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (unitariaButton.disabled) return;
    showThankYouModal('unitaria');
  });
  
  cartaoInputs.forEach(input => input.addEventListener('input', validate));
  validate(); // Estado inicial
}

/**
 * Roda todas as funções de validação dos formulários do modal
 */
function initModalFormValidation() {
  initStep2Validation();
  initSocioCardValidation();
  initUnitaryCardValidation();
}

/**
 * Anexa todos os ouvintes de eventos globais e internos do modal
 */
function initEventListeners() {
  // --- Gatilhos Globais (Header, Footer, etc.) ---
  
  // Unitária (Passo 1)
  const standardModalTriggers = [
    'trigger-modal-step1', // Header
    'trigger-modal-small', // Seção 2 (Quem Somos)
    'trigger-modal-cta', // Seção CTA
    'trigger-modal-features', // Seção Features
    'trigger-modal-footer' // Footer
  ];
  standardModalTriggers.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', (e) => { e.preventDefault(); openModal('unitaria', 1); });
  });

  // Sócio (Passo 1)
  const socioModalTriggers = [
    'trigger-modal-socio-nav', // Header
    'trigger-modal-socio-cta' // Seção "Como Ajudar"
  ];
  socioModalTriggers.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', (e) => { e.preventDefault(); openModal('socio', 1); });
  });

  // --- Controles de Fechar/Voltar (Modal Doação) ---
  if (closeModalButton) closeModalButton.addEventListener('click', hideModal);
  if (overlay) overlay.addEventListener('click', hideModal);
  if (backButton) backButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (stepHistory.length > 0) {
      const previousStep = stepHistory.pop();
      showStep(previousStep);
    }
  });

  // --- Controles de Fechar (Modal Agradecimento) ---
  if (thankYouButton) thankYouButton.addEventListener('click', hideThankYouModal);
  if (thankYouOverlay) thankYouOverlay.addEventListener('click', hideThankYouModal);

  // --- Controles de Navegação Interna (Modal Doação) ---
  
  // Passo 1 -> Passo 2
  document.getElementById('modal-goto-step2')?.addEventListener('click', (e) => {
    e.preventDefault();
    DonationState.updateFromForm('modal-donation-form');
    updateTotals();
    navigateToStep('2');
  });
  
  // Passo 2 -> Passo 3
  document.getElementById('modal-goto-step3')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (document.getElementById('modal-goto-step3').disabled) return;
    
    const { type } = DonationState.get();
    navigateToStep(type === 'unitaria' ? '3-unitaria' : '3-socio');
  });

  // --- Controles Específicos (Passo 3) ---
  
  // Abas de Pagamento (Pix/Boleto/Cartão)
  initUnitaryPaymentTabs();
  
  // Botões de Copiar
  document.getElementById('copy-pix-button')?.addEventListener('click', () => {
    if (copyToClipboard('pix-code-input', 'copy-pix-button')) {
      showThankYouModal('unitaria');
    }
  });

  document.getElementById('copy-boleto-button')?.addEventListener('click', () => {
    if (copyToClipboard('boleto-code-input', 'copy-boleto-button')) {
      showThankYouModal('unitaria');
    }
  });
}


export const ModalController = {
  /**
   * Inicializa o controlador do modal. 
   * Deve ser chamado uma vez quando o app carregar (no main.js).
   */
  initGlobal: () => {
    cacheSelectors();
    initEventListeners();
    setupDonationForm('modal-donation-form'); // Configura o form do passo 1
    initModalFormValidation(); // Configura as validações dos passos 2 e 3
    hideModal(); // Garante que tudo comece escondido
    hideThankYouModal();
  },

  /**
   * Abre o modal de doação (usado por controllers externos)
   */
  openModal: openModal,

  /**
   * Exibe o modal de agradecimento (usado por controllers externos)
   */
  showThankYouModal: showThankYouModal
};