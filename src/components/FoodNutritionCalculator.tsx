import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Sparkles,
  TrendingUp,
  Coins,
  Store,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  Scale,
  Percent,
  Plus,
  Trash2,
  Crown,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import {
  FoodNutritionSaleRequestDto,
  FoodNutritionSaleResponseDto,
  FoodPreset,
  RecursoRequestDto,
} from '../types/albion';
import { ALBION_FOOD_PRESETS } from '../data/albionFoodPresets';
import { Tooltip } from './Tooltip';

interface FoodNutritionCalculatorProps {
  request: FoodNutritionSaleRequestDto;
  setRequest: React.Dispatch<React.SetStateAction<FoodNutritionSaleRequestDto>>;
  response: FoodNutritionSaleResponseDto;
  onCalculate?: () => void;
  isLoading?: boolean;
}

export const FoodNutritionCalculator: React.FC<FoodNutritionCalculatorProps> = ({
  request,
  setRequest,
  response,
  onCalculate,
  isLoading,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('sopa-repolho');

  const applyPreset = (preset: FoodPreset) => {
    setSelectedPresetId(preset.id);
    // Multiplica ingredientes base pela quantidade de cliques (padrão 1 clique = 10 comidas)
    const cliques = Math.max(1, Math.floor(request.quantidadeProducao / preset.rendimentoPorClique));
    const ingredientesEscalados: RecursoRequestDto[] = preset.ingredientesBase.map((ing) => ({
      ...ing,
      quantidade: ing.quantidade * cliques,
    }));

    setRequest((prev) => ({
      ...prev,
      nomeComida: preset.nome,
      tier: preset.tier,
      nutricaoPorUnidade: preset.nutricaoBase,
      comidaFavorita: false,
      ingredientes: ingredientesEscalados,
    }));
  };

  const handleIngredientChange = (
    index: number,
    field: keyof RecursoRequestDto,
    val: string | number
  ) => {
    const updated = [...request.ingredientes];
    if (field === 'nome') {
      updated[index].nome = String(val);
    } else {
      updated[index][field] = Math.max(0, Number(val) || 0);
    }
    setRequest((prev) => ({ ...prev, ingredientes: updated }));
  };

  const addIngredient = () => {
    setRequest((prev) => ({
      ...prev,
      ingredientes: [...prev.ingredientes, { nome: 'Novo Ingrediente', quantidade: 10, valor: 50 }],
    }));
  };

  const removeIngredient = (index: number) => {
    setRequest((prev) => ({
      ...prev,
      ingredientes: prev.ingredientes.filter((_, i) => i !== index),
    }));
  };

  // Preço que o dono da barraquinha configurou por 100 de nutrição (X)
  const X = request.valorPorCemNutricao;
  const nutricaoEfetiva = response.nutricaoEfetivaPorUnidade;
  const fatorNutricao = (nutricaoEfetiva / 100).toFixed(2);

  return (
    <div className="space-y-8">
      {/* Banner Explicativo da Fórmula Oficial */}
      <div className="bg-gradient-to-r from-amber-950/50 via-slate-900 to-cyan-950/50 rounded-2xl p-6 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <UtensilsCrossed className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-slate-100 tracking-wide">
                Vender Comidas para Barraquinhas (Bancadas de Craft)
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Diferente do mercado que cobra 6,5% a 10,5% de impostos e demora para vender, as
              bancadas e lojas dos jogadores pagam <strong className="text-amber-300">prata instantânea e limpa</strong> diretamente
              ao alimentar os NPCs. Use esta ferramenta para descobrir se compensa mais alimentar a
              bancada ou colocar seus alimentos no mercado!
            </p>
          </div>

          {/* Destaque da Fórmula Matemática */}
          <div className="bg-slate-950/80 rounded-xl p-4 border border-amber-500/40 min-w-[280px]">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              A Fórmula de Conversão Oficial
            </div>
            <div className="font-mono text-xs bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-slate-200">
              Valor Pago = (<span className="text-cyan-300 font-bold">Nutrição</span> / 100) × <span className="text-amber-400 font-bold">X</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Onde <span className="text-amber-300 font-semibold">X</span> é a prata configurada pelo dono da barraquinha por cada 100 pontos de nutrição.
            </p>
          </div>
        </div>
      </div>

      {/* Seleção Rápida de Comidas Frequentes do Albion */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-amber-400" />
            Escolha uma Comida Típica de Alimentação ou Crie a Sua
          </label>
          <span className="text-xs text-slate-400">Receitas produzem 10 unidades por clique</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {ALBION_FOOD_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{preset.icone}</span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                    {preset.tier}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="font-bold text-xs text-slate-200 leading-tight">
                    {preset.nome}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    <span className="text-cyan-400 font-semibold">{preset.nutricaoBase}</span> Nutrição
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Painel de Configurações da Barraquinha e Produção */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Parâmetros da Barraquinha do NPC */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-amber-400">
            <Store className="w-4 h-4" />
            1. Dados da Barraquinha (NPC)
          </div>

          {/* Nome da Comida & Tier */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Nome da Comida</label>
            <input
              type="text"
              value={request.nomeComida}
              onChange={(e) => setRequest({ ...request, nomeComida: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Nutrição Base por Unidade */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Nutrição por Unidade</label>
              <Tooltip
                title="Nutrição da Comida"
                content="Quantidade fixa de nutrição que cada unidade da comida restaura na estação de fabricação do NPC (ex: Sopa T5 fornece 432 pontos)."
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
              </Tooltip>
            </div>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={request.nutricaoPorUnidade}
                onChange={(e) =>
                  setRequest({ ...request, nutricaoPorUnidade: Math.max(1, Number(e.target.value) || 1) })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400">pts</span>
            </div>
          </div>

          {/* Bônus de Comida Favorita (x2 Nutrição) */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={request.comidaFavorita}
                  onChange={(e) => setRequest({ ...request, comidaFavorita: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                Comida Favorita da Bancada (2x)
              </label>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                +100% Nutrição
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Se esta comida for a <em>comida favorita</em> daquela estação específica (ex: Sopa de Repolho em estações T5), o NPC consome com o dobro de eficiência e você ganha <strong>o dobro de prata</strong>!
            </p>
          </div>

          {/* Valor X configurado pelo dono por 100 de nutrição */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Valor X (Prata por 100 de Nutrição)
              </label>
              <Tooltip
                title="Configuração do Dono da Loja"
                content="Valor em prata configurado pelo proprietário da loja no menu da bancada para cada 100 de nutrição adicionada por jogadores visitantes."
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
              </Tooltip>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="25"
                value={request.valorPorCemNutricao}
                onChange={(e) =>
                  setRequest({ ...request, valorPorCemNutricao: Math.max(0, Number(e.target.value) || 0) })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-amber-300 font-black focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400">🪙 / 100 nut</span>
            </div>
          </div>

          {/* Resultado Imediato da Fórmula */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-1 text-xs">
            <div className="text-slate-400 font-medium">Cálculo da Barraquinha:</div>
            <div className="font-mono text-slate-200">
              ({nutricaoEfetiva} / 100) × {X} ={' '}
              <strong className="text-amber-400 font-black text-sm">
                {response.valorPagoPorUnidadeBarraquinha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>{' '}
              Pratas por comida
            </div>
          </div>
        </div>

        {/* Coluna 2: Custo de Produção (Culinária & TRR) */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-cyan-400">
            <TrendingUp className="w-4 h-4" />
            2. Custo de Fabricação & TRR
          </div>

          {/* Quantidade a Fabricar */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Qtd de Comidas</label>
              <input
                type="number"
                min="1"
                step="10"
                value={request.quantidadeProducao}
                onChange={(e) =>
                  setRequest({ ...request, quantidadeProducao: Math.max(1, Number(e.target.value) || 1) })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400">
                {(request.quantidadeProducao / 10).toFixed(1)} cliques (10 un/clique)
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">TRR (%)</label>
                <Tooltip
                  title="Taxa de Retorno de Recursos"
                  content="Em culinária, Caerleon e o uso de foco reduzem o consumo real de insumos (ex: 15% ou 48%)."
                >
                  <Percent className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                </Tooltip>
              </div>
              <input
                type="number"
                min="0"
                max="60"
                value={request.taxaDeRetorno}
                onChange={(e) =>
                  setRequest({ ...request, taxaDeRetorno: Math.max(0, Number(e.target.value) || 0) })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400">
                Custo Real: {100 - request.taxaDeRetorno}% dos insumos
              </span>
            </div>
          </div>

          {/* Lista de Insumos da Receita */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Ingredientes ({request.ingredientes.length})</span>
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {request.ingredientes.map((ing, idx) => {
                const subtotalBruto = ing.quantidade * ing.valor;
                const subtotalLiquido = subtotalBruto * (1 - request.taxaDeRetorno / 100);
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={ing.nome}
                        onChange={(e) => handleIngredientChange(idx, 'nome', e.target.value)}
                        className="bg-transparent border-0 text-slate-200 font-bold focus:outline-none flex-1 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeIngredient(idx)}
                        disabled={request.ingredientes.length <= 1}
                        className="text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-[11px]">
                      <div className="flex items-center gap-1 text-slate-400">
                        <span>Qtd:</span>
                        <input
                          type="number"
                          min="1"
                          value={ing.quantidade}
                          onChange={(e) => handleIngredientChange(idx, 'quantidade', e.target.value)}
                          className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-100 font-bold"
                        />
                      </div>

                      <div className="flex items-center gap-1 text-slate-400">
                        <span>Preço:</span>
                        <input
                          type="number"
                          min="0"
                          value={ing.valor}
                          onChange={(e) => handleIngredientChange(idx, 'valor', e.target.value)}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-amber-300 font-bold"
                        />
                        <span>🪙</span>
                      </div>

                      <div className="text-right text-slate-300 font-medium">
                        {Math.round(subtotalLiquido).toLocaleString('pt-BR')} 🪙
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumo do Custo Unitário com TRR */}
          <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Custo Real por Comida:</span>
            <span className="text-amber-300 font-black text-sm">
              {response.custoProducaoPorUnidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 🪙
            </span>
          </div>
        </div>

        {/* Coluna 3: Comparação com o Mercado da Cidade */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-violet-400">
            <Scale className="w-4 h-4" />
            3. Comparação com o Mercado
          </div>

          {/* Preço de Venda no Mercado */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Preço no Mercado da Cidade
              </label>
              <Tooltip
                title="Preço do Mercado"
                content="Valor pelo qual você conseguiria vender essa comida no mercado tradicional da cidade (ex: 1.400 pratas)."
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
              </Tooltip>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="50"
                value={request.precoMercadoUnitario}
                onChange={(e) =>
                  setRequest({ ...request, precoMercadoUnitario: Math.max(0, Number(e.target.value) || 0) })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-amber-300 font-black focus:outline-none focus:border-violet-500"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400">🪙 / unidade</span>
            </div>
          </div>

          {/* Configurações de Taxa do Mercado */}
          <div className="space-y-3 pt-1">
            <label className="flex items-center justify-between bg-slate-950/70 p-3 rounded-xl border border-slate-800 cursor-pointer">
              <div className="flex items-center gap-2">
                <Crown className={`w-4 h-4 ${request.contaPremium ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className="text-xs font-semibold text-slate-200">Conta Premium Ativa</span>
              </div>
              <input
                type="checkbox"
                checked={request.contaPremium}
                onChange={(e) => setRequest({ ...request, contaPremium: e.target.checked })}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between bg-slate-950/70 p-3 rounded-xl border border-slate-800 cursor-pointer">
              <div className="text-xs font-semibold text-slate-200">
                Criar Ordem de Venda (+2.5%)
              </div>
              <input
                type="checkbox"
                checked={request.ordemDeVenda}
                onChange={(e) => setRequest({ ...request, ordemDeVenda: e.target.checked })}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
              />
            </label>
          </div>

          {/* Taxa Aplicada */}
          <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Taxa de Mercado Total:</span>
              <span className="font-bold text-rose-400">{response.taxaMercadoPercentual}%</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Preço Líquido do Mercado:</span>
              <span className="font-black text-amber-300 text-sm">
                {response.precoLiquidoMercadoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 🪙
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              {request.precoMercadoUnitario} × (1 - {response.taxaMercadoPercentual / 100}) = {response.precoLiquidoMercadoUnitario}
            </p>
          </div>
        </div>
      </div>

      {/* PAINEL DECISÓRIO: QUAL VALE MAIS A PENA? */}
      <div
        className={`rounded-2xl p-6 border shadow-2xl transition-all ${
          response.melhorOpcao === 'BARRAQUINHA'
            ? 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-900/30 border-amber-500/50'
            : response.melhorOpcao === 'MERCADO'
            ? 'bg-gradient-to-r from-violet-950/60 via-slate-900 to-violet-900/30 border-violet-500/50'
            : 'bg-gradient-to-r from-rose-950/60 via-slate-900 to-rose-900/30 border-rose-500/50'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {response.melhorOpcao === 'BARRAQUINHA' ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30">
                  <CheckCircle2 className="w-4 h-4" /> RECOMENDAÇÃO: VENDER NA BARRAQUINHA
                </span>
              ) : response.melhorOpcao === 'MERCADO' ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-violet-500 text-slate-950 shadow-md shadow-violet-500/30">
                  <CheckCircle2 className="w-4 h-4" /> RECOMENDAÇÃO: VENDER NO MERCADO
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-slate-950 shadow-md shadow-rose-500/30">
                  <AlertTriangle className="w-4 h-4" /> ATENÇÃO: PREJUÍZO DETECTADO
                </span>
              )}
            </div>

            <p className="text-sm text-slate-200 font-medium leading-relaxed max-w-3xl">
              {response.recomendacao}
            </p>
          </div>

          {/* Cards de Comparativo Lado a Lado */}
          <div className="grid grid-cols-2 gap-3 min-w-[320px]">
            {/* Card Barraquinha */}
            <div
              className={`p-4 rounded-xl border text-center ${
                response.melhorOpcao === 'BARRAQUINHA'
                  ? 'bg-amber-500/15 border-amber-500 shadow-lg'
                  : 'bg-slate-950/70 border-slate-800'
              }`}
            >
              <div className="text-[11px] font-bold text-amber-400 flex items-center justify-center gap-1">
                <Store className="w-3.5 h-3.5" /> Barraquinha (NPC)
              </div>
              <div className="text-lg font-black text-amber-300 mt-1">
                {response.valorPagoPorUnidadeBarraquinha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 🪙
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Lucro: +{response.lucroUnitarioBarraquinha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/un
              </div>
              <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                Total: +{response.lucroTotalBarraquinha.toLocaleString('pt-BR')} 🪙
              </div>
            </div>

            {/* Card Mercado */}
            <div
              className={`p-4 rounded-xl border text-center ${
                response.melhorOpcao === 'MERCADO'
                  ? 'bg-violet-500/15 border-violet-500 shadow-lg'
                  : 'bg-slate-950/70 border-slate-800'
              }`}
            >
              <div className="text-[11px] font-bold text-violet-400 flex items-center justify-center gap-1">
                <Scale className="w-3.5 h-3.5" /> Mercado Líquido
              </div>
              <div className="text-lg font-black text-violet-300 mt-1">
                {response.precoLiquidoMercadoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 🪙
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Lucro: +{response.lucroUnitarioMercado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/un
              </div>
              <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                Total: +{response.lucroTotalMercado.toLocaleString('pt-BR')} 🪙
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
