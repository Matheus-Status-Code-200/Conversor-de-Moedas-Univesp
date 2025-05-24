// Inicializar o cliente Supabase
const SUPABASE_URL = {SUA_URL}
const SUPABASE_KEY = {SUA_CHAVE_DO_SUPABASE}
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

// Dados de moedas com flags do Flaticon
const currencies = {
  USD: { name: "Dólar Americano", symbol: "$", flag: "https://cdn-icons-png.flaticon.com/512/206/206626.png" },
  EUR: { name: "Euro", symbol: "€", flag: "https://cdn-icons-png.flaticon.com/512/330/330426.png" },
  GBP: { name: "Libra Esterlina", symbol: "£", flag: "https://cdn-icons-png.flaticon.com/512/330/330425.png" },
  JPY: { name: "Iene Japonês", symbol: "¥", flag: "https://cdn-icons-png.flaticon.com/512/330/330622.png" },
  ARS: { name: "Peso Argentino", symbol: "$", flag: "https://cdn-icons-png.flaticon.com/512/330/330487.png" },
  CAD: { name: "Dólar Canadense", symbol: "$", flag: "https://cdn-icons-png.flaticon.com/512/330/330442.png" },
  AUD: { name: "Dólar Australiano", symbol: "$", flag: "https://cdn-icons-png.flaticon.com/512/330/330451.png" },
  CNY: { name: "Yuan Chinês", symbol: "¥", flag: "https://cdn-icons-png.flaticon.com/512/330/330651.png" },
  CHF: { name: "Franco Suíço", symbol: "Fr", flag: "https://cdn-icons-png.flaticon.com/512/330/330480.png" },
  MXN: { name: "Peso Mexicano", symbol: "$", flag: "https://cdn-icons-png.flaticon.com/512/330/330433.png" },
  BRL: { name: "Real Brasileiro", symbol: "R$", flag: "https://cdn-icons-png.flaticon.com/512/330/330430.png" },
}

// Taxas de câmbio (serão preenchidas pela API)
const exchangeRates = {}

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
  // Verificar se o código da moeda é válido
  if (!currency || typeof currency !== "string" || currency.length !== 3) {
    // Fallback para BRL se o código da moeda for inválido
    return new Intl.NumberFormat("pt-BR", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  try {
    const formatter = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    })
    return formatter.format(value)
  } catch (error) {
    // Em caso de erro, retornar um formato numérico simples
    console.warn(`Erro ao formatar moeda ${currency}:`, error)
    return `${value.toFixed(2)} ${currency}`
  }
}

// Formatar data para exibição
function formatDate(dateString) {
  const date = new Date(dateString)

  // Formatar data (dia/mês/ano)
  const formattedDate = date.toLocaleDateString("pt-BR")

  // Formatar hora (hora:minuto)
  const formattedTime = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return {
    fullDate: `${formattedDate} às ${formattedTime}`,
    date: formattedDate,
    time: formattedTime,
    relativeTime: getRelativeTime(date),
  }
}

// Obter tempo relativo (ex: "há 5 minutos", "hoje", "ontem")
function getRelativeTime(date) {
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) {
    return "agora mesmo"
  } else if (diffMin < 60) {
    return `há ${diffMin} ${diffMin === 1 ? "minuto" : "minutos"}`
  } else if (diffHour < 24) {
    return `há ${diffHour} ${diffHour === 1 ? "hora" : "horas"}`
  } else if (diffDay === 1) {
    return "ontem"
  } else if (diffDay < 7) {
    return `há ${diffDay} dias`
  } else {
    return date.toLocaleDateString("pt-BR")
  }
}

// Atualizar informações da moeda selecionada
function updateCurrencyInfo(currency) {
  const currencyData = currencies[currency]
  if (!currencyData) return

  currencyNameElement.textContent = currencyData.name
  currencyCodeElement.textContent = currency

  // Usando imagem para todas as moedas agora
  currencyFlagElement.innerHTML = `<img src="${currencyData.flag}" alt="${currency} flag" style="width: 46px; height: 55px; object-fit: contain; border-radius: 60%;">`
}

