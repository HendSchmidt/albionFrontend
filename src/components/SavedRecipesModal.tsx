import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  BookOpen,
  Trash2,
  Package,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ItemSalvoDto, CraftRequestDto, RecursoRequestDto } from '../types/albion';
import { buscarItensFabricados, deletarItemFabricado } from '../services/albionService';

interface SavedRecipesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (request: CraftRequestDto, nomeItem?: string) => void;
}

export const SavedRecipesModal: React.FC<SavedRecipesModalProps> = ({
  isOpen,
  onClose,
  onSelectRecipe,
}) => {
  const [recipes, setRecipes] = useState<ItemSalvoDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchRecipes = async (termo?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await buscarItensFabricados(termo);
      setRecipes(data);
    } catch (err) {
      console.error(err);
      setError('Não foi possível conectar ao banco H2 do backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecipes(searchTerm);
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecipes(searchTerm);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Deseja realmente excluir esta receita salva?')) return;
    setDeletingId(id);
    try {
      await deletarItemFabricado(id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert('Falha ao excluir a receita.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleApply = (recipe: ItemSalvoDto) => {
    const request: CraftRequestDto = {
      categoriaProducao: recipe.categoriaProducao,
      rendimentoPorClique: recipe.rendimentoPorClique,
      quantidadeParaProducao: recipe.quantidadeCliques,
      taxaDeRetorno: recipe.taxaRetorno,
      precoDeVenda: recipe.precoVendaUnitario,
      contaPremium: recipe.contaPremium,
      taxaEstacaoPorCemNutricao: recipe.taxaEstacaoPorCemNutricao,
      itemValue: recipe.itemValue,
      quantidadeDiarios: recipe.quantidadeDiarios,
      precoDiarioVazio: recipe.valorCompraDiarioVazio,
      precoDiarioCheio: recipe.valorVendaDiarioCheio,
      ordemDeVenda: !recipe.vendaInstantanea,
      usarFoco: recipe.usoFoco,
      custoFocoTotal: recipe.pontosFoco,
      recurso: (recipe.ingredientes || []).map((ing: RecursoRequestDto) => ({
        nome: ing.nome,
        quantidade: ing.quantidade,
        valor: ing.valor,
      })),
    };

    onSelectRecipe(request, recipe.nomeItem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Minhas Receitas & Itens Salvos
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono">
                  H2 Database
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Busque itens previamente salvos no banco de dados local para reutilizar na simulação
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Busca */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-950/40">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome do item (ex: Guisado de Carne, Espada, Poção...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-sm transition flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                fetchRecipes('');
              }}
              title="Recarregar todas"
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Lista de Receitas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading && (
            <div className="text-center py-12 text-slate-400">
              <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
              Carregando receitas do H2...
            </div>
          )}

          {error && !loading && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-sm text-center">
              {error}
              <p className="text-xs text-slate-400 mt-1">
                Certifique-se de que o backend Spring Boot com H2 está rodando na porta 8080.
              </p>
            </div>
          )}

          {!loading && !error && recipes.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-300">Nenhuma receita salva encontrada</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Configure os parâmetros de craft e clique no botão <strong>"Salvar no H2"</strong> na tela de Craft Geral.
              </p>
            </div>
          )}

          {!loading &&
            recipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => handleApply(recipe)}
                className="group p-4 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 rounded-xl cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-base group-hover:text-amber-300 transition">
                      {recipe.nomeItem}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                      {recipe.categoriaProducao || 'CUSTOMIZADO'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                      {recipe.rendimentoPorClique}x por quantidade
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      Quantidade: <strong className="text-slate-200">{recipe.quantidadeCliques}</strong>
                    </span>
                    <span>
                      TRR: <strong className="text-slate-200">{recipe.taxaRetorno}%</strong>
                    </span>
                    <span>
                      Preço Venda: <strong className="text-amber-400">{recipe.precoVendaUnitario?.toLocaleString('pt-BR')} 🪙</strong>
                    </span>
                    <span>
                      Ingredientes: <strong className="text-slate-200">{recipe.ingredientes?.length || 0}</strong>
                    </span>
                  </div>

                  {recipe.ingredientes && recipe.ingredientes.length > 0 && (
                    <div className="text-xs text-slate-500 flex flex-wrap gap-1.5 pt-1">
                      {recipe.ingredientes.map((ing: RecursoRequestDto, idx: number) => (
                        <span key={idx} className="bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700/50">
                          {ing.nome} ({ing.quantidade}x @ {ing.valor} 🪙)
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(recipe.id, e)}
                    disabled={deletingId === recipe.id}
                    title="Excluir receita"
                    className="p-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApply(recipe)}
                    className="px-3.5 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Carregar Receita
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>{recipes.length} receitas registradas no arquivo local H2</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
