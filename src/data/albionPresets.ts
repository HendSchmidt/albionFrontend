import { CraftRequestDto } from '../types/albion';

export interface ItemPreset {
  id: string;
  albionItemId: string; // ID oficial usado no Albion Online Data Project
  nomeItem: string;
  tier: string;
  categoria: string;
  icone: string;
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
  {
    id: 'espada-larga-t4',
    albionItemId: 'T4_MAIN_SWORD',
    nomeItem: 'Espada Larga T4 (Broadsword)',
    tier: 'T4',
    categoria: 'Armas de Guerreiro',
    icone: '⚔️',
    dto: {
      quantidadeParaProducao: 5,
      taxaDeRetorno: 25,
      precoDeVenda: 6200,
      contaPremium: true,
      taxaEstacaoPorCemNutricao: 600,
      itemValue: 480,
      quantidadeDiarios: 2,
      precoDiarioVazio: 1200, // Preço de compra do diário T4 vazio
      precoDiarioCheio: 4500, // Preço de venda do diário T4 cheio
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
    categoria: 'Armaduras de Caçador',
    icone: '🥋',
    dto: {
      quantidadeParaProducao: 10,
      taxaDeRetorno: 25,
      precoDeVenda: 18500,
      contaPremium: true,
      taxaEstacaoPorCemNutricao: 700,
      itemValue: 960,
      quantidadeDiarios: 3,
      precoDiarioVazio: 2100, // Preço de compra do diário T5 vazio
      precoDiarioCheio: 8200, // Preço de venda do diário T5 cheio
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
    categoria: 'Armas de Caçador',
    icone: '🏹',
    dto: {
      quantidadeParaProducao: 4,
      taxaDeRetorno: 48,
      precoDeVenda: 75000,
      contaPremium: true,
      taxaEstacaoPorCemNutricao: 800,
      itemValue: 1920,
      quantidadeDiarios: 2,
      precoDiarioVazio: 3500, // Preço de compra do diário T6 vazio
      precoDiarioCheio: 18000, // Preço de venda do diário T6 cheio
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
    categoria: 'Armas de Mago',
    icone: '🔥',
    dto: {
      quantidadeParaProducao: 8,
      taxaDeRetorno: 15,
      precoDeVenda: 22000,
      contaPremium: false,
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
  {
    id: 'bolsa-t4',
    albionItemId: 'T4_BAG',
    nomeItem: 'Bolsa de Aventureiro T4',
    tier: 'T4',
    categoria: 'Acessórios',
    icone: '🎒',
    dto: {
      quantidadeParaProducao: 20,
      taxaDeRetorno: 15,
      precoDeVenda: 3900,
      contaPremium: true,
      taxaEstacaoPorCemNutricao: 500,
      itemValue: 240,
      quantidadeDiarios: 4,
      precoDiarioVazio: 900,
      precoDiarioCheio: 3400,
      ordemDeVenda: true,
      usarFoco: false,
      custoFocoTotal: 800,
      recurso: [
        { nome: 'Couro T4', quantidade: 4, valor: 190 },
        { nome: 'Tecido T4', quantidade: 4, valor: 185 },
      ],
    },
  },
  {
    id: 'machado-batalha-t7',
    albionItemId: 'T7_MAIN_AXE',
    nomeItem: 'Machado de Batalha T7',
    tier: 'T7',
    categoria: 'Armas de Guerreiro',
    icone: '🪓',
    dto: {
      quantidadeParaProducao: 2,
      taxaDeRetorno: 48,
      precoDeVenda: 190000,
      contaPremium: true,
      taxaEstacaoPorCemNutricao: 1000,
      itemValue: 3840,
      quantidadeDiarios: 1,
      precoDiarioVazio: 6000,
      precoDiarioCheio: 35000,
      ordemDeVenda: true,
      usarFoco: true,
      custoFocoTotal: 2200,
      recurso: [
        { nome: 'Barra de Meteoro T7', quantidade: 12, valor: 5800 },
        { nome: 'Tábuas T7', quantidade: 12, valor: 5400 },
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
    descricao: 'Bônus regional da cidade específica (ex: Fort Sterling para Martelos/Elmos)',
  },
  {
    nome: 'Esconderijo nas Terras Distantes (Hideout Nível 6)',
    cidade: 'Zona Preta / Black Zone',
    taxaSemFoco: 32,
    taxaComFoco: 54,
    descricao: 'Esconderijos em zonas de alta qualidade nas Terras Negras',
  },
];