// Modificar a função convertCurrency para salvar no Supabase e buscar taxas em tempo real
async function convertCurrency() {
  try {
    const amount = Number.parseFloat(amountInput.value) || 0
    const currency = currencySelect.value

    if (amount <= 0) {
      resultValue.textContent = "Digite um valor válido"
      return
    }

    // Mostrar estado de carregamento
    resultValue.textContent = "Calculando..."
    convertBtn.disabled = true
    convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...'

    // Buscar taxa atualizada da API
    const response = await fetch(`https://open.er-api.com/v6/latest/BRL`)

    if (!response.ok) {
      throw new Error("Falha ao buscar taxa atualizada")
    }

    const data = await response.json()

    if (!data.rates || !data.rates[currency]) {
      throw new Error("Taxa não disponível para esta moeda")
    }

    // Obter a taxa de câmbio (quanto da moeda estrangeira você obtém por 1 BRL)
    const rate = data.rates[currency]

    // Atualizar a taxa no objeto local
    exchangeRates[currency] = rate

    // Calcular o valor convertido
    const convertedValue = amount * rate

    // Atualizar a interface
    resultValue.textContent = formatCurrency(convertedValue, currency)
    exchangeRateElement.textContent = `1 BRL = ${rate.toFixed(4)} ${currency}`

    // Salvar a conversão no Supabase
    if (amount > 0) {
      const { data: user } = await supabase.auth.getUser()

      if (user) {
        // Verificar a estrutura da tabela antes de inserir
        const { data: tableInfo, error: tableError } = await supabase.from("conversions").select("*").limit(1)

        if (tableError) {
          console.error("Erro ao verificar tabela:", tableError)
          // Tentar criar a tabela se ela não existir
          await createConversionsTable()
        }

        // Adaptar os campos para a estrutura da tabela
        const conversionData = {
          user_id: user.user.id,
          amount: amount,
          source_currency: "BRL",
          target_currency: currency,
          converted_amount: convertedValue,
          created_at: new Date().toISOString(),
        }

        const { error } = await supabase.from("conversions").insert(conversionData)

        if (error) {
          console.error("Erro ao salvar conversão:", error)
        } else {
          // Atualizar o histórico após salvar
          await updateConversionHistory()
        }
      }
    }
  } catch (error) {
    console.error("Erro na conversão:", error)
    resultValue.textContent = "Erro na conversão"
  } finally {
    // Restaurar o botão
    convertBtn.disabled = false
    convertBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Converter'
  }
}

// Adicionar função para criar a tabela conversions se necessário
async function createConversionsTable() {
  try {
    // Não podemos criar tabelas diretamente via cliente, então vamos apenas
    // mostrar uma mensagem de erro mais informativa
    console.error(`
  A tabela 'conversions' não existe ou tem uma estrutura diferente.
  Por favor, crie a tabela no painel do Supabase com a seguinte estrutura:
  
  CREATE TABLE conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    amount NUMERIC NOT NULL,
    source_currency TEXT NOT NULL,
    target_currency TEXT NOT NULL,
    converted_amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Users can view their own conversions"
    ON conversions
    FOR SELECT
    USING (auth.uid() = user_id);
    
  CREATE POLICY "Users can insert their own conversions"
    ON conversions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
`)
  } catch (error) {
    console.error("Erro ao tentar criar tabela:", error)
  }
}

