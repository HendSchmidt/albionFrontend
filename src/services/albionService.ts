import {
  CraftRequestDto,
  CraftResponseDto,
  DetalhesCalculo,
  RecursoResponseDto,
  FoodNutritionSaleRequestDto,
  FoodNutritionSaleResponseDto,
  ItemSalvoDto,
} from '../types/albion';

export const DEFAULT_SPRING_BOOT_URL = 'http://localhost:8080/albionApi/projecaoFaturamento/calculaViabilidadePorRecurso';

export interface ResultadoCalculo {
  response: CraftResponseDto;
  detalhes: DetalhesCalculo;
  origem: 'SPRING_BOOT' | 'SIMULADOR_LOCAL';
  duracaoMs?: number;
  mensagem?: string;
}

/**
 * Normaliza a resposta da API garantindo que campos como custoPorRecurso e custosPorRecurso
 * sempre existam como Arrays e nunca causem TypeError no React.
 */
export function normalizarCraftResponse(raw: any): CraftResponseDto {
  if (!raw || typeof raw !== 'object') {
    return {
      custoTotalDaProdcao: 0,
      custoPorRecurso: [],
      custosPorRecurso: [],
      lucro: 0,
    };
  }

  const listaInsumos = Array.isArray(raw.custoPorRecurso)
    ? raw.custoPorRecurso
    : Array.isArray(raw.custosPorRecurso)
    ? raw.custosPorRecurso
    : [];

  return {
    ...raw,
    custoTotalDaProdcao: Number(raw.custoTotalDaProdcao) || 0,
    lucro: Number(raw.lucro) || 0,
    custoPorRecurso: listaInsumos,
    custosPorRecurso: listaInsumos,
    prataPorFoco: raw.prataPorFoco ?? raw.prataPorPontoDeFoco ?? 0,
    prataPorPontoDeFoco: raw.prataPorFoco ?? raw.prataPorPontoDeFoco ?? 0,
  };
}

/**
 * Chama o backend Spring Boot real para obter o cálculo oficial das regras Java.
 */
export async function chamarSpringBoot(
  request: CraftRequestDto,
  backendUrl: string = DEFAULT_SPRING_BOOT_URL
): Promise<ResultadoCalculo> {
  const inicio = performance.now();

  // Lista de URLs candidatas para alcançar o Spring Boot real com ou sem context-path
  const candidateUrls: string[] = [];
  if (backendUrl) {
    candidateUrls.push(backendUrl);
  }
  if (!backendUrl.includes('/albionApi/projecaoFaturamento')) {
    candidateUrls.push('http://localhost:8080/albionApi/projecaoFaturamento/calculaViabilidadePorRecurso');
    candidateUrls.push('http://localhost:8080/albionApi/calculaViabilidadePorRecurso');
    candidateUrls.push('http://localhost:8080/projecaoFaturamento/calculaViabilidadePorRecurso');
  }

  // 1. Tenta chamada direta pelo navegador (funciona em localhost com CORS habilitado)
  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(1200),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const rawJson = await res.json();
        const craftResponse = normalizarCraftResponse(rawJson);
        const duracaoMs = Math.round(performance.now() - inicio);
        const detalhes = gerarDetalhesAnaliticos(request, craftResponse);

        return {
          response: craftResponse,
          detalhes,
          origem: 'SPRING_BOOT',
          duracaoMs,
          mensagem: `Cálculo processado com sucesso pelo Spring Boot em ${duracaoMs}ms!`,
        };
      }
    } catch (_directErr) {
      // Tenta próxima URL ou proxy
    }
  }

  // 2. Se a chamada direta falhou (ex: CORS no browser ou rodando em porta diferente), usa o proxy do servidor web
  try {
    const proxyRes = await fetch('/api/proxy-craft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        targetUrl: backendUrl,
        payload: request,
      }),
    });

    const contentType = proxyRes.headers.get('content-type') || '';
    if (proxyRes.ok && contentType.includes('application/json')) {
      const rawJson = await proxyRes.json();
      const craftResponse = normalizarCraftResponse(rawJson);
      const duracaoMs = Math.round(performance.now() - inicio);
      const detalhes = gerarDetalhesAnaliticos(request, craftResponse);
      const isRealSpring = proxyRes.headers.get('x-backend-origin') === 'Spring-Boot-Java';

      return {
        response: craftResponse,
        detalhes,
        origem: isRealSpring ? 'SPRING_BOOT' : 'SIMULADOR_LOCAL',
        duracaoMs,
        mensagem: isRealSpring
          ? `Cálculo processado com sucesso pelo Spring Boot via Proxy em ${duracaoMs}ms!`
          : `Simulador local ativo (${duracaoMs}ms)`,
      };
    }
  } catch (_proxyErr) {
    // Fallback local
  }

  // 3. Fallback determinístico local transparente para garantir que a UI nunca quebre
  const fallback = calcularViabilidadeLocal(request);
  const duracaoMs = Math.round(performance.now() - inicio);
  return {
    response: fallback.response,
    detalhes: fallback.detalhes,
    origem: 'SIMULADOR_LOCAL',
    duracaoMs,
    mensagem: `Spring Boot offline em "${backendUrl}". Regras executadas via Simulador Local.`,
  };
}

