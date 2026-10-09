import { FoodPreset } from '../types/albion';

export const ALBION_FOOD_PRESETS: FoodPreset[] = [
  {
    id: 'sopa-cenoura',
    nome: 'Sopa de Cenoura',
    tier: 'T1',
    nutricaoBase: 48,
    icone: '🥣',
    favoritaDe: 'Bancadas T2 e T3 (Iniciais)',
    rendimentoPorClique: 10,
    ingredientesBase: [
      { nome: 'Cenoura', quantidade: 16, valor: 35 },
    ],
  },
  {
    id: 'sopa-trigo',
    nome: 'Sopa de Trigo',
    tier: 'T3',
    nutricaoBase: 144,
    icone: '🍲',
    favoritaDe: 'Forjas e Curtumes T4',
    rendimentoPorClique: 10,
    ingredientesBase: [
      { nome: 'Trigo', quantidade: 48, valor: 55 },
    ],
  },
  {
    id: 'sopa-repolho',
    nome: 'Sopa de Repolho',
    tier: 'T5',
    nutricaoBase: 432,
    icone: '🥬',
    favoritaDe: 'Estações e Lojas T5-T6',
    rendimentoPorClique: 10,
    ingredientesBase: [
      { nome: 'Repolho', quantidade: 144, valor: 85 },
    ],
  },
  {
    id: 'salada-nabo',
    nome: 'Salada de Nabo',
    tier: 'T4',
    nutricaoBase: 288,
    icone: '🥗',
    favoritaDe: 'Torre do Mago e Alquimia',
    rendimentoPorClique: 10,
    ingredientesBase: [
      { nome: 'Nabo', quantidade: 72, valor: 70 },
      { nome: 'Trigo', quantidade: 24, valor: 55 },
    ],
  },
  {
    id: 'salada-batata',
    nome: 'Salada de Batata',
    tier: 'T6',
    nutricaoBase: 576,
    icone: '🥔',
    favoritaDe: 'Bancadas Avançadas T6-T7',
    rendimentoPorClique: 10,
    ingredientesBase: [
      { nome: 'Batata', quantidade: 144, valor: 95 },
      { nome: 'Milho Doce', quantidade: 48, valor: 90 },
    ],
  },
  {
    id: 'torta-porco',
    nome: 'Torta de Porco',
    tier: 'T7',
    nutricaoBase: 864,
    icone: '🥧',
    favoritaDe: 'Forjas e Estações T7-T8',
    rendimentoPorClique: 10,
    ingredientesBase: [
      { nome: 'Carne de Porco Crua', quantidade: 72, valor: 260 },
      { nome: 'Milho Doce', quantidade: 36, valor: 90 },
      { nome: 'Leite de Vaca', quantidade: 18, valor: 120 },
    ],
  },
  {
    id: 'guisado-carne',
    nome: 'Guisado de Carne',
    tier: 'T8',
    nutricaoBase: 864,
    icone: '🥩',
    favoritaDe: 'Estações Supremas T8 das Cidades',
    rendimentoPorClique: 10,
    ingredientesBase: [
      { nome: 'Carne Bovina T8', quantidade: 72, valor: 380 },
      { nome: 'Pão T8', quantidade: 36, valor: 110 },
      { nome: 'Batata', quantidade: 36, valor: 95 },
    ],
  },
];
