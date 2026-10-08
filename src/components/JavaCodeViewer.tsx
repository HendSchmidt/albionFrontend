import React, { useState } from 'react';
import { JAVA_SNIPPETS } from '../data/javaCodeSnippets';
import { FileCode2, Copy, Check, Info, ShieldCheck, Zap } from 'lucide-react';

export const JavaCodeViewer: React.FC = () => {
  const [selectedFileIdx, setSelectedFileIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const currentSnippet = JAVA_SNIPPETS[selectedFileIdx];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.codigo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Code Header and File Tabs */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {/* Tab selector */}
        <div className="bg-slate-950/80 px-4 pt-3 border-b border-slate-800 flex items-center justify-between overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5 min-w-max pb-3">
            {JAVA_SNIPPETS.map((snippet, idx) => (
              <button
                key={snippet.filename}
                onClick={() => setSelectedFileIdx(idx)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
                  selectedFileIdx === idx
                    ? 'bg-slate-800 text-amber-400 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                {snippet.filename}
              </button>
            ))}
          </div>

          <div className="pb-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copiar Código
                </>
              )}
            </button>
          </div>
        </div>

        {/* File Metadata */}
        <div className="px-6 py-3 bg-slate-900 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-500">Pacote: </span>
            <span className="font-mono text-cyan-400 font-semibold">{currentSnippet.pacote}</span>
          </div>
          <p className="text-slate-400 italic">{currentSnippet.descricao}</p>
        </div>

        {/* Code Content */}
        <div className="p-6 bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
          <pre>{currentSnippet.codigo}</pre>
        </div>
      </div>

      {/* Deep-dive Explanation of the Architecture and Math */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg space-y-2.5">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
            <Zap className="w-4 h-4" />
            1. Taxa de Retorno de Recursos
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            No Albion Online, o jogador precisa ter 100% dos recursos no inventário para iniciar a produção.
            Ao finalizar o craft, o jogo devolve a porcentagem <code className="text-cyan-400">taxaDeRetorno</code> de volta à mochila.
            Assim, o consumo líquido real é:
          </p>
          <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[11px] text-amber-300 border border-slate-800">
            consumo = qtdTotal * (1 - taxaRetorno / 100)
          </div>
          <p className="text-[11px] text-slate-400">
            O custo por recurso é calculado multiplicando esse consumo efetivo pelo valor unitário.
          </p>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg space-y-2.5">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4" />
            2. Desconto da Conta Premium
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            A regra do problema especifica que a <strong>conta premium equivale a 6% de desconto no mercado</strong>.
          </p>
          <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[11px] text-indigo-300 border border-slate-800">
            taxa = contaPremium ? 0.0 : 0.06
          </div>
          <p className="text-[11px] text-slate-400">
            Sem premium: incide a taxa de 6% sobre o preço de venda bruto.
            Com premium: aplica o desconto de 6%, tornando a taxa 0% (ou abatendo 6% da taxa base).
          </p>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-lg space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wide">
            <Info className="w-4 h-4" />
            3. Precisão com BigDecimal
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Para evitar problemas de arredondamento de ponto flutuante em valores monetários (moedas de Prata), o serviço Java utiliza:
          </p>
          <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[11px] text-emerald-300 border border-slate-800">
            setScale(2, RoundingMode.HALF_UP)
          </div>
          <p className="text-[11px] text-slate-400">
            Garante conformidade com as regras financeiras e compatibilidade exata com os testes unitários.
          </p>
        </div>
      </div>
    </div>
  );
};
