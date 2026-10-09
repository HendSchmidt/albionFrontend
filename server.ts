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
  rendimentoPorClique?: number;
  categoriaProducao?: string;
  usarFoco?: boolean;
  custoFocoTotal?: number;
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
  prataPorFoco?: number;
  totalItensProduzidos?: number;
  rendimentoPorClique?: number;
  custoUnitarioItemFinal?: number;
  lucroUnitarioItemFinal?: number;
  categoriaProducao?: string;
}

export interface FoodNutritionSaleRequestDto {
  nomeComida: string;
  tier: string;
  nutricaoPorUnidade: number;
  comidaFavorita: boolean;
  valorPorCemNutricao: number;
  quantidadeProducao: number;
  taxaDeRetorno: number;
  precoMercadoUnitario: number;
  contaPremium: boolean;
  ordemDeVenda: boolean;
  ingredientes: RecursoRequestDto[];
}

export interface FoodNutritionSaleResponseDto {
  nomeComida: string;
  nutricaoEfetivaPorUnidade: number;
  valorPagoPorUnidadeBarraquinha: number;
  receitaTotalBarraquinha: number;
  custoProducaoTotal: number;
  custoProducaoPorUnidade: number;
  lucroTotalBarraquinha: number;
  lucroUnitarioBarraquinha: number;
  precoMercadoUnitario: number;
  taxaMercadoPercentual: number;
  precoLiquidoMercadoUnitario: number;
  receitaLiquidaTotalMercado: number;
  lucroTotalMercado: number;
  lucroUnitarioMercado: number;
  melhorOpcao: 'BARRAQUINHA' | 'MERCADO' | 'PREJUIZO';
  recomendacao: string;
  diferencaBarraquinhaVsMercado: number;
}

export function calculaViabilidadeDeProducao(dto: CraftRequestDto): CraftResponseDto {
  const qtdProducao = dto.quantidadeParaProducao && dto.quantidadeParaProducao > 0 
    ? dto.quantidadeParaProducao 
    : 1;
    
  const rendimento = dto.rendimentoPorClique && dto.rendimentoPorClique > 0
    ? dto.rendimentoPorClique
    : 1;

  const categoria = dto.categoriaProducao || (
    rendimento === 10 ? 'CULINARIA' : (rendimento === 5 ? 'ALQUIMIA' : 'EQUIPAMENTO')
  );

  const totalItensProduzidos = qtdProducao * rendimento;
  const taxaRetorno = (dto.taxaDeRetorno || 0) / 100;
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

  const custoInsumos = Math.round(
    custoPorRecurso.reduce((acc, curr) => acc + curr.valor, 0) * 100
  ) / 100;

  // Taxa da estação de fabricação (barraca na cidade)
  let custoTaxaEstacao = 0;
  if (dto.taxaEstacaoPorCemNutricao && dto.taxaEstacaoPorCemNutricao > 0) {
    const itemValue = dto.itemValue && dto.itemValue > 0
      ? dto.itemValue
      : (custoInsumos / qtdProducao || 480);
    const nutricao = itemValue * 0.1125 * qtdProducao;
    custoTaxaEstacao = Math.round((nutricao / 100.0) * dto.taxaEstacaoPorCemNutricao * 100) / 100;
  }

  // Operação de Diários de Artesão
  const qtdDiarios = dto.quantidadeDiarios || 0;
  const precoVazio = dto.precoDiarioVazio || 0;
  const precoCheio = dto.precoDiarioCheio || 0;
  const custoDiariosVazios = Math.round(qtdDiarios * precoVazio * 100) / 100;
  const receitaBrutaDiarios = Math.round(qtdDiarios * precoCheio * 100) / 100;

  const custoTotalDaProdcao = Math.round((custoInsumos + custoTaxaEstacao + custoDiariosVazios) * 100) / 100;

  // Receita bruta da venda dos itens produzidos (Total de Itens × Preço Unitário)
  const precoVenda = dto.precoDeVenda || 0;
  const receitaBrutaItens = Math.round(precoVenda * totalItensProduzidos * 100) / 100;

  // Taxa do mercado
  const taxaMercadoAliquota = dto.contaPremium ? 0.06 : 0.12;
  const taxaVendaItens = Math.round(receitaBrutaItens * taxaMercadoAliquota * 100) / 100;

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

  const lucro = Math.round((receitaLiquidaTotal - custoTotalDaProdcao) * 100) / 100;

  const custoUnitarioItemFinal = Math.round((custoTotalDaProdcao / totalItensProduzidos) * 100) / 100;
  const lucroUnitarioItemFinal = Math.round((lucro / totalItensProduzidos) * 100) / 100;

  let prataPorFoco = 0;
  if (dto.usarFoco && dto.custoFocoTotal && dto.custoFocoTotal > 0) {
    prataPorFoco = Math.round((lucro / dto.custoFocoTotal) * 100) / 100;
  }

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
    prataPorFoco,
    totalItensProduzidos,
    rendimentoPorClique: rendimento,
    custoUnitarioItemFinal,
    lucroUnitarioItemFinal,
    categoriaProducao: categoria,
  };
}

