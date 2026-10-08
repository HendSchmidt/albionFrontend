# Albion Craft Frontend (React + TypeScript) ⚔️🪙

Frontend interativo para cálculo de viabilidade econômica, consumo de insumos com taxa de retorno e projeção de lucros de fabricação do jogo **Albion Online**, integrado à API Spring Boot [albionApi](https://github.com/HendSchmidt/albionApi).

---

## 🚀 Funcionalidades

- **Simulador de Craft Completo:**
  - Configuração de receitas com múltiplos insumos, quantidades e preços unitários em Prata.
  - Presets de itens populares de Albion (Espadas, Casacos, Arcos, Machados, Cajados, Bolsas).
  - Presets de bônus regionais de cidades reais (15%, 25%, 48% com foco, etc.).
- **Regras Econômicas Exatas:**
  - **Taxa de Retorno de Recursos (RRR):** Devolução real dos materiais para a bolsa do jogador, calculando o consumo líquido efetivo.
  - **Conta Premium:** Simulação com 6% de taxa no mercado (com Conta Premium) vs. 12% de taxa (sem Conta Premium - 6% de economia).
  - Cálculo de Custo Total (`custoTotalDaProdcao`), Custo por Recurso (`custoPorRecurso`) e Lucro Líquido (`lucro`).
- **Testador de API (JSON):**
  - Editor em tempo real para disparar requisições `POST /calculaViabilidadePorRecurso` diretamente contra a API local (porta 8080) ou API embutida.
  - Visualizador de status HTTP, tempo de resposta e comando `curl` gerado dinamicamente.
- **Visualizador de Código Java Spring Boot:**
  - Aba com visualização e cópia dos códigos do Service (`CalculaViabilidadeDeProdcao.java`), Controller (`ProjecaoDeFaturamentoController.java`), DTOs e testes unitários.

---

## 🛠️ Tecnologias Utilizadas

- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Vite**
- **Lucide Icons**
- **Express / Node.js** (backend BFF para proxy e API local)

---

## 📦 Como Executar Localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/HendSchmidt/albionFrontend.git
cd albionFrontend
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

---

## 🔌 Integração com o Backend Spring Boot (`albionApi`)

Para conectar o frontend diretamente à sua API Spring Boot:

1. Inicie a API Spring Boot [albionApi](https://github.com/HendSchmidt/albionApi) na porta padrão `8080`.
2. No frontend, acesse a aba **"API Test (JSON)"**.
3. Selecione **"Meu Backend Spring Boot Local (porta 8080)"**.
4. Clique em **"Enviar Request"** para disparar o cálculo diretamente para o seu `ProjecaoDeFaturamentoController`.

---

## 📄 Licença
Distribuído sob a licença MIT.