/**
 * Gera detalhes analíticos complementares para a interface com base no resultado da resposta.
 */
export function gerarDetalhesAnaliticos(
  request: CraftRequestDto,
  response: CraftResponseDto
): DetalhesCalculo {
  const quantidadeCliques = Math.max(1, request.quantidadeParaProducao || 1);
  const rendimento = request.rendimentoPorClique && request.rendimentoPorClique > 0
    ? request.rendimentoPorClique
    : (response.rendimentoPorClique || 1);
  const totalItensProduzidos = response.totalItensProduzidos ?? (quantidadeCliques * rendimento);
  const categoriaProducao = response.categoriaProducao ?? (request.categoriaProducao || (rendimento === 10 ? 'CULINARIA' : (rendimento === 5 ? 'ALQUIMIA' : 'EQUIPAMENTO')));

  const taxaRetorno = (request.taxaDeRetorno || 0) / 100.0;
  const fatorConsumo = Math.max(0, 1.0 - taxaRetorno);

  const qtdInicialMap: { [nome: string]: number } = {};
  const qtdRetornoMap: { [nome: string]: number } = {};
  const qtdConsumoMap: { [nome: string]: number } = {};

  (request.recurso || []).forEach((rec) => {
    const qtdTotal = rec.quantidade * quantidadeCliques;
    const qtdRetornada = qtdTotal * taxaRetorno;
    const qtdConsumida = qtdTotal * fatorConsumo;

    qtdInicialMap[rec.nome] = qtdTotal;
    qtdRetornoMap[rec.nome] = Math.round(qtdRetornada * 10) / 10;
    qtdConsumoMap[rec.nome] = Math.round(qtdConsumida * 10) / 10;
  });

  const precoVenda = request.precoDeVenda || 0;
  // Receita bruta é baseada no total de itens finais produzidos no lote
  const receitaBruta = Math.round(precoVenda * totalItensProduzidos * 100) / 100;
  const taxaMercadoPercentual = request.contaPremium ? 6.0 : 12.0;
  const valorTaxaMercado = response.taxaVendaMercado ?? Math.round(receitaBruta * (taxaMercadoPercentual / 100.0) * 100) / 100;

  const ehOrdemDeVenda = request.ordemDeVenda === undefined || request.ordemDeVenda;
  const taxaMontagemOrdem = response.taxaMontagemOrdem ?? (ehOrdemDeVenda ? Math.round(receitaBruta * 0.025 * 100) / 100 : 0);

  // Diários de artesão
  const qtdDiarios = request.quantidadeDiarios || 0;
  const precoVazio = request.precoDiarioVazio || 0;
  const precoCheio = request.precoDiarioCheio || request.valorVendaDiario || 0;
  const custoDiariosVazios = response.custoDiariosVazios ?? Math.round(qtdDiarios * precoVazio * 100) / 100;

  const taxaDiariosPercent = (taxaMercadoPercentual + (ehOrdemDeVenda ? 2.5 : 0)) / 100.0;
  const receitaLiquidaDiariosEstimada = Math.round((qtdDiarios * precoCheio * (1.0 - taxaDiariosPercent)) * 100) / 100;
  const receitaDiarios = response.receitaDiarios ?? receitaLiquidaDiariosEstimada;
  const lucroLiquidoDiarios = response.lucroLiquidoDiarios ?? Math.round((receitaDiarios - custoDiariosVazios) * 100) / 100;
  const valeAPenaDiarios = qtdDiarios > 0 && lucroLiquidoDiarios > 0;

  let custoTaxaEstacao = response.custoTaxaEstacao;
  if (custoTaxaEstacao === undefined || custoTaxaEstacao === null || custoTaxaEstacao === 0) {
    if (request.taxaEstacaoPorCemNutricao && request.taxaEstacaoPorCemNutricao > 0) {
      const custoInsumosEstimado = (request.recurso || []).reduce((acc, r) => acc + (r.quantidade * (r.valor || 0)), 0);
      const itemValue = request.itemValue && request.itemValue > 0
        ? request.itemValue
        : (custoInsumosEstimado || 480);
      const nutricao = itemValue * 0.1125 * quantidadeCliques;
      custoTaxaEstacao = Math.round((nutricao / 100.0) * request.taxaEstacaoPorCemNutricao * 100) / 100;
      response.custoTaxaEstacao = custoTaxaEstacao;
    } else {
      custoTaxaEstacao = 0;
    }
  }

  const receitaLiquida = response.receitaLiquidaTotal ?? (
    Math.round((receitaBruta - valorTaxaMercado - taxaMontagemOrdem + receitaDiarios) * 100) / 100
  );

  const economiaPremium = request.contaPremium
    ? Math.round(receitaBruta * 0.06 * 100) / 100
    : 0;

  const margemLucroPercentual = receitaLiquida > 0
    ? Math.round((response.lucro / receitaLiquida) * 1000) / 10
    : 0;

  const roiPercentual = response.custoTotalDaProdcao > 0
    ? Math.round((response.lucro / response.custoTotalDaProdcao) * 1000) / 10
    : 0;

  const custoUnitarioItemFinal = response.custoUnitarioItemFinal ?? (
    totalItensProduzidos > 0 ? Math.round((response.custoTotalDaProdcao / totalItensProduzidos) * 100) / 100 : 0
  );

  const lucroUnitarioItemFinal = response.lucroUnitarioItemFinal ?? (
    totalItensProduzidos > 0 ? Math.round((response.lucro / totalItensProduzidos) * 100) / 100 : 0
  );

  return {
    quantidadeInicialPorRecurso: qtdInicialMap,
    quantidadeRetornadaPorRecurso: qtdRetornoMap,
    quantidadeConsumidaPorRecurso: qtdConsumoMap,
    receitaBruta,
    taxaMercadoPercentual,
    valorTaxaMercado,
    taxaMontagemOrdem,
    receitaDiarios,
    custoDiariosVazios,
    lucroLiquidoDiarios,
    valeAPenaDiarios,
    custoTaxaEstacao,
    receitaLiquida,
    margemLucroPercentual,
    roiPercentual,
    economiaPremium,
    prataPorFoco: response.prataPorFoco,
    totalItensProduzidos,
    rendimentoPorClique: rendimento,
    custoUnitarioItemFinal,
    lucroUnitarioItemFinal,
    categoriaProducao: String(categoriaProducao),
  };
}

