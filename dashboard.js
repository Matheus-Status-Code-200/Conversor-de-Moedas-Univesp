// Inicializar o cliente Supabase
const SUPABASE_URL = "https://vzpkmfwmghxehxxsodmt.supabase.co"
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6cGttZndtZ2h4ZWh4eHNvZG10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MzYwNzUsImV4cCI6MjA1NzMxMjA3NX0.Zehujl1ttRAsnP_N_Y3NmbFlUNIgHHBAt2Mfe5e_kiM"
// Corrigir a inicialização do cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

// Elementos DOM
const userEmailElement = document.getElementById("user-email")
const logoutBtn = document.getElementById("logout-btn")
const amountInput = document.getElementById("amount")
const currencySelect = document.getElementById("currency")
const convertBtn = document.getElementById("convert-btn")
const resultValue = document.getElementById("result-value")
const exchangeRateElement = document.getElementById("exchange-rate")
const lastUpdateElement = document.getElementById("last-update")
const currencyNameElement = document.getElementById("currency-name")
const currencyCodeElement = document.getElementById("currency-code")
const currencyFlagElement = document.getElementById("currency-flag")
const popularRatesElement = document.getElementById("popular-rates")
const conversionHistoryElement = document.getElementById("conversion-history")

// Dados de moedas
const currencies = {
  USD: { name: "Dólar Americano", symbol: "$", flag: "🇺🇸" },
  EUR: { name: "Euro", symbol: "€", flag: "🇪🇺" },
  GBP: { name: "Libra Esterlina", symbol: "£", flag: "🇬🇧" },
  JPY: { name: "Iene Japonês", symbol: "¥", flag: "🇯🇵" },
  ARS: { name: "Peso Argentino", symbol: "$", flag: "🇦🇷" },
  CAD: { name: "Dólar Canadense", symbol: "$", flag: "🇨🇦" },
  AUD: { name: "Dólar Australiano", symbol: "$", flag: "🇦🇺" },
  CNY: { name: "Yuan Chinês", symbol: "¥", flag: "🇨🇳" },
}

// Histórico de conversões
const conversionHistory = []

// Taxas de câmbio (simuladas)
const exchangeRates = {
  USD: 0.2,
  EUR: 0.18,
  GBP: 0.16,
  JPY: 30.42,
  ARS: 175.5,
  CAD: 0.27,
  AUD: 0.31,
  CNY: 1.45,
}

// Adicionar código para controlar o menu mobile
const mobileMenuBtn = document.getElementById("mobile-menu-btn")
const sidebar = document.querySelector(".sidebar")
const sidebarOverlay = document.getElementById("sidebar-overlay")

// Função para alternar o menu mobile
function toggleMobileMenu() {
  sidebar.classList.toggle("active")
  sidebarOverlay.classList.toggle("active")
  document.body.classList.toggle("menu-open")
}

// Adicionar event listeners para o menu mobile
if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener("click", toggleMobileMenu)
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener("click", toggleMobileMenu)
}

// Fechar o menu quando um item do menu é clicado em dispositivos móveis
const sidebarNavItems = document.querySelectorAll(".sidebar-nav li a")
sidebarNavItems.forEach((item) => {
  item.addEventListener("click", () => {
    if (window.innerWidth <= 992 && sidebar.classList.contains("active")) {
      toggleMobileMenu()
    }
  })
})

// Verificar se o usuário está autenticado
async function checkAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // Usuário não está logado, redirecionar para a página de login
    window.location.href = "/index.html"
    return
  }

  // Exibir o email do usuário
  if (userEmailElement) {
    userEmailElement.textContent = session.user.email
  }
}

// Função de logout
async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // Redirecionar para a página de login
    window.location.href = "/index.html"
  } catch (error) {
    console.error("Erro ao fazer logout:", error.message)
  }
}

// Formatar valor monetário
function formatCurrency(value, currency) {
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  })
  return formatter.format(value)
}

// Atualizar informações da moeda selecionada
function updateCurrencyInfo(currency) {
  const currencyData = currencies[currency]
  currencyNameElement.textContent = currencyData.name
  currencyCodeElement.textContent = currency
  currencyFlagElement.innerHTML = `<span style="font-size: 24px;">${currencyData.flag}</span>`
}

