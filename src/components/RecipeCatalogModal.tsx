import React, { useState, useMemo } from 'react';
import { BANCO_DE_RECEITAS_ALBION, ReceitaAlbion } from '../data/albionRecipesDatabase';
import { Search, Filter, X, Sparkles, MapPin, Check, BookOpen, Layers } from 'lucide-react';
import { CraftRequestDto } from '../types/albion';
import { CidadeAlbion } from '../services/albionDataProjectService';

interface RecipeCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (receita: ReceitaAlbion) => void;
}

export const RecipeCatalogModal: React.FC<RecipeCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectRecipe,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedTier, setSelectedTier] = useState<string>('Todos');
  const [selectedCity, setSelectedCity] = useState<string>('Todas');

  const categorias = useMemo(() => {
    const cats = new Set(BANCO_DE_RECEITAS_ALBION.map((r) => r.categoria));
    return ['Todas', ...Array.from(cats)];
  }, []);

  const tiers = ['Todos', 'T4', 'T5', 'T6', 'T7', 'T8'];
  const cidades = ['Todas', 'Fort Sterling', 'Thetford', 'Lymhurst', 'Bridgewatch', 'Martlock', 'Caerleon'];

  const filteredRecipes = useMemo(() => {
    return BANCO_DE_RECEITAS_ALBION.filter((r) => {
      const matchSearch =
        r.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.nomeIngles.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.albionItemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cidadeBonus.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'Todas' || r.categoria === selectedCategory;
      const matchTier = selectedTier === 'Todos' || r.tier === selectedTier;
      const matchCity = selectedCity === 'Todas' || r.cidadeBonus === selectedCity;

      return matchSearch && matchCategory && matchTier && matchCity;
    });
  }, [searchTerm, selectedCategory, selectedTier, selectedCity]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black">
              ⚔️
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Catálogo Oficial de Receitas de Albion Online
              </h2>
              <p className="text-xs text-slate-400">
                Selecione um item para carregar automaticamente seus materiais, quantidades, cidade com bônus e Item Value.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="p-6 bg-slate-950/40 border-b border-slate-800/60 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome (ex: Espada, Arco, Mercenário, Fogo, T4...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Tier Filters */}
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
              <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Tier:</span>
              {tiers.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTier(t)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedTier === t
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* City Bonus Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" /> Cidade Bônus:
            </span>
            {cidades.map((cidade) => (
              <button
                key={cidade}
                onClick={() => setSelectedCity(cidade)}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedCity === cidade
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800/80 hover:text-slate-200'
                }`}
              >
                {cidade}
              </button>
            ))}
          </div>
        </div>

        {/* Recipes Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 pb-1">
            <span>{filteredRecipes.length} receitas encontradas</span>
            <span className="text-[11px] text-slate-500">
              Clique em &quot;Usar Receita&quot; para carregar os insumos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredRecipes.map((receita) => (
              <div
                key={receita.id}
                className="bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/50 rounded-2xl p-4 transition-all hover:bg-slate-900/60 flex flex-col justify-between group space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        {receita.icone}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                          {receita.nome}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {receita.albionItemId}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {receita.tier}
                    </span>
                  </div>

                  {/* Badges: Cidade Bônus & Diário */}
                  <div className="flex flex-wrap gap-1.5 text-[10px] mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-950/60 text-cyan-300 border border-cyan-800/50 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      Bônus: {receita.cidadeBonus} (25%)
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-800/50 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-purple-400" />
                      Diário: {receita.tipoDiario}
                    </span>
                  </div>

                  {/* Lista de Insumos da Receita */}
                  <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-850 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                      Materiais por item:
                    </span>
                    {receita.dtoPadrao.recurso.map((rec, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] text-slate-300">
                        <span>&bull; {rec.nome}</span>
                        <span className="font-bold text-amber-300 font-mono">
                          {rec.quantidade} un
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectRecipe(receita);
                    onClose();
                  }}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Carregar Esta Receita
                </button>
              </div>
            ))}
          </div>

          {filteredRecipes.length === 0 && (
            <div className="py-16 text-center text-slate-500 text-xs">
              Nenhuma receita encontrada para os filtros selecionados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