/**
 * Cálculo local com suporte a Lotes de Fabricação (Culinária 10x, Alquimia 5x, Refino 1x, Equipamentos 1x).
 */
export function calcularViabilidadeLocal(request: CraftRequestDto): {
  response: CraftResponseDto;
  detalhes: DetalhesCalculo;
} {
  const quantidadeCliques = Math.max(1, request.quantidadeParaProducao || 1);
  const taxaRetorno = (request.taxaDeRetorno || 0) / 100.0;
  const fatorConsumo = Math.max(0, 1.0 - taxaRetorno);

  // Rendimento por clique do Albion Online
  const rendimento = request.rendimentoPorClique && request.rendimentoPorClique > 0
    ? request.rendimentoPorClique
    : 1;

  const categoria = request.categoriaProducao || (
    rendimento === 10 ? 'CULINARIA' : (rendimento === 5 ? 'ALQUIMIA' : 'EQUIPAMENTO')
  );

  const totalItensProduzidos = quantidadeCliques * rendimento;

  // Custo dos recursos consumidos por clique
  const custoPorRecurso: RecursoResponseDto[] = (request.recurso || []).map((rec) => {
    const qtdTotal = rec.quantidade * quantidadeCliques;
    const qtdConsumida = qtdTotal * fatorConsumo;
    const valor = Math.round(qtdConsumida * (rec.valor || 0) * 100) / 100;
    return { nome: rec.nome, valor };
  });

  const custoInsumos = Math.round(
    custoPorRecurso.reduce((acc, curr) => acc + curr.valor, 0) * 100
  ) / 100;

  // Taxa da estação de fabricação (Nutrition Fee) baseada na quantidade de cliques
  let custoTaxaEstacao = 0;
  if (request.taxaEstacaoPorCemNutricao && request.taxaEstacaoPorCemNutricao > 0) {
    const itemValue = request.itemValue && request.itemValue > 0
      ? request.itemValue
      : custoInsumos / quantidadeCliques;
    const nutricao = itemValue * 0.1125 * quantidadeCliques;
    custoTaxaEstacao = Math.round((nutricao / 100.0) * request.taxaEstacaoPorCemNutricao * 100) / 100;
  }

  // Operação de Diários de Artesão
  const qtdDiarios = request.quantidadeDiarios || 0;
  const precoVazio = request.precoDiarioVazio || 0;
  const precoCheio = request.precoDiarioCheio || request.valorVendaDiario || 0;
  const custoDiariosVazios = Math.round(qtdDiarios * precoVazio * 100) / 100;
  const receitaBrutaDiarios = Math.round(qtdDiarios * precoCheio * 100) / 100;

  // Custo Total da Produção = Insumos + Loja + Diários Vazios Comprados
  const custoTotalDaProdcao = Math.round((custoInsumos + custoTaxaEstacao + custoDiariosVazios) * 100) / 100;

  // Receita bruta dos itens = Preço Unitário × Total de Itens Fabricados
  const receitaBrutaItens = Math.round((request.precoDeVenda || 0) * totalItensProduzidos * 100) / 100;

  // Taxas do mercado
  const taxaMercadoAliquota = request.contaPremium ? 0.06 : 0.12;
  const taxaVendaItens = Math.round(receitaBrutaItens * taxaMercadoAliquota * 100) / 100;

  const ehOrdemDeVenda = request.ordemDeVenda === undefined || request.ordemDeVenda;
  const taxaMontagemOrdemAliquota = ehOrdemDeVenda ? 0.025 : 0;
  const taxaMontagemItens = Math.round(receitaBrutaItens * taxaMontagemOrdemAliquota * 100) / 100;

  // Taxas aplicadas também sobre a venda dos diários
  const taxaVendaDiarios = Math.round(receitaBrutaDiarios * taxaMercadoAliquota * 100) / 100;
  const taxaMontagemDiarios = Math.round(receitaBrutaDiarios * taxaMontagemOrdemAliquota * 100) / 100;
  const receitaLiquidaDiarios = Math.round((receitaBrutaDiarios - taxaVendaDiarios - taxaMontagemDiarios) * 100) / 100;
  const lucroLiquidoDiarios = Math.round((receitaLiquidaDiarios - custoDiariosVazios) * 100) / 100;

  const taxaVendaTotal = Math.round((taxaVendaItens + taxaVendaDiarios) * 100) / 100;
  const taxaMontagemTotal = Math.round((taxaMontagemItens + taxaMontagemDiarios) * 100) / 100;

  const receitaLiquidaTotal = Math.round((
    (receitaBrutaItens - taxaVendaItens - taxaMontagemItens) + receitaLiquidaDiarios
  ) * 100) / 100;

  const lucro = Math.round((receitaLiquidaTotal - custoTotalDaProdcao) * 100) / 100;

  // Custo e Lucro unitários por item final gerado
  const custoUnitarioItemFinal = totalItensProduzidos > 0 ? Math.round((custoTotalDaProdcao / totalItensProduzidos) * 100) / 100 : 0;
  const lucroUnitarioItemFinal = totalItensProduzidos > 0 ? Math.round((lucro / totalItensProduzidos) * 100) / 100 : 0;

  let prataPorFoco = 0;
  if (request.usarFoco && request.custoFocoTotal && request.custoFocoTotal > 0) {
    prataPorFoco = Math.round((lucro / request.custoFocoTotal) * 100) / 100;
  }

  const response: CraftResponseDto = {
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
    categoriaProducao: String(categoria),
  };

  const detalhes = gerarDetalhesAnaliticos(request, response);
  return { response, detalhes };
}

