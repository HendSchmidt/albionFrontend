import React from 'react';
import { CraftRequestDto, RecursoRequestDto } from '../types/albion';
import { ALBION_ITEM_PRESETS, CITY_BONUSES } from '../data/albionPresets';
import { Plus, Trash2, Crown, Sparkles, MapPin, RefreshCw, ShoppingCart, Percent } from 'lucide-react';

interface CraftCalculatorProps {
  request: CraftRequestDto;
  setRequest: React.Dispatch<React.SetStateAction<CraftRequestDto>>;
  onCalculate: () => void;
  isLoading: boolean;
}

export const CraftCalculator: React.FC<CraftCalculatorProps> = ({
  request,
  setRequest,
  onCalculate,
  isLoading,
}) => {
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

  const applyPreset = (presetId: string) => {
    const found = ALBION_ITEM_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setRequest({ ...found.dto });
    }
  };

  const applyCityBonus = (taxa: number) => {
    setRequest((prev) => ({ ...prev, taxaDeRetorno: taxa }));
  };

  return (
    <div className="space-y-6">
      {/* Presets Bar */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Receitas Populares de Albion Online
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Clique para carregar parâmetros prontos
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {ALBION_ITEM_PRESETS.map((item) => (
            <button
              key={item.id}
              onClick={() => applyPreset(item.id)}
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-800/50 text-left transition-all group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">
                {item.icone}
              </span>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-slate-200 truncate group-hover:text-amber-400">
                  {item.nomeItem}
                </div>
                <div className="text-[10px] text-slate-400">{item.tier}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Box */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400" />
              Parâmetros da Produção (Craft)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Defina a quantidade de itens, taxa de retorno dos recursos e condições de venda.
            </p>
          </div>
        </div>

        {/* 3 Columns: Quantidade, Taxa de Retorno, Preço de Venda */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Quantidade */}
          <div className="space-y-1.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Quantidade Para Produção</span>
              <span className="text-[10px] text-slate-400">Itens fabricados</span>
            </label>
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
            <p className="text-[11px] text-slate-400">
              Multiplica a quantidade de todos os insumos informados.
            </p>
          </div>

          {/* Taxa de Retorno */}
          <div className="space-y-1.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5" />
                Taxa de Retorno (%)
              </label>
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
            {/* Quick city presets */}
            <div className="flex flex-wrap gap-1 pt-1">
              {CITY_BONUSES.map((cb, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyCityBonus(cb.taxaSemFoco)}
                  className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                    request.taxaDeRetorno === cb.taxaSemFoco
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                  title={cb.descricao}
                >
                  {cb.taxaSemFoco}% ({cb.cidade.split('/')[0].trim()})
                </button>
              ))}
            </div>
          </div>

          {/* Preço de Venda */}
          <div className="space-y-1.5 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <label className="text-xs font-semibold text-amber-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5" />
                Preço de Venda Unitário
              </span>
              <span className="text-[10px] text-amber-400/80">Prata (Silver)</span>
            </label>
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
            <p className="text-[11px] text-slate-400">
              Total bruto da venda: {(request.precoDeVenda * request.quantidadeParaProducao).toLocaleString('pt-BR')} Pratas.
            </p>
          </div>
        </div>

        {/* Conta Premium Banner & Toggle */}
        <div
          onClick={() => setRequest((prev) => ({ ...prev, contaPremium: !prev.contaPremium }))}
          className={`cursor-pointer rounded-xl p-4 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
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
                <span className="text-sm font-bold text-slate-100">
                  Conta Premium Ativa
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    request.contaPremium
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {request.contaPremium ? 'Ativada (Taxa 6% com Desconto)' : 'Inativa (Taxa 12% sem Desconto)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Regra: A taxa é de <strong className="text-amber-400">6% com Conta Premium</strong> (desconto de 6% em relação aos 12% padrão sem premium).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:inline">
              {request.contaPremium ? 'Taxa de 6% aplicada' : 'Taxa de 12% aplicada'}
            </span>
            <div
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                request.contaPremium ? 'bg-amber-500 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="bg-slate-950 w-4 h-4 rounded-full shadow-md" />
            </div>
          </div>
        </div>

        {/* Recursos Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200">
                Lista de Recursos Necessários (por item fabricado)
              </h3>
              <p className="text-xs text-slate-400">
                Cada item produzido consome todos os recursos abaixo. A taxa de retorno devolve parte deles.
              </p>
            </div>
            <button
              type="button"
              onClick={addResource}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              Adicionar Recurso
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="px-4 py-3">Recurso</th>
                  <th className="px-4 py-3">Qtd / Item</th>
                  <th className="px-4 py-3">Qtd Total ({request.quantidadeParaProducao}x)</th>
                  <th className="px-4 py-3">Retorno ({request.taxaDeRetorno}%)</th>
                  <th className="px-4 py-3">Consumo Efetivo</th>
                  <th className="px-4 py-3">Valor Unitário</th>
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
                          placeholder="Ex: Barra de Ferro T4"
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
                          className="w-20 bg-slate-900 border border-slate-700/70 rounded-lg px-2 py-1.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-slate-300 font-semibold">
                        {totalBruto} un
                      </td>
                      <td className="px-4 py-2.5 text-cyan-400 font-bold">
                        +{retornoQtd} un
                      </td>
                      <td className="px-4 py-2.5 text-slate-200 font-medium">
                        {consumoLiquido} un
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
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
        </div>

        {/* Action Button */}
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
