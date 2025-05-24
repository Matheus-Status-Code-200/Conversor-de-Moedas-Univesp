# Aplicativo Web de Conversão de Moedas em Tempo Real

**Um Estudo Abrangente em Desenvolvimento Web Moderno com Integração em Nuvem**  
**Autores:** Matheus Alberto Silva, Julio Cesar De Souza Barros Prado, Ian Pablo Borges da Silva, Felipe Oliveira Martins, Olaviano Pereira da Silva Neto, Igor Ribeiro da Fonseca, Jefferson Santos Nascimento  
**Curso:** Engenharia de Computação  
**Instituição:** UNIVESP  
**Data:** 27/05/2025  
**Versão:** 1.0

---

## 📘 Introdução

Com o crescimento do comércio internacional e dos serviços financeiros online, ter um conversor de moeda em tempo real confiável tornou-se essencial. Este projeto apresenta como construir um conversor de moeda dinâmico utilizando o **Supabase**, uma alternativa open-source ao Firebase, juntamente com tecnologias modernas da web como **HTML, CSS e JavaScript**.

---

## 🎯 Objetivo

Criar uma aplicação web simples, mas funcional, que permita aos usuários converter valores entre diferentes moedas utilizando **taxas de câmbio em tempo real**.

---

## 🧰 Tecnologias Utilizadas

- **Supabase** – Backend como serviço (BaaS) para banco de dados, autenticação e hospedagem.
- **HTML/CSS** – Estrutura e estilo da interface do usuário.
- **JavaScript** – Lógica de frontend e chamadas à API.
- **API de Taxas de Câmbio** – Serviço externo para obter taxas de câmbio em tempo real.

---

## ⚙️ Configuração do Supabase

### 1. Criar um Projeto no Supabase

- Acesse: [https://app.supabase.io](https://app.supabase.io)
- Crie um novo projeto.
- Anote a **URL** do projeto e a **chave anônima (anon key)** – serão usadas no código JavaScript.

### 2. Configurar o Banco de Dados

Crie uma tabela chamada `currencies` com as seguintes colunas:

| Coluna | Tipo   | Descrição |
|--------|--------|-----------|
| id     | UUID   | Chave primária |
| code   | Texto  | Código da moeda (ex: USD, EUR) |
| name   | Texto  | Nome da moeda |
| rate   | Número | Taxa de câmbio em relação à moeda base |

### 3. Popular a Tabela

- Você pode utilizar um script de seed ou inserir os dados manualmente via dashboard do Supabase.

---

## 🔄 Atualizando Taxas de Câmbio

Para manter as taxas atualizadas automaticamente:

- Utilize APIs externas como:
  - [ExchangeRate API](https://www.exchangerate-api.com/)
  - [Open Exchange Rates](https://openexchangerates.org/)
- Configure uma **função agendada (cron job)** no Supabase ou em um servidor externo para atualizar regularmente a tabela `currencies`.

---

## ✅ Conclusão

Este projeto demonstra como construir uma aplicação de conversão de moedas funcional e moderna utilizando **Supabase** e tecnologias web padrão. Com recursos adicionais como autenticação de usuários e suporte a múltiplas moedas, o projeto pode ser facilmente expandido para aplicações mais robustas, como:

- Sistemas de contabilidade
- Lojas internacionais
- Carteiras digitais

---

> Este projeto foi desenvolvido como parte do curso de Engenharia de Computação da UNIVESP.