// ---------------------------------------------------------------------------------
// Funções para Cálculo de Nutrição e Venda em Barraquinhas de Albion Online
// ---------------------------------------------------------------------------------

/**
 * Cálculo local determinístico para venda de comida em barraquinha.
 */
export function calcularNutricaoLocal(
  request: FoodNutritionSaleRequestDto
): FoodNutritionSaleResponseDto {
  const nutricaoBase = request.nutricaoPorUnidade || 0;
  const nutricaoEfetiva = request.comidaFavorita ? nutricaoBase * 2 : nutricaoBase;
  const valorPorCem = request.valorPorCemNutricao || 0;
  const valorPagoPorUnidade = Math.round((nutricaoEfetiva / 100) * valorPorCem * 100) / 100;

  const qtdTotal = Math.max(1, request.quantidadeProducao || 1);
  const receitaTotalBarraquinha = Math.round(valorPagoPorUnidade * qtdTotal * 100) / 100;

  const trr = (request.taxaDeRetorno || 0) / 100;
  const fatorConsumo = Math.max(0, 1 - trr);

  let custoInsumos = 0;
  (request.ingredientes || []).forEach((ing) => {
    const qtd = ing.quantidade || 0;
    const preco = ing.valor || 0;
    custoInsumos += qtd * preco * fatorConsumo;
  });

  const custoProducaoTotal = Math.round(custoInsumos * 100) / 100;
  const custoProducaoPorUnidade = Math.round((custoProducaoTotal / qtdTotal) * 100) / 100;

  const lucroTotalBarraquinha = Math.round((receitaTotalBarraquinha - custoProducaoTotal) * 100) / 100;
  const lucroUnitarioBarraquinha = Math.round((valorPagoPorUnidade - custoProducaoPorUnidade) * 100) / 100;

  // Mercado
  const precoMercadoUnitario = request.precoMercadoUnitario || 0;
  const taxaMercadoPercentual = request.contaPremium
    ? (request.ordemDeVenda ? 6.5 : 4.0)
    : (request.ordemDeVenda ? 10.5 : 8.0);
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
    recomendacao =
      'Ambas as opções dão prejuízo com os preços informados! Tente comprar insumos com ordem de compra ou produzir com maior Taxa de Retorno (TRR).';
  } else if (valorPagoPorUnidade >= precoLiquidoMercadoUnitario) {
    melhorOpcao = 'BARRAQUINHA';
    diferencaBarraquinhaVsMercado = Math.round((valorPagoPorUnidade - precoLiquidoMercadoUnitario) * qtdTotal * 100) / 100;
    recomendacao = `Vale mais a pena vender na BARRAQUINHA! Você ganha ${valorPagoPorUnidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de prata por unidade de forma instantânea e sem pagar taxas. Vantagem de ${diferencaBarraquinhaVsMercado.toLocaleString('pt-BR')} pratas sobre o mercado.`;
  } else {
    melhorOpcao = 'MERCADO';
    diferencaBarraquinhaVsMercado = Math.round((precoLiquidoMercadoUnitario - valorPagoPorUnidade) * qtdTotal * 100) / 100;
    recomendacao = `Vale mais a pena vender no MERCADO! Mesmo descontando as taxas de ${taxaMercadoPercentual}%, você recebe líquido ${precoLiquidoMercadoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de prata por unidade. Vantagem de ${diferencaBarraquinhaVsMercado.toLocaleString('pt-BR')} pratas sobre a barraquinha.`;
  }

  return {
    nomeComida: request.nomeComida,
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

/**
 * Tenta chamar o Spring Boot e usa o cálculo local como fallback se estiver offline.
 */
export async function chamarSpringBootNutricao(
  request: FoodNutritionSaleRequestDto,
  baseUrl: string = DEFAULT_SPRING_BOOT_URL
): Promise<{ response: FoodNutritionSaleResponseDto; isSpringBoot: boolean; duracaoMs?: number }> {
  const candidateUrls = [
    baseUrl.replace(/\/calculaViabilidadePorRecurso.*$/, '') + '/calculaVendaComidaBarraquinha',
    'http://localhost:8080/albionApi/projecaoFaturamento/calculaVendaComidaBarraquinha',
    'http://localhost:8080/albionApi/calculaVendaComidaBarraquinha',
    'http://localhost:8080/calculaVendaComidaBarraquinha',
    '/albionApi/projecaoFaturamento/calculaVendaComidaBarraquinha',
    '/calculaVendaComidaBarraquinha',
  ];

  const inicio = performance.now();
  for (const endpoint of candidateUrls) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(1200),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data: FoodNutritionSaleResponseDto = await res.json();
        const duracaoMs = Math.round(performance.now() - inicio);
        return { response: data, isSpringBoot: true, duracaoMs };
      }
    } catch (_e) {
      // Tenta próximo
    }
  }

  // Fallback
  return { response: calcularNutricaoLocal(request), isSpringBoot: false };
}


