import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { CraftCalculator } from './components/CraftCalculator';
import { ResultsPanel } from './components/ResultsPanel';
import { ApiTester } from './components/ApiTester';
import { JavaCodeViewer } from './components/JavaCodeViewer';
import { CraftRequestDto } from './types/albion';
import { ALBION_ITEM_PRESETS } from './data/albionPresets';
import { calcularViabilidade } from './services/albionService';

export default function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'api' | 'java'>('calculator');

  // Initial state using first Albion preset
  const [request, setRequest] = useState<CraftRequestDto>(() => ({
    ...ALBION_ITEM_PRESETS[0].dto,
  }));

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Computed results in real time
  const { response, detalhes } = useMemo(() => {
    return calcularViabilidade(request);
  }, [request]);

  const handleManualCalculate = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'calculator' && (
          <div className="space-y-8">
            <CraftCalculator
              request={request}
              setRequest={setRequest}
              onCalculate={handleManualCalculate}
              isLoading={isLoading}
            />

            <ResultsPanel
              response={response}
              detalhes={detalhes}
              quantidadeProducao={request.quantidadeParaProducao}
              contaPremium={request.contaPremium}
            />
          </div>
        )}

        {activeTab === 'api' && (
          <ApiTester currentRequest={request} />
        )}

        {activeTab === 'java' && (
          <JavaCodeViewer />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Albion Online Crafting & Profitability Calculator &bull; Spring Boot REST API Service
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Taxa de Retorno de Recursos</span>
            <span>&bull;</span>
            <span>6% Desconto Mercado Premium</span>
            <span>&bull;</span>
            <span className="font-mono text-amber-400">POST /calculaViabilidadePorRecurso</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
