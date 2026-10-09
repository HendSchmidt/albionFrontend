import React from 'react';
import {
  UtensilsCrossed,
  Sparkles,
  Coins,
  Store,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Crown,
  HelpCircle,
} from 'lucide-react';
import {
  FoodNutritionSaleRequestDto,
  FoodNutritionSaleResponseDto,
} from '../types/albion';
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
}) => {
  // Preço que o dono da barraquinha configurou por 100 de nutrição (X)
  const X = request.valorPorCemNutricao;
  const nutricaoEfetiva = response.nutricaoEfetivaPorUnidade;

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
                Cálculo de Venda de Comida para Barraquinhas (Nutrição)
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Descubra exatamente quanta prata a barraquinha do jogador te paga por unidade e compare diretamente com o preço líquido do mercado (já descontando as taxas). Sem intermediários, sem taxas e com recebimento imediato!
            </p>
          </div>

          {/* Destaque da Fórmula Matemática */}
          <div className="bg-slate-950/80 rounded-xl p-4 border border-amber-500/40 min-w-[280px]">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              A Fórmula de Conversão
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

      {/* Painel de Configurações: Barraquinha e Comparação com Mercado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parâmetros da Barraquinha do NPC */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-amber-400">
            <Store className="w-4 h-4" />
            Parâmetros da Barraquinha (NPC / Estação)
          </div>

          {/* Nome da Comida & Quantidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Nome da Comida</label>
              <input
                type="text"
                value={request.nomeComida}
                onChange={(e) => setRequest({ ...request, nomeComida: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                placeholder="Ex: Sopa de Repolho T5"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Quantidade de Comidas</label>
              <input
                type="number"
                min="1"
                value={request.quantidadeProducao}
                onChange={(e) =>
                  setRequest({ ...request, quantidadeProducao: Math.max(1, Number(e.target.value) || 1) })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Nutrição Base por Unidade */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Nutrição da Comida (por unidade)</label>
              <Tooltip
                title="Nutrição da Comida"
                content="Quantidade de nutrição que 1 unidade desta comida fornece. Ex: Sopa de Repolho = 432, Sopa de Trigo = 144, Guisado = 864."
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
              <span className="absolute right-3 top-2 text-xs text-slate-400">pontos</span>
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
              Se esta for a <em>comida favorita</em> da estação onde você for abastecer, a nutrição dobra e você ganha <strong>o dobro de prata</strong> por unidade!
            </p>
          </div>

          {/* Valor X configurado pelo dono por 100 de nutrição */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Valor X (Prata paga por 100 de Nutrição)
              </label>
              <Tooltip
                title="Preço X Configurado na Barraquinha"
                content="Valor em prata configurado pelo proprietário da loja no menu da bancada para cada 100 de nutrição adicionada."
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

          {/* Resultado da Fórmula */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-1 text-xs">
            <div className="text-slate-400 font-medium">Resultado da Conversão:</div>
            <div className="font-mono text-slate-200">
              ({nutricaoEfetiva} / 100) × {X} ={' '}
              <strong className="text-amber-400 font-black text-sm">
                {response.valorPagoPorUnidadeBarraquinha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>{' '}
              Pratas por comida
            </div>
          </div>
        </div>

        {/* Comparação com o Mercado da Cidade */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-violet-400">
            <Scale className="w-4 h-4" />
            Comparação com o Mercado da Cidade
          </div>

          {/* Preço de Venda no Mercado */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Preço de Venda da Comida no Mercado
              </label>
              <Tooltip
                title="Preço no Mercado"
                content="Valor atual de venda da comida no mercado da cidade onde você está (ex: 1.400 pratas)."
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
                Criar Ordem de Venda (+2.5% montagem)
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
              <span>Taxa Total de Impostos do Mercado:</span>
              <span className="font-bold text-rose-400">{response.taxaMercadoPercentual}%</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Preço Líquido Recebido no Mercado:</span>
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
                Total ({request.quantidadeProducao} un):
              </div>
              <div className="text-xs text-amber-300 font-bold mt-0.5">
                {(response.valorPagoPorUnidadeBarraquinha * request.quantidadeProducao).toLocaleString('pt-BR')} 🪙
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
                Total ({request.quantidadeProducao} un):
              </div>
              <div className="text-xs text-violet-300 font-bold mt-0.5">
                {(response.precoLiquidoMercadoUnitario * request.quantidadeProducao).toLocaleString('pt-BR')} 🪙
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
