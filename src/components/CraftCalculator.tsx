import React, { useState } from 'react';
import { CraftRequestDto, RecursoRequestDto, CategoriaLote } from '../types/albion';
import {
  Plus,
  Trash2,
  Crown,
  Sparkles,
  RefreshCw,
  ShoppingCart,
  Percent,
  Store,
  BookOpen,
  Zap,
  Tag,
  ChevronDown,
  ChevronUp,
  UtensilsCrossed,
  FlaskConical,
  Trees,
  Shield,
  Sliders,
  Layers,
  HelpCircle,
  Package,
  Info,
} from 'lucide-react';
import { Tooltip } from './Tooltip';

interface CraftCalculatorProps {
  request: CraftRequestDto;
  setRequest: React.Dispatch<React.SetStateAction<CraftRequestDto>>;
  onCalculate: () => void;
  isLoading: boolean;
}

interface CategoriaConfig {
  id: CategoriaLote;
  nome: string;
  icone: React.ReactNode;
  rendimentoPadrao: number;
  regraTexto: string;
  exemplos: string;
  calculoExplicacao: string;
  badgeCor: string;
  bgAtivo: string;
  bordaAtiva: string;
}

const CATEGORIAS_LOTE: CategoriaConfig[] = [
  {
    id: 'CULINARIA',
    nome: 'Culinária (Comidas)',
    icone: <UtensilsCrossed className="w-4 h-4 text-amber-400" />,
    rendimentoPadrao: 10,
    regraTexto: '1 quantidade = 10 unidades',
    exemplos: 'Sopas, Saladas, Tortas, Guisados, Sanduíches e Omeletes',
    calculoExplicacao: 'O custo total dos ingredientes é dividido por 10 para apurar o custo unitário de cada comida.',
    badgeCor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    bgAtivo: 'bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900',
    bordaAtiva: 'border-amber-500/60 shadow-lg shadow-amber-950/30',
  },
  {
    id: 'ALQUIMIA',
    nome: 'Alquimia (Poções & Bebidas)',
    icone: <FlaskConical className="w-4 h-4 text-emerald-400" />,
    rendimentoPadrao: 5,
    regraTexto: '1 quantidade = 5 unidades',
    exemplos: 'Poções de Cura, Resistência, Veneno, Invisibilidade e Goró de Batata',
    calculoExplicacao: 'O custo dos materiais de 1 quantidade é dividido por 5 para apurar o valor unitário de cada frasco.',
    badgeCor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    bgAtivo: 'bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900',
    bordaAtiva: 'border-emerald-500/60 shadow-lg shadow-emerald-950/30',
  },
  {
    id: 'REFINO',
    nome: 'Refino de Recursos',
    icone: <Trees className="w-4 h-4 text-cyan-400" />,
    rendimentoPadrao: 1,
    regraTexto: '1 quantidade = 1 unidade',
    exemplos: 'Barras de Metal, Tábuas de Madeira, Couros e Tecidos',
    calculoExplicacao: 'Consome matéria-prima bruta gerando 1 material refinado. O custo diminui puramente pela TRR da cidade.',
    badgeCor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    bgAtivo: 'bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-900',
    bordaAtiva: 'border-cyan-500/60 shadow-lg shadow-cyan-950/30',
  },
  {
    id: 'EQUIPAMENTO',
    nome: 'Equipamentos (Armas & Armaduras)',
    icone: <Shield className="w-4 h-4 text-purple-400" />,
    rendimentoPadrao: 1,
    regraTexto: '1 quantidade = 1 unidade',
    exemplos: 'Armas, Armaduras, Capas, Bolsas e Ferramentas',
    calculoExplicacao: 'Cada quantidade produzida gera 1 único equipamento com rolamento aleatório de Qualidade (Bom a Obra-Prima).',
    badgeCor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    bgAtivo: 'bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-900',
    bordaAtiva: 'border-purple-500/60 shadow-lg shadow-purple-950/30',
  },
];

