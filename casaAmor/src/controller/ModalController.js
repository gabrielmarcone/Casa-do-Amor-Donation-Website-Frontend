// Gerencia todo o fluxo do modal
// INTEGRADO COM BACK-END JAVA (PIX E CARTÃO REAIS)

import { DonationState } from '../model/DonationState.js';
import * as Validation from '../model/ValidationService.js';
import { ThankYouModalContent } from '../view/components/ThankYouModalContent.js';

// --- Seletores de DOM ---
let overlay, modalContainer, flowCard, allSteps, backButton, closeModalButton;
let totalUnitariaDisplay, totalSocioDisplay;
let thankYouOverlay, thankYouContainer, thankYouTitle, thankYouText1, thankYouText2, thankYouText3, thankYouButton;
let stepHistory = [];

// Cache de dados do usuário (Passo 2) para enviar ao backend
let userData = {
    nome: '',
    sobrenome: '',
    cpf: '',
    telefone: '',
    email: ''
};

function cacheSelectors() {
  overlay = document.getElementById('donation-modal-overlay');
  modalContainer = document.getElementById('modal-container');
  flowCard = document.getElementById('modal-donation-flow');
  allSteps = flowCard.querySelectorAll('.modal-step');
  backButton = document.getElementById('modal-back-button');
  closeModalButton = document.getElementById('modal-close-button');
  totalUnitariaDisplay = document.getElementById('total-unitaria-display');
  totalSocioDisplay = document.getElementById('total-socio-display');

  thankYouOverlay = document.getElementById('thank-you-modal-overlay');
  thankYouContainer = document.getElementById('thank-you-modal-container');
  thankYouTitle = document.getElementById('thank-you-title');
  thankYouText1 = document.getElementById('thank-you-text1');
  thankYouText2 = document.getElementById('thank-you-text2');
  thankYouText3 = document.getElementById('thank-you-text3');
  thankYouButton = document.getElementById('thank-you-ok-button');
}

function showModal() {
  overlay.style.display = 'block';
  modalContainer.style.display = 'flex'; 
  document.body.classList.add('modal-open');
}

function hideModal() {
  if (overlay) overlay.style.display = 'none';
  if (modalContainer) modalContainer.style.display = 'none'; 
  document.body.classList.remove('modal-open');
  stepHistory = [];
  showStep(null); 
}

function showThankYouModal(type) {
  const content = ThankYouModalContent[type];
  if (!content) return;
  thankYouTitle.innerText = content.title;
  thankYouText1.innerText = content.text1;
  thankYouText2.innerText = content.text2;
  thankYouText3.innerText = content.text3;
  thankYouButton.innerText = content.button;
  hideModal();
  thankYouOverlay.style.display = 'block';
  thankYouContainer.style.display = 'flex';
  document.body.classList.add('modal-open');
}

function hideThankYouModal() {
  if (thankYouOverlay) thankYouOverlay.style.display = 'none';
  if (thankYouContainer) thankYouContainer.style.display = 'none';
  document.body.classList.remove('modal-open');
}

function showStep(stepName) {
  if (!flowCard) return; 
  allSteps.forEach(step => step.style.display = 'none');
  if (stepName) {
    const stepToShow = flowCard.querySelector(`.modal-step[data-step="${stepName}"]`);
    if (stepToShow) stepToShow.style.display = 'flex';
  }
  if (backButton) backButton.style.display = stepHistory.length > 0 ? 'block' : 'none';
}

function navigateToStep(stepName) {
  const currentStepEl = flowCard.querySelector('.modal-step[style*="display: flex"]');
  if (currentStepEl) {
    stepHistory.push(currentStepEl.dataset.step);
  }
  showStep(stepName);
}

function updateTotals() {
  const { amount } = DonationState.get();
  totalUnitariaDisplay.innerText = `R$ ${amount}`;
  totalSocioDisplay.innerText = `R$ ${amount}/mês`;
}