// Converter valor
function convertCurrency() {
  const amount = Number.parseFloat(amountInput.value) || 0
  const currency = currencySelect.value
  const rate = exchangeRates[currency]

  const convertedValue = amount * rate

  resultValue.textContent = formatCurrency(convertedValue, currency)
  exchangeRateElement.textContent = `1 BRL = ${rate.toFixed(4)} ${currency}`

  // Adicionar ao histórico
  if (amount > 0) {
    const conversion = {
      date: new Date(),
      from: "BRL",
      to: currency,
      amount: amount,
      result: convertedValue,
    }

    conversionHistory.unshift(conversion)

    // Limitar histórico a 5 itens
    if (conversionHistory.length > 5) {
      conversionHistory.pop()
    }

    updateConversionHistory()
  }
}

// Atualizar histórico de conversões
function updateConversionHistory() {
  if (!conversionHistoryElement) return

  conversionHistoryElement.innerHTML = ""

  if (conversionHistory.length === 0) {
    conversionHistoryElement.innerHTML = `
      <div class="history-item">
        <div class="history-details">
          <span>Nenhuma conversão realizada ainda</span>
        </div>
      </div>
    `
    return
  }

  conversionHistory.forEach((conversion) => {
    const date = new Date(conversion.date).toLocaleString("pt-BR")
    const historyItem = document.createElement("div")
    historyItem.className = "history-item"
    historyItem.innerHTML = `
      <div class="history-details">
        <span class="history-date">${date}</span>
        <span class="history-conversion">${conversion.amount.toFixed(2)} ${conversion.from} → ${conversion.to}</span>
      </div>
      <div class="history-value">${formatCurrency(conversion.result, conversion.to)}</div>
    `
    conversionHistoryElement.appendChild(historyItem)
  })
}

// Atualizar taxas populares
function updatePopularRates() {
  if (!popularRatesElement) return

  popularRatesElement.innerHTML = ""

  const popularCurrencies = ["USD", "EUR", "GBP", "JPY"]

  popularCurrencies.forEach((currency) => {
    const rate = exchangeRates[currency]
    const currencyData = currencies[currency]

    const rateCard = document.createElement("div")
    rateCard.className = "rate-card"
    rateCard.innerHTML = `
      <div class="rate-info">
        <div class="currency-flag">
          <span style="font-size: 24px;">${currencyData.flag}</span>
        </div>
        <div class="currency-details">
          <span class="name">${currencyData.name}</span>
          <span class="code">${currency}</span>
        </div>
      </div>
      <div class="rate-value">${rate.toFixed(4)}</div>
    `
    popularRatesElement.appendChild(rateCard)
  })
}

// Simular atualização de taxas
function simulateRateUpdate() {
  // Simular pequenas variações nas taxas
  Object.keys(exchangeRates).forEach((currency) => {
    const variation = (Math.random() - 0.5) * 0.01 // Variação de até 0.5%
    exchangeRates[currency] *= 1 + variation
  })

  // Atualizar data da última atualização
  const now = new Date()
  lastUpdateElement.textContent = now.toLocaleString("pt-BR")

  // Atualizar taxas populares
  updatePopularRates()

  // Se houver um valor no input, recalcular
  if (Number.parseFloat(amountInput.value) > 0) {
    convertCurrency()
  }
}

// Inicializar a página
function initPage() {
  // Verificar autenticação
  checkAuth()

  // Adicionar event listeners
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout)
  }

  if (convertBtn) {
    convertBtn.addEventListener("click", convertCurrency)
  }

  if (currencySelect) {
    currencySelect.addEventListener("change", () => {
      updateCurrencyInfo(currencySelect.value)
      if (Number.parseFloat(amountInput.value) > 0) {
        convertCurrency()
      }
    })
  }

  // Inicializar informações da moeda
  if (currencySelect) {
    updateCurrencyInfo(currencySelect.value)
  }

  // Simular primeira atualização de taxas
  simulateRateUpdate()

  // Atualizar taxas a cada 30 segundos
  setInterval(simulateRateUpdate, 30000)

  // Inicializar histórico de conversões
  updateConversionHistory()

  // Verificar o tamanho da tela ao redimensionar
  window.addEventListener("resize", () => {
    if (window.innerWidth > 992) {
      sidebar.classList.remove("active")
      sidebarOverlay.classList.remove("active")
      document.body.classList.remove("menu-open")
    }
  })
}

// Inicializar quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", initPage)

