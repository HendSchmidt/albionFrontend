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
    // 1. Tenta chamada direta para o Spring Boot (ex: http://localhost:8080)
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
    } catch (directErr) {
      // Se falhar (ex: rodando no browser HTTPS ou restrição de rede), tenta pelo proxy do servidor local
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

    // Constrói os detalhes analíticos complementares usando a resposta do Spring Boot
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
  const valorTaxaMercado = Math.round(receitaBruta * (taxaMercadoPercentual / 100.0) * 100) / 100;
  const receitaLiquida = Math.round((receitaBruta - valorTaxaMercado) * 100) / 100;

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
    receitaLiquida,
    margemLucroPercentual,
    roiPercentual,
    economiaPremium,
  };
}

/**
 * Cálculo local alternativo (usado apenas se o usuário optar ou para visualização prévia).
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

  const custoTotalDaProdcao = Math.round(
    custoPorRecurso.reduce((acc, curr) => acc + curr.valor, 0) * 100
  ) / 100;

  const receitaBruta = Math.round((request.precoDeVenda || 0) * quantidadeProducao * 100) / 100;
  const taxaMercado = request.contaPremium ? 0.06 : 0.12;
  const receitaLiquida = Math.round(receitaBruta * (1.0 - taxaMercado) * 100) / 100;
  const lucro = Math.round((receitaLiquida - custoTotalDaProdcao) * 100) / 100;

  const response: CraftResponseDto = {
    custoTotalDaProdcao,
    custoPorRecurso,
    lucro,
  };

  const detalhes = gerarDetalhesAnaliticos(request, response);

  return { response, detalhes };
}