function openModal(type = null, startStep = 1, formId = null) {
  stepHistory = [];
  if (startStep === 2 && formId) {
    DonationState.updateFromForm(formId);
  }
  const modalForm = document.getElementById('modal-donation-form');
  const unitariaBtn = modalForm.querySelector('.option-button[data-value="unitaria"]');
  const socioBtn = modalForm.querySelector('.option-button[data-value="socio"]');
  
  if (type) DonationState.setType(type);

  const { type: currentType, amount: currentAmount } = DonationState.get();

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
  initModalFormValidation();
}

function setupDonationForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  const optionButtons = form.querySelectorAll('.option-button');
  const amountInput = form.querySelector('.amount-input');

  optionButtons.forEach(button => {
    button.addEventListener('click', () => {
      const group = button.dataset.group; 
      form.querySelectorAll(`.option-button[data-group="${group}"]`).forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      if (group === 'amount' && amountInput) {
        amountInput.value = button.dataset.value;
      }
      DonationState.updateFromForm(formId);
    });
  });

  if (amountInput) {
    amountInput.addEventListener('input', () => {
      form.querySelectorAll(`.option-button[data-group="amount"]`).forEach(btn => btn.classList.remove('active'));
      DonationState.updateFromForm(formId);
    });
  }
  DonationState.updateFromForm(formId);
}

// --- INTEGRAÇÃO COM BACK-END (CHAMADA HTTP) ---

async function createRealDonation(paymentMethod) {
    const { amount } = DonationState.get();
    
    // Remove pontos (ex: 2.000 -> 2000) e substitui vírgula por ponto (caso exista)
    const cleanAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));

    const payload = {
        valor: cleanAmount,
        descricao: "Doação para Casa do Amor",
        metodoPagamento: paymentMethod, // "PIX", "credit_card"
        nomeDoador: `${userData.nome} ${userData.sobrenome}`,
        emailDoador: userData.email,
        documentoNumero: userData.cpf.replace(/\D/g, ''),
        documentoTipo: "CPF"
    };

    try {
        const response = await fetch('http://localhost:8080/doacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Erro na API de doação');
        return await response.json();

    } catch (error) {
        console.error("Erro ao criar doação:", error);
        alert("Erro ao conectar com o servidor de pagamento. Verifique se o Back-end está rodando.");
        return null;
    }
}

// --- AUXILIAR: Carrega Pix se a aba estiver ativa (Correção do Carregamento Automático) ---
async function loadPixIfActive() {
    const pixBlock = document.getElementById('payment-content-pix');
    // Verifica se a aba Pix está visível/ativa e se estamos no passo 3-unitaria
    if (pixBlock && pixBlock.classList.contains('active')) {
        const pixQrContainer = pixBlock.querySelector('.mock-qr-code');
        const pixCopyInput = document.getElementById('pix-code-input');

        // Mostra carregando imediatamente
        pixQrContainer.innerHTML = '<div style="padding:40px; text-align:center; color:#666;">Gerando QR Code Pix...<br><small>Aguarde...</small></div>';
        pixCopyInput.value = 'Gerando código...';

        const donationData = await createRealDonation('PIX');

        if (donationData && donationData.qrCodeImg) {
            pixQrContainer.innerHTML = `<img src="data:image/png;base64,${donationData.qrCodeImg}" alt="QR Code Pix" style="width: 100%; height: 100%; object-fit: contain;">`;
            pixCopyInput.value = donationData.qrCode;
        } else {
            pixQrContainer.innerHTML = '<p style="color:red; text-align:center;">Erro ao gerar Pix.</p>';
            pixCopyInput.value = '';
        }
    }
}

// --- Lógica de Abas do Passo 3 ---

