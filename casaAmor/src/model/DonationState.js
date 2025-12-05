// Modelo de estado da doação

// /src/model/DonationState.js
// Modelo para armazenar o estado global do fluxo de doação.

const donationState = {
  type: 'unitaria', // 'unitaria' ou 'socio'
  amount: '2.000'
};

export const DonationState = {
  get: () => ({ ...donationState }),
  
  setType: (newType) => {
    donationState.type = newType;
  },
  
  setAmount: (newAmount) => {
    donationState.amount = newAmount;
  },
  
  /**
   * Atualiza o estado a partir de um formulário de doação
   * @param {string} formId - O ID do elemento do formulário (ex: 'inline-donation-form')
   */
  updateFromForm: (formId) => {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const activeType = form.querySelector('.option-button[data-group="type"].active');
    const amountInput = form.querySelector('.amount-input');
    
    let type = activeType ? activeType.dataset.value : 'unitaria';
    if (type === 'mensal') type = 'socio'; // Converte 'mensal' (da home) para 'socio' (do modal)
    
    donationState.type = type;
    donationState.amount = amountInput ? amountInput.value : '0';
  }
};