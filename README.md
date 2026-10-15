# Albion Craft Frontend (React + TypeScript + Tailwind) ⚔️🪙

Frontend interativo para cálculo de viabilidade econômica de fabricação, consumo real de insumos com taxa de retorno (RRR), nutrição da barraca da cidade, diários de artesão e projeção de lucros no jogo **Albion Online**.

Totalmente integrado à API Spring Boot [albionApi](https://github.com/HendSchmidt/albionApi).

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de possuir instalado em seu computador:

- **Node.js 18** ou superior (recomendado Node 20 LTS - verifique com `node -v`)
- **npm** (incluso com Node.js - verifique com `npm -v`)
- **Git** (verifique com `git --version`)
- *(Opcional)* O backend [albionApi](https://github.com/HendSchmidt/albionApi) rodando em `http://localhost:8080`. Se o backend não estiver rodando, o frontend possui motor de cálculo simulador local automático como fallback.

---

## 🚀 Como Executar em Ambiente Local

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

A aplicação estará disponível em seu navegador no endereço:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor local de desenvolvimento (Express + Vite na porta 3000) |
| `npm run build` | Gera o build de produção otimizado na pasta `dist/` |
| `npm run preview` | Executa o preview do build local gerado |
| `npm run lint` | Executa a verificação estática de tipos com o TypeScript (`tsc --noEmit`) |
| `npm run clean` | Remove os arquivos de build temporários |

---

## 🔌 Conexão com o Backend Spring Boot (`albionApi`)

O frontend foi desenhado para se comunicar de forma transparente com o backend Spring Boot em **`http://localhost:8080`**:

1. Inicie a API Spring Boot [albionApi](https://github.com/HendSchmidt/albionApi):
   ```bash
   # Na pasta do backend albionApi
   ./mvnw clean spring-boot:run
   ```
2. Abra o frontend em `http://localhost:3000`.
3. No cabeçalho da aplicação, o indicador de status exibirá se a conexão com o Spring Boot está ativa.
4. **Configuração de URL:** Você pode clicar no ícone de engrenagem / configurações de URL no topo para alternar rapidamente entre os endpoints suportados:
   - `http://localhost:8080/calculaViabilidadePorRecurso`
   - `http://localhost:8080/projecaoFaturamento/calculaViabilidadePorRecurso`
   - `http://localhost:8080/albionApi/projecaoFaturamento/calculaViabilidadePorRecurso`
5. **Catálogo de Receitas:** Ao clicar em **"Receitas Salvas"**, o frontend busca e sincroniza automaticamente com as receitas carregadas no banco de dados H2 da API.

---

## 💡 Destaques e Funcionalidades

- **Simulador de Craft Completo:**
  - Suporte a Equipamentos (Armas/Armaduras - 1 item por lote), Culinária (10 itens por lote), Alquimia (5 itens por lote) e Refino.
  - Taxa de Retorno de Recursos (RRR) configurável (0%, 15.2%, 24.8%, 47.9% foco, 53.9% hideout).
  - Cálculo oficial da taxa da barraca por nutrição: $(\text{Item Value} \times 0.1125 \times \text{Quantidade} / 100) \times \text{Taxa}$.
  - Impacto de Conta Premium (redução de 6% nas taxas do mercado) e Ordem de Venda (taxa de montagem de 2.5%).
  - Cálculo de Prata por Ponto de Foco (SPF - Silver Per Focus).
- **Módulo de Nutrição de Comidas:**
  - Simulação de venda direta de comida para alimentação de barracas e cálculo de lucro por ponto de nutrição.
- **Testador de API (JSON):**
  - Permite testar endpoints e visualizar a resposta JSON direta com status HTTP e tempo de latência.

---

## 📄 Licença

Distribuído sob a licença MIT.
