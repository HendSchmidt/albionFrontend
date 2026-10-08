export interface RecursoRequestDto {
  nome: string;
  quantidade: number;
  valor: number;
}

export interface CraftRequestDto {
  recurso: RecursoRequestDto[];
  quantidadeParaProducao: number;
  taxaDeRetorno: number; // Ex: 15 para 15%
  precoDeVenda: number;
  contaPremium: boolean;
}

export interface RecursoResponseDto {
  nome: string;
  valor: number;
}

export interface CraftResponseDto {
  custoTotalDaProdcao: number;
  custoPorRecurso: RecursoResponseDto[];
  lucro: number;
}

export interface DetalhesCalculo {
  quantidadeInicialPorRecurso: { [nome: string]: number };
  quantidadeRetornadaPorRecurso: { [nome: string]: number };
  quantidadeConsumidaPorRecurso: { [nome: string]: number };
  receitaBruta: number;
  taxaMercadoPercentual: number;
  valorTaxaMercado: number;
  receitaLiquida: number;
  margemLucroPercentual: number;
  roiPercentual: number;
  economiaPremium: number;
}
