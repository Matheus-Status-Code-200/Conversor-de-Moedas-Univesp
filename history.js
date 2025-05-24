// Inicializar o cliente Supabase
const SUPABASE_URL = "https://vzpkmfwmghxehxxsodmt.supabase.co"
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6cGttZndtZ2h4ZWh4eHNvZG10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MzYwNzUsImV4cCI6MjA1NzMxMjA3NX0.Zehujl1ttRAsnP_N_Y3NmbFlUNIgHHBAt2Mfe5e_kiM"
// Corrigir a inicialização do cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

// Elementos DOM
const userEmailElement = document.getElementById("user-email")
const logoutBtn = document.getElementById("logout-btn")
const historyTableBody = document.getElementById("history-table-body")
const dateFilter = document.getElementById("date-filter")
const currencyFilter = document.getElementById("currency-filter")
const clearFiltersBtn = document.getElementById("clear-filters")
const currentPageElement = document.getElementById("current-page")
const totalPagesElement = document.getElementById("total-pages")
const prevPageBtn = document.querySelector(".pagination-btn:first-child")
const nextPageBtn = document.querySelector(".pagination-btn:last-child")

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

// Variáveis de paginação
let currentPage = 1
const itemsPerPage = 10
let totalItems = 0
let totalPages = 1

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

