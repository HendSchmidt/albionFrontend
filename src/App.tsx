import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { CraftCalculator } from './components/CraftCalculator';
import { ResultsPanel } from './components/ResultsPanel';
import { ApiTester } from './components/ApiTester';
import { FoodNutritionCalculator } from './components/FoodNutritionCalculator';
import { SavedRecipesModal } from './components/SavedRecipesModal';
import {
  CraftRequestDto,
  CraftResponseDto,
  DetalhesCalculo,
  FoodNutritionSaleRequestDto,
  FoodNutritionSaleResponseDto,
} from './types/albion';
import { ALBION_ITEM_PRESETS } from './data/albionPresets';
import { ALBION_FOOD_PRESETS } from './data/albionFoodPresets';
import {
  chamarSpringBoot,
  calcularViabilidadeLocal,
  chamarSpringBootNutricao,
  calcularNutricaoLocal,
  DEFAULT_SPRING_BOOT_URL,
  ResultadoCalculo,
} from './services/albionService';
import { Server, Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle, Settings } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'food' | 'api'>('calculator');
  const [isSavedRecipesModalOpen, setIsSavedRecipesModalOpen] = useState<boolean>(false);

  // Backend Spring Boot URL
  const [backendUrl, setBackendUrl] = useState<string>(DEFAULT_SPRING_BOOT_URL);
  const [showUrlSettings, setShowUrlSettings] = useState<boolean>(false);

  // Initial state using first Albion preset (Guisado de Carne T8 - Culinária 10x)
  const [request, setRequest] = useState<CraftRequestDto>(() => ({
    ...ALBION_ITEM_PRESETS[0].dto,
    recurso: ALBION_ITEM_PRESETS[0].dto.recurso.map((r) => ({ ...r })),
  }));

  // Results state Craft Geral
  const initialLocal = calcularViabilidadeLocal(request);
  const [response, setResponse] = useState<CraftResponseDto>(initialLocal.response);
  const [detalhes, setDetalhes] = useState<DetalhesCalculo>(initialLocal.detalhes);

  // Estado para Seção Especializada: Venda de Comida para Barraquinha (Nutrição)
  const [foodRequest, setFoodRequest] = useState<FoodNutritionSaleRequestDto>(() => {
    const cabbagePreset = ALBION_FOOD_PRESETS[2]; // Sopa de Repolho T5
    return {
      nomeComida: cabbagePreset.nome,
      tier: cabbagePreset.tier,
      nutricaoPorUnidade: cabbagePreset.nutricaoBase,
      comidaFavorita: false,
      valorPorCemNutricao: 300, // Exemplo fornecido: 300 pratas por 100 de nutrição
      quantidadeProducao: 10,  // 1 clique = 10 sopas
      taxaDeRetorno: 15,       // TRR 15%
      precoMercadoUnitario: 1400, // Preço no mercado
      contaPremium: true,
      ordemDeVenda: true,
      ingredientes: cabbagePreset.ingredientesBase.map((ing) => ({ ...ing })),
    };
  });

  const [foodResponse, setFoodResponse] = useState<FoodNutritionSaleResponseDto>(() =>
    calcularNutricaoLocal(foodRequest)
  );

  // Connection & execution status
  const [backendStatus, setBackendStatus] = useState<'CONNECTED' | 'OFFLINE' | 'LOADING'>('LOADING');
  const [statusMessage, setStatusMessage] = useState<string>('Conectando ao backend Spring Boot...');
  const [lastCalculationOrigin, setLastCalculationOrigin] = useState<'SPRING_BOOT' | 'SIMULADOR_LOCAL'>('SIMULADOR_LOCAL');
  const [lastLatency, setLastLatency] = useState<number | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceFoodTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Executa cálculo do Craft Geral
  const executarCalculo = useCallback(
    async (currentReq: CraftRequestDto, urlAlvo: string = backendUrl) => {
      setBackendStatus('LOADING');
      try {
        const resultado: ResultadoCalculo = await chamarSpringBoot(currentReq, urlAlvo);
        setResponse(resultado.response);
        setDetalhes(resultado.detalhes);
        setBackendStatus('CONNECTED');
        setLastCalculationOrigin('SPRING_BOOT');
        setLastLatency(resultado.duracaoMs || null);
        setStatusMessage(
          `Conectado ao Spring Boot em "${urlAlvo}" (${resultado.duracaoMs}ms) - Regras Java ativas!`
        );
      } catch (err: any) {
        const fallback = calcularViabilidadeLocal(currentReq);
        setResponse(fallback.response);
        setDetalhes(fallback.detalhes);
        setBackendStatus('OFFLINE');
        setLastCalculationOrigin('SIMULADOR_LOCAL');
        setLastLatency(null);
        setStatusMessage(
          `Spring Boot offline em "${urlAlvo}". Inicie o ApiApplication (porta 8080) para conectar ao Java.`
        );
      }
    },
    [backendUrl]
  );

  // Executa cálculo da Seção de Comida em Barraquinha
  const executarCalculoComida = useCallback(
    async (currentFoodReq: FoodNutritionSaleRequestDto, urlAlvo: string = backendUrl) => {
      try {
        const res = await chamarSpringBootNutricao(currentFoodReq, urlAlvo);
        setFoodResponse(res.response);
        if (res.isSpringBoot) {
          setBackendStatus('CONNECTED');
          setLastCalculationOrigin('SPRING_BOOT');
          setLastLatency(res.duracaoMs || null);
        }
      } catch (err) {
        setFoodResponse(calcularNutricaoLocal(currentFoodReq));
      }
    },
    [backendUrl]
  );

  // Dispara o cálculo do Craft Geral com debounce
  useEffect(() => {
    if (activeTab === 'calculator') {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        executarCalculo(request, backendUrl);
      }, 350);

      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }
  }, [request, backendUrl, executarCalculo, activeTab]);

  // Dispara o cálculo de Comida com debounce
  useEffect(() => {
    if (activeTab === 'food') {
      if (debounceFoodTimerRef.current) {
        clearTimeout(debounceFoodTimerRef.current);
      }
      debounceFoodTimerRef.current = setTimeout(() => {
        executarCalculoComida(foodRequest, backendUrl);
      }, 250);

      return () => {
        if (debounceFoodTimerRef.current) {
          clearTimeout(debounceFoodTimerRef.current);
        }
      };
    }
  }, [foodRequest, backendUrl, executarCalculoComida, activeTab]);

  const handleManualCalculate = () => {
    if (activeTab === 'food') {
      executarCalculoComida(foodRequest, backendUrl);
    } else {
      executarCalculo(request, backendUrl);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onOpenSavedRecipes={() => setIsSavedRecipesModalOpen(true)} />

      {/* Backend Spring Boot Connection Status Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                backendStatus === 'CONNECTED'
                  ? 'bg-emerald-400 animate-pulse'
                  : backendStatus === 'LOADING'
                  ? 'bg-amber-400 animate-spin'
                  : 'bg-rose-400'
              }`}
            />
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">
                {backendStatus === 'CONNECTED' ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5" />
                    Spring Boot Conectado:
                  </span>
                ) : backendStatus === 'LOADING' ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Consultando API Spring Boot...
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <WifiOff className="w-3.5 h-3.5" />
                    Spring Boot Offline (Modo Local):
                  </span>
                )}
              </span>
              <span className="text-slate-400 hidden sm:inline">{statusMessage}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {backendStatus === 'CONNECTED' && lastLatency !== null && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
                {lastLatency}ms (Java REST API)
              </span>
            )}
            {backendStatus === 'OFFLINE' && (
              <button
                onClick={handleManualCalculate}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-[11px] border border-slate-700 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-amber-400" />
                Tentar Conectar
              </button>
            )}
            <button
              onClick={() => setShowUrlSettings(!showUrlSettings)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[11px] border border-slate-700 transition-colors cursor-pointer"
              title="Configurar URL do backend"
            >
              <Settings className="w-3 h-3 text-slate-400" />
              URL da API
            </button>
          </div>
        </div>

        {/* URL Settings Drawer */}
        {showUrlSettings && (          <div className="border-t border-slate-800 bg-slate-950/90 px-4 sm:px-6 lg:px-8 py-3">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                Endpoint do seu Spring Boot:
              </span>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                className="flex-1 min-w-[280px] bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                placeholder="http://localhost:8080/calculaViabilidadePorRecurso"
              />
              <button
                onClick={handleManualCalculate}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Testar & Salvar
              </button>
            </div>
          </div>
        )}
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: SEÇÃO EXCLUSIVA DE COMIDA EM BARRAQUINHA (NUTRIÇÃO) */}
        {activeTab === 'food' && (
          <div className="space-y-6">
            <FoodNutritionCalculator
              request={foodRequest}
              setRequest={setFoodRequest}
              response={foodResponse}
              onCalculate={handleManualCalculate}
              isLoading={backendStatus === 'LOADING'}
            />

            <div className="flex items-center justify-between text-xs px-2 text-slate-400">
              <div className="flex items-center gap-2">
                {lastCalculationOrigin === 'SPRING_BOOT' ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Cálculo processado pelo Spring Boot Java (`/albionApi/calculaVendaComidaBarraquinha`)!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-400/90 font-medium bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Simulador local em execução imediata (conecta automaticamente quando o Spring Boot estiver rodando).
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CALCULADORA GERAL DE CRAFT */}
        {activeTab === 'calculator' && (
          <div className="space-y-8">
            <CraftCalculator
              request={request}
              setRequest={setRequest}
              onCalculate={handleManualCalculate}
              isLoading={backendStatus === 'LOADING'}
              onOpenSavedRecipes={() => setIsSavedRecipesModalOpen(true)}
            />

            <div className="flex items-center justify-between text-xs px-2 text-slate-400">
              <div className="flex items-center gap-2">
                {lastCalculationOrigin === 'SPRING_BOOT' ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resposta fornecida diretamente pelo seu backend Spring Boot Java!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-400/90 font-medium bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Exibindo em modo de simulação local (inicie o Spring Boot na porta 8080 para conectar).
                  </span>
                )}
              </div>
            </div>

            <ResultsPanel
              response={response}
              detalhes={detalhes}
              quantidadeProducao={request.quantidadeParaProducao}
              contaPremium={request.contaPremium}
            />
          </div>
        )}

        {/* TAB 3: TESTER DE API */}
        {activeTab === 'api' && <ApiTester currentRequest={request} />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Albion Online Crafting & Profitability Calculator &bull; Spring Boot REST API Service
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Culinária (10x) &bull; Alquimia (5x) &bull; Refino & Equip (1x)</span>
            <span>&bull;</span>
            <span className="font-mono text-amber-400">POST /calculaViabilidadePorRecurso</span>
          </div>
        </div>
      </footer>

      {/* Modal de Busca e Seleção de Receitas Salvas no H2 */}
      <SavedRecipesModal
        isOpen={isSavedRecipesModalOpen}
        onClose={() => setIsSavedRecipesModalOpen(false)}
        onSelectRecipe={(rec) => {
          setRequest({
            ...rec,
          });
          setActiveTab('calculator');
        }}
      />
    </div>
  );
}
