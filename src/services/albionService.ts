import { CraftRequestDto, CraftResponseDto, DetalhesCalculo, RecursoResponseDto } from '../types/albion';

/**
 * Executa o cálculo da viabilidade de produção do Albion Online.
 * Implementa exatamente a mesma lógica do Service Spring Boot.
 */
export function calcularViabilidade(request: CraftRequestDto): {
  response: CraftResponseDto;
  detalhes: DetalhesCalculo;
} {
  const quantidadeProducao = Math.max(1, request.quantidadeParaProducao || 1);
  const taxaRetornoPercentual = Math.max(0, request.taxaDeRetorno || 0);
  const fatorRetorno = taxaRetornoPercentual / 100.0;
  const fatorConsumo = Math.max(0, 1.0 - fatorRetorno);

  const qtdInicialMap: { [nome: string]: number } = {};
  const qtdRetornoMap: { [nome: string]: number } = {};
  const qtdConsumoMap: { [nome: string]: number } = {};

  const custoPorRecurso: RecursoResponseDto[] = (request.recurso || []).map((rec) => {
    const qtdTotal = rec.quantidade * quantidadeProducao;
    const qtdRetornada = qtdTotal * fatorRetorno;
    const qtdConsumida = qtdTotal * fatorConsumo;

    qtdInicialMap[rec.nome] = qtdTotal;
    qtdRetornoMap[rec.nome] = Math.round(qtdRetornada * 10) / 10;
    qtdConsumoMap[rec.nome] = Math.round(qtdConsumida * 10) / 10;

    const valorUnitario = rec.valor || 0;
    const custo = Math.round(qtdConsumida * valorUnitario * 100) / 100;

    return {
      nome: rec.nome,
      valor: custo,
    };
  });

  const custoTotalDaProdcao = Math.round(
    custoPorRecurso.reduce((acc, curr) => acc + curr.valor, 0) * 100
  ) / 100;

  const precoVenda = request.precoDeVenda || 0;
  const receitaBruta = Math.round(precoVenda * quantidadeProducao * 100) / 100;

  // Regra da Conta Premium:
  // "contapremium equivale a 6 por cento de disconto no mercado"
  // A taxa é 6% quando possui a conta premium.
  // Sem premium: taxa de 12% (pois a conta premium dá 6% de desconto: 12% - 6% = 6%).
  const taxaMercadoPercentual = request.contaPremium ? 6.0 : 12.0;
  const taxaFator = taxaMercadoPercentual / 100.0;
  const valorTaxaMercado = Math.round(receitaBruta * taxaFator * 100) / 100;
  const receitaLiquida = Math.round((receitaBruta - valorTaxaMercado) * 100) / 100;

  const lucro = Math.round((receitaLiquida - custoTotalDaProdcao) * 100) / 100;

  const economiaPremium = request.contaPremium
    ? Math.round(receitaBruta * 0.06 * 100) / 100
    : 0;

  const margemLucroPercentual = receitaLiquida > 0
    ? Math.round((lucro / receitaLiquida) * 1000) / 10
    : 0;

  const roiPercentual = custoTotalDaProdcao > 0
    ? Math.round((lucro / custoTotalDaProdcao) * 1000) / 10
    : 0;

  const detalhes: DetalhesCalculo = {
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

  const response: CraftResponseDto = {
    custoTotalDaProdcao,
    custoPorRecurso,
    lucro,
  };

  return { response, detalhes };
}

/**
 * Faz a chamada HTTP POST real para o backend no endpoint /calculaViabilidadePorRecurso.
 */
export async function chamarApiBackend(request: CraftRequestDto): Promise<CraftResponseDto> {
  const res = await fetch('/calculaViabilidadePorRecurso', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro na API (${res.status}): ${errorText}`);
  }

  return await res.json();
}