// Função para buscar histórico de conversões do Supabase
async function fetchConversionHistory() {
  try {
    historyTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="loading-cell">
          <div class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i> Carregando histórico...
          </div>
        </td>
      </tr>
    `

    const { data: user } = await supabase.auth.getUser()

    if (!user) {
      historyTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="loading-cell">
            <div class="loading-indicator">
              Faça login para ver seu histórico
            </div>
          </td>
        </tr>
      `
      return
    }

    // Construir a consulta base
    let query = supabase.from("conversions").select("*", { count: "exact" }).eq("user_id", user.user.id)

    // Aplicar filtros
    if (dateFilter.value !== "all") {
      const now = new Date()
      let startDate

      switch (dateFilter.value) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7))
          break
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1))
          break
      }

      if (startDate) {
        query = query.gte("created_at", startDate.toISOString())
      }
    }

    if (currencyFilter.value !== "all") {
      query = query.eq("target_currency", currencyFilter.value)
    }

    // Obter contagem total para paginação
    const countResult = await query

    if (countResult.error) {
      throw countResult.error
    }

    totalItems = countResult.count || 0
    totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

    // Atualizar elementos de paginação
    if (currentPageElement) currentPageElement.textContent = currentPage.toString()
    if (totalPagesElement) totalPagesElement.textContent = totalPages.toString()

    // Habilitar/desabilitar botões de paginação
    if (prevPageBtn) prevPageBtn.disabled = currentPage <= 1
    if (nextPageBtn) nextPageBtn.disabled = currentPage >= totalPages

    // Aplicar paginação
    const from = (currentPage - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    // Buscar dados paginados
    const { data, error } = await query.order("created_at", { ascending: false }).range(from, to)

    if (error) {
      throw error
    }

    if (!data || data.length === 0) {
      historyTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="loading-cell">
            <div class="loading-indicator">
              <i class="fas fa-history"></i> Nenhuma conversão encontrada
            </div>
          </td>
        </tr>
      `
      return
    }

    // Limpar tabela
    historyTableBody.innerHTML = ""

    // Preencher tabela com dados
    data.forEach((conversion) => {
      const formattedDate = formatDate(conversion.created_at)
      const fromCurrency = conversion.source_currency || "BRL"
      const toCurrency = conversion.target_currency || "USD"

      // Obter dados das moedas
      const fromCurrencyData = currencies[fromCurrency] || {
        flag: "https://cdn-icons-png.flaticon.com/512/330/330430.png",
        name: fromCurrency,
      }
      const toCurrencyData = currencies[toCurrency] || {
        flag: "https://cdn-icons-png.flaticon.com/512/330/330430.png",
        name: toCurrency,
      }

      // Calcular taxa
      const rate = conversion.converted_amount / conversion.amount

      // Usando imagens para as bandeiras
      const fromFlagHtml = `<img src="${fromCurrencyData.flag}" alt="${fromCurrency} flag" style="width: 46px; height: 55px; object-fit: contain; border-radius: 60%;">`
      const toFlagHtml = `<img src="${toCurrencyData.flag}" alt="${toCurrency} flag" style="width: 46px; height: 55px; object-fit: contain; border-radius: 60%;">`

      const row = document.createElement("tr")
      row.innerHTML = `
        <td title="${formattedDate.fullDate}">${formattedDate.date}<br><small>${formattedDate.time}</small></td>
        <td>
          <div class="currency-cell">
            <span class="currency-flag">${fromFlagHtml}</span>
            ${fromCurrency}
          </div>
        </td>
        <td>
          <div class="currency-cell">
            <span class="currency-flag">${toFlagHtml}</span>
            ${toCurrency}
          </div>
        </td>
        <td>${formatCurrency(conversion.amount, fromCurrency)}</td>
        <td>${formatCurrency(conversion.converted_amount, toCurrency)}</td>
        <td>${rate.toFixed(6)}</td>
        <td>
          <div class="action-cell">
            <button class="action-btn repeat" title="Repetir conversão" data-id="${conversion.id}">
              <i class="fas fa-redo-alt"></i>
            </button>
            <button class="action-btn delete" title="Excluir" data-id="${conversion.id}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      `

      // Adicionar event listener para o botão de repetir conversão
      const repeatBtn = row.querySelector(".action-btn.repeat")
      if (repeatBtn) {
        repeatBtn.addEventListener("click", () => {
          // Redirecionar para a página de conversão com os parâmetros
          window.location.href = `/dashboard.html?amount=${conversion.amount}&currency=${toCurrency}`
        })
      }

      // Adicionar event listener para o botão de excluir
      const deleteBtn = row.querySelector(".action-btn.delete")
      if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
          if (confirm("Tem certeza que deseja excluir esta conversão?")) {
            const id = deleteBtn.getAttribute("data-id")
            await deleteConversion(id)
          }
        })
      }

      historyTableBody.appendChild(row)
    })
  } catch (error) {
    console.error("Erro ao buscar histórico:", error)
    historyTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="loading-cell">
          <div class="loading-indicator">
            <i class="fas fa-exclamation-circle"></i> Erro ao carregar histórico
            <button id="retry-history" class="retry-btn">
              <i class="fas fa-redo"></i> Tentar novamente
            </button>
          </div>
        </td>
      </tr>
    `

    // Adicionar event listener para o botão de tentar novamente
    const retryBtn = document.getElementById("retry-history")
    if (retryBtn) {
      retryBtn.addEventListener("click", fetchConversionHistory)
    }
  }
}

// Função para excluir uma conversão
async function deleteConversion(id) {
  try {
    const { error } = await supabase.from("conversions").delete().eq("id", id)

    if (error) throw error

    // Recarregar histórico
    await fetchConversionHistory()
  } catch (error) {
    console.error("Erro ao excluir conversão:", error)
    alert("Erro ao excluir conversão. Tente novamente.")
  }
}

// Função para ir para a página anterior
function goToPrevPage() {
  if (currentPage > 1) {
    currentPage--
    fetchConversionHistory()
  }
}

// Função para ir para a próxima página
function goToNextPage() {
  if (currentPage < totalPages) {
    currentPage++
    fetchConversionHistory()
  }
}

// Função para limpar filtros
function clearFilters() {
  dateFilter.value = "all"
  currencyFilter.value = "all"
  currentPage = 1
  fetchConversionHistory()
}

// Inicializar a página
async function initPage() {
  // Verificar autenticação
  await checkAuth()

  // Adicionar event listeners
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout)
  }

  if (dateFilter) {
    dateFilter.addEventListener("change", () => {
      currentPage = 1
      fetchConversionHistory()
    })
  }

  if (currencyFilter) {
    currencyFilter.addEventListener("change", () => {
      currentPage = 1
      fetchConversionHistory()
    })
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", clearFilters)
  }

  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", goToPrevPage)
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", goToNextPage)
  }

  // Preencher o filtro de moedas
  if (currencyFilter) {
    // Manter a opção "Todas"
    const allOption = currencyFilter.querySelector('option[value="all"]')
    currencyFilter.innerHTML = ""
    if (allOption) currencyFilter.appendChild(allOption)

    // Adicionar opções de moedas
    Object.keys(currencies).forEach((code) => {
      const option = document.createElement("option")
      option.value = code
      option.textContent = `${currencies[code].name} (${code})`
      currencyFilter.appendChild(option)
    })
  }

  // Buscar histórico de conversões
  await fetchConversionHistory()

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