// ----------------------------------------------------------------------------------
// Funções de Persistência H2 (com Fallback temporário em LocalStorage se offline)
// ----------------------------------------------------------------------------------

const LOCAL_STORAGE_SAVED_RECIPES_KEY = 'albion_recipes_h2_local_fallback';

function getLocalFallbackRecipes(): ItemSalvoDto[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SAVED_RECIPES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalFallbackRecipe(item: ItemSalvoDto): void {
  try {
    const list = getLocalFallbackRecipes();
    list.unshift(item);
    localStorage.setItem(LOCAL_STORAGE_SAVED_RECIPES_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Erro ao salvar localmente no storage', e);
  }
}

function deleteLocalFallbackRecipe(id: number): void {
  try {
    const list = getLocalFallbackRecipes().filter((r) => r.id !== id);
    localStorage.setItem(LOCAL_STORAGE_SAVED_RECIPES_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Erro ao remover localmente do storage', e);
  }
}

/**
 * Salva a receita no banco de dados H2 do backend Spring Boot (ou fallback no backend).
 */
export async function salvarItemFabricado(
  request: CraftRequestDto,
  baseUrl: string = DEFAULT_SPRING_BOOT_URL
): Promise<ItemSalvoDto> {
  const urlBase = baseUrl.replace(/\/calculaViabilidadePorRecurso.*$/, '').replace(/\/albionApi.*$/, '');
  
  // Prioriza endpoints do backend da aplicação que integram com Spring Boot e seeder
  const targetEndpoints = [
    '/albionApi/itensFabricados',
    '/itensFabricados',
    '/api/proxy-itens-fabricados',
    urlBase + '/albionApi/itensFabricados',
    urlBase + '/itensFabricados',
  ];

  // Adequa o payload para os nomes esperados pelo backend Spring Boot
  const backendPayload = {
    recurso: request.recurso,
    quantidade: request.quantidadeParaProducao,
    taxaRetorno: request.taxaDeRetorno,
    valorVenda: request.precoDeVenda,
    contaPremium: request.contaPremium,
    taxaEstacaoPorCemNutricao: request.taxaEstacaoPorCemNutricao,
    itemValue: request.itemValue,
    quantidadeDiarios: request.quantidadeDiarios,
    valorCompraDiarioVazio: request.precoDiarioVazio,
    valorVendaDiarioCheio: request.precoDiarioCheio,
    valorVendaDiario: request.valorVendaDiario,
    vendaInstantanea: request.ordemDeVenda === false,
    usoFoco: request.usarFoco,
    pontosFoco: request.custoFocoTotal,
    rendimentoPorClique: request.rendimentoPorClique || 1,
    categoriaProducao: String(request.categoriaProducao || 'CULINARIA'),
    nomeItem: (request as any).nomeItem || 'Receita Customizada',
  };

  for (const endpoint of targetEndpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(backendPayload),
      });

      if (res.ok) {
        const salvo: ItemSalvoDto = await res.json();
        saveLocalFallbackRecipe(salvo);
        return salvo;
      }
    } catch (_err) {
      // Continua para o próximo endpoint
    }
  }

  // Fallback local caso o backend não esteja respondendo
  const novoSalvo: ItemSalvoDto = {
    id: Date.now(),
    nomeItem: (request as any).nomeItem || 'Receita Customizada',
    categoriaProducao: String(request.categoriaProducao || 'CULINARIA'),
    rendimentoPorClique: request.rendimentoPorClique || 1,
    quantidadeCliques: request.quantidadeParaProducao || 1,
    taxaRetorno: request.taxaDeRetorno,
    precoVendaUnitario: request.precoDeVenda,
    contaPremium: request.contaPremium,
    taxaEstacaoPorCemNutricao: request.taxaEstacaoPorCemNutricao,
    itemValue: request.itemValue,
    quantidadeDiarios: request.quantidadeDiarios,
    valorCompraDiarioVazio: request.precoDiarioVazio,
    valorVendaDiarioCheio: request.precoDiarioCheio,
    vendaInstantanea: request.ordemDeVenda === false,
    usoFoco: request.usarFoco,
    pontosFoco: request.custoFocoTotal,
    dataCriacao: new Date().toISOString(),
    ingredientes: (request.recurso || []).map((r) => ({
      nome: r.nome,
      quantidade: r.quantidade,
      valor: r.valor,
    })),
  };

  saveLocalFallbackRecipe(novoSalvo);
  return novoSalvo;
}

