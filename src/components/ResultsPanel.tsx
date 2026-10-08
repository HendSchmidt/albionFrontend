import React from 'react';
import { CraftResponseDto, DetalhesCalculo } from '../types/albion';
import { TrendingUp, TrendingDown, DollarSign, Package, Percent, Crown, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface ResultsPanelProps {
  response: CraftResponseDto;
  detalhes: DetalhesCalculo;
  quantidadeProducao: number;
  contaPremium: boolean;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  response,
  detalhes,
  quantidadeProducao,
  contaPremium,
}) => {
  const isLucro = response.lucro > 0;
  const isPrejuizo = response.lucro < 0;

  return (
    <div className="space-y-6">
      {/* Top 3 KPI Cards: Custo Total, Receita Líquida, Lucro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Custo Total de Produção */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <Tooltip
              title="Custo Total da Produção"
              content="Soma do valor de todos os insumos consumidos efetivamente após o retorno de materiais devolvidos pelo jogo."
              formula="custoTotalDaProdcao = ∑ custoPorRecurso"
            >
              <span className="flex items-center gap-1.5 text-slate-300">
                <Package className="w-4 h-4 text-cyan-400" />
                Custo Total da Produção
              </span>
            </Tooltip>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
              {quantidadeProducao}x itens
            </span>
          </div>
          <div className="text-2xl font-black text-slate-100 tracking-tight">
            {response.custoTotalDaProdcao.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            <span className="text-xs font-bold text-amber-400">🪙 Prata</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Custo unitário: {(response.custoTotalDaProdcao / quantidadeProducao).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} por item
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Receita Líquida */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <Tooltip
              title="Receita Líquida de Venda"
              content="Valor financeiro real arrecadado após a cobrança das taxas de mercado de Albion (6% se tiver Conta Premium, ou 12% se não tiver)."
              formula="Receita Bruta × (1 - Taxa Mercado)"
            >
              <span className="flex items-center gap-1.5 text-slate-300">
                <DollarSign className="w-4 h-4 text-amber-400" />
                Receita Líquida (Venda)
              </span>
            </Tooltip>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                contaPremium
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {contaPremium ? '6% Taxa (Premium)' : '12% Taxa (Sem Premium)'}
            </span>
          </div>
          <div className="text-2xl font-black text-slate-100 tracking-tight">
            {detalhes.receitaLiquida.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            <span className="text-xs font-bold text-amber-400">🪙 Prata</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Bruto: {detalhes.receitaBruta.toLocaleString('pt-BR')}</span>
            {detalhes.valorTaxaMercado > 0 && (
              <span className="text-rose-400">
                -Taxa: {detalhes.valorTaxaMercado.toLocaleString('pt-BR')}
              </span>
            )}
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Lucro Líquido Final */}
        <div
          className={`rounded-2xl p-5 border shadow-xl relative overflow-hidden transition-all ${
            isLucro
              ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/40 shadow-emerald-950/20'
              : isPrejuizo
              ? 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/40 shadow-rose-950/20'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <Tooltip
              title="Lucro Líquido Final"
              content="O dinheiro limpo que sobra na sua mão após pagar todo o custo de produção e todas as taxas de venda do mercado."
              formula="lucro = Receita Líquida - Custo Total"
            >
              <span className="flex items-center gap-1.5 text-slate-300">
                {isLucro ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                )}
                Lucro Líquido Final
              </span>
            </Tooltip>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                isLucro
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isPrejuizo
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isLucro ? 'Lucrativo' : isPrejuizo ? 'Prejuízo' : 'Empate'}
            </span>
          </div>

          <div
            className={`text-2xl font-black tracking-tight ${
              isLucro ? 'text-emerald-400' : isPrejuizo ? 'text-rose-400' : 'text-slate-300'
            }`}
          >
            {response.lucro > 0 ? '+' : ''}
            {response.lucro.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            <span className="text-xs font-bold text-amber-400">🪙 Prata</span>
          </div>

          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Margem: {detalhes.margemLucroPercentual}%</span>
            <span>ROI: {detalhes.roiPercentual}%</span>
          </div>
        </div>
      </div>

      {/* Detalhamento de Custo Por Recurso (custoPorRecurso) */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              Detalhamento de Custo por Recurso (custoPorRecurso)
            </h3>
            <p className="text-xs text-slate-400">
              Valor líquido consumido de cada recurso após aplicação da taxa de retorno.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {response.custoPorRecurso.length} insumos
          </span>
        </div>

        <div className="space-y-3">
          {response.custoPorRecurso.map((rec, idx) => {
            const percentual =
              response.custoTotalDaProdcao > 0
                ? Math.round((rec.valor / response.custoTotalDaProdcao) * 100)
                : 0;

            const qtdConsumida = detalhes.quantidadeConsumidaPorRecurso[rec.nome] ?? 0;
            const qtdRetornada = detalhes.quantidadeRetornadaPorRecurso[rec.nome] ?? 0;
            const qtdInicial = detalhes.quantidadeInicialPorRecurso[rec.nome] ?? 0;

            return (
              <div
                key={idx}
                className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{rec.nome}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-[11px] text-slate-400">
                      Inicial: {qtdInicial} un
                    </span>
                    <span className="text-[11px] text-cyan-400 font-semibold">
                      (Retornou {qtdRetornada} un)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-amber-300 text-sm">
                      {rec.valor.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      Pratas
                    </span>
                    <span className="text-[10px] text-slate-400 ml-2">
                      ({percentual}% do custo)
                    </span>
                  </div>
                </div>

                {/* Progress bar indicating cost proportion */}
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentual}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Economic Insights & Rules Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Impacto da Taxa de Retorno */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Percent className="w-4 h-4" />
            Vantagem da Taxa de Retorno (RRR)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Ao fabricar com a taxa de retorno configurada, os recursos retornados voltam
            diretamente para a sua bolsa após o craft, reduzindo substancialmente o seu
            custo efetivo de produção e aumentando o lucro líquido por ciclo.
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Total retornado para sua bolsa:</span>
            <span className="font-bold text-cyan-400">
              {Object.values(detalhes.quantidadeRetornadaPorRecurso).reduce((a, b) => a + b, 0).toFixed(1)}{' '}
              unidades de materiais
            </span>
          </div>
        </div>

        {/* Impacto da Conta Premium */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Crown className="w-4 h-4" />
            Impacto da Conta Premium (6% Desconto)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {contaPremium ? (
              <>
                Sua Conta Premium está <strong className="text-emerald-400">ativa</strong>.
                Você economizou{' '}
                <strong className="text-amber-300">
                  {detalhes.economiaPremium.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  Pratas
                </strong>{' '}
                em taxas de mercado neste lote de produção!
              </>
            ) : (
              <>
                Sua Conta Premium está <strong className="text-rose-400">inativa</strong>.
                Você está pagando{' '}
                <strong className="text-rose-300">
                  {detalhes.valorTaxaMercado.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  Pratas (6%)
                </strong>{' '}
                de taxa no mercado. Ative a conta premium para isenção/desconto dessa taxa.
              </>
            )}
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Diferença no lucro por lote:</span>
            <span className="font-bold text-amber-400">
              +{detalhes.economiaPremium.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}{' '}
              Pratas com Premium
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
