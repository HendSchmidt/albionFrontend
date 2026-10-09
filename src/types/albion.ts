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
  // Funcionalidades avançadas de mercado do Albion Online:
  taxaEstacaoPorCemNutricao?: number; // Ex: 500 pratas por 100 de nutrição
  itemValue?: number;                 // Item Value oficial do Albion para cálculo de nutrição
  quantidadeDiarios?: number;         // Diários de artesão preenchidos
  precoDiarioVazio?: number;          // Preço de compra de cada diário vazio no mercado
  precoDiarioCheio?: number;          // Preço de venda de cada diário cheio no mercado
  valorVendaDiario?: number;          // Mantido para compatibilidade retroativa
  ordemDeVenda?: boolean;             // true = Ordem de Venda (2.5% taxa de montagem), false = Venda Instantânea
  usarFoco?: boolean;                 // Se utilizou foco de produção
  custoFocoTotal?: number;            // Quantidade total de pontos de foco gastos
}

export interface RecursoResponseDto {
  nome: string;
  valor: number;
}

export interface CraftResponseDto {
  custoTotalDaProdcao: number;
  custoPorRecurso: RecursoResponseDto[];
  lucro: number;
  // Detalhamento avançado de mercado e diários:
  custoTaxaEstacao?: number;
  receitaDiarios?: number;
  custoDiariosVazios?: number;
  lucroLiquidoDiarios?: number;
  taxaMontagemOrdem?: number;
  taxaVendaMercado?: number;
  receitaLiquidaTotal?: number;
  prataPorFoco?: number;
}

export interface DetalhesCalculo {
  quantidadeInicialPorRecurso: { [nome: string]: number };
  quantidadeRetornadaPorRecurso: { [nome: string]: number };
  quantidadeConsumidaPorRecurso: { [nome: string]: number };
  receitaBruta: number;
  taxaMercadoPercentual: number;
  valorTaxaMercado: number;
  taxaMontagemOrdem: number;
  receitaDiarios: number;
  custoDiariosVazios: number;
  lucroLiquidoDiarios: number;
  valeAPenaDiarios: boolean;
  custoTaxaEstacao: number;
  receitaLiquida: number;
  margemLucroPercentual: number;
  roiPercentual: number;
  economiaPremium: number;
  prataPorFoco?: number;
}

// -------------------------------------------------------------
// Tipos para a nova seção de Cálculo de Comida para Barraquinha:
// -------------------------------------------------------------
export interface FoodNutritionSaleRequestDto {
  nomeComida: string;
  tier: string;
  nutricaoPorUnidade: number;
  comidaFavorita: boolean;
  valorPorCemNutricao: number; // X configurado pelo dono da barraquinha
  quantidadeProducao: number;  // Qtd total de unidades (ex: 10 un por clique * cliques)
  taxaDeRetorno: number;      // TRR em % (ex: 15 ou 25 ou 48)
  precoMercadoUnitario: number;// Preço de venda unitário no mercado
  contaPremium: boolean;
  ordemDeVenda: boolean;       // true = Ordem de venda (6.5%), false = Venda direta (4%)
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

export interface FoodPreset {
  id: string;
  nome: string;
  tier: string;
  nutricaoBase: number;
  icone: string;
  favoritaDe: string;
  ingredientesBase: RecursoRequestDto[];
  rendimentoPorClique: number;
}
