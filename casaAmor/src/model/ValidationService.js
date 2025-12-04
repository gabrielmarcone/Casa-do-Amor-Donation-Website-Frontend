// Funções de máscara e validação

// /src/model/ValidationService.js
// Módulo com funções de validação e máscara de formulários

// --- Funções de Regex (Validação) ---
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isValidEmail(v) { return emailRegex.test(v); }

export function isValidCPF(v) { return v.replace(/\D/g, '').length === 11; }
export function isValidTel(v) { const d = v.replace(/\D/g, ''); return d.length === 10 || d.length === 11; }
export function isValidCardNumber(v) { const d = v.replace(/\D/g, ''); return d.length >= 15 && d.length <= 16; }
export function isValidExpiry(v) { return v.replace(/\D/g, '').length === 4; } // MMYY
export function isValidCVV(v) { const d = v.replace(/\D/g, ''); return d.length >= 3 && d.length <= 4; } // 3 ou 4 dígitos

// --- Funções de Máscara (Formatação) ---
export function maskCPF(value) {
  return value
    .replace(/\D/g, '').substring(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskTelefone(value) {
    let v = value.replace(/\D/g, '').substring(0, 11);
    if (v.length > 10) { // Celular (XX) XXXXX-XXXX
        v = v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else { // Fixo/parcial (XX) XXXX-XXXX
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    return v;
}

export function maskCardNumber(value) {
  return value
    .replace(/\D/g, '') // Remove não-dígitos
    .substring(0, 16)   // Limita a 16 dígitos
    .replace(/(\d{4})(?=\d)/g, '$1 '); // Adiciona espaço a cada 4 dígitos
}

export function maskExpiry(value) {
  return value
    .replace(/\D/g, '').substring(0, 4)
    .replace(/(\d{2})(\d)/, '$1/$2'); // Adiciona barra MM/AA
}

export function maskCVV(value) {
  return value.replace(/\D/g, '').substring(0, 4); // Limita a 4 dígitos
}

/**
 * Valida um conjunto de inputs contra um botão de submit
 * @param {NodeList} inputs - Lista de inputs (querySelectorAll)
 * @param {HTMLButtonElement} button - O botão de submit
 */
export function validateForm(inputs, button) {
  if (!inputs.length || !button) return;
  
  const isValid = Array.from(inputs).every(input => {
      const value = input.value;
      const id = input.id;
      
      if (id.includes('email')) return isValidEmail(value);
      if (id.includes('cpf')) return isValidCPF(value);
      if (id.includes('telefone')) return isValidTel(value);
      
      if (id.includes('card-numero')) return isValidCardNumber(value);
      if (id.includes('card-vencimento')) return isValidExpiry(value);
      if (id.includes('card-cvv')) return isValidCVV(value);

      return value.trim() !== ''; // Fallback para campos genéricos (Nome, etc)
  });
  
  button.disabled = !isValid;
}