function initUnitaryPaymentTabs() {
  const step = document.querySelector('.modal-step[data-step="3-unitaria"]');
  if (!step) return;

  const paymentButtons = step.querySelectorAll('.payment-option-button');
  const paymentBlocks = step.querySelectorAll('.payment-content-block');

  paymentButtons.forEach(button => {
    button.addEventListener('click', async () => {
      // 1. Alterna visualmente as abas
      paymentButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      const targetId = button.dataset.target; // 'pix', 'boleto', 'cartao'
      
      paymentBlocks.forEach(block => {
        block.classList.toggle('active', block.id === `payment-content-${targetId}`);
      });

      // 2. Se clicou no Pix, chama a função de carregar (Reuso da função)
      if (targetId === 'pix') {
          loadPixIfActive();
      }
      
      initUnitaryCardValidation();
    });
  });
}

function copyToClipboard(inputId, buttonId) {
  const input = document.getElementById(inputId);
  const button = document.getElementById(buttonId);
  if (!input || !button) return;
  
  if(!input.value || input.value === 'Aguarde...' || input.value === 'Gerando código...') return;

  input.select(); 
  input.setSelectionRange(0, 99999); 
  try {
    document.execCommand('copy');
    const originalText = button.innerText; 
    button.innerText = 'Copiado!'; 
    setTimeout(() => { button.innerText = originalText; }, 2000);
    return true; 
  } catch (err) {
    console.error('Falha ao copiar: ', err);
    return false;
  }
}

function initStep2Validation() {
  const step2Form = document.getElementById('step-2-form');
  if (!step2Form) return;

  const step2Inputs = step2Form.querySelectorAll('.form-input');
  const step2Button = step2Form.querySelector('.button-primary-gradient');
  
  function validate() { Validation.validateForm(step2Inputs, step2Button); }
  
  document.getElementById('modal-cpf')?.addEventListener('input', (e) => e.target.value = Validation.maskCPF(e.target.value));
  document.getElementById('modal-telefone')?.addEventListener('input', (e) => e.target.value = Validation.maskTelefone(e.target.value));
  
  step2Inputs.forEach(input => input.addEventListener('input', validate));
  validate(); 
}

function initSocioCardValidation() {
  const socioForm = document.getElementById('step-3-socio-form');
  if (!socioForm) return;
  const socioInputs = socioForm.querySelectorAll('#socio-card-numero, #socio-card-vencimento, #socio-card-cvv');
  const socioButton = socioForm.querySelector('.button-primary-gradient');
  function validate() { Validation.validateForm(socioInputs, socioButton); }
  document.getElementById('socio-card-numero')?.addEventListener('input', (e) => e.target.value = Validation.maskCardNumber(e.target.value));
  document.getElementById('socio-card-vencimento')?.addEventListener('input', (e) => e.target.value = Validation.maskExpiry(e.target.value));
  document.getElementById('socio-card-cvv')?.addEventListener('input', (e) => e.target.value = Validation.maskCVV(e.target.value));
  socioButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (socioButton.disabled) return;
    showThankYouModal('socio');
  });
  socioInputs.forEach(input => input.addEventListener('input', validate));
  validate();
}

// --- INTEGRADA CARTÃO ---

function initUnitaryCardValidation() {
  const unitariaForm = document.getElementById('step-3-unitaria-form');
  if (!unitariaForm) return;

  const unitariaButton = unitariaForm.querySelector('#payment-content-cartao .button-primary-gradient');
  const cartaoInputs = unitariaForm.querySelectorAll('#unitaria-card-numero, #unitaria-card-vencimento, #unitaria-card-cvv');

  function validate() {
    const activeTab = unitariaForm.querySelector('.payment-option-button.active');
    if (!activeTab || activeTab.dataset.target !== 'cartao') {
      unitariaButton.disabled = true;
      return;
    }
    Validation.validateForm(cartaoInputs, unitariaButton);
  }
  
  document.getElementById('unitaria-card-numero')?.addEventListener('input', (e) => e.target.value = Validation.maskCardNumber(e.target.value));
  document.getElementById('unitaria-card-vencimento')?.addEventListener('input', (e) => e.target.value = Validation.maskExpiry(e.target.value));
  document.getElementById('unitaria-card-cvv')?.addEventListener('input', (e) => e.target.value = Validation.maskCVV(e.target.value));

  // ENVIO DO CARTÃO
  unitariaButton.addEventListener('click', async (e) => {
    e.preventDefault();
    if (unitariaButton.disabled) return;

    // Feedback visual
    const originalText = unitariaButton.innerText;
    unitariaButton.innerText = "Processando...";
    unitariaButton.disabled = true;

    // Chama o Back-end
    const result = await createRealDonation('credit_card');

    if (result) {
        showThankYouModal('unitaria');
    } else {
        alert("Erro ao processar pagamento com cartão.");
    }

    // Restaura botão
    unitariaButton.innerText = originalText;
    unitariaButton.disabled = false;
  });
  
  cartaoInputs.forEach(input => input.addEventListener('input', validate));
  validate(); 
}