export const CraftCalculator: React.FC<CraftCalculatorProps> = ({
  request,
  setRequest,
  onCalculate,
  isLoading,
}) => {
  // Painéis expansíveis avançados
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(true);

  // Categoria ativa atual
  const categoriaAtual = (request.categoriaProducao as CategoriaLote) || (
    request.rendimentoPorClique === 10
      ? 'CULINARIA'
      : request.rendimentoPorClique === 5
      ? 'ALQUIMIA'
      : (request.rendimentoPorClique === 1 ? 'EQUIPAMENTO' : 'CUSTOMIZADO')
  );

  const rendimentoAtual = request.rendimentoPorClique && request.rendimentoPorClique > 0
    ? request.rendimentoPorClique
    : 1;

  const totalUnidadesGeradas = (request.quantidadeParaProducao || 1) * rendimentoAtual;

  const handleSelectCategoria = (cat: CategoriaConfig) => {
    setRequest((prev) => ({
      ...prev,
      categoriaProducao: cat.id,
      rendimentoPorClique: cat.rendimentoPadrao,
    }));
  };

  const handleResourceChange = (
    index: number,
    field: keyof RecursoRequestDto,
    value: string | number
  ) => {
    const updated = [...request.recurso];
    if (field === 'nome') {
      updated[index] = { ...updated[index], [field]: String(value) };
    } else {
      updated[index] = { ...updated[index], [field]: Math.max(0, Number(value) || 0) };
    }
    setRequest((prev) => ({ ...prev, recurso: updated }));
  };

  const addResource = () => {
    setRequest((prev) => ({
      ...prev,
      recurso: [
        ...prev.recurso,
        {
          nome: `Recurso ${prev.recurso.length + 1}`,
          quantidade: 10,
          valor: 500,
        },
      ],
    }));
  };

  const removeResource = (index: number) => {
    if (request.recurso.length <= 1) return;
    setRequest((prev) => ({
      ...prev,
      recurso: prev.recurso.filter((_, i) => i !== index),
    }));
  };

  // Cálculo prévio de custo de insumos por quantidade para exibir na interface
  const custoInsumosQuantidade = request.recurso.reduce(
    (acc, r) => acc + (r.quantidade || 0) * (r.valor || 0),
    0
  );
  const taxaRetornoAliquota = (request.taxaDeRetorno || 0) / 100;
  const custoInsumosCorrigidoQuantidade = custoInsumosQuantidade * (1 - taxaRetornoAliquota);
  const custoInsumosPorUnidadeFinal = rendimentoAtual > 0 ? custoInsumosCorrigidoQuantidade / rendimentoAtual : 0;

  return (
    <div className="space-y-6">
      {/* Box Principal de Configuração */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
        <div className="border-b border-slate-800/80 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                Parâmetros de Fabricação & Rendimento por Quantidade
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure a categoria da receita (Culinária 10x, Alquimia 5x, Refino/Equipamento 1x), quantidade e taxas.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-300 font-semibold">
                Rendimento: <strong className="text-amber-300">{rendimentoAtual} un / quantidade</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 1. SELETOR DE REGRAS DE LOTES DE FABRICAÇÃO NO ALBION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Regra de Lote & Categoria do Item no Albion Online
              </label>
            </div>
            <Tooltip
              title="Resumo dos Lotes de Fabricação no Albion"
              content="Cada categoria no Albion possui seu rendimento por quantidade: Culinária entrega 10 comidas por quantidade de receita; Alquimia entrega 5 poções; Refino e Equipamentos entregam 1 unidade. Essa regra é essencial para apurar o custo unitário e saber se haverá lucro real na venda!"
              formula="Unidades Finais = Quantidade × Rendimento"
            >
              <span className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 cursor-pointer">
                <HelpCircle className="w-3.5 h-3.5" />
                Como funciona o rendimento?
              </span>
            </Tooltip>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CATEGORIAS_LOTE.map((cat) => {
              const isSelected = categoriaAtual === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategoria(cat)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? `${cat.bgAtivo} ${cat.bordaAtiva} ring-1 ring-amber-400/40`
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-200">
                        {cat.icone}
                        <span>{cat.nome}</span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${cat.badgeCor}`}>
                        {cat.regraTexto}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {cat.exemplos}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Rendimento:</span>
                    <span className="font-bold text-amber-300">
                      {cat.rendimentoPadrao} un / quantidade
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Opção para Rendimento Personalizado */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Multiplicador de rendimento por quantidade:</span>
              <span className="text-xs font-bold text-amber-300">
                {rendimentoAtual} un geradas por 1 quantidade
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Ajustar manualmente:</span>
              <input
                type="number"
                min="1"
                max="100"
                value={rendimentoAtual}
                onChange={(e) =>
                  setRequest((prev) => ({
                    ...prev,
                    categoriaProducao: 'CUSTOMIZADO',
                    rendimentoPorClique: Math.max(1, parseInt(e.target.value) || 1),
                  }))
                }
                className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center text-amber-300 font-extrabold focus:outline-none focus:border-amber-500"
              />
              <span className="text-xs text-slate-400">un/quantidade</span>
            </div>
          </div>
        </div>

        {/* 2. Três Colunas: Quantidade de Fabricação, Taxa de Retorno, Preço de Venda Unitário */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Quantidade de Fabricação */}
          <div className="space-y-1.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <Tooltip
                title="Quantidade para Produção"
                content="Quantidade de produções que serão fabricadas nesta ordem. Em Culinária, cada 1 quantidade de produção consome os insumos da receita e gera 10 comidas prontas. Em Alquimia, gera 5 frascos. Em Refino e Equipamentos, gera 1 item."
                formula="Itens Finais = Quantidade × Rendimento"
              >
                <label className="text-xs font-semibold text-slate-300">
                  Quantidade de Fabricação
                </label>
              </Tooltip>
              <span className="text-[10px] text-slate-400">Quantidade de produção</span>
            </div>
            <input
              type="number"
              min="1"
              value={request.quantidadeParaProducao}
              onChange={(e) =>
                setRequest((prev) => ({
                  ...prev,
                  quantidadeParaProducao: Math.max(1, parseInt(e.target.value) || 1),
                }))
              }
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
            />
            {/* Indicador de Unidades Finais Geradas */}
            <div className="pt-1.5 flex items-center justify-between text-[11px] bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-400">Total gerado:</span>
              <span className="text-amber-400 font-extrabold flex items-center gap-1">
                <span>{request.quantidadeParaProducao || 1}x quantidade × {rendimentoAtual}</span>
                <span className="text-slate-500">=</span>
                <span className="text-emerald-400">{totalUnidadesGeradas} itens</span>
              </span>
            </div>
          </div>

          {/* Taxa de Retorno (TRR) */}
          <div className="space-y-1.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <Tooltip
                title="Taxa de Retorno (Resource Return Rate - TRR)"
                content="Percentual de recursos devolvidos à sua bolsa logo após a fabricação. Bônus em cidades com especialização oferecem 24.8% ou 15.2%, podendo ultrapassar 47.9% com Foco de Produção ou 53.9% em Esconderijos (Hideouts) de alto nível."
                formula="Retorno = Quantidade Total × (Taxa de Retorno / 100)"
              >
                <label className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5" />
                  Taxa de Retorno (%)
                </label>
              </Tooltip>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                {request.taxaDeRetorno}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="60"
                step="1"
                value={request.taxaDeRetorno}
                onChange={(e) =>
                  setRequest((prev) => ({
                    ...prev,
                    taxaDeRetorno: Number(e.target.value),
                  }))
                }
                className="w-full accent-cyan-400"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={request.taxaDeRetorno}
                onChange={(e) =>
                  setRequest((prev) => ({
                    ...prev,
                    taxaDeRetorno: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                  }))
                }
                className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center text-slate-100 font-bold"
              />
            </div>
            {/* Atalhos rápidos de taxa de retorno */}
            <div className="flex flex-wrap gap-1 pt-1">
              {[
                { taxa: 0, label: '0% (Sem Retorno)' },
                { taxa: 15.2, label: '15.2% (Base)' },
                { taxa: 24.8, label: '24.8% (Bônus)' },
                { taxa: 47.9, label: '47.9% (Com Foco)' },
                { taxa: 53.9, label: '53.9% (Hideout)' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRequest((prev) => ({ ...prev, taxaDeRetorno: p.taxa }))}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    request.taxaDeRetorno === p.taxa
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preço de Venda Unitário */}
          <div className="space-y-1.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <Tooltip
                title="Preço de Venda Unitário no Mercado"
                content="Valor de venda individual de 1 unidade do item final no mercado (ex: o preço de 1 Guisado de Carne, 1 Poção de Cura ou 1 Espada Larga em moedas de Prata)."
                formula="Receita Bruta = Preço Unitário × Total de Itens Fabricados"
              >
                <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Preço de Venda Unitário
                </label>
              </Tooltip>
              <span className="text-[10px] text-amber-400/80">Prata por unidade</span>
            </div>
            <input
              type="number"
              min="0"
              step="100"
              value={request.precoDeVenda}
              onChange={(e) =>
                setRequest((prev) => ({
                  ...prev,
                  precoDeVenda: Math.max(0, parseFloat(e.target.value) || 0),
                }))
              }
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-500"
            />
            <div className="pt-1.5 flex items-center justify-between text-[11px] bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-400">Receita bruta total:</span>
              <span className="text-amber-400 font-bold">
                {(request.precoDeVenda * totalUnidadesGeradas).toLocaleString('pt-BR')} 🪙
              </span>
            </div>
          </div>
        </div>

        {/* 3. Opções de Mercado: Conta Premium & Ordem de Venda */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Conta Premium Banner */}
          <div
            onClick={() => setRequest((prev) => ({ ...prev, contaPremium: !prev.contaPremium }))}
            className={`cursor-pointer rounded-xl p-4 border transition-all flex items-center justify-between gap-4 ${
              request.contaPremium
                ? 'bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border-amber-500/50 shadow-lg shadow-amber-950/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  request.contaPremium
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                <Crown className="w-5 h-5 font-bold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Tooltip
                    title="Impacto da Conta Premium"
                    content="Ter Conta Premium ativa concede 6% de desconto nas taxas do mercado (taxa reduzida de 12% para 6%)."
                    formula="Taxa: Premium = 6% | Sem Premium = 12%"
                  >
                    <span className="text-sm font-bold text-slate-100">
                      Conta Premium Ativa
                    </span>
                  </Tooltip>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      request.contaPremium
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {request.contaPremium ? 'Taxa 6% (Premium)' : 'Taxa 12% (Normal)'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Desconto de 6% nas taxas do mercado de Albion.
                </p>
              </div>
            </div>
            <div
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                request.contaPremium ? 'bg-amber-500 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="bg-slate-950 w-4 h-4 rounded-full shadow-md" />
            </div>
          </div>

          {/* Tipo de Venda: Ordem de Venda vs Venda Instantânea */}
          <div
            onClick={() => setRequest((prev) => ({ ...prev, ordemDeVenda: !(prev.ordemDeVenda ?? true) }))}
            className={`cursor-pointer rounded-xl p-4 border transition-all flex items-center justify-between gap-4 ${
              (request.ordemDeVenda ?? true)
                ? 'bg-gradient-to-r from-cyan-950/40 via-cyan-900/20 to-slate-900 border-cyan-500/40 shadow-lg'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  (request.ordemDeVenda ?? true)
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                <Tag className="w-5 h-5 font-bold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Tooltip
                    title="Ordem de Venda (Sell Order)"
                    content="No Albion, colocar ordem de venda cobra 2.5% de taxa de montagem antecipada (não reembolsável). Se você vender direto para ordem de compra (Venda Instantânea), essa taxa de 2.5% não é cobrada!"
                    formula="Ordem = +2.5% taxa montagem | Venda Direta = 0% taxa de montagem"
                  >
                    <span className="text-sm font-bold text-slate-100">
                      Vender via Ordem de Venda
                    </span>
                  </Tooltip>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      (request.ordemDeVenda ?? true)
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {(request.ordemDeVenda ?? true) ? '+2.5% Taxa Montagem' : 'Venda Direta (0% Taxa Montagem)'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {(request.ordemDeVenda ?? true)
                    ? 'Paga 2.5% de taxa ao criar ordem de venda.'
                    : 'Venda instantânea para ordens existentes (sem taxa de montagem).'}
                </p>
              </div>
            </div>
            <div
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                (request.ordemDeVenda ?? true) ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="bg-slate-950 w-4 h-4 rounded-full shadow-md" />
            </div>
          </div>
        </div>

        {/* 4. Recursos Avançados do Albion (Barraca, Diários, Foco de Produção) */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-4">
          <div
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-200">
                Economia Real do Albion (Taxa da Loja, Diários de Artesão & Foco)
              </h3>
            </div>
            <button className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1">
              {showAdvancedSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showAdvancedSettings && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
              {/* 1. Taxa da Estação / Barraca na Cidade */}
              <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <Tooltip
                    title="Taxa da Loja na Cidade (Nutrition Fee)"
                    content="Taxa que o dono da barraca na cidade real cobra por 100 de nutrição gasta. A fórmula oficial é: Nutrição = Item Value × 0.1125 × Quantidade. Custo = (Nutrição / 100) × Taxa."
                    formula="(Item Value × 0.1125 × Quantidade / 100) × Taxa"
                  >
                    <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5" />
                      Taxa da Barraca (p/ 100 Nutrição)
                    </label>
                  </Tooltip>
                  <span className="text-[10px] text-slate-400">Prata</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Preço da Loja (p/ 100 Nutrição):</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={request.taxaEstacaoPorCemNutricao ?? 0}
                      onChange={(e) =>
                        setRequest((prev) => ({
                          ...prev,
                          taxaEstacaoPorCemNutricao: Math.max(0, parseFloat(e.target.value) || 0),
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Item Value (Valor Base):</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={request.itemValue ?? 480}
                      onChange={(e) =>
                        setRequest((prev) => ({
                          ...prev,
                          itemValue: Math.max(0, parseFloat(e.target.value) || 0),
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Atalhos rápidos de taxa de barraca */}
                <div className="pt-1 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Atalhos rápidos de taxa:</span>
                    <span className="text-amber-400 font-semibold">
                      {((request.taxaEstacaoPorCemNutricao ?? 0) === 0) ? (
                        '⚠️ Sem custo de loja'
                      ) : (
                        `Custo: ~${Math.round((((request.itemValue || 480) * 0.1125 * (request.quantidadeParaProducao || 1)) / 100.0) * (request.taxaEstacaoPorCemNutricao || 0)).toLocaleString('pt-BR')} 🪙`
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                    {[
                      { label: 'Ilha (0)', valor: 0 },
                      { label: 'Baixa (400)', valor: 400 },
                      { label: 'Média (600)', valor: 600 },
                      { label: 'Alta (850)', valor: 850 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          setRequest((prev) => ({
                            ...prev,
                            taxaEstacaoPorCemNutricao: preset.valor,
                          }))
                        }
                        className={`px-1.5 py-1 rounded text-center font-medium transition-all ${
                          request.taxaEstacaoPorCemNutricao === preset.valor
                            ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm'
                            : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {preset.label}                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Diários de Artesão */}
              <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <Tooltip
                    title="Ciclo dos Diários de Artesão"
                    content="Comprar o diário vazio no mercado -> Encher com a fama obtida no craft -> Vender o diário cheio por um preço com lucro. O sistema desconta o custo do vazio e as taxas de mercado para apurar se vale a pena!"
                    formula="Lucro Diários = (Preço Cheio - Taxas) - Preço Vazio"
                  >
                    <label className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      Diários de Artesão
                    </label>
                  </Tooltip>
                  {((request.precoDiarioCheio ?? request.valorVendaDiario ?? 0) > (request.precoDiarioVazio ?? 0)) && (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      Spread: +{((request.precoDiarioCheio ?? request.valorVendaDiario ?? 0) - (request.precoDiarioVazio ?? 0)).toLocaleString('pt-BR')} 🪙
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Qtd Preenchida:</span>
                    <input
                      type="number"
                      min="0"
                      value={request.quantidadeDiarios ?? 0}
                      onChange={(e) =>
                        setRequest((prev) => ({
                          ...prev,
                          quantidadeDiarios: Math.max(0, parseInt(e.target.value) || 0),
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-cyan-300 font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Compra Vazio:</span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      placeholder="Ex: 1.200"
                      value={request.precoDiarioVazio ?? 0}
                      onChange={(e) =>
                        setRequest((prev) => ({
                          ...prev,
                          precoDiarioVazio: Math.max(0, parseFloat(e.target.value) || 0),
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-rose-300 font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Venda Cheio:</span>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      placeholder="Ex: 5.000"
                      value={request.precoDiarioCheio ?? request.valorVendaDiario ?? 0}
                      onChange={(e) =>
                        setRequest((prev) => ({
                          ...prev,
                          precoDiarioCheio: Math.max(0, parseFloat(e.target.value) || 0),
                          valorVendaDiario: Math.max(0, parseFloat(e.target.value) || 0),
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-emerald-300 font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Foco de Produção & Silver per Focus */}
              <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <Tooltip
                    title="Foco de Produção & Silver per Focus (SPF)"
                    content="Ativar o foco aumenta a taxa de retorno de recursos. A métrica Silver per Focus (SPF) indica quantas moedas de prata de lucro você obtém por cada 1 ponto de foco gasto."
                    formula="SPF = Lucro / Pontos de Foco Gastos"
                  >
                    <label className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      Foco de Produção (SPF)
                    </label>
                  </Tooltip>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-300">
                    <input
                      type="checkbox"
                      checked={request.usarFoco ?? false}
                      onChange={(e) =>
                        setRequest((prev) => ({
                          ...prev,
                          usarFoco: e.target.checked,
                          taxaDeRetorno: e.target.checked && prev.taxaDeRetorno < 40 ? 48 : prev.taxaDeRetorno,
                        }))
                      }
                      className="accent-emerald-500 rounded"
                    />
                    Ativar Foco
                  </label>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Custo Total de Foco:</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    disabled={!(request.usarFoco ?? false)}
                    value={request.custoFocoTotal ?? 0}
                    onChange={(e) =>
                      setRequest((prev) => ({
                        ...prev,
                        custoFocoTotal: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 font-bold focus:outline-none disabled:opacity-40"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. Tabela de Recursos Necessários por Quantidade */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-200">
                  Lista de Insumos da Receita (por 1 quantidade de fabricação)
                </h3>
                <span className="text-[11px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-semibold border border-slate-700">
                  Rende {rendimentoAtual} un
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Informe os ingredientes necessários na tela do jogo para 1 quantidade. A quantidade de insumos será multiplicada pela quantidade total ({request.quantidadeParaProducao}x).
              </p>
            </div>
            <button
              type="button"
              onClick={addResource}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              Adicionar Recurso
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="px-4 py-3">
                    <Tooltip
                      title="Recurso / Insumo"
                      content="Nome do material necessário na receita do jogo (ex: Carne Crua T8, Barra de Aço, Dedaleira Branca, etc.)."
                    >
                      <span>Recurso</span>
                    </Tooltip>
                  </th>
                  <th className="px-4 py-3">
                    <Tooltip
                      title="Quantidade por 1 Receita"
                      content="Quantidade individual deste material exigida na receita do jogo para produzir 1 quantidade."
                    >
                      <span>Qtd / 1 Quantidade</span>
                    </Tooltip>
                  </th>
                  <th className="px-4 py-3">
                    <Tooltip
                      title="Quantidade Total Bruta no Inventário"
                      content="Total de materiais necessários no seu inventário para iniciar a fabricação da quantidade completa."
                      formula="Qtd / Quantidade × Quantidade Total"
                    >
                      <span>Total ({request.quantidadeParaProducao}x quantidade)</span>
                    </Tooltip>
                  </th>
                  <th className="px-4 py-3">
                    <Tooltip
                      title="Retorno de Recursos (TRR)"
                      content="Quantidade de materiais devolvida à sua mochila pelo bônus de produção da cidade ou foco."
                      formula="Total × Taxa de Retorno %"
                    >
                      <span>Retorno ({request.taxaDeRetorno}%)</span>
                    </Tooltip>
                  </th>
                  <th className="px-4 py-3">
                    <Tooltip
                      title="Consumo Efetivo"
                      content="Quantidade real de materiais consumida após a devolução da taxa de retorno. É sobre este consumo líquido que o custo financeiro é calculado!"
                      formula="Total - Quantidade Retornada"
                    >
                      <span className="text-amber-300 font-bold">Consumo Real</span>
                    </Tooltip>
                  </th>
                  <th className="px-4 py-3">
                    <Tooltip
                      title="Valor Unitário em Prata"
                      content="Preço de compra por unidade deste material no mercado."
                    >
                      <span>Valor Unitário</span>
                    </Tooltip>
                  </th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {request.recurso.map((rec, index) => {
                  const totalBruto = rec.quantidade * request.quantidadeParaProducao;
                  const retornoQtd = (totalBruto * (request.taxaDeRetorno / 100)).toFixed(1);
                  const consumoLiquido = (totalBruto * (1 - request.taxaDeRetorno / 100)).toFixed(1);

                  return (
                    <tr key={index} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-2.5">
                        <input
                          type="text"
                          value={rec.nome}
                          onChange={(e) => handleResourceChange(index, 'nome', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/70 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-medium focus:outline-none focus:border-amber-500"
                          placeholder="Ex: Carne Crua T8"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          min="1"
                          value={rec.quantidade}
                          onChange={(e) =>
                            handleResourceChange(index, 'quantidade', e.target.value)
                          }
                          className="w-20 bg-slate-900 border border-slate-700/70 rounded-lg px-2 py-1 text-xs text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-slate-300 font-semibold">
                        <Tooltip
                          title={`Total Bruto de ${rec.nome}`}
                          content={`Para executar ${request.quantidadeParaProducao}x quantidade(s), você precisa ter inicialmente ${totalBruto} un na mochila.`}
                          formula={`${rec.quantidade} × ${request.quantidadeParaProducao} = ${totalBruto} un`}
                        >
                          <span className="cursor-help underline decoration-dotted decoration-slate-600">
                            {totalBruto} un
                          </span>
                        </Tooltip>
                      </td>
                      <td className="px-4 py-2.5 text-cyan-400 font-bold">
                        <Tooltip
                          title={`Retorno de ${rec.nome}`}
                          content={`Com ${request.taxaDeRetorno}% de taxa de retorno, o jogo devolve ${retornoQtd} unidades para a sua bolsa.`}
                          formula={`${totalBruto} × ${request.taxaDeRetorno}% = ${retornoQtd} un`}
                        >
                          <span className="cursor-help underline decoration-dotted decoration-cyan-400/60">
                            +{retornoQtd} un
                          </span>
                        </Tooltip>
                      </td>
                      <td className="px-4 py-2.5 text-slate-200 font-medium">
                        <Tooltip
                          title={`Consumo Efetivo de ${rec.nome}`}
                          content={`Você precisou de ${totalBruto} un inicialmente, mas recebeu de volta +${retornoQtd} un. O consumo líquido foi de apenas ${consumoLiquido} un!`}
                          formula={`${totalBruto} - ${retornoQtd} = ${consumoLiquido} un`}
                        >
                          <span className="cursor-help underline decoration-dotted decoration-amber-400/70 font-bold text-amber-300">
                            {consumoLiquido} un
                          </span>
                        </Tooltip>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            step="10"
                            value={rec.valor}
                            onChange={(e) =>
                              handleResourceChange(index, 'valor', e.target.value)
                            }
                            className="w-28 bg-slate-900 border border-slate-700/70 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                          />
                          <span className="text-[10px] text-slate-400">🪙</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => removeResource(index)}
                          disabled={request.recurso.length <= 1}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Remover recurso"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Resumo Rápido de Custo por Unidade Final */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Custo de insumos por 1 quantidade (com {request.taxaDeRetorno}% TRR):{' '}
                <strong className="text-amber-300">{Math.round(custoInsumosCorrigidoQuantidade).toLocaleString('pt-BR')} 🪙</strong>
              </span>
            </div>
            <div className="text-slate-300 font-semibold bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              <span>Custo de materiais por unidade final ({rendimentoAtual} un/quantidade): </span>
              <strong className="text-emerald-400">
                ~{custoInsumosPorUnidadeFinal.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} 🪙 cada
              </strong>
            </div>
          </div>
        </div>

        {/* Botão de Ação */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={onCalculate}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Calculando...' : 'Calcular Viabilidade de Produção'}
          </button>
        </div>
      </div>
    </div>
  );
};
