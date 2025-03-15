// Inicializar o cliente Supabase
const SUPABASE_URL = "https://vzpkmfwmghxehxxsodmt.supabase.co"
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6cGttZndtZ2h4ZWh4eHNvZG10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MzYwNzUsImV4cCI6MjA1NzMxMjA3NX0.Zehujl1ttRAsnP_N_Y3NmbFlUNIgHHBAt2Mfe5e_kiM"
// Corrigir a inicialização do cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

// Elementos DOM
const tabBtns = document.querySelectorAll(".tab-btn")
const forms = document.querySelectorAll(".form")
const loginForm = document.getElementById("login-form")
const signupForm = document.getElementById("signup-form")
const resetForm = document.getElementById("reset-form")
const resetPasswordLink = document.getElementById("reset-password-link")
const backToLoginLink = document.getElementById("back-to-login-link")

// Mensagens de erro e sucesso
const loginError = document.getElementById("login-error")
const signupError = document.getElementById("signup-error")
const signupSuccess = document.getElementById("signup-success")
const resetError = document.getElementById("reset-error")
const resetSuccess = document.getElementById("reset-success")

// Alternar entre as abas
tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remover classe ativa de todos os botões e formulários
    tabBtns.forEach((b) => b.classList.remove("active"))
    forms.forEach((f) => f.classList.remove("active"))

    // Adicionar classe ativa ao botão clicado
    btn.classList.add("active")

    // Mostrar o formulário correspondente
    const tabId = btn.getAttribute("data-tab")
    if (tabId === "login") {
      loginForm.classList.add("active")
    } else if (tabId === "signup") {
      signupForm.classList.add("active")
    }

    // Limpar mensagens de erro e sucesso
    clearMessages()
  })
})

// Corrigir o problema de elementos null verificando se eles existem antes de adicionar event listeners

// Mostrar formulário de redefinição de senha
if (resetPasswordLink) {
  resetPasswordLink.addEventListener("click", (e) => {
    e.preventDefault()
    forms.forEach((f) => f.classList.remove("active"))
    resetForm.classList.add("active")
    clearMessages()
  })
}

// Voltar para o formulário de login
if (backToLoginLink) {
  backToLoginLink.addEventListener("click", (e) => {
    e.preventDefault()
    forms.forEach((f) => f.classList.remove("active"))
    loginForm.classList.add("active")
    clearMessages()
  })
}

// Limpar mensagens de erro e sucesso
function clearMessages() {
  loginError.style.display = "none"
  signupError.style.display = "none"
  signupSuccess.style.display = "none"
  resetError.style.display = "none"
  resetSuccess.style.display = "none"
}

// Função para mostrar mensagem de erro
function showError(element, message) {
  element.textContent = message
  element.style.display = "block"
}

// Função para mostrar mensagem de sucesso
function showSuccess(element, message) {
  element.textContent = message
  element.style.display = "block"
}

// Função para mostrar loader nos botões
function showLoader(button, isLoading) {
  if (isLoading) {
    button.innerHTML = '<span class="loader"></span> Processando...'
    button.disabled = true
  } else {
    button.innerHTML = button.getAttribute("data-text") || button.textContent
    button.disabled = false
  }
}

// Remover o redirecionamento prematuro no login que está impedindo a autenticação

// Login com email e senha
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault()
  clearMessages()

  const email = document.getElementById("login-email").value
  const password = document.getElementById("login-password").value
  const submitButton = loginForm.querySelector('button[type="submit"]')

  // Salvar o texto original do botão
  if (!submitButton.getAttribute("data-text")) {
    submitButton.setAttribute("data-text", submitButton.textContent)
  }

  try {
    showLoader(submitButton, true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Login bem-sucedido - redirecionar para a página principal
    window.location.href = "/dashboard.html"
  } catch (error) {
    showError(loginError, error.message || "Erro ao fazer login. Verifique suas credenciais.")
    showLoader(submitButton, false)
  }
})

// Cadastro de novo usuário
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault()
  clearMessages()

  const email = document.getElementById("signup-email").value
  const password = document.getElementById("signup-password").value
  const confirmPassword = document.getElementById("signup-confirm-password").value
  const submitButton = signupForm.querySelector('button[type="submit"]')

  // Salvar o texto original do botão
  if (!submitButton.getAttribute("data-text")) {
    submitButton.setAttribute("data-text", submitButton.textContent)
  }

  // Verificar se as senhas coincidem
  if (password !== confirmPassword) {
    showError(signupError, "As senhas não coincidem.")
    return
  }

  try {
    showLoader(submitButton, true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    // Cadastro bem-sucedido
    showSuccess(signupSuccess, "Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.")
    document.getElementById("signup-form").reset()
    showLoader(submitButton, false)
  } catch (error) {
    showError(signupError, error.message || "Erro ao criar conta. Tente novamente.")
    showLoader(submitButton, false)
  }
})

// Redefinição de senha
resetForm.addEventListener("submit", async (e) => {
  e.preventDefault()
  clearMessages()

  const email = document.getElementById("reset-email").value
  const submitButton = resetForm.querySelector('button[type="submit"]')

  // Salvar o texto original do botão
  if (!submitButton.getAttribute("data-text")) {
    submitButton.setAttribute("data-text", submitButton.textContent)
  }

  try {
    showLoader(submitButton, true)

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password.html",
    })

    if (error) throw error

    // Email enviado com sucesso
    showSuccess(resetSuccess, "Email de redefinição de senha enviado. Verifique sua caixa de entrada.")
    document.getElementById("reset-form").reset()
    showLoader(submitButton, false)
  } catch (error) {
    showError(resetError, error.message || "Erro ao enviar email de redefinição. Tente novamente.")
    showLoader(submitButton, false)
  }
})

// Verificar se o usuário já está autenticado
window.addEventListener("DOMContentLoaded", async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    // Usuário já está logado, redirecionar para a página principal
    window.location.href = "/dashboard.html"
  }
})

