import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface RecursoRequestDto {
  nome: string;
  quantidade: number;
  valor: number;
}

export interface CraftRequestDto {
  recurso: RecursoRequestDto[];
  quantidadeParaProducao: number;
  taxaDeRetorno: number;
  precoDeVenda: number;
  contaPremium: boolean;
  taxaEstacaoPorCemNutricao?: number;
  itemValue?: number;
  quantidadeDiarios?: number;
  precoDiarioVazio?: number;
  precoDiarioCheio?: number;
  ordemDeVenda?: boolean;
}

export interface RecursoResponseDto {
  nome: string;
  valor: number;
}

export interface CraftResponseDto {
  custoTotalDaProdcao: number;
  custoPorRecurso: RecursoResponseDto[];
  lucro: number;
  custoTaxaEstacao?: number;
  receitaDiarios?: number;
  custoDiariosVazios?: number;
  lucroLiquidoDiarios?: number;
  taxaMontagemOrdem?: number;
  taxaVendaMercado?: number;
  receitaLiquidaTotal?: number;
}

export function calculaViabilidadeDeProducao(dto: CraftRequestDto): CraftResponseDto {
  const qtdProducao = dto.quantidadeParaProducao && dto.quantidadeParaProducao > 0 
    ? dto.quantidadeParaProducao 
    : 1;
    
  const taxaRetorno = (dto.taxaDeRetorno || 0) / 100;
  // Fator de consumo líquido: se taxa de retorno for 20%, gasta 80%
  const fatorConsumo = Math.max(0, 1 - taxaRetorno);

  // Calcula custo de cada recurso com a taxa de retorno aplicada
  const custoPorRecurso: RecursoResponseDto[] = (dto.recurso || []).map((rec) => {
    const qtdTotal = rec.quantidade * qtdProducao;
    const qtdEfetivamenteConsumida = qtdTotal * fatorConsumo;
    const valorUnitario = rec.valor || 0;
    const custoRecurso = Math.round(qtdEfetivamenteConsumida * valorUnitario * 100) / 100;

    return {
      nome: rec.nome,
      valor: custoRecurso,
    };
  });

  // Custo dos insumos consumidos
  const custoInsumos = Math.round(
    custoPorRecurso.reduce((acc, curr) => acc + curr.valor, 0) * 100
  ) / 100;

  // Taxa da estação de fabricação (barraca na cidade)
  let custoTaxaEstacao = 0;
  if (dto.taxaEstacaoPorCemNutricao && dto.taxaEstacaoPorCemNutricao > 0) {
    const itemValue = dto.itemValue && dto.itemValue > 0
      ? dto.itemValue
      : (custoInsumos / qtdProducao || 480);
    // Fórmula oficial do Albion Online:
    // Nutrição total gasta = Item Value * 0.1125 * Quantidade de itens produzidos
    const nutricao = itemValue * 0.1125 * qtdProducao;
    // Custo da estação = (Nutrição / 100) * Taxa por 100 de Nutrição
    custoTaxaEstacao = Math.round((nutricao / 100.0) * dto.taxaEstacaoPorCemNutricao * 100) / 100;
  }

  // Operação de Diários de Artesão
  const qtdDiarios = dto.quantidadeDiarios || 0;
  const precoVazio = dto.precoDiarioVazio || 0;
  const precoCheio = dto.precoDiarioCheio || 0;

  const custoDiariosVazios = Math.round(qtdDiarios * precoVazio * 100) / 100;
  const receitaBrutaDiarios = Math.round(qtdDiarios * precoCheio * 100) / 100;

  // Custo Total da Produção = Insumos consumidos + Taxa da Barraca + Compra de Diários Vazios
  const custoTotalDaProdcao = Math.round((custoInsumos + custoTaxaEstacao + custoDiariosVazios) * 100) / 100;

  // Receita bruta da venda dos itens produzidos
  const precoVenda = dto.precoDeVenda || 0;
  const receitaBrutaItens = precoVenda * qtdProducao;

  // Regra de mercado e Conta Premium:
  // "contapremium equivale a 6 por cento de disconto no mercado"
  // A taxa é 6% quando possui conta premium. Sem premium: taxa de 12%.
  const taxaMercadoAliquota = dto.contaPremium ? 0.06 : 0.12;
  const taxaVendaItens = Math.round(receitaBrutaItens * taxaMercadoAliquota * 100) / 100;

  // Taxa de montagem de ordem de mercado (2.5% se for ordem de venda, 0% se for venda direta)
  const ehOrdem = dto.ordemDeVenda === undefined || dto.ordemDeVenda;
  const taxaMontagemItens = ehOrdem ? Math.round(receitaBrutaItens * 0.025 * 100) / 100 : 0;

  // Taxas sobre os diários vendidos
  const taxaVendaDiarios = Math.round(receitaBrutaDiarios * taxaMercadoAliquota * 100) / 100;
  const taxaMontagemDiarios = ehOrdem ? Math.round(receitaBrutaDiarios * 0.025 * 100) / 100 : 0;

  const receitaLiquidaDiarios = Math.round((receitaBrutaDiarios - taxaVendaDiarios - taxaMontagemDiarios) * 100) / 100;
  const lucroLiquidoDiarios = Math.round((receitaLiquidaDiarios - custoDiariosVazios) * 100) / 100;

  const taxaVendaTotal = Math.round((taxaVendaItens + taxaVendaDiarios) * 100) / 100;
  const taxaMontagemTotal = Math.round((taxaMontagemItens + taxaMontagemDiarios) * 100) / 100;

  const receitaLiquidaTotal = Math.round(
    (receitaBrutaItens - taxaVendaItens - taxaMontagemItens + receitaLiquidaDiarios) * 100
  ) / 100;

  // Lucro líquido = Receita líquida total após taxas - Custo total da produção (incluindo taxa da barraca)
  const lucro = Math.round((receitaLiquidaTotal - custoTotalDaProdcao) * 100) / 100;

  return {
    custoTotalDaProdcao,
    custoPorRecurso,
    lucro,
    custoTaxaEstacao,
    receitaDiarios: receitaLiquidaDiarios,
    custoDiariosVazios,
    lucroLiquidoDiarios,
    taxaMontagemOrdem: taxaMontagemTotal,
    taxaVendaMercado: taxaVendaTotal,
    receitaLiquidaTotal,
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Rota solicitada pelo usuário no Controller Spring Boot
  app.post('/calculaViabilidadePorRecurso', async (req, res) => {
    try {
      const body: CraftRequestDto = req.body;
      if (!body || !body.recurso) {
        res.status(400).json({ error: 'Payload inválido. Envie um CraftRequestDto com lista de recursos.' });
        return;
      }

      const springBootUrl = process.env.SPRING_BOOT_URL || 'http://localhost:8080/calculaViabilidadePorRecurso';

      // 1. Tenta encaminhar a requisição para o Spring Boot real em localhost:8080
      try {
        const upstream = await fetch(springBootUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(2000),
        });

        if (upstream.ok) {
          const springBootData = await upstream.json();
          res.setHeader('X-Backend-Origin', 'Spring-Boot-Java');
          res.json(springBootData);
          return;
        }
      } catch (_connErr) {
        // Se o Spring Boot não estiver rodando neste instante, utiliza o cálculo local de fallback
      }

      // 2. Fallback caso o Spring Boot ainda não tenha sido iniciado
      const resultado = calculaViabilidadeDeProducao(body);
      res.setHeader('X-Backend-Origin', 'Local-Fallback');
      res.json(resultado);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao processar cálculo';
      res.status(500).json({ error: message });
    }
  });

  // Endpoint de proxy para conectar com backend Spring Boot externo (ex: http://localhost:8080)
  app.post('/api/proxy-craft', async (req, res) => {
    try {
      const { targetUrl, payload } = req.body;
      if (!targetUrl) {
        res.status(400).json({ error: 'targetUrl é obrigatório' });
        return;
      }

      const upstream = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await upstream.json();
      res.status(upstream.status).json(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao conectar no servidor Spring Boot';
      res.status(502).json({ error: `Não foi possível alcançar o backend externo: ${message}` });
    }
  });

  // Em modo de desenvolvimento, monta o Vite middlewares
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Albion API rodando em http://localhost:${PORT}`);
  });
}

startServer();