/**
 * Busca receitas salvas no banco de dados H2 (ou seeder oficial do backend).
 */
export async function buscarItensFabricados(
  termo?: string,
  baseUrl: string = DEFAULT_SPRING_BOOT_URL
): Promise<ItemSalvoDto[]> {
  const urlBase = baseUrl.replace(/\/calculaViabilidadePorRecurso.*$/, '').replace(/\/albionApi.*$/, '');
  const queryParam = termo && termo.trim() ? ('?busca=' + encodeURIComponent(termo.trim())) : '';

  // Prioriza as rotas relativas do backend do app (que fazem proxy com Spring Boot ou retornam o Seeder)
  const targetEndpoints = [
    '/albionApi/itensFabricados' + queryParam,
    '/itensFabricados' + queryParam,
    '/api/proxy-itens-fabricados' + queryParam,
    urlBase + '/albionApi/itensFabricados' + queryParam,
    urlBase + '/itensFabricados' + queryParam,
  ];

  for (const endpoint of targetEndpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const lista: ItemSalvoDto[] = await res.json();
        if (Array.isArray(lista) && lista.length > 0) {
          // Atualiza o cache local caso o usuário fique offline
          lista.forEach((item) => saveLocalFallbackRecipe(item));
          return lista;
        }
        if (Array.isArray(lista)) {
          return lista;
        }
      }
    } catch (_err) {
      // Continua para o próximo endpoint
    }
  }

  const locais = getLocalFallbackRecipes();
  if (termo && termo.trim()) {
    const t = termo.trim().toLowerCase();
    return locais.filter((item) => item.nomeItem.toLowerCase().includes(t));
  }
  return locais;
}

/**
 * Remove uma receita do banco de dados H2.
 */
export async function deletarItemFabricado(
  id: number,
  baseUrl: string = DEFAULT_SPRING_BOOT_URL
): Promise<void> {
  const urlBase = baseUrl.replace(/\/calculaViabilidadePorRecurso.*$/, '').replace(/\/albionApi.*$/, '');
  const targetEndpoints = [
    '/albionApi/itensFabricados/' + id,
    '/itensFabricados/' + id,
    '/api/proxy-itens-fabricados/' + id,
    urlBase + '/albionApi/itensFabricados/' + id,
    urlBase + '/itensFabricados/' + id,
  ];

  deleteLocalFallbackRecipe(id);

  for (const endpoint of targetEndpoints) {
    try {
      await fetch(endpoint, { method: 'DELETE' });
    } catch (_err) {
      // Ignora se o backend estiver offline
    }
  }
}