export function calculaVendaComidaBarraquinha(dto: FoodNutritionSaleRequestDto): FoodNutritionSaleResponseDto {
  const nutricaoBase = dto.nutricaoPorUnidade || 0;
  const nutricaoEfetiva = dto.comidaFavorita ? nutricaoBase * 2 : nutricaoBase;
  const valorPorCem = dto.valorPorCemNutricao || 0;
  const valorPagoPorUnidade = Math.round((nutricaoEfetiva / 100) * valorPorCem * 100) / 100;

  const qtdTotal = Math.max(1, dto.quantidadeProducao || 1);
  const receitaTotalBarraquinha = Math.round(valorPagoPorUnidade * qtdTotal * 100) / 100;

  const trr = (dto.taxaDeRetorno || 0) / 100;
  const fatorConsumo = Math.max(0, 1 - trr);

  let custoInsumos = 0;
  (dto.ingredientes || []).forEach((ing) => {
    const qtd = ing.quantidade || 0;
    const preco = ing.valor || 0;
    custoInsumos += qtd * preco * fatorConsumo;
  });

  const custoProducaoTotal = Math.round(custoInsumos * 100) / 100;
  const custoProducaoPorUnidade = Math.round((custoProducaoTotal / qtdTotal) * 100) / 100;

  const lucroTotalBarraquinha = Math.round((receitaTotalBarraquinha - custoProducaoTotal) * 100) / 100;
  const lucroUnitarioBarraquinha = Math.round((valorPagoPorUnidade - custoProducaoPorUnidade) * 100) / 100;

  const precoMercadoUnitario = dto.precoMercadoUnitario || 0;
  const taxaMercadoPercentual = dto.contaPremium
    ? (dto.ordemDeVenda ? 6.5 : 4.0)
    : (dto.ordemDeVenda ? 10.5 : 8.0);
  const aliquotaTaxa = taxaMercadoPercentual / 100;

  const precoLiquidoMercadoUnitario = Math.round(precoMercadoUnitario * (1 - aliquotaTaxa) * 100) / 100;
  const receitaLiquidaTotalMercado = Math.round(precoLiquidoMercadoUnitario * qtdTotal * 100) / 100;
  const lucroTotalMercado = Math.round((receitaLiquidaTotalMercado - custoProducaoTotal) * 100) / 100;
  const lucroUnitarioMercado = Math.round((precoLiquidoMercadoUnitario - custoProducaoPorUnidade) * 100) / 100;

  let melhorOpcao: 'BARRAQUINHA' | 'MERCADO' | 'PREJUIZO';
  let recomendacao: string;
  let diferencaBarraquinhaVsMercado = 0;

  if (lucroTotalBarraquinha < 0 && lucroTotalMercado < 0) {
    melhorOpcao = 'PREJUIZO';
    diferencaBarraquinhaVsMercado = 0;
    recomendacao = 'Ambas as opções dão prejuízo com os preços informados!';
  } else if (valorPagoPorUnidade >= precoLiquidoMercadoUnitario) {
    melhorOpcao = 'BARRAQUINHA';
    diferencaBarraquinhaVsMercado = Math.round((valorPagoPorUnidade - precoLiquidoMercadoUnitario) * qtdTotal * 100) / 100;
    recomendacao = `Vale mais a pena vender na BARRAQUINHA! Vantagem de ${diferencaBarraquinhaVsMercado.toLocaleString('pt-BR')} pratas.`;
  } else {
    melhorOpcao = 'MERCADO';
    diferencaBarraquinhaVsMercado = Math.round((precoLiquidoMercadoUnitario - valorPagoPorUnidade) * qtdTotal * 100) / 100;
    recomendacao = `Vale mais a pena vender no MERCADO! Vantagem de ${diferencaBarraquinhaVsMercado.toLocaleString('pt-BR')} pratas.`;
  }

  return {
    nomeComida: dto.nomeComida,
    nutricaoEfetivaPorUnidade: nutricaoEfetiva,
    valorPagoPorUnidadeBarraquinha: valorPagoPorUnidade,
    receitaTotalBarraquinha,
    custoProducaoTotal,
    custoProducaoPorUnidade,
    lucroTotalBarraquinha,
    lucroUnitarioBarraquinha,
    precoMercadoUnitario,
    taxaMercadoPercentual,
    precoLiquidoMercadoUnitario,
    receitaLiquidaTotalMercado,
    lucroTotalMercado,
    lucroUnitarioMercado,
    melhorOpcao,
    recomendacao,
    diferencaBarraquinhaVsMercado,
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
        // Fallback local
      }

      const resultado = calculaViabilidadeDeProducao(body);
      res.setHeader('X-Backend-Origin', 'Local-Fallback');
      res.json(resultado);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao processar cálculo';
      res.status(500).json({ error: message });
    }
  });

  // Rota de cálculo de comida para barraquinhas
  app.post('/calculaVendaComidaBarraquinha', async (req, res) => {
    try {
      const body: FoodNutritionSaleRequestDto = req.body;
      const springBootUrl = (process.env.SPRING_BOOT_URL || 'http://localhost:8080/calculaViabilidadePorRecurso')
        .replace(/\/calculaViabilidadePorRecurso.*$/, '') + '/calculaVendaComidaBarraquinha';

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
        // Fallback
      }

      const resultado = calculaVendaComidaBarraquinha(body);
      res.setHeader('X-Backend-Origin', 'Local-Fallback');
      res.json(resultado);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao processar cálculo de comida';
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
