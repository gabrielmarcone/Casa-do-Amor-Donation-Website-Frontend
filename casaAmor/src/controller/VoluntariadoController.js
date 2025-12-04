// Lógica da pág. Voluntariado

// /src/controller/VoluntariadoController.js
// Controlador para a view 'VoluntariadoScreen.html'.
// Gerencia a validação, máscaras e envio do formulário.

import { ModalController } from './ModalController.js';
import * as Validation from '../model/ValidationService.js';

export function init() {
  const volForm = document.getElementById('volunteer-form');
  if (!volForm) return;

  const volInputs = volForm.querySelectorAll('.form-input');
  const volButton = volForm.querySelector('.volunteer-submit-button');
  const volTelInput = document.getElementById('vol-telefone');

  function validate() {
    Validation.validateForm(volInputs, volButton);
  }

  // Aplica máscaras
  if (volTelInput) {
    volTelInput.addEventListener('input', (e) => {
      e.target.value = Validation.maskTelefone(e.target.value);
    });
  }

  // Adiciona ouvintes de validação
  volInputs.forEach(input => input.addEventListener('input', validate));
  
  // Lógica de envio
  volForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (volButton.disabled) return;
    
    // Exibe o modal de "Obrigado" (tipo 'voluntario')
    ModalController.showThankYouModal('voluntario');
    
    volForm.reset(); // Limpa o formulário
    validate(); // Desabilita o botão novamente
  });
  
  validate(); // Estado inicial (botão desabilitado)
}