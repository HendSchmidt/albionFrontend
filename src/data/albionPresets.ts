import { CraftRequestDto } from '../types/albion';

export interface ItemPreset {
  id: string;
  albionItemId: string; // ID oficial usado no Albion Online Data Project
  nomeItem: string;
  tier: string;
  categoria: string;
  icone: string;
  rendimentoPadrao: number;
  categoriaLote: 'CULINARIA' | 'ALQUIMIA' | 'REFINO' | 'EQUIPAMENTO';
  dto: CraftRequestDto;
}

export interface CityBonusPreset {
  nome: string;
  cidade: string;
  taxaSemFoco: number;
  taxaComFoco: number;
  descricao: string;
}

export const ALBION_ITEM_PRESETS: ItemPreset[] = [
  // CULINÁRIA (1 clique = 10 unidades)
  {
    id: 'guisado-carne-t8',
    albionItemId: 'T8_MEAL_STEW',
    nomeItem: 'Guisado de Carne T8 (Beef Stew)',
    tier: 'T8',
    categoria: 'Culinária (Comidas)',
    icone: '🍲',
    rendimentoPadrao: 10,
    categoriaLote: 'CULINARIA',
    dto: {
      quantidadeParaProducao: 1, // 1 clique gera 10 guisados
      taxaDeRetorno: 15.2,
      precoDeVenda: 1400,        // Preço por unidade no mercado
      contaPremium: true,
      categoriaProducao: 'CULINARIA',
      rendimentoPorClique: 10,
      taxaEstacaoPorCemNutricao: 600,
      itemValue: 120,
      quantidadeDiarios: 0,
      precoDiarioVazio: 0,
      precoDiarioCheio: 0,
      ordemDeVenda: true,
      usarFoco: false,
      custoFocoTotal: 0,
      recurso: [
        { nome: 'Carne Crua T8', quantidade: 8, valor: 850 },
        { nome: 'Pão de Trigo', quantidade: 4, valor: 420 },
      ],
    },
  },
  {
    id: 'sopa-repolho-t5',
    albionItemId: 'T5_MEAL_SOUP',
    nomeItem: 'Sopa de Repolho T5',
    tier: 'T5',
    categoria: 'Culinária (Comidas)',
    icone: '🥣',
    rendimentoPadrao: 10,
    categoriaLote: 'CULINARIA',
    dto: {
      quantidadeParaProducao: 2, // 2 cliques = 20 sopas
      taxaDeRetorno: 24.8,
      precoDeVenda: 1400,
      contaPremium: true,
      categoriaProducao: 'CULINARIA',
      rendimentoPorClique: 10,
      taxaEstacaoPorCemNutricao: 400,
      itemValue: 48,
      quantidadeDiarios: 0,
      precoDiarioVazio: 0,
      precoDiarioCheio: 0,
      ordemDeVenda: true,
      usarFoco: false,
      custoFocoTotal: 0,
      recurso: [
        { nome: 'Repolho T5', quantidade: 16, valor: 380 },
      ],
    },
  },

  // ALQUIMIA (1 clique = 5 unidades)
  {
    id: 'pocao-cura-t6',
    albionItemId: 'T6_POTION_HEAL',
    nomeItem: 'Poção de Cura Maior T6',
    tier: 'T6',
    categoria: 'Alquimia (Poções)',
    icone: '🧪',
    rendimentoPadrao: 5,
    categoriaLote: 'ALQUIMIA',
    dto: {
      quantidadeParaProducao: 1, // 1 clique = 5 poções
      taxaDeRetorno: 15.2,
      precoDeVenda: 2800,
      contaPremium: true,
      categoriaProducao: 'ALQUIMIA',
      rendimentoPorClique: 5,
      taxaEstacaoPorCemNutricao: 500,
      itemValue: 96,
      quantidadeDiarios: 0,
      precoDiarioVazio: 0,
      precoDiarioCheio: 0,
      ordemDeVenda: true,
      usarFoco: false,
      custoFocoTotal: 0,
      recurso: [
        { nome: 'Dedaleira Branca T6', quantidade: 24, valor: 280 },
        { nome: 'Leite de Cabra', quantidade: 6, valor: 320 },
      ],
    },
  },

  // REFINO DE RECURSOS (1 clique = 1 unidade)
  {
    id: 'barra-aco-t4',
    albionItemId: 'T4_METALBAR',
    nomeItem: 'Barra de Aço T4',
    tier: 'T4',
    categoria: 'Refino de Recursos',
    icone: '🪵',
    rendimentoPadrao: 1,
    categoriaLote: 'REFINO',
    dto: {
      quantidadeParaProducao: 50, // 50 barras refinadas
      taxaDeRetorno: 36.7,        // Bônus de refino em Thetford / Caerleon
      precoDeVenda: 240,
      contaPremium: true,
      categoriaProducao: 'REFINO',
      rendimentoPorClique: 1,
      taxaEstacaoPorCemNutricao: 500,
      itemValue: 32,
      quantidadeDiarios: 0,
      precoDiarioVazio: 0,
      precoDiarioCheio: 0,
      ordemDeVenda: true,
      usarFoco: false,
      custoFocoTotal: 0,
      recurso: [
        { nome: 'Minério de Ferro T4', quantidade: 2, valor: 85 },
        { nome: 'Barra de Bronze T3', quantidade: 1, valor: 70 },
      ],
    },
  },

  // EQUIPAMENTOS (1 clique = 1 unidade)
  {
    id: 'espada-larga-t4',
    albionItemId: 'T4_MAIN_SWORD',
    nomeItem: 'Espada Larga T4 (Broadsword)',
    tier: 'T4',
    categoria: 'Equipamentos (Armas)',
    icone: '⚔️',
    rendimentoPadrao: 1,
    categoriaLote: 'EQUIPAMENTO',
    dto: {
      quantidadeParaProducao: 5,
      taxaDeRetorno: 25,
      precoDeVenda: 6200,
      contaPremium: true,
      categoriaProducao: 'EQUIPAMENTO',
      rendimentoPorClique: 1,
      taxaEstacaoPorCemNutricao: 600,
      itemValue: 480,
      quantidadeDiarios: 2,
      precoDiarioVazio: 1200,
      precoDiarioCheio: 4500,
      ordemDeVenda: true,
      usarFoco: false,
      custoFocoTotal: 1200,
      recurso: [
        { nome: 'Barra de Aço T4', quantidade: 16, valor: 210 },
        { nome: 'Couro Trabalhado T4', quantidade: 8, valor: 180 },
      ],
    },
  },
  {
    id: 'peitoral-mercenario-t5',
    albionItemId: 'T5_ARMOR_LEATHER_SET1',
    nomeItem: 'Casaco de Mercenário T5',
    tier: 'T5',
    categoria: 'Equipamentos (Armaduras)',
    icone: '🥋',
    rendimentoPadrao: 1,
    categoriaLote: 'EQUIPAMENTO',
    dto: {
      quantidadeParaProducao: 10,
      taxaDeRetorno: 25,
      precoDeVenda: 18500,
      contaPremium: true,
      categoriaProducao: 'EQUIPAMENTO',
      rendimentoPorClique: 1,
      taxaEstacaoPorCemNutricao: 700,
      itemValue: 960,
      quantidadeDiarios: 3,
      precoDiarioVazio: 2100,
      precoDiarioCheio: 8200,
      ordemDeVenda: true,
      usarFoco: false,
      custoFocoTotal: 2500,
      recurso: [
        { nome: 'Couro Fino T5', quantidade: 16, valor: 850 },
      ],
    },
  },
  {
    id: 'arco-guerra-t6',
    albionItemId: 'T6_2H_WARBOW',
    nomeItem: 'Arco de Guerra T6 (Warbow)',
    tier: 'T6',
    categoria: 'Equipamentos (Armas)',
    icone: '🏹',
    rendimentoPadrao: 1,
    categoriaLote: 'EQUIPAMENTO',
    dto: {
      quantidadeParaProducao: 4,
      taxaDeRetorno: 48,
      precoDeVenda: 75000,
      contaPremium: true,
      categoriaProducao: 'EQUIPAMENTO',
      rendimentoPorClique: 1,
      taxaEstacaoPorCemNutricao: 800,
      itemValue: 1920,
      quantidadeDiarios: 2,
      precoDiarioVazio: 3500,
      precoDiarioCheio: 18000,
      ordemDeVenda: true,
      usarFoco: true,
      custoFocoTotal: 1800,
      recurso: [
        { nome: 'Tábuas Encantadas T6', quantidade: 32, valor: 1650 },
      ],
    },
  },
  {
    id: 'cajado-fogo-t5',
    albionItemId: 'T5_2H_FIRESTAFF',
    nomeItem: 'Cajado de Fogo T5 (Fire Staff)',
    tier: 'T5',
    categoria: 'Equipamentos (Armas)',
    icone: '🔥',
    rendimentoPadrao: 1,
    categoriaLote: 'EQUIPAMENTO',
    dto: {
      quantidadeParaProducao: 8,
      taxaDeRetorno: 15,
      precoDeVenda: 22000,
      contaPremium: false,
      categoriaProducao: 'EQUIPAMENTO',
      rendimentoPorClique: 1,
      taxaEstacaoPorCemNutricao: 650,
      itemValue: 960,
      quantidadeDiarios: 2,
      precoDiarioVazio: 2100,
      precoDiarioCheio: 8000,
      ordemDeVenda: false,
      usarFoco: false,
      custoFocoTotal: 1600,
      recurso: [
        { nome: 'Tábuas T5', quantidade: 16, valor: 780 },
        { nome: 'Barra de Titânio T5', quantidade: 8, valor: 820 },
      ],
    },
  },
];

export const CITY_BONUSES: CityBonusPreset[] = [
  {
    nome: 'Ilha Particular / Ilha de Guilda',
    cidade: 'Ilha',
    taxaSemFoco: 0,
    taxaComFoco: 37,
    descricao: '0% de taxa base sem bônus de cidade real (ou até 37% com foco)',
  },
  {
    nome: 'Cidade Real Padrão (Sem especialização)',
    cidade: 'Qualquer Cidade',
    taxaSemFoco: 15,
    taxaComFoco: 43,
    descricao: 'Taxa base comum de 15.2% para receitas sem bônus regional',
  },
  {
    nome: 'Cidade com Especialização de Fabricação',
    cidade: 'Martlock / Fort Sterling / Lymhurst / Thetford / Bridgewatch',
    taxaSemFoco: 25,
    taxaComFoco: 48,
    descricao: 'Bônus regional da cidade específica (ex: Caerleon para Culinária/Poções)',
  },
  {
    nome: 'Esconderijo nas Terras Distantes (Hideout Nível 6)',
    cidade: 'Zona Preta / Black Zone',
    taxaSemFoco: 32,
    taxaComFoco: 54,
    descricao: 'Esconderijos em zonas de alta qualidade nas Terras Negras',
  },
];
