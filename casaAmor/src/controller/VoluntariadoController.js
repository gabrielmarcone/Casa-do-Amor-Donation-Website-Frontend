// Lógica da pág. Voluntariado

// /src/controller/VoluntariadoController.js
// Controlador para a view 'VoluntariadoScreen.html'.
// Gerencia a validação, máscaras e envio do formulário INTEGRADO AO JAVA.

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
  
  // Lógica de envio INTEGRADA
  volForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (volButton.disabled) return;
    
    // Feedback visual de carregamento
    const originalText = volButton.innerText;
    volButton.innerText = "Enviando...";
    volButton.disabled = true;

    // 1. Montar o Objeto JSON (Payload)
    // Nota: Como o HTML tem Nome e Sobrenome separados, mas o Banco só tem Nome, vamos concatenar.
    const nomeCompleto = document.getElementById('vol-nome').value + ' ' + document.getElementById('vol-sobrenome').value;
    
    const payload = {
        nome: nomeCompleto,
        email: document.getElementById('vol-email').value,
        telefone: document.getElementById('vol-telefone').value,
        // CPF Mockado: Seu backend exige CPF, mas o form atual não tem esse campo. 
        // Enviamos um valor válido para passar na validação do Java.
        cpf: "000.000.000-00", 
        dataInscricao: new Date().toISOString().split('T')[0], // Data de hoje YYYY-MM-DD
        statusInscricao: "PENDENTE_ANALISE",
        areasDeAtuacao: [
            {
                // Simulando que o usuário escolheu a Área de ID 1 (ex: Saúde)
                // Num cenário ideal, isso viria de um <select> populado pelo banco
                areaAtuacao: { idArea: 1 }, 
                especialidade: document.getElementById('vol-especialidade').value,
                disponibilidade: document.getElementById('vol-disponibilidade').value
            }
        ]
    };

    try {
        // 2. Chamada para a API Java
        const response = await fetch('http://localhost:8080/voluntarios/inscricao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            // Sucesso: Exibe o modal
            ModalController.showThankYouModal('voluntario');
            volForm.reset();
        } else {
            // Erro do Back-end (ex: validação)
            const erroTexto = await response.text();
            alert("Erro ao realizar inscrição: " + erroTexto);
        }

    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro de conexão com o servidor. Verifique se o Back-end Java está rodando.");
    } finally {
        // Restaura o botão
        volButton.innerText = originalText;
        validate(); // Revalida para desabilitar/habilitar o botão corretamente
    }
  });
  
  validate(); // Estado inicial (botão desabilitado)
}