// Função para buscar histórico de conversões do Supabase
async function updateConversionHistory() {
  if (!conversionHistoryElement) return

  try {
    conversionHistoryElement.innerHTML =
      '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Carregando histórico...</div>'

    const { data: user } = await supabase.auth.getUser()

    if (!user) {
      conversionHistoryElement.innerHTML = `
        <div class="history-item">
          <div class="history-details">
            <span>Faça login para ver seu histórico</span>
          </div>
        </div>
      `
      return
    }

    // Buscar as últimas 5 conversões do usuário
    const { data, error } = await supabase
      .from("conversions")
      .select("*")
      .eq("user_id", user.user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    if (error) {
      throw error
    }

    conversionHistoryElement.innerHTML = ""

    if (!data || data.length === 0) {
      conversionHistoryElement.innerHTML = `
        <div class="history-empty">
          <i class="fas fa-history history-empty-icon"></i>
          <p>Nenhuma conversão realizada ainda</p>
          <small>Suas conversões aparecerão aqui</small>
        </div>
      `
      return
    }

    data.forEach((conversion) => {
      const formattedDate = formatDate(conversion.created_at)
      const fromCurrency = conversion.source_currency || "BRL"
      const toCurrency = conversion.target_currency || "USD"

      // Obter dados das moedas
      const fromCurrencyData = currencies[fromCurrency] || {
        flag: "https://cdn-icons-png.flaticon.com/512/330/330430.png",
        name: "Real Brasileiro",
      }
      const toCurrencyData = currencies[toCurrency] || {
        flag: "https://cdn-icons-png.flaticon.com/512/330/330430.png",
        name: toCurrency,
      }

      // Criar o elemento HTML para o item do histórico
      const historyItem = document.createElement("div")
      historyItem.className = "history-item"

      // Usando imagem para todas as moedas
      const fromFlagHtml = `<img src="${fromCurrencyData.flag}" alt="${fromCurrency} flag" style="width: 46px; height: 55px; object-fit: contain; border-radius: 60%;">`
      const toFlagHtml = `<img src="${toCurrencyData.flag}" alt="${toCurrency} flag" style="width: 46px; height: 55px; object-fit: contain; border-radius: 60%;">`

      historyItem.innerHTML = `
        <div class="history-item-header">
          <div class="history-date">
            <i class="fas fa-clock"></i>
            <span title="${formattedDate.fullDate}">${formattedDate.relativeTime}</span>
          </div>
          <div class="history-actions">
            <button class="history-action-btn" title="Repetir conversão" data-amount="${conversion.amount}" data-currency="${toCurrency}">
              <i class="fas fa-redo-alt"></i>
            </button>
          </div>
        </div>
        <div class="history-item-content">
          <div class="history-currencies">
            <div class="history-currency from">
              <span class="currency-flag">${fromFlagHtml}</span>
              <div class="currency-info">
                <span class="currency-amount">${conversion.amount.toFixed(2)}</span>
                <span class="currency-code">${fromCurrency}</span>
              </div>
            </div>
            <div class="history-arrow">
              <i class="fas fa-long-arrow-alt-right"></i>
            </div>
            <div class="history-currency to">
              <span class="currency-flag">${toFlagHtml}</span>
              <div class="currency-info">
                <span class="currency-amount">${conversion.converted_amount.toFixed(2)}</span>
                <span class="currency-code">${toCurrency}</span>
              </div>
            </div>
          </div>
        </div>
      `

      // Adicionar event listener para o botão de repetir conversão
      const repeatBtn = historyItem.querySelector(".history-action-btn")
      if (repeatBtn) {
        repeatBtn.addEventListener("click", () => {
          const amount = repeatBtn.getAttribute("data-amount")
          const currency = repeatBtn.getAttribute("data-currency")

          // Preencher o formulário com os valores da conversão
          if (amountInput) amountInput.value = amount
          if (currencySelect) {
            // Selecionar a moeda no dropdown
            for (let i = 0; i < currencySelect.options.length; i++) {
              if (currencySelect.options[i].value === currency) {
                currencySelect.selectedIndex = i
                break
              }
            }
            // Atualizar informações da moeda
            updateCurrencyInfo(currency)
          }

          // Executar a conversão
          convertCurrency()
        })
      }

      conversionHistoryElement.appendChild(historyItem)
    })
  } catch (error) {
    console.error("Erro ao buscar histórico:", error)
    conversionHistoryElement.innerHTML = `
      <div class="history-error">
        <i class="fas fa-exclamation-circle"></i>
        <p>Erro ao carregar histórico</p>
        <button id="retry-history" class="retry-btn">
          <i class="fas fa-redo"></i> Tentar novamente
        </button>
      </div>
    `

    // Adicionar event listener para o botão de tentar novamente
    const retryBtn = document.getElementById("retry-history")
    if (retryBtn) {
      retryBtn.addEventListener("click", updateConversionHistory)
    }
  }
}

// Atualizar taxas populares
function updatePopularRates() {
  if (!popularRatesElement) return

  popularRatesElement.innerHTML = ""

  // Pegar as 4 primeiras moedas para exibir
  const popularCurrencies = ["USD", "EUR", "GBP", "JPY"]

  if (Object.keys(exchangeRates).length === 0) {
    popularRatesElement.innerHTML = `
      <div class="rate-card">
        <div class="rate-info">
          <div class="currency-flag">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <div class="currency-details">
            <span class="name">Carregando...</span>
          </div>
        </div>
      </div>
    `
    return
  }

  popularCurrencies.forEach((currency) => {
    const rate = exchangeRates[currency]
    const currencyData = currencies[currency]

    if (!rate || !currencyData) return

    // Usando imagem para todas as moedas
    const flagHtml = `<img src="${currencyData.flag}" alt="${currency} flag" style="width: 46px; height: 55px; object-fit: contain; border-radius: 60%;">`

    const rateCard = document.createElement("div")
    rateCard.className = "rate-card"
    rateCard.innerHTML = `
      <div class="rate-info">
        <div class="currency-flag">
          ${flagHtml}
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

// Função para buscar taxas de câmbio
async function fetchExchangeRates() {
  try {
    // Mostrar estado de carregamento
    lastUpdateElement.textContent = "Carregando..."

    // Buscar taxas de câmbio da API
    const response = await fetch("https://open.er-api.com/v6/latest/BRL")

    if (!response.ok) {
      throw new Error("Falha ao buscar taxas de câmbio")
    }

    const data = await response.json()

    if (!data.rates) {
      throw new Error("Dados de taxas inválidos")
    }

    // Limpar taxas anteriores
    Object.keys(exchangeRates).forEach((key) => delete exchangeRates[key])

    // Preencher o select com as opções de moedas
    if (currencySelect) {
      currencySelect.innerHTML = ""
    }

    // Processar os dados recebidos
    Object.keys(currencies).forEach((currency) => {
      if (data.rates[currency]) {
        // Armazenar a taxa de câmbio
        exchangeRates[currency] = data.rates[currency]

        // Adicionar ao select
        if (currencySelect) {
          const option = document.createElement("option")
          option.value = currency
          option.textContent = `${currencies[currency].name} (${currency})`
          currencySelect.appendChild(option)
        }
      }
    })

    // Atualizar a interface
    const now = new Date()
    lastUpdateElement.textContent = now.toLocaleString("pt-BR")

    // Atualizar informações da moeda selecionada
    if (currencySelect && currencySelect.value) {
      updateCurrencyInfo(currencySelect.value)
    }

    // Atualizar taxas populares
    updatePopularRates()

    // Atualizar o histórico de conversões
    await updateConversionHistory()

    return true
  } catch (error) {
    console.error("Erro ao buscar taxas de câmbio:", error)
    lastUpdateElement.textContent = "Erro ao atualizar taxas"
    return false
  }
}

// Inicializar a página
async function initPage() {
  // Verificar autenticação
  await checkAuth()

  // Verificar se a tabela conversions existe e criar se necessário
  try {
    const { error } = await supabase.from("conversions").select("count").limit(1)

    if (error) {
      console.error("Erro ao verificar tabela:", error)
      // Tentar criar a tabela
      await createConversionsTable()
    }
  } catch (error) {
    console.error("Erro ao verificar tabela:", error)
  }

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

  // Buscar taxas de câmbio iniciais
  await fetchExchangeRates()

  // Atualizar taxas a cada 1 hora
  setInterval(fetchExchangeRates, 3600000)

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