function initModalFormValidation() {
  initStep2Validation();
  initSocioCardValidation();
  initUnitaryCardValidation();
}

function initEventListeners() {
  const standardModalTriggers = ['trigger-modal-step1', 'trigger-modal-small', 'trigger-modal-cta', 'trigger-modal-features', 'trigger-modal-footer'];
  standardModalTriggers.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', (e) => { e.preventDefault(); openModal('unitaria', 1); });
  });

  const socioModalTriggers = ['trigger-modal-socio-nav', 'trigger-modal-socio-cta'];
  socioModalTriggers.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', (e) => { e.preventDefault(); openModal('socio', 1); });
  });

  if (closeModalButton) closeModalButton.addEventListener('click', hideModal);
  if (overlay) overlay.addEventListener('click', hideModal);
  if (backButton) backButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (stepHistory.length > 0) {
      const previousStep = stepHistory.pop();
      showStep(previousStep);
    }
  });

  if (thankYouButton) thankYouButton.addEventListener('click', hideThankYouModal);
  if (thankYouOverlay) thankYouOverlay.addEventListener('click', hideThankYouModal);

  // --- NAVEGAÇÃO INTERNA COM CAPTURA DE DADOS ---
  
  // Passo 1 -> Passo 2
  document.getElementById('modal-goto-step2')?.addEventListener('click', (e) => {
    e.preventDefault();
    DonationState.updateFromForm('modal-donation-form');
    updateTotals();
    navigateToStep('2');
  });
  
  // Passo 2 -> Passo 3 (CAPTURA DADOS E CARREGA PIX SE NECESSÁRIO)
  document.getElementById('modal-goto-step3')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (document.getElementById('modal-goto-step3').disabled) return;
    
    // Salva os dados do formulário do Passo 2 na variável global
    userData.nome = document.getElementById('modal-nome').value;
    userData.sobrenome = document.getElementById('modal-sobrenome').value;
    userData.cpf = document.getElementById('modal-cpf').value;
    userData.telefone = document.getElementById('modal-telefone').value;
    userData.email = document.getElementById('modal-email').value;

    const { type } = DonationState.get();
    navigateToStep(type === 'unitaria' ? '3-unitaria' : '3-socio');

    // CORREÇÃO: Se for doação unitária, verifica se precisa carregar o Pix imediatamente
    if (type === 'unitaria') {
        loadPixIfActive();
    }
  });

  initUnitaryPaymentTabs();
  
  document.getElementById('copy-pix-button')?.addEventListener('click', () => {
    if (copyToClipboard('pix-code-input', 'copy-pix-button')) {
      // showThankYouModal('unitaria'); 
    }
  });

  document.getElementById('copy-boleto-button')?.addEventListener('click', () => {
    if (copyToClipboard('boleto-code-input', 'copy-boleto-button')) {
      showThankYouModal('unitaria');
    }
  });
}

export const ModalController = {
  initGlobal: () => {
    cacheSelectors();
    initEventListeners();
    setupDonationForm('modal-donation-form'); 
    initModalFormValidation(); 
    hideModal(); 
    hideThankYouModal();
  },
  openModal: openModal,
  showThankYouModal: showThankYouModal
};