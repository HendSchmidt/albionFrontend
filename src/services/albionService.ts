import { CraftRequestDto, CraftResponseDto, DetalhesCalculo, RecursoResponseDto } from '../types/albion';

export const DEFAULT_SPRING_BOOT_URL = 'http://localhost:8080/calculaViabilidadePorRecurso';

export interface ResultadoCalculo {
  response: CraftResponseDto;
  detalhes: DetalhesCalculo;
  origem: 'SPRING_BOOT' | 'SIMULADOR_LOCAL';
  duracaoMs?: number;
  mensagem?: string;
}

/**
 * Chama o backend Spring Boot real para obter o cálculo oficial das regras Java.
 */
export async function chamarSpringBoot(
  request: CraftRequestDto,
  backendUrl: string = DEFAULT_SPRING_BOOT_URL
): Promise<ResultadoCalculo> {
  const inicio = performance.now();

  try {
    let res: Response;
    try {
      res = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(request),
      });
    } catch (_directErr) {
      res = await fetch('/api/proxy-craft', {
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
    }

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Spring Boot retornou erro HTTP ${res.status}: ${errorText}`);
    }

    const craftResponse: CraftResponseDto = await res.json();
    const duracaoMs = Math.round(performance.now() - inicio);

    const detalhes = gerarDetalhesAnaliticos(request, craftResponse);

    return {
      response: craftResponse,
      detalhes,
      origem: 'SPRING_BOOT',
      duracaoMs,
      mensagem: `Cálculo processado com sucesso pelo Spring Boot em ${duracaoMs}ms!`,
    };
  } catch (err: any) {
    throw new Error(
      `Não foi possível conectar ao seu Spring Boot em "${backendUrl}". ` +
      `Verifique se o seu projeto albionApi está rodando (ApiApplication) no IntelliJ/Eclipse na porta 8080.`
    );
  }
}

/**
 * Gera detalhes analíticos complementares para a interface com base no resultado da resposta.
 */
export function gerarDetalhesAnaliticos(
  request: CraftRequestDto,
  response: CraftResponseDto
): DetalhesCalculo {
  const quantidadeProducao = Math.max(1, request.quantidadeParaProducao || 1);
  const taxaRetorno = (request.taxaDeRetorno || 0) / 100.0;
  const fatorConsumo = Math.max(0, 1.0 - taxaRetorno);

  const qtdInicialMap: { [nome: string]: number } = {};
  const qtdRetornoMap: { [nome: string]: number } = {};
  const qtdConsumoMap: { [nome: string]: number } = {};

  (request.recurso || []).forEach((rec) => {
    const qtdTotal = rec.quantidade * quantidadeProducao;
    const qtdRetornada = qtdTotal * taxaRetorno;
    const qtdConsumida = qtdTotal * fatorConsumo;

    qtdInicialMap[rec.nome] = qtdTotal;
    qtdRetornoMap[rec.nome] = Math.round(qtdRetornada * 10) / 10;
    qtdConsumoMap[rec.nome] = Math.round(qtdConsumida * 10) / 10;
  });

  const precoVenda = request.precoDeVenda || 0;
  const receitaBruta = Math.round(precoVenda * quantidadeProducao * 100) / 100;

  const taxaMercadoPercentual = request.contaPremium ? 6.0 : 12.0;
  const valorTaxaMercado = response.taxaVendaMercado ?? Math.round(receitaBruta * (taxaMercadoPercentual / 100.0) * 100) / 100;

  const ehOrdemDeVenda = request.ordemDeVenda === undefined || request.ordemDeVenda;
  const taxaMontagemOrdem = response.taxaMontagemOrdem ?? (ehOrdemDeVenda ? Math.round(receitaBruta * 0.025 * 100) / 100 : 0);

  // Diários de artesão
  const qtdDiarios = request.quantidadeDiarios || 0;
  const precoVazio = request.precoDiarioVazio || 0;
  const precoCheio = request.precoDiarioCheio || request.valorVendaDiario || 0;

  const custoDiariosVazios = response.custoDiariosVazios ?? Math.round(qtdDiarios * precoVazio * 100) / 100;

  // Receita líquida dos diários após taxas
  const taxaDiariosPercent = (taxaMercadoPercentual + (ehOrdemDeVenda ? 2.5 : 0)) / 100.0;
  const receitaLiquidaDiariosEstimada = Math.round((qtdDiarios * precoCheio * (1.0 - taxaDiariosPercent)) * 100) / 100;
  const receitaDiarios = response.receitaDiarios ?? receitaLiquidaDiariosEstimada;

  const lucroLiquidoDiarios = response.lucroLiquidoDiarios ?? Math.round((receitaDiarios - custoDiariosVazios) * 100) / 100;
  const valeAPenaDiarios = qtdDiarios > 0 && lucroLiquidoDiarios > 0;

  const custoTaxaEstacao = response.custoTaxaEstacao ?? 0;

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
  };
}

/**
 * Cálculo local alternativo com suporte ao ciclo de diários vazios e cheios.
 */
export function calcularViabilidadeLocal(request: CraftRequestDto): {
  response: CraftResponseDto;
  detalhes: DetalhesCalculo;
} {
  const quantidadeProducao = Math.max(1, request.quantidadeParaProducao || 1);
  const taxaRetorno = (request.taxaDeRetorno || 0) / 100.0;
  const fatorConsumo = Math.max(0, 1.0 - taxaRetorno);

  const custoPorRecurso: RecursoResponseDto[] = (request.recurso || []).map((rec) => {
    const qtdTotal = rec.quantidade * quantidadeProducao;
    const qtdConsumida = qtdTotal * fatorConsumo;
    const valor = Math.round(qtdConsumida * (rec.valor || 0) * 100) / 100;
    return { nome: rec.nome, valor };
  });

  const custoInsumos = Math.round(
    custoPorRecurso.reduce((acc, curr) => acc + curr.valor, 0) * 100
  ) / 100;

  // Taxa da estação de fabricação
  let custoTaxaEstacao = 0;
  if (request.taxaEstacaoPorCemNutricao && request.taxaEstacaoPorCemNutricao > 0) {
    const itemValue = request.itemValue && request.itemValue > 0
      ? request.itemValue
      : custoInsumos / quantidadeProducao;
    const nutricao = itemValue * 0.1125 * quantidadeProducao;
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

  // Receita bruta dos itens
  const receitaBrutaItens = Math.round((request.precoDeVenda || 0) * quantidadeProducao * 100) / 100;

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
  };

  const detalhes = gerarDetalhesAnaliticos(request, response);

  return { response, detalhes };
}
