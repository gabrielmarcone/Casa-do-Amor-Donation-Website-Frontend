// Lógica da pág. Quem Somos

// /src/controller/QuemSomosController.js
// Controlador para a view 'QuemSomosScreen.html'.
// Inicializa a lógica da seção de doação in-page e o slider de história.

import { ModalController } from './ModalController.js';

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
    });
  });

  if (amountInput) {
    amountInput.addEventListener('input', () => {
      form.querySelectorAll(`.option-button[data-group="amount"]`).forEach(btn => {
        btn.classList.remove('active');
      });
    });
  }
}

/**
 * Inicializa a lógica do slider da seção "História"
 */
function initStorySlider() {
  const nextButton = document.querySelector('.story-slider-next');
  const slides = document.querySelectorAll('.story-slide');
  let currentSlideIndex = 0;

  if (nextButton && slides.length > 0) {
    nextButton.addEventListener('click', () => {
      slides[currentSlideIndex].classList.remove('active');
      currentSlideIndex = (currentSlideIndex + 1) % slides.length;
      slides[currentSlideIndex].classList.add('active');
    });
  }
}

/**
 * Inicializa os gatilhos de scroll para a seção "História"
 */
function initScrollTriggers() {
  const storySection = document.querySelector('.story-slider-section');
  if (!storySection) return;

  const storyScrollTriggers = [
    'scroll-to-story', // Botão na seção "Como Ajudar"
    'scroll-to-story-footer' // Link no Footer
  ];

  storyScrollTriggers.forEach(id => {
    // Nota: O 'scroll-to-story-footer' está no App Shell (index.html),
    // mas não há problema em re-anexar o listener.
    const el = document.getElementById(id); 
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        storySection.scrollIntoView({ behavior: 'smooth' });
      });
    }
  });
}

export function init() {
  // Inicializa o formulário de doação da Seção 2
  setupDonationForm('inline-donation-form');
  
  // Inicializa o slider de história (Seção 5)
  initStorySlider();

  // Inicializa os gatilhos de scroll
  initScrollTriggers();

  // Anexa o gatilho do formulário in-page para abrir o modal no Passo 2
  const openModalStep2Trigger = document.getElementById('trigger-modal-step2');
  if (openModalStep2Trigger) {
    openModalStep2Trigger.addEventListener('click', (e) => {
      e.preventDefault();
      // Informa ao ModalController para abrir no passo 2, usando os dados do form 'inline-donation-form'
      ModalController.openModal(null, 2, 'inline-donation-form');
    });
  }